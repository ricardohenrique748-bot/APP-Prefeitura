import React from 'react';

interface DeviceSimulatorProps {
  children: React.ReactNode;
}

const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#eef0f4] dark:bg-[#0f1218] transition-colors duration-300 md:py-8 font-sans">
      
      {/* Mobile: Direct Render (Full Screen) */}
      <div className="md:hidden w-full min-h-screen bg-transparent">
        {children}
      </div>

      {/* Desktop: Device Simulator */}
      <div className="hidden md:flex relative flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[3.5rem] border-[12px] border-[#1a1a1a] bg-[#1a1a1a] h-[850px] w-[400px] overflow-hidden box-border">
        
        {/* Buttons (Side) */}
        <div className="absolute right-[-14px] top-24 h-16 w-1 bg-[#1a1a1a] rounded-r-md"></div>
        <div className="absolute left-[-14px] top-24 h-8 w-1 bg-[#1a1a1a] rounded-l-md"></div>
        <div className="absolute left-[-14px] top-36 h-16 w-1 bg-[#1a1a1a] rounded-l-md"></div>
        
        {/* Notch / Status Bar Area */}
        <div className="absolute top-0 left-0 right-0 h-8 z-50 flex justify-center pointer-events-none">
          <div className="h-7 w-40 bg-[#1a1a1a] rounded-b-2xl flex items-center justify-center">
             <div className="w-16 h-4 bg-black/20 rounded-full flex gap-2 items-center justify-center">
                {/* Speaker/Camera simulation */}
             </div>
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
           {/* Inner Scrollable Area */}
           <div className="absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar">
              {children}
           </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-gray-500/30 rounded-full z-50 pointer-events-none backdrop-blur-md"></div>

      </div>
    </div>
  );
};

export default DeviceSimulator;
