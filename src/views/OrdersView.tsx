import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  ClipboardList,
  Filter,
  CheckCircle2,
  Clock,
  Bike,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  QrCode,
  MapPin,
  Phone,
  ArrowRight,
  XCircle,
  Search
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, activeCompany } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          (order.tableNumber && `mesa ${order.tableNumber}`.includes(search.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Recebido</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">Em Preparo</span>;
      case 'ready':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">Pronto / Em Rota</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Concluído</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">Cancelado</span>;
    }
  };

  const getNextStatusAction = (order: Order) => {
    if (order.status === 'received') {
      return (
        <button
          onClick={() => updateOrderStatus(order.id, 'preparing')}
          className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Iniciar Preparo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }
    if (order.status === 'preparing') {
      return (
        <button
          onClick={() => updateOrderStatus(order.id, 'ready')}
          className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{order.type === 'delivery' ? 'Despachar Entrega' : 'Pronto para Servir'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }
    if (order.status === 'ready') {
      return (
        <button
          onClick={() => updateOrderStatus(order.id, 'delivered')}
          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Finalizar Pedido</span>
        </button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-400" />
            <span>Gestão de Pedidos em Tempo Real</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Controle a esteira de pedidos de mesas, entregas a domicílio e balcão.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl">
            {orders.filter(o => o.status === 'received' || o.status === 'preparing').length} pedidos em andamento
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, mesa ou nº do pedido..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">Todos os Status ({orders.length})</option>
            <option value="received">Recebidos</option>
            <option value="preparing">Em Preparo</option>
            <option value="ready">Prontos / Em Rota</option>
            <option value="delivered">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        <div className="sm:col-span-3 flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">Todos os Tipos</option>
            <option value="table">Apenas Mesas</option>
            <option value="delivery">Apenas Entrega / Delivery</option>
            <option value="counter">Apenas Balcão</option>
          </select>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map(order => {
          const formattedDate = new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={order.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                order.status === 'received'
                  ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-white">
                      #{order.id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formattedDate}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Destination & Customer */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    {order.type === 'table' && (
                      <>
                        <UtensilsCrossed className="w-4 h-4 text-blue-400" />
                        <span>Mesa {order.tableNumber?.toString().padStart(2, '0')}</span>
                      </>
                    )}
                    {order.type === 'delivery' && (
                      <>
                        <Bike className="w-4 h-4 text-amber-400" />
                        <span>Entrega Delivery</span>
                      </>
                    )}
                    {order.type === 'counter' && (
                      <>
                        <ShoppingBag className="w-4 h-4 text-purple-400" />
                        <span>Retirada Balcão</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-white truncate">
                    {order.customerName}
                  </p>

                  {order.originTerminalName && (
                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span>📱</span> {order.originTerminalName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Phone className="w-3 h-3" />
                    <span>{order.customerPhone}</span>
                  </div>

                  {order.customerAddress && (
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-0.5 mt-1">
                      <div className="flex items-center gap-1 font-medium text-amber-300">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{order.customerAddress.street}, {order.customerAddress.number}</span>
                      </div>
                      <p className="text-slate-400 truncate">
                        {order.customerAddress.neighborhood} · {order.customerAddress.city}
                      </p>
                      {order.customerAddress.complement && (
                        <p className="text-slate-400 text-[10px]">Comp: {order.customerAddress.complement}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Itens do Pedido</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="truncate pr-2">
                          <span className="font-mono font-bold text-amber-400 mr-1.5">{item.quantity}x</span>
                          <span className="text-slate-200">{item.productName}</span>
                          {item.volume && <span className="text-[10px] text-slate-400 ml-1">({item.volume})</span>}
                        </div>
                        <span className="font-mono text-slate-300 shrink-0">
                          R$ {(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-[11px] text-amber-300/90 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                      Obs: {order.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Bottom: Total, Payment & Actions */}
              <div className="pt-4 mt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span className="uppercase font-semibold">
                      {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'credit_card' ? 'Crédito' : order.paymentMethod === 'debit_card' ? 'Débito' : 'Dinheiro'}
                    </span>
                    {order.changeFor ? ` (Troco p/ R$${order.changeFor})` : ''}
                  </div>
                  <div className="font-mono font-extrabold text-base text-emerald-400">
                    R$ {order.total.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {getNextStatusAction(order)}

                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      onClick={() => {
                        if (confirm('Deseja cancelar este pedido?')) {
                          updateOrderStatus(order.id, 'cancelled');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
                      title="Cancelar pedido"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
