import React from 'react';
import { useApp, ActivePage } from '../context/AppContext';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Package,
  Boxes,
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Settings,
  QrCode,
  Zap,
  Store,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  Smartphone
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    activeCompany,
    orders,
    products,
    currentRole,
    wholesaleOrders,
    canAccessWholesale,
    canAccessDistribuidora,
    activePlan,
    switchCompanyPlan
  } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;
  const pendingWholesaleCount = wholesaleOrders.filter(o => o.status === 'confirmado' || o.status === 'separacao').length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // Build nav items dynamically based on plan
  const navItems: {
    id: ActivePage;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    badgeText?: string;
    adminOnly?: boolean;
    wholesaleOnly?: boolean;
    highlight?: boolean;
  }[] = [];

  // Wholesale Dedicated Plan Items
  if (activePlan.id === 'atacado') {
    navItems.push(
      {
        id: 'wholesale',
        label: 'Pedidos de Atacado (B2B)',
        icon: <Building2 className="w-4 h-4 text-purple-400" />,
        badge: pendingWholesaleCount > 0 ? pendingWholesaleCount : undefined,
        badgeColor: 'bg-purple-500 text-white',
        highlight: true
      },
      {
        id: 'stock',
        label: 'Estoque do Galpão',
        icon: <Boxes className="w-4 h-4" />,
        badge: lowStockCount > 0 ? lowStockCount : undefined,
        badgeColor: 'bg-rose-500 text-white',
        adminOnly: true
      },
      { id: 'weekly_report', label: 'Relatório Financeiro B2B', icon: <TrendingUp className="w-4 h-4" />, adminOnly: true },
      { id: 'terminal_pos', label: 'Modo Maquininha (Ton Verde)', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
      { id: 'statement', label: 'Extrato dos Meses Passados', icon: <FileText className="w-4 h-4 text-emerald-400" />, adminOnly: true },
      { id: 'employees', label: 'Operadores de Venda', icon: <Users className="w-4 h-4" />, adminOnly: true },
      { id: 'subscription', label: 'Minha Assinatura (R$ 120)', icon: <CreditCard className="w-4 h-4" />, adminOnly: true },
      { id: 'settings', label: 'Configurações & PIX', icon: <Settings className="w-4 h-4" />, adminOnly: true }
    );
  } else {
    // Distribuidora OR Combo Plan (R$ 180)
    navItems.push(
      { id: 'dashboard', label: 'Dashboard Geral', icon: <LayoutDashboard className="w-4 h-4" /> }
    );

    // Integrated Wholesale Item for Combo Plan
    if (activePlan.id === 'distribuidora_atacado') {
      navItems.push({
        id: 'wholesale',
        label: 'Pedidos de Atacado (B2B)',
        icon: <Building2 className="w-4 h-4 text-amber-400" />,
        badge: pendingWholesaleCount > 0 ? pendingWholesaleCount : undefined,
        badgeColor: 'bg-amber-400 text-slate-950 font-black',
        badgeText: 'B2B',
        highlight: true
      });
    } else {
      // Plano Distribuidora (R$ 80) - Wholesale with upgrade hint
      navItems.push({
        id: 'wholesale',
        label: 'Pedidos Atacado (B2B)',
        icon: <Building2 className="w-4 h-4 text-slate-400" />,
        badgeText: 'Plano R$180',
        badgeColor: 'bg-purple-900/80 text-purple-300 border border-purple-500/30'
      });
    }

    navItems.push(
      {
        id: 'orders',
        label: 'Pedidos Varejo & Delivery',
        icon: <ClipboardList className="w-4 h-4" />,
        badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        badgeColor: 'bg-amber-500 text-slate-950'
      },
      { id: 'pos', label: 'PDV Vendas (Funcionário)', icon: <Store className="w-4 h-4 text-amber-400" /> },
      { id: 'terminal_pos', label: 'Modo Maquininha (Ton Verde)', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
      { id: 'tables', label: 'Gestão de Mesas', icon: <UtensilsCrossed className="w-4 h-4" /> },
      { id: 'menu', label: 'Cardápio Digital (Cliente)', icon: <QrCode className="w-4 h-4 text-amber-400" /> },
      { id: 'products', label: 'Produtos & Categorias', icon: <Package className="w-4 h-4" />, adminOnly: true },
      {
        id: 'stock',
        label: activePlan.id === 'distribuidora_atacado' ? 'Estoque Varejo + Atacado' : 'Controle de Estoque',
        icon: <Boxes className="w-4 h-4" />,
        badge: lowStockCount > 0 ? lowStockCount : undefined,
        badgeColor: 'bg-rose-500 text-white',
        adminOnly: true
      },
      { id: 'daily_report', label: 'Relatório Diário', icon: <BarChart3 className="w-4 h-4" />, adminOnly: true },
      { id: 'weekly_report', label: 'Relatório Semanal', icon: <TrendingUp className="w-4 h-4" />, adminOnly: true },
      { id: 'statement', label: 'Extrato dos Meses Passados', icon: <FileText className="w-4 h-4 text-emerald-400" />, adminOnly: true },
      { id: 'employees', label: 'Funcionários & Acessos', icon: <Users className="w-4 h-4" />, adminOnly: true },
      { id: 'subscription', label: 'Minha Assinatura', icon: <CreditCard className="w-4 h-4" />, adminOnly: true },
      { id: 'settings', label: 'Configurações & PIX', icon: <Settings className="w-4 h-4" />, adminOnly: true }
    );
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Company Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg font-bold shrink-0">
            🍻
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white truncate leading-tight">
              {activeCompany.tradeName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-slate-400 font-medium">BebêAqui Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          if (item.adminOnly && currentRole === 'staff') {
            return null; // hide admin items for staff
          }

          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                    isActive ? 'bg-slate-950 text-amber-400' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.badgeText && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono shrink-0 ${
                    isActive ? 'bg-slate-950 text-amber-400' : item.badgeColor
                  }`}
                >
                  {item.badgeText}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Plan Status & Interactive Plan Switcher */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-200 truncate">{activePlan.name}</span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {activeCompany.subscriptionStatus === 'active' ? 'Ativo' : activeCompany.subscriptionStatus}
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono text-xs">
            <span className="text-slate-400 text-[10px]">Mensalidade:</span>
            <span className="font-bold text-amber-400">
              R$ {activePlan.price.toFixed(2).replace('.', ',')}/mês
            </span>
          </div>

          {/* Interactive 3 Plans Switcher */}
          <div className="pt-1.5 border-t border-slate-700/60">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
              Simular Métodos de Assinatura:
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  switchCompanyPlan('distribuidora');
                  setActivePage('dashboard');
                }}
                title="Plano Distribuidora (R$ 80/mês)"
                className={`py-1 px-1 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                  activePlan.id === 'distribuidora'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                R$ 80
                <span className="block text-[8px] font-normal">Distrib.</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchCompanyPlan('atacado');
                  setActivePage('wholesale');
                }}
                title="Plano Atacado (R$ 120/mês)"
                className={`py-1 px-1 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                  activePlan.id === 'atacado'
                    ? 'bg-purple-500 text-white font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                R$ 120
                <span className="block text-[8px] font-normal">Atacado</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchCompanyPlan('distribuidora_atacado');
                }}
                title="Plano Distribuidora + Atacado (R$ 180/mês) - Completo Integrado"
                className={`py-1 px-1 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                  activePlan.id === 'distribuidora_atacado'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                R$ 180
                <span className="block text-[8px] font-normal">Combo</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setActivePage('subscription')}
            className="w-full pt-1 text-[10px] font-medium text-amber-400 hover:text-amber-300 hover:underline flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Gerenciar Planos & PIX</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
