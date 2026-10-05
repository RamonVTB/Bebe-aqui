import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building2,
  CreditCard,
  QrCode,
  Save,
  CheckCircle2,
  DollarSign,
  MapPin,
  Banknote,
  Hash,
  Loader2,
  Check,
  Camera,
  Upload,
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import {
  formatCNPJ,
  formatPhone,
  formatCEP,
  formatAddressNumber,
  formatAgency,
  formatBankAccount,
  getDigitCount
} from '../utils/masks';
import { fetchAddressByCep } from '../utils/cep';

export const SettingsView: React.FC = () => {
  const { activeCompany, updateCompanyDetails, addToast } = useApp();

  const [tradeName, setTradeName] = useState(activeCompany.tradeName);
  const [name, setName] = useState(activeCompany.name);
  const [logoUrl, setLogoUrl] = useState(activeCompany.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(activeCompany.coverUrl || '');
  const [cnpj, setCnpj] = useState(activeCompany.cnpj);
  const [phone, setPhone] = useState(activeCompany.phone);
  const [email, setEmail] = useState(activeCompany.email);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync state if active company changes
  useEffect(() => {
    setTradeName(activeCompany.tradeName);
    setName(activeCompany.name);
    setLogoUrl(activeCompany.logoUrl || '');
    setCoverUrl(activeCompany.coverUrl || '');
    setCnpj(activeCompany.cnpj);
    setPhone(activeCompany.phone);
    setEmail(activeCompany.email);
    setAddress(activeCompany.address);
    setNumber(activeCompany.number);
    setNeighborhood(activeCompany.neighborhood);
    setCity(activeCompany.city);
    setState(activeCompany.state);
    setZipCode(activeCompany.zipCode);
  }, [activeCompany]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Arquivo muito grande', 'Selecione uma imagem de até 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'logo') {
        setLogoUrl(base64);
        addToast('info', 'Logotipo carregado', 'Clique em Salvar Alterações para confirmar.');
      } else {
        setCoverUrl(base64);
        addToast('info', 'Foto de capa carregada', 'Clique em Salvar Alterações para confirmar.');
      }
    };
    reader.readAsDataURL(file);
  };

  const [address, setAddress] = useState(activeCompany.address);
  const [number, setNumber] = useState(activeCompany.number);
  const [neighborhood, setNeighborhood] = useState(activeCompany.neighborhood);
  const [city, setCity] = useState(activeCompany.city);
  const [state, setState] = useState(activeCompany.state);
  const [zipCode, setZipCode] = useState(activeCompany.zipCode);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepSuccess, setCepSuccess] = useState(false);

  // Bank & PIX
  const [bankName, setBankName] = useState(activeCompany.bankDetails.bankName);
  const [agency, setAgency] = useState(activeCompany.bankDetails.agency);
  const [account, setAccount] = useState(activeCompany.bankDetails.account);
  const [pixKeyType, setPixKeyType] = useState(activeCompany.bankDetails.pixKeyType);
  const [pixKey, setPixKey] = useState(activeCompany.bankDetails.pixKey);

  // Automatic CEP lookup that pre-fills address fields
  const handleCepChange = async (val: string) => {
    const formatted = formatCEP(val);
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
        // Fallback silently
      } finally {
        setIsSearchingCep(false);
      }
    } else {
      setCepSuccess(false);
    }
  };

  // Handle PIX key formatting based on type
  const handlePixKeyChange = (val: string) => {
    if (pixKeyType === 'cnpj') {
      setPixKey(formatCNPJ(val));
    } else if (pixKeyType === 'phone') {
      setPixKey(formatPhone(val));
    } else {
      setPixKey(val);
    }
  };

  // Payment configs
  const [acceptPix, setAcceptPix] = useState(activeCompany.paymentConfig.acceptPix);
  const [acceptCredit, setAcceptCredit] = useState(activeCompany.paymentConfig.acceptCredit);
  const [acceptDebit, setAcceptDebit] = useState(activeCompany.paymentConfig.acceptDebit);
  const [acceptCash, setAcceptCash] = useState(activeCompany.paymentConfig.acceptCash);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(activeCompany.paymentConfig.defaultDeliveryFee.toString());
  const [minOrderValue, setMinOrderValue] = useState(
    (activeCompany.paymentConfig.minOrderValue ?? activeCompany.paymentConfig.minimumOrderValue ?? 0).toString()
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateCompanyDetails({
      tradeName,
      name,
      logoUrl,
      coverUrl,
      cnpj,
      phone,
      email,
      address,
      number,
      neighborhood,
      city,
      state,
      zipCode,
      bankDetails: {
        ...activeCompany.bankDetails,
        bankName,
        agency,
        account,
        pixKeyType,
        pixKey
      },
      paymentConfig: {
        ...activeCompany.paymentConfig,
        acceptPix,
        acceptCredit,
        acceptDebit,
        acceptCash,
        defaultDeliveryFee: parseFloat(defaultDeliveryFee) || 0,
        minimumOrderValue: parseFloat(minOrderValue) || 0,
        minOrderValue: parseFloat(minOrderValue) || 0
      }
    });

    addToast('success', 'Configurações salvas!', 'Os dados da distribuidora e chaves bancárias foram atualizados.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>Configurações da Empresa & PIX</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalize os dados cadastrais, regras de delivery e contas bancárias de recebimento.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 0: Identidade Visual, Logomarca & Capa do Cardápio */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Identidade Visual do Cardápio (Logomarca & Foto de Capa)</span>
            </h2>
            <span className="text-[10px] text-slate-400">
              Aparece no topo do Cardápio Digital QR dos seus clientes
            </span>
          </div>

          {/* Live Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-36 w-full">
            <img
              src={coverUrl || '/src/assets/images/hero_beverages_showcase_1790213443501.jpg'}
              alt="Prévia da Capa"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-amber-400 p-1 flex items-center justify-center text-3xl shadow-xl overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>🍻</span>
                )}
              </div>
              <div>
                <span className="text-base font-extrabold text-white block">
                  {tradeName || 'Sua Distribuidora'}
                </span>
                <span className="text-xs text-amber-400 font-medium">Cardápio Digital Oficial</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Foto de Capa */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>Foto de Capa do Cardápio</span>
                </label>
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'cover')}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Carregar Nova Foto de Capa (PC/Celular)</span>
              </button>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Ou use uma URL de imagem:</span>
                <input
                  type="url"
                  placeholder="https://exemplo.com/minha-capa.jpg"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Logotipo / Perfil */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Logomarca / Foto de Perfil</span>
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Usar ícone padrão
                  </button>
                )}
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Enviar Logomarca da Loja (PC/Celular)</span>
              </button>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Ou use a URL da logo:</span>
                <input
                  type="url"
                  placeholder="https://exemplo.com/minha-logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Dados da Distribuidora */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building2 className="w-4 h-4" />
            <span>1. Informações Cadastrais da Distribuidora</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Nome Fantasia (Visível aos Clientes)</label>
              <input
                type="text"
                value={tradeName}
                onChange={e => setTradeName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Razão Social</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>CNPJ</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  getDigitCount(cnpj) === 14 ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {getDigitCount(cnpj)}/14
                </span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={18}
                value={cnpj}
                onChange={e => setCnpj(formatCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00"
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Telefone / WhatsApp</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  getDigitCount(phone) >= 10 ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {getDigitCount(phone)}/11
                </span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">E-mail Comercial</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Endereço da Distribuidora */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Endereço do Estabelecimento</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>CEP</span>
                  <div className="flex items-center gap-1">
                    {isSearchingCep && (
                      <span className="text-[10px] text-amber-400 font-medium flex items-center gap-0.5">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Buscando...
                      </span>
                    )}
                    {cepSuccess && !isSearchingCep && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> OK
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">{getDigitCount(zipCode)}/8</span>
                  </div>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={zipCode}
                  onChange={e => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Logradouro / Rua</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Avenida Paulista"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Número</span>
                  <span className="text-[10px] font-mono text-slate-400">máx. 6 núm.</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={number}
                  onChange={e => setNumber(formatAddressNumber(e.target.value, 6))}
                  placeholder="120"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Bairro</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={state}
                  onChange={e => setState(e.target.value.toUpperCase())}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs uppercase font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Dados Bancários & PIX */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>2. Dados Bancários & Recebimento via PIX</span>
          </h2>

          <p className="text-xs text-slate-400">
            Estes dados são exibidos no checkout do cardápio digital para que os clientes realizem o pagamento diretamente para sua conta.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Instituição Bancária</label>
              <input
                type="text"
                placeholder="Ex: Banco Itaú, Nubank, Bradesco"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Agência</span>
                <span className="text-[10px] font-mono text-slate-400">máx. 5 núm.</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={agency}
                onChange={e => setAgency(formatAgency(e.target.value))}
                placeholder="1234"
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Conta com Dígito</span>
                <span className="text-[10px] font-mono text-slate-400">máx. 12 carac.</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={account}
                onChange={e => setAccount(formatBankAccount(e.target.value))}
                placeholder="12345-6"
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-300">Tipo de Chave PIX</label>
              <select
                value={pixKeyType}
                onChange={e => {
                  const newType = e.target.value as any;
                  setPixKeyType(newType);
                  if (newType === 'cnpj') setPixKey(formatCNPJ(cnpj));
                  else if (newType === 'phone') setPixKey(formatPhone(phone));
                }}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone Celular</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Chave PIX Cadastrada *</span>
                {pixKeyType === 'cnpj' && (
                  <span className="text-[10px] font-mono text-slate-400">{getDigitCount(pixKey)}/14</span>
                )}
                {pixKeyType === 'phone' && (
                  <span className="text-[10px] font-mono text-slate-400">{getDigitCount(pixKey)}/11</span>
                )}
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={e => handlePixKeyChange(e.target.value)}
                maxLength={pixKeyType === 'cnpj' ? 18 : pixKeyType === 'phone' ? 15 : 60}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Taxas de Entrega e Meios de Pagamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>3. Delivery e Formas de Pagamento Aceitas</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Taxa Padrão de Entrega (R$)</label>
              <input
                type="number"
                step="0.50"
                value={defaultDeliveryFee}
                onChange={e => setDefaultDeliveryFee(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Valor Mínimo de Pedido (R$)</label>
              <input
                type="number"
                step="5.00"
                value={minOrderValue}
                onChange={e => setMinOrderValue(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-300 block mb-2">Métodos Habilitados:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPix}
                  onChange={e => setAcceptPix(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>PIX</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptCredit}
                  onChange={e => setAcceptCredit(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Cartão Crédito</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptDebit}
                  onChange={e => setAcceptDebit(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Cartão Débito</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptCash}
                  onChange={e => setAcceptCash(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Dinheiro</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
