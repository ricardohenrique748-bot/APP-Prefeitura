
import React, { useState, useMemo } from 'react';
import { AppScreen, BacklogItem, Shift } from '../types';

interface BacklogProps {
  onBack: () => void;
  onAction: (screen: AppScreen) => void;
  shifts?: Shift[];
}

const Backlog: React.FC<BacklogProps> = ({ onBack, onAction, shifts = [] }) => {
  // Combine hardcoded mock data with dynamic data from shifts that have damage reports
  const [searchTerm, setSearchTerm] = useState('');

  const backlogItems = useMemo(() => {
    const mockItems: BacklogItem[] = [
      { id: 'm1', plate: 'BRA-2E19', description: 'Vazamento de óleo no motor', priority: 'HIGH', requestDate: '26/10/2023', source: 'Checklist de Saída' },
      { id: 'm2', plate: 'FLT-9021', description: 'Ruído excessivo na suspensão dianteira', priority: 'MEDIUM', requestDate: '25/10/2023', source: 'Relato do Motorista' },
    ];

    const dynamicItems: BacklogItem[] = shifts
      .filter(s => s.damageReport || (s.checklistData && Object.values(s.checklistData).includes(false)))
      .map(s => {
        let desc = s.damageReport ? `AVARIA: ${s.damageReport.description || JSON.stringify(s.damageReport)}` : 'Problema no checklist';
        if (!s.damageReport && s.checklistData) {
          const failedItems = Object.entries(s.checklistData)
            .filter(([_, val]) => val === false)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
          desc = `Checklist Reprovado: ${failedItems.join(', ')}`;
        }

        return {
          id: s.id,
          plate: 'V-PROCESSED', // We should look up plate by vehicle_id, but for now we label as processed
          description: desc,
          priority: s.damageReport?.severity === 'alta' ? 'HIGH' : 'MEDIUM',
          requestDate: new Date(s.startTime).toLocaleDateString('pt-BR'),
          source: `Turno: ${s.driverName}`
        };
      });

    return [...mockItems, ...dynamicItems];
  }, [shifts]);

  const filteredItems = backlogItems.filter(item =>
    item.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-accent-error/20 text-accent-error border-accent-error/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'MEDIUM': return 'bg-primary/20 text-primary border-primary/30';
      case 'LOW': return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleShareQuoteLink = (item: BacklogItem) => {
    const shareText = `Solicitação de Orçamento: ${item.plate} - ${item.description}. Acesse e preencha o valor aqui: ${window.location.origin}?screen=SUPPLIER_QUOTE&id=${item.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4 min-h-screen pb-24 relative bg-background-light dark:bg-background-dark">
      {/* Header Area */}
      <div className="p-4 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-4 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span> Dashboard
        </button>

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input
              type="text"
              placeholder="Buscar por placa ou defeito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Backlog List */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pendências Detectadas</h3>
            <p className="text-xs font-bold text-slate-400">Total: {filteredItems.length} itens aguardando triagem</p>
          </div>
          <span className="material-symbols-outlined text-slate-300">sort</span>
        </div>

        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-primary border dark:border-slate-700">
                    <span className="material-symbols-outlined text-2xl">build_circle</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight leading-none mb-1.5">{item.plate}</h2>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getPriorityStyle(item.priority)}`}>
                      {item.priority === 'CRITICAL' ? 'Crítico' : item.priority === 'HIGH' ? 'Alto' : item.priority === 'MEDIUM' ? 'Médio' : 'Baixo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShareQuoteLink(item)}
                    className="size-10 rounded-xl flex items-center justify-center bg-primary/5 text-primary active:scale-90 transition-all hover:bg-primary/10"
                    title="Pedir Orçamento via WhatsApp"
                  >
                    <span className="material-symbols-outlined text-xl">share</span>
                  </button>
                  <button
                    className="size-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 active:scale-90 transition-all hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xl">more_vert</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-background-dark/50 p-4 rounded-2xl mb-5 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Relato da Ocorrência</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{item.description}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-sm">history</span>
                    <p className="text-[9px] uppercase font-bold text-slate-500">{item.source}</p>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <p className="text-[9px] uppercase font-bold text-slate-500">{item.requestDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => onAction(AppScreen.OS_CREATE)}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined text-base">add_task</span>
                  Gerar OS
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-24 opacity-20">
            <span className="material-symbols-outlined text-7xl mb-4">task_alt</span>
            <p className="text-sm font-black uppercase tracking-[0.2em]">Frota 100% Operacional</p>
            <p className="text-[10px] mt-1 font-bold">Nenhuma pendência técnica encontrada</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-28 left-0 right-0 px-4 pointer-events-none">
        <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl p-4 rounded-[2rem] flex items-center justify-between text-white shadow-2xl pointer-events-auto border border-white/10">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">insights</span>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">KPI de Triagem</p>
              <p className="text-sm font-black italic">4.2 horas <span className="text-[10px] font-bold text-accent-success">(+12%)</span></p>
            </div>
          </div>
          <button className="text-[10px] font-black uppercase bg-primary px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">Relatório</button>
        </div>
      </div>
    </div>
  );
};

export default Backlog;
