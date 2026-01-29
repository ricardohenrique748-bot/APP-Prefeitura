
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
    <div className="p-4 space-y-4 pb-10">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Profile Card */}
      <section className="bg-white dark:bg-card-dark p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-14 rounded-full border-2 border-primary overflow-hidden bg-slate-200">
              <img
                src={avatarUrl}
                className="w-full h-full object-cover"
                alt="Ricardo Luz"
              />
            </div>
            <button
              onClick={triggerFileSelect}
              className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white dark:border-card-dark transition-all active:scale-90 shadow-md"
            >
              <span className="material-symbols-outlined text-[12px]">edit</span>
            </button>
          </div>
          <div>
            <h3 className="font-bold text-base dark:text-white transition-colors">Ricardo Luz</h3>
            <p className="text-[10px] text-slate-500 font-medium">Gestor de Frota • ID #8842</p>
          </div>
        </div>
      </section>

      {/* Theme Toggle Section */}
      <section className="space-y-1.5">
        <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-2">Visual do Sistema</h4>
        <button
          onClick={onToggleTheme}
          className="w-full bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className={`size-9 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
              <span className="material-symbols-outlined fill-1 text-lg">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block dark:text-white">{isDarkMode ? 'Modo Escuro' : 'Modo Claro'}</span>
              <span className="text-[9px] text-slate-500 font-medium uppercase tracking-tight">Toque para alternar</span>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-primary' : 'bg-slate-200'}`}>
            <div className={`absolute top-0.5 size-4 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'left-5' : 'left-0.5'}`}></div>
          </div>
        </button>
      </section>

      {/* Menu Section */}
      <section className="space-y-1.5">
        <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-2">Configurações e Gestão</h4>
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden transition-colors">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.screen && onAction(item.screen)}
              className="w-full flex items-center justify-between p-3 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors ${item.color}`}>
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                </div>
                <span className="text-xs font-bold dark:text-white">{item.label}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
            </button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-slate-100 dark:bg-slate-800/40 text-accent-error py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-[0.98] transition-transform"
      >
        Sair da Conta
      </button>

      {/* Version & Developer Info */}
      <div className="text-center pt-6 space-y-0.5">
        <p className="text-[9px] font-black uppercase tracking-widest dark:text-slate-400 italic">
          Criado por: Ricardo Luz • (99) 91754-2322
        </p>
        <p className="text-[7px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-600 opacity-60">
          SMART TECH v2.4.0 (Build 102)
        </p>
      </div>
    </div>
  );
};

export default Settings;
