
import React from 'react';
import { AppScreen } from '../types';
import { FuelEntryData } from '../App';

interface FuelControlProps {
  onAction: (screen: AppScreen) => void;
  fuelEntries: FuelEntryData[];
  isAdmin?: boolean;
}

const FuelControl: React.FC<FuelControlProps> = ({ onAction, fuelEntries, isAdmin = false }) => {
  const averageConsum = fuelEntries.length > 0 ? "2.4" : "0.0";
  const totalCost = fuelEntries.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-card-dark p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Consumo Médio</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">{averageConsum}</span>
            <span className="text-[9px] font-bold text-slate-400">km/l</span>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Gasto Acumulado</p>
          <span className="text-lg font-bold text-accent-success">{totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>

      <button onClick={() => onAction(AppScreen.FUEL_ENTRY)} className="w-full h-16 bg-primary text-white px-4 rounded-2xl shadow-lg flex items-center justify-between active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl"><span className="material-symbols-outlined">add_circle</span></div>
          <div className="text-left">
            <p className="text-xs font-black uppercase tracking-wide">Lançar Novo Abastecimento</p>
            <p className="text-[9px] opacity-80 uppercase font-medium">Registrar placa e litros</p>
          </div>
        </div>
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="space-y-3">
        <h3 className="font-black italic text-base uppercase tracking-tight text-slate-900 dark:text-white">Histórico Recente</h3>
        <div className="space-y-2">
          {fuelEntries.length > 0 ? fuelEntries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex items-center gap-3">
              <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">local_gas_station</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase">{entry.plate}</span>
                  <span className="text-[8px] font-bold text-slate-400">{entry.date}</span>
                </div>
                <div className="flex justify-between items-end mt-0.5">
                  <h4 className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{entry.quantity}L • {entry.item}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-accent-success">{entry.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    {isAdmin && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => alert("Editar abastecimento (Implementar)")} className="size-6 bg-slate-100 rounded flex items-center justify-center text-slate-500 hover:text-primary"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => alert("Excluir abastecimento (Implementar)")} className="size-6 bg-slate-100 rounded flex items-center justify-center text-slate-500 hover:text-accent-error"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center text-[10px] text-slate-400 py-8 uppercase font-bold tracking-widest">Nenhum abastecimento registrado</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuelControl;
