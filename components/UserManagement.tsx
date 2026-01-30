
import React, { useState } from 'react';
import { User } from '../types';

interface UserManagementProps {
  onBack: () => void;
  currentUserRole: 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'MOTORISTA';
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack, currentUserRole }) => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Ricardo Luz', email: 'ricardo.luz@prefeitura.gov.br', role: 'ADMIN', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' },
    { id: '2', name: 'Marcos Silva', email: 'marcos.silva@prefeitura.gov.br', role: 'GESTOR', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
    { id: '3', name: 'Ana Oliveira', email: 'ana.o@prefeitura.gov.br', role: 'OPERADOR', status: 'INACTIVE', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: '4', name: 'Claudio J.', email: 'claudio.j@prefeitura.gov.br', role: 'MOTORISTA', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
  ]);

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
    // Gestores não podem editar Admins ou outros Gestores
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        avatar: `https://ui-avatars.com/api/?name=${formData.name}&background=1754cf&color=fff`
      };
      setUsers([newUser, ...users]);
      setIsAdding(false);
    } else if (editingUser) {
      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, ...formData } : u
      ));
      setEditingUser(null);
    }
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setShowDeleteConfirm(null);
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

      {/* Users List */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Usuários Cadastrados ({filteredUsers.length})</h3>
        </div>

        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={user.avatar} className="size-12 rounded-xl object-cover border border-slate-100 dark:border-slate-700" alt={user.name} />
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
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingUser) && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                {isAdding ? 'Novo Usuário' : 'Editar Usuário'}
              </h3>
              <button onClick={() => { setIsAdding(false); setEditingUser(null); }} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="joao@empresa.com.br"
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
                  className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 uppercase tracking-widest text-[11px]"
                >
                  {isAdding ? 'CADASTRAR' : 'SALVAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-8 w-full max-w-xs text-center space-y-6 shadow-2xl">
            <div className="size-20 bg-accent-error/10 text-accent-error rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-4xl">person_remove</span>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic mb-2">Remover Usuário?</h3>
              <p className="text-xs text-slate-500 font-medium">Este usuário perderá o acesso imediato ao sistema.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="w-full h-14 bg-accent-error text-white font-black rounded-2xl uppercase tracking-widest"
              >
                Sim, Remover
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full h-12 text-slate-400 font-bold uppercase text-[10px]"
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
