
import React from 'react';

interface LogoProps {
    className?: string; // Expects something like "h-[rem]" to set the overall height
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-16", showText = true }) => {
    return (
        <div className={`flex flex-col items-center justify-center select-none ${className}`}>
            {/* SVG Icon - Clean, vector based, transparent */}
            <svg
                viewBox="-10 -10 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto max-h-24 drop-shadow-xl"
            >
                <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" /> {/* bright blue */}
                        <stop offset="100%" stopColor="#22c55e" /> {/* bright green */}
                    </linearGradient>
                </defs>

                {/* Dynamic Abstract Symbol - "S" Shape */}
                <path
                    d="M75 25 H35 C23.954 25 15 33.954 15 45 C15 56.046 23.954 65 35 65 H65 C70.523 65 75 69.477 75 75 C75 80.523 70.523 85 65 85 H25"
                    stroke="url(#logo-gradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                />

                {/* Connection Points */}
                <circle cx="75" cy="25" r="5" fill="#3b82f6" />
                <circle cx="25" cy="85" r="5" fill="#22c55e" />

            </svg>

            {showText && (
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                        Smart
                    </span>
                    <span className="text-3xl font-light tracking-tighter text-slate-900 dark:text-white">
                        Tech
                    </span>
                </div>
            )}
        </div>
    );
};
