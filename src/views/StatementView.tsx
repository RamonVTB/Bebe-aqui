import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, SubscriptionInvoice } from '../types';
import {
  FileText,
  Calendar,
  Printer,
  Download,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  CreditCard,
  QrCode,
  Search,
  ArrowUpRight,
  Filter,
  Receipt,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  X,
  Clock,
  MapPin,
  ChevronDown
} from 'lucide-react';

export const StatementView: React.FC = () => {
  const { activeCompany, orders, wholesaleOrders, activePlan, addToast } = useApp();

  // Selected period: '2026-08' (1st past month), '2026-07' (2nd past month), '2026-09' (current), '60d' (last 60 days)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'delivery' | 'counter' | 'table'>('all');
  
  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<SubscriptionInvoice | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const SUPPORT_PHONE = '31975346290';
  const SUPPORT_PHONE_FORMATTED = '(31) 97534-6290';

  // Periods configuration
  const periods = [
    { id: '2026-08', label: 'Agosto de 2026', badge: '1º Mês Passado', isPast: true },
    { id: '2026-07', label: 'Julho de 2026', badge: '2º Mês Passado', isPast: true },
    { id: '2026-09', label: 'Setembro de 2026', badge: 'Mês Vigente', isPast: false },
    { id: '60d', label: 'Últimos 60 Dias', badge: 'Bimestre Consolidado', isPast: true }
  ];

  // Filter orders by selected period
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      const year = orderDate.getFullYear();
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}-${month}`;

      // Period matching
      if (selectedPeriod === '60d') {
        // July and August 2026
        if (yearMonth !== '2026-07' && yearMonth !== '2026-08') return false;
      } else {
        if (yearMonth !== selectedPeriod) return false;
      }

      // Channel filter
      if (channelFilter !== 'all' && order.type !== channelFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = order.customerName.toLowerCase().includes(term);
        const matchesId = order.displayId.toLowerCase().includes(term);
        const matchesItems = order.items.some(i => i.productName.toLowerCase().includes(term));
        if (!matchesName && !matchesId && !matchesItems) return false;
      }

      return true;
    });
  }, [orders, selectedPeriod, channelFilter, searchTerm]);

  // Aggregate Metrics for selected period
  const metrics = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
    const orderCount = filteredOrders.length;
    const ticketMedio = orderCount > 0 ? totalSales / orderCount : 0;

    // Payments breakdown
    const byPayment: Record<string, number> = { pix: 0, credit_card: 0, debit_card: 0, cash: 0 };
    filteredOrders.forEach(o => {
      if (o.paymentStatus === 'paid') {
        const method = o.paymentMethod || 'pix';
        byPayment[method] = (byPayment[method] || 0) + o.total;
      }
    });

    // Channels breakdown
    const byChannel: Record<string, { count: number; total: number }> = {
      delivery: { count: 0, total: 0 },
      counter: { count: 0, total: 0 },
      table: { count: 0, total: 0 }
    };
    filteredOrders.forEach(o => {
      if (byChannel[o.type]) {
        byChannel[o.type].count += 1;
        if (o.paymentStatus === 'paid') byChannel[o.type].total += o.total;
      }
    });

    return { totalSales, orderCount, ticketMedio, byPayment, byChannel };
  }, [filteredOrders]);

  // Invoices for current company
  const companyInvoices: SubscriptionInvoice[] = useMemo(() => {
    if (activeCompany.subscriptionInvoices && activeCompany.subscriptionInvoices.length > 0) {
      return activeCompany.subscriptionInvoices;
    }
    // Default fallback invoices for previous 2 months
    return [
      {
        id: 'inv_ago',
        month: '2026-08',
        monthLabel: 'Agosto de 2026',
        planName: activeCompany.plan,
        planType: activeCompany.planType || 'distribuidora',
        amount: activeCompany.planPrice || 80.00,
        paidAt: '2026-08-01T09:32:05.000Z',
        paymentMethod: 'PIX Telefone (31) 97534-6290',
        pixTransactionId: 'E2E975346290-20260801-4419',
        status: 'paid',
        receiptNumber: 'REC-BBQ-202608-7261'
      },
      {
        id: 'inv_jul',
        month: '2026-07',
        monthLabel: 'Julho de 2026',
        planName: activeCompany.plan,
        planType: activeCompany.planType || 'distribuidora',
        amount: activeCompany.planPrice || 80.00,
        paidAt: '2026-07-01T11:20:18.000Z',
        paymentMethod: 'PIX Telefone (31) 97534-6290',
        pixTransactionId: 'E2E975346290-20260701-1903',
        status: 'paid',
        receiptNumber: 'REC-BBQ-202607-3310'
      }
    ];
  }, [activeCompany]);

  // Active invoice for selected period
  const activeInvoice = useMemo(() => {
    if (selectedPeriod === '60d') {
      return companyInvoices.find(inv => inv.month === '2026-08') || companyInvoices[0];
    }
    return companyInvoices.find(inv => inv.month === selectedPeriod);
  }, [companyInvoices, selectedPeriod]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Tipo', 'Cliente', 'Itens', 'Forma Pagamento', 'Status', 'Total (R$)'];
    const rows = filteredOrders.map(o => [
      o.displayId,
      new Date(o.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(o.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      o.type === 'delivery' ? 'Delivery' : o.type === 'table' ? `Mesa ${o.tableNumber || ''}` : 'Balcão',
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.items.map(i => `${i.quantity}x ${i.productName}`).join('; ')}"`,
      o.paymentMethod || 'PIX',
      o.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
      o.total.toFixed(2).replace('.', ',')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_${activeCompany.tradeName.replace(/\s+/g, '_')}_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Extrato Exportado!', 'Arquivo CSV gerado com sucesso para conciliação.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Extrato dos Meses Passados</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Auditoria & Suporte
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulte com total clareza todas as vendas, comandas e comprovantes da assinatura dos últimos 60 dias da sua distribuidora.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Tirar dúvida sobre o extrato com o suporte do BebêAqui"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Dúvida no Extrato?</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar planilha CSV para Excel"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Extrato Oficial</span>
          </button>
        </div>
      </div>

      {/* Period Selection Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Selecione o Mês para Consulta:</span>
          </span>
          <span className="text-xs text-slate-400">
            Distribuidora: <strong className="text-white">{activeCompany.tradeName}</strong> ({activeCompany.cnpj})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {periods.map(p => {
            const isSelected = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {p.badge}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <div className="font-bold text-sm text-white mt-1.5">{p.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faturado */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Faturamento Bruto</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            R$ {metrics.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">
            Total liquidado no período selecionado
          </p>
        </div>

        {/* Quantidade de Pedidos */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pedidos & Vendas</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {metrics.orderCount}
          </div>
          <p className="text-[11px] text-slate-400">
            Comandas de balcão, mesas e delivery
          </p>
        </div>

        {/* Ticket Médio */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            R$ {metrics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">
            Média por comanda / pedido
          </p>
        </div>

        {/* Assinatura BebêAqui */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Mensalidade BebêAqui</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-extrabold">Quitada</span>
            <span className="text-xs text-slate-400 font-mono">
              (R$ {(activeInvoice?.amount || activeCompany.planPrice || 80).toFixed(2)})
            </span>
          </div>
          <div className="pt-0.5">
            {activeInvoice && (
              <button
                type="button"
                onClick={() => setSelectedReceipt(activeInvoice)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Recibo PIX Oficial</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official BebêAqui Subscription Statement of Past Months */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Extrato de Pagamento da Assinatura BebêAqui (Últimos Meses)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprovantes oficiais emitidos para sua distribuidora com chave de conciliação PIX do Banco Central.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
            Chave Oficial: {SUPPORT_PHONE_FORMATTED}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companyInvoices.map((inv) => (
            <div
              key={inv.id}
              className={`p-4 rounded-2xl border transition-all ${
                inv.month === selectedPeriod
                  ? 'bg-slate-950 border-amber-500/60 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">{inv.monthLabel}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  PIX Confirmado
                </span>
              </div>

              <div className="py-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Plano:</span>
                  <span className="font-semibold text-slate-200">{inv.planName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Valor Pago:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    R$ {inv.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Data de Liquidação:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {new Date(inv.paidAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Autenticação:</span>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                    {inv.receiptNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReceipt(inv)}
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Visualizar Comprovante / Recibo</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Channels & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por Meio de Pagamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <CreditCard className="w-4 h-4" />
            <span>Faturamento por Meio de Pagamento</span>
          </h2>

          <div className="space-y-3">
            {[
              { label: 'PIX Direto na Chave', value: metrics.byPayment.pix || 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Cartão de Crédito', value: metrics.byPayment.credit_card || 0, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Cartão de Débito', value: metrics.byPayment.debit_card || 0, color: 'bg-indigo-500', text: 'text-indigo-400' },
              { label: 'Dinheiro em Espécie', value: metrics.byPayment.cash || 0, color: 'bg-amber-500', text: 'text-amber-400' }
            ].map((item, idx) => {
              const percent = metrics.totalSales > 0 ? (item.value / metrics.totalSales) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{item.label}</span>
                    <span className={`font-mono font-bold ${item.text}`}>
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por Canal de Venda */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <TrendingUp className="w-4 h-4" />
            <span>Faturamento por Canal de Atendimento</span>
          </h2>

          <div className="space-y-3">
            {[
              { label: '🛵 Entrega & Delivery Rápido', count: metrics.byChannel.delivery.count, total: metrics.byChannel.delivery.total, color: 'bg-amber-500' },
              { label: '🏪 Balcão / Venda Direta PDV', count: metrics.byChannel.counter.count, total: metrics.byChannel.counter.total, color: 'bg-blue-500' },
              { label: '🍻 Mesas & Comandas Presenciais', count: metrics.byChannel.table.count, total: metrics.byChannel.table.total, color: 'bg-emerald-500' }
            ].map((c, idx) => {
              const percent = metrics.totalSales > 0 ? (c.total / metrics.totalSales) * 100 : 0;
              return (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{c.label}</span>
                    <span className="text-[11px] text-slate-400">{c.count} pedidos realizados</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-400">
                      R$ {c.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-500">{percent.toFixed(0)}% do total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Statement Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Extrato Detalhado de Lançamentos & Vendas</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredOrders.length} registros localizados no período selecionado
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente ou item..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Canais</option>
              <option value="delivery">Delivery</option>
              <option value="counter">Balcão</option>
              <option value="table">Mesas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Pedido</th>
                <th className="py-3 px-3">Data e Hora</th>
                <th className="py-3 px-3">Cliente / Mesa</th>
                <th className="py-3 px-3">Canal</th>
                <th className="py-3 px-3">Itens</th>
                <th className="py-3 px-3">Pagamento</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum lançamento localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {order.displayId}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} {' '}
                      <span className="text-slate-500">
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-3">
                      {order.type === 'delivery' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                          Delivery
                        </span>
                      ) : order.type === 'table' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          Mesa {order.tableNumber}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold">
                          Balcão PDV
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px] max-w-[220px] truncate" title={order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}>
                      {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {order.paymentMethod || 'PIX'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderDetails(order)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Ver Cupom
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Box for Confidence & Assurance */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Garantia de Transparência & Suporte ao Administrador</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            O BebêAqui garante a integridade de todos os lançamentos passados da sua distribuidora. Caso reste qualquer dúvida de conciliação bancária, relatórios ou conferência de estoque dos meses anteriores, nossa equipe de suporte está à sua inteira disposição.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSupportModal(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar com o Suporte Oficial</span>
        </button>
      </div>

      {/* Modal: Official Subscription Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Recibo Oficial de Assinatura</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="text-center pb-3 border-b border-slate-800">
                <div className="text-base font-black text-amber-400">🍻 BEBÊAQUI SAAS OFICIAL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">COMPROVANTE DE LIQUIDAÇÃO DE MENSALIDADE</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">STATUS: 100% PAGO VIA PIX</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Distribuidora:</span>
                  <span className="font-bold text-white text-right truncate max-w-[200px]">{activeCompany.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CNPJ:</span>
                  <span className="text-slate-300">{activeCompany.cnpj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Competência:</span>
                  <span className="font-bold text-amber-300">{selectedReceipt.monthLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plano Ativo:</span>
                  <span className="text-slate-300">{selectedReceipt.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor Quitado:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    R$ {selectedReceipt.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data e Hora:</span>
                  <span className="text-slate-300">{new Date(selectedReceipt.paidAt).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chave PIX Oficial:</span>
                  <span className="text-amber-400 font-bold">{SUPPORT_PHONE_FORMATTED}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ID da Transação:</span>
                  <span className="text-[10px] text-slate-400">{selectedReceipt.pixTransactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nº do Recibo:</span>
                  <span className="text-[10px] text-slate-300">{selectedReceipt.receiptNumber}</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-slate-800">
                Documento emitido eletronicamente para fins de conferência contábil e suporte ao distribuidor.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Order Cupom Details */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Cupom da Venda {selectedOrderDetails.displayId}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="text-center pb-2 border-b border-slate-800">
                <div className="font-bold text-white text-sm">{activeCompany.tradeName}</div>
                <div className="text-[10px] text-slate-400">{activeCompany.cnpj}</div>
                <div className="text-[11px] text-amber-400 mt-1">
                  Pedido {selectedOrderDetails.displayId} — {selectedOrderDetails.type.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(selectedOrderDetails.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="space-y-1 divide-y divide-slate-800/40">
                <div className="flex justify-between font-bold text-slate-400 text-[10px] pb-1">
                  <span>ITEM</span>
                  <span>TOTAL</span>
                </div>
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-slate-200">
                    <span className="truncate max-w-[220px]">
                      {it.quantity}x {it.productName}
                    </span>
                    <span className="font-bold">
                      R$ {(it.unitPrice * it.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                {selectedOrderDetails.deliveryFee ? (
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {selectedOrderDetails.deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                ) : null}
                {selectedOrderDetails.serviceFee ? (
                  <div className="flex justify-between text-slate-400">
                    <span>Serviço / Mesa:</span>
                    <span>R$ {selectedOrderDetails.serviceFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                ) : null}
                {selectedOrderDetails.discount ? (
                  <div className="flex justify-between text-rose-400">
                    <span>Desconto Aplicado:</span>
                    <span>- R$ {selectedOrderDetails.discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-bold text-base text-emerald-400 pt-1 border-t border-slate-800">
                  <span>TOTAL PAGO:</span>
                  <span>R$ {selectedOrderDetails.total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Forma de Pagamento:</span>
                  <span className="font-bold text-white uppercase">{selectedOrderDetails.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cupom</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Support & Questions about Statement */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Suporte do Extrato & Feedbacks</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Tem alguma dúvida sobre algum lançamento de <strong>{selectedPeriod === '60d' ? 'dos últimos 60 dias' : selectedPeriod}</strong>,
                deseja solicitar uma conciliação detalhada ou enviar sugestões para o BebêAqui?
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-400">Canal Oficial:</span>
                  <span className="text-emerald-400 font-bold">Atendimento Direto</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-400">Telefone / WhatsApp:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {SUPPORT_PHONE_FORMATTED}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-400">Empresa Conectada:</span>
                  <span className="text-slate-200">{activeCompany.tradeName}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={`https://wa.me/55${SUPPORT_PHONE}?text=${encodeURIComponent(
                  `Olá, equipe BebêAqui! Sou da distribuidora ${activeCompany.tradeName} (CNPJ: ${activeCompany.cnpj}) e gostaria de tirar uma dúvida sobre o extrato do período ${selectedPeriod}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp Oficial</span>
              </a>

              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
