import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ChevronDown,
  ShoppingBag,
  User,
  LogOut,
  Sparkles,
  Eye,
  SlidersHorizontal,
  PlusCircle,
  Menu,
  X,
  Trash2,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  onOpenCart?: () => void;
  onOpenAccessibility?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenAccessibility }) => {
  const {
    activePage,
    setActivePage,
    companies,
    deleteCompany,
    activeCompanyId,
    setActiveCompanyId,
    activeCompany,
    currentRole,
    setCurrentRole,
    currentUser,
    logout,
    cartItemCount,
    fontSizeLevel,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    activePlan,
    canAccessWholesale,
    switchCompanyPlan
  } = useApp();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicOrCustomer = activePage === 'landing' || activePage === 'plans' || activePage === 'menu' || activePage === 'order_tracking' || activePage === 'login' || activePage === 'register';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand title (single text element wordmark) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActivePage('landing')}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors focus:outline-none"
            >
              <span className="text-2xl">🍻</span>
              <span className="font-extrabold tracking-tight">BebêAqui</span>
            </button>

            {/* Multi-company selector badge for B2B SaaS */}
            {companies.length > 0 ? (
              <div className="relative">
                <button
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  title="Trocar distribuidora no BebêAqui"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="max-w-[140px] truncate">{activeCompany?.tradeName || 'Distribuidora'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {companyDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setCompanyDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/60 flex items-center justify-between">
                      <span>Distribuidoras Cadastradas</span>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">
                        {companies.length}
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-700/40">
                      {companies.map(comp => (
                        <div
                          key={comp.id}
                          className={`group px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
                            comp.id === activeCompanyId ? 'text-amber-400 font-semibold bg-slate-700/40' : 'text-slate-300'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setActiveCompanyId(comp.id);
                              setCompanyDropdownOpen(false);
                            }}
                            className="flex-1 text-left truncate pr-2 focus:outline-none"
                          >
                            <p className="font-medium truncate">{comp.tradeName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{comp.city} - {comp.state}</p>
                          </button>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {comp.id === activeCompanyId && (
                              <span className="w-2 h-2 rounded-full bg-amber-400" title="Distribuidora ativa" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Deseja remover a distribuidora "${comp.tradeName}" das contas cadastradas?`)) {
                                  deleteCompany(comp.id);
                                }
                              }}
                              className="opacity-60 hover:opacity-100 p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                              title="Excluir esta distribuidora"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-700/60 mt-1">
                      <button
                        onClick={() => {
                          setCompanyDropdownOpen(false);
                          setActivePage('register');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Cadastrar Nova Distribuidora</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActivePage('register')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 transition-colors"
                title="Cadastrar distribuidora"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Cadastrar Distribuidora</span>
              </button>
            )}
          </div>

          {/* Zone 2: Navigation Links (Clean text links with hover effect) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            {isPublicOrCustomer ? (
              <>
                <button
                  onClick={() => setActivePage('landing')}
                  className={`hover:text-white transition-colors ${activePage === 'landing' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Início
                </button>
                <button
                  onClick={() => setActivePage('plans')}
                  className={`hover:text-white transition-colors ${activePage === 'plans' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Planos
                </button>
                <button
                  onClick={() => setActivePage('menu')}
                  className={`hover:text-white transition-colors ${activePage === 'menu' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Cardápio Digital
                </button>
                <button
                  onClick={() => setActivePage('order_tracking')}
                  className={`hover:text-white transition-colors ${activePage === 'order_tracking' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Acompanhar Pedido
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActivePage('dashboard')}
                  className={`hover:text-white transition-colors ${activePage === 'dashboard' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Dashboard
                </button>
                {canAccessWholesale && (
                  <button
                    onClick={() => setActivePage('wholesale')}
                    className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                      activePage === 'wholesale' ? 'text-amber-400 font-bold' : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    <span>📦</span>
                    <span>Pedidos (Atacado)</span>
                  </button>
                )}
                <button
                  onClick={() => setActivePage('terminal_pos')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                    activePage === 'terminal_pos'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300'
                  }`}
                  title="Abrir Modo Maquininha Ton / Smart POS"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Maquininha Ton</span>
                </button>
                <button
                  onClick={() => setActivePage('orders')}
                  className={`hover:text-white transition-colors ${activePage === 'orders' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Pedidos
                </button>
                <button
                  onClick={() => setActivePage('tables')}
                  className={`hover:text-white transition-colors ${activePage === 'tables' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Mesas
                </button>
                <button
                  onClick={() => setActivePage('menu')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-amber-300"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Cardápio</span>
                </button>
                <button
                  onClick={() => setActivePage('daily_report')}
                  className={`hover:text-white transition-colors ${activePage === 'daily_report' ? 'text-amber-400 font-semibold' : ''}`}
                >
                  Relatório Diário
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Primary Actions (Role Switcher, Accessibility, Cart, Auth) */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher for live interactive testing */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 text-slate-200 hover:border-amber-400/50 transition-colors"
                title="Alternar usuário e perfil"
              >
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Usuário:</span>
                <span className="font-semibold text-amber-400 capitalize">
                  {currentRole === 'admin'
                    ? 'Admin Geral'
                    : currentRole === 'admin_distribuidora'
                    ? 'Admin Distribuidora'
                    : currentRole === 'atacado_operator'
                    ? 'Atacado B2B'
                    : currentRole === 'staff'
                    ? 'Funcionário'
                    : 'Cliente'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1.5 z-50 animate-in fade-in"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700/60 mb-1">
                    Selecionar Usuário & Perfil
                  </div>
                  <button
                    onClick={() => {
                      setCurrentRole('admin');
                      switchCompanyPlan('distribuidora_atacado');
                      setActivePage('dashboard');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between ${currentRole === 'admin' ? 'text-amber-400 font-semibold bg-slate-700/50' : 'text-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold">Administrador Geral</p>
                      <p className="text-[10px] text-slate-400">Distribuidora + Atacado</p>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">R$ 180</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('admin_distribuidora');
                      switchCompanyPlan('distribuidora');
                      setActivePage('dashboard');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between ${currentRole === 'admin_distribuidora' ? 'text-amber-400 font-semibold bg-slate-700/50' : 'text-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold flex items-center gap-1">
                        <span>🍻</span>
                        <span>Admin Distribuidora</span>
                      </p>
                      <p className="text-[10px] text-amber-300">Somente Distribuidora</p>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">R$ 80</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('atacado_operator');
                      switchCompanyPlan('atacado');
                      setActivePage('wholesale');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between ${currentRole === 'atacado_operator' ? 'text-purple-400 font-semibold bg-slate-700/50' : 'text-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold flex items-center gap-1">
                        <span>📦</span>
                        <span>Operador de Atacado</span>
                      </p>
                      <p className="text-[10px] text-purple-300">Somente Área de Atacado</p>
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono font-bold">R$ 120</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('staff');
                      setActivePage('orders');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between ${currentRole === 'staff' ? 'text-amber-400 font-semibold bg-slate-700/50' : 'text-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold">Funcionário de Balcão</p>
                      <p className="text-[10px] text-slate-400">Mesas & PDV Distribuidora</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">R$ 80</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('customer');
                      setActivePage('menu');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between ${currentRole === 'customer' ? 'text-amber-400 font-semibold bg-slate-700/50' : 'text-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold">Cliente da Loja</p>
                      <p className="text-[10px] text-slate-400">Cardápio Digital QR</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Mesa</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Font Size Accessibility Buttons (A- / A+) for vision accessibility */}
            <div 
              className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5 shadow-sm"
              title="Acessibilidade: Aumentar ou abaixar as letras para facilitar a leitura"
            >
              <button
                type="button"
                onClick={decreaseFontSize}
                disabled={fontSizeLevel <= -1}
                title="Abaixar as letras (diminuir texto)"
                aria-label="Abaixar as letras"
                className="h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold font-mono text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="font-mono text-xs font-bold">A-</span>
              </button>

              <button
                type="button"
                onClick={resetFontSize}
                title={`Tamanho das letras: ${fontScale}%. Clique para voltar a 100%.`}
                aria-label={`Tamanho atual ${fontScale}%`}
                className="h-7 px-1.5 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer select-none"
              >
                {fontScale}%
              </button>

              <button
                type="button"
                onClick={increaseFontSize}
                disabled={fontSizeLevel >= 3}
                title="Aumentar as letras (melhor visualização para problemas de visão)"
                aria-label="Aumentar as letras"
                className="h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold font-mono text-amber-400 hover:text-amber-300 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="font-mono text-xs font-black">A+</span>
              </button>
            </div>

            {/* Accessibility modal trigger */}
            {onOpenAccessibility && (
              <button
                onClick={onOpenAccessibility}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Mais Recursos de Acessibilidade (Alto Contraste)"
                aria-label="Mais Acessibilidade"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Ver Carrinho"
              aria-label="Carrinho de Compras"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold font-mono">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth / Account */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('subscription')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  title="Minha Assinatura BebêAqui"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plano BebêAqui</span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-white hover:text-amber-400 transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setActivePage('register')}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  Criar Distribuidora
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 border-t border-slate-800 bg-slate-900 space-y-2 animate-in slide-in-from-top-2">
          {/* Mobile accessibility font adjustment */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <span>👁️</span>
              <span>Tamanho das Letras:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={decreaseFontSize}
                disabled={fontSizeLevel <= -1}
                aria-label="Abaixar letras"
                className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white rounded disabled:opacity-30"
              >
                A-
              </button>
              <button
                type="button"
                onClick={resetFontSize}
                className="px-1 text-[10px] font-mono text-amber-400 font-bold"
              >
                {fontScale}%
              </button>
              <button
                type="button"
                onClick={increaseFontSize}
                disabled={fontSizeLevel >= 3}
                aria-label="Aumentar letras"
                className="px-2.5 py-1 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 rounded disabled:opacity-30"
              >
                A+
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs text-slate-400">Distribuidora:</span>
            <span className="text-xs font-semibold text-amber-400">{activeCompany?.tradeName || 'Nenhuma cadastrada'}</span>
          </div>

          <button
            onClick={() => { setActivePage('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Início
          </button>
          <button
            onClick={() => { setActivePage('plans'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            💳 Planos & Assinaturas
          </button>
          {canAccessWholesale && (
            <button
              onClick={() => { setActivePage('wholesale'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm text-purple-300 font-semibold hover:bg-slate-800 flex items-center gap-1.5"
            >
              <span>📦</span>
              <span>Pedidos de Atacado (B2B)</span>
            </button>
          )}
          <button
            onClick={() => { setActivePage('menu'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-amber-400 font-semibold hover:bg-slate-800"
          >
            🍻 Cardápio Digital
          </button>
          <button
            onClick={() => { setActivePage('order_tracking'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Acompanhar Pedido
          </button>

          {currentUser && (
            <>
              <div className="pt-2 border-t border-slate-800 text-xs font-semibold text-slate-400 px-3">
                Administração
              </div>
              <button
                onClick={() => { setActivePage('dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Dashboard
              </button>
              <button
                onClick={() => { setActivePage('orders'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Pedidos
              </button>
              <button
                onClick={() => { setActivePage('tables'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Mesas
              </button>
              <button
                onClick={() => { setActivePage('products'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Produtos & Estoque
              </button>
              <button
                onClick={() => { setActivePage('daily_report'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Relatório Diário
              </button>
              <button
                onClick={() => { setActivePage('weekly_report'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Relatório Semanal
              </button>
              <button
                onClick={() => { setActivePage('subscription'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-amber-400 hover:bg-slate-800"
              >
                Minha Assinatura
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
