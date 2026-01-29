
import React, { useState, useEffect } from 'react';

interface SupplierQuoteProps {
  onBack: () => void;
}

const SupplierQuote: React.FC<SupplierQuoteProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [itemDetails, setItemDetails] = useState({
    id: '',
    plate: '',
    description: '',
    priority: ''
  });

  const [formData, setFormData] = useState({
    supplierName: '',
    value: '',
    deadlineDays: '',
    observations: ''
  });

  useEffect(() => {
    // Simulando carregamento de dados da OS/Backlog pelo ID da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'OS-8823';
    
    setTimeout(() => {
      setItemDetails({
        id: id,
        plate: 'FLT-9021',
        description: 'Reparo Elétrico Farol e Troca de Lâmpadas LED de alta performance.',
        priority: 'CRÍTICA'
      });
      setLoading(false);
    }, 800);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[80vh] text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="size-24 bg-accent-success/10 text-accent-success rounded-full flex items-center justify-center shadow-lg shadow-accent-success/20 animate-bounce">
          <span className="material-symbols-outlined text-5xl font-black">check_circle</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Orçamento Enviado!</h2>
          <p className="text-slate-500 text-sm font-medium">Obrigado. Nossa equipe de manutenção analisará os valores e entrará em contato em breve.</p>
        </div>
        <div className="pt-10">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Protocolo: #{Math.floor(Math.random() * 900000)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <header className="space-y-2 pt-2">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Cotação de Serviço</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Painel do Fornecedor Externo</p>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 opacity-50">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest">Carregando detalhes...</p>
        </div>
      ) : (
        <>
          {/* Card Detalhes da Demanda */}
          <section className="bg-white dark:bg-[#1c2537] rounded-[1.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-md">{itemDetails.id}</span>
              <span className="text-[9px] font-black bg-accent-error/10 text-accent-error px-2 py-1 rounded uppercase italic tracking-widest">{itemDetails.priority}</span>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-xl bg-background-dark border border-slate-800 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">local_shipping</span>
               </div>
               <h3 className="text-2xl font-black italic tracking-tighter">{itemDetails.plate}</h3>
            </div>

            <div className="bg-background-dark/30 p-4 rounded-xl border border-slate-800/50">
               <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Descrição do Serviço</p>
               <p className="text-sm font-bold text-slate-200 leading-relaxed italic">"{itemDetails.description}"</p>
            </div>
          </section>

          {/* Formulário de Orçamento */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 mt-6">Insira sua proposta</h4>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Nome do Fornecedor / Empresa</label>
              <input 
                required
                type="text" 
                value={formData.supplierName}
                onChange={e => setFormData({...formData, supplierName: e.target.value})}
                placeholder="Ex: Mecânica Silva Ltda"
                className="w-full h-14 bg-[#1c2537] border border-slate-800 rounded-2xl px-6 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Valor Total (R$)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  placeholder="0.00"
                  className="w-full h-14 bg-[#1c2537] border border-slate-800 rounded-2xl px-6 text-lg font-black text-primary outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Prazo (Dias)</label>
                <input 
                  required
                  type="number" 
                  value={formData.deadlineDays}
                  onChange={e => setFormData({...formData, deadlineDays: e.target.value})}
                  placeholder="Ex: 2"
                  className="w-full h-14 bg-[#1c2537] border border-slate-800 rounded-2xl px-6 text-lg font-black text-white outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Observações Adicionais</label>
              <textarea 
                rows={3}
                value={formData.observations}
                onChange={e => setFormData({...formData, observations: e.target.value})}
                placeholder="Ex: Peças originais, garantia de 3 meses..."
                className="w-full bg-[#1c2537] border border-slate-800 rounded-2xl p-6 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">send</span>
                Enviar Orçamento Final
              </button>
            </div>
          </form>
        </>
      )}

      <div className="text-center pt-10 opacity-30">
        <p className="text-[9px] font-bold uppercase tracking-widest">FleetMaster © Fornecedores Externos v1.0</p>
      </div>
    </div>
  );
};

export default SupplierQuote;
