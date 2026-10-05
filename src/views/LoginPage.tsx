import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, ArrowRight, Store, UserCheck, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setActivePage, setCurrentRole, companies } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, 'admin');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Header Identidade */}
        <div className="text-center space-y-2">
          <div className="inline-block text-5xl mb-2 animate-bounce">
            🍻
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            BebêAqui
          </h1>
          <p className="text-sm font-medium text-amber-400">
            "Seu pedido de bebidas, fácil e rápido."
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                E-mail da Distribuidora
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@distribuidora.com.br"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Entrar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActivePage('register')}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Criar minha distribuidora</span>
            </button>
          </div>

          {/* Registered Distributors Quick Access */}
          {companies.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
                Acessar Distribuidora Cadastrada
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {companies.map(comp => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      setEmail(comp.email);
                      setPassword('••••••••');
                      login(comp.email, 'admin');
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-amber-400 truncate">{comp.tradeName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{comp.email}</p>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono font-medium">Entrar</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentRole('customer');
                setActivePage('menu');
              }}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              Ou acesse o Cardápio como Cliente →
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold">Recuperar Senha</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-1">
                <p className="font-bold">E-mail de recuperação enviado!</p>
                <p className="text-slate-300">Verifique sua caixa de entrada e spam.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Informe o e-mail cadastrado na sua distribuidora para receber o link de redefinição de senha:
                </p>
                <input
                  type="email"
                  required
                  placeholder="seuemail@distribuidora.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Enviar Instruções
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
