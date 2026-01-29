
import React from 'react';
import { AppScreen } from '../types';

interface NavigationProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { screen: AppScreen.DASHBOARD, icon: 'dashboard', label: 'Painel' },
    { screen: AppScreen.SHIFT_START, icon: 'local_shipping', label: 'Frota' },
    { screen: AppScreen.OS_CONTROL, icon: 'settings_suggest', label: 'Controle OS' },
    { screen: AppScreen.FUEL_CONTROL, icon: 'local_gas_station', label: 'Combustível' },
    { screen: AppScreen.SETTINGS, icon: 'settings', label: 'Ajustes' },
  ];

  return (
    <nav className="w-full bg-white/90 dark:bg-card-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 rounded-t-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)] shrink-0">
      <div className="flex items-center justify-between px-2 py-3">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;

          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative flex-1 h-14 ${isActive ? 'text-primary' : 'text-slate-400 opacity-70 hover:opacity-100'
                }`}
            >
              {isActive && (
                <div className="absolute top-0 w-12 h-1 rounded-b-lg bg-primary shadow-[0_4px_12px_rgba(23,84,207,0.4)]"></div>
              )}
              <span className={`material-symbols-outlined text-[22px] mt-1 transition-transform ${isActive ? 'scale-110 fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[9px] font-bold tracking-tighter whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
