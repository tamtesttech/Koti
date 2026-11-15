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
      {/* Top clay border with center medallion, vines, book & dynamic title pill */}
      <div
        className="relative w-full shrink-0 leading-[0]"
        style={{ containerType: 'inline-size' }}
      >
        <img
          src="/assets/processed/clay_card_top.png"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-full h-auto block pointer-events-none select-none"
        />
        <div
          style={{
            left: '14.0%',
            top: '55.2%',
            width: '22.2%',
            height: '24.0%',
          }}
          className="absolute flex items-center justify-center px-1.5 pointer-events-none"
        >
          <span
            style={{ fontSize: 'clamp(7.5px, 1.75cqw, 15px)' }}
            className="font-display font-bold uppercase tracking-[0.015em] text-[#4A2D15] whitespace-nowrap truncate max-w-full leading-none"
          >
            {title}
          </span>
        </div>
      </div>

      {/* Expandable middle parchment band flanked by terracotta borders & sage vines */}
      <div
        className={`relative w-full -my-[1px] px-[9.5%] sm:px-[10%] pt-1 pb-2 ${
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
