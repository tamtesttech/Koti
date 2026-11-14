import React from 'react';

interface ClayDescriptionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  scrollable?: boolean;
  maxWidthClass?: string;
}

/**
 * Handcrafted clay parchment card framed with terracotta borders, floral buttons,
 * and sage leaves. Dynamically places the feature title inside the top-left clay tab.
 */
export const ClayDescriptionCard: React.FC<ClayDescriptionCardProps> = ({
  title,
  children,
  className = '',
  bodyClassName = '',
  scrollable = false,
  maxWidthClass = 'w-full',
}) => {
  return (
    <div
      className={`${maxWidthClass} flex flex-col select-text drop-shadow-[0_18px_36px_rgba(74,45,21,0.22)] ${className}`}
    >
      {/* Top clay border with floral corner buttons, center medallion, book & dynamic feature pill */}
      <div className="relative w-full shrink-0 leading-[0]">
        <img
          src="/assets/processed/clay_card_top.png"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-full h-auto block pointer-events-none select-none"
        />
        <div
          style={{
            left: '16.0%',
            top: '73.5%',
            width: '22.0%',
            height: '14.8%',
          }}
          className="absolute flex items-center justify-center px-1 pointer-events-none"
        >
          <span className="font-display text-[8.5px] sm:text-[10px] font-bold uppercase tracking-[0.02em] text-[#4A2D15] whitespace-nowrap leading-none">
            {title}
          </span>
        </div>
      </div>

      {/* Expandable middle parchment band flanked by terracotta borders & sage vines */}
      <div
        className={`relative w-full -my-[1px] px-[10.8%] sm:px-[11.2%] pt-3 pb-2 ${
          scrollable ? 'max-h-[58vh] overflow-y-auto' : ''
        } ${bodyClassName}`}
        style={{
          backgroundImage: "url('/assets/processed/clay_card_mid.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {children}
      </div>

      {/* Bottom clay border with corner buttons */}
      <div className="w-full shrink-0 leading-[0]">
        <img
          src="/assets/processed/clay_card_bot.png"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-full h-auto block pointer-events-none select-none"
        />
      </div>
    </div>
  );
};
