
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
  onLogin: (user: User) => void;
  isDarkMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDarkMode = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('smart_tech_remember_email');
    const savedRemember = localStorage.getItem('smart_tech_remember_me') === 'true';
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(savedRemember);
    }
  }, []);

  const loginUser = (user: User) => {
    if (rememberMe) {
      localStorage.setItem('smart_tech_remember_email', email);
      localStorage.setItem('smart_tech_remember_me', 'true');
    } else {
      localStorage.removeItem('smart_tech_remember_email');
      localStorage.removeItem('smart_tech_remember_me');
    }
    onLogin(user);
  };



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Logic for Admin (Ricardo)
    if ((email === 'ricardo.luz@prefeitura.gov.br' || email === 'ricardo.luz@eunaman.com.br') && password === '123456') {
      const adminUser: User = {
        id: '1',
        name: 'Ricardo Luz',
        email: email,
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"
      };
      loginUser(adminUser);
      return;
    }

    // Logic for Admin (Pedro)
    if (email === 'Roosevelt92@gmail.com' && password === '123456') {
      const adminUser: User = {
        id: '3',
        name: 'Pedro',
        email: email,
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"
      };
      loginUser(adminUser);
      return;
    }

    // Database Login
    try {
      // Check if user exists in app_users
      const { data, error: dbError } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', email)
        .single();

      if (dbError && dbError.code !== 'PGRST116') {
        console.error("Login Error:", dbError);
        setError('Erro de conexão com o servidor.');
        setLoading(false);
        return;
      }

      if (data) {
        // User found. Check password.
        // Currently utilizing default password '123456' or '123' as per previous rules, 
        // until a proper password field is implemented in app_users.
        // Assuming password is the input 'password'

        // TEMPORARY: Allow '123456' or '123' or any password if we don't have a column?
        // Let's enforce '123456' for now as the hardcoded ones use it.
        if (password === '123456' || password === '123') {
          const dbUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as any,
            status: data.status as any,
            avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.name}&background=random`,
            costCenter: data.cost_center
          };

          if (dbUser.status !== 'ACTIVE') {
            setError('Usuário inativo. Contate o suporte.');
            setLoading(false);
            return;
          }

          loginUser(dbUser);
          return;
        } else {
          setError('Senha incorreta.');
          setLoading(false);
          return;
        }
      }

      setError('E-mail não encontrado ou senha incorreta.');
      setLoading(false);

    } catch (err) {
      console.error("Login Exception:", err);
      setError('Ocorreu um erro ao tentar entrar.');
      setLoading(false);
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setRecoverySent(true);
      setLoading(false);
    }, 1500);
  };

  const resetViews = () => {
    setIsForgotPassword(false);
    setRecoverySent(false);
    setRecoveryEmail('');
    setError('');
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background-light dark:bg-background-dark items-center justify-center p-4 md:p-8 pb-24 transition-colors duration-300">
      <div className="w-full max-w-sm space-y-10 animate-in fade-in duration-500 md:scale-110">
        <div className="flex flex-col items-center gap-0">
          <div className="w-full flex items-center justify-center py-6">
            <img
              src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
              alt="SMART TECH Logo"
              className="w-48 md:w-64 h-auto object-contain mx-auto"
            />
          </div>
          <div className="text-center mt-1">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Sistemas de Gestão Operacional</p>
          </div>
        </div>

        {!isForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail Corporativo</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@prefeitura.gov.br" className="w-full h-12 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 px-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all text-sm shadow-sm" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Senha</label>
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-black text-primary uppercase tracking-tighter hover:underline">Esqueci minha senha</button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full h-12 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 px-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all text-sm shadow-sm" required />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`size-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-primary border-primary shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark'}`}>
                  {rememberMe && <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>}
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">Lembrar informações</span>
              </label>
            </div>

            {error && <p className="text-center text-xs font-bold text-accent-error uppercase tracking-tighter">{error}</p>}

            <div className="pt-1">
              <button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                  <>
                    <span className="uppercase tracking-widest text-xs italic">Acessar Sistema</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {!recoverySent ? (
              <form onSubmit={handleRecovery} className="space-y-5">
                <div className="text-center space-y-2 mb-4">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Recuperar Senha</h3>
                  <p className="text-xs text-slate-500 font-medium px-4">Informe seu e-mail corporativo para redefinição.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail de Cadastro</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                    <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="seu.email@prefeitura.gov.br" className="w-full h-12 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 px-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all text-sm shadow-sm" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  {loading ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="uppercase tracking-widest text-xs italic">Enviar Link</span>}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="size-16 bg-accent-success/10 text-accent-success rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="material-symbols-outlined text-3xl font-black">mark_email_read</span>
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter">E-mail Enviado!</h3>
              </div>
            )}
            <button onClick={resetViews} className="w-full py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center justify-center gap-2 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar para o Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
