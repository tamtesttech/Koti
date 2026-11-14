import React, { useState } from 'react';

interface ClayCatBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ClayCatBadge: React.FC<ClayCatBadgeProps> = ({
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const dims =
    size === 'sm'
      ? 'w-14 h-14'
      : size === 'lg'
        ? 'w-28 h-28'
        : 'w-20 h-20';

  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center overflow-hidden bg-[#F7EBDD] border-2 border-[#C4863C]/40 shadow-[0_10px_24px_-8px_rgba(74,45,21,0.32),inset_0_3px_8px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(196,134,60,0.18)] ${dims} ${className}`}
    >
      {!imgError ? (
        <img
          src="/assets/processed/cat.png"
          alt="Koti clay cat guide"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-[88%] h-[88%] object-contain select-none drop-shadow-[0_4px_6px_rgba(103,66,35,0.18)]"
        />
      ) : (
        <svg viewBox="0 0 64 64" className="w-3/4 h-3/4 text-[#674223]" aria-hidden="true">
          <circle cx="32" cy="36" r="18" fill="#F3D8BE" />
          <polygon points="16,26 20,12 28,22" fill="#F3D8BE" />
          <polygon points="48,26 44,12 36,22" fill="#F3D8BE" />
          <circle cx="26" cy="34" r="2.5" fill="#4A2D15" />
          <circle cx="38" cy="34" r="2.5" fill="#4A2D15" />
          <path d="M29 40 Q32 43 35 40" stroke="#674223" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};
