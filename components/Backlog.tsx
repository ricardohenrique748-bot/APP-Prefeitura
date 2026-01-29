
import React, { useState } from 'react';
import { AppScreen, BacklogItem } from '../types';

interface BacklogProps {
  onBack: () => void;
  onAction: (screen: AppScreen) => void;
}

const Backlog: React.FC<BacklogProps> = ({ onBack, onAction }) => {
  const [backlog, setBacklog] = useState<BacklogItem[]>([
    { id: '1', plate: 'BRA-2E19', description: 'Vazamento de óleo no motor', priority: 'HIGH', requestDate: '26/10/2023', source: 'Checklist de Saída' },
    { id: '2', plate: 'FLT-9021', description: 'Ruído excessivo na suspensão dianteira', priority: 'MEDIUM', requestDate: '25/10/2023', source: 'Relato do Motorista' },
    { id: '3', plate: 'ABC-1234', description: 'Lâmpada do farol esquerdo queimada', priority: 'LOW', requestDate: '26/10/2023', source: 'Inspeção Diária' },
    { id: '4', plate: 'VAN-1020', description: 'Freio de mão com pouca pressão', priority: 'CRITICAL', requestDate: '26/10/2023', source: 'Checklist de Retorno' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = backlog.filter(item => 
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

  const handleDelete = (id: string) => {
    setBacklog(backlog.filter(item => item.id !== id));
  };

  const handleShareQuoteLink = (item: BacklogItem) => {
    const shareText = `Solicitação de Orçamento: ${item.plate} - ${item.description}. Acesse e preencha o valor aqui: ${window.location.origin}?screen=SUPPLIER_QUOTE&id=${item.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4 min-h-screen pb-24 relative">
      {/* Header Area */}
      <div className="p-4 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-4 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span> Voltar
        </button>
        
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Buscar por placa ou defeito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Backlog List */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Aguardando Triagem ({filteredItems.length})</h3>
        </div>
        
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">report_problem</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight leading-none mb-1">{item.plate}</h2>
                    <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${getPriorityStyle(item.priority)}`}>
                      {item.priority === 'CRITICAL' ? 'Crítico' : item.priority === 'HIGH' ? 'Alto' : item.priority === 'MEDIUM' ? 'Médio' : 'Baixo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleShareQuoteLink(item)}
                    className="size-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary active:scale-90 transition-all"
                    title="Pedir Orçamento via WhatsApp"
                  >
                    <span className="material-symbols-outlined text-xl">share</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="size-9 rounded-lg flex items-center justify-center bg-accent-error/10 text-accent-error active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl mb-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Origem: {item.source}</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Solicitado em: {item.requestDate}</p>
                </div>
                <button 
                  onClick={() => onAction(AppScreen.OS_CREATE)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">build</span>
                  Gerar OS
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-16 opacity-30">
            <span className="material-symbols-outlined text-5xl mb-2">assignment_turned_in</span>
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma pendência na fila</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-4 pointer-events-none">
        <div className="max-w-md mx-auto bg-primary/90 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between text-white shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined">analytics</span>
             <p className="text-[10px] font-bold uppercase">Triagem: <span className="text-white italic">4.2 Horas</span></p>
          </div>
          <button className="text-[9px] font-black uppercase bg-white/20 px-3 py-1.5 rounded-lg">Gerar Relatório</button>
        </div>
      </div>
    </div>
  );
};

export default Backlog;
