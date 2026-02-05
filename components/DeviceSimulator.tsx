import React from 'react';
import { AppScreen } from '../types';

interface DeviceSimulatorProps {
  children: React.ReactNode;
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  showSidebar?: boolean;
  userAvatar?: string;
  userName?: string;
  userRole?: string;
}

const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children, currentScreen, onNavigate, showSidebar = true, userAvatar, userName, userRole }) => {
  const menuItems = [
    { icon: 'dashboard', label: 'Painel', screen: AppScreen.DASHBOARD, roles: ['ADMIN', 'GESTOR', 'OPERADOR', 'MOTORISTA'] },
    { icon: 'local_shipping', label: 'Frota', screen: AppScreen.FLEET_MANAGEMENT, roles: ['ADMIN'] },
    { icon: 'assignment', label: 'Ordens de Serviço', screen: AppScreen.OS_CONTROL, roles: ['ADMIN', 'GESTOR', 'OPERADOR', 'MOTORISTA'] },
    { icon: 'local_gas_station', label: 'Combustível', screen: AppScreen.FUEL_CONTROL, roles: ['ADMIN', 'GESTOR', 'MOTORISTA'] },
    { icon: 'account_balance_wallet', label: 'Centros de Custo', screen: AppScreen.COST_CENTERS, roles: ['ADMIN'] },
    { icon: 'tire_repair', label: 'Pneus', screen: AppScreen.TIRE_BULLETIN, roles: ['ADMIN', 'GESTOR', 'OPERADOR'] },
    { icon: 'pending_actions', label: 'Backlog', screen: AppScreen.BACKLOG, roles: ['ADMIN', 'GESTOR', 'OPERADOR'] },
    { icon: 'checklist', label: 'Checklist', screen: AppScreen.CHECKLIST_HISTORY, roles: ['ADMIN', 'GESTOR', 'MOTORISTA'] },
    { icon: 'settings', label: 'Configurações', screen: AppScreen.SETTINGS, roles: ['ADMIN', 'GESTOR', 'OPERADOR', 'MOTORISTA'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    !userRole || (item.roles && item.roles.includes(userRole))
  );

  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark transition-colors duration-300 flex text-slate-900 dark:text-white font-sans">

      {/* Desktop Sidebar */}
      {showSidebar && (
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex-shrink-0 relative z-20">
          <div className="h-32 flex items-center justify-center py-4 px-4 border-b border-slate-100 dark:border-slate-800/50 overflow-hidden">
            <img
              src="/logo-light.png"
              alt="Smart Tech"
              className="h-full w-auto object-contain scale-150 dark:hidden transition-all hover:scale-[1.6] duration-300 mix-blend-multiply"
            />
            <img
              src="/logo-dark.png"
              alt="Smart Tech"
              className="h-full w-auto object-contain scale-150 hidden dark:block transition-all hover:scale-[1.6] duration-300 mix-blend-screen"
            />
          </div>

          <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto">
            {filteredMenuItems.map(item => (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${currentScreen === item.screen
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400'
                  }`}
              >
                <span className={`material-symbols-outlined text-xl ${currentScreen === item.screen ? 'fill-1' : ''}`}>{item.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                {currentScreen === item.screen && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="User" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate dark:text-white">{userName || 'Usuário'}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">{userRole || 'Visitante'}</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Desktop Header (Optional) */}
        {showSidebar && (
          <header className="hidden md:flex h-16 border-b border-slate-200 dark:border-slate-800 items-center justify-between px-8 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
            <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-700 dark:text-slate-200">
              {menuItems.find(i => i.screen === currentScreen)?.label || 'Painel'}
            </h2>
            <div className="flex items-center gap-4">
              <button className="size-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">notifications</span>
              </button>
              <button className="size-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">search</span>
              </button>
            </div>
          </header>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full md:pb-10">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};

export default DeviceSimulator;
