
import React, { useState } from 'react';

interface ShiftEndProps {
  onBack: () => void;
}

const ShiftEnd: React.FC<ShiftEndProps> = ({ onBack }) => {
  const [km, setKm] = useState('143120');


  return (
    <div className="p-4 space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Finalização de Turno</h3>
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <label className="flex flex-col w-full">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">KM Final</p>
            <input
              className="w-full rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111722] h-12 px-4 focus:ring-2 focus:ring-primary outline-none text-base font-mono"
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </label>

        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Checklist de Entrega</h3>
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { label: 'Limpeza Interna', icon: 'cleaning_services' },
            { label: 'Nível de Arla 32', icon: 'water_drop' },

          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 space-y-3">
        <button
          onClick={onBack}
          className="w-full h-14 bg-accent-error text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">stop_circle</span> Encerrar Turno
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 text-slate-500 font-bold text-sm uppercase tracking-widest"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ShiftEnd;
