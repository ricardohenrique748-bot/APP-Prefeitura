
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend } from 'recharts';
import { AppScreen, Vehicle, OSDetail } from '../types';

interface DashboardProps {
  onAction: (screen: AppScreen) => void;
  orders: OSDetail[];
  vehicles: Vehicle[];
  costCenters: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ onAction, orders, vehicles, costCenters }) => {
  const osSummary = {
    total: orders.length,
    abertas: orders.filter(os => os.status !== 'Finalizada').length,
    finalizadas: orders.filter(os => os.status === 'Finalizada').length,
    custoTotalManutencao: orders.reduce((acc, curr) => acc + (Number(curr.costValue) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
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

  // Enriquecer Centros de Custo com dados reais de Manutenção e Combustível
  const enrichedCostCenters = React.useMemo(() => {
    return costCenters.map(cc => {
      const ccName = (cc.name || "").trim();
      const ccId = (cc.id || "").toString().trim();

      // Filtra orders que tenham o nome ou ID do centro de custo na string
      const maintenanceTotal = orders
        .filter(o => {
          if (!o.costCenter) return false;
          const osCC = o.costCenter.trim();
          return osCC.includes(ccName) || osCC.startsWith(ccId + ' ') || osCC === ccId;
        })
        .reduce((acc, curr) => acc + (Number(curr.costValue) || 0), 0);

      const totalConsumed = maintenanceTotal;
      const progress = cc.budget > 0 ? Math.round((totalConsumed / cc.budget) * 100) : 0;

      return {
        ...cc,
        maintenance: maintenanceTotal,
        totalConsumed,
        progress,
        consumedStr: totalConsumed.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        warning: progress > 90
      };
    });
  }, [costCenters, orders]);

  // Fluxo de Caixa (6 Meses)
  const cashFlowData = React.useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('pt-BR', { month: 'short' });
      months.push({
        name: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1, 4), // Ex: Jan, Fev...
        maintenance: 0,
        fuel: 0,
        total: 0,
        monthIdx: d.getMonth(),
        year: d.getFullYear()
      });
    }

    orders.forEach(o => {
      let rawDate = o.openedAt || o.createdAt;
      if (!rawDate) return;

      // Sanitizar data para formato ISO caso venha com espaço do postgres
      const sanitizedDate = rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate;
      const date = new Date(sanitizedDate);
      if (isNaN(date.getTime())) return;

      const mIdx = months.findIndex(m => m.monthIdx === date.getMonth() && m.year === date.getFullYear());
      if (mIdx !== -1) {
        const val = Number(o.costValue) || 0;
        months[mIdx].maintenance += val;
        months[mIdx].total += val;
      }
    });

    return months;
  }, [orders]);

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
      </section>

      {/* Mobile Only Financials (to keep original mobile layout exact) */}
      <section className="grid grid-cols-2 gap-2 md:hidden">
        <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex flex-col justify-center min-h-[70px]">
          <p className="text-slate-500 dark:text-[#5c6d8c] text-[9px] font-black uppercase mb-1 tracking-widest">Gasto Manut.</p>
          <p className="text-lg font-black italic text-slate-900 dark:text-white leading-none tracking-tight">{osSummary.custoTotalManutencao}</p>
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


        {/* Expenses by Cost Center */}
        <section className="bg-white dark:bg-card-dark rounded-2xl p-5 md:p-8 border border-slate-200 dark:border-slate-800/50 shadow-md md:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base md:text-lg font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Gasto por Centro de Custo</h2>
            <button onClick={() => onAction(AppScreen.COST_CENTERS)} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline px-4 py-2 bg-primary/10 rounded-xl">Ver Detalhes</button>
          </div>

          <div className="h-[450px] w-full mt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enrichedCostCenters}
                margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                barGap={8} // Space between bars in a group
              >
                <defs>
                  <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="maintenanceWarningGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  angle={-15} // Less steep angle
                  textAnchor="end"
                  interval={0}
                  height={60}
                  tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(val) => `R$ ${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ padding: 0 }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}
                />
                {/* Budget Bar - Background/Reference */}
                <Bar
                  dataKey="budget"
                  name="Orçamento"
                  fill="url(#budgetGradient)"
                  radius={[6, 6, 6, 6]}
                  barSize={32}
                  isAnimationActive={true}
                />
                {/* Maintenance Bar - Foreground */}
                <Bar
                  dataKey="maintenance"
                  name="Executado"
                  fill="url(#maintenanceGradient)"
                  radius={[6, 6, 6, 6]}
                  barSize={32}
                >
                  {enrichedCostCenters.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.warning ? 'url(#maintenanceWarningGradient)' : 'url(#maintenanceGradient)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {enrichedCostCenters.map((cc) => (
              <div key={cc.id} className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="size-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                    {cc.id}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black border ${cc.warning
                    ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30'
                    }`}>
                    {cc.progress}% USO
                  </span>
                </div>

                <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 mb-4 line-clamp-1" title={cc.name}>
                  {cc.name}
                </h3>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cc.warning ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(cc.progress, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Executado</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">R$ {cc.maintenance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Limite</p>
                      <p className="text-xs font-bold text-slate-500">R$ {cc.budget.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
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
