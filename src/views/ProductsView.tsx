import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Beer,
  FolderPlus,
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Link2,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Cervejas Geladas (Lager/Puro Malte)', url: '/src/assets/images/cervejas_geladas_1790650954103.jpg' },
  { label: 'Refrigerantes & Sucos', url: '/src/assets/images/refrigerantes_latas_1790650967311.jpg' },
  { label: 'Destilados, Gin & Whisky', url: '/src/assets/images/destilados_garrafas_1790650978956.jpg' },
  { label: 'Energéticos Gelados', url: '/src/assets/images/energeticos_latas_1790650990514.jpg' },
  { label: 'Água Mineral & Gelo 5kg', url: '/src/assets/images/gelo_agua_mineral_1790651002825.jpg' },
  { label: 'Chopp & Coquetel', url: '/src/assets/images/cocktail_craft_beer_1790213468643.jpg' }
];

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  // Image upload & tab state
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '10',
    unit: 'un' as Product['unit'],
    volume: '',
    imageUrl: '',
    alcoholic: true,
    active: true
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    if (selectedCategory === 'all') return matchesSearch;

    const prodCategory = categories.find(c => c.id === p.categoryId);
    const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

    const matchesCat = p.categoryId === selectedCategory ||
                       (prodCategory && selectedCategoryObj && prodCategory.slug === selectedCategoryObj.slug);
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadError(null);
    setImageTab('upload');
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      description: '',
      price: '',
      costPrice: '',
      stock: '',
      minStock: '10',
      unit: 'un',
      volume: '',
      imageUrl: '/src/assets/images/cocktail_craft_beer_1790213468643.jpg',
      alcoholic: true,
      active: true
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setUploadError(null);
    setImageTab('upload');
    setFormData({
      name: p.name,
      categoryId: p.categoryId,
      description: p.description,
      price: p.price.toString(),
      costPrice: p.costPrice.toString(),
      stock: p.stock.toString(),
      minStock: p.minStock.toString(),
      unit: p.unit,
      volume: p.volume,
      imageUrl: p.imageUrl || '',
      alcoholic: p.alcoholic ?? true,
      active: p.active
    });
    setIsProductModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo excede o limite de 5MB. Escolha uma imagem menor.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormData(prev => ({ ...prev, imageUrl: event.target!.result as string }));
      }
    };
    reader.onerror = () => {
      setUploadError('Erro ao ler a imagem. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formData.price) || 0;
    const costNum = parseFloat(formData.costPrice) || 0;
    const stockNum = parseInt(formData.stock) || 0;
    const minStockNum = parseInt(formData.minStock) || 5;
    const finalImage = formData.imageUrl.trim() || '/src/assets/images/hero_beverages_showcase_1790213443501.jpg';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        price: priceNum,
        costPrice: costNum,
        stock: stockNum,
        minStock: minStockNum,
        unit: formData.unit,
        volume: formData.volume,
        imageUrl: finalImage,
        alcoholic: formData.alcoholic,
        active: formData.active
      });
    } else {
      addProduct({
        name: formData.name,
        categoryId: formData.categoryId || categories[0]?.id || 'cat_default',
        description: formData.description,
        price: priceNum,
        costPrice: costNum,
        stock: stockNum,
        minStock: minStockNum,
        unit: formData.unit,
        volume: formData.volume,
        alcoholic: formData.alcoholic,
        active: formData.active,
        imageUrl: finalImage
      });
    }

    setIsProductModalOpen(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
    setIsCategoryModalOpen(false);
  };

  // Profit Margin Calculator preview
  const numPrice = parseFloat(formData.price) || 0;
  const numCost = parseFloat(formData.costPrice) || 0;
  const calculatedMargin = numPrice > 0 ? (((numPrice - numCost) / numPrice) * 100).toFixed(1) : '0';
  const calculatedProfit = (numPrice - numCost).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Produtos & Categorias</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastre bebidas, defina preços de venda e custo, controle estoque e organize o cardápio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>Nova Categoria</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Bebida</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome da bebida, marca ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">Todas as Categorias ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Bebida / Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-right">Preço Venda</th>
                <th className="py-3.5 px-4 text-right">Preço Custo</th>
                <th className="py-3.5 px-4 text-center">Estoque Atual</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(prod => {
                const cat = categories.find(c => c.id === prod.categoryId);
                const isLowStock = prod.stock <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 flex-shrink-0 group cursor-pointer"
                          onClick={() => handleOpenEdit(prod)}
                          title="Clique para editar dados ou trocar foto"
                        >
                          <img
                            src={prod.imageUrl || '/src/assets/images/hero_beverages_showcase_1790213443501.jpg'}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-4 h-4 text-amber-300" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div
                            className="font-bold text-white text-xs hover:text-amber-400 cursor-pointer flex items-center gap-1.5"
                            onClick={() => handleOpenEdit(prod)}
                          >
                            <span className="truncate">{prod.name}</span>
                            {prod.alcoholic && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30 font-bold flex-shrink-0">
                                +18
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {prod.volume ? `${prod.volume} · ` : ''}{prod.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {cat ? cat.name : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                      R$ {prod.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      R$ {prod.costPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        isLowStock ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-200'
                      }`}>
                        {isLowStock && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        {prod.stock} {prod.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {prod.active ? (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Editar bebida"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover "${prod.name}" do cardápio?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Beer className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {editingProduct ? 'Editar Bebida / Produto' : 'Cadastrar Nova Bebida no BebêAqui'}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Nome do Produto / Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cerveja Artesanal IPA 500ml"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Categoria *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Volume / Embalagem</label>
                  <input
                    type="text"
                    placeholder="Ex: 350ml, 600ml, 1 Litro, 6x 330ml"
                    value={formData.volume}
                    onChange={e => setFormData({ ...formData, volume: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Photo Management Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Foto do Produto (Exibida no Cardápio Digital)</span>
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpar foto</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Photo Preview Card */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 flex-shrink-0 flex items-center justify-center shadow-inner group">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                        <span className="text-[10px]">Sem foto</span>
                      </div>
                    )}
                    {formData.volume && (
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-white border border-slate-700">
                        {formData.volume}
                      </span>
                    )}
                  </div>

                  {/* Photo Selection Tabs & Controls */}
                  <div className="flex-1 w-full space-y-2.5">
                    {/* Method Tabs */}
                    <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-[11px] font-medium">
                      <button
                        type="button"
                        onClick={() => setImageTab('upload')}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          imageTab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload do Dispositivo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('url')}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          imageTab === 'url' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Link Web</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('presets')}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          imageTab === 'presets' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Galeria Rápida</span>
                      </button>
                    </div>

                    {/* Tab 1: Upload */}
                    {imageTab === 'upload' && (
                      <div className="space-y-2">
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-colors">
                          <Upload className="w-5 h-5 text-amber-400 mb-1" />
                          <span className="text-xs font-semibold text-slate-200 text-center">
                            Escolher foto do computador ou tirar pelo celular
                          </span>
                          <span className="text-[10px] text-slate-400 text-center mt-0.5">
                            JPG, PNG, WEBP (máx. 5MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {uploadError && (
                          <p className="text-[11px] text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {uploadError}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tab 2: URL */}
                    {imageTab === 'url' && (
                      <div className="space-y-1.5">
                        <input
                          type="url"
                          placeholder="https://exemplo.com/foto-bebida.jpg"
                          value={formData.imageUrl}
                          onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <p className="text-[10px] text-slate-400">
                          Cole o link direto da imagem (URL da internet ou CDN da distribuidora)
                        </p>
                      </div>
                    )}

                    {/* Tab 3: Presets */}
                    {imageTab === 'presets' && (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {PRESET_IMAGES.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, imageUrl: preset.url }))}
                              className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                                formData.imageUrl === preset.url
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-7 h-7 rounded object-cover flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[10px] font-medium leading-tight truncate">
                                {preset.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Preço Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Estoque Atual *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Estoque Mínimo</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Automatic Profit Margins Callout */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Lucro Unitário: <strong className="text-emerald-400 font-mono">R$ {calculatedProfit}</strong></span>
                <span className="text-slate-400">Margem Bruta Estimada: <strong className="text-amber-400 font-mono">{calculatedMargin}%</strong></span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Descrição do Produto (Cardápio)</label>
                <textarea
                  rows={2}
                  placeholder="Descreva sabor, lúpulo, graduação alcoólica ou informações adicionais..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Produto Ativo no Cardápio</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.alcoholic}
                    onChange={e => setFormData({ ...formData, alcoholic: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Bebida Alcoólica (+18)</span>
                </label>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Salvar Bebida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold">Nova Categoria de Bebidas</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cervejas Especiais, Whiskies, Sucos"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
