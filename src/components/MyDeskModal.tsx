import React, { useEffect, useState } from 'react';
import {
  CalendarHeart,
  CheckCircle2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Wind,
  X,
} from 'lucide-react';
import { DeskExercise, UserProfile } from '../types/koti';
import { getFocusDisplayLabel } from '../utils/kotiLogic';
import { ClayDescriptionCard } from './ClayDescriptionCard';

interface MyDeskModalProps {
  profile: UserProfile;
  exercises: DeskExercise[];
  recentVoidTags: string[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRefreshExercises: () => void;
  onCompleteExercise: (exerciseId: string, responseText: string) => void;
  onOpenMonthlyCheckIn: () => void;
}

export const MyDeskModal: React.FC<MyDeskModalProps> = ({
  profile,
  exercises,
  recentVoidTags,
  loading,
  error,
  onClose,
  onRefreshExercises,
  onCompleteExercise,
  onOpenMonthlyCheckIn,
}) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [breathingActiveId, setBreathingActiveId] = useState<string | null>(null);
  const [breathingRemaining, setBreathingRemaining] = useState<number>(120);

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const ex of exercises) {
      initial[ex.id] = ex.userResponse ?? (ex.sentenceStarter ? `${ex.sentenceStarter} ` : '');
    }
    setDrafts(initial);
  }, [exercises]);

  useEffect(() => {
    if (!breathingActiveId) return;
    const timer = window.setInterval(() => {
      setBreathingRemaining((prev) => {
        if (prev <= 1) {
          setBreathingActiveId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathingActiveId]);

  const completedCount = exercises.filter((e) => e.completed).length;

  const getBreathingPhase = (remainingSec: number) => {
    const elapsed = 120 - remainingSec;
    const cycle = elapsed % 14; // 4s inhale, 4s hold, 6s exhale
    if (cycle < 4) return { label: 'Inhale softly', count: 4 - cycle };
    if (cycle < 8) return { label: 'Hold gently', count: 8 - cycle };
    return { label: 'Exhale slow', count: 14 - cycle };
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2412]/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="desk-modal-title"
    >
      <ClayDescriptionCard
        title="Today's Exercises"
        scrollable
        maxWidthClass="w-full max-w-4xl"
        bodyClassName="py-2"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#674223]/12">
          <div>
            <p className="text-xs font-semibold text-[#655F35]">
              My Desk · {getFocusDisplayLabel(profile)} · {completedCount}/{exercises.length} done
            </p>
            <h2
              id="desk-modal-title"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#4A2D15] mt-0.5"
            >
              Today’s Exercises
            </h2>
            {recentVoidTags.length > 0 && (
              <p className="text-xs text-[#8F4F25] mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#C4863C]" />
                <span>Adapted from {recentVoidTags[0]}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close My Desk"
            className="clay-button-secondary w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Monthly Calendar Badge on Desk */}
        <div className="mt-4 clay-card-soft rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#F4E8DA] text-[#AC6332] flex items-center justify-center shrink-0">
              <CalendarHeart className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#4A2D15]">
                November Check-In (PHQ-9)
              </p>
              <p className="text-xs text-[#674223]">
                Monthly tracking & therapist export
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenMonthlyCheckIn}
            className="clay-button-secondary min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open PHQ-9
          </button>
        </div>

        {/* Error notice if Gemini API fails */}
        {error && (
          <div className="mt-4 rounded-2xl bg-[#AC6332]/12 border border-[#AC6332]/30 p-4 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#674223]">
              Could not reach Gemini right now ({error}). Showing gentle local prompts tailored to your profile.
            </p>
            <button
              type="button"
              onClick={onRefreshExercises}
              className="clay-button-secondary px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
            >
              Retry AI
            </button>
          </div>
        )}

        {/* Exercises List */}
        <div className="mt-6 space-y-5">
          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="clay-card-soft rounded-3xl p-6 animate-pulse space-y-3"
                >
                  <div className="h-4 w-1/3 bg-[#674223]/15 rounded" />
                  <div className="h-3 w-5/6 bg-[#674223]/10 rounded" />
                  <div className="h-16 w-full bg-[#674223]/10 rounded-2xl" />
                </div>
              ))}
              <p className="text-center text-xs text-[#674223]">
                Tailoring 3 gentle exercises for your desk…
              </p>
            </div>
          ) : (
            exercises.map((ex, idx) => {
              const draft = drafts[ex.id] ?? '';
              const isBreathing = ex.kind === 'breathing';
              const isThisBreathing = breathingActiveId === ex.id;
              const phase = getBreathingPhase(breathingRemaining);

              return (
                <section
                  key={ex.id}
                  className={`rounded-3xl p-5 sm:p-6 transition-colors ${
                    ex.completed
                      ? 'bg-[#EAE8D8] border-2 border-[#655F35]/40 shadow-sm'
                      : 'clay-card-soft'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#655F35]">
                        Exercise {idx + 1} · {ex.kind === 'breathing' ? '2-Min Paced Breathing' : ex.focus}
                      </p>
                      <h3 className="font-display text-lg sm:text-xl font-semibold text-[#4A2D15] mt-0.5">
                        {ex.title}
                      </h3>
                    </div>

                    {ex.completed && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#655F35] shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kept in mind</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#4A2D15] leading-relaxed mt-2.5">
                    {ex.groundingPrompt}
                  </p>

                  {isBreathing ? (
                    <div className="mt-4 bg-[#F4E8DA] rounded-2xl p-4 border border-[#674223]/12 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-700 ${
                            isThisBreathing
                              ? phase.label.includes('Inhale')
                                ? 'scale-110 bg-[#655F35] text-[#FCF6EF]'
                                : phase.label.includes('Hold')
                                  ? 'scale-105 bg-[#C4863C] text-[#FCF6EF]'
                                  : 'scale-95 bg-[#AC6332] text-[#FCF6EF]'
                              : 'bg-[#EAD7C5] text-[#655F35]'
                          }`}
                        >
                          <Wind className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-mono-tabular text-xl font-semibold text-[#4A2D15]">
                            {isThisBreathing ? formatTimer(breathingRemaining) : '2:00'}
                          </p>
                          <p className="text-xs font-medium text-[#674223]">
                            {isThisBreathing
                              ? `${phase.label} (${phase.count}s)`
                              : '4s inhale · 4s hold · 6s exhale'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isThisBreathing) {
                              setBreathingActiveId(null);
                            } else {
                              if (breathingRemaining === 0) setBreathingRemaining(120);
                              setBreathingActiveId(ex.id);
                            }
                          }}
                          className="clay-button-secondary min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isThisBreathing ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Start Timer</span>
                            </>
                          )}
                        </button>
                        {isThisBreathing && (
                          <button
                            type="button"
                            onClick={() => {
                              setBreathingActiveId(null);
                              setBreathingRemaining(120);
                            }}
                            aria-label="Reset breathing timer"
                            className="clay-button-secondary w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    <label className="block text-xs font-medium text-[#674223]">
                      {isBreathing
                        ? 'Optional: How does your body feel after a few slow breaths?'
                        : 'Your reflection'}
                      <textarea
                        rows={2}
                        value={draft}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [ex.id]: e.target.value }))
                        }
                        placeholder={
                          ex.sentenceStarter || 'Take your time—even three honest words count.'
                        }
                        className="mt-1.5 w-full rounded-2xl bg-[#FCF6EF] border border-[#674223]/20 px-4 py-3 text-sm text-[#4A2D15] placeholder:text-[#674223]/50 focus:outline-none focus:ring-2 focus:ring-[#AC6332]/50"
                      />
                    </label>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          onCompleteExercise(
                            ex.id,
                            draft.trim() || ex.title
                          )
                        }
                        className={`min-h-[42px] px-5 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                          ex.completed
                            ? 'bg-[#655F35] text-[#FCF6EF] hover:bg-[#55502B]'
                            : 'clay-button-primary'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {ex.completed ? 'Update & Keep in Mind' : 'Complete & Keep in Mind'}
                        </span>
                      </button>
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Footer action */}
        <div className="mt-6 pt-5 border-t border-[#674223]/12 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onRefreshExercises}
            className="clay-button-secondary min-h-[42px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Fresh Set of 3</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="clay-button-primary min-h-[42px] px-6 py-2 rounded-2xl text-sm font-semibold cursor-pointer"
          >
            Return to Room
          </button>
        </div>
      </ClayDescriptionCard>
    </div>
  );
};
