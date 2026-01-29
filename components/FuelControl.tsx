
import React from 'react';
import { AppScreen } from '../types';
import { FuelEntryData } from '../App';

interface FuelControlProps {
  onAction: (screen: AppScreen) => void;
  fuelEntries: FuelEntryData[];
}

const FuelControl: React.FC<FuelControlProps> = ({ onAction, fuelEntries }) => {
  const averageConsum = fuelEntries.length > 0 ? "2.4" : "0.0";
  const totalCost = fuelEntries.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Consumo Médio</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary">{averageConsum}</span>
            <span className="text-[10px] font-bold text-slate-400">km/l</span>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Gasto Acumulado</p>
          <span className="text-xl font-bold text-accent-success">{totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>

      <button onClick={() => onAction(AppScreen.FUEL_ENTRY)} className="w-full bg-primary text-white p-4 rounded-2xl shadow-lg flex items-center justify-between active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl"><span className="material-symbols-outlined">add_circle</span></div>
          <div className="text-left">
            <p className="text-sm font-bold">Lançar Novo Abastecimento</p>
            <p className="text-[10px] opacity-80 uppercase font-medium">Registrar placa e litros</p>
          </div>
        </div>
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Histórico Recente</h3>
        <div className="space-y-3">
          {fuelEntries.length > 0 ? fuelEntries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
              <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">local_gas_station</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black uppercase">{entry.plate}</span>
                  <span className="text-[9px] font-bold text-slate-400">{entry.date}</span>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <h4 className="text-[11px] font-bold">{entry.quantity}L • {entry.item}</h4>
                  <span className="text-sm font-black text-accent-success">{entry.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center text-xs text-slate-400 py-10 uppercase font-bold tracking-widest">Nenhum abastecimento registrado</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuelControl;
