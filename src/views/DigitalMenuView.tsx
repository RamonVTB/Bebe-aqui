import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { initialProducts, initialCategories } from '../data/initialData';
import {
  Beer,
  Search,
  Plus,
  ShoppingBag,
  Clock,
  MapPin,
  Share2,
  Check,
  Sparkles,
  QrCode,
  RotateCcw,
  Camera,
  Upload,
  Image as ImageIcon,
  Edit3,
  X,
  Palette,
  CheckCircle2
} from 'lucide-react';

interface DigitalMenuViewProps {
  onOpenCart?: () => void;
}

export const DigitalMenuView: React.FC<DigitalMenuViewProps> = ({ onOpenCart }) => {
  const {
    activeCompany,
    products,
    categories,
    addToCart,
    cartItemCount,
    cartTotal,
    addToast,
    customerTableNumber,
    setCustomerTableNumber,
    getTableQrUrl,
    seedSampleProducts,
    updateCompanyDetails,
    currentRole
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Customization modal state
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizeTab, setCustomizeTab] = useState<'cover' | 'logo'>('cover');
  const [tempCoverUrl, setTempCoverUrl] = useState(activeCompany.coverUrl || '');
  const [tempLogoUrl, setTempLogoUrl] = useState(activeCompany.logoUrl || '');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const canEditBranding = currentRole === 'admin' || currentRole === 'admin_distribuidora' || currentRole === 'staff';

  const coverPresets = [
    {
      title: 'Fachada & Expositor de Bebidas',
      url: '/src/assets/images/hero_beverages_showcase_1790213443501.jpg'
    },
    {
      title: 'Cervejas Trincando de Geladas',
      url: '/src/assets/images/cervejas_geladas_1790650954103.jpg'
    },
    {
      title: 'Adega & Destilados Premium',
      url: '/src/assets/images/destilados_garrafas_1790650978956.jpg'
    },
    {
      title: 'Energéticos & Latas em Fardos',
      url: '/src/assets/images/energeticos_latas_1790650990514.jpg'
    },
    {
      title: 'Ambiente Distribuidora & Balcão',
      url: '/src/assets/images/digital_menu_banner_1790213457483.jpg'
    },
    {
      title: 'Gelo, Águas & Sucos',
      url: '/src/assets/images/gelo_agua_mineral_1790651002825.jpg'
    }
  ];

  const logoPresets = [
    { label: 'Chopp & Cervejas', value: '🍻' },
    { label: 'Cerveja Gelada', value: '🍺' },
    { label: 'Destilados & Drinks', value: '🍸' },
    { label: 'Adega & Vinhos', value: '🍷' },
    { label: 'Gelo & Refresco', value: '🧊' },
    { label: 'Pronto Entrega', value: '🚚' }
  ];

  const handleOpenCustomize = (tab: 'cover' | 'logo') => {
    setCustomizeTab(tab);
    setTempCoverUrl(activeCompany.coverUrl || '/src/assets/images/hero_beverages_showcase_1790213443501.jpg');
    setTempLogoUrl(activeCompany.logoUrl || '');
    setIsCustomizeModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Arquivo muito grande', 'Selecione uma imagem de até 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'cover') {
        setTempCoverUrl(base64);
        addToast('info', 'Foto de capa carregada', 'Clique em Salvar para aplicar ao cardápio.');
      } else {
        setTempLogoUrl(base64);
        addToast('info', 'Logotipo carregado', 'Clique em Salvar para aplicar ao cardápio.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomization = () => {
    updateCompanyDetails({
      coverUrl: tempCoverUrl,
      logoUrl: tempLogoUrl
    });
    setIsCustomizeModalOpen(false);
    addToast('success', 'Visual atualizado!', 'A capa e o logotipo do seu cardápio digital foram salvos.');
  };

  // Guarantee products and categories always resolve even if context hasn't hydrated
  const displayProducts = (products && products.length > 0) ? products : initialProducts;
  const displayCategories = (categories && categories.length > 0) ? categories : initialCategories;

  const activeProducts = displayProducts.filter(p => p.active !== false);

  const filteredProducts = activeProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    if (selectedCat === 'all') return matchesSearch;

    const prodCategory = displayCategories.find(c => c.id === p.categoryId);
    const selectedCategoryObj = displayCategories.find(c => c.id === selectedCat);

    const matchesCat = p.categoryId === selectedCat || 
                       (prodCategory && selectedCategoryObj && prodCategory.slug === selectedCategoryObj.slug) ||
                       (prodCategory && prodCategory.name.toLowerCase() === selectedCat.toLowerCase());

    return matchesSearch && matchesCat;
  });

  const handleCopyMenuLink = () => {
    const link = customerTableNumber
      ? getTableQrUrl(activeCompany.id, customerTableNumber)
      : getTableQrUrl(activeCompany.id);
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    addToast('info', 'Link copiado!', 'O link do cardápio digital foi copiado.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Table Welcome Banner if customer arrived via Table QR Code */}
      {customerTableNumber && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-white shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-mono font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
              {customerTableNumber.toString().padStart(2, '0')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Conectado à Mesa {customerTableNumber.toString().padStart(2, '0')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Comanda Automática
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Seus pedidos serão lançados e preparados para esta mesa.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCustomerTableNumber(null)}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer shrink-0"
          >
            Sair da mesa
          </button>
        </div>
      )}

      {/* Distributor Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="h-44 sm:h-52 w-full relative">
          <img
            src={activeCompany.coverUrl || '/src/assets/images/hero_beverages_showcase_1790213443501.jpg'}
            alt={`Capa de ${activeCompany.tradeName}`}
            className="w-full h-full object-cover object-center opacity-40 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Quick Change Cover Button for Admin */}
          {canEditBranding && (
            <button
              type="button"
              onClick={() => handleOpenCustomize('cover')}
              className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all cursor-pointer hover:border-amber-400/50"
              title="Trocar a foto de capa da sua distribuidora"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Trocar Foto de Capa</span>
            </button>
          )}
        </div>

        <div className="relative px-6 pb-6 -mt-16 sm:-mt-12 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo / Profile Avatar with Quick Change button */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-amber-400 p-1 flex items-center justify-center text-4xl shadow-xl overflow-hidden">
                  {activeCompany.logoUrl ? (
                    <img
                      src={activeCompany.logoUrl}
                      alt={activeCompany.tradeName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-3xl">🍻</span>
                  )}
                </div>
                {canEditBranding && (
                  <button
                    type="button"
                    onClick={() => handleOpenCustomize('logo')}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md border-2 border-slate-900 transition-transform active:scale-95 cursor-pointer"
                    title="Trocar logo ou foto de perfil da distribuidora"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                  </button>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate tracking-tight">
                    {activeCompany.tradeName || activeCompany.name || 'BebêAqui Distribuidora'}
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Aberto agora" />
                </div>
                <p className="text-xs text-amber-400 font-medium">
                  "Seu pedido de bebidas, fácil e rápido."
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeCompany.city} - {activeCompany.state}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Entrega média: 25 a 40 min</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {canEditBranding && (
                <button
                  type="button"
                  onClick={() => handleOpenCustomize('cover')}
                  className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Personalizar Capa & Logo</span>
                </button>
              )}

              <button
                onClick={handleCopyMenuLink}
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copiedLink ? 'Copiado!' : 'Compartilhar Cardápio'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Customize Cover & Logo */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Personalizar Visual do Cardápio</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCustomizeTab('cover')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  customizeTab === 'cover'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Foto de Capa</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizeTab('logo')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  customizeTab === 'logo'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Logotipo / Perfil</span>
              </button>
            </div>

            {/* Preview Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-32 w-full">
              <img
                src={tempCoverUrl || '/src/assets/images/hero_beverages_showcase_1790213443501.jpg'}
                alt="Pré-visualização da Capa"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-amber-400 p-0.5 flex items-center justify-center text-2xl shadow-lg overflow-hidden shrink-0">
                  {tempLogoUrl ? (
                    <img src={tempLogoUrl} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span>🍻</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {activeCompany.tradeName || 'Sua Distribuidora'}
                  </span>
                  <span className="text-[10px] text-amber-400">Prévia do Cardápio</span>
                </div>
              </div>
            </div>

            {/* Tab: Cover */}
            {customizeTab === 'cover' && (
              <div className="space-y-4">
                {/* Upload from Computer/Mobile */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Carregar Foto do Computador ou Celular:</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Envie a foto real da sua fachada, loja ou estoque (JPG ou PNG).
                  </p>
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
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Escolher Arquivo de Imagem...</span>
                  </button>
                </div>

                {/* Preset Options */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200">
                    Ou selecione um tema profissional de bebidas:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {coverPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTempCoverUrl(preset.url)}
                        className={`group relative h-20 rounded-xl overflow-hidden border text-left p-2 flex flex-col justify-end transition-all cursor-pointer ${
                          tempCoverUrl === preset.url
                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                        <span className="relative z-10 text-[10px] font-bold text-white leading-tight">
                          {preset.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct URL */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Ou informe uma URL de Imagem:</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-capa.jpg"
                    value={tempCoverUrl}
                    onChange={(e) => setTempCoverUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Tab: Logo */}
            {customizeTab === 'logo' && (
              <div className="space-y-4">
                {/* Upload from Computer/Mobile */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enviar Logomarca da sua Distribuidora:</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Envie a sua marca ou foto de perfil (quadrada, PNG ou JPG).
                  </p>
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
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Escolher Arquivo da Logomarca...</span>
                  </button>
                </div>

                {/* Direct Logo URL */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Ou informe a URL da sua Logo:</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-logo.png"
                    value={tempLogoUrl}
                    onChange={(e) => setTempLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Remove Logo */}
                {tempLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setTempLogoUrl('')}
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                  >
                    Remover logo personalizada (usar ícone padrão)
                  </button>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomization}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar e Atualizar Cardápio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar cerveja, refrigerante, gin, vodka, vinho..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Todas as Bebidas ({activeProducts.length})
          </button>
          {displayCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State Banner if no products match current filter */}
      {filteredProducts.length === 0 && (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto">
            🍻
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Nenhuma bebida encontrada</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
              {search || selectedCat !== 'all' 
                ? 'Limpe a pesquisa ou troque de categoria para ver as outras bebidas do cardápio.'
                : 'Clique no botão abaixo para restaurar as 30 bebidas do cardápio demo.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {(search || selectedCat !== 'all') ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCat('all');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Ver Todas as {activeProducts.length} Bebidas
              </button>
            ) : (
              <button
                onClick={seedSampleProducts}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Carregar Catálogo Completo (30 Bebidas)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product List / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => {
          const isOutOfStock = product.stock <= 0;

          return (
            <div
              key={product.id}
              className={`p-4 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                isOutOfStock ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-amber-500/40 hover:shadow-lg'
              }`}
            >
              <div className="space-y-3">
                <div className="relative h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={product.imageUrl || '/src/assets/images/cervejas_geladas_1790650954103.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/src/assets/images/cervejas_geladas_1790650954103.jpg';
                    }}
                  />
                  {product.volume && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono font-semibold text-white border border-slate-700">
                      {product.volume}
                    </span>
                  )}
                  {product.alcoholic && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-rose-950/80 text-[9px] font-extrabold text-rose-300 border border-rose-500/30">
                      +18
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Preço</span>
                  <span className="text-lg font-extrabold font-mono text-amber-400">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Esgotado' : 'Adicionar'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar (when cart has items) */}
      {cartItemCount > 0 && onOpenCart && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-3">
          <button
            onClick={onOpenCart}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-between shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Ver Pedido ({cartItemCount} itens)</span>
            </div>
            <span className="font-mono text-base font-extrabold">
              R$ {cartTotal.toFixed(2)} →
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
