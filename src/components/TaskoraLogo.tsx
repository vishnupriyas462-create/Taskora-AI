import React from 'react';

interface TaskoraLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export const TaskoraLogo: React.FC<TaskoraLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  textClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Taskora AI Radiant Vector Emblem */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-white/10 via-[#0a0a0a] to-[#030303] border border-white/20 shadow-[0_0_20px_-3px_rgba(139,92,246,0.6)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] transition-all duration-300"
        style={{ width: size, height: size, padding: size * 0.12 }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="taskora-t-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="taskora-accent-grad" x1="36" y1="8" x2="8" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <filter id="taskora-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer faceted hex-shield */}
          <polygon
            points="20,3 35,11.5 35,28.5 20,37 5,28.5 5,11.5"
            fill="rgba(15, 15, 20, 0.7)"
            stroke="url(#taskora-t-grad)"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Stylized Modern 'T' with Garment Warp & Weft Thread Weave */}
          {/* Top Crossbar */}
          <path
            d="M8.5 13C8.5 11.6193 9.61929 10.5 11 10.5H29C30.3807 10.5 31.5 11.6193 31.5 13C31.5 14.3807 30.3807 15.5 29 15.5H11C9.61929 15.5 8.5 14.3807 8.5 13Z"
            fill="url(#taskora-t-grad)"
          />

          {/* Vertical Stem - Precision Needle & Neural Spine */}
          <path
            d="M17.5 15.5H22.5V26.5L20 30.5L17.5 26.5V15.5Z"
            fill="url(#taskora-accent-grad)"
          />

          {/* Stitch dashes on T crossbar */}
          <line x1="13" y1="13" x2="27" y2="13" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" opacity="0.9" />
          <line x1="20" y1="17" x2="20" y2="25" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" opacity="0.9" />

          {/* Luminous Neural Nodes */}
          <circle cx="11" cy="13" r="1.75" fill="#FFFFFF" />
          <circle cx="29" cy="13" r="1.75" fill="#22D3EE" />
          <circle cx="20" cy="20.5" r="2.25" fill="#FFFFFF" filter="url(#taskora-glow)" />
          <circle cx="20" cy="30.5" r="1.5" fill="#10B981" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className={`font-serif-instrument tracking-tight text-white font-normal ${textClassName || 'text-xl sm:text-2xl'}`}>
              Taskora
            </span>
            <span className="ml-1 text-xs font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#10B981]">
              AI
            </span>
          </div>
          <span className="hidden 2xl:inline-block font-mono text-[9px] uppercase tracking-widest text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            Garment Neural OS
          </span>
        </div>
      )}
    </div>
  );
};
