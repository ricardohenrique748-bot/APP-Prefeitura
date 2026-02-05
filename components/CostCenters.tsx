import React, { useState, useMemo } from 'react';
import { CostCenter } from '../App';
import { supabase } from '../services/supabase';

interface CostCentersProps {
  onBack: () => void;
  centers: (CostCenter & { consumedValue: number; consumedStr: string; availableStr: string; progress: number; warning: boolean })[];
  setCenters: React.Dispatch<React.SetStateAction<CostCenter[]>>;
  isAdmin?: boolean;
}

const CostCenters: React.FC<CostCentersProps> = ({ onBack, centers, setCenters, isAdmin = false }) => {
  const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    budget: ''
  });

  // Cálculo dos Cabeçalhos Dinâmicos
  const totals = useMemo(() => {
    const budgetTotal = centers.reduce((sum, c) => sum + c.budget, 0);
    const consumedTotal = centers.reduce((sum, c) => sum + c.consumedValue, 0);

    const formatValue = (val: number) => {
      if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
      return `R$ ${val.toLocaleString('pt-BR')}`;
    };

    return {
      budget: formatValue(budgetTotal),
      consumed: formatValue(consumedTotal)
    };
  }, [centers]);

  const openAddModal = () => {
    setFormData({ name: '', company: '', budget: '' });
    setIsAdding(true);
  };

  const openEditModal = (center: CostCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      company: center.company,
      budget: center.budget.toString()
    });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('cost_centers').delete().eq('id', id);
      if (error) throw error;
      setCenters(prev => prev.filter(c => c.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir centro de custo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const budgetVal = parseFloat(formData.budget) || 0;

    try {
      if (isAdding) {
        const { data, error } = await supabase.from('cost_centers').insert([{
          name: formData.name,
          company: formData.company,
          budget: budgetVal,
          color: 'bg-primary'
        }]).select();

        if (error) throw error;

        if (data) {
          const newCenter: CostCenter = {
            id: data[0].id.toString(),
            name: data[0].name,
            company: data[0].company,
            budget: data[0].budget,
            color: data[0].color
          };
          setCenters(prev => [newCenter, ...prev]);
        }
      } else if (editingCenter) {
        const { error } = await supabase.from('cost_centers').update({
          name: formData.name,
          company: formData.company,
          budget: budgetVal
        }).eq('id', editingCenter.id);

        if (error) throw error;

        setCenters(prev => prev.map(c =>
          c.id === editingCenter.id
            ? { ...c, name: formData.name, company: formData.company, budget: budgetVal }
            : c
        ));
      }
      closeModals();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar centro de custo.");
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setEditingCenter(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 min-h-screen pb-20 relative">
      <div className="p-4 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-4 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span> Voltar
        </button>
        <div className="flex gap-4">
          <div className="flex-1 bg-slate-50 dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Orçamento Total</p>
            <p className="text-xl font-black italic">{totals.budget}</p>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Total Consumido</p>
            <p className="text-xl font-black italic text-primary">{totals.consumed}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Centros Ativos ({centers.length})</h3>
          {isAdmin && (
            <button onClick={openAddModal} className="text-primary text-[10px] font-bold bg-primary/10 px-4 py-2 rounded-xl uppercase active:scale-95 transition-transform">+ Novo Centro</button>
          )}
        </div>

        {centers.map((cc) => (
          <div key={cc.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{cc.id}</span>
                    <h2 className="text-base font-black uppercase tracking-tight">{cc.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">{cc.company}</p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(cc)} className="size-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onClick={() => setShowDeleteConfirm(cc.id)} className="size-9 rounded-xl flex items-center justify-center bg-accent-error/10 text-accent-error active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                  <span className="text-slate-400">Progresso Orçamentário</span>
                  <span className={cc.warning ? 'text-accent-error' : 'text-primary'}>{cc.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${cc.color} rounded-full transition-all duration-700`} style={{ width: `${cc.progress}%` }}></div>
                </div>
                <div className="flex justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Consumido</span>
                    <span className="text-sm font-black italic">R$ {cc.consumedStr}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Disponível</span>
                    <span className={`text-sm font-black italic ${cc.warning ? 'text-accent-error' : 'text-accent-success'}`}>R$ {cc.availableStr}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingCenter) && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">{isAdding ? 'Novo Centro de Custo' : 'Editar Centro'}</h3>
              <button onClick={closeModals} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nome do Centro</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Empresa</label>
                <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Orçamento (R$)</label>
                <input type="number" required value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModals} className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl uppercase text-[10px] tracking-widest">CANCELAR</button>
                <button type="submit" disabled={loading} className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 uppercase text-[10px] tracking-widest disabled:opacity-50">{loading ? 'SALVANDO...' : (isAdding ? 'CADASTRAR' : 'SALVAR')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-8 w-full max-w-xs text-center space-y-6 shadow-2xl">
            <div className="size-20 bg-accent-error/10 text-accent-error rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic mb-2">Excluir Centro?</h3>
              <p className="text-xs text-slate-500 font-medium">Esta ação não pode ser desfeita e removerá todos os vínculos operacionais.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleDelete(showDeleteConfirm)} disabled={loading} className="w-full h-14 bg-accent-error text-white font-black rounded-2xl uppercase tracking-widest disabled:opacity-50">{loading ? 'EXCLUINDO...' : 'Sim, Excluir'}</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="w-full h-12 text-slate-400 font-bold uppercase text-[10px]">Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCenters;
