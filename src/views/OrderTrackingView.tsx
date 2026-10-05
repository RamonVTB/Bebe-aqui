import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Bike,
  UtensilsCrossed,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, activeCompany, setActivePage } = useApp();
  const [searchId, setSearchId] = useState('');

  // Latest customer order default if available
  const latestOrder = orders[0];
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(latestOrder || null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    const clean = searchId.trim().replace('#', '').toLowerCase();
    const found = orders.find(o => o.id.toLowerCase().includes(clean));
    if (found) {
      setSelectedOrder(found);
    } else {
      alert('Pedido não encontrado com o código informado.');
    }
  };

  const steps: { key: OrderStatus; label: string; icon: string; desc: string }[] = [
    { key: 'received', label: 'Pedido Recebido', icon: '📥', desc: 'A distribuidora recebeu seu pedido' },
    { key: 'preparing', label: 'Em Preparo', icon: '🍻', desc: 'Separando bebidas e gelo' },
    { key: 'ready', label: 'Pronto / Em Rota', icon: '🛵', desc: 'A caminho ou pronto para servir' },
    { key: 'delivered', label: 'Concluído', icon: '✅', desc: 'Pedido finalizado com sucesso' }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = selectedOrder ? getStepIndex(selectedOrder.status) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Acompanhar Pedido BebêAqui
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Consulte o status do seu pedido em tempo real pelo código da comanda.
        </p>
      </div>

      {/* Search Order Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Digite o código do seu pedido (Ex: #001 ou código completo)..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          Localizar
        </button>
      </form>

      {/* Active Order Card */}
      {selectedOrder ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Pedido</span>
              <h2 className="text-xl font-bold font-mono text-amber-400">
                #{selectedOrder.id.slice(-6).toUpperCase()}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 block">Horário do Pedido</span>
              <span className="text-xs font-mono text-white">
                {new Date(selectedOrder.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Progress Timeline Bar */}
          <div className="py-4">
            <div className="relative">
              {/* Line */}
              <div className="absolute top-5 left-4 right-4 h-1 bg-slate-800 -z-0" />
              <div
                className="absolute top-5 left-4 h-1 bg-amber-400 -z-0 transition-all duration-500"
                style={{ width: `${(currentStepIdx / (steps.length - 1)) * 90}%` }}
              />

              {/* Steps Icons */}
              <div className="relative z-10 flex justify-between">
                {steps.map((st, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={st.key} className="flex flex-col items-center text-center max-w-[80px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                        isDone
                          ? 'border-amber-400 bg-slate-900 shadow-lg shadow-amber-400/20'
                          : 'border-slate-800 bg-slate-950 text-slate-600'
                      }`}>
                        <span>{st.icon}</span>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
                        isCurrent ? 'text-amber-400' : isDone ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Destino do Pedido</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {selectedOrder.type === 'table' ? (
                  <>
                    <UtensilsCrossed className="w-4 h-4 text-blue-400" />
                    <span>Mesa {selectedOrder.tableNumber?.toString().padStart(2, '0')}</span>
                  </>
                ) : selectedOrder.type === 'delivery' ? (
                  <>
                    <Bike className="w-4 h-4 text-amber-400" />
                    <span>Entrega no Endereço</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-purple-400" />
                    <span>Retirada Balcão</span>
                  </>
                )}
              </div>

              {selectedOrder.customerAddress && (
                <p className="text-xs text-slate-300">
                  {selectedOrder.customerAddress.street}, {selectedOrder.customerAddress.number} - {selectedOrder.customerAddress.neighborhood}
                </p>
              )}

              <p className="text-xs text-slate-400">Cliente: {selectedOrder.customerName}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pagamento</span>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                R$ {selectedOrder.total.toFixed(2)}
              </div>
              <p className="text-xs text-slate-300 capitalize">
                Forma: {selectedOrder.paymentMethod === 'pix' ? 'PIX Instantâneo' : selectedOrder.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : selectedOrder.paymentMethod === 'debit_card' ? 'Cartão de Débito' : 'Dinheiro'}
              </p>
              {selectedOrder.changeFor && (
                <p className="text-xs text-slate-400">Troco para: R$ {selectedOrder.changeFor.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Itens Solicitados</span>
            <div className="divide-y divide-slate-800/60">
              {selectedOrder.items.map((i, idx) => (
                <div key={idx} className="py-2 flex justify-between text-xs">
                  <div className="text-white">
                    <span className="font-mono font-bold text-amber-400 mr-2">{i.quantity}x</span>
                    <span>{i.productName}</span>
                  </div>
                  <span className="font-mono text-slate-300">R$ {(i.unitPrice * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Distributor support */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Dúvidas sobre o pedido? Ligue para a distribuidora:</span>
            </div>
            <span className="font-mono font-bold text-xs text-white">{activeCompany.phone}</span>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-amber-400 mx-auto flex items-center justify-center text-xl">
            🍻
          </div>
          <p className="text-sm font-semibold text-white">Nenhum pedido selecionado</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Faça um pedido no cardápio digital ou digite o código da sua comanda acima.
          </p>
          <button
            onClick={() => setActivePage('menu')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            <span>Ir para o Cardápio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
