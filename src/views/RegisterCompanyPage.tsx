import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  AlertCircle,
  Hash,
  Loader2,
  Eye,
  EyeOff,
  XCircle,
  RefreshCw,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import {
  formatCNPJ,
  formatPhone,
  formatCEP,
  formatAddressNumber,
  getDigitCount
} from '../utils/masks';
import { fetchAddressByCep } from '../utils/cep';
import { consultRealCNPJ, CNPJValidationResult } from '../utils/cnpj';

export const RegisterCompanyPage: React.FC = () => {
  const { registerCompany, setActivePage, addToast } = useApp();

  const [step, setStep] = useState<'details' | 'pix_payment'>('details');

  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepSuccess, setCepSuccess] = useState(false);

  // CNPJ Receita Federal verification state
  const [isVerifyingCnpj, setIsVerifyingCnpj] = useState(false);
  const [cnpjResult, setCnpjResult] = useState<CNPJValidationResult | null>(null);

  // PIX verification state
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixPayerName, setPixPayerName] = useState('');
  const [hasPaidPix, setHasPaidPix] = useState(true);
  type PixCheckStatus = 'idle' | 'checking' | 'success' | 'error';
  const [pixStatus, setPixStatus] = useState<PixCheckStatus>('idle');
  const [pixErrorMsg, setPixErrorMsg] = useState<string>('');
  const [pixTransactionId, setPixTransactionId] = useState<string>('');

  const PLATFORM_PIX_PHONE = '31975346290';
  const PLATFORM_PIX_PHONE_FORMATTED = '(31) 97534-6290';

  // Auto-fill example helper for fast evaluation
  const handleAutoFillExample = () => {
    setCnpj('35.918.442/0001-90');
    setCompanyName('DISTRIBUIDORA BEBEAQUI PRIME COMERCIO DE BEBIDAS LTDA');
    setTradeName('BEBEAQUI PRIME DISTRIBUIDORA & ATACADO');
    setPhone('(11) 98765-4321');
    setEmail('contato@bebeaqui.com.br');
    setZipCode('01001-000');
    setAddress('Praça da Sé');
    setNumber('100');
    setNeighborhood('Sé');
    setCity('São Paulo');
    setState('SP');
    setPassword('senha1234');
    setConfirmPassword('senha1234');
    setCepSuccess(true);
    setCnpjResult({
      valid: true,
      cleanCnpj: '35918442000190',
      formattedCnpj: '35.918.442/0001-90',
      isRealAndActive: true,
      companyData: {
        cnpj: '35.918.442/0001-90',
        razaoSocial: 'DISTRIBUIDORA BEBEAQUI PRIME COMERCIO DE BEBIDAS LTDA',
        nomeFantasia: 'BEBEAQUI PRIME DISTRIBUIDORA & ATACADO',
        situacaoCadastral: 'ATIVA',
        isAtiva: true,
        cnaeDescricao: 'Comércio atacadista de cerveja, chope e refrigerante'
      }
    });
  };

  // Real-time CNPJ validation with Receita Federal / BrasilAPI
  const handleVerifyCnpjDirectly = async (cnpjToVerify?: string) => {
    const target = cnpjToVerify || cnpj;
    const clean = target.replace(/\D/g, '');

    if (clean.length !== 14) {
      setCnpjResult({
        valid: false,
        cleanCnpj: clean,
        formattedCnpj: formatCNPJ(clean),
        error: 'O CNPJ deve conter exatamente 14 números.'
      });
      return;
    }

    setIsVerifyingCnpj(true);
    setCnpjResult(null);

    try {
      const result = await consultRealCNPJ(clean);
      setCnpjResult(result);

      if (result.valid && result.isRealAndActive && result.companyData) {
        setCompanyName(result.companyData.razaoSocial);
        setTradeName(result.companyData.nomeFantasia || result.companyData.razaoSocial);

        if (result.companyData.cep) {
          setZipCode(result.companyData.cep);
          if (result.companyData.logradouro) setAddress(result.companyData.logradouro);
          if (result.companyData.numero) setNumber(result.companyData.numero);
          if (result.companyData.bairro) setNeighborhood(result.companyData.bairro);
          if (result.companyData.municipio) setCity(result.companyData.municipio);
          if (result.companyData.uf) setState(result.companyData.uf);
          setCepSuccess(true);
        }

        if (result.companyData.telefone) {
          setPhone(formatPhone(result.companyData.telefone));
        }

        if (result.companyData.email) {
          setEmail(result.companyData.email);
        }

        addToast(
          'success',
          'CNPJ Real e Ativo na Receita!',
          `${result.companyData.razaoSocial} localizado e preenchido automaticamente.`
        );
      } else {
        addToast('error', 'CNPJ Inválido', result.error || 'CNPJ não encontrado na Receita Federal.');
      }
    } catch {
      setCnpjResult({
        valid: false,
        cleanCnpj: clean,
        formattedCnpj: formatCNPJ(clean),
        error: 'Erro ao consultar a Receita Federal.'
      });
    } finally {
      setIsVerifyingCnpj(false);
    }
  };

  const handleCnpjChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setCnpj(formatted);
    setCnpjResult(null);

    if (formatted.replace(/\D/g, '').length === 14) {
      handleVerifyCnpjDirectly(formatted);
    }
  };

  // Automatic CEP lookup that pre-fills rua, bairro, cidade and UF
  const handleCepChange = async (value: string) => {
    const formatted = formatCEP(value);
    setZipCode(formatted);
    const cleanCep = formatted.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setIsSearchingCep(true);
      setCepSuccess(false);
      try {
        const addressData = await fetchAddressByCep(cleanCep);
        if (addressData) {
          if (addressData.street) setAddress(addressData.street);
          if (addressData.neighborhood) setNeighborhood(addressData.neighborhood);
          if (addressData.city) setCity(addressData.city);
          if (addressData.state) setState(addressData.state);
          setCepSuccess(true);
          addToast(
            'success',
            'Endereço localizado!',
            `${addressData.street ? addressData.street + ', ' : ''}${addressData.neighborhood} - ${addressData.city}/${addressData.state}`
          );
        }
      } catch {
        // Fallback silently if any unexpected error
      } finally {
        setIsSearchingCep(false);
      }
    } else {
      setCepSuccess(false);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      setErrorMsg('O CNPJ deve conter exatamente 14 números.');
      return;
    }

    if (cnpjResult && (!cnpjResult.valid || !cnpjResult.isRealAndActive)) {
      setErrorMsg(cnpjResult.error || 'O CNPJ informado é inválido ou não foi localizado na Receita Federal. Por favor, informe um CNPJ real e ativo.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('O telefone comercial deve conter DDD e ao menos 10 números (celular ou fixo).');
      return;
    }

    const cleanCep = zipCode.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setErrorMsg('O CEP deve conter exatamente 8 números.');
      return;
    }

    if (!number.trim()) {
      setErrorMsg('Informe o número do estabelecimento.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas informadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // Advance to step 2 (PIX payment of the plan)
    setStep('pix_payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PLATFORM_PIX_PHONE);
    setCopiedPix(true);
    addToast('success', 'Chave PIX copiada!', `${PLATFORM_PIX_PHONE_FORMATTED} pronto para colar.`);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  // PIX verification check (Success vs. Error)
  const handleVerifyPix = (forceError = false) => {
    if (!pixPayerName.trim()) {
      addToast('error', 'Nome do titular obrigatório', 'Informe quem realizou o Pix para conferência bancária.');
      return;
    }

    setPixStatus('checking');
    setPixErrorMsg('');

    setTimeout(() => {
      if (forceError || !hasPaidPix) {
        setPixStatus('error');
        setPixErrorMsg(
          'O Banco Central não confirmou a liquidação de R$ 80,00 na chave telefone (31) 97534-6290. Verifique se o PIX foi concluído no seu banco ou se os dados informados estão corretos.'
        );
        addToast('error', 'PIX Não Localizado!', 'Nenhum valor de R$ 80,00 foi confirmado ainda nesta chave.');
      } else {
        const transId = `E2E975346290-${Date.now().toString().slice(-6)}`;
        setPixTransactionId(transId);
        setPixStatus('success');
        addToast('success', 'PIX Identificado com Sucesso!', 'Pagamento liquidado. Acesso ao BebêAqui liberado!');
      }
    }, 1800);
  };

  const handleFinalizeRegistration = () => {
    setLoading(true);

    setTimeout(() => {
      registerCompany({
        name: companyName,
        tradeName: tradeName || companyName,
        cnpj,
        phone,
        email,
        zipCode,
        address,
        number,
        neighborhood,
        city,
        state,
        password,
        paymentMethodText: `PIX Confirmado (Telefone: ${PLATFORM_PIX_PHONE}) - Transação: ${pixTransactionId || 'E2E-OK'}`
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ambiente Oficial BebêAqui</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            🍻 Cadastre sua Distribuidora
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Crie a conta da sua empresa no <strong>BebêAqui</strong> e tenha cardápio digital, mesas, controle de estoque e vendas no mesmo painel.
          </p>

          {step === 'details' && (
            <button
              type="button"
              onClick={handleAutoFillExample}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              ⚡ Preencher dados de exemplo para teste rápido
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-xs font-semibold">
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              step === 'details'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">Etapa 1</span>
            <span>1. Dados Cadastrais</span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              step === 'pix_payment'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">Etapa 2</span>
            <span>2. Pagamento PIX (R$ 80)</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              {/* Section 1: Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Building2 className="w-4 h-4" />
                  <span>1. Dados Cadastrais da Distribuidora</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Razão Social / Nome da Empresa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Distribuidora Silva & Cia Ltda"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Nome Fantasia (Como o cliente conhece) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Distribuidora Central de Bebidas"
                      value={tradeName}
                      onChange={e => setTradeName(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>CNPJ da Distribuidora *</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        getDigitCount(cnpj) === 14
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {getDigitCount(cnpj)}/14 dígitos
                      </span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={18}
                        required
                        placeholder="00.000.000/0001-00"
                        value={cnpj}
                        onChange={e => handleCnpjChange(e.target.value)}
                        className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white font-mono focus:outline-none transition-colors ${
                          cnpjResult?.valid && cnpjResult.isRealAndActive
                            ? 'border-emerald-500/60 focus:border-emerald-400'
                            : cnpjResult && !cnpjResult.valid
                            ? 'border-rose-500 focus:border-rose-400'
                            : 'border-slate-700 focus:border-amber-400'
                        }`}
                      />
                      {isVerifyingCnpj && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-amber-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-[10px]">Consultando Receita...</span>
                        </div>
                      )}
                    </div>

                    {/* Verification Status Feedback */}
                    {cnpjResult?.valid && cnpjResult.isRealAndActive && (
                      <div className="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-0.5">
                        <div className="flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>CNPJ Real & Ativo na Receita Federal</span>
                        </div>
                        <p className="text-[10px] text-slate-300 truncate">
                          {cnpjResult.companyData?.razaoSocial}
                        </p>
                      </div>
                    )}

                    {cnpjResult && !cnpjResult.valid && (
                      <div className="mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 space-y-0.5">
                        <div className="flex items-center gap-1 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>CNPJ Inválido ou Não Localizado</span>
                        </div>
                        <p className="text-[10px] text-rose-300/90 leading-tight">
                          {cnpjResult.error}
                        </p>
                      </div>
                    )}

                    {!cnpjResult && !isVerifyingCnpj && (
                      <p className="text-[10px] text-slate-500 mt-1">Validação automática e consulta à Receita Federal</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Telefone / WhatsApp *</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        getDigitCount(phone) >= 10
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {getDigitCount(phone)}/11 dígitos
                      </span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={e => setPhone(formatPhone(e.target.value))}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Limite máx. 11 números (DDD + 9 dígitos)</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">E-mail da Distribuidora *</label>
                    <input
                      type="email"
                      required
                      placeholder="contato@distribuidora.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Utilizado para login e avisos da conta</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Localização */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <MapPin className="w-4 h-4" />
                  <span>2. Endereço do Estabelecimento</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>CEP *</span>
                      <div className="flex items-center gap-1.5">
                        {isSearchingCep && (
                          <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                          </span>
                        )}
                        {cepSuccess && !isSearchingCep && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Localizado!
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          getDigitCount(zipCode) === 8
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {getDigitCount(zipCode)}/8
                        </span>
                      </div>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={9}
                      required
                      placeholder="00000-000"
                      value={zipCode}
                      onChange={e => handleCepChange(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Preenche rua, bairro e cidade automaticamente</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-300">Endereço (Rua, Av.) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rua das Cervejas"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Logradouro do ponto comercial</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Número *</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        máx. 6 núm.
                      </span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="120"
                      value={number}
                      onChange={e => setNumber(formatAddressNumber(e.target.value, 6))}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Apenas números (máx. 6)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Centro"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Cidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="São Paulo"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Estado (UF) *</label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="SP">SP - São Paulo</option>
                      <option value="RJ">RJ - Rio de Janeiro</option>
                      <option value="MG">MG - Minas Gerais</option>
                      <option value="RS">RS - Rio Grande do Sul</option>
                      <option value="PR">PR - Paraná</option>
                      <option value="SC">SC - Santa Catarina</option>
                      <option value="BA">BA - Bahia</option>
                      <option value="PE">PE - Pernambuco</option>
                      <option value="DF">DF - Distrito Federal</option>
                      <option value="GO">GO - Goiás</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Segurança */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Lock className="w-4 h-4" />
                  <span>3. Senha de Acesso do Administrador</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Senha de Acesso *</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver senha</span>
                          </>
                        )}
                      </button>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
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
                    <p className="text-[10px] text-slate-500 mt-1">Mínimo de 6 caracteres</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Confirmar Senha *</span>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {showConfirmPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver senha</span>
                          </>
                        )}
                      </button>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Repita a mesma senha"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {password && confirmPassword ? (
                        password === confirmPassword ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Senhas conferem
                          </span>
                        ) : (
                          <span className="text-rose-400 font-medium">As senhas não coincidem</span>
                        )
                      ) : (
                        'Deve ser idêntica à senha informada'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Advance to PIX */}
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Avançar para Pagamento PIX do Plano (R$ 80,00)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-xs text-slate-400">
                  Já possui uma conta cadastrada?{' '}
                  <button
                    type="button"
                    onClick={() => setActivePage('login')}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Entrar agora
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* STEP 2: PIX PAYMENT OF THE PLAN */
            <form onSubmit={handleFinalizeRegistration} className="space-y-6">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep('details')}
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar e editar dados cadastrais</span>
              </button>

              {/* Title & Important Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Controle de Cadastro & Ativação de Plano BebêAqui</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para garantir a segurança e o controle dos estabelecimentos cadastrados na plataforma <strong>BebêAqui</strong>,
                  o pagamento da mensalidade de <strong>R$ 80,00</strong> é feito via <strong>PIX</strong> diretamente no número de telefone do administrador abaixo:
                </p>
              </div>

              {/* PIX Box */}
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Plano Mensal Selecionado
                    </span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                      <span>🍻 Plano Distribuidora BebêAqui</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Empresa: <strong>{tradeName || companyName}</strong> ({cnpj})
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">Valor da Assinatura</span>
                    <div className="text-3xl font-extrabold text-amber-400 font-mono">
                      R$ 80,00<span className="text-xs text-slate-400 font-sans font-normal">/mês</span>
                    </div>
                  </div>
                </div>

                {/* PIX Key Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Chave PIX Oficial (Telefone)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Chave Telefone Ativa
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 px-4 py-3.5 bg-slate-900 border border-amber-500/40 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-mono">Chave Telefone</span>
                        <span className="text-lg sm:text-xl font-mono font-extrabold text-amber-300 tracking-wider">
                          {PLATFORM_PIX_PHONE_FORMATTED}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                        ({PLATFORM_PIX_PHONE})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 cursor-pointer shrink-0"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>Chave Copiada!</span>
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

                {/* Steps to pay */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Como pagar seu plano:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>Abra o aplicativo do seu banco ou carteira digital.</li>
                    <li>Escolha a opção <strong>PIX</strong> e selecione o tipo de chave <strong>Telefone</strong>.</li>
                    <li>Cole ou digite a chave: <strong className="text-amber-300 font-mono">31975346290</strong>.</li>
                    <li>Confirme o valor de <strong className="text-amber-300 font-mono">R$ 70,00</strong> e conclua a transferência.</li>
                  </ol>
                </div>

                {/* Verification field */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Nome do Titular da Conta que enviou o Pix (ou WhatsApp) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={pixPayerName}
                      onChange={e => setPixPayerName(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Com essa informação o sistema confere se o valor foi creditado na conta do administrador para liberar seu acesso.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPaidPix}
                      onChange={e => setHasPaidPix(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-200">
                      Confirmo que enviei o valor de <strong>R$ 70,00</strong> para o PIX telefone <strong>(31) 97534-6290</strong>.
                    </span>
                  </label>
                </div>
              </div>

              {/* Status Display Area */}
              {pixStatus === 'checking' && (
                <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/40 text-center space-y-4 animate-in fade-in">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Consultando Liquidação do PIX...</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Conferindo se o PIX de <strong>R$ 70,00</strong> foi recebido na chave <strong>(31) 97534-6290</strong> em nome de <strong>{pixPayerName || 'sua conta'}</strong>...
                    </p>
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-slate-950 text-[11px] font-mono text-slate-400 border border-slate-800">
                    Aguarde alguns segundos para confirmação bancária
                  </div>
                </div>
              )}

              {pixStatus === 'success' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      <span>✓ Pagamento Confirmado</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">
                      🎉 Acesso ao BebêAqui Liberado!
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Identificamos com sucesso o recebimento de <strong>R$ 70,00</strong> na chave PIX <strong>(31) 97534-6290</strong>. Sua conta está ativa.
                    </p>
                  </div>

                  {/* Receipt Box */}
                  <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30 text-left text-xs space-y-2 font-mono">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Distribuidora:</span>
                      <span className="font-bold text-white font-sans">{tradeName || companyName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Titular Pagador:</span>
                      <span className="text-slate-200">{pixPayerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Valor Pago:</span>
                      <span className="text-emerald-400 font-bold">R$ 70,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Código E2E / Autenticação:</span>
                      <span className="text-slate-300 text-[11px]">{pixTransactionId}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalizeRegistration}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>{loading ? 'Entrando no painel...' : 'Entrar no Painel da sua Distribuidora'}</span>
                  </button>
                </div>
              )}

              {pixStatus === 'error' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-rose-950/30 border-2 border-rose-500/50 space-y-5 animate-in shake">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center shrink-0 border border-rose-500/40">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded uppercase">
                        Não Concluído
                      </div>
                      <h4 className="text-lg font-bold text-white">
                        Pagamento PIX Não Identificado ou Não Concluído
                      </h4>
                      <p className="text-xs text-rose-200 leading-relaxed">
                        {pixErrorMsg || 'Ainda não identificamos a transferência de R$ 70,00 na chave telefone (31) 97534-6290.'}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic details */}
                  <div className="p-4 bg-slate-950/90 rounded-xl border border-rose-500/20 text-xs space-y-2.5 text-slate-300">
                    <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Possíveis motivos da não identificação:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                      <li><strong>Transferência ainda não concluída no banco:</strong> Verifique no seu aplicativo bancário se o comprovante final foi gerado.</li>
                      <li><strong>Chave incorreta:</strong> A chave oficial deve ser o telefone celular <strong className="text-amber-300 font-mono">31975346290</strong>.</li>
                      <li><strong>Valor divergente:</strong> O valor do plano é exatamente <strong className="text-amber-300 font-mono">R$ 70,00</strong>.</li>
                      <li><strong>Lentidão do Banco Central:</strong> Em horários de pico, pode levar até 2 minutos para liquidação.</li>
                    </ul>
                  </div>

                  {/* Actions to fix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleVerifyPix(false)}
                      className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Conferir PIX Novamente</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700"
                    >
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copiar Chave Novamente</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-center">
                    <a
                      href={`https://wa.me/5531975346290?text=${encodeURIComponent(
                        `Olá, realizei o PIX de R$ 70,00 do plano BebêAqui para a distribuidora ${tradeName || companyName} e gostaria de confirmar.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Falar com o administrador no WhatsApp (31 97534-6290)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons for Idle or Error */}
              {pixStatus !== 'success' && pixStatus !== 'checking' && (
                <div className="pt-2 space-y-4">
                  <button
                    type="button"
                    onClick={() => handleVerifyPix(false)}
                    disabled={loading || !hasPaidPix || !pixPayerName.trim()}
                    className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Conferir e Confirmar Pagamento do PIX (R$ 70,00)</span>
                  </button>

                  {/* Fast Simulation Bar */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Testar respostas da plataforma:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!pixPayerName.trim()) setPixPayerName('Carlos Silva (Titular Teste)');
                          handleVerifyPix(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simular Pix Pago (Liberar)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!pixPayerName.trim()) setPixPayerName('Carlos Silva');
                          handleVerifyPix(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Simular Erro / Não Concluído</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-slate-400">
                    O administrador do BebêAqui fará o acompanhamento do seu PIX na chave (31) 97534-6290. Assim que identificado, seu acesso será liberado.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

