
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getFleetInsights } from '../services/geminiService';

interface ReportsProps {
  onBack: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onBack }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const performanceData = [
    { month: 'Jan', custo: 4500, eficiencia: 85 },
    { month: 'Fev', custo: 5200, eficiencia: 82 },
    { month: 'Mar', custo: 4800, eficiencia: 88 },
    { month: 'Abr', custo: 6100, eficiencia: 75 },
    { month: 'Mai', custo: 5500, eficiencia: 90 },
  ];

  const generateAIInsight = async () => {
    setLoading(true);
    const mockData = [
      { id: '1', type: 'Preventiva', status: 'Atrasada', plate: 'FLT-9021' },
      { id: '2', type: 'Corretiva', status: 'Urgente', plate: 'ABC-1234' }
    ];
    const result = await getFleetInsights(mockData);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold tracking-tight">Análise de Performance</h2>
      </div>

      {/* AI Insight Card */}
      <section className="bg-gradient-to-br from-primary/90 to-blue-700 rounded-2xl p-5 shadow-lg shadow-primary/20 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
            <h3 className="font-bold text-sm uppercase tracking-wider">Insight da Frota (IA)</h3>
          </div>
          
          {loading ? (
            <div className="flex flex-col gap-2 py-4 items-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs font-medium opacity-80">Processando dados com Gemini...</p>
            </div>
          ) : insight ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed opacity-95 italic">"{insight}"</p>
              <button 
                onClick={() => setInsight('')}
                className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full uppercase transition-colors"
              >
                Limpar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm opacity-80">Obtenha recomendações inteligentes baseadas no comportamento atual da sua frota.</p>
              <button 
                onClick={generateAIInsight}
                className="w-full bg-white text-primary font-bold py-3 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">psychology</span>
                GERAR INSIGHTS AGORA
              </button>
            </div>
          )}
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <span className="material-symbols-outlined text-9xl">analytics</span>
        </div>
      </section>

      {/* Main Chart */}
      <section className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Custos Operacionais (R$)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#1754cf10' }}
              />
              <Bar dataKey="custo" fill="#1754cf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-accent-success mb-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-[10px] font-bold uppercase">Disponibilidade</span>
          </div>
          <p className="text-2xl font-bold">94.2%</p>
          <p className="text-[10px] text-slate-500 font-medium">+1.2% vs mês anterior</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-accent-error mb-1">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            <span className="text-[10px] font-bold uppercase">Consumo Médio</span>
          </div>
          <p className="text-2xl font-bold">2.4 km/l</p>
          <p className="text-[10px] text-slate-500 font-medium">-0.4 vs mês anterior</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
