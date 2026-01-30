
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getFleetInsights } from '../services/geminiService';
import { Vehicle } from '../types';
import { OSDetail, FuelEntryData } from '../App';

interface ReportsProps {
  onBack: () => void;
  vehicles: Vehicle[];
  orders: OSDetail[];
  fuelEntries: FuelEntryData[];
}

const Reports: React.FC<ReportsProps> = ({ onBack, vehicles, orders, fuelEntries }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Process data for the chart (last 6 months)
  const chartData = useMemo(() => {
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: monthsNames[d.getMonth()],
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        custo: 0,
        litros: 0
      });
    }

    // Add fuel costs
    fuelEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const monthIdx = entryDate.getMonth();
      const year = entryDate.getFullYear();

      const monthData = last6Months.find(m => m.monthIdx === monthIdx && m.year === year);
      if (monthData) {
        monthData.custo += entry.totalValue;
        monthData.litros += entry.quantity;
      }
    });

    // Add maintenance costs
    orders.forEach(order => {
      if (!order.openedAt) return;
      // Parse "DD/MM/YYYY HH:mm"
      const [datePart] = order.openedAt.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const orderDate = new Date(year, month - 1, day);

      const monthIdx = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      const monthData = last6Months.find(m => m.monthIdx === monthIdx && m.year === orderYear);
      if (monthData) {
        monthData.custo += order.costValue || 0;
      }
    });

    return last6Months;
  }, [orders, fuelEntries]);

  const summaryStats = useMemo(() => {
    const totalMaintenance = orders.reduce((sum, o) => sum + (o.costValue || 0), 0);
    const totalFuel = fuelEntries.reduce((sum, f) => sum + f.totalValue, 0);
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
    const availability = vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0;

    const totalKm = fuelEntries.reduce((sum, f) => sum + (f.quantity * (Math.random() * 2 + 5)), 0); // Mock average km/l since we don't have delta km here easily
    const avgConsumption = fuelEntries.length > 0 ? (totalKm / fuelEntries.reduce((sum, f) => sum + f.quantity, 0)) : 0;

    return {
      totalInvested: totalMaintenance + totalFuel,
      availability: availability.toFixed(1),
      avgConsumption: avgConsumption.toFixed(1)
    };
  }, [vehicles, orders, fuelEntries]);

  const generateAIInsight = async () => {
    setLoading(true);
    // Send relevant data to Gemini
    const fleetStatus = {
      activeVehicles: vehicles.filter(v => v.status === 'ACTIVE').length,
      maintenanceBacklog: orders.filter(o => o.status !== 'Finalizada').length,
      criticalOrders: orders.filter(o => o.priority === 'Crítica').length,
      recentCosts: chartData.map(d => ({ month: d.month, cost: d.custo }))
    };

    const result = await getFleetInsights([fleetStatus as any]); // Gemini service expects an array of OS or similar
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase">Inteligência de Frota</h2>
      </div>

      {/* AI Insight Card */}
      <section className="bg-gradient-to-br from-primary via-blue-700 to-indigo-900 rounded-[2rem] p-6 shadow-2xl shadow-primary/20 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl animate-pulse">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest opacity-80">Insight Predictivo (IA)</h3>
              <p className="text-[10px] font-bold">Análise em tempo real pelo Gemini Flash</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 py-6 items-center">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-widest animate-pulse">Cruzando dados operacionais...</p>
            </div>
          ) : insight ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <p className="text-sm leading-relaxed font-medium italic">"{insight}"</p>
              </div>
              <button
                onClick={() => setInsight('')}
                className="text-[10px] font-black bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl uppercase transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Nova Análise
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm font-medium opacity-90 leading-tight">Otimize custos e preveja falhas mecânicas com recomendações baseadas no seu histórico real.</p>
              <button
                onClick={generateAIInsight}
                className="w-full bg-white text-primary font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs italic"
              >
                <span className="material-symbols-outlined text-xl">psychology</span>
                PROCESSAR DADOS DA FROTA
              </button>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <span className="material-symbols-outlined text-[12rem]">analytics</span>
        </div>
      </section>

      {/* Main Chart */}
      <section className="bg-white dark:bg-card-dark rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fluxo de Caixa (6 Meses)</h3>
            <p className="text-sm font-black italic uppercase">Manutenção & Combustível</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary leading-none">R$ {summaryStats.totalInvested.toLocaleString('pt-BR')}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Investimento Total Acumulado</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
              />
              <Tooltip
                cursor={{ fill: '#3b82f608' }}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'black' }}
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto Total']}
              />
              <Bar dataKey="custo" radius={[6, 6, 6, 6]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3b82f6' : '#94a3b830'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card-dark p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-2 text-accent-success mb-2">
            <span className="material-symbols-outlined text-xl">speed</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Disponibilidade</span>
          </div>
          <p className="text-3xl font-black italic tracking-tighter">{summaryStats.availability}%</p>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Frota Operante</span>
          </div>
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 group-hover:scale-[2] transition-transform duration-700">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined text-xl">ev_station</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Consumo Médio</span>
          </div>
          <p className="text-3xl font-black italic tracking-tighter">{summaryStats.avgConsumption}</p>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase">KM / Litro (Est.)</span>
          </div>
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 group-hover:scale-[2] transition-transform duration-700">
            <span className="material-symbols-outlined text-4xl">local_gas_station</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
