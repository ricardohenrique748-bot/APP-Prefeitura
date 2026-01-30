
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface UserManagementProps {
  onBack: () => void;
  currentUserRole: 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'MOTORISTA';
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack, currentUserRole }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'OPERADOR' as 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'MOTORISTA',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('app_users').select('*').order('name');
      if (error) throw error;
      if (data) {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      role: currentUserRole === 'GESTOR' ? 'MOTORISTA' : 'OPERADOR',
      status: 'ACTIVE'
    });
    setIsAdding(true);
  };

  const openEditModal = (user: User) => {
    if (currentUserRole === 'GESTOR' && (user.role === 'ADMIN' || user.role === 'GESTOR')) {
      alert("Você não tem permissão para editar este perfil.");
      return;
    }
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role as any,
      status: user.status
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAdding) {
        const { error } = await supabase.from('app_users').insert([{
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          avatar: `https://ui-avatars.com/api/?name=${formData.name}&background=1754cf&color=fff`
        }]);
        if (error) throw error;
        setIsAdding(false);
      } else if (editingUser) {
        const { error } = await supabase.from('app_users').update({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        }).eq('id', editingUser.id);
        if (error) throw error;
        setEditingUser(null);
      }
      fetchUsers();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro ao salvar usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      if (error) throw error;
      fetchUsers();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      alert("Erro ao deletar usuário.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-indigo-500/10 text-indigo-500';
      case 'GESTOR': return 'bg-primary/10 text-primary';
      case 'OPERADOR': return 'bg-accent-success/10 text-accent-success';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-4 min-h-screen pb-24 relative">
      <div className="p-4 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-4 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span> Voltar
        </button>

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input
              type="text"
              placeholder="Buscar nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button
            onClick={openAddModal}
            className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading && users.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 opacity-40">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest italic">Sincronizando Usuários...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Usuários no Sistema ({filteredUsers.length})</h3>
            </div>

            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="size-12 rounded-xl object-cover border border-slate-100 dark:border-slate-700" alt={user.name} />
                        <div className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-white dark:border-card-dark ${user.status === 'ACTIVE' ? 'bg-accent-success' : 'bg-slate-400'}`}></div>
                      </div>
                      <div>
                        <h2 className="text-base font-black tracking-tight leading-none mb-1">{user.name}</h2>
                        <p className="text-[10px] text-slate-500 font-bold lowercase tracking-wider">{user.email}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {(currentUserRole === 'ADMIN' || (currentUserRole === 'GESTOR' && user.role !== 'ADMIN' && user.role !== 'GESTOR')) && (
                        <>
                          <button
                            onClick={() => openEditModal(user)}
                            className="size-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary active:scale-90 transition-all"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="size-9 rounded-lg flex items-center justify-center bg-accent-error/10 text-accent-error active:scale-90 transition-all"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {(isAdding || editingUser) && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                {isAdding ? 'Novo Usuário' : 'Editar Usuário'}
              </h3>
              <button
                onClick={() => { setIsAdding(false); setEditingUser(null); }}
                className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="joao@smarttech.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Perfil de Acesso</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    disabled={currentUserRole === 'GESTOR'}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none disabled:opacity-50"
                  >
                    {currentUserRole === 'ADMIN' && (
                      <>
                        <option value="ADMIN">Administrador</option>
                        <option value="GESTOR">Gestor</option>
                      </>
                    )}
                    <option value="OPERADOR">Operador</option>
                    <option value="MOTORISTA">Motorista</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingUser(null); }}
                  className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl uppercase tracking-widest text-[11px]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 uppercase tracking-widest text-[11px] disabled:opacity-50"
                >
                  {loading ? '...SALVANDO' : (isAdding ? 'CADASTRAR' : 'SALVAR')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white dark:bg-card-dark rounded-3xl p-8 w-full max-w-xs text-center space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="size-20 bg-accent-error/10 text-accent-error rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-4xl">person_remove</span>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic mb-2 tracking-tighter">Remover Usuário?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Este usuário perderá o acesso imediato ao Smart Tech.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={loading}
                className="w-full h-14 bg-accent-error text-white font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-accent-error/30 disabled:opacity-50"
              >
                {loading ? 'REMOVENDO...' : 'Sim, Remover'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full h-12 text-slate-400 font-bold uppercase text-[9px] hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
