import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mic, MicOff, RotateCcw, Send, Sparkles } from 'lucide-react';
import { UserProfile, VoidSession } from '../types/koti';

interface TheVoidViewProps {
  profile: UserProfile;
  onClose: () => void;
  onSaveSession: (session: VoidSession) => void;
}

type KintsugiPhase = 'idle' | 'breaking' | 'mending' | 'mended';

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export const TheVoidView: React.FC<TheVoidViewProps> = ({
  profile,
  onClose,
  onSaveSession,
}) => {
  const [phase, setPhase] = useState<KintsugiPhase>('idle');
  const [breakFrame, setBreakFrame] = useState<'cracking' | 'shattered'>('cracking');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    empathy: string;
    affirmation: string;
    emotionalTag: string;
  } | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop errors
      }
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceNote('Voice dictation unavailable here—type freely below.');
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      const baseText = inputText ? `${inputText.trim()} ` : '';

      rec.onresult = (rawEvent: unknown) => {
        const evt = rawEvent as {
          results: ArrayLike<{
            isFinal: boolean;
            0: { transcript: string };
          }>;
        };
        let transcript = '';
        for (let i = 0; i < evt.results.length; i += 1) {
          transcript += evt.results[i][0].transcript;
        }
        setInputText(`${baseText}${transcript}`.trimStart());
      };

      rec.onerror = () => {
        setIsListening(false);
        setVoiceNote('Microphone unavailable—type freely below.');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setVoiceNote(null);
      setIsListening(true);
    } catch {
      setVoiceNote('Could not start microphone—type freely below.');
      setIsListening(false);
    }
  };

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || phase !== 'idle') return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
    }

    setErrorMsg(null);
    setBreakFrame('cracking');
    setPhase('breaking');

    const shatterTimer = window.setTimeout(() => {
      setBreakFrame('shattered');
    }, 950);

    try {
      const res = await fetch('/api/void/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, profile }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to connect.');
      }

      window.clearTimeout(shatterTimer);
      setBreakFrame('shattered');

      setResult({
        empathy: data.empathy,
        affirmation: data.affirmation,
        emotionalTag: data.emotionalTag,
      });

      setPhase('mending');

      onSaveSession({
        id: `void-${Date.now()}`,
        userText: trimmed,
        empathy: data.empathy,
        affirmation: data.affirmation,
        emotionalTag: data.emotionalTag,
        createdAt: new Date().toISOString(),
      });

      window.setTimeout(() => {
        setPhase('mended');
      }, 2100);
    } catch (err) {
      window.clearTimeout(shatterTimer);
      const message =
        err instanceof Error ? err.message : 'Unable to connect.';
      setErrorMsg(message);
      setPhase('idle');
    }
  };

  const handleResetVase = () => {
    setPhase('idle');
    setInputText('');
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto text-[#F4E8DA] flex flex-col"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 42%, rgba(196, 134, 60, 0.22) 0%, rgba(28, 19, 13, 0.78) 55%, rgba(16, 11, 8, 0.94) 100%), url('/assets/processed/void_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="void-title"
    >
      {/* Top Bar */}
      <div className="w-full px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[40px] px-4 py-2 rounded-2xl bg-[#2B1D12]/80 hover:bg-[#3A281A] border border-[#C4863C]/35 text-[#F4E8DA] text-xs sm:text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return</span>
        </button>

        <p className="text-xs font-medium text-[#DCC3AC]/85">The Void</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 pb-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Vase Visual Stage */}
        <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center shrink-0">
          <div
            className={`absolute inset-6 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
              phase === 'mending' || phase === 'mended'
                ? 'bg-[#C4863C]/38 scale-110'
                : phase === 'breaking'
                  ? 'bg-[#AC6332]/25 scale-95'
                  : 'bg-[#DCC3AC]/18 scale-100'
            }`}
            aria-hidden="true"
          />

          {phase === 'idle' && (
            <img
              src="/assets/processed/vase_intact.png"
              alt="Unbroken terracotta vase"
              referrerPolicy="no-referrer"
              className="relative z-10 w-[86%] h-[86%] object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.65)] transition-all duration-500"
            />
          )}

          {phase === 'breaking' && (
            <div className="relative z-10 w-[88%] h-[88%] flex items-center justify-center">
              <img
                src={
                  breakFrame === 'cracking'
                    ? '/assets/processed/vase_breaking.png'
                    : '/assets/processed/vase_shattered.png'
                }
                alt="Terracotta vase breaking"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.65)] transition-all duration-500"
              />
            </div>
          )}

          {(phase === 'mending' || phase === 'mended') && (
            <div className="relative z-10 w-[88%] h-[88%] flex items-center justify-center">
              <img
                src="/assets/processed/vase_kintsugi.png"
                alt="Terracotta vase mended with gold Kintsugi seams"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-contain drop-shadow-[0_24px_42px_rgba(196,134,60,0.45)] transition-all duration-1000 ${
                  phase === 'mending' ? 'opacity-90 scale-[0.98]' : 'opacity-100 scale-100'
                }`}
              />

              <svg
                viewBox="0 0 240 240"
                className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${
                  phase === 'mending' ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              >
                <path
                  d="M106 20 L122 58 L138 88 L178 118"
                  stroke="#C4863C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  className="kintsugi-seam-draw"
                />
                <path
                  d="M52 108 L108 134 L145 94 L188 150"
                  stroke="#F3C982"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  className="kintsugi-seam-draw"
                />
                <path
                  d="M108 134 L94 214"
                  stroke="#C4863C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  className="kintsugi-seam-draw"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="w-full max-w-xl space-y-5">
          {phase === 'idle' && (
            <form
              onSubmit={handleRelease}
              className="rounded-[28px] bg-[#24170E]/88 backdrop-blur-md border border-[#C4863C]/30 p-6 sm:p-8 space-y-4 shadow-2xl"
            >
              <div>
                <h1
                  id="void-title"
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#F4E8DA]"
                >
                  Let it out here
                </h1>
                <p className="text-sm text-[#DCC3AC]/80 mt-1">
                  Speak or write honestly—zero judgment.
                </p>
              </div>

              {errorMsg && (
                <div className="rounded-2xl bg-[#AC6332]/25 border border-[#AC6332]/60 px-4 py-3 text-xs sm:text-sm text-[#F4E8DA]">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="void-textarea"
                    className="text-xs font-medium text-[#DCC3AC]"
                  >
                    Your thoughts
                  </label>
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isListening
                        ? 'bg-[#AC6332] text-[#FCF6EF]'
                        : 'bg-[#3A281A] text-[#F4E8DA] border border-[#C4863C]/30 hover:bg-[#4A3321]'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Voice</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  id="void-textarea"
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Write or speak freely..."
                  className="w-full rounded-2xl bg-[#160E09]/90 border border-[#C4863C]/30 px-4 py-3 text-sm sm:text-base text-[#F4E8DA] placeholder:text-[#DCC3AC]/45 focus:outline-none focus:ring-2 focus:ring-[#C4863C]/60"
                />

                {voiceNote && (
                  <p className="text-xs text-[#C4863C]">{voiceNote}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="clay-button-primary min-h-[46px] px-6 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Release</span>
                </button>
              </div>
            </form>
          )}

          {phase === 'breaking' && (
            <div className="rounded-[28px] bg-[#24170E]/88 backdrop-blur-md border border-[#C4863C]/30 p-7 space-y-2 shadow-2xl">
              <p className="text-xs font-semibold text-[#C4863C]">Listening</p>
              <h2 className="font-display text-2xl font-semibold text-[#F4E8DA]">
                Holding space for the break…
              </h2>
            </div>
          )}

          {(phase === 'mending' || phase === 'mended') && result && (
            <div className="rounded-[28px] bg-[#24170E]/92 backdrop-blur-md border border-[#C4863C]/40 p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#C4863C]">
                  {phase === 'mending' ? 'Mending in gold…' : 'Mended in Gold'}
                </p>
                <p className="text-sm sm:text-base text-[#F4E8DA] leading-relaxed">
                  {result.empathy}
                </p>
              </div>

              <div
                className={`rounded-2xl bg-[#342214]/90 border border-[#C4863C]/45 p-5 space-y-1.5 transition-all duration-300 ${
                  phase === 'mended'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-85 translate-y-0.5'
                }`}
              >
                <p className="text-xs font-semibold text-[#C4863C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Affirmation</span>
                </p>
                <p className="font-display text-lg sm:text-xl text-[#FCF6EF] leading-snug">
                  {result.affirmation}
                </p>
              </div>

              <p className="text-xs text-[#DCC3AC]/75">
                Memory saved: {result.emotionalTag}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleResetVase}
                  className="min-h-[40px] px-4 py-2 rounded-2xl bg-[#3A281A] hover:bg-[#4A3321] border border-[#C4863C]/30 text-[#F4E8DA] text-xs sm:text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Release Again</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="clay-button-primary min-h-[42px] px-6 py-2 rounded-2xl text-sm font-semibold cursor-pointer"
                >
                  Return to Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
