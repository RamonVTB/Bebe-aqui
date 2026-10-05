import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Boxes,
  UtensilsCrossed,
  QrCode,
  Smartphone,
  ChevronRight,
  Store,
  DollarSign
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActivePage, setCurrentRole, setActiveCompanyId, companies } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/hero_beverages_showcase_1790213443501.jpg"
            alt="Bebidas BebêAqui"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>A Plataforma SaaS Oficial de Distribuidoras e Bares</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
                🍻 BebêAqui
                <span className="block text-amber-400 text-3xl sm:text-4xl mt-2 font-bold">
                  Seu pedido de bebidas, fácil e rápido.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                O sistema web completo para distribuidoras de bebidas, adegas e bares. Gerencie pedidos em tempo real, estoque, mesas, cardápio digital com QR Code e relatórios de vendas em um único lugar.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActivePage('register')}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
                >
                  <span>Criar Minha Distribuidora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (companies.length > 0) {
                      setActiveCompanyId(companies[0].id);
                    }
                    setCurrentRole('admin');
                    setActivePage('dashboard');
                  }}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Acessar Painel Demo</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActivePage('menu');
                  }}
                  className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-semibold text-sm flex items-center gap-2 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Ver Cardápio do Cliente</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Setup em menos de 2 minutos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cardápio Digital sem app</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>R$ 70,00/mês sem taxa oculta</span>
                </div>
              </div>
            </div>

            {/* Visual SaaS Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-1.5 border border-slate-700/80 shadow-2xl">
                <div className="bg-slate-950 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">bebeaqui.com.br/painel</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Vendas de Hoje</p>
                        <p className="text-xl font-bold font-mono text-emerald-400">R$ 2.480,50</p>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-[10px] text-slate-400">Pedidos Hoje</p>
                        <p className="text-base font-bold font-mono text-white">38 pedidos</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-[10px] text-slate-400">Mesas Ativas</p>
                        <p className="text-base font-bold font-mono text-amber-400">6 ocupadas</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                      <span>Plano BebêAqui Ativo</span>
                      <span className="font-bold">R$ 70,00/mês</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tudo o que sua distribuidora de bebidas precisa para crescer
            </h2>
            <p className="text-sm text-slate-400">
              Desenvolvido com foco total na experiência do usuário para donos, funcionários e clientes finais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Cardápio Digital Inteligente</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seus clientes pedem pelo smartphone sem instalar nada. Suporte a delivery com endereço e pedidos na mesa com QR Code.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Gestão Visual de Mesas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acompanhe o mapa de mesas do salão em tempo real. Veja mesas livres, ocupadas e pedidos de conta com facilidade.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Controle de Estoque & Alertas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Baixa automática de estoque a cada venda, controle de compras, saídas por avaria e alertas automáticos de estoque crítico.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Relatórios Diários e Semanais</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gráficos claros de faturamento diário e semanal, produtos mais vendidos, ticket médio e horários de maior movimento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">PIX & Pagamentos Flexíveis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cadastre sua chave PIX para receber direto na sua conta bancária sem intermediários, além de cartão e dinheiro com troco.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multiempresa & Filiais</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada distribuidora possui seu próprio ambiente isolado, catálogo exclusivo, relatórios e equipe cadastrada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Preview Banner */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Preço Simples e Transparente</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white">
              Planos completos sob medida a partir de apenas <span className="text-amber-400">R$ 80,00/mês</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Sem limite de produtos cadastrados, sem porcentagem sobre suas vendas e com todos os relatórios liberados.
            </p>
          </div>

          <div>
            <button
              onClick={() => setActivePage('plans')}
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Conhecer os Detalhes do Plano</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-slate-800/80">
            {/* Column 1: Brand */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <span className="text-xl">🍻</span>
                <span>BebêAqui Distribuidora & Atacado</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Plataforma completa para gestão de distribuidoras de bebidas, adegas, atacado B2B e cardápio digital com QR Code.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <button onClick={() => setActivePage('plans')} className="hover:text-amber-400 transition-colors">Planos & Assinaturas</button>
              <button onClick={() => setActivePage('menu')} className="hover:text-amber-400 transition-colors">Ver Cardápio Digital Modelo</button>
              <button onClick={() => setActivePage('login')} className="hover:text-amber-400 transition-colors">Área da Distribuidora (Login)</button>
              <button onClick={() => setActivePage('register')} className="text-amber-400 hover:underline font-semibold">Cadastrar Minha Distribuidora</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 2026 BebêAqui SaaS. Todos os direitos reservados.</p>
            <p>Seu pedido de bebidas, fácil e rápido.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
