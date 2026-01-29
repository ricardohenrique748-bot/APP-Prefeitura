
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('fleet_master_remember_email');
    const savedRemember = localStorage.getItem('fleet_master_remember_me') === 'true';
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(savedRemember);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if ((email === 'ricardo.luz@prefeitura.gov.br' || email === 'ricardo.luz@eunaman.com.br') && password === '123456') {
        if (rememberMe) {
          localStorage.setItem('fleet_master_remember_email', email);
          localStorage.setItem('fleet_master_remember_me', 'true');
        } else {
          localStorage.removeItem('fleet_master_remember_email');
          localStorage.removeItem('fleet_master_remember_me');
        }
        onLogin();
      } else {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
      }
    }, 1200);
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
    <div className="flex flex-col h-full min-h-screen bg-background-light dark:bg-background-dark items-center justify-center p-8 transition-colors duration-300">
      <div className="w-full max-w-sm space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-6">
          <div className="size-20 bg-primary rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-12">
            <span className="material-symbols-outlined text-4xl text-white -rotate-12 font-black">local_shipping</span>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Fleet Master</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Sistemas de Gestão Operacional</p>
          </div>
        </div>

        {!isForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail Corporativo</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@prefeitura.gov.br" className="w-full h-14 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 px-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all text-sm shadow-sm" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Senha</label>
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-black text-primary uppercase tracking-tighter hover:underline">Esqueci minha senha</button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full h-14 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 px-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all text-sm shadow-sm" required />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`size-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-primary border-primary shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark'}`}>
                  {rememberMe && <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>}
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">Lembrar informações</span>
              </label>
            </div>

            {error && <p className="text-center text-xs font-bold text-accent-error uppercase tracking-tighter">{error}</p>}

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                  <>
                    <span className="uppercase tracking-widest text-sm italic">Acessar Sistema</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {!recoverySent ? (
              <form onSubmit={handleRecovery} className="space-y-6">
                <div className="text-center space-y-2 mb-4">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Recuperar Senha</h3>
                  <p className="text-xs text-slate-500 font-medium px-4">Informe seu e-mail corporativo para redefinição.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail de Cadastro</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                    <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="seu.email@prefeitura.gov.br" className="w-full h-14 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 px-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all text-sm shadow-sm" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="uppercase tracking-widest text-sm italic">Enviar Link</span>}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="size-20 bg-accent-success/10 text-accent-success rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="material-symbols-outlined text-4xl font-black">mark_email_read</span>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">E-mail Enviado!</h3>
              </div>
            )}
            <button onClick={resetViews} className="w-full py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center justify-center gap-2 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar para o Login
            </button>
          </div>
        )}
        <div className="text-center">
          <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-wider italic">Criado por: Ricardo Luz • (99) 91754-2322</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
