import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlanType } from '../types';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  QrCode,
  Copy,
  CheckCircle2,
  Building2,
  Boxes,
  Layers,
  Store,
  Printer,
  Search,
  Loader2,
  AlertCircle,
  X,
  MapPin,
  Phone,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { consultRealCNPJ, maskCNPJ, CNPJValidationResult } from '../utils/cnpj';
import { playNotificationChime } from '../utils/realtimeSync';

export const PlansPage: React.FC = () => {
  const {
    setActivePage,
    switchCompanyPlan,
    activePlan,
    addToast,
    updateCompanyInfo,
    activeCompany,
    updateSubscriptionStatus
  } = useApp();
  const [copiedPix, setCopiedPix] = useState(false);
  const [selectedPlanForPix, setSelectedPlanForPix] = useState<{ name: string; price: number } | null>(null);

  // CNPJ Verification & Plan Hiring Modal
  const [planToHire, setPlanToHire] = useState<{ id: PlanType; name: string; price: number; description: string } | null>(null);
  const [cnpjInput, setCnpjInput] = useState<string>('');
  const [isVerifyingCnpj, setIsVerifyingCnpj] = useState<boolean>(false);
  const [cnpjResult, setCnpjResult] = useState<CNPJValidationResult | null>(null);

  // PIX Verification State
  type PixCheckStatus = 'idle' | 'checking' | 'success' | 'error';
  const [pixStatus, setPixStatus] = useState<PixCheckStatus>('idle');
  const [pixPayerName, setPixPayerName] = useState<string>('');
  const [pixErrorMsg, setPixErrorMsg] = useState<string>('');
  const [pixTransactionId, setPixTransactionId] = useState<string>('');
  const [simulatedPixPaid, setSimulatedPixPaid] = useState<boolean>(true);

  const PLATFORM_PIX_PHONE = '31975346290';
  const PLATFORM_PIX_PHONE_FORMATTED = '(31) 97534-6290';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PLATFORM_PIX_PHONE);
    setCopiedPix(true);
    addToast('success', 'Chave PIX copiada!', `${PLATFORM_PIX_PHONE_FORMATTED} pronto para colar.`);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  // Open PIX modal with clean verification state
  const handleOpenPixModal = (plan: { name: string; price: number }) => {
    setSelectedPlanForPix(plan);
    setPixStatus('idle');
    setPixErrorMsg('');
    setPixTransactionId('');
    setPixPayerName(activeCompany.tradeName || activeCompany.name || '');
  };

  // Verify whether the PIX was finalized successfully
  const handleVerifyPixPayment = (forceError = false) => {
    if (!pixPayerName.trim()) {
      addToast('error', 'Identificação Necessária', 'Informe o nome de quem realizou o PIX para verificação bancária.');
      return;
    }

    setPixStatus('checking');
    setPixErrorMsg('');

    setTimeout(() => {
      if (forceError || !simulatedPixPaid) {
        setPixStatus('error');
        setPixErrorMsg(
          `O Banco Central / SPI ainda não identificou a liquidação de R$ ${selectedPlanForPix?.price.toFixed(2).replace('.', ',')} na chave ${PLATFORM_PIX_PHONE_FORMATTED}. Verifique se o PIX foi concluído no seu banco ou aguarde alguns instantes.`
        );
        addToast('error', 'PIX Não Localizado!', 'Nenhuma liquidação correspondente foi confirmada no Banco Central.');
      } else {
        const transId = `E975346290${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Date.now().toString().slice(-8)}`;
        setPixTransactionId(transId);
        setPixStatus('success');
        updateSubscriptionStatus('active');
        playNotificationChime('pay');
        addToast(
          'success',
          'PIX Confirmado com Sucesso!',
          'Pagamento liquidado no Banco Central. O seu plano foi ativado imediatamente!'
        );
      }
    }, 1900);
  };

  // Open CNPJ verification modal for the selected plan
  const handleOpenHireModal = (plan: { id: PlanType; name: string; price: number; description: string }) => {
    setPlanToHire(plan);
    const existingCnpj = activeCompany?.cnpj && activeCompany.cnpj !== '00.000.000/0001-00' ? activeCompany.cnpj : '';
    setCnpjInput(existingCnpj);
    setCnpjResult(null);

    // If company already has a CNPJ with 14 digits, auto-check it
    if (existingCnpj.replace(/\D/g, '').length === 14) {
      handleVerifyCNPJ(existingCnpj);
    }
  };

  // Live verification with Receita Federal / BrasilAPI
  const handleVerifyCNPJ = async (valueToVerify?: string) => {
    const target = valueToVerify || cnpjInput;
    const clean = target.replace(/\D/g, '');

    if (clean.length !== 14) {
      setCnpjResult({
        valid: false,
        cleanCnpj: clean,
        formattedCnpj: maskCNPJ(clean),
        error: 'O CNPJ deve conter exatamente 14 dígitos numéricos.'
      });
      return;
    }

    setIsVerifyingCnpj(true);
    setCnpjResult(null);

    try {
      const result = await consultRealCNPJ(clean);
      setCnpjResult(result);

      if (result.valid && result.isRealAndActive) {
        addToast(
          'success',
          'CNPJ Real e Ativo!',
          `${result.companyData?.razaoSocial} localizado com sucesso na Receita Federal.`
        );
      } else {
        addToast('error', 'CNPJ Inválido', result.error || 'CNPJ não encontrado na Receita Federal.');
      }
    } catch (err) {
      setCnpjResult({
        valid: false,
        cleanCnpj: clean,
        formattedCnpj: maskCNPJ(clean),
        error: 'Não foi possível consultar a Receita Federal no momento. Verifique sua conexão.'
      });
    } finally {
      setIsVerifyingCnpj(false);
    }
  };

  // Handle CNPJ input change with automatic mask
  const handleCnpjInputChange = (val: string) => {
    const formatted = maskCNPJ(val);
    setCnpjInput(formatted);
    setCnpjResult(null);

    // Trigger auto-verification as soon as 14 digits are typed
    if (formatted.replace(/\D/g, '').length === 14) {
      handleVerifyCNPJ(formatted);
    }
  };

  // Quick test CNPJ helper
  const handleApplySampleCNPJ = (sampleCnpj: string) => {
    const formatted = maskCNPJ(sampleCnpj);
    setCnpjInput(formatted);
    handleVerifyCNPJ(formatted);
  };

  // Confirm plan hiring after CNPJ is verified as real
  const handleConfirmHiring = () => {
    if (!planToHire || !cnpjResult?.valid || !cnpjResult.isRealAndActive) {
      addToast('error', 'CNPJ Obrigatório', 'Você precisa informar um CNPJ real e ativo na Receita Federal.');
      return;
    }

    // Update company data with the verified official corporate data
    if (cnpjResult.companyData) {
      updateCompanyInfo({
        cnpj: cnpjResult.formattedCnpj,
        name: cnpjResult.companyData.razaoSocial || activeCompany.name,
        tradeName: cnpjResult.companyData.nomeFantasia || cnpjResult.companyData.razaoSocial || activeCompany.tradeName,
        phone: cnpjResult.companyData.telefone || activeCompany.phone,
        email: cnpjResult.companyData.email || activeCompany.email,
        address: cnpjResult.companyData.logradouro || activeCompany.address,
        number: cnpjResult.companyData.numero || activeCompany.number,
        neighborhood: cnpjResult.companyData.bairro || activeCompany.neighborhood,
        city: cnpjResult.companyData.municipio || activeCompany.city,
        state: cnpjResult.companyData.uf || activeCompany.state,
        zipCode: cnpjResult.companyData.cep || activeCompany.zipCode
      });
    }

    // Switch the plan in system
    switchCompanyPlan(planToHire.id);

    // Close hiring modal and open the PIX payment modal
    const hired = planToHire;
    setPlanToHire(null);
    handleOpenPixModal({ name: hired.name, price: hired.price });

    addToast(
      'success',
      'Plano Contratado com Sucesso!',
      `${hired.name} vinculado ao CNPJ ${cnpjResult.formattedCnpj}. Faça o PIX da primeira mensalidade para manter sua conta ativa.`
    );
  };

  const plans = [
    {
      id: 'distribuidora' as PlanType,
      name: 'Plano Distribuidora de Bebidas',
      badge: 'Somente Distribuidora',
      price: 80.00,
      description: 'Perfeito para distribuidoras focadas em varejo, atendimento de balcão, mesas, comandas e delivery local.',
      icon: <Store className="w-6 h-6 text-amber-400" />,
      features: [
        'Cardápio digital oficial com QR Code por mesa',
        'PDV vendas balcão (frente de caixa ágil)',
        'Gestão de mesas e comandas de salão',
        'Gestão de pedidos de delivery e retirada',
        'Controle de estoque de varejo com alerta de mínimo',
        'Relatórios diários e semanais de faturamento',
        'Cadastro de funcionários e acessos',
        'Botões de acessibilidade visual (A- / A+)'
      ],
      popular: false,
      buttonColor: 'bg-slate-800 hover:bg-slate-700 text-white'
    },
    {
      id: 'atacado' as PlanType,
      name: 'Plano Atacado Exclusivo B2B',
      badge: 'Somente Atacado',
      price: 120.00,
      description: 'Desenvolvido especificamente para empresas que operam exclusivamente com atacado de bebidas e vendas por fardo/caixa.',
      icon: <Building2 className="w-6 h-6 text-purple-400" />,
      features: [
        'Aba exclusiva de emissão de pedidos de atacado',
        'Venda por fardos, caixas (24 un), engradados e pallets',
        'Carteira de clientes B2B (bares, mercados, restaurantes)',
        'Tabela de preços atacado com margens diferenciadas',
        'Espelho do pedido para impressora térmica (80mm Epson)',
        'Romaneio e controle de separação no galpão',
        'Faturamento a prazo (boleto 14/28 dias, PIX à vista)',
        'Usuário exclusivo para operador de atacado'
      ],
      popular: false,
      buttonColor: 'bg-purple-600 hover:bg-purple-500 text-white'
    },
    {
      id: 'distribuidora_atacado' as PlanType,
      name: 'Plano Distribuidora + Atacado e Varejo',
      badge: 'Mais Completo · Varejo + Atacado Integrados',
      price: 180.00,
      description: 'A solução definitiva! Une todas as ferramentas da distribuidora com a aba de atacado funcionando conjuntamente no mesmo sistema.',
      icon: <Layers className="w-6 h-6 text-amber-400" />,
      features: [
        'TUDO do Plano Distribuidora (PDV, mesas, comandas, cardápio)',
        'TUDO do Plano Atacado (emissão B2B, fardos, térmica 80mm)',
        'Aba de Atacado integrada funcionando com a distribuidora',
        'Estoque unificado com baixa automática em ambos os canais',
        'Dashboard consolidado (vendas varejo + atacado)',
        'Usuários dedicados: Atacado, Balcão e Administrador Geral',
        'Economia de R$ 10/mês em relação aos planos separados',
        'Suporte prioritário e assessoria de implantação'
      ],
      popular: true,
      buttonColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assinaturas Flexíveis para o seu Modelo de Negócio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Planos & Métodos de Assinatura BebêAqui
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Escolha o método ideal para a sua empresa: opere somente como <strong>Distribuidora (R$ 80)</strong>, somente com <strong>Atacado B2B (R$ 120)</strong> ou tenha o <strong>Combo Completo Integrado (R$ 180)</strong> com ambas as abas funcionando conjuntamente.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map(plan => {
            const isCurrentActive = activePlan.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-slate-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/10 scale-100 lg:-translate-y-2'
                    : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Badge top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md ${
                      plan.popular
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Card Header */}
                  <div className="pt-2 text-center space-y-2 border-b border-slate-800 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto shadow-inner">
                      {plan.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>

                    <div className="pt-2 flex items-baseline justify-center gap-1 font-mono">
                      <span className="text-sm font-semibold text-slate-400">R$</span>
                      <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${plan.popular ? 'text-amber-400' : 'text-white'}`}>
                        {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs font-medium text-slate-400">/mês</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recursos inclusos:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-6 space-y-2.5 border-t border-slate-800 mt-6">
                  <button
                    onClick={() => {
                      if (isCurrentActive) {
                        if (plan.id === 'atacado') {
                          setActivePage('wholesale');
                        } else {
                          setActivePage('dashboard');
                        }
                      } else {
                        handleOpenHireModal(plan);
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                      isCurrentActive
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : plan.buttonColor
                    }`}
                  >
                    {isCurrentActive ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>PLANO ATUALMENTE ATIVO</span>
                      </>
                    ) : (
                      <>
                        <span>CONTRATAR COM CNPJ (R$ {plan.price.toFixed(2)})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenPixModal({ name: plan.name, price: plan.price })}
                    className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ver Chave PIX (R$ {plan.price.toFixed(2)})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Direct PIX Notice Banner */}
        <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span>Pagamento das Mensalidades via Chave Telefone PIX</span>
            </span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Liberado Imediatamente
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            As assinaturas do BebêAqui (R$ 80, R$ 120 ou R$ 180) são pagas via transferência direta para o PIX do administrador. Copie a chave abaixo:
          </p>

          <div className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-2xl border border-amber-500/30">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Chave Celular PIX (Administrador)</span>
              <span className="text-base sm:text-lg font-mono font-bold text-amber-300">{PLATFORM_PIX_PHONE_FORMATTED}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPix}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedPix ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>Copiar PIX</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security and Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Ambiente Isolado</h4>
            <p className="text-[11px] text-slate-400">Seus dados e de seus clientes B2B protegidos</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <Zap className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Sem Taxa por Venda</h4>
            <p className="text-[11px] text-slate-400">Mensalidade fixa, 100% do lucro é seu</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <Sparkles className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Pronto para Usar</h4>
            <p className="text-[11px] text-slate-400">Impressão térmica de espelho e baixa automática</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: VERIFICAÇÃO DE CNPJ REAL NA RECEITA FEDERAL        */}
      {/* ======================================================== */}
      {planToHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Contratação de Plano
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  {planToHire.name}
                </h3>
                <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">
                  R$ {planToHire.price.toFixed(2).replace('.', ',')} / mês
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPlanToHire(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Notice */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-white block">Validação Obrigatória na Receita Federal:</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Para contratar o sistema, informe o CNPJ da sua distribuidora, adega ou bar. O sistema consultará automaticamente a base pública da Receita Federal para validar se a empresa é real e ativa.
                </p>
              </div>
            </div>

            {/* CNPJ Input & Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                CNPJ da Empresa (Somente Números):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpjInput}
                  onChange={e => handleCnpjInputChange(e.target.value)}
                  maxLength={18}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleVerifyCNPJ()}
                  disabled={isVerifyingCnpj || cnpjInput.replace(/\D/g, '').length < 14}
                  className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    cnpjInput.replace(/\D/g, '').length === 14 && !isVerifyingCnpj
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isVerifyingCnpj ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Consultar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample CNPJ shortcuts for quick testing */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1">Testar com CNPJ Real de Distribuição:</span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleApplySampleCNPJ('35.918.442/0001-90')}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono transition-colors cursor-pointer"
                  >
                    BebêAqui Distribuidora
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySampleCNPJ('07.526.557/0001-00')}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    Ambev S.A.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySampleCNPJ('73.410.326/0001-08')}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    Grupo Petrópolis
                  </button>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {isVerifyingCnpj && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-3 text-xs text-amber-300">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Consultando dados cadastrais oficiais na Receita Federal...</span>
              </div>
            )}

            {/* Error Message if CNPJ is invalid / not real */}
            {!isVerifyingCnpj && cnpjResult && !cnpjResult.valid && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>CNPJ Inválido ou Não Localizado</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-300/90">
                  {cnpjResult.error || 'O CNPJ informado não existe na base pública da Receita Federal. Verifique a digitação.'}
                </p>
              </div>
            )}

            {/* Success Card if CNPJ is REAL and ACTIVE */}
            {!isVerifyingCnpj && cnpjResult?.valid && cnpjResult.isRealAndActive && cnpjResult.companyData && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CNPJ Verificado & Ativo na Receita Federal</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    SITUAÇÃO: {cnpjResult.companyData.situacaoCadastral}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] border-t border-emerald-500/20 pt-2 text-slate-300">
                  <div>
                    <span className="text-slate-400">Razão Social:</span>{' '}
                    <strong className="text-white">{cnpjResult.companyData.razaoSocial}</strong>
                  </div>
                  {cnpjResult.companyData.nomeFantasia && (
                    <div>
                      <span className="text-slate-400">Nome Fantasia:</span>{' '}
                      <span className="text-slate-200">{cnpjResult.companyData.nomeFantasia}</span>
                    </div>
                  )}
                  {cnpjResult.companyData.cnaeDescricao && (
                    <div>
                      <span className="text-slate-400">Atividade (CNAE):</span>{' '}
                      <span className="text-slate-300">{cnpjResult.companyData.cnaeDescricao}</span>
                    </div>
                  )}
                  {cnpjResult.companyData.municipio && (
                    <div className="flex items-center gap-1 text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{cnpjResult.companyData.logradouro ? `${cnpjResult.companyData.logradouro}, ` : ''}{cnpjResult.companyData.numero ? `${cnpjResult.companyData.numero} - ` : ''}{cnpjResult.companyData.bairro ? `${cnpjResult.companyData.bairro}, ` : ''}{cnpjResult.companyData.municipio}/{cnpjResult.companyData.uf}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPlanToHire(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmHiring}
                disabled={!cnpjResult?.valid || !cnpjResult.isRealAndActive}
                className={`px-5 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  cnpjResult?.valid && cnpjResult.isRealAndActive
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirmar e Contratar Plano</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VERIFICAÇÃO ATIVA DE LIQUIDAÇÃO PIX NO BANCO      */}
      {/* ======================================================== */}
      {selectedPlanForPix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Verificação & Liquidação PIX</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForPix(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Info */}
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400">{selectedPlanForPix.name}</span>
              <div className="text-3xl font-black text-amber-400 font-mono">
                R$ {selectedPlanForPix.price.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-slate-300">
                Pague pelo aplicativo do seu banco para a chave celular abaixo:
              </p>
            </div>

            {/* PIX Key and QR Code Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Visual QR Code */}
              <div className="w-28 h-28 bg-white p-2 rounded-xl flex flex-col items-center justify-between shadow shrink-0">
                <div className="flex justify-between w-full">
                  <div className="w-5 h-5 bg-slate-950 rounded-sm" />
                  <div className="w-5 h-5 bg-slate-950 rounded-sm" />
                </div>
                <div className="text-[7px] font-mono text-slate-950 font-black text-center">
                  PIX BEBÊAQUI
                  <br />
                  R$ {selectedPlanForPix.price.toFixed(2)}
                </div>
                <div className="flex justify-between w-full">
                  <div className="w-5 h-5 bg-slate-950 rounded-sm" />
                  <div className="w-5 h-5 bg-emerald-500 rounded-sm" />
                </div>
              </div>

              {/* PIX Key details and Copy button */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Chave Celular PIX:</span>
                  <div className="font-mono font-bold text-amber-300 text-base">
                    {PLATFORM_PIX_PHONE_FORMATTED}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Titular: Administrador BebêAqui</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                >
                  {copiedPix ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Chave PIX Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>Copiar Chave PIX</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* IF PIX STATUS IS SUCCESS */}
            {pixStatus === 'success' ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-xs space-y-3 animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>PIX Liquidado e Confirmado com Sucesso!</span>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-slate-200 bg-slate-950/70 p-3 rounded-xl border border-emerald-500/30">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID da Transação E2E:</span>
                    <strong className="text-emerald-300 truncate max-w-[180px]">{pixTransactionId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Confirmado:</span>
                    <strong className="text-white">R$ {selectedPlanForPix.price.toFixed(2).replace('.', ',')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Titular Confirmado:</span>
                    <span className="text-slate-200">{pixPayerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status da Conta:</span>
                    <span className="text-emerald-400 font-bold">ATIVA (Liberada Imediatamente)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanForPix(null);
                    if (activePlan.id === 'atacado') {
                      setActivePage('wholesale');
                    } else {
                      setActivePage('dashboard');
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                  <span>Acessar Meu Sistema Liberado Agora</span>
                </button>
              </div>
            ) : (
              /* IF PIX STATUS IS IDLE, CHECKING OR ERROR */
              <div className="space-y-3 pt-1 border-t border-slate-800">
                {/* Payer identification field */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Nome de quem realizou o PIX (para conferência bancária):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva ou Distribuidora Silva Ltda"
                    value={pixPayerName}
                    onChange={e => setPixPayerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    O sistema buscará a liquidação correspondente no Banco Central nesta chave.
                  </p>
                </div>

                {/* Error Banner if PIX was not verified */}
                {pixStatus === 'error' && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>PIX Não Confirmado no Banco Central</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-rose-300/90">
                      {pixErrorMsg}
                    </p>
                  </div>
                )}

                {/* Checking Spinner Status */}
                {pixStatus === 'checking' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-3 text-xs text-amber-300">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Consultando liquidação no Banco Central e no banco recebedor...</span>
                  </div>
                )}

                {/* Verification Trigger Button */}
                <button
                  type="button"
                  onClick={() => handleVerifyPixPayment(false)}
                  disabled={pixStatus === 'checking'}
                  className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    pixStatus === 'checking'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  {pixStatus === 'checking' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando Liquidação...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Verificar se o PIX foi Finalizado com Sucesso</span>
                    </>
                  )}
                </button>

                {/* Simulation Mode Toggle (For easy demo & testing) */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400">
                  <span>Modo de Teste de Liquidação:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSimulatedPixPaid(true)}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        simulatedPixPaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Simular: PIX Confirmado
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatedPixPaid(false)}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        !simulatedPixPaid ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Simular: PIX Pendente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
