import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileText,
  Printer,
  ShieldAlert,
  X,
} from 'lucide-react';
import { PHQ9_OPTIONS, PHQ9_QUESTIONS } from '../data/kotiData';
import {
  DeskExercise,
  MonthlySong,
  Phq9Record,
  UserProfile,
} from '../types/koti';
import {
  calculatePhq9Score,
  classifyPhq9Severity,
  comparePhq9Months,
  formatTherapistReport,
} from '../utils/kotiLogic';
import { ClayDescriptionCard } from './ClayDescriptionCard';

interface Phq9ModalProps {
  profile: UserProfile;
  phq9History: Phq9Record[];
  songs: MonthlySong[];
  deskExercises: DeskExercise[];
  voidHistory: Array<{
    id: string;
    userText: string;
    empathy: string;
    affirmation: string;
    emotionalTag: string;
    createdAt: string;
  }>;
  onClose: () => void;
  onSubmitPhq9: (record: Phq9Record) => void;
}

export const Phq9Modal: React.FC<Phq9ModalProps> = ({
  profile,
  phq9History,
  songs,
  deskExercises,
  voidHistory,
  onClose,
  onSubmitPhq9,
}) => {
  const [answers, setAnswers] = useState<number[]>(Array(9).fill(-1));
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'export'>('form');
  const [copied, setCopied] = useState(false);

  const allAnswered = answers.every((a) => a >= 0 && a <= 3);
  const currentScore = useMemo(
    () => calculatePhq9Score(answers.map((a) => (a < 0 ? 0 : a))),
    [answers]
  );
  const currentSeverity = classifyPhq9Severity(currentScore);
  const q9Flagged = answers[8] > 0;

  const sortedHistory = useMemo(
    () =>
      [...phq9History].sort(
        (a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()
      ),
    [phq9History]
  );

  const latest = sortedHistory[sortedHistory.length - 1];
  const previous =
    sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2] : undefined;
  const comparison = comparePhq9Months(latest, previous);

  const reportText = useMemo(
    () =>
      formatTherapistReport({
        profile,
        phq9History,
        songs,
        deskExercises,
        voidHistory,
      }),
    [profile, phq9History, songs, deskExercises, voidHistory]
  );

  const handleSelect = (qIdx: number, val: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = val;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;
    const total = calculatePhq9Score(answers);
    const severity = classifyPhq9Severity(total);
    const now = new Date();
    const monthLabel = now.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    onSubmitPhq9({
      id: `phq-${Date.now()}`,
      monthLabel,
      dateIso: now.toISOString(),
      answers: [...answers],
      totalScore: total,
      severity,
    });
    setActiveTab('history');
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koti-therapist-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2412]/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phq9-modal-title"
    >
      <ClayDescriptionCard
        title={activeTab === 'export' ? 'Therapist Report' : 'Monthly Check-In'}
        scrollable
        maxWidthClass="w-full max-w-4xl"
        bodyClassName="py-2"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#674223]/12">
          <div className="pl-10 sm:pl-12">
            <p className="text-xs font-semibold text-[#655F35]">
              Monthly Wellness Check-In · Official PHQ-9 Screening
            </p>
            <h2
              id="phq9-modal-title"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#4A2D15] mt-1"
            >
              Long-Term Recovery Tracking
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Monthly Check-In"
            className="clay-button-secondary w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs + Prominent Export CTA */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#EAD7C5] border border-[#674223]/14">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-[#AC6332] text-[#FCF6EF]'
                  : 'text-[#4A2D15] hover:bg-[#F4E8DA]/60'
              }`}
            >
              PHQ-9 Questions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#AC6332] text-[#FCF6EF]'
                  : 'text-[#4A2D15] hover:bg-[#F4E8DA]/60'
              }`}
            >
              Monthly Comparison ({sortedHistory.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`min-h-[42px] px-5 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-[#655F35] text-[#FCF6EF]'
                : 'clay-button-primary'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Export Report for Therapist</span>
          </button>
        </div>

        {/* Tab 1: 9-Question PHQ-9 Form */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <p className="text-sm text-[#674223]">
              Over the <strong className="text-[#4A2D15]">last 2 weeks</strong>, how often have you been bothered by any of the following problems?
            </p>

            <div className="space-y-3.5">
              {PHQ9_QUESTIONS.map((question, qIdx) => (
                <fieldset
                  key={question}
                  className="clay-card-soft rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <legend className="text-sm font-semibold text-[#4A2D15]">
                    {qIdx + 1}. {question}
                  </legend>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PHQ9_OPTIONS.map((opt) => {
                      const checked = answers[qIdx] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={checked}
                          onClick={() => handleSelect(qIdx, opt.value)}
                          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            checked
                              ? 'bg-[#655F35] text-[#FCF6EF] shadow-sm'
                              : 'bg-[#F4E8DA] text-[#4A2D15] border border-[#674223]/15 hover:bg-[#EAD7C5]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className="font-mono-tabular font-semibold opacity-80">
                            {opt.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            {q9Flagged && (
              <div className="rounded-2xl bg-[#AC6332]/15 border border-[#AC6332]/40 p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#AC6332] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[#4A2D15] space-y-1">
                  <p className="font-semibold">
                    You do not have to carry heavy thoughts alone.
                  </p>
                  <p className="text-[#674223]">
                    Please consider sharing this with your care team or reaching out to 988 (US/Canada) or your local crisis support line anytime you need immediate human support.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-mono-tabular text-[#674223]">
                {allAnswered
                  ? `Draft Score: ${currentScore}/27 (${currentSeverity})`
                  : `${answers.filter((a) => a >= 0).length} of 9 answered`}
              </p>

              <button
                type="submit"
                disabled={!allAnswered}
                className="clay-button-primary min-h-[46px] px-6 py-2.5 rounded-2xl text-sm font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                Save Monthly Check-In
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Results & Monthly Historical Comparison */}
        {activeTab === 'history' && (
          <div className="mt-6 space-y-6">
            {latest && (
              <div className="clay-card-soft rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#655F35]">
                    Latest Assessment · {latest.monthLabel}
                  </p>
                  <p className="font-display text-3xl font-semibold text-[#4A2D15] mt-1">
                    <span className="font-mono-tabular">{latest.totalScore}</span> / 27 —{' '}
                    {latest.severity}
                  </p>
                  <p className="text-sm text-[#674223] mt-1">{comparison.summary}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className="clay-button-primary min-h-[44px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
                >
                  Prepare Therapist Report
                </button>
              </div>
            )}

            {/* Longitudinal Monthly Bars */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-[#4A2D15]">
                Monthly Trend (0–27 Scale)
              </h3>
              <div className="space-y-3">
                {sortedHistory.map((rec) => {
                  const pct = Math.max(4, Math.round((rec.totalScore / 27) * 100));
                  return (
                    <div
                      key={rec.id}
                      className="clay-card-soft rounded-2xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-[#4A2D15]">
                          {rec.monthLabel}
                        </span>
                        <span className="font-mono-tabular text-[#674223]">
                          {rec.totalScore}/27 · {rec.severity}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#F4E8DA] overflow-hidden border border-[#674223]/12">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              rec.totalScore <= 9
                                ? '#655F35'
                                : rec.totalScore <= 14
                                  ? '#C4863C'
                                  : '#AC6332',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Therapist Export */}
        {activeTab === 'export' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#674223]">
                Ready to share with your psychiatrist, TMS clinician, or therapist.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="clay-button-secondary min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#655F35]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="clay-button-secondary min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print View</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="clay-button-primary min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download (.txt)</span>
                </button>
              </div>
            </div>

            <pre className="w-full rounded-2xl bg-[#FCF6EF] border border-[#674223]/20 p-5 text-xs font-mono-tabular text-[#4A2D15] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
              {reportText}
            </pre>
          </div>
        )}
      </ClayDescriptionCard>
    </div>
  );
};
