
import React, { useState, useRef, useEffect } from 'react';
import { AppScreen } from '../types';
import { OSDetail } from '../App';
import { supabase } from '../services/supabase';

interface OSControlProps {
  onAction: (screen: AppScreen) => void;
  orders: OSDetail[];
  setOrders: React.Dispatch<React.SetStateAction<OSDetail[]>>;
}

const OSControl: React.FC<OSControlProps> = ({ onAction, orders, setOrders }) => {
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const quoteInputRef = useRef<HTMLInputElement>(null);

  const selectedOS = orders.find(o => o.id === selectedOSId) || null;
  const [editForm, setEditForm] = useState<Partial<OSDetail>>({});
  const [receivedQuotes, setReceivedQuotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (selectedOSId) {
        const { data } = await supabase.from('service_quotes').select('*').eq('service_order_id', selectedOSId).order('created_at', { ascending: false });
        setReceivedQuotes(data || []);
      } else {
        setReceivedQuotes([]);
      }
    };
    fetchQuotes();
  }, [selectedOSId]);

  const handleTogglePayment = (osId: string) => {
    setOrders(prev => prev.map(os =>
      os.id === osId ? { ...os, isPaid: !os.isPaid } : os
    ));
  };

  const handleFinishOS = (osId: string) => {
    setOrders(prev => prev.map(os =>
      os.id === osId ? { ...os, status: 'Finalizada', priority: 'Baixa' } : os
    ));
    setTimeout(() => setSelectedOSId(null), 300);
  };

  const startEditing = () => {
    if (selectedOS) {
      setEditForm(selectedOS);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveEditing = () => {
    if (selectedOSId) {
      setOrders(prev => prev.map(os =>
        os.id === selectedOSId ? { ...os, ...editForm } as OSDetail : os
      ));
      setIsEditing(false);
    }
  };

  const confirmDelete = () => {
    if (selectedOSId) {
      setOrders(prev => prev.filter(os => os.id !== selectedOSId));
      setSelectedOSId(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleAttachDocument = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'quote') => {
    const file = e.target.files?.[0];
    if (file && selectedOSId) {
      const url = URL.createObjectURL(file);
      setOrders(prev => prev.map(os =>
        os.id === selectedOSId ? { ...os, [type === 'invoice' ? 'invoiceUrl' : 'quoteUrl']: url } : os
      ));
    }
  };

  const handleRemoveDocument = (osId: string, type: 'invoice' | 'quote') => {
    setOrders(prev => prev.map(os =>
      os.id === osId ? { ...os, [type === 'invoice' ? 'invoiceUrl' : 'quoteUrl']: undefined } : os
    ));
  };

  const handleShareQuoteLink = (e: React.MouseEvent, osId: string) => {
    e.stopPropagation();
    const shareText = `Olá, gostaria de solicitar um orçamento para a ${osId}.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Execução': return 'bg-amber-500/10 text-amber-500';
      case 'Crítica': return 'bg-red-500/10 text-red-500';
      case 'Aberta': return 'bg-blue-500/10 text-blue-500';
      case 'Finalizada': return 'bg-emerald-500/10 text-emerald-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const filteredOrders = orders.filter(os => {
    if (activeFilter === 'Todas') return os.status !== 'Finalizada';
    if (activeFilter === 'Finalizadas') return os.status === 'Finalizada';
    if (activeFilter === 'Preventiva') return os.taskType === 'Preventiva' && os.status !== 'Finalizada';
    if (activeFilter === 'Corretiva') return os.taskType === 'Corretiva' && os.status !== 'Finalizada';
    return os.status === activeFilter;
  });

  const filters = [
    { label: 'Todas', count: orders.filter(o => o.status !== 'Finalizada').length },
    { label: 'Preventiva', count: orders.filter(o => o.taskType === 'Preventiva' && o.status !== 'Finalizada').length },
    { label: 'Corretiva', count: orders.filter(o => o.taskType === 'Corretiva' && o.status !== 'Finalizada').length },
    { label: 'Finalizadas', count: orders.filter(o => o.status === 'Finalizada').length },
  ];

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-card-dark p-3 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <span className="size-2 md:size-3 rounded-full bg-blue-500"></span>
            <span className="text-[9px] md:text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">Ativas</span>
          </div>
          <p className="text-xl md:text-3xl font-bold md:font-black">{orders.filter(o => o.status !== 'Finalizada').length}</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-3 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <span className="size-2 md:size-3 rounded-full bg-accent-success"></span>
            <span className="text-[9px] md:text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">Pagas</span>
          </div>
          <p className="text-xl md:text-3xl font-bold md:font-black">{orders.filter(o => o.isPaid).length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-black italic text-lg md:text-2xl uppercase tracking-tight text-slate-900 dark:text-white">Gestão de Ordens</h3>
        <button
          onClick={() => onAction(AppScreen.OS_CREATE)}
          className="bg-primary text-white text-[9px] md:text-xs font-black uppercase tracking-widest px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-95 hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-xs md:text-sm">add</span> NOVA OS
        </button>
      </div>

      <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar py-2 border-b border-slate-100 dark:border-slate-800">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.label)}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg whitespace-nowrap transition-all ${activeFilter === f.label
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
          >
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest">{f.label}</span>
            <span className={`text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded ${activeFilter === f.label ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'
              }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? filteredOrders.map((os) => (
          <div
            key={os.id}
            onClick={() => setSelectedOSId(os.id)}
            className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${os.priority === 'Crítica' ? 'bg-red-500' : os.priority === 'Alta' ? 'bg-amber-500' : 'bg-blue-500'
              }`}></div>

            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="text-[10px] font-black text-primary tracking-tighter bg-primary/5 px-1 rounded">{os.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-black italic text-slate-700 dark:text-slate-200">{os.plate}</span>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase ${os.taskType === 'Preventiva' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                    {os.taskType}
                  </span>
                  {os.isPaid && (
                    <span className="bg-emerald-500/20 text-emerald-500 text-[7px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[9px] fill-1">check_circle</span> PAGO
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs md:text-sm leading-tight text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[2.5em]">{os.task}</h4>
                <p className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-widest">CC: {os.costCenter}</p>
              </div>
              <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap ml-2 ${getStatusColor(os.status)}`}>
                {os.status}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  <span className="truncate max-w-[80px]">{os.mechanic}</span>
                </div>
                <button
                  onClick={(e) => handleShareQuoteLink(e, os.id)}
                  className="flex items-center gap-1 text-[9px] text-primary font-black uppercase tracking-widest hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">share</span>
                  Solicitar
                </button>
              </div>
              <span className="text-[9px] font-bold text-slate-400 italic">{os.time}</span>
            </div>
          </div>
        )) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 opacity-40">
            <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma OS encontrada</p>
          </div>
        )}
      </div>

      {selectedOS && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-0 md:p-8" onClick={() => { setSelectedOSId(null); setIsEditing(false); }}>
          <div
            className="w-full max-w-md md:max-w-4xl bg-white dark:bg-card-dark rounded-t-[2rem] md:rounded-[2rem] p-6 md:p-8 space-y-4 md:space-y-6 animate-in slide-in-from-bottom-full md:zoom-in-95 duration-500 shadow-2xl h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto no-scrollbar border dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-widest">{selectedOS.id}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getStatusColor(selectedOS.status)}`}>{selectedOS.status}</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.plate || ''}
                    onChange={e => setEditForm({ ...editForm, plate: e.target.value.toUpperCase() })}
                    className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">{selectedOS.plate}</h2>
                )}
              </div>
              <button onClick={() => { setSelectedOSId(null); setIsEditing(false); }} className="size-10 md:size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-90 transition-transform hover:bg-slate-200 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-lg md:text-xl">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* Left Column (Details) */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-background-dark p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Tipo de Manutenção</p>
                    {isEditing ? (
                      <select
                        value={editForm.taskType}
                        onChange={e => setEditForm({ ...editForm, taskType: e.target.value as any })}
                        className="w-full bg-transparent text-xs font-bold text-primary outline-none"
                      >
                        <option value="Corretiva">Corretiva</option>
                        <option value="Preventiva">Preventiva</option>
                        <option value="Preditiva">Preditiva</option>
                      </select>
                    ) : (
                      <p className="text-xs font-bold text-primary">{selectedOS.taskType}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 dark:bg-background-dark p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Prioridade</p>
                    {isEditing ? (
                      <select
                        value={editForm.priority}
                        onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                        className="w-full bg-transparent text-xs font-bold outline-none"
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                        <option value="Crítica">Crítica</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`size-2.5 rounded-full ${selectedOS.priority === 'Crítica' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : selectedOS.priority === 'Alta' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-blue-500'}`}></span>
                        <p className="text-[10px] font-black uppercase">{selectedOS.priority}</p>
                      </div>
                    )}
                  </div>
                </div>

                <section className="space-y-3">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Descrição e Responsável</h4>
                  <div className="bg-slate-50 dark:bg-background-dark p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Serviço Solicitado</p>
                      {isEditing ? (
                        <textarea
                          value={editForm.task || ''}
                          onChange={e => setEditForm({ ...editForm, task: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">"{selectedOS.task}"</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Mecânico</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.mechanic || ''}
                            onChange={e => setEditForm({ ...editForm, mechanic: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-[10px] font-bold outline-none"
                          />
                        ) : (
                          <p className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">{selectedOS.mechanic}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Centro de Custo</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.costCenter || ''}
                            onChange={e => setEditForm({ ...editForm, costCenter: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-[10px] font-bold outline-none"
                          />
                        ) : (
                          <p className="text-xs font-bold uppercase tracking-tighter text-slate-800 dark:text-slate-200">{selectedOS.costCenter}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10">
                  <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Valor da OS (R$)</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.costValue || 0}
                      onChange={e => setEditForm({ ...editForm, costValue: parseFloat(e.target.value) })}
                      className="text-xl font-black text-primary bg-transparent outline-none w-full"
                    />
                  ) : (
                    <p className="text-xl font-black text-primary">R$ {(selectedOS.costValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  )}
                </div>
              </div>

              {/* Right Column (Actions & Docs) */}
              <div className="space-y-4">
                <section className="space-y-3">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Documentos e Faturamento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest text-center">Orçamento Fornecedor</p>
                      <input type="file" accept="image/*,application/pdf" className="hidden" ref={quoteInputRef} onChange={(e) => handleAttachDocument(e, 'quote')} />
                      {!selectedOS.quoteUrl ? (
                        <button onClick={() => quoteInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                          <span className="material-symbols-outlined text-xl">request_quote</span>
                          <span className="text-[7px] font-black uppercase tracking-tighter text-center">Anexar Orçamento</span>
                        </button>
                      ) : (
                        <div className="relative group w-full h-24 rounded-2xl overflow-hidden border border-blue-500/30 bg-blue-50 dark:bg-blue-900/10 shadow-inner">
                          <img src={selectedOS.quoteUrl} className="w-full h-full object-cover opacity-90" alt="Orçamento" />
                          <button onClick={() => handleRemoveDocument(selectedOS.id, 'quote')} className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 hover:bg-red-600"><span className="material-symbols-outlined text-[12px]">close</span></button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest text-center">Nota Fiscal (NF-e)</p>
                      <input type="file" accept="image/*" capture="environment" className="hidden" ref={invoiceInputRef} onChange={(e) => handleAttachDocument(e, 'invoice')} />
                      {!selectedOS.invoiceUrl ? (
                        <button onClick={() => invoiceInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                          <span className="material-symbols-outlined text-xl">receipt_long</span>
                          <span className="text-[7px] font-black uppercase tracking-tighter text-center">Anexar Nota Fiscal</span>
                        </button>
                      ) : (
                        <div className="relative group w-full h-24 rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 shadow-inner">
                          <img src={selectedOS.invoiceUrl} className="w-full h-full object-cover opacity-90" alt="NF" />
                          <button onClick={() => handleRemoveDocument(selectedOS.id, 'invoice')} className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 hover:bg-red-600"><span className="material-symbols-outlined text-[12px]">close</span></button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {isEditing ? (
                      <>
                        <button onClick={cancelEditing} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all text-slate-500">
                          CANCELAR
                        </button>
                        <button onClick={saveEditing} className="h-12 bg-primary rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all text-white shadow-lg shadow-primary/30">
                          SALVAR
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={startEditing} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all text-slate-700 dark:text-slate-300">
                          <span className="material-symbols-outlined text-base">edit</span> EDITAR
                        </button>
                        <button onClick={() => handleTogglePayment(selectedOS.id)} className={`h-12 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg ${selectedOS.isPaid ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700' : 'bg-accent-success text-white shadow-accent-success/30'}`}>
                          <span className="material-symbols-outlined text-base">payments</span>
                          {selectedOS.isPaid ? 'ESTORNAR PGTO' : 'CONFIRMAR PGTO'}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      disabled={selectedOS.status === 'Finalizada'}
                      onClick={() => handleFinishOS(selectedOS.id)}
                      className={`w-full h-14 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${selectedOS.status === 'Finalizada' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-primary text-white shadow-primary/30'}`}
                    >
                      <span className="material-symbols-outlined text-lg">verified</span>
                      {selectedOS.status === 'Finalizada' ? 'ORDEM FINALIZADA' : 'FINALIZAR MANUTENÇÃO'}
                    </button>

                    {!isEditing && (
                      <button onClick={() => setShowDeleteConfirm(true)} className="w-full h-10 text-accent-error text-[9px] font-black uppercase tracking-[0.2em] border border-accent-error/20 rounded-lg hover:bg-accent-error/5 transition-colors">
                        Excluir Ordem de Serviço
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Received Quotes Section */}
            {receivedQuotes.length > 0 && (
              <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Orçamentos Recebidos ({receivedQuotes.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {receivedQuotes.map((quote) => (
                    <div key={quote.id} className="bg-white dark:bg-background-dark border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-xs font-black uppercase text-slate-900 dark:text-white">{quote.supplier_name}</p>
                        <p className="text-[9px] font-bold text-slate-500 tracking-wider">Prazo: {quote.deadline_days} dias • {new Date(quote.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">R$ {parseFloat(quote.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <button
                          onClick={() => setEditForm({ ...editForm, costValue: parseFloat(quote.value) })}
                          className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors underline"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="size-16 bg-accent-error/10 text-accent-error rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
              <span className="material-symbols-outlined text-3xl font-black">delete_forever</span>
            </div>
            <div>
              <h3 className="text-base font-black uppercase italic mb-1 tracking-tighter">Apagar esta OS?</h3>
              <p className="text-[10px] text-slate-500 font-medium">Esta ação é permanente e removerá todos os anexos vinculados.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmDelete}
                className="w-full h-12 bg-accent-error text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-accent-error/20 text-xs hover:bg-accent-error/90"
              >
                Sim, Excluir
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full h-10 text-slate-400 font-bold uppercase text-[9px] hover:text-slate-600">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-24 md:hidden"></div>
    </div>
  );
};

export default OSControl;
