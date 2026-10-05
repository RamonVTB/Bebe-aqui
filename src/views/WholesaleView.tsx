import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  WholesaleOrder,
  WholesaleOrderItem,
  WholesaleCustomer,
  WholesaleOrderStatus,
  WholesalePackageType,
  WholesalePaymentCondition
} from '../types';
import {
  Package,
  Plus,
  Search,
  Printer,
  FileText,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Send,
  User,
  Phone,
  MapPin,
  Sparkles,
  Share2,
  Boxes,
  Layers,
  ChevronRight,
  Filter,
  Check,
  X,
  CreditCard,
  QrCode,
  AlertCircle,
  Copy
} from 'lucide-react';

export const WholesaleView: React.FC = () => {
  const {
    products,
    wholesaleOrders,
    wholesaleCustomers,
    addWholesaleOrder,
    updateWholesaleOrderStatus,
    addWholesaleCustomer,
    activeCompany,
    activePlan,
    canAccessWholesale,
    switchCompanyPlan,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'new_order' | 'customers' | 'price_table'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<WholesaleOrder | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

  // New Wholesale Order Form State (matching Datacaixa POS video flow)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(wholesaleCustomers[0]?.id || '');
  const [selectedSeller, setSelectedSeller] = useState<string>('Roberto Vendas (Atacado)');
  const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada'>('entrega');
  const [deliveryDate, setDeliveryDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [paymentCondition, setPaymentCondition] = useState<WholesalePaymentCondition>('boleto_14_28d');
  const [orderNotes, setOrderNotes] = useState('');
  const [freightFee, setFreightFee] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Items in creation draft
  const [draftItems, setDraftItems] = useState<WholesaleOrderItem[]>([
    {
      productId: 'prod_1',
      productName: 'Heineken 600ml',
      packageType: 'caixa',
      itemsPerPackage: 24,
      packageQuantity: 5,
      totalUnits: 120,
      unitPrice: 7.50,
      packagePrice: 180.00,
      totalPrice: 900.00
    },
    {
      productId: 'prod_5',
      productName: 'Cerveja Skol Lata 350ml',
      packageType: 'fardo',
      itemsPerPackage: 12,
      packageQuantity: 10,
      totalUnits: 120,
      unitPrice: 3.10,
      packagePrice: 37.20,
      totalPrice: 372.00
    }
  ]);

  // Product addition state
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>(products[0]?.id || 'prod_1');
  const [packageTypeToAdd, setPackageTypeToAdd] = useState<WholesalePackageType>('caixa');
  const [packageQtyToAdd, setPackageQtyToAdd] = useState<number>(5);

  // New Customer Form State
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    tradeName: '',
    document: '',
    stateRegistration: '',
    phone: '',
    email: '',
    address: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    creditLimit: 10000,
    paymentTerms: 'Boleto 14/28 dias',
    notes: ''
  });

  const selectedCustomerObj = useMemo(() => {
    return wholesaleCustomers.find(c => c.id === selectedCustomerId) || wholesaleCustomers[0];
  }, [wholesaleCustomers, selectedCustomerId]);

  // Calculations for order draft
  const draftSubtotal = useMemo(() => {
    return draftItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [draftItems]);

  const draftTotalPackages = useMemo(() => {
    return draftItems.reduce((acc, item) => acc + item.packageQuantity, 0);
  }, [draftItems]);

  const draftTotalUnits = useMemo(() => {
    return draftItems.reduce((acc, item) => acc + item.totalUnits, 0);
  }, [draftItems]);

  const draftTotal = useMemo(() => {
    return Math.max(0, draftSubtotal - discountValue + freightFee);
  }, [draftSubtotal, discountValue, freightFee]);

  // Wholesale summary stats
  const totalWholesaleRevenue = useMemo(() => {
    return wholesaleOrders.reduce((acc, o) => acc + o.total, 0);
  }, [wholesaleOrders]);

  const totalWholesalePackages = useMemo(() => {
    return wholesaleOrders.reduce((acc, o) => acc + o.totalPackages, 0);
  }, [wholesaleOrders]);

  const filteredOrders = useMemo(() => {
    return wholesaleOrders.filter(o => {
      const matchSearch =
        o.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customerTradeName && o.customerTradeName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [wholesaleOrders, searchTerm, statusFilter]);

  // Handle adding an item to the draft
  const handleAddItemToDraft = () => {
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    let itemsPerPkg = 12;
    if (packageTypeToAdd === 'caixa' || packageTypeToAdd === 'engradado') itemsPerPkg = 24;
    if (packageTypeToAdd === 'pack') itemsPerPkg = 6;
    if (packageTypeToAdd === 'pallet') itemsPerPkg = 72;
    if (packageTypeToAdd === 'unidade') itemsPerPkg = 1;

    // Wholesale discount: ~18% lower than retail price
    const wholesaleUnitCost = +(prod.price * 0.82).toFixed(2);
    const packageCost = +(wholesaleUnitCost * itemsPerPkg).toFixed(2);
    const totalItemPrice = +(packageCost * packageQtyToAdd).toFixed(2);
    const totalUnits = itemsPerPkg * packageQtyToAdd;

    const newItem: WholesaleOrderItem = {
      productId: prod.id,
      productName: prod.name,
      packageType: packageTypeToAdd,
      itemsPerPackage: itemsPerPkg,
      packageQuantity: packageQtyToAdd,
      totalUnits,
      unitPrice: wholesaleUnitCost,
      packagePrice: packageCost,
      totalPrice: totalItemPrice
    };

    setDraftItems(prev => [...prev, newItem]);
    addToast('success', 'Bebida adicionada ao pedido!', `${packageQtyToAdd}x ${packageTypeToAdd.toUpperCase()} de ${prod.name}`);
  };

  const handleRemoveDraftItem = (index: number) => {
    setDraftItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrder = () => {
    if (!selectedCustomerObj) {
      addToast('error', 'Selecione um cliente', 'Escolha o cliente B2B para emitir o pedido de atacado.');
      return;
    }

    if (draftItems.length === 0) {
      addToast('error', 'Pedido sem itens', 'Adicione pelo menos uma caixa ou fardo de bebida.');
      return;
    }

    const createdOrder = addWholesaleOrder({
      customerId: selectedCustomerObj.id,
      customerName: selectedCustomerObj.name,
      customerTradeName: selectedCustomerObj.tradeName,
      customerDocument: selectedCustomerObj.document,
      customerPhone: selectedCustomerObj.phone,
      deliveryAddress: selectedCustomerObj.address + ', ' + selectedCustomerObj.neighborhood + ' - ' + selectedCustomerObj.city,
      sellerName: selectedSeller,
      items: draftItems,
      subtotal: draftSubtotal,
      discount: discountValue,
      freightFee,
      total: draftTotal,
      totalPackages: draftTotalPackages,
      totalUnits: draftTotalUnits,
      paymentCondition,
      deliveryType,
      deliveryDate,
      status: 'confirmado',
      notes: orderNotes
    });

    setSelectedOrderForSlip(createdOrder);
    setShowSlipModal(true);
    setActiveTab('orders');
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.document || !newCustomerForm.phone) {
      addToast('error', 'Preencha os campos obrigatórios', 'Razão social/nome, CNPJ/CPF e telefone.');
      return;
    }

    const created = addWholesaleCustomer({
      name: newCustomerForm.name,
      tradeName: newCustomerForm.tradeName || newCustomerForm.name,
      document: newCustomerForm.document,
      stateRegistration: newCustomerForm.stateRegistration,
      phone: newCustomerForm.phone,
      email: newCustomerForm.email,
      address: newCustomerForm.address,
      neighborhood: newCustomerForm.neighborhood,
      city: newCustomerForm.city,
      state: newCustomerForm.state,
      creditLimit: Number(newCustomerForm.creditLimit) || 10000,
      paymentTerms: newCustomerForm.paymentTerms,
      notes: newCustomerForm.notes
    });

    setSelectedCustomerId(created.id);
    setShowNewCustomerModal(false);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleCopyOrderText = (order: WholesaleOrder) => {
    const text = `*DISTRIBUIDORA BEBÊAQUI - PEDIDO DE ATACADO ${order.displayId}*\n` +
      `📅 Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}\n` +
      `🏢 Cliente: ${order.customerTradeName || order.customerName}\n` +
      `📄 CNPJ/CPF: ${order.customerDocument}\n` +
      `📞 Telefone: ${order.customerPhone}\n` +
      `📍 Endereço: ${order.deliveryAddress}\n` +
      `----------------------------------------\n` +
      `📦 ITENS DO PEDIDO:\n` +
      order.items.map(it => `• ${it.packageQuantity}x ${it.packageType.toUpperCase()} - ${it.productName} (${it.itemsPerPackage} un/pkg) = R$ ${it.totalPrice.toFixed(2).replace('.', ',')}`).join('\n') +
      `\n----------------------------------------\n` +
      `📦 Total Volumes: ${order.totalPackages} caixas/fardos (${order.totalUnits} un)\n` +
      `💰 Subtotal: R$ ${order.subtotal.toFixed(2).replace('.', ',')}\n` +
      `🚚 Frete: R$ ${order.freightFee.toFixed(2).replace('.', ',')}\n` +
      `🏷️ Desconto: R$ ${order.discount.toFixed(2).replace('.', ',')}\n` +
      `⭐ TOTAL DO PEDIDO: R$ ${order.total.toFixed(2).replace('.', ',')}\n` +
      `💳 Pagamento: ${order.paymentCondition.toUpperCase().replace('_', ' ')}\n` +
      `Status: ${order.status.toUpperCase()}`;

    navigator.clipboard.writeText(text);
    addToast('success', 'Texto do pedido copiado!', 'Pronto para enviar no WhatsApp do cliente.');
  };

  const getStatusBadge = (status: WholesaleOrderStatus) => {
    switch (status) {
      case 'orcamento':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Orçamento</span>;
      case 'confirmado':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">Confirmado</span>;
      case 'separacao':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Boxes className="w-3 h-3" /> Em Separação</span>;
      case 'faturado':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">Faturado / NF-e</span>;
      case 'entregue':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Entregue</span>;
      case 'cancelado':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Plan Notice */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <span>🏢 Módulo Atacado & Pedidos B2B</span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                {activePlan.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Emissão de Pedidos de Atacado
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Venda por caixas, fardos e engradados com controle de separação no galpão, romaneio e impressão de espelho de pedido na impressora térmica (igual ao fluxo do vídeo).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('new_order')}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Emitir Novo Pedido (Fardos/Caixas)</span>
            </button>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Cadastrar Cliente PJ</span>
            </button>
          </div>
        </div>

        {/* Wholesale Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Faturamento Atacado</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 mt-1 block">
              R$ {totalWholesaleRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pedidos Emitidos</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-white mt-1 block">
              {wholesaleOrders.length} pedidos
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Volumes / Caixas</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-1 block">
              {totalWholesalePackages} caixas/fardos
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Clientes B2B Cadastrados</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-blue-400 mt-1 block">
              {wholesaleCustomers.length} empresas
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pedidos de Atacado ({wholesaleOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('new_order')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'new_order'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Pedido Rápido</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Clientes B2B ({wholesaleCustomers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('price_table')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'price_table'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Tabela Preços Caixa/Fardo</span>
        </button>
      </div>

      {/* TAB 1: LIST OF ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, pedido #AT..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['all', 'confirmado', 'separacao', 'faturado', 'entregue'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'Todos' : st === 'separacao' ? 'Separação' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards / Table */}
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 font-mono font-black text-sm border border-amber-500/30">
                      {order.displayId}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {order.customerTradeName || order.customerName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>CNPJ/CPF: {order.customerDocument}</span>
                        <span>•</span>
                        <span>Vendedor: {order.sellerName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 divide-y divide-slate-800/60">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {it.packageQuantity}x {it.packageType.toUpperCase()}
                        </span>
                        <span className="text-slate-200 font-medium">{it.productName}</span>
                        <span className="text-[11px] text-slate-400">({it.itemsPerPackage} un/cx · {it.totalUnits} un totais)</span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        R$ {it.totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer and Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Boxes className="w-3.5 h-3.5 text-amber-400" />
                      <strong>{order.totalPackages}</strong> volumes ({order.totalUnits} garrafas/latas)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      Condição: <strong className="text-slate-200 uppercase">{order.paymentCondition.replace('_', ' ')}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      {order.deliveryType === 'entrega' ? 'Entrega Distribuidora' : 'Retirada no Galpão'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="text-right mr-2">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Total do Pedido</span>
                      <span className="text-lg font-mono font-black text-amber-400">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Change Status Dropdown */}
                    <select
                      value={order.status}
                      onChange={e => updateWholesaleOrderStatus(order.id, e.target.value as WholesaleOrderStatus)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="orcamento">Orçamento</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="separacao">Em Separação</option>
                      <option value="faturado">Faturado</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    {/* Slip Print Button */}
                    <button
                      onClick={() => {
                        setSelectedOrderForSlip(order);
                        setShowSlipModal(true);
                      }}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                      title="Imprimir Espelho do Pedido (Impressora Térmica Epson 80mm)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Copy WhatsApp */}
                    <button
                      onClick={() => handleCopyOrderText(order)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="Copiar texto para WhatsApp"
                    >
                      <Share2 className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <Boxes className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">Nenhum pedido de atacado encontrado</h3>
                <p className="text-xs text-slate-400">Clique em "Emitir Novo Pedido" para criar o primeiro pedido B2B.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NEW WHOLESALE ORDER (DATACAIXA INSPIRED) */}
      {activeTab === 'new_order' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Selection */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                  <h3 className="font-bold text-white text-base">Selecionar Cliente B2B (Atacado)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Cliente PJ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Cliente Cadastrado</label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {wholesaleCustomers.map(cust => (
                      <option key={cust.id} value={cust.id}>
                        {cust.tradeName || cust.name} ({cust.document})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Vendedor / Operador</label>
                  <select
                    value={selectedSeller}
                    onChange={e => setSelectedSeller(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Roberto Vendas (Atacado)">Roberto Vendas (Operador Atacado)</option>
                    <option value="Carlos Andrade (Admin)">Carlos Andrade (Administrador)</option>
                    <option value="Juliana Mendes (Gerência)">Juliana Mendes (Gerência Geral)</option>
                  </select>
                </div>
              </div>

              {selectedCustomerObj && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white block">{selectedCustomerObj.tradeName || selectedCustomerObj.name}</span>
                    <span className="text-slate-400 text-[11px]">{selectedCustomerObj.address}, {selectedCustomerObj.neighborhood} - {selectedCustomerObj.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">
                      Limite: <strong className="text-emerald-400 font-mono">R$ {selectedCustomerObj.creditLimit.toFixed(2).replace('.', ',')}</strong>
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">
                      Prazo Padrão: <strong className="text-amber-400">{selectedCustomerObj.paymentTerms}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Add Beverage Packages (Boxes / Packs / Crates) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                <h3 className="font-bold text-white text-base">Adicionar Bebidas ao Pedido de Atacado</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Selecionar Bebida (Catálogo)</label>
                  <select
                    value={selectedProductToAdd}
                    onChange={e => setSelectedProductToAdd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} · Estoque: {p.stock} un
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Embalagem</label>
                  <select
                    value={packageTypeToAdd}
                    onChange={e => setPackageTypeToAdd(e.target.value as WholesalePackageType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="caixa">Caixa (24 un)</option>
                    <option value="fardo">Fardo (12 un)</option>
                    <option value="pack">Pack (6 un)</option>
                    <option value="engradado">Engradado (24 un)</option>
                    <option value="pallet">Pallet (72 cxs)</option>
                    <option value="unidade">Unidade Avulsa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Qtd Volumes</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={packageQtyToAdd}
                      onChange={e => setPackageQtyToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToDraft}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table in Draft */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Itens Selecionados no Pedido ({draftItems.length})
                </span>

                <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/50">
                  {draftItems.map((item, index) => (
                    <div key={index} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-white text-sm">{item.productName}</p>
                          <p className="text-[11px] text-slate-400">
                            {item.packageQuantity}x {item.packageType.toUpperCase()} ({item.itemsPerPackage} un/pkg = {item.totalUnits} un) · Preço un: R$ {item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-black text-white text-sm">
                          R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftItem(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remover item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {draftItems.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Nenhum item adicionado ainda. Escolha a bebida e a embalagem acima.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Logistics & Notes */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
                <h3 className="font-bold text-white text-base">Condições de Entrega & Faturamento</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Tipo de Entrega</label>
                  <select
                    value={deliveryType}
                    onChange={e => setDeliveryType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="entrega">Caminhão da Distribuidora</option>
                    <option value="retirada">Retirada no Galpão</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Data de Entrega / Separação</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Condição de Pagamento</label>
                  <select
                    value={paymentCondition}
                    onChange={e => setPaymentCondition(e.target.value as WholesalePaymentCondition)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="boleto_14_28d">Boleto Faturado (14/28 dias)</option>
                    <option value="boleto_14d">Boleto 14 dias</option>
                    <option value="boleto_28d">Boleto 28 dias</option>
                    <option value="pix_vista">PIX à Vista (com 3% desconto)</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="dinheiro">Dinheiro na Entrega</option>
                    <option value="a_prazo">A Prazo / Fiado Autorizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Observações do Pedido / Separação</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Carga paletizada. Descarregar na rampa lateral do bar. Horário limite 16h."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Right Summary Card (1 col) */}
          <div className="space-y-4">
            <div className="sticky top-20 rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-white text-lg">Resumo do Pedido B2B</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Espelho de Carga & Faturamento</p>
                </div>
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-sm">
                  📦
                </span>
              </div>

              {/* Volume summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Caixas/Fardos</span>
                  <span className="text-xl font-mono font-black text-amber-400 mt-0.5 block">{draftTotalPackages} cx</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Unidades</span>
                  <span className="text-xl font-mono font-black text-white mt-0.5 block">{draftTotalUnits} un</span>
                </div>
              </div>

              {/* Values breakdown */}
              <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Subtotal Produtos:</span>
                  <span className="font-mono font-bold text-white">R$ {draftSubtotal.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Frete Distribuidora:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">R$</span>
                    <input
                      type="number"
                      value={freightFee}
                      onChange={e => setFreightFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono font-bold text-white text-right text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Desconto Comercial:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">- R$</span>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={e => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono font-bold text-emerald-400 text-right text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-3">
                  <span className="text-sm font-extrabold text-white uppercase tracking-wider">Valor Total:</span>
                  <span className="text-2xl font-mono font-black text-amber-400">
                    R$ {draftTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCreateOrder}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>Emitir e Imprimir Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: B2B CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Carteira de Clientes de Atacado (B2B)</h2>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cliente PJ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wholesaleCustomers.map(cust => (
              <div
                key={cust.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                      🏢
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {cust.tradeName || cust.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{cust.name} · {cust.document}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                    {cust.paymentTerms}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Limite de Crédito</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      R$ {cust.creditLimit.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Crédito Utilizado</span>
                    <span className="font-mono font-bold text-white text-sm">
                      R$ {cust.usedCredit.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cust.address}, {cust.neighborhood} - {cust.city}/{cust.state}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{cust.phone}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Cadastrado em {new Date(cust.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      setActiveTab('new_order');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    Tirar Pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WHOLESALE PRICE TABLE */}
      {activeTab === 'price_table' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Tabela de Preços Atacado vs Varejo</h2>
              <p className="text-xs text-slate-400">Preços calculados por fardo, caixa fechada e engradado com desconto progressivo.</p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Desconto Médio de Atacado: ~18% a 22%
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800 bg-slate-900">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="p-3.5">Bebida</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5 text-right">Preço Balcão (Varejo)</th>
                  <th className="p-3.5 text-right">Preço Unidade Atacado</th>
                  <th className="p-3.5 text-right">Fardo c/ 12</th>
                  <th className="p-3.5 text-right">Caixa c/ 24</th>
                  <th className="p-3.5 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {products.map(p => {
                  const wholesaleUnit = +(p.price * 0.82).toFixed(2);
                  const fardo12 = +(wholesaleUnit * 12).toFixed(2);
                  const caixa24 = +(wholesaleUnit * 24).toFixed(2);

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                        <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-slate-950 shrink-0" />
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3.5 font-sans text-slate-400">Bebidas</td>
                      <td className="p-3.5 text-right text-slate-400">R$ {p.price.toFixed(2)}</td>
                      <td className="p-3.5 text-right text-amber-400 font-bold">R$ {wholesaleUnit.toFixed(2)}</td>
                      <td className="p-3.5 text-right text-emerald-400 font-bold">R$ {fardo12.toFixed(2)}</td>
                      <td className="p-3.5 text-right text-purple-400 font-bold">R$ {caixa24.toFixed(2)}</td>
                      <td className="p-3.5 text-center font-sans">
                        <button
                          onClick={() => {
                            setSelectedProductToAdd(p.id);
                            setActiveTab('new_order');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer"
                        >
                          + Pedido
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: THERMAL PRINT SLIP (ESPELHO DE PEDIDO - EXACTLY AS IN THE VIDEO) */}
      {showSlipModal && selectedOrderForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Espelho de Pedido de Atacado (Térmica 80mm)</h3>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Preview Container (Style of 80mm Thermal Printer) */}
            <div className="flex-1 overflow-y-auto bg-white text-black p-5 rounded-2xl font-mono text-[11px] leading-tight select-text shadow-inner">
              <div className="text-center pb-2 border-b-2 border-dashed border-neutral-400 space-y-1">
                <p className="font-black text-sm uppercase tracking-wider">{activeCompany.tradeName}</p>
                <p className="text-[10px]">DISTRIBUIÇÃO DE BEBIDAS & ATACADO B2B</p>
                <p className="text-[10px]">CNPJ: {activeCompany.cnpj} · Fone: {activeCompany.phone}</p>
                <p className="text-[10px]">{activeCompany.address}, {activeCompany.number} - {activeCompany.city}/{activeCompany.state}</p>
              </div>

              <div className="py-2 border-b-2 border-dashed border-neutral-400 space-y-0.5">
                <p className="font-black text-xs">PEDIDO ATACADO: {selectedOrderForSlip.displayId}</p>
                <p>EMISSÃO: {new Date(selectedOrderForSlip.createdAt).toLocaleString('pt-BR')}</p>
                <p>VENDEDOR: {selectedOrderForSlip.sellerName}</p>
                <p>ENTREGA PREVISTA: {selectedOrderForSlip.deliveryDate ? new Date(selectedOrderForSlip.deliveryDate).toLocaleDateString('pt-BR') : 'Imediata'}</p>
              </div>

              <div className="py-2 border-b-2 border-dashed border-neutral-400 space-y-0.5">
                <p className="font-bold">DADOS DO CLIENTE:</p>
                <p className="font-black">{selectedOrderForSlip.customerTradeName || selectedOrderForSlip.customerName}</p>
                <p>DOC: {selectedOrderForSlip.customerDocument}</p>
                <p>FONE: {selectedOrderForSlip.customerPhone}</p>
                <p>LOCAL: {selectedOrderForSlip.deliveryAddress}</p>
              </div>

              <div className="py-2 border-b-2 border-dashed border-neutral-400 space-y-1">
                <p className="font-bold">ITENS DO PEDIDO (FARDOS/CAIXAS):</p>
                {selectedOrderForSlip.items.map((it, idx) => (
                  <div key={idx} className="pb-1 border-b border-dotted border-neutral-300">
                    <p className="font-black">
                      {it.packageQuantity}x {it.packageType.toUpperCase()} - {it.productName}
                    </p>
                    <div className="flex justify-between text-[10px]">
                      <span>{it.totalUnits} un ({it.itemsPerPackage} un/pkg) x R$ {it.unitPrice.toFixed(2)}</span>
                      <span className="font-bold">R$ {it.totalPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b-2 border-dashed border-neutral-400 space-y-0.5 text-right">
                <p>TOTAL VOLUMES: <strong>{selectedOrderForSlip.totalPackages} caixas/fardos</strong> ({selectedOrderForSlip.totalUnits} un)</p>
                <p>SUBTOTAL: R$ {selectedOrderForSlip.subtotal.toFixed(2).replace('.', ',')}</p>
                {selectedOrderForSlip.discount > 0 && (
                  <p>DESCONTO: - R$ {selectedOrderForSlip.discount.toFixed(2).replace('.', ',')}</p>
                )}
                {selectedOrderForSlip.freightFee > 0 && (
                  <p>FRETE: R$ {selectedOrderForSlip.freightFee.toFixed(2).replace('.', ',')}</p>
                )}
                <p className="font-black text-sm pt-1">
                  TOTAL A PAGAR: R$ {selectedOrderForSlip.total.toFixed(2).replace('.', ',')}
                </p>
                <p className="font-bold">FORMA: {selectedOrderForSlip.paymentCondition.toUpperCase().replace('_', ' ')}</p>
              </div>

              <div className="pt-3 text-[10px] space-y-2">
                <p className="font-bold">CONFERÊNCIA DE GALPÃO / EXPEDIÇÃO:</p>
                <p>[  ] SEPARADO NO GALPÃO POR: ___________________</p>
                <p>[  ] CONFERIDO NO CAMINHÃO POR: _________________</p>
                <p className="pt-2 text-center">RECEBIDO EM PERFEITO ESTADO:</p>
                <div className="border-t border-black mt-4 pt-1 text-center font-bold">
                  ASSINATURA DO CLIENTE
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrintSlip}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Espelho (Impressora Epson)</span>
              </button>
              <button
                onClick={() => handleCopyOrderText(selectedOrderForSlip)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW B2B CUSTOMER */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Cadastrar Cliente de Atacado (B2B)</h3>
              </div>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Nome Fantasia / Bar / Restaurante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bar & Restaurante Central"
                  value={newCustomerForm.tradeName}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, tradeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Razão Social / Nome do Titular *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Oliveira Bebidas ME"
                  value={newCustomerForm.name}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">CNPJ ou CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={newCustomerForm.document}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, document: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Inscrição Estadual (I.E.)</label>
                  <input
                    type="text"
                    placeholder="Isento ou nº"
                    value={newCustomerForm.stateRegistration}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, stateRegistration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98888-7777"
                    value={newCustomerForm.phone}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">E-mail para Boletos</label>
                  <input
                    type="email"
                    placeholder="compras@empresa.com"
                    value={newCustomerForm.email}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Endereço de Entrega (Galpão / Ponto Comercial)</label>
                <input
                  type="text"
                  placeholder="Rua, número, complemento"
                  value={newCustomerForm.address}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={newCustomerForm.neighborhood}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Limite de Crédito Inicial (R$)</label>
                  <input
                    type="number"
                    value={newCustomerForm.creditLimit}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                >
                  Salvar Cliente de Atacado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
