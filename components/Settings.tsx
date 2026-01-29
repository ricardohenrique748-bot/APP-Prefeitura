
import React, { useRef } from 'react';
import { AppScreen } from '../types';

interface SettingsProps {
  onAction: (screen: AppScreen) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  avatarUrl: string;
  onAvatarChange: (newAvatar: string) => void;
  userRole: string;
}

const Settings: React.FC<SettingsProps> = ({ onAction, onLogout, isDarkMode, onToggleTheme, avatarUrl, onAvatarChange, userRole }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allMenuItems = [
    { icon: 'local_shipping', label: 'Gestão de Frotas', screen: AppScreen.FLEET_MANAGEMENT, color: 'text-amber-500', roles: ['ADMIN', 'GESTOR'] },
    { icon: 'account_balance_wallet', label: 'Centros de Custo', screen: AppScreen.COST_CENTERS, color: 'text-primary', roles: ['ADMIN', 'GESTOR'] },
    { icon: 'store', label: 'Gestão de Fornecedores', screen: AppScreen.SUPPLIER_MANAGEMENT, color: 'text-emerald-400', roles: ['ADMIN', 'GESTOR'] },
    { icon: 'assignment_late', label: 'Backlog de Serviços', screen: AppScreen.BACKLOG, color: 'text-rose-500', roles: ['ADMIN', 'GESTOR'] },
    { icon: 'tire_repair', label: 'Boletim de Pneus', screen: AppScreen.TIRE_BULLETIN, color: 'text-accent-success', roles: ['ADMIN', 'GESTOR', 'MOTORISTA', 'OPERADOR'] },
    { icon: 'assessment', label: 'Relatórios Avançados', screen: AppScreen.REPORTS, color: 'text-blue-400', roles: ['ADMIN', 'GESTOR'] },
    { icon: 'group', label: 'Gestão de Usuários', screen: AppScreen.USER_MANAGEMENT, color: 'text-indigo-400', roles: ['ADMIN'] },
    { icon: 'sync', label: 'Sincronização Manual', color: 'text-slate-400', roles: ['ADMIN', 'GESTOR', 'MOTORISTA', 'OPERADOR'] }
  ];

  const menuItems = allMenuItems.filter(item => !item.roles || item.roles.includes(userRole));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onAvatarChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 pb-10">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Profile Card */}
      <section className="bg-white dark:bg-card-dark p-3 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative">
            <div className="size-14 md:size-24 rounded-full border-2 md:border-4 border-primary overflow-hidden bg-slate-200">
              <img
                src={avatarUrl}
                className="w-full h-full object-cover"
                alt="Ricardo Luz"
              />
            </div>
            <button
              onClick={triggerFileSelect}
              className="absolute -bottom-1 -right-1 md:bottom-0 md:right-0 size-6 md:size-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white dark:border-card-dark transition-all active:scale-90 shadow-md hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[12px] md:text-base">edit</span>
            </button>
          </div>
          <div>
            <h3 className="font-bold text-base md:text-2xl dark:text-white transition-colors">Ricardo Luz</h3>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium mt-0.5">Gestor de Frota • ID #8842</p>
          </div>
        </div>
      </section>

      {/* Theme Toggle Section */}
      <section className="space-y-1.5 md:space-y-3">
        <h4 className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Visual do Sistema</h4>
        <button
          onClick={onToggleTheme}
          className="w-full bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-3 md:p-5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all group hover:shadow-md"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`size-9 md:size-12 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
              <span className="material-symbols-outlined fill-1 text-lg md:text-2xl">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs md:text-lg font-bold block dark:text-white">{isDarkMode ? 'Modo Escuro' : 'Modo Claro'}</span>
              <span className="text-[9px] md:text-xs text-slate-500 font-medium uppercase tracking-tight">Toque para alternar</span>
            </div>
          </div>
          <div className={`w-10 h-5 md:w-14 md:h-7 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-primary' : 'bg-slate-200'}`}>
            <div className={`absolute top-0.5 md:top-1 size-4 md:size-5 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'left-5 md:left-8' : 'left-0.5 md:left-1'}`}></div>
          </div>
        </button>
      </section>

      {/* Menu Section */}
      <section className="space-y-1.5 md:space-y-3">
        <h4 className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Configurações e Gestão</h4>
        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 bg-white dark:bg-card-dark md:bg-transparent md:dark:bg-transparent rounded-2xl md:rounded-none border border-slate-200 dark:border-slate-800 md:border-none divide-y divide-slate-100 dark:divide-slate-800 md:divide-y-0 overflow-hidden transition-colors">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.screen && onAction(item.screen)}
              className="w-full flex items-center justify-between p-3 md:p-6 md:bg-white md:dark:bg-card-dark md:rounded-2xl md:border md:border-slate-200 md:dark:border-slate-800 md:shadow-sm active:bg-slate-50 dark:active:bg-slate-800/50 transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`size-9 md:size-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors ${item.color}`}>
                  <span className="material-symbols-outlined text-lg md:text-2xl">{item.icon}</span>
                </div>
                <div className="text-left">
                  <span className="text-xs md:text-sm font-bold dark:text-white block">{item.label}</span>
                  <span className="hidden md:block text-[10px] text-slate-400 font-medium opacity-80">Gerenciar</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-lg md:hidden">chevron_right</span>
            </button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-slate-100 dark:bg-slate-800/40 hover:bg-red-50 dark:hover:bg-red-900/10 text-accent-error py-3 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
      >
        Sair da Conta
      </button>

      {/* Version & Developer Info */}
      <div className="text-center pt-6 space-y-0.5">
        <p className="text-[9px] md:text-xs font-black uppercase tracking-widest dark:text-slate-400 italic">
          Criado por: Ricardo Luz • (99) 91754-2322
        </p>
        <p className="text-[7px] md:text-[10px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-600 opacity-60">
          SMART TECH v2.4.0 (Build 102)
        </p>
      </div>
    </div>
  );
};

export default Settings;
