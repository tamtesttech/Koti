import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ClipboardCheck,
  Compass,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TopBarProps {
  coreFocus?: string;
  showDemoMenu?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onReplayIntro: () => void;
  onReplayTutorial: () => void;
  onOpenMonthlyCheckIn: () => void;
  onResetDemo: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  coreFocus,
  showDemoMenu = true,
  isMuted,
  onToggleMute,
  onReplayIntro,
  onReplayTutorial,
  onOpenMonthlyCheckIn,
  onResetDemo,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full px-5 sm:px-8 py-3 flex items-center justify-between gap-4 z-30 relative">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[#4A2D15] whitespace-nowrap shrink-0">
          Koti
        </span>
        {coreFocus && (
          <span className="hidden sm:inline text-xs font-medium text-[#674223]/85 whitespace-nowrap">
            {coreFocus}
          </span>
        )}
      </div>

      {showDemoMenu && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-pressed={!isMuted}
            aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
            title={isMuted ? 'Sound Off' : 'Sound On'}
            className="clay-button-secondary min-h-[38px] min-w-[38px] px-2.5 py-1.5 rounded-2xl flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AC6332]"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#8F4F25]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#4A2D15]" />
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="clay-button-secondary min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AC6332] cursor-pointer"
            >
              <span>Demo Controls</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 clay-card rounded-2xl p-2 z-50 flex flex-col gap-1"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onReplayIntro();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-[#4A2D15] hover:bg-[#E5CEB8] transition-colors flex items-center gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-[#AC6332]" />
                <span>Replay Intro Questionnaire</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onReplayTutorial();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-[#4A2D15] hover:bg-[#E5CEB8] transition-colors flex items-center gap-2.5"
              >
                <Compass className="w-4 h-4 text-[#C4863C]" />
                <span>Replay Cat Tutorial</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onOpenMonthlyCheckIn();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-[#4A2D15] hover:bg-[#E5CEB8] transition-colors flex items-center gap-2.5"
              >
                <ClipboardCheck className="w-4 h-4 text-[#655F35]" />
                <span>Trigger Monthly Check-In</span>
              </button>
              <div className="my-1 border-t border-[#674223]/12" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onResetDemo();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-[#8F4F25] hover:bg-[#E5CEB8] transition-colors flex items-center gap-2.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo State</span>
              </button>
            </div>
          )}
          </div>
        </div>
      )}
    </header>
  );
};
