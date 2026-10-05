import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Table, PaymentMethod } from '../types';
import {
  Store,
  UtensilsCrossed,
  ClipboardCheck,
  BookOpen,
  Bike,
  CircleDollarSign,
  Settings,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  RotateCcw,
  User,
  Clock,
  AlertTriangle,
  X,
  Check,
  Scale,
  ShoppingBag,
  Flame,
  Sparkles,
  Beer,
  Wine,
  CupSoda,
  Snowflake,
  Package,
  FileText,
  DollarSign,
  Cloud,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface SplitPaymentRecord {
  id: string;
  method: PaymentMethod;
  methodLabel: string;
  amount: number;
}

export const POSView: React.FC = () => {
  const {
    products,
    categories,
    tables,
    updateTableStatus,
    createDirectOrder,
    activeCompany,
    employees,
    currentUser,
    seedSampleProducts,
    setActivePage,
    addToast
  } = useApp();

  // Top Bar Tab Mode: 'venda' | 'mesa' | 'comanda' | 'cardapio' | 'delivery' | 'caixa'
  const [activeTab, setActiveTab] = useState<'venda' | 'mesa' | 'comanda' | 'cardapio' | 'delivery' | 'caixa'>('venda');

  // Input states (Código + Qtde from datacaixa screenshot)
  const [codeInput, setCodeInput] = useState('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('todos');
  const [selectedSeller, setSelectedSeller] = useState<string>(() => {
    return currentUser?.name || 'Vendedor Balcão';
  });
  const [customerName, setCustomerName] = useState('Cliente Balcão');

  // Ticket / Sale Items
  const [ticketItems, setTicketItems] = useState<CartItem[]>([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);

  // Instant Search Popup Modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocusedIndex, setSearchFocusedIndex] = useState(0);

  // Discount & Service Fee
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Finalize Sale Modal
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentInputValue, setPaymentInputValue] = useState<string>('');
  const [splitPayments, setSplitPayments] = useState<SplitPaymentRecord[]>([]);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(true);

  // Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastFinishedOrder, setLastFinishedOrder] = useState<any | null>(null);

  // Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  const codeInputRef = useRef<HTMLInputElement>(null);
  const searchModalInputRef = useRef<HTMLInputElement>(null);

  // Real-time clock ticker
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts (F1 Venda, F2 Finalizar, F3 Código/Busca, F4 Imprimir, F5 Mesa, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('venda');
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (ticketItems.length > 0 && !isFinalizeModalOpen) {
          handleOpenFinalize();
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        codeInputRef.current?.focus();
        codeInputRef.current?.select();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (ticketItems.length > 0) {
          handleOpenPreviewReceipt();
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('mesa');
      } else if (e.key === 'Escape') {
        if (isSearchModalOpen) {
          setIsSearchModalOpen(false);
        } else if (isFinalizeModalOpen) {
          setIsFinalizeModalOpen(false);
        } else if (isReceiptModalOpen) {
          setIsReceiptModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ticketItems, isFinalizeModalOpen, isSearchModalOpen, isReceiptModalOpen]);

  // Active products with reliable codes
  const activeProducts = useMemo(() => {
    return products.map((p, idx) => ({
      ...p,
      code: p.code || (idx + 1).toString().padStart(2, '0')
    })).filter(p => p.active);
  }, [products]);

  // Datacaixa Category Buttons Configuration (2 Rows of 5 Buttons)
  const categoryButtons = useMemo(() => [
    { id: 'todos', label: 'TODOS', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'cervejas', label: 'CERVEJAS', icon: <Beer className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'refrigerantes', label: 'REFRIGERANTES', icon: <CupSoda className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'energeticos', label: 'ENERGÉTICOS', icon: <Flame className="w-3.5 h-3.5 text-red-400" /> },
    { id: 'destilados', label: 'DESTILADOS', icon: <Wine className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'vodka', label: 'VODKA', icon: <Wine className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'gin_whisky', label: 'GIN & WHISKY', icon: <Wine className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'cachaca', label: 'CACHAÇA', icon: <Wine className="w-3.5 h-3.5 text-yellow-500" /> },
    { id: 'agua', label: 'ÁGUA', icon: <Snowflake className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'gelo', label: 'GELO & VINHO', icon: <Snowflake className="w-3.5 h-3.5 text-teal-400" /> }
  ], []);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategorySlug === 'todos') return activeProducts;

    return activeProducts.filter(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      const catSlug = cat?.slug?.toLowerCase() || '';

      if (selectedCategorySlug === 'cervejas') {
        return catSlug === 'cervejas';
      }
      if (selectedCategorySlug === 'refrigerantes') {
        return catSlug === 'refrigerantes';
      }
      if (selectedCategorySlug === 'energeticos') {
        return catSlug === 'energeticos';
      }
      if (selectedCategorySlug === 'destilados') {
        return catSlug === 'vodka' || catSlug === 'cachaca' || catSlug === 'gin' || catSlug === 'whisky' || catSlug === 'destilados';
      }
      if (selectedCategorySlug === 'vodka') {
        return catSlug === 'vodka';
      }
      if (selectedCategorySlug === 'gin_whisky') {
        return catSlug === 'gin' || catSlug === 'whisky';
      }
      if (selectedCategorySlug === 'cachaca') {
        return catSlug === 'cachaca';
      }
      if (selectedCategorySlug === 'agua') {
        return catSlug === 'agua';
      }
      if (selectedCategorySlug === 'gelo') {
        return catSlug === 'gelo' || catSlug === 'vinho';
      }
      return catSlug === selectedCategorySlug;
    });
  }, [activeProducts, categories, selectedCategorySlug]);

  // Live Modal Search Filter
  const modalSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return activeProducts;
    const q = searchTerm.toLowerCase().trim();
    return activeProducts.filter(p => {
      return (
        p.code?.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.volume?.toLowerCase().includes(q)
      );
    });
  }, [activeProducts, searchTerm]);

  // Add Item to Ticket
  const handleAddItem = (product: Product, customQty?: number) => {
    const qty = customQty !== undefined ? customQty : (quantityInput > 0 ? quantityInput : 1);
    setTicketItems(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      }
      return [...prev, { product, quantity: qty, unitPrice: product.price }];
    });

    // Reset code input and qty back to 1
    setCodeInput('');
    setQuantityInput(1);
    setIsSearchModalOpen(false);
    codeInputRef.current?.focus();
  };

  // Direct Code / Enter Submission
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = codeInput.trim();
    if (!query) {
      setIsSearchModalOpen(true);
      return;
    }

    // Try exact code or barcode match
    const exactMatch = activeProducts.find(
      p => p.code?.toLowerCase() === query.toLowerCase() ||
           p.barcode === query
    );

    if (exactMatch) {
      handleAddItem(exactMatch, quantityInput);
      return;
    }

    // Try name substring match
    const nameMatch = activeProducts.find(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (nameMatch) {
      handleAddItem(nameMatch, quantityInput);
      return;
    }

    // Open search modal with current term
    setSearchTerm(query);
    setIsSearchModalOpen(true);
  };

  // Update Item Qty
  const handleUpdateItemQty = (productId: string, delta: number) => {
    setTicketItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove Item
  const handleRemoveItem = (productId: string) => {
    setTicketItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Clear Ticket
  const handleClearTicket = () => {
    if (ticketItems.length === 0) return;
    if (window.confirm('Deseja cancelar e limpar os itens do pedido atual?')) {
      setTicketItems([]);
      setSelectedTableNumber(null);
      setServiceFeePercent(0);
      setDiscountAmount(0);
      setDiscountPercent(0);
      setCustomerName('Cliente Balcão');
      codeInputRef.current?.focus();
      addToast('info', 'Venda cancelada', 'O cupom de venda atual foi limpo.');
    }
  };

  // Financial Calculations
  const subtotal = useMemo(() => {
    return ticketItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [ticketItems]);

  const serviceFeeAmount = useMemo(() => {
    if (serviceFeePercent <= 0) return 0;
    return (subtotal * serviceFeePercent) / 100;
  }, [subtotal, serviceFeePercent]);

  const effectiveDiscount = useMemo(() => {
    if (discountPercent > 0) {
      return (subtotal * discountPercent) / 100;
    }
    return discountAmount;
  }, [subtotal, discountPercent, discountAmount]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + serviceFeeAmount - effectiveDiscount);
  }, [subtotal, serviceFeeAmount, effectiveDiscount]);

  const totalPaidSoFar = useMemo(() => {
    return splitPayments.reduce((acc, p) => acc + p.amount, 0);
  }, [splitPayments]);

  const remainingBalance = useMemo(() => {
    return Math.max(0, totalAmount - totalPaidSoFar);
  }, [totalAmount, totalPaidSoFar]);

  // Open Finalize Checkout Modal
  const handleOpenFinalize = () => {
    if (ticketItems.length === 0) {
      addToast('warning', 'Venda vazia', 'Adicione ao menos um item antes de finalizar.');
      return;
    }
    setSplitPayments([]);
    setCurrentPaymentMethod('cash');
    setPaymentInputValue(totalAmount.toFixed(2));
    setChangeAmount(0);
    setIsFinalizeModalOpen(true);
  };

  // Add Partial Payment (from video)
  const handleAddPaymentRecord = () => {
    const val = parseFloat(paymentInputValue.replace(',', '.')) || 0;
    if (val <= 0) {
      addToast('warning', 'Valor inválido', 'Digite o valor recebido.');
      return;
    }

    const methodLabels: Record<PaymentMethod, string> = {
      cash: 'Dinheiro',
      pix: 'PIX',
      credit_card: 'Cartão Crédito',
      debit_card: 'Cartão Débito',
      fiado: 'A Prazo / Fiado',
      multiple: 'Múltiplo'
    };

    if (currentPaymentMethod === 'cash' && val > remainingBalance) {
      const troco = val - remainingBalance;
      setChangeAmount(troco);
      const record: SplitPaymentRecord = {
        id: 'pay_' + Date.now(),
        method: 'cash',
        methodLabel: 'Dinheiro',
        amount: remainingBalance
      };
      setSplitPayments(prev => [...prev, record]);
      setPaymentInputValue('0.00');
    } else {
      const record: SplitPaymentRecord = {
        id: 'pay_' + Date.now(),
        method: currentPaymentMethod,
        methodLabel: methodLabels[currentPaymentMethod] || currentPaymentMethod,
        amount: Math.min(val, remainingBalance)
      };
      setSplitPayments(prev => [...prev, record]);
      const nextRemaining = Math.max(0, remainingBalance - val);
      setPaymentInputValue(nextRemaining > 0 ? nextRemaining.toFixed(2) : '0.00');
      if (val > remainingBalance && currentPaymentMethod === 'cash') {
        setChangeAmount(val - remainingBalance);
      } else {
        setChangeAmount(0);
      }
    }
  };

  const handleRemoveSplitPayment = (id: string) => {
    setSplitPayments(prev => prev.filter(p => p.id !== id));
    setChangeAmount(0);
  };

  // Complete Sale
  const handleConfirmFinishSale = () => {
    if (remainingBalance > 0.01 && splitPayments.length === 0) {
      const finalMethod = currentPaymentMethod;
      const orderObj = executeOrderSave([{
        id: 'pay_1',
        method: finalMethod,
        methodLabel: finalMethod,
        amount: totalAmount
      }]);
      finishFlow(orderObj);
      return;
    }

    if (remainingBalance > 0.01) {
      if (!window.confirm(`Resta um saldo pendente de R$ ${remainingBalance.toFixed(2)}. Deseja lançar o restante como 'A Prazo / Fiado' e concluir?`)) {
        return;
      }
      const completedSplits = [
        ...splitPayments,
        {
          id: 'pay_rem',
          method: 'fiado' as PaymentMethod,
          methodLabel: 'A Prazo / Fiado',
          amount: remainingBalance
        }
      ];
      const orderObj = executeOrderSave(completedSplits);
      finishFlow(orderObj);
      return;
    }

    const orderObj = executeOrderSave(splitPayments);
    finishFlow(orderObj);
  };

  const executeOrderSave = (payments: SplitPaymentRecord[]) => {
    const primaryMethod = payments.length === 1 ? payments[0].method : 'multiple';
    const newOrder = createDirectOrder({
      type: selectedTableNumber ? 'table' : 'counter',
      tableNumber: selectedTableNumber || undefined,
      customerName: customerName || (selectedTableNumber ? `Mesa ${selectedTableNumber}` : 'Cliente Balcão'),
      customerPhone: '',
      items: ticketItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        volume: item.product.volume,
        code: item.product.code
      })),
      subtotal,
      serviceFee: serviceFeeAmount,
      deliveryFee: 0,
      discount: effectiveDiscount,
      total: totalAmount,
      paymentMethod: primaryMethod,
      splitPayments: payments.map(p => ({
        method: p.method,
        methodLabel: p.methodLabel,
        amount: p.amount,
        date: new Date().toISOString()
      })),
      changeFor: changeAmount > 0 ? changeAmount : undefined,
      waiterName: selectedSeller,
      notes: selectedTableNumber ? `Mesa ${selectedTableNumber}` : 'Venda Balcão PDV'
    });

    if (selectedTableNumber) {
      const tbl = tables.find(t => t.number === selectedTableNumber);
      if (tbl) updateTableStatus(tbl.id, 'available');
    }

    return newOrder;
  };

  const finishFlow = (orderObj: any) => {
    setLastFinishedOrder(orderObj);
    setIsFinalizeModalOpen(false);

    setTicketItems([]);
    setSelectedTableNumber(null);
    setServiceFeePercent(0);
    setDiscountAmount(0);
    setDiscountPercent(0);
    setCustomerName('Cliente Balcão');
    setChangeAmount(0);

    if (autoPrintReceipt) {
      setIsReceiptModalOpen(true);
    } else {
      addToast('success', 'Venda Concluída!', `Cupom #${orderObj.displayId} registrado.`);
    }

    codeInputRef.current?.focus();
  };

  // Preview Receipt
  const handleOpenPreviewReceipt = () => {
    const previewOrder = {
      displayId: '#PRÉ-CONTA',
      createdAt: new Date().toISOString(),
      customerName: customerName || (selectedTableNumber ? `Mesa ${selectedTableNumber}` : 'Cliente Balcão'),
      tableNumber: selectedTableNumber,
      waiterName: selectedSeller,
      items: ticketItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        volume: item.product.volume,
        code: item.product.code
      })),
      subtotal,
      serviceFee: serviceFeeAmount,
      discount: effectiveDiscount,
      total: totalAmount,
      paymentMethod: 'cash',
      splitPayments: []
    };
    setLastFinishedOrder(previewOrder);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[640px] bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR (Directly derived from Datacaixa screenshot)             */}
      {/* ========================================================================= */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Brand & Company Identifiers */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg shrink-0">
            🍻
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white uppercase">
                BebêAqui
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Frente de Caixa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
              {activeCompany.tradeName} · {activeCompany.phone || '(Balcão)'}
            </p>
          </div>
        </div>

        {/* Center / Right: The Exact Datacaixa Action Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* VENDA Button */}
          <button
            onClick={() => setActiveTab('venda')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'venda'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Venda</span>
          </button>

          {/* MESA Button */}
          <button
            onClick={() => setActiveTab('mesa')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'mesa'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-blue-400" />
            <span>Mesa</span>
            {tables.filter(t => t.status === 'occupied').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-amber-400 font-mono font-bold">
                {tables.filter(t => t.status === 'occupied').length}
              </span>
            )}
          </button>

          {/* COMANDA Button */}
          <button
            onClick={() => setActiveTab('comanda')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'comanda'
                ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Comanda</span>
          </button>

          {/* CARDÁPIO Button (Explicitly requested by user) */}
          <button
            onClick={() => setActivePage('menu')}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-800/90 hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Abrir Cardápio Digital do Cliente"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Cardápio</span>
          </button>

          {/* DELIVERY Button */}
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'delivery'
                ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <Bike className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Delivery</span>
          </button>

          {/* CAIXA Button */}
          <button
            onClick={() => setActiveTab('caixa')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'caixa'
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <CircleDollarSign className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Caixa</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (Split Left Grid + Right Ticket Panel)                  */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ======================================================================= */}
        {/* LEFT AREA: Categories Grid (2 rows) + Product Grid (5 cols) (7-8 cols)  */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col border-r border-slate-800 overflow-hidden bg-slate-950">
          {/* Top Category Buttons (2 rows of 5 buttons, exactly like Datacaixa) */}
          <div className="p-2 sm:p-2.5 bg-slate-900/90 border-b border-slate-800 shrink-0">
            <div className="grid grid-cols-5 gap-1.5">
              {categoryButtons.map(cat => {
                const isActive = selectedCategorySlug === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategorySlug(cat.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid (5 columns on desktop, touch friendly) */}
          <div className="flex-1 p-2 sm:p-3 overflow-y-auto">
            {activeProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
                  🍻
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nenhum produto cadastrado no catálogo</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Carregue as bebidas alcoólicas, não perecíveis, salgados e bomboniere com 1 clique para operar o caixa.
                  </p>
                </div>
                <button
                  onClick={seedSampleProducts}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Carregar Bebidas & Salgados no PDV</span>
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                Nenhum produto encontrado nesta categoria.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                {filteredProducts.map(item => {
                  const isOutOfStock = item.stock <= 0;
                  const isLowStock = item.stock <= item.minStock && item.stock > 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => !isOutOfStock && handleAddItem(item)}
                      disabled={isOutOfStock}
                      title={`${item.name} · R$ ${item.price.toFixed(2)}`}
                      className={`group p-2 sm:p-2.5 rounded-xl border text-left flex flex-col justify-between h-28 sm:h-32 transition-all cursor-pointer relative overflow-hidden active:scale-95 ${
                        isOutOfStock
                          ? 'bg-slate-950/70 border-slate-800 opacity-40 cursor-not-allowed'
                          : 'bg-slate-900 border-slate-800 hover:border-amber-400 hover:bg-slate-850 hover:shadow-lg hover:shadow-amber-500/10'
                      }`}
                    >
                      {/* Top Bar: Thumbnail/Icon + Code */}
                      <div className="flex items-start justify-between w-full gap-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={e => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-sm">
                              {item.alcoholic ? '🍺' : item.name.toLowerCase().includes('gelo') ? '🧊' : item.name.toLowerCase().includes('coxinha') ? '🍗' : '📦'}
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          #{item.code}
                        </span>
                      </div>

                      {/* Product Name (Uppercase bold like Datacaixa) */}
                      <div className="my-1 min-w-0">
                        <h4 className="text-[11px] font-black uppercase text-white line-clamp-2 leading-tight group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">
                          {item.volume || (item.stock > 0 ? `${item.stock} ${item.unit || 'un'}` : 'Esgotado')}
                        </p>
                      </div>

                      {/* Price Tag (Highlighted in bold) */}
                      <div className="pt-1 border-t border-slate-800/80 w-full flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold">R$</span>
                        <span className="text-xs sm:text-sm font-black font-mono text-emerald-400 group-hover:text-amber-300">
                          {item.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT AREA: Código/Qtde Inputs + Table + Huge Total + Buttons (4-5 cols) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-slate-900 overflow-hidden">
          {/* Top Inputs: Código + [...] + X + Qtde [-] [+] [⚖️] (Exact Datacaixa Screenshot) */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2 shrink-0">
            <form onSubmit={handleCodeSubmit} className="flex items-center gap-2">
              {/* Código Input with Search Button */}
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Código (F3)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    ref={codeInputRef}
                    type="text"
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    placeholder="Código ou barras..."
                    className="flex-1 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 cursor-pointer"
                    title="Buscar produto na lista (...)"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Separator X */}
              <div className="pt-5 text-slate-500 font-bold text-xs">
                ×
              </div>

              {/* Qtde Input with [-] and [+] and [⚖️] */}
              <div className="w-28">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Qtde
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantityInput(prev => Math.max(1, prev - 1))}
                    className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantityInput}
                    onChange={e => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent text-xs font-mono font-black text-amber-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantityInput(prev => prev + 1)}
                    className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => addToast('info', 'Balança Integrada', 'Peso pronto para leitura.')}
                    className="px-2 py-2 border-l border-slate-800 text-slate-400 hover:text-amber-400"
                    title="Ler peso da balança"
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Ticket Table (Produto | Qtde | Unitário | Total) */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 shrink-0">
              <span className="col-span-6">Produto</span>
              <span className="col-span-2 text-center">Qtde</span>
              <span className="col-span-2 text-right">Unitário</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {/* Table Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-1">
              {ticketItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600 text-xs space-y-1">
                  <p className="font-bold text-slate-500">Nenhum item na venda</p>
                  <p className="text-[11px]">Toque nas bebidas à esquerda ou digite o código acima.</p>
                </div>
              ) : (
                ticketItems.map(item => (
                  <div
                    key={item.product.id}
                    className="grid grid-cols-12 px-2.5 py-2 text-xs items-center hover:bg-slate-900/80 transition-colors group"
                  >
                    <div className="col-span-6 pr-1 min-w-0">
                      <p className="font-bold text-white uppercase truncate text-[11px]">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        #{item.product.code} · {item.product.volume || 'Un'}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-1 font-mono font-bold text-amber-300">
                      <span>{item.quantity}</span>
                    </div>

                    <div className="col-span-2 text-right font-mono text-slate-400 text-[11px]">
                      {item.unitPrice.toFixed(2)}
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition-opacity"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* VALOR TOTAL DISPLAY (Exact Layout from Datacaixa Screenshot)          */}
          {/* ===================================================================== */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 shrink-0">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1">
                Valor Total
              </span>
              <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-3 sm:p-4 text-right shadow-inner">
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Subtotal, Serviço e Desconto Summary */}
            {(serviceFeeAmount > 0 || effectiveDiscount > 0) && (
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span>Subtotal: R$ {subtotal.toFixed(2)}</span>
                {serviceFeeAmount > 0 && <span className="text-amber-400">+ R$ {serviceFeeAmount.toFixed(2)} taxa</span>}
                {effectiveDiscount > 0 && <span className="text-red-400">- R$ {effectiveDiscount.toFixed(2)} desc</span>}
              </div>
            )}

            {/* Bottom Buttons: [Cancelar] + [Receber e Finalizar] (Datacaixa Screenshot) */}
            <div className="grid grid-cols-12 gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearTicket}
                disabled={ticketItems.length === 0}
                className="col-span-4 py-3.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 disabled:opacity-40 text-xs font-black uppercase transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleOpenFinalize}
                disabled={ticketItems.length === 0}
                className="col-span-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>Receber e Finalizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM FOOTER STATUS BAR (Exact Datacaixa Screenshot)                   */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 border-t border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <span>Versão BebêAqui 2.4</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">● SERVIDOR ONLINE</span>
          <span className="text-slate-600">|</span>
          <span>Caixa: <strong>CAIXA 01</strong></span>
          <span className="text-slate-600">|</span>
          <span>PDV: <strong>BALCÃO</strong></span>
          <span className="text-slate-600">|</span>
          <span>Usuário: <strong className="text-amber-300">{currentUser?.name || selectedSeller}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span>Impressora: <strong>Térmica 80mm</strong></span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-sky-400">
            <Cloud className="w-3 h-3 text-sky-400" />
            <span>Backup Nuvem OK</span>
          </span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: INSTANT SEARCH MODAL ([...] button or typing name)                 */}
      {/* ========================================================================= */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-4 sm:p-5 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Localizar Produto / Bebida</span>
              </h3>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchModalInputRef}
                autoFocus
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Digite o nome, código (01, 02) ou leia o código de barras..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950">
              {modalSearchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Nenhum produto encontrado.
                </div>
              ) : (
                modalSearchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddItem(prod, quantityInput)}
                    className="p-3 text-xs flex items-center justify-between hover:bg-slate-900 cursor-pointer transition-colors"
                  >
                    <div className="pr-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                          #{prod.code}
                        </span>
                        <p className="font-bold text-white uppercase truncate">{prod.name}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {prod.volume} · Estoque: {prod.stock} {prod.unit || 'un'}
                      </p>
                    </div>

                    <span className="font-mono font-black text-emerald-400 text-sm shrink-0">
                      R$ {prod.price.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FINALIZAR VENDA COM PAGAMENTO PARCIAL (From user's Datacaixa video) */}
      {/* ========================================================================= */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Recebimento & Finalização</h3>
                  <p className="text-xs text-slate-400">
                    {selectedTableNumber ? `Mesa #${selectedTableNumber}` : 'Venda Balcão'} · Operador: {currentUser?.name || selectedSeller}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFinalizeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Subtotal</span>
                <span className="font-mono font-bold text-sm text-slate-200">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Serviço</span>
                <span className="font-mono font-bold text-sm text-amber-400">+ R$ {serviceFeeAmount.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Desconto</span>
                <span className="font-mono font-bold text-sm text-red-400">- R$ {effectiveDiscount.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/50">
                <span className="text-[10px] text-emerald-400 uppercase font-black block">Total a Pagar</span>
                <span className="font-mono font-black text-base text-emerald-300">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Pagamento Parcial & Saldo Restante */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Status do Recebimento:</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    Recebido: <strong className="text-emerald-400 font-mono">R$ {totalPaidSoFar.toFixed(2)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Restante: <strong className={`font-mono ${remainingBalance > 0 ? 'text-amber-400 font-black' : 'text-emerald-400'}`}>
                      R$ {remainingBalance.toFixed(2)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Registered Splits */}
              {splitPayments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {splitPayments.map(p => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <span className="font-bold text-amber-300">{p.methodLabel}:</span>
                      <span className="font-mono font-bold text-emerald-400">R$ {p.amount.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitPayment(p.id)}
                        className="text-slate-500 hover:text-red-400 ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Forma de Pagamento:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: 'Dinheiro', icon: <Banknote className="w-4 h-4 text-emerald-400" /> },
                  { id: 'pix', label: 'PIX', icon: <QrCode className="w-4 h-4 text-teal-400" /> },
                  { id: 'credit_card', label: 'Cartão Crédito', icon: <CreditCard className="w-4 h-4 text-blue-400" /> },
                  { id: 'debit_card', label: 'Cartão Débito', icon: <CreditCard className="w-4 h-4 text-purple-400" /> },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentPaymentMethod(item.id as PaymentMethod);
                      setPaymentInputValue(remainingBalance > 0 ? remainingBalance.toFixed(2) : totalAmount.toFixed(2));
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentPaymentMethod === item.id
                        ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Controls with Troco Calculation */}
            {currentPaymentMethod === 'cash' && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-1/2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                      Valor Entregue pelo Cliente (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentInputValue}
                      onChange={e => setPaymentInputValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-lg font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="w-full sm:w-1/2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Atalhos:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 20, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPaymentInputValue(val.toFixed(2))}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200"
                        >
                          R$ {val}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPaymentInputValue(remainingBalance.toFixed(2))}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold"
                      >
                        Exato
                      </button>
                    </div>
                  </div>
                </div>

                {parseFloat(paymentInputValue || '0') > remainingBalance && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 uppercase">Troco do Cliente:</span>
                    <span className="text-xl font-black font-mono text-emerald-300">
                      R$ {(parseFloat(paymentInputValue) - remainingBalance).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {currentPaymentMethod === 'pix' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-xs">
                <div className="w-20 h-20 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-bold text-teal-400">Chave PIX da Distribuidora:</p>
                  <p className="font-mono text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800 text-white truncate">
                    {activeCompany.bankDetails?.pixKey || '31975346290'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Valor a transferir: <strong>R$ {paymentInputValue || remainingBalance.toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Split Register Button */}
            {remainingBalance > 0 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddPaymentRecord}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Pagamento Parcial</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  (Para dividir conta em dinheiro + PIX/Cartão)
                </span>
              </div>
            )}

            {/* Auto Print */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <input
                id="autoprint-pos"
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={e => setAutoPrintReceipt(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="autoprint-pos" className="text-slate-300 cursor-pointer">
                Imprimir cupom de venda automaticamente ao concluir
              </label>
            </div>

            {/* Concluir Venda Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmFinishSale}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>CONFIRMAR E CONCLUIR VENDA (Enter)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUPOM TÉRMICO DE VENDA (80mm)                                      */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && lastFinishedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <Printer className="w-4 h-4" />
                <span>Comprovante de Venda / Cupom</span>
              </h3>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Receipt Paper Simulation (80mm) */}
            <div className="bg-white text-slate-900 p-4 rounded-xl shadow font-mono text-[11px] leading-tight space-y-2 select-text">
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                <p className="font-black text-sm tracking-tight text-slate-950">
                  🍻 {activeCompany.tradeName}
                </p>
                <p className="text-[10px] text-slate-600">{activeCompany.name}</p>
                <p className="text-[10px] text-slate-600">CNPJ: {activeCompany.cnpj || '00.000.000/0001-00'}</p>
                <p className="text-[10px] text-slate-600">{activeCompany.address}, {activeCompany.number} - {activeCompany.city}/{activeCompany.state}</p>
                <p className="text-[10px] text-slate-600">Tel: {activeCompany.phone}</p>
              </div>

              <div className="py-1 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>PEDIDO: <strong>{lastFinishedOrder.displayId}</strong></span>
                  <span>DATA: {new Date(lastFinishedOrder.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIPO: {lastFinishedOrder.tableNumber ? `MESA #${lastFinishedOrder.tableNumber}` : 'BALCÃO'}</span>
                  <span>HORA: {new Date(lastFinishedOrder.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>CLIENTE: {lastFinishedOrder.customerName}</div>
                <div>OPERADOR: {lastFinishedOrder.waiterName || currentUser?.name || selectedSeller}</div>
              </div>

              <div className="py-1 border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between font-bold text-[10px] border-b border-slate-300 pb-0.5">
                  <span>ITEM / DESCRIÇÃO</span>
                  <span>TOTAL (R$)</span>
                </div>
                {lastFinishedOrder.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-start text-[10px]">
                    <div className="pr-2">
                      <span>{it.quantity}x {it.productName}</span>
                      <span className="text-[9px] text-slate-500 block">
                        R$ {it.unitPrice?.toFixed(2)} un
                      </span>
                    </div>
                    <span className="font-bold">
                      R$ {((it.unitPrice || 0) * (it.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-1 space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {(lastFinishedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                {lastFinishedOrder.serviceFee > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Taxa de Serviço:</span>
                    <span>+ R$ {lastFinishedOrder.serviceFee.toFixed(2)}</span>
                  </div>
                )}
                {lastFinishedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- R$ {lastFinishedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black border-t border-slate-900 pt-1 text-slate-950">
                  <span>VALOR TOTAL:</span>
                  <span>R$ {(lastFinishedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[9px] text-slate-600 space-y-0.5">
                <p className="font-bold">OBRIGADO PELA PREFERÊNCIA!</p>
                <p>BebêAqui · Sistema para Distribuidoras e Bares</p>
                <p>Cardápio Digital no seu celular pelo QR Code</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cupom (Ctrl+P)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
