import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  Boxes,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Search,
  CheckCircle2,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  X
} from 'lucide-react';

export const StockView: React.FC = () => {
  const { products, updateProductStock, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Totals calculations
  const totalCostValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const totalSaleValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const totalItemsCount = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesLow = !filterLowStockOnly || p.stock <= p.minStock;
    return matchesSearch && matchesLow;
  });

  const handleOpenAdjust = (prod: Product, type: 'in' | 'out') => {
    setSelectedProduct(prod);
    setAdjustType(type);
    setAdjustQty('');
    setAdjustReason(type === 'in' ? 'Recebimento de lote de fornecedor' : 'Avaria / Quebra de garrafa');
    setIsModalOpen(true);
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(adjustQty) || 0;
    if (qty <= 0) return;

    if (adjustType === 'out' && qty > selectedProduct.stock) {
      alert('A quantidade de saída não pode ser maior que o estoque atual disponível.');
      return;
    }

    const delta = adjustType === 'in' ? qty : -qty;
    updateProductStock(selectedProduct.id, delta, adjustReason);

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" />
            <span>Controle de Estoque & Reposição</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitore o nível de estoque, registre recebimento de fornecedores e baixas de avarias.
          </p>
        </div>

        {/* Low Stock Warning Filter Pill */}
        {lowStockCount > 0 && (
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              filterLowStockOnly
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{lowStockCount} produtos com estoque baixo</span>
          </button>
        )}
      </div>

      {/* Financial Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total em Estoque</span>
          <div className="text-3xl font-extrabold font-mono text-white">
            {totalItemsCount} <span className="text-sm font-sans font-normal text-slate-400">unidades</span>
          </div>
          <p className="text-[11px] text-slate-400">Distribuídas em {products.length} bebidas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valor Investido (Custo)</span>
          <div className="text-3xl font-extrabold font-mono text-slate-200">
            R$ {totalCostValue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Capital imobilizado em mercadorias</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faturamento Projetado</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            R$ {totalSaleValue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Receita bruta ao vender todo o estoque</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por nome da cerveja, destilado, fardo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <button
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
            filterLowStockOnly
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {filterLowStockOnly ? 'Exibindo Apenas Estoque Baixo' : 'Exibir Todos'}
        </button>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-4 text-center">Estoque Atual</th>
                <th className="py-3.5 px-4 text-center">Mínimo</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Valor em Estoque</th>
                <th className="py-3.5 px-4 text-right">Ajustar Estoque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(prod => {
                const isCritical = prod.stock <= prod.minStock;
                const stockVal = prod.stock * prod.price;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">{prod.volume ? `${prod.volume} · ` : ''}{prod.unit}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono text-sm font-bold ${isCritical ? 'text-rose-400' : 'text-white'}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {prod.minStock}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Estoque Baixo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Normal</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                      R$ {stockVal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAdjust(prod, 'in')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Dar entrada / Compras"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Entrada</span>
                        </button>

                        <button
                          onClick={() => handleOpenAdjust(prod, 'out')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Dar saída / Avaria / Ajuste"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>Saída</span>
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

      {/* Adjust Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {adjustType === 'in' ? (
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <MinusCircle className="w-5 h-5 text-rose-400" />
                )}
                <h3 className="text-base font-bold">
                  {adjustType === 'in' ? 'Entrada de Estoque' : 'Baixa / Saída de Estoque'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <p className="font-bold text-white">{selectedProduct.name}</p>
              <p className="text-slate-400">Estoque atual: <span className="font-mono text-amber-400 font-bold">{selectedProduct.stock} {selectedProduct.unit}</span></p>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Quantidade a {adjustType === 'in' ? 'Adicionar' : 'Remover'} ({selectedProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Ex: 24"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Motivo / Observação</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de fornecedor Ambev, avaria no transporte..."
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${
                    adjustType === 'in'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  Confirmar {adjustType === 'in' ? 'Entrada' : 'Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
