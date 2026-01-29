
import React, { useState } from 'react';
import { Supplier } from '../types';

interface SupplierManagementProps {
  onBack: () => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ onBack }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'Peças & Cia Ltda', document: '12.345.678/0001-90', category: 'PEÇAS', contact: '(11) 98765-4321', email: 'vendas@pecascia.com', status: 'ACTIVE' },
    { id: '2', name: 'Posto Rota 66', document: '98.765.432/0001-10', category: 'COMBUSTÍVEL', contact: '(11) 91234-5678', email: 'financeiro@rota66.com', status: 'ACTIVE' },
    { id: '3', name: 'Mecânica Express', document: '11.222.333/0001-44', category: 'SERVIÇOS', contact: '(11) 90000-0000', email: 'contato@mecanicaexpress.com', status: 'INACTIVE' },
    { id: '4', name: 'Borracharia Central', document: '55.666.777/0001-88', category: 'PNEUS', contact: '(11) 97777-6666', email: 'pneus@central.com', status: 'ACTIVE' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    category: 'PEÇAS' as Supplier['category'],
    contact: '',
    email: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.document.includes(searchTerm)
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const newSupplier: Supplier = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      setSuppliers([newSupplier, ...suppliers]);
      setIsAdding(false);
    } else if (editingSupplier) {
      setSuppliers(suppliers.map(s => 
        s.id === editingSupplier.id ? { ...s, ...formData } : s
      ));
      setEditingSupplier(null);
    }
  };

  const getCategoryStyle = (cat: Supplier['category']) => {
    switch (cat) {
      case 'PEÇAS': return 'bg-amber-500/10 text-amber-500';
      case 'COMBUSTÍVEL': return 'bg-primary/10 text-primary';
      case 'SERVIÇOS': return 'bg-indigo-500/10 text-indigo-500';
      case 'PNEUS': return 'bg-accent-success/10 text-accent-success';
    }
  };

  return (
    <div className="space-y-4 min-h-screen pb-24 relative">
      {/* Sticky Header */}
      <div className="p-4 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-4 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span> Voltar
        </button>
        
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button 
            onClick={() => {
              setFormData({ name: '', document: '', category: 'PEÇAS', contact: '', email: '', status: 'ACTIVE' });
              setIsAdding(true);
            }}
            className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95"
          >
            <span className="material-symbols-outlined">add_business</span>
          </button>
        </div>
      </div>

      {/* Supplier List */}
      <div className="p-4 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Fornecedores Cadastrados ({filteredSuppliers.length})</h3>
        
        {filteredSuppliers.map((s) => (
          <div key={s.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">storefront</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight leading-none mb-1">{s.name}</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.document}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getCategoryStyle(s.category)}`}>
                      {s.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingSupplier(s); setFormData(s); }} className="size-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button onClick={() => setShowDeleteConfirm(s.id)} className="size-9 rounded-lg flex items-center justify-center bg-accent-error/10 text-accent-error active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3 mt-1">
                <div className="flex items-center gap-4">
                  <a href={`tel:${s.contact.replace(/\D/g,'')}`} className="flex items-center gap-1 text-[10px] text-primary font-bold">
                    <span className="material-symbols-outlined text-sm">call</span> Ligar
                  </a>
                  <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                    <span className="material-symbols-outlined text-sm">alternate_email</span> E-mail
                  </a>
                </div>
                <div className={`size-2.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-accent-success' : 'bg-slate-400'}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {(isAdding || editingSupplier) && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-full overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{isAdding ? 'Novo Fornecedor' : 'Editar Fornecedor'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingSupplier(null); }} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nome Fantasia</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">CNPJ</label>
                  <input required type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} placeholder="00.000.000/0001-00" className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-xs font-mono outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Categoria</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary appearance-none">
                    <option value="PEÇAS">PEÇAS</option>
                    <option value="SERVIÇOS">SERVIÇOS</option>
                    <option value="COMBUSTÍVEL">COMBUSTÍVEL</option>
                    <option value="PNEUS">PNEUS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail Corporativo</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Telefone / Whats</label>
                  <input required type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary">
                    <option value="ACTIVE">ATIVO</option>
                    <option value="INACTIVE">INATIVO</option>
                  </select>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest text-[11px]">
                  {isAdding ? 'CADASTRAR FORNECEDOR' : 'SALVAR ALTERAÇÕES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-8 w-full max-w-xs text-center space-y-6 shadow-2xl">
            <div className="size-20 bg-accent-error/10 text-accent-error rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-4xl">domain_disabled</span>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic mb-2">Remover Fornecedor?</h3>
              <p className="text-xs text-slate-500 font-medium">Iso removerá os dados de contato, mas o histórico de transações será mantido.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setSuppliers(suppliers.filter(s => s.id !== showDeleteConfirm)); setShowDeleteConfirm(null); }} className="w-full h-14 bg-accent-error text-white font-black rounded-2xl uppercase tracking-widest">Remover</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="w-full h-12 text-slate-400 font-bold uppercase text-[10px]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
