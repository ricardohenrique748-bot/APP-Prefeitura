
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AppScreen, Vehicle } from '../types';
import { OSDetail, FuelEntryData } from '../App';

interface DashboardProps {
  onAction: (screen: AppScreen) => void;
  orders: OSDetail[];
  vehicles: Vehicle[];
  fuelEntries: FuelEntryData[];
}

const Dashboard: React.FC<DashboardProps> = ({ onAction, orders, vehicles, fuelEntries }) => {
  const osSummary = {
    total: orders.length,
    abertas: orders.filter(os => os.status !== 'Finalizada').length,
    finalizadas: orders.filter(os => os.status === 'Finalizada').length,
    custoTotalManutencao: (orders.filter(os => os.isPaid).length * 1245).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    custoTotalCombustivel: fuelEntries.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  };

  const overdueVehicles = vehicles.filter(v => (v.km - (v.lastPreventiveKm || 0)) >= 10000);

  // Dados Reais da Frota para o Gráfico
  const counts = {
    ACTIVE: vehicles.filter(v => v.status === 'ACTIVE').length,
    MAINTENANCE: vehicles.filter(v => v.status === 'MAINTENANCE' || orders.some(o => o.plate === v.plate && o.status !== 'Finalizada')).length,
    INACTIVE: vehicles.filter(v => v.status === 'INACTIVE').length,
  };

  const chartData = [
    { name: 'ATIVOS', value: counts.ACTIVE, color: '#0bda5e' },
    { name: 'MANUTENÇÃO', value: counts.MAINTENANCE, color: '#fa6238' },
    { name: 'INATIVOS', value: counts.INACTIVE, color: '#334155' },
  ];

  return (
    <div className="p-4 space-y-4 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <p className="text-slate-500 dark:text-[#5c6d8c] text-[8px] font-black uppercase mb-1 tracking-widest">Total OS</p>
          <p className="text-xl font-black italic text-slate-900 dark:text-white leading-none">{osSummary.total}</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <p className="text-[#1754cf] text-[8px] font-black uppercase mb-1 tracking-widest">Abertas</p>
          <p className="text-xl font-black italic text-[#1754cf] leading-none">{osSummary.abertas}</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <p className="text-[#0bda5e] text-[8px] font-black uppercase mb-1 tracking-widest">Fechadas</p>
          <p className="text-xl font-black italic text-[#0bda5e] leading-none">{osSummary.finalizadas}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col justify-center min-h-[70px]">
          <p className="text-slate-500 dark:text-[#5c6d8c] text-[9px] font-black uppercase mb-1 tracking-widest">Gasto Manut.</p>
          <p className="text-lg font-black italic text-slate-900 dark:text-white leading-none tracking-tight">{osSummary.custoTotalManutencao}</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col justify-center min-h-[70px]">
          <p className="text-[#1754cf] text-[9px] font-black uppercase mb-1 tracking-widest">Gasto Combust.</p>
          <p className="text-lg font-black italic text-slate-900 dark:text-white leading-none tracking-tight">{osSummary.custoTotalCombustivel}</p>
        </div>
      </section>

      <section className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800/50 shadow-md">
        <h2 className="text-base font-black italic tracking-tighter uppercase text-slate-900 dark:text-white mb-5">Status da Frota</h2>
        <div className="flex items-center gap-6">
          <div className="relative size-32 flex-shrink-0">
            <PieChart width={128} height={128}>
              <Pie data={chartData} innerRadius={35} outerRadius={55} paddingAngle={8} dataKey="value" stroke="none" startAngle={90} endAngle={450}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black italic text-slate-900 dark:text-white leading-none">{vehicles.length}</span>
              <span className="text-[7px] font-black text-slate-500 dark:text-[#5c6d8c] uppercase tracking-[0.2em] mt-1">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[9px] font-black uppercase text-slate-500 dark:text-[#5c6d8c] tracking-wider">{item.name}</span>
                </div>
                <span className="text-base font-black italic text-slate-900 dark:text-white leading-none">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-16"></div>
    </div>
  );
};

export default Dashboard;
