import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Table, Order, PosTerminal, PaymentMethod } from '../types';
import {
  Smartphone,
  Monitor,
  Wifi,
  BatteryCharging,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  ChevronDown,
  ShoppingBag,
  Clock,
  Radio,
  ExternalLink,
  ShieldCheck,
  Search,
  Hash,
  X,
  Store,
  UtensilsCrossed,
  Layers,
  Copy,
  Check,
  Building2,
  RefreshCw,
  Camera,
  ScanLine,
  FlipHorizontal
} from 'lucide-react';
import { playNotificationChime } from '../utils/realtimeSync';

export const TerminalPOSView: React.FC = () => {
  const {
    products,
    categories,
    tables,
    posTerminals,
    activeTerminal,
    setActiveTerminal,
    addPosTerminal,
    createDirectOrder,
    activeCompany,
    addToast,
    isRealtimeSyncing
  } = useApp();

  // Mode: 'mockup' (physical Ton machine simulator), 'fullscreen' (pure pocket UI), 'manager' (sync dashboard)
  const [viewMode, setViewMode] = useState<'mockup' | 'fullscreen' | 'manager'>('mockup');

  // Hardware Chassis Model: 'stone_smart_touch' (Stone Smart Touch Screen - TELA INTEIRA) or 'ton_t3_keypad' (Teclado físico)
  const [chassisModel, setChassisModel] = useState<'stone_smart_touch' | 'ton_t3_keypad'>('stone_smart_touch');
  const [showRearSide, setShowRearSide] = useState<boolean>(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState<boolean>(false);

  const handleTriggerBarcodeScan = () => {
    setIsScanningBarcode(true);
    setTimeout(() => {
      const target = products.find(p => p.name.toLowerCase().includes('heineken')) || products[0];
      if (target) {
        handleAddToCart(target, 1);
        playNotificationChime('sync');
        addToast('success', `Câmera Traseira Stone Bipou!`, `${target.name} lida e adicionada ao carrinho.`);
      }
      setIsScanningBarcode(false);
    }, 850);
  };

  // Selected sales channel
  const [selectedChannel, setSelectedChannel] = useState<'counter' | 'table' | 'delivery'>('counter');
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('Cliente Balcão');

  // Product category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cart
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Keypad input for product quick codes
  const [keypadInput, setKeypadInput] = useState<string>('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Elo' | 'Hipercard'>('Mastercard');
  const [cardInstallments, setCardInstallments] = useState<number>(1);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'approved' | 'printing'>('select');
  const [lastProcessedOrder, setLastProcessedOrder] = useState<Order | null>(null);

  // Printed receipt simulator
  const [printedReceipt, setPrintedReceipt] = useState<Order | null>(null);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState<boolean>(false);

  // Pairing Modal
  const [showPairingModal, setShowPairingModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sound and ping state
  const [lastSyncPing, setLastSyncPing] = useState<string>('Agora');

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.active) return false;
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesCode = p.code && p.code.toLowerCase().includes(term);
        if (!matchesName && !matchesCode) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchTerm]);

  // Handle adding product to cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [{ product, quantity }, ...prev];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setKeypadInput('');
  };

  // Physical/Virtual Keypad click handler on Ton
  const handleKeypadPress = (key: string) => {
    if (key === 'CLEAR') {
      setKeypadInput(prev => prev.slice(0, -1));
    } else if (key === 'CANCEL') {
      setKeypadInput('');
    } else if (key === 'ENTER') {
      // Find product by code (e.g., '01', '02', '30')
      if (!keypadInput.trim()) return;
      const found = products.find(p => p.code === keypadInput || p.id === `prod_${keypadInput}`);
      if (found) {
        handleAddToCart(found, 1);
        playNotificationChime('sync');
        addToast('info', `Item lançado via teclado: ${found.name}`, `Código #${keypadInput}`);
        setKeypadInput('');
      } else {
        addToast('error', 'Código não encontrado', `Nenhum produto cadastrado com o código #${keypadInput}`);
        setKeypadInput('');
      }
    } else {
      // Number clicked (0-9)
      if (keypadInput.length < 4) {
        setKeypadInput(prev => prev + key);
      }
    }
  };

  // Trigger payment flow
  const handleInitiatePayment = () => {
    if (cart.length === 0) {
      addToast('error', 'Carrinho Vazio', 'Adicione pelo menos um produto para cobrar.');
      return;
    }
    setPaymentStep('select');
    setShowPaymentModal(true);
  };

  // Process payment on Ton terminal
  const handleConfirmPayment = () => {
    setPaymentStep('processing');

    setTimeout(() => {
      // Create and sync order
      const randomNsu = Math.floor(100000 + Math.random() * 900000).toString();
      const randomAuth = Math.floor(1000 + Math.random() * 9000).toString();

      const createdOrder = createDirectOrder({
        type: selectedChannel,
        tableNumber: selectedChannel === 'table' ? selectedTableNumber : undefined,
        customerName: selectedChannel === 'table' ? `Mesa ${selectedTableNumber}` : customerName,
        customerPhone: '',
        items: cart.map(c => ({
          productId: c.product.id,
          productName: c.product.name,
          unitPrice: c.product.price,
          quantity: c.quantity,
          volume: c.product.volume,
          code: c.product.code
        })),
        subtotal: cartTotal,
        deliveryFee: 0,
        discount: 0,
        total: cartTotal,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'paid',
        status: 'delivered',
        waiterName: activeTerminal?.operatorName || 'Operador Ton',
        originTerminalId: activeTerminal?.id,
        originTerminalName: activeTerminal?.name,
        cardBrand,
        cardNsu: randomNsu,
        cardAuthCode: randomAuth
      });

      setLastProcessedOrder(createdOrder);
      setPaymentStep('approved');
      playNotificationChime('pay');

      // Trigger automatic thermal receipt print out of Ton top slot
      setIsPrintingReceipt(true);
      setPrintedReceipt(createdOrder);

      setTimeout(() => {
        setIsPrintingReceipt(false);
      }, 3500);

      // Reset cart
      setCart([]);
      setKeypadInput('');
    }, 1600);
  };

  // Copy pairing link
  const handleCopyPairingLink = () => {
    const url = `${window.location.origin}/?page=terminal_pos&terminal=${activeTerminal?.id || 'term_ton_1'}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast('success', 'Link copiado!', 'Cole no navegador da maquininha ou envie via WhatsApp.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Modo PDV Maquininha (Ton & Stone)</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Sincronizado com PC
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Terminal portátil para vendedores e pista. Todo pedido registrado aqui cai na hora no computador central!
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('mockup')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'mockup'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulador Maquininha Ton</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('fullscreen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'fullscreen'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Modo Tela Cheia (App Direto)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('manager')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'manager'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Painel de Conexão</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPairingModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Conectar Maquininha</span>
          </button>
        </div>
      </div>

      {/* Live Sync Status Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white">Nuvem BebêAqui Realtime:</span>
            <span className="text-emerald-400 font-mono font-semibold">100% Online & Conectado</span>
          </div>

          <span className="hidden sm:inline text-slate-600">|</span>

          <div className="text-slate-400 flex items-center gap-1.5">
            <span>Terminal Ativo:</span>
            <strong className="text-amber-400 font-mono">{activeTerminal?.name || 'Ton T3 Verde'}</strong>
            <span className="text-slate-500">({activeTerminal?.operatorName || 'Carlos Andrade'})</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" /> Wi-Fi / 4G Ativo
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <BatteryCharging className="w-3.5 h-3.5" /> 94% Bateria
          </span>
          <button
            type="button"
            onClick={() => {
              playNotificationChime('sync');
              addToast('info', 'Ping de Sincronização!', 'Comunicação entre computador e maquininha testada: 8ms de latência.');
            }}
            className="hover:text-white underline cursor-pointer"
          >
            Testar Ping
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: PHYSICAL TON MOCKUP SIMULATOR (VERDE COM TECLADO) */}
      {/* ======================================================== */}
      {viewMode === 'mockup' && (
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 pt-2">
          {/* Instructions Box Left */}
          <div className="w-full lg:w-80 space-y-4 text-xs text-slate-300 order-2 lg:order-1">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Como Testar a Sincronização:</span>
              </h3>
              <ol className="space-y-2.5 list-decimal list-inside text-slate-400">
                <li>
                  <strong className="text-slate-200">Clique nas bebidas</strong> na tela da maquininha Ton ao lado para adicionar ao carrinho.
                </li>
                <li>
                  <strong className="text-slate-200">Ou use o teclado físico verde</strong>: digite o código da bebida (ex: <span className="font-mono text-amber-400 font-bold">01</span> ou <span className="font-mono text-amber-400 font-bold">02</span>) e aperte a tecla <strong className="text-emerald-400 font-bold">O (Verde)</strong>.
                </li>
                <li>
                  Aperte <strong className="text-emerald-400 font-bold">"Cobrar na Maquininha"</strong> e conclua com cartão ou PIX.
                </li>
                <li>
                  Veja o <strong className="text-amber-400 font-bold">comprovante impresso saindo da bobina</strong> no topo da Ton!
                </li>
                <li>
                  Abra a aba <strong>"Pedidos Varejo & Delivery"</strong> ou o <strong>Dashboard</strong> no seu computador para ver o pedido lançado lá instantaneamente!
                </li>
              </ol>
            </div>

            {/* Quick Terminal Switcher */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Alternar Maquininha em Uso:
              </span>
              <div className="space-y-1.5">
                {posTerminals.map(term => (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => {
                      setActiveTerminal(term);
                      addToast('info', 'Terminal Ativado', `Agora operando como ${term.name}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      activeTerminal?.id === term.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{term.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Online</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{term.operatorName} • {term.channelLabel}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Machine Chassis Simulator (Green hardware matching Stone / Ton photos) */}
          <div className="relative order-1 lg:order-2 flex flex-col items-center gap-3">
            {/* Model & Flip Selector Bar above Machine */}
            <div className="w-full flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setChassisModel('stone_smart_touch');
                    setShowRearSide(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    chassisModel === 'stone_smart_touch'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Stone Smart Touch Screen (TELA INTEIRA)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChassisModel('ton_t3_keypad');
                    setShowRearSide(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    chassisModel === 'ton_t3_keypad'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ton T3 (Teclado)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowRearSide(prev => !prev)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                title="Girar para ver a câmera traseira da Stone"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>{showRearSide ? 'Frente' : 'Girar Traseira'}</span>
              </button>
            </div>

            {/* The Green Body Chassis */}
            <div className="w-[360px] sm:w-[380px] bg-[#10b981] p-4 pt-5 pb-5 rounded-[44px] shadow-2xl shadow-emerald-950/80 border-4 border-[#059669] flex flex-col items-center relative select-none">
              
              {/* REAR VIEW OF STONE SMART (MATCHES STONE BAR DO VITIN LD 2.jpeg) */}
              {showRearSide ? (
                <div className="w-full h-[580px] bg-[#10b981] rounded-3xl p-5 flex flex-col justify-between items-center relative select-none">
                  {/* Upper curve with "stone" brand */}
                  <div className="w-full flex flex-col items-center pt-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter opacity-85">
                      stone
                    </span>

                    {/* Horizontal Camera Window (dual lens + amber LED flash from photo 2) */}
                    <div className="w-52 h-11 mt-6 bg-slate-950 rounded-2xl border-2 border-slate-900 flex items-center justify-between px-7 shadow-xl">
                      {/* Camera scanner lens */}
                      <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500/50" />
                      </div>
                      {/* Amber LED flash */}
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-300 shadow-md shadow-amber-400/50" />
                    </div>

                    {/* Speaker sound grille slits */}
                    <div className="w-12 flex flex-col gap-1 mt-4">
                      <div className="h-0.5 bg-slate-900/60 rounded-full" />
                      <div className="h-0.5 bg-slate-900/60 rounded-full" />
                      <div className="h-0.5 bg-slate-900/60 rounded-full" />
                      <div className="h-0.5 bg-slate-900/60 rounded-full" />
                    </div>
                  </div>

                  {/* Middle Battery Door with 6 Pogo Charging Pins */}
                  <div className="w-56 h-64 bg-[#0ea5e9]/5 border-2 border-[#059669] rounded-2xl flex flex-col items-center justify-between p-4 shadow-inner">
                    {/* 6 Gold Charging Contacts */}
                    <div className="p-1.5 bg-slate-900/40 rounded-xl flex items-center gap-1.5 border border-slate-900/30">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                      ))}
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[11px] font-mono text-slate-900 font-extrabold uppercase tracking-wider block">
                        STONE SMART ANDROID POS
                      </span>
                      <p className="text-[10px] text-emerald-950/80 font-medium">
                        Leitor Óptico de Código de Barras
                        <br />
                        Bateria 2600mAh • 4G + Wi-Fi
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerBarcodeScan}
                      disabled={isScanningBarcode}
                      className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>{isScanningBarcode ? 'Lendo Cerveja...' : 'Bipar com Câmera Stone'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
                    <span>Stone Smart Touch Screen • Traseira com Câmera e Leitor</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Thermal Printer Slot */}
                  <div className="w-full bg-[#047857] h-13 rounded-2xl border-2 border-[#065f46] relative overflow-visible flex flex-col items-center justify-center mb-3 shadow-inner">
                    {/* Contactless NFC icon on paper lid as in photo 1 */}
                    {chassisModel === 'stone_smart_touch' ? (
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <span className="text-xs font-black">)))</span>
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider">
                          NFC APROXIMAÇÃO STONE
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono font-black text-emerald-200 uppercase tracking-widest">
                        TON IMPRESSORA TÉRMICA
                      </span>
                    )}

                    {/* Paper cutter notch */}
                    <div className="w-40 h-1.5 bg-slate-950/60 rounded-full mt-1" />

                    {/* Animated Printed Paper Receipt coming out of the slot */}
                    {printedReceipt && (
                      <div
                        className={`absolute top-full z-40 w-[270px] bg-white text-slate-950 p-3 rounded-b-xl shadow-2xl font-mono text-[10px] border-t-2 border-dashed border-slate-300 transition-all duration-700 ${
                          isPrintingReceipt
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-2 opacity-95'
                        }`}
                      >
                        <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
                          <div className="font-extrabold text-xs">🍻 {activeCompany.tradeName}</div>
                          <div className="text-[9px] text-slate-600">{activeCompany.cnpj}</div>
                          <div className="text-[10px] font-bold text-emerald-700 mt-1">
                            COMPROVANTE DE PAGAMENTO
                          </div>
                          <div className="text-[9px] text-slate-500">VIA CLIENTE • STONE SMART</div>
                        </div>

                        <div className="space-y-0.5 text-[9px]">
                          <div className="flex justify-between">
                            <span>PEDIDO:</span>
                            <strong className="font-bold">{printedReceipt.displayId}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>CANAL:</span>
                            <span className="uppercase">{printedReceipt.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>DATA:</span>
                            <span>{new Date(printedReceipt.createdAt).toLocaleTimeString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VENDEDOR:</span>
                            <span>{printedReceipt.waiterName || 'Carlos'}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 my-1.5 pt-1 space-y-0.5">
                          {printedReceipt.items.map((it, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate max-w-[170px]">{it.quantity}x {it.productName}</span>
                              <strong>R$ {(it.unitPrice * it.quantity).toFixed(2).replace('.', ',')}</strong>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-dashed border-slate-400 pt-1 flex justify-between font-extrabold text-xs text-slate-950">
                          <span>TOTAL PAGO:</span>
                          <span>R$ {printedReceipt.total.toFixed(2).replace('.', ',')}</span>
                        </div>

                        <div className="mt-1 text-[8px] text-slate-600 text-center">
                          NSU: {printedReceipt.cardNsu || '884192'} • AUT: {printedReceipt.cardAuthCode || '9921'}
                          <br />
                          APROVADO VIA STONE SMART POS
                        </div>

                        <button
                          type="button"
                          onClick={() => setPrintedReceipt(null)}
                          className="mt-2 w-full py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[9px] cursor-pointer"
                        >
                          Destacar Recibo (Fechar)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Terminal Touchscreen Display */}
                  <div
                    className={`w-full ${
                      chassisModel === 'stone_smart_touch' ? 'h-[520px]' : 'h-[460px]'
                    } bg-slate-950 rounded-2xl border-4 border-slate-900 shadow-2xl flex flex-col overflow-hidden text-white transition-all`}
                  >
                    {/* Screen Top Status Bar */}
                    <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-300 border-b border-slate-800 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-emerald-400 font-mono">BebêAqui</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 truncate max-w-[80px]">{activeCompany.tradeName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono">
                        {chassisModel === 'stone_smart_touch' && (
                          <button
                            type="button"
                            onClick={handleTriggerBarcodeScan}
                            disabled={isScanningBarcode}
                            className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[9px] flex items-center gap-0.5 border border-emerald-500/40 cursor-pointer"
                            title="Bipar produto com a câmera traseira da Stone"
                          >
                            <Camera className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{isScanningBarcode ? '...' : 'Bipar'}</span>
                          </button>
                        )}
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Wifi className="w-2.5 h-2.5" /> 4G
                        </span>
                        <span className="text-slate-300">94%</span>
                      </div>
                    </div>

                    {/* Screen Channel / Mode Switcher */}
                    <div className="bg-slate-900/90 px-2 py-1.5 border-b border-slate-800 flex items-center justify-between gap-1 shrink-0">
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setSelectedChannel('counter')}
                          className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            selectedChannel === 'counter'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Balcão
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChannel('table')}
                          className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            selectedChannel === 'table'
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Mesa
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChannel('delivery')}
                          className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            selectedChannel === 'delivery'
                              ? 'bg-blue-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Entrega
                        </button>
                      </div>

                      {selectedChannel === 'table' && (
                        <select
                          value={selectedTableNumber}
                          onChange={e => setSelectedTableNumber(parseInt(e.target.value, 10))}
                          className="bg-slate-800 text-white text-[10px] font-bold px-1.5 py-1 rounded-lg border border-slate-700"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <option key={n} value={n}>Mesa {n}</option>
                          ))}
                        </select>
                      )}

                      {selectedChannel === 'counter' && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold truncate max-w-[80px]">
                          Venda Rápida
                        </span>
                      )}
                    </div>

                    {/* Category Pills Bar */}
                    <div className="px-2 py-1 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-[9px] shrink-0 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap cursor-pointer ${
                          selectedCategory === 'all'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Tudo
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat.id
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Keypad Quick Code Input Bar */}
                    {keypadInput && (
                      <div className="bg-amber-500/20 border-b border-amber-500/40 px-3 py-1 flex items-center justify-between text-xs text-amber-300">
                        <span className="font-mono">Código: <strong>#{keypadInput}</strong></span>
                        <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                          Aperte Verde (O)
                        </span>
                      </div>
                    )}

                    {/* Products Grid in Screen */}
                    <div className="flex-1 p-2 overflow-y-auto space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        {filteredProducts.slice(0, 12).map(product => {
                          const inCart = cart.find(c => c.product.id === product.id);
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleAddToCart(product, 1)}
                              className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative active:scale-95 ${
                                inCart
                                  ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {inCart && (
                                <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                                  {inCart.quantity}
                                </span>
                              )}
                              <div>
                                <div className="flex items-center gap-1">
                                  {product.code && (
                                    <span className="text-[8px] font-mono font-bold bg-slate-800 text-amber-400 px-1 rounded">
                                      #{product.code}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-slate-400">{product.volume}</span>
                                </div>
                                <div className="font-bold text-[11px] text-white line-clamp-1 mt-0.5">
                                  {product.name}
                                </div>
                              </div>
                              <div className="font-mono font-bold text-emerald-400 text-xs mt-1">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Screen Bottom Cart Summary Bar */}
                    <div className="bg-slate-900 p-2.5 border-t border-slate-800 shrink-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Carrinho: <strong className="text-white">{cartCount} itens</strong>
                        </span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          R$ {cartTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        {cart.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearCart}
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                            title="Limpar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleInitiatePayment}
                          disabled={cart.length === 0}
                          className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer ${
                            cart.length > 0
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>COBRAR R$ {cartTotal.toFixed(2)}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stone Smart Touch Chin (NO physical keypad - Full Touchscreen TELA INTEIRA) */}
                  {chassisModel === 'stone_smart_touch' ? (
                    <div className="w-full mt-2.5 py-1.5 px-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900 tracking-tighter">
                          stone
                        </span>
                        <span className="text-[10px] font-mono text-emerald-950 font-bold bg-[#059669]/30 px-2.5 py-0.5 rounded-full">
                          Touch Screen • TELA INTEIRA
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleTriggerBarcodeScan}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
                      >
                        <ScanLine className="w-3 h-3 text-emerald-400" />
                        <span>Câmera Bip</span>
                      </button>
                    </div>
                  ) : (
                    /* Ton Physical Numeric Keypad (Matches the Ton T3 photo) */
                    <div className="w-full mt-3 bg-slate-950 p-2.5 rounded-2xl border-2 border-slate-900 shadow-inner">
                      <div className="grid grid-cols-4 gap-1.5 text-white font-mono font-bold text-sm">
                        <button type="button" onClick={() => handleKeypadPress('1')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">1</button>
                        <button type="button" onClick={() => handleKeypadPress('2')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">2</button>
                        <button type="button" onClick={() => handleKeypadPress('3')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">3</button>
                        <button type="button" onClick={() => handleKeypadPress('CANCEL')} className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black">✕</button>

                        <button type="button" onClick={() => handleKeypadPress('4')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">4</button>
                        <button type="button" onClick={() => handleKeypadPress('5')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">5</button>
                        <button type="button" onClick={() => handleKeypadPress('6')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">6</button>
                        <button type="button" onClick={() => handleKeypadPress('CLEAR')} className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black">&lt;</button>

                        <button type="button" onClick={() => handleKeypadPress('7')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">7</button>
                        <button type="button" onClick={() => handleKeypadPress('8')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">8</button>
                        <button type="button" onClick={() => handleKeypadPress('9')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">9</button>
                        <button type="button" onClick={() => keypadInput ? handleKeypadPress('ENTER') : handleInitiatePayment()} className="row-span-2 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl shadow-lg">◯</button>

                        <button type="button" onClick={() => addToast('info', 'Ajuda', 'Manual da Maquininha')} className="p-2 rounded-xl bg-slate-900 text-[9px] text-slate-400 font-bold">AJUDA</button>
                        <button type="button" onClick={() => handleKeypadPress('0')} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-center">0</button>
                        <button type="button" onClick={() => setShowPairingModal(true)} className="p-2 rounded-xl bg-slate-900 text-[9px] text-slate-400 font-bold">ATALHOS</button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-slate-950 font-black text-sm">
                        <span className="text-white text-xs opacity-70">stone</span>
                        <span className="text-white font-extrabold text-base tracking-tighter">ton</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: FULLSCREEN POCKET POS (PARA A MAQUININHA OU CELULAR) */}
      {/* ======================================================== */}
      {viewMode === 'fullscreen' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>PDV Portátil Touch</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Alta Densidade
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interface pura adaptada para rodar em tela cheia na maquininha Smart POS ou no celular do vendedor.
              </p>
            </div>
            <div className="font-mono text-emerald-400 font-bold text-lg">
              R$ {cartTotal.toFixed(2).replace('.', ',')}
            </div>
          </div>

          {/* Quick Channel & Table */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedChannel('counter')}
              className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedChannel === 'counter'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Balcão</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('table')}
              className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedChannel === 'table'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Mesa {selectedTableNumber}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('delivery')}
              className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedChannel === 'delivery'
                  ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <span>Delivery</span>
            </button>
          </div>

          {/* Search & Categories */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar bebida ou código (#01)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredProducts.map(p => {
              const inCart = cart.find(c => c.product.id === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddToCart(p, 1)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative active:scale-95 ${
                    inCart
                      ? 'bg-slate-950 border-amber-400 shadow-lg ring-1 ring-amber-400/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {inCart.quantity}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      {p.code && (
                        <span className="text-[10px] font-mono font-bold bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded">
                          #{p.code}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{p.volume}</span>
                    </div>
                    <div className="font-bold text-xs text-white line-clamp-1 mt-1">
                      {p.name}
                    </div>
                  </div>
                  <div className="font-mono font-extrabold text-emerald-400 text-sm mt-2">
                    R$ {p.price.toFixed(2).replace('.', ',')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Floating Cart & Action */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Itens no Pedido: <strong className="text-white">{cartCount}</strong>
              </span>
              <span className="font-mono font-black text-emerald-400 text-base">
                Total: R$ {cartTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={cart.length === 0}
                className={`flex-1 py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                  cart.length > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>FINALIZAR & COBRAR NA TON (R$ {cartTotal.toFixed(2)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: MANAGER DASHBOARD (GERENCIAR MAQUININHAS DA EQUIPE) */}
      {/* ======================================================== */}
      {viewMode === 'manager' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-xs text-slate-400">Maquininhas Conectadas</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {posTerminals.length} Terminais
              </div>
              <p className="text-[11px] text-slate-400">Todas comunicando em tempo real</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-xs text-slate-400">Vendas via Maquininhas Hoje</span>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {posTerminals.reduce((s, t) => s + t.totalOrdersToday, 0)} Pedidos
              </div>
              <p className="text-[11px] text-slate-400">Registrados na pista, balcão e mesas</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-xs text-slate-400">Volume Total Liquidado</span>
              <div className="text-2xl font-black text-blue-400 font-mono">
                R$ {posTerminals.reduce((s, t) => s + t.totalVolumeToday, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">Direto na Stone/Ton sem redigitação</p>
            </div>
          </div>

          {/* List of Terminals */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>Maquininhas Registradas no BebêAqui</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cada aparelho possui um canal e um vendedor vinculado para identificação nos relatórios.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPairingModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Maquininha</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posTerminals.map(term => (
                <div
                  key={term.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        {term.modelLabel}
                      </span>
                      <h3 className="font-bold text-white text-sm mt-1">{term.name}</h3>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Online" />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 py-1 border-y border-slate-800/80">
                    <div className="flex justify-between">
                      <span>Operador:</span>
                      <strong className="text-slate-200">{term.operatorName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Canal:</span>
                      <span className="text-amber-400 font-semibold">{term.channelLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Serial / ID:</span>
                      <span className="font-mono text-slate-300">{term.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bateria / Sinal:</span>
                      <span className="text-slate-300 font-mono">{term.batteryLevel}% • {term.signalStrength.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vendas Hoje:</span>
                      <strong className="text-emerald-400 font-mono">{term.totalOrdersToday} pedidos</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTerminal(term);
                        setViewMode('mockup');
                        addToast('info', 'Maquininha Aberta no Simulador', `Operando agora como ${term.name}`);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Abrir Simulador</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PAYMENT ON TON TERMINAL (SIMULAÇÃO REAL DE COBRANÇA) */}
      {/* ======================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Cobrar na Maquininha Ton</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Select Payment Method on Ton */}
            {paymentStep === 'select' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-400">Valor Total do Pedido:</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    R$ {cartTotal.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {cartCount} itens • {selectedChannel === 'table' ? `Mesa ${selectedTableNumber}` : 'Balcão'}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Forma de Cobrança na Ton:
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('credit_card')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPaymentMethod === 'credit_card'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400 mb-1" />
                      <div className="text-xs">Crédito</div>
                      <div className="text-[10px] text-slate-400">À vista ou parcelado</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('debit_card')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPaymentMethod === 'debit_card'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-blue-400 mb-1" />
                      <div className="text-xs">Débito</div>
                      <div className="text-[10px] text-slate-400">Aproximação / Chip</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('pix')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPaymentMethod === 'pix'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-amber-400 mb-1" />
                      <div className="text-xs">PIX na Tela</div>
                      <div className="text-[10px] text-slate-400">QR Code na maquininha</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('cash')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPaymentMethod === 'cash'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-300 mb-1" />
                      <div className="text-xs">Dinheiro</div>
                      <div className="text-[10px] text-slate-400">Recebimento físico</div>
                    </button>
                  </div>
                </div>

                {/* Bandeira & Parcelas se for Crédito */}
                {selectedPaymentMethod === 'credit_card' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Bandeira do Cartão:</span>
                      <select
                        value={cardBrand}
                        onChange={e => setCardBrand(e.target.value as any)}
                        className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-700 font-bold"
                      >
                        <option value="Mastercard">Mastercard</option>
                        <option value="Visa">Visa</option>
                        <option value="Elo">Elo</option>
                        <option value="Hipercard">Hipercard</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Opção de Parcelamento:</span>
                      <select
                        value={cardInstallments}
                        onChange={e => setCardInstallments(parseInt(e.target.value, 10))}
                        className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-700 font-bold"
                      >
                        <option value={1}>1x à vista (R$ {cartTotal.toFixed(2)})</option>
                        <option value={2}>2x de R$ {(cartTotal / 2).toFixed(2)}</option>
                        <option value={3}>3x de R$ {(cartTotal / 3).toFixed(2)}</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-95"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>PROCESSAR CARTÃO NA TON</span>
                </button>
              </div>
            )}

            {/* Step 2: Processing / Waiting for Card */}
            {paymentStep === 'processing' && (
              <div className="py-10 text-center space-y-4">
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-500" />
                  <CreditCard className="w-6 h-6 text-emerald-400 absolute" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Aproxime ou Insira o Cartão...</h4>
                  <p className="text-xs text-slate-400">
                    Aguardando comunicação com a operadora Stone / Ton
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  VALOR: R$ {cartTotal.toFixed(2).replace('.', ',')}
                </div>
              </div>
            )}

            {/* Step 3: Approved */}
            {paymentStep === 'approved' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-emerald-400">TRANSAÇÃO APROVADA!</h4>
                  <p className="text-xs text-slate-300">
                    Pedido sincronizado instantaneamente com o computador do caixa!
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Pedido:</span>
                    <strong className="text-white">{lastProcessedOrder?.displayId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>NSU Stone:</span>
                    <span className="text-slate-300">{lastProcessedOrder?.cardNsu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Autorização:</span>
                    <span className="text-slate-300">{lastProcessedOrder?.cardAuthCode}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Novo Pedido na Maquininha
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PAIRING NEW TERMINAL (COMO CONECTAR A MAQUININHA) */}
      {/* ======================================================== */}
      {showPairingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Conectar Maquininha ao Computador</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPairingModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Para fazer sua maquininha Ton/Stone (ou smartphone do vendedor) registrar pedidos sincronizados com o computador, basta abrir o link de acesso direto:
              </p>

              {/* QR Code and Step Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
                  {/* Visual QR Code representation */}
                  <div className="w-28 h-28 bg-slate-950 p-2 flex flex-col justify-between items-center rounded">
                    <div className="flex justify-between w-full">
                      <div className="w-6 h-6 bg-white rounded-sm" />
                      <div className="w-6 h-6 bg-white rounded-sm" />
                    </div>
                    <div className="text-[8px] font-mono text-white text-center font-bold">
                      BEBÊAQUI
                      <br />
                      SYNC
                    </div>
                    <div className="flex justify-between w-full">
                      <div className="w-6 h-6 bg-white rounded-sm" />
                      <div className="w-6 h-6 bg-emerald-400 rounded-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-white">Instruções para a Ton ou Celular:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Se sua Ton tiver tela Smart/Android, abra o navegador e acesse a URL da distribuidora.</li>
                    <li>Ou abra no smartphone do garçom/vendedor.</li>
                    <li>Faça login como operador de pista.</li>
                    <li>Qualquer pedido lançado sincronizará com o computador do caixa em menos de 0.5s!</li>
                  </ol>
                </div>
              </div>

              {/* Direct Link Copier */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Link Direto para o Navegador do Terminal:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?page=terminal_pos`}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPairingLink}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPairingModal(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
