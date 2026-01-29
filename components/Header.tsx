
import React, { useState } from 'react';
import { AppScreen } from '../types';

interface HeaderProps {
  currentScreen: AppScreen;
  avatarUrl: string;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, avatarUrl }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const getTitle = () => {
    switch (currentScreen) {
      case AppScreen.DASHBOARD: return 'Painel de Gestão';
      case AppScreen.OS_CONTROL: return 'Controle de OS';
      case AppScreen.FUEL_CONTROL: return 'Controle de Combustível';
      case AppScreen.SETTINGS: return 'Ajustes';
      default: return 'SMART TECH';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center p-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-primary bg-slate-200">
            <img className="w-full h-full object-cover" src={avatarUrl} alt="Perfil" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">{getTitle()}</h2>
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-accent-success animate-pulse"></span>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Online • Sincronizado</p>
            </div>
          </div>
        </div>
        <button onClick={handleSync} className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-card-dark text-primary active:scale-90 transition-transform">
          <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
