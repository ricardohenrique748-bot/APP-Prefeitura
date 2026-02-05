
import React, { useState } from 'react';
import { AppScreen } from '../types';

interface MaintenanceListProps {
  onAction: (screen: AppScreen) => void;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({ onAction }) => {
  const [tab, setTab] = useState('ativas');

  const orders: any[] = [];

  return (
    <div className="space-y-4">
      {/* Search and Tabs */}
      <div className="bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="px-4 py-4 flex gap-2">
          <div className="relative group flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input
              className="w-full h-12 pl-10 pr-4 bg-slate-100 dark:bg-card-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="Buscar placa ou OS..."
              type="text"
            />
          </div>
          <button
            onClick={() => onAction(AppScreen.OS_CREATE)}
            className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <div className="flex px-4 gap-6 overflow-x-auto no-scrollbar">
          {['Ativas (12)', 'Sinc. Pendente (3)', 'Finalizadas'].map((label, idx) => (
            <button
              key={idx}
              onClick={() => setTab(label.toLowerCase())}
              className={`pb-3 pt-2 whitespace-nowrap text-sm font-bold border-b-2 transition-colors ${tab === label.toLowerCase() ? 'border-primary text-primary' : 'border-transparent text-slate-500'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {orders.map((os) => (
          <div key={os.id} className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">{os.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">{os.id}</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{os.type}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${os.statusColor}`}>
                    {os.status}
                  </span>
                  {os.pending && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase">
                      <span className="material-symbols-outlined text-xs">cloud_off</span> Sinc. Pendente
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  <span>{os.date}</span>
                </div>
                {os.mechanic && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    <span>Mecânico: {os.mechanic}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 h-10 bg-primary text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-lg">visibility</span> Detalhes
                </button>
                <button className="flex-1 h-10 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-lg text-[#25D366]">chat</span> WhatsApp
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceList;
