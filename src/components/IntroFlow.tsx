import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Heart, Leaf, Sparkles, Wind } from 'lucide-react';
import {
  CORE_FOCUS_OPTIONS,
  QUESTIONNAIRE_QUESTIONS,
} from '../data/kotiData';
import { CoreFocus, UserProfile } from '../types/koti';
import { ClayCatBadge } from './ClayCatBadge';
import { ClayDescriptionCard } from './ClayDescriptionCard';

interface IntroFlowProps {
  step: 'intro-questions' | 'intro-focus';
  profile: UserProfile;
  onUpdateProfile: (next: UserProfile) => void;
  onContinueToFocus: () => void;
  onCompleteOnboarding: () => void;
  onSkip: () => void;
  onBackToQuestions: () => void;
  onStartMusic?: () => void;
}

export const IntroFlow: React.FC<IntroFlowProps> = ({
  step,
  profile,
  onUpdateProfile,
  onContinueToFocus,
  onCompleteOnboarding,
  onSkip,
  onBackToQuestions,
  onStartMusic,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [otherOpen, setOtherOpen] = useState<Record<string, boolean>>({});

  const currentQuestion = QUESTIONNAIRE_QUESTIONS[questionIndex];

  const toggleOption = (
    questionId: 'hobbies' | 'recoveryDuration' | 'heaviestSituations' | 'growthGoals',
    option: string
  ) => {
    const current = profile[questionId] || [];
    const exists = current.includes(option);
    const updated = exists
      ? current.filter((item) => item !== option)
      : [...current, option];
    onUpdateProfile({
      ...profile,
      [questionId]: updated,
    });
  };

  const toggleOther = (
    questionId: 'hobbies' | 'recoveryDuration' | 'heaviestSituations' | 'growthGoals'
  ) => {
    const isCurrentlyOpen = Boolean(otherOpen[questionId] || profile.customAnswers?.[questionId]);
    if (isCurrentlyOpen) {
      setOtherOpen((prev) => ({ ...prev, [questionId]: false }));
      onUpdateProfile({
        ...profile,
        customAnswers: {
          ...(profile.customAnswers || {}),
          [questionId]: '',
        },
      });
    } else {
      setOtherOpen((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const updateCustomAnswer = (
    questionId: 'hobbies' | 'recoveryDuration' | 'heaviestSituations' | 'growthGoals',
    value: string
  ) => {
    onUpdateProfile({
      ...profile,
      customAnswers: {
        ...(profile.customAnswers || {}),
        [questionId]: value,
      },
    });
  };

  const selectFocus = (focus: CoreFocus) => {
    onUpdateProfile({
      ...profile,
      coreFocus: focus,
    });
  };

  const getFocusIcon = (focus: CoreFocus) => {
    if (focus === 'Self-Love') return <Heart className="w-5 h-5" />;
    if (focus === 'Gratitude') return <Leaf className="w-5 h-5" />;
    if (focus === 'Breathing') return <Wind className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  const handleNextQuestion = () => {
    onStartMusic?.();
    if (questionIndex < QUESTIONNAIRE_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      onContinueToFocus();
    }
  };

  const handleSkipClick = () => {
    onStartMusic?.();
    onSkip();
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    }
  };

  const isOtherActive = Boolean(
    otherOpen[currentQuestion.id] || profile.customAnswers?.[currentQuestion.id]
  );

  return (
    <main className="min-h-[calc(100vh-64px)] w-full px-4 sm:px-8 pb-6 pt-2 flex flex-col items-center justify-center">
      <ClayDescriptionCard
        title={step === 'intro-questions' ? 'Welcome to Koti' : 'Choose Focus'}
        maxWidthClass="w-full max-w-2xl"
        bodyClassName="space-y-4 py-2"
      >
        {/* Header + Skip */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClayCatBadge size="sm" />
            <div>
              <p className="text-xs font-medium text-[#655F35]">
                {step === 'intro-questions'
                  ? `Question ${questionIndex + 1} of ${QUESTIONNAIRE_QUESTIONS.length}`
                  : 'Core Focus'}
              </p>
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#4A2D15] tracking-tight">
                {step === 'intro-questions' ? 'Welcome to Koti' : 'Choose your focus'}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipClick}
            className="clay-button-secondary min-h-[38px] px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            Skip
          </button>
        </div>

        {step === 'intro-questions' ? (
          <div className="space-y-4">
            {/* Step Progress Bar */}
            <div className="flex gap-2" aria-hidden="true">
              {QUESTIONNAIRE_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    idx <= questionIndex ? 'bg-[#AC6332]' : 'bg-[#674223]/15'
                  }`}
                />
              ))}
            </div>

            {/* Single Question Content */}
            <section className="space-y-3 border-t border-[#674223]/12 pt-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-[#4A2D15]">
                  {currentQuestion.title}
                </h2>
                <p className="text-xs text-[#674223]/85 mt-0.5">
                  {currentQuestion.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {currentQuestion.options.map((opt) => {
                  const active = (profile[currentQuestion.id] || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleOption(currentQuestion.id, opt)}
                      className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-[#655F35] text-[#FAF3EB] shadow-[0_4px_10px_-3px_rgba(74,45,21,0.3)]'
                          : 'bg-[#F4E8DA] text-[#4A2D15] border border-[#674223]/18 hover:bg-[#EAD7C5]'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  aria-pressed={isOtherActive}
                  onClick={() => toggleOther(currentQuestion.id)}
                  className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isOtherActive
                      ? 'bg-[#AC6332] text-[#FAF3EB] shadow-[0_4px_10px_-3px_rgba(74,45,21,0.3)]'
                      : 'bg-[#F4E8DA] text-[#4A2D15] border border-[#674223]/18 hover:bg-[#EAD7C5]'
                  }`}
                >
                  {isOtherActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span>Other</span>
                </button>
              </div>

              {isOtherActive && (
                <div className="pt-1">
                  <label className="block text-xs font-medium text-[#674223]">
                    Your own words
                    <input
                      type="text"
                      value={profile.customAnswers?.[currentQuestion.id] || ''}
                      onChange={(e) =>
                        updateCustomAnswer(currentQuestion.id, e.target.value)
                      }
                      placeholder="Type here..."
                      className="mt-1.5 w-full rounded-2xl bg-[#FCF6EF] border border-[#674223]/22 px-4 py-3 text-sm text-[#4A2D15] placeholder:text-[#674223]/45 focus:outline-none focus:ring-2 focus:ring-[#AC6332]/50"
                    />
                  </label>
                </div>
              )}
            </section>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={questionIndex === 0}
                onClick={handlePrevQuestion}
                className="clay-button-secondary min-h-[44px] px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="clay-button-primary min-h-[46px] px-7 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {questionIndex === QUESTIONNAIRE_QUESTIONS.length - 1
                    ? 'Continue'
                    : 'Next'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CORE_FOCUS_OPTIONS.map((item) => {
                const isSelected = profile.coreFocus === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectFocus(item.id)}
                    className={`text-left rounded-3xl p-4 sm:p-5 transition-transform duration-150 cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#AC6332] text-[#FCF6EF] shadow-[0_14px_28px_-10px_rgba(103,66,35,0.45)] -translate-y-0.5'
                        : 'clay-card-soft text-[#4A2D15] hover:bg-[#E4CEB8]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#FCF6EF]/20 text-[#FCF6EF]'
                            : 'bg-[#F4E8DA] text-[#AC6332]'
                        }`}
                      >
                        {getFocusIcon(item.id)}
                      </div>
                      <h2 className="font-display text-lg font-semibold">
                        {item.title}
                      </h2>
                      <p
                        className={`text-xs sm:text-sm leading-snug ${
                          isSelected ? 'text-[#FCF6EF]/90' : 'text-[#674223]'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {isSelected && <Check className="w-4 h-4" />}
                      <span>{isSelected ? 'Selected' : 'Select'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {profile.coreFocus === 'Other' && (
              <div className="clay-card-soft rounded-2xl p-4">
                <label className="block text-xs font-medium text-[#674223]">
                  Your focus
                  <input
                    type="text"
                    value={profile.customFocus || ''}
                    onChange={(e) =>
                      onUpdateProfile({
                        ...profile,
                        customFocus: e.target.value,
                      })
                    }
                    placeholder="Type your focus..."
                    className="mt-1.5 w-full rounded-2xl bg-[#FCF6EF] border border-[#674223]/22 px-4 py-3 text-sm text-[#4A2D15] placeholder:text-[#674223]/45 focus:outline-none focus:ring-2 focus:ring-[#AC6332]/50"
                  />
                </label>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuestionIndex(QUESTIONNAIRE_QUESTIONS.length - 1);
                  onBackToQuestions();
                }}
                className="clay-button-secondary min-h-[44px] px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onStartMusic?.();
                  onCompleteOnboarding();
                }}
                className="clay-button-primary min-h-[46px] px-7 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>Enter Koti</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </ClayDescriptionCard>
    </main>
  );
};
