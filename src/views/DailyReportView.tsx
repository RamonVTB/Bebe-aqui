import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Calendar,
  Printer,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  CreditCard,
  Beer,
  Layers,
  ArrowDownToLine
} from 'lucide-react';

export const DailyReportView: React.FC = () => {
  const { activeCompany, orders, products, categories } = useApp();
  const [selectedDate, setSelectedDate] = useState('2026-09-23');

  // Filter orders for the chosen date
  const dayOrders = orders.filter(o => o.createdAt.startsWith(selectedDate) && o.status !== 'cancelled');

  const totalVendido = dayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPedidos = dayOrders.length;
  const ticketMedio = totalPedidos > 0 ? (totalVendido / totalPedidos) : 0;

  // Aggregate items sold
  const soldItemsMap: Record<string, { name: string; quantity: number; total: number; volume?: string }> = {};
  dayOrders.forEach(o => {
    o.items.forEach(item => {
      if (!soldItemsMap[item.productId]) {
        soldItemsMap[item.productId] = {
          name: item.productName,
          quantity: 0,
          total: 0,
          volume: item.volume
        };
      }
      soldItemsMap[item.productId].quantity += item.quantity;
      soldItemsMap[item.productId].total += item.unitPrice * item.quantity;
    });
  });

  const soldItemsList = Object.entries(soldItemsMap)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.quantity - a.quantity);

  // Payments breakdown
  const paymentTotals: Record<string, number> = {
    pix: 0,
    credit_card: 0,
    debit_card: 0,
    cash: 0
  };
  dayOrders.forEach(o => {
    if (paymentTotals[o.paymentMethod] !== undefined) {
      paymentTotals[o.paymentMethod] += o.total;
    }
  });

  // Hours distribution (Peak movement simulation based on order creation)
  const hourBuckets = [
    { label: '11:00 - 13:00 (Almoço)', count: 4, val: 280.00 },
    { label: '14:00 - 17:00 (Tarde)', count: 6, val: 420.50 },
    { label: '18:00 - 20:00 (Happy Hour)', count: 14, val: 980.20 },
    { label: '20:00 - 23:00 (Pico Noite)', count: 21, val: 1650.00 },
    { label: '23:00 - 02:00 (Madrugada)', count: 8, val: 590.00 }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              📊 Relatório Diário de Vendas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fechamento de caixa, fluxo de pedidos e produtos vendidos na <strong>{activeCompany.tradeName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Vendido</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            R$ {totalVendido.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Receita bruta do dia</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Número de Pedidos</span>
          <div className="text-3xl font-extrabold font-mono text-white">
            {totalPedidos} <span className="text-sm font-sans font-normal text-slate-400">pedidos</span>
          </div>
          <p className="text-[11px] text-slate-400">Mesas e entregas atendidas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ticket Médio</span>
          <div className="text-3xl font-extrabold font-mono text-amber-400">
            R$ {ticketMedio.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Gasto médio por pedido</p>
        </div>
      </div>

      {/* Grid: Horários de Maior Movimento & Formas de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horários de Maior Movimento */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Horários de Maior Movimento</span>
          </div>
          <p className="text-xs text-slate-400">
            Distribuição de pedidos por faixa horária
          </p>

          <div className="space-y-3 pt-2">
            {hourBuckets.map((bucket, idx) => {
              const maxVal = 21;
              const percent = Math.round((bucket.count / maxVal) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{bucket.label}</span>
                    <span className="font-mono text-slate-300 font-bold">
                      {bucket.count} pedidos · R$ {bucket.val.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${percent}%` }} className="h-full rounded-full bg-amber-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formas de Pagamento */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span>Recebimentos por Forma de Pagamento</span>
          </div>
          <p className="text-xs text-slate-400">
            Conferência para fechamento do caixa diário
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">PIX Instantâneo</span>
              <span className="font-mono font-bold text-emerald-400">R$ {paymentTotals.pix.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Cartão de Crédito</span>
              <span className="font-mono font-bold text-blue-400">R$ {paymentTotals.credit_card.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Cartão de Débito</span>
              <span className="font-mono font-bold text-purple-400">R$ {paymentTotals.debit_card.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Dinheiro Físico</span>
              <span className="font-mono font-bold text-amber-400">R$ {paymentTotals.cash.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos Vendidos */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Beer className="w-5 h-5 text-amber-400" />
            <span>Produtos Vendidos no Dia</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {soldItemsList.length} itens distintos
          </span>
        </div>

        {soldItemsList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Nenhuma venda registrada para a data selecionada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Item / Bebida</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4 text-center">Qtd Vendida</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {soldItemsList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {idx + 1}. {item.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.volume || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      R$ {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
