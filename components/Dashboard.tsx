
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { AppScreen, Vehicle, OSDetail, FuelEntryData } from '../types';

interface DashboardProps {
  onAction: (screen: AppScreen) => void;
  orders: OSDetail[];
  vehicles: Vehicle[];
  fuelEntries: FuelEntryData[];
  costCenters: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ onAction, orders, vehicles, fuelEntries, costCenters }) => {
  const osSummary = {
    total: orders.length,
    abertas: orders.filter(os => os.status !== 'Finalizada').length,
    finalizadas: orders.filter(os => os.status === 'Finalizada').length,
    custoTotalManutencao: (orders.filter(os => os.isPaid).length * 1245).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    custoTotalCombustivel: fuelEntries.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalLitros: fuelEntries.reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString('pt-BR') + ' L'
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

  // Fluxo de Caixa (6 Meses)
  const cashFlowData = React.useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('pt-BR', { month: 'short' });
      months.push({
        name: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1, 3),
        total: 0,
        monthIdx: d.getMonth(),
        year: d.getFullYear()
      });
    }

    orders.forEach(o => {
      if (!o.openedAt) return;
      const date = new Date(o.openedAt);
      const mIdx = months.findIndex(m => m.monthIdx === date.getMonth() && m.year === date.getFullYear());
      if (mIdx !== -1) months[mIdx].total += (o.costValue || 0);
    });

    fuelEntries.forEach(f => {
      if (!f.date) return;
      const date = new Date(f.date);
      const mIdx = months.findIndex(m => m.monthIdx === date.getMonth() && m.year === date.getFullYear());
      if (mIdx !== -1) months[mIdx].total += f.totalValue;
    });

    return months;
  }, [orders, fuelEntries]);

  const totalInvestment = cashFlowData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">

      {/* Metrics Row */}
      <section className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
        {/* Total OS */}
        <div className="bg-white dark:bg-card-dark p-3 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
          <p className="text-slate-500 dark:text-[#5c6d8c] text-[8px] md:text-xs font-black uppercase mb-1 md:mb-2 tracking-widest">Total OS</p>
          <p className="text-xl md:text-3xl font-black italic text-slate-900 dark:text-white leading-none">{osSummary.total}</p>
        </div>
        {/* Open OS */}
        <div className="bg-white dark:bg-card-dark p-3 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
          <p className="text-[#1754cf] text-[8px] md:text-xs font-black uppercase mb-1 md:mb-2 tracking-widest">Abertas</p>
          <p className="text-xl md:text-3xl font-black italic text-[#1754cf] leading-none">{osSummary.abertas}</p>
        </div>
        {/* Closed OS */}
        <div className="bg-white dark:bg-card-dark p-3 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
          <p className="text-[#0bda5e] text-[8px] md:text-xs font-black uppercase mb-1 md:mb-2 tracking-widest">Fechadas</p>
          <p className="text-xl md:text-3xl font-black italic text-[#0bda5e] leading-none">{osSummary.finalizadas}</p>
        </div>

        {/* Financial Metrics - Visible on Desktop grid, Mobile separates them below if needed, or we keep 5 cols on desktop */}
        <div className="hidden md:flex flex-col justify-center bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <p className="text-slate-500 dark:text-[#5c6d8c] text-xs font-black uppercase mb-2 tracking-widest">Gasto Manut.</p>
          <p className="text-xl font-black italic text-slate-900 dark:text-white leading-none tracking-tight">{osSummary.custoTotalManutencao}</p>
        </div>
        <div className="hidden md:flex flex-col justify-center bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <p className="text-[#1754cf] text-xs font-black uppercase mb-2 tracking-widest">Gasto Combust.</p>
          <p className="text-xl font-black italic text-slate-900 dark:text-white leading-none tracking-tight">{osSummary.totalLitros}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">{osSummary.custoTotalCombustivel}</p>
        </div>
      </section>

      {/* Mobile Only Financials (to keep original mobile layout exact) */}
      <section className="grid grid-cols-2 gap-2 md:hidden">
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col justify-center min-h-[70px]">
          <p className="text-slate-500 dark:text-[#5c6d8c] text-[9px] font-black uppercase mb-1 tracking-widest">Gasto Manut.</p>
          <p className="text-lg font-black italic text-slate-900 dark:text-white leading-none tracking-tight">{osSummary.custoTotalManutencao}</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col justify-center min-h-[70px]">
          <p className="text-[#1754cf] text-[9px] font-black uppercase mb-1 tracking-widest">Gasto Combust.</p>
          <p className="text-lg font-black italic text-slate-900 dark:text-white leading-none tracking-tight">{osSummary.totalLitros}</p>
          <p className="text-[8px] font-bold text-slate-400 mt-0.5">{osSummary.custoTotalCombustivel}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Fleet Status Chart */}
        <section className="bg-white dark:bg-card-dark rounded-2xl p-5 md:p-8 border border-slate-200 dark:border-slate-800/50 shadow-md md:col-span-2">
          <h2 className="text-base md:text-lg font-black italic tracking-tighter uppercase text-slate-900 dark:text-white mb-5">Status da Frota</h2>
          <div className="flex items-center justify-center md:justify-start gap-6 md:gap-12">
            <div className="relative size-32 md:size-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={chartData} innerRadius="60%" outerRadius="90%" paddingAngle={5} dataKey="value" stroke="none" startAngle={90} endAngle={450}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl md:text-4xl font-black italic text-slate-900 dark:text-white leading-none">{vehicles.length}</span>
                <span className="text-[7px] md:text-[10px] font-black text-slate-500 dark:text-[#5c6d8c] uppercase tracking-[0.2em] mt-1">Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:gap-5 flex-1 max-w-xs">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-[9px] md:text-xs font-black uppercase text-slate-500 dark:text-[#5c6d8c] tracking-wider">{item.name}</span>
                  </div>
                  <span className="text-base md:text-xl font-black italic text-slate-900 dark:text-white leading-none">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fluxo de Caixa (6 Meses) */}
        <section className="bg-white dark:bg-card-dark rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800/50 shadow-md">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 leading-none">Fluxo de Caixa (6 Meses)</p>
              <h2 className="text-xl md:text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">Manutenção & Combustível</h2>
            </div>
            <div className="text-right">
              <p className="text-xl md:text-3xl font-black text-[#1754cf] italic leading-none">R$ {totalInvestment.toLocaleString('pt-BR')}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Investimento Total Acumulado</p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1754cf" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1754cf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#1754cf"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Expenses by Cost Center */}
        <section className="bg-white dark:bg-card-dark rounded-2xl p-5 md:p-8 border border-slate-200 dark:border-slate-800/50 shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base md:text-lg font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Gasto por Centro de Custo</h2>
            <button onClick={() => onAction(AppScreen.COST_CENTERS)} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline px-4 py-2 bg-primary/10 rounded-xl">Ver Detalhes</button>
          </div>

          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costCenters}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Bar
                  dataKey="consumedValue"
                  name="Gasto Atual"
                  fill="#1754cf"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="budget"
                  name="Orçamento Liberado"
                  fill="#10b981"
                  opacity={0.3}
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {costCenters.map((cc) => (
              <div key={cc.id} className="bg-slate-50 dark:bg-background-dark/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{cc.id}</span>
                  <span className={`text-[10px] font-black italic ${cc.warning ? 'text-accent-error' : 'text-primary'}`}>{cc.progress}%</span>
                </div>
                <h3 className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 truncate mb-2">{cc.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black italic text-slate-900 dark:text-white">R$ {cc.consumedStr}</span>
                  <span className="text-[8px] font-bold text-slate-500">de R$ {cc.budget.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default Dashboard;
