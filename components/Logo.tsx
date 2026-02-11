
import React from 'react';

interface LogoProps {
    className?: string; // Expects something like "h-[rem]" to set the overall height
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
    return (
        <div className={`flex flex-col items-center justify-center select-none ${className}`}>
            <div className="flex items-center">
                <span className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100">
                    Smart
                </span>
                <span className="text-4xl md:text-5xl font-extralight tracking-tighter text-primary uppercase ml-1.5 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    Tech
                </span>
            </div>
            {/* Minimalist Tech Bar */}
            <div className="flex gap-1.5 mt-2">
                <div className="h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                </div>
                <div className="size-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
        </div>
    );
};
