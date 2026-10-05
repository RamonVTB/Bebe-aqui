import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionStatus } from '../types';
import {
  CreditCard,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Lock,
  ChevronRight,
  Sliders,
  QrCode,
  Copy,
  Check,
  Loader2,
  FileText
} from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const {
    activeCompany,
    updateSubscriptionStatus,
    addToast,
    activePlan,
    availablePlans,
    switchCompanyPlan,
    setActivePage
  } = useApp();
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [selectedSimStatus, setSelectedSimStatus] = useState<SubscriptionStatus>(activeCompany.subscriptionStatus);
  const [mockCardLastDigits, setMockCardLastDigits] = useState('4892');

  // PIX verification state inside subscription modal
  const [pixModalStatus, setPixModalStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [pixTitularName, setPixTitularName] = useState('');
  const [pixModalErrorMsg, setPixModalErrorMsg] = useState('');

  const PLATFORM_PIX_PHONE = '31975346290';
  const PLATFORM_PIX_PHONE_FORMATTED = '(31) 97534-6290';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PLATFORM_PIX_PHONE);
    setCopiedPix(true);
    addToast('success', 'Chave PIX copiada!', `${PLATFORM_PIX_PHONE_FORMATTED} copiado para transferência.`);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleVerifySubscriptionPix = (forceError = false) => {
    if (!pixTitularName.trim()) {
      addToast('error', 'Nome do titular obrigatório', 'Informe o titular da conta que enviou o Pix.');
      return;
    }

    setPixModalStatus('checking');
    setPixModalErrorMsg('');

    setTimeout(() => {
      if (forceError) {
        setPixModalStatus('error');
        setPixModalErrorMsg(
          `O Banco Central não identificou a transferência de R$ ${activePlan.price.toFixed(2).replace('.', ',')} na chave telefone (31) 97534-6290. Verifique se o PIX foi concluído no seu banco.`
        );
        addToast('error', 'PIX Não Localizado!', `Nenhuma confirmação de R$ ${activePlan.price.toFixed(2).replace('.', ',')} recebida ainda.`);
      } else {
        setPixModalStatus('success');
        updateSubscriptionStatus('active');
        addToast('success', 'PIX Identificado com Sucesso!', `Mensalidade de R$ ${activePlan.price.toFixed(2).replace('.', ',')} quitada e plano 100% liberado!`);
      }
    }, 1800);
  };

  const statusConfig: Record<SubscriptionStatus, { label: string; color: string; badgeBg: string; icon: React.ReactNode; desc: string }> = {
    active: {
      label: 'Ativo',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      desc: 'Sua assinatura está regular e todos os recursos do BebêAqui estão liberados.'
    },
    approved: {
      label: 'Pagamento Aprovado',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      desc: 'Transação confirmada com sucesso pela instituição financeira.'
    },
    pending: {
      label: 'Pagamento Pendente',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/80 border-amber-500/30 text-amber-400',
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      desc: 'Aguardando compensação do pagamento bancário ou PIX.'
    },
    cancelled: {
      label: 'Assinatura Cancelada',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-950/80 border-rose-500/30 text-rose-400',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      desc: 'A assinatura foi cancelada. O acesso permanecerá até o fim do ciclo vigente.'
    },
    expired: {
      label: 'Assinatura Expirada',
      color: 'text-slate-400',
      badgeBg: 'bg-slate-800 border-slate-700 text-slate-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      desc: 'O período da assinatura expirou. Renove para continuar emitindo pedidos.'
    }
  };

  const currentConfig = statusConfig[activeCompany.subscriptionStatus];

  const handleApplySimulation = () => {
    updateSubscriptionStatus(selectedSimStatus);
    setShowSimulateModal(false);
  };

  const handleCancelClick = () => {
    if (confirm('Deseja realmente cancelar a assinatura do Plano BebêAqui?')) {
      updateSubscriptionStatus('cancelled');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              💳 Minha Assinatura
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerenciamento do plano mensal da <strong>{activeCompany.tradeName}</strong>.
          </p>
        </div>

        {/* Academic Simulator Trigger Button */}
        <button
          onClick={() => setShowSimulateModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Simulador de Status SaaS</span>
        </button>
      </div>

      {/* Main Subscription Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Plano Atual Contratado
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {activePlan.id === 'atacado' ? '🏢' : activePlan.id === 'distribuidora_atacado' ? '⭐' : '🍻'}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {activePlan.name}
                  </h2>
                  {activePlan.badge && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                      {activePlan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {activePlan.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-1">
            <span className="text-xs text-slate-400">Valor da Mensalidade</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              R$ {activePlan.price.toFixed(2).replace('.', ',')}<span className="text-sm text-slate-400 font-sans font-normal">/mês</span>
            </div>
          </div>
        </div>

        {/* Status and Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Status da Assinatura</span>
              {currentConfig.icon}
            </div>
            <div className="pt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${currentConfig.badgeBg}`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>{currentConfig.label}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug pt-1">
              {currentConfig.desc}
            </p>
          </div>

          {/* Next Billing */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Próxima Cobrança</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold font-mono text-white pt-1">
              {activeCompany.nextBillingDate}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Cobrança mensal recorrente automática no método cadastrado.
            </p>
          </div>

          {/* Payment Method */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Forma de Pagamento</span>
              <CreditCard className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm font-semibold text-white pt-1">
              {activeCompany.paymentMethodText}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Ambiente preparado para gateway de pagamentos criptografado.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-slate-800">
          <button
            onClick={() => setShowPixModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <QrCode className="w-4 h-4" />
            <span>Pagar Mensalidade via PIX (R$ {activePlan.price.toFixed(2)})</span>
          </button>

          <button
            onClick={() => setActivePage('statement')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Extrato dos Meses Passados</span>
          </button>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Alterar forma de pagamento</span>
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Gerenciar assinatura</span>
          </button>

          <button
            onClick={handleCancelClick}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-colors ml-auto cursor-pointer"
          >
            Cancelar assinatura
          </button>
        </div>
      </div>

      {/* 3 Available Plans & Methods Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">Métodos & Planos de Assinatura</h2>
            <p className="text-xs text-slate-400">Alterne entre os planos para liberar os módulos de Distribuidora, Atacado ou o Combo Integrado.</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
            Plano Vigente: {activePlan.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map(plan => {
            const isSelected = activePlan.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-2 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">{plan.tagline}</span>
                      <h3 className="font-bold text-white text-base mt-0.5">{plan.name}</h3>
                    </div>
                    {plan.badge && (
                      <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-xs text-slate-400">R$</span>
                    <span className="text-3xl font-extrabold text-amber-400">{plan.price.toFixed(2).replace('.', ',')}</span>
                    <span className="text-xs text-slate-400">/mês</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                    {plan.features.slice(0, 4).map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-800 mt-5">
                  <button
                    onClick={() => switchCompanyPlan(plan.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Plano Ativo no Momento</span>
                      </>
                    ) : (
                      <>
                        <span>Mudar para este Plano (R$ {plan.price.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Reminder */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Vantagens inclusas no seu Plano BebêAqui:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cardápio digital via QR Code</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Gestão de mesas e comandas</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Controle e alertas de estoque</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Gestão de pedidos para entrega</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Relatórios de vendas diários e semanais</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cadastro e permissões de equipe</span>
          </div>
        </div>
      </div>

      {/* Simulator Modal for Academic Requirements */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Simular Status da Assinatura</h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Como este é um projeto acadêmico de software, você pode alternar livremente entre os status abaixo para testar o comportamento do sistema:
            </p>

            <div className="space-y-2">
              {(['active', 'pending', 'approved', 'cancelled', 'expired'] as SubscriptionStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedSimStatus(st)}
                  className={`w-full p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedSimStatus === st
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {statusConfig[st].icon}
                    <span>{statusConfig[st].label}</span>
                  </div>
                  {selectedSimStatus === st && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApplySimulation}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Aplicar Simulação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold">Alterar Forma de Pagamento</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed">
              <Lock className="w-4 h-4 inline mr-1" />
              Ambiente de simulação acadêmica. Nenhum dado real de cartão é debitado.
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Nome no Cartão Simulado</label>
                <input
                  type="text"
                  defaultValue="CARLOS E SILVEIRA"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white uppercase focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Últimos 4 dígitos do Cartão</label>
                <input
                  type="text"
                  maxLength={4}
                  value={mockCardLastDigits}
                  onChange={e => setMockCardLastDigits(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setShowPaymentModal(false);
                addToast('success', 'Forma de pagamento atualizada', `Cartão final ${mockCardLastDigits} configurado com sucesso.`);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Salvar Forma de Pagamento
            </button>
          </div>
        </div>
      )}

      {/* PIX Payment Modal */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Pagar Plano BebêAqui via PIX</h3>
              </div>
              <button
                onClick={() => setShowPixModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Chave PIX Oficial do Administrador:</span>
              </p>
              <p className="text-slate-300 text-[11px]">
                O PIX de <strong>R$ {activePlan.price.toFixed(2).replace('.', ',')}</strong> deve ser realizado no telefone abaixo para controle e validação de quem é cadastrado na plataforma:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Valor da Mensalidade:</span>
                <span className="font-mono font-bold text-amber-400 text-lg">R$ {activePlan.price.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tipo de Chave:</span>
                <span className="font-semibold text-slate-200">Telefone Celular</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Chave PIX</span>
                  <span className="text-lg font-mono font-bold text-white tracking-wider">
                    {PLATFORM_PIX_PHONE_FORMATTED}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-950" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Titular field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Nome do Titular que enviou o PIX *
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo Silveira"
                value={pixTitularName}
                onChange={e => setPixTitularName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status checking */}
            {pixModalStatus === 'checking' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-200 font-semibold">Consultando liquidação do Pix na chave 31975346290...</p>
                <p className="text-[11px] text-slate-400">Verificando dados bancários e titular...</p>
              </div>
            )}

            {/* Status Success */}
            {pixModalStatus === 'success' && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">🎉 Pagamento PIX Confirmado com Sucesso!</h4>
                  <p className="text-xs text-emerald-300 mt-0.5">Mensalidade quitada e plano BebêAqui 100% liberado.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPixModal(false);
                    setPixModalStatus('idle');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Concluir e Continuar no Sistema
                </button>
              </div>
            )}

            {/* Status Error */}
            {pixModalStatus === 'error' && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-left space-y-3">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">PIX Não Identificado ou Não Concluído</h4>
                    <p className="text-[11px] text-rose-200 mt-0.5">
                      {pixModalErrorMsg || 'Ainda não identificamos a transferência de R$ 70,00 para o telefone 31975346290.'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-rose-500/20 text-[10px] text-slate-300 space-y-1">
                  <p className="font-semibold text-rose-300">Dicas para resolver:</p>
                  <p>• Verifique no app do seu banco se o comprovante final foi emitido.</p>
                  <p>• Certifique-se de ter enviado para o telefone <strong>31975346290</strong>.</p>
                  <p>• O valor deve ser exatamente de <strong>R$ 70,00</strong>.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifySubscriptionPix(false)}
                    className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tentar Novamente</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
                  >
                    Copiar Chave
                  </button>
                </div>
              </div>
            )}

            {/* Default buttons */}
            {pixModalStatus !== 'success' && pixModalStatus !== 'checking' && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleVerifySubscriptionPix(false)}
                  disabled={!pixTitularName.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conferir e Confirmar Pagamento do PIX (R$ 70)</span>
                </button>

                {/* Simulation buttons */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!pixTitularName.trim()) setPixTitularName('Carlos Eduardo (Titular Teste)');
                      handleVerifySubscriptionPix(false);
                    }}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    [Simular PIX Aprovado]
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!pixTitularName.trim()) setPixTitularName('Carlos Eduardo');
                      handleVerifySubscriptionPix(true);
                    }}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    [Simular PIX com Erro]
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPixModal(false);
                    setPixModalStatus('idle');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
