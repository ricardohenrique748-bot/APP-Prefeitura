
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

  // Helper para determinar o intervalo de preventiva por tipo
  const getPreventiveInterval = (type: string) => {
    switch (type) {
      case 'Moto': return 1000;
      case 'Carro Leve':
      case 'Ambulância':
        return 10000;
      default: return 10000; // Padrão para Caminhões e outros
    }
  };

  const maintenanceAlerts = vehicles.map(v => {
    const interval = getPreventiveInterval(v.type);
    const lastKm = v.lastPreventiveKm || 0;
    const kmSinceLast = v.km - lastKm;
    const remaining = interval - kmSinceLast;

    // Alerta se faltar 10% do intervalo ou 1000km (o que for menor) para motos, 
    // ou lógica fixa de 1000km para os grandes. 
    // Simplificando: alerta se faltar <= 1000km ou já tiver vencido.
    // Para Moto (intervalo 1000), avisar com 200km de antecedência faz sentido.
    const warningThreshold = v.type === 'Moto' ? 200 : 1000;

    if (remaining <= warningThreshold) {
      return {
        ...v,
        maintenanceStatus: remaining <= 0 ? 'OVERDUE' : 'WARNING',
        remainingKm: remaining,
        kmSinceLast,
        interval // Passando o intervalo para usar na barra de progresso
      };
    }
    return null;
  }).filter((v): v is NonNullable<typeof v> & { maintenanceStatus: string, remainingKm: number, kmSinceLast: number, interval: number } => v !== null);

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

      {maintenanceAlerts.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-amber-500 animate-pulse">warning</span>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-[#5c6d8c]">Alertas de Preventiva</h2>
          </div>
          <div className="grid gap-3">
            {maintenanceAlerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl border-l-[6px] shadow-sm bg-white dark:bg-card-dark border dark:border-slate-800 ${alert.maintenanceStatus === 'OVERDUE' ? 'border-l-accent-error' : 'border-l-amber-400'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black italic text-slate-900 dark:text-white">{alert.plate}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{alert.model}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white ${alert.maintenanceStatus === 'OVERDUE' ? 'bg-accent-error' : 'bg-amber-400'}`}>
                    {alert.maintenanceStatus === 'OVERDUE' ? 'VENCIDA' : 'PRÓXIMA'}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {alert.maintenanceStatus === 'OVERDUE'
                      ? <span>Passou <span className="text-accent-error">{Math.abs(alert.remainingKm)} km</span></span>
                      : <span>Faltam <span className="text-amber-500">{alert.remainingKm} km</span></span>
                    }
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Ref: {alert.lastPreventiveKm}km</p>
                </div>
                {/* Progress Bar */}
                <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${alert.maintenanceStatus === 'OVERDUE' ? 'bg-accent-error' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, (alert.kmSinceLast / alert.interval) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
