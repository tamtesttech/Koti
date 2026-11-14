import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarHeart,
  DoorOpen,
  Music,
  Sparkles,
} from 'lucide-react';
import { TUTORIAL_STEPS } from '../data/kotiData';
import { DeskExercise, RoomModal } from '../types/koti';
import { ClayCatBadge } from './ClayCatBadge';
import { ClayDescriptionCard } from './ClayDescriptionCard';

interface IsometricRoomProps {
  isTutorial: boolean;
  tutorialIndex: number;
  onTutorialNext: () => void;
  onTutorialPrev: () => void;
  onTutorialSkip: () => void;
  onOpenModal: (modal: RoomModal) => void;
  deskExercises: DeskExercise[];
  reminderBadge: string | null;
  latestPhq9Label?: string;
}

export const IsometricRoom: React.FC<IsometricRoomProps> = ({
  isTutorial,
  tutorialIndex,
  onTutorialNext,
  onTutorialPrev,
  onTutorialSkip,
  onOpenModal,
  deskExercises,
  reminderBadge,
  latestPhq9Label,
}) => {
  const completedCount = deskExercises.filter((e) => e.completed).length;
  const totalCount = deskExercises.length || 3;
  const activeTutorialStep = isTutorial ? TUTORIAL_STEPS[tutorialIndex] : null;

  const isSpotlight = (id: 'desk' | 'piano' | 'void') => {
    if (!activeTutorialStep) return false;
    if (activeTutorialStep.id === 'checkin' && id === 'desk') return true;
    return activeTutorialStep.id === id;
  };

  return (
    <main
      className={`w-full px-4 sm:px-8 flex flex-col items-center justify-center relative ${
        isTutorial
          ? 'h-[calc(100vh-64px)] overflow-hidden pb-3'
          : 'min-h-[calc(100vh-68px)] pb-8'
      }`}
    >
      {/* Main Isometric Stage */}
      <div
        className={`w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center ${
          isTutorial ? 'gap-3 lg:gap-8 h-full' : 'gap-6 lg:gap-10'
        }`}
      >
        {/* Room Canvas — capped during tutorial so room + description always fit with zero scroll */}
        <div
          className={`relative aspect-square flex items-center justify-center select-none ${
            isTutorial
              ? 'h-[46vh] sm:h-[52vh] lg:h-[min(70vh,620px)] w-auto max-w-full'
              : 'w-full max-w-[640px]'
          }`}
        >
          <div
            className="absolute inset-x-[12%] bottom-[6%] h-[14%] rounded-full bg-[#674223]/20 blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <img
            src="/assets/processed/room.png"
            alt="Koti isometric clay room"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-[0_18px_36px_rgba(74,45,21,0.22)]"
          />

          {/* Hotspot 1: My Desk */}
          <button
            type="button"
            disabled={isTutorial}
            onClick={() => onOpenModal('desk')}
            aria-label={`Open My Desk (${completedCount} of ${totalCount} done)`}
            style={{ left: '28%', top: '42%' }}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AC6332] transition-opacity ${
              isTutorial && !isSpotlight('desk') ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#F4E8DA]/95 text-[#AC6332] border-2 border-[#C4863C] shadow-lg transition-transform group-hover:scale-110 ${
                isSpotlight('desk')
                  ? 'ring-4 ring-[#C4863C]/75 scale-115 hotspot-glow'
                  : 'hotspot-glow'
              }`}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="px-2.5 py-0.5 rounded-xl bg-[#4A2D15]/90 text-[#FCF6EF] text-[11px] sm:text-xs font-medium shadow-md whitespace-nowrap">
              My Desk · {completedCount}/{totalCount}
            </span>
          </button>

          {/* Hotspot 2: The Piano */}
          <button
            type="button"
            disabled={isTutorial}
            onClick={() => onOpenModal('piano')}
            aria-label="Open The Piano"
            style={{ left: '48%', top: '33%' }}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AC6332] transition-opacity ${
              isTutorial && !isSpotlight('piano') ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#F4E8DA]/95 text-[#674223] border-2 border-[#C4863C] shadow-lg transition-transform group-hover:scale-110 ${
                isSpotlight('piano')
                  ? 'ring-4 ring-[#C4863C]/75 scale-115 hotspot-glow'
                  : 'hotspot-glow'
              }`}
            >
              <Music className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="px-2.5 py-0.5 rounded-xl bg-[#4A2D15]/90 text-[#FCF6EF] text-[11px] sm:text-xs font-medium shadow-md whitespace-nowrap">
              The Piano
            </span>
          </button>

          {/* Hotspot 3: The Void */}
          <button
            type="button"
            disabled={isTutorial}
            onClick={() => onOpenModal('void')}
            aria-label="Enter The Void"
            style={{ left: '66%', top: '35%' }}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AC6332] transition-opacity ${
              isTutorial && !isSpotlight('void') ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#332215]/95 text-[#C4863C] border-2 border-[#C4863C] shadow-lg transition-transform group-hover:scale-110 ${
                isSpotlight('void')
                  ? 'ring-4 ring-[#C4863C]/80 scale-115 hotspot-glow'
                  : 'hotspot-glow'
              }`}
            >
              <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="px-2.5 py-0.5 rounded-xl bg-[#332215]/95 text-[#F4E8DA] text-[11px] sm:text-xs font-medium shadow-md whitespace-nowrap border border-[#C4863C]/40">
              The Void
            </span>
          </button>

          {/* Kept on Desk Reminder Badge */}
          {!isTutorial && reminderBadge && (
            <button
              type="button"
              onClick={() => onOpenModal('desk')}
              style={{ left: '14%', top: '14%' }}
              className="hidden sm:flex absolute z-10 max-w-[210px] text-left clay-card rounded-2xl px-3 py-2 items-start gap-2 hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4863C] shrink-0 mt-0.5" />
              <p className="text-xs text-[#4A2D15] line-clamp-2 leading-snug">
                {reminderBadge}
              </p>
            </button>
          )}
        </div>

        {/* Right / Bottom Column — single ClayDescriptionCard replacing stacked cards */}
        <div className="w-full max-w-[500px] flex flex-col gap-3 z-20 shrink-0">
          {isTutorial && activeTutorialStep ? (
            <ClayDescriptionCard
              title={activeTutorialStep.title}
              bodyClassName="space-y-3 py-2"
            >
              <section aria-label="Koti guided walkthrough" className="space-y-3">
                <div className="flex items-center gap-3">
                  <ClayCatBadge size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-[#AC6332]">
                      Tour · {tutorialIndex + 1}/{TUTORIAL_STEPS.length}
                    </p>
                    <h2 className="font-display text-lg font-semibold text-[#4A2D15]">
                      {activeTutorialStep.title}
                    </h2>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#4A2D15] leading-relaxed">
                  {activeTutorialStep.catLine}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#674223]/12">
                  <button
                    type="button"
                    onClick={onTutorialSkip}
                    className="text-xs font-medium text-[#674223] hover:text-[#4A2D15] underline underline-offset-4 px-2 py-2 cursor-pointer"
                  >
                    Skip
                  </button>

                  <div className="flex items-center gap-2">
                    {tutorialIndex > 0 && (
                      <button
                        type="button"
                        onClick={onTutorialPrev}
                        className="clay-button-secondary min-h-[38px] px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onTutorialNext}
                      className="clay-button-primary min-h-[38px] px-5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {tutorialIndex === TUTORIAL_STEPS.length - 1
                          ? 'Enter Room'
                          : 'Next'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            </ClayDescriptionCard>
          ) : (
            <ClayDescriptionCard
              title="Welcome Home"
              bodyClassName="space-y-2.5 py-2"
            >
              {/* Cat Companion Summary */}
              <div className="flex items-center gap-3 pb-2">
                <ClayCatBadge size="sm" />
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-semibold text-[#4A2D15] leading-tight">
                    Welcome home
                  </h2>
                  <p className="text-xs text-[#674223] leading-snug truncate">
                    {reminderBadge
                      ? reminderBadge
                      : completedCount === totalCount
                        ? 'All 3 desk exercises done today.'
                        : `${totalCount - completedCount} exercises at My Desk.`}
                  </p>
                </div>
              </div>

              {/* Integrated Room Navigation Rows inside the Parchment */}
              <div className="divide-y divide-[#674223]/15 border-t border-[#674223]/15">
                <button
                  type="button"
                  onClick={() => onOpenModal('desk')}
                  className="w-full py-2.5 px-1.5 text-left flex items-center justify-between gap-3 rounded-lg hover:bg-[#674223]/8 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#AC6332]/15 text-[#AC6332] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-sm font-semibold text-[#4A2D15] whitespace-nowrap">
                        My Desk
                      </span>
                      <span className="text-xs text-[#674223] truncate">
                        {completedCount}/{totalCount} completed
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#674223] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenModal('piano')}
                  className="w-full py-2.5 px-1.5 text-left flex items-center justify-between gap-3 rounded-lg hover:bg-[#674223]/8 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#C4863C]/20 text-[#8F4F25] flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4" />
                    </span>
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-sm font-semibold text-[#4A2D15] whitespace-nowrap">
                        The Piano
                      </span>
                      <span className="text-xs text-[#674223] truncate">
                        Moods & melodies
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#674223] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenModal('void')}
                  className="w-full py-2.5 px-1.5 text-left flex items-center justify-between gap-3 rounded-lg hover:bg-[#674223]/8 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#3B2819] text-[#C4863C] flex items-center justify-center shrink-0">
                      <DoorOpen className="w-4 h-4" />
                    </span>
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-sm font-semibold text-[#4A2D15] whitespace-nowrap">
                        The Void
                      </span>
                      <span className="text-xs text-[#674223] truncate">
                        Kintsugi release
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#674223] shrink-0" />
                </button>
              </div>
            </ClayDescriptionCard>
          )}
        </div>
      </div>

      {/* Persistent Monthly Check-In Button (only outside tutorial or highlighted softly) */}
      {!isTutorial && (
        <button
          type="button"
          onClick={() => onOpenModal('phq9')}
          className="mt-4 lg:mt-0 w-full max-w-md lg:w-auto lg:fixed lg:bottom-5 lg:right-5 z-20 clay-button-primary min-h-[46px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <CalendarHeart className="w-4 h-4 shrink-0" />
          <span>
            Monthly Check-In{latestPhq9Label ? ` · ${latestPhq9Label}` : ''}
          </span>
        </button>
      )}
    </main>
  );
};
