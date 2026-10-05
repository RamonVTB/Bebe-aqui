import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Company,
  Category,
  Product,
  Table,
  Order,
  Employee,
  StockMovement,
  Role,
  SubscriptionStatus,
  BankDetails,
  PaymentConfig,
  OrderItem,
  OrderStatus,
  TableStatus,
  PaymentMethod,
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleOrderStatus,
  PlanType,
  PlanConfig,
  PosTerminal
} from '../types';
import {
  initialCompanies,
  initialCategories,
  initialProducts,
  initialTables,
  initialOrders,
  initialEmployees,
  initialStockMovements,
  initialWholesaleCustomers,
  initialWholesaleOrders,
  initialPlans,
  initialPosTerminals,
  DEMO_COMPANY_ID
} from '../data/initialData';
import {
  dispatchRealtimeEvent,
  subscribeToRealtimeEvents,
  playNotificationChime,
  RealtimeEventPayload
} from '../utils/realtimeSync';

export type ActivePage =
  | 'landing'
  | 'plans'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'products'
  | 'stock'
  | 'tables'
  | 'orders'
  | 'daily_report'
  | 'weekly_report'
  | 'employees'
  | 'settings'
  | 'subscription'
  | 'statement'
  | 'pos'
  | 'terminal_pos'
  | 'menu'
  | 'order_tracking'
  | 'wholesale';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  // Navigation & Company state
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  activeCompany: Company;
  companies: Company[];
  deleteCompany: (companyId: string) => void;
  
  // Auth & Roles
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUser: { name: string; email: string; role: Role } | null;
  login: (email: string, role?: Role) => boolean;
  logout: () => void;
  registerCompany: (data: Partial<Company> & { password?: string }) => void;
  seedSampleProducts: () => void;

  // Data per active company
  categories: Category[];
  products: Product[];
  tables: Table[];
  orders: Order[];
  employees: Employee[];
  stockMovements: StockMovement[];

  // Entity handlers
  addProduct: (product: Omit<Product, 'id' | 'companyId'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (productId: string, delta: number, reason?: string) => void;
  
  addCategory: (name: string, iconName?: string) => void;
  
  addStockMovement: (productId: string, type: 'in' | 'out' | 'adjustment', quantity: number, reason: string, author: string) => void;
  
  addTable: (number: number, name: string, capacity: number) => void;
  updateTableStatus: (tableId: string, status: TableStatus, notes?: string) => void;
  deleteTable: (tableId: string) => void;
  closeTableBill: (tableNumber: number, paymentMethod: PaymentMethod) => void;

  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createDirectOrder: (orderData: Partial<Order>) => Order;

  addEmployee: (employee: Omit<Employee, 'id' | 'companyId'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  updateCompanyInfo: (data: Partial<Company>) => void;
  updateCompanyDetails: (data: Partial<Company>) => void;
  updateBankDetails: (details: Partial<BankDetails>) => void;
  updatePaymentConfig: (config: Partial<PaymentConfig>) => void;
  updateSubscriptionStatus: (status: SubscriptionStatus, nextBilling?: string) => void;

  // Digital Menu & Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Order Placement & Tracking
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  placeCustomerOrder: (orderDetails: {
    type: 'table' | 'delivery' | 'counter';
    tableNumber?: number;
    customerName: string;
    customerPhone: string;
    customerAddress?: {
      street: string;
      number: string;
      neighborhood: string;
      complement?: string;
      city: string;
      reference?: string;
    };
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash';
    changeFor?: number;
    notes?: string;
  }) => Order;

  // UI & Accessibility
  highContrast: boolean;
  setHighContrast: (value: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: 'normal' | 'large' | 'larger';
  setFontSize: (size: 'normal' | 'large' | 'larger') => void;
  fontSizeLevel: number;
  fontScale: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Multi-tenant QR & Table Access
  customerTableNumber: number | null;
  setCustomerTableNumber: (table: number | null) => void;
  getTableQrUrl: (companyId?: string, tableNumber?: number) => string;

  // Wholesale (Atacado B2B)
  wholesaleOrders: WholesaleOrder[];
  wholesaleCustomers: WholesaleCustomer[];
  addWholesaleOrder: (order: Omit<WholesaleOrder, 'id' | 'displayId' | 'companyId' | 'createdAt'>) => WholesaleOrder;
  updateWholesaleOrderStatus: (orderId: string, status: WholesaleOrderStatus) => void;
  deleteWholesaleOrder: (orderId: string) => void;
  addWholesaleCustomer: (customer: Omit<WholesaleCustomer, 'id' | 'companyId' | 'createdAt' | 'usedCredit'>) => WholesaleCustomer;
  updateWholesaleCustomer: (customerId: string, data: Partial<WholesaleCustomer>) => void;

  // Plans & Access Control
  activePlan: PlanConfig;
  availablePlans: PlanConfig[];
  switchCompanyPlan: (planType: PlanType) => void;
  canAccessWholesale: boolean;
  canAccessDistribuidora: boolean;

  // POS Terminals & Realtime Smart POS Sync
  posTerminals: PosTerminal[];
  activeTerminal: PosTerminal | null;
  setActiveTerminal: (t: PosTerminal | null) => void;
  addPosTerminal: (terminal: Omit<PosTerminal, 'id' | 'companyId' | 'totalOrdersToday' | 'totalVolumeToday' | 'lastSyncAt'>) => PosTerminal;
  updatePosTerminal: (id: string, data: Partial<PosTerminal>) => void;
  deletePosTerminal: (id: string) => void;
  syncTerminalOrder: (order: Order, terminalId?: string) => void;
  isRealtimeSyncing: boolean;
}

export const defaultEmptyCompany: Company = {
  id: '',
  name: 'Minha Distribuidora',
  tradeName: 'Minha Distribuidora',
  cnpj: '00.000.000/0001-00',
  phone: '(11) 99999-9999',
  email: 'contato@distribuidora.com',
  zipCode: '01001-000',
  address: 'Rua Principal',
  number: '100',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  logoUrl: '',
  coverUrl: '',
  plan: 'Plano BebêAqui Distribuidora',
  planPrice: 80.00,
  subscriptionStatus: 'active',
  nextBillingDate: '2026-10-30',
  paymentMethodText: 'PIX / Boleto',
  bankDetails: {
    pixKeyType: 'cnpj',
    pixKey: '00.000.000/0001-00',
    bankName: 'Banco',
    agency: '0001',
    account: '00000-0',
    accountType: 'corrente',
    beneficiaryName: 'Distribuidora',
    document: '00.000.000/0001-00'
  },
  paymentConfig: {
    acceptPix: true,
    acceptCredit: true,
    acceptDebit: true,
    acceptCash: true,
    defaultDeliveryFee: 8.00,
    minimumOrderValue: 20.00,
    estimatedDeliveryTime: '30 - 45 min'
  },
  createdAt: new Date().toISOString()
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent state init with localStorage sanitization (removes legacy demo accounts like Beer Express)
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_companies');
      if (saved) {
        const parsed: Company[] = JSON.parse(saved);
        const valid = parsed.filter(c => 
          c.id !== 'comp_1' && 
          c.id !== 'comp_2' &&
          !c.tradeName?.toLowerCase().includes('beer express') &&
          !c.name?.toLowerCase().includes('beer express') &&
          !c.tradeName?.toLowerCase().includes('adega real') &&
          !c.name?.toLowerCase().includes('adega real')
        );
        if (valid.length > 0) return valid;
      }
    } catch {
      // ignore
    }
    return initialCompanies;
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    const saved = localStorage.getItem('bebeaqui_active_company_id');
    if (saved && saved !== 'comp_1' && saved !== 'comp_2' && saved.trim() !== '') {
      return saved;
    }
    return initialCompanies[0]?.id || '';
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_categories');
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        const filtered = parsed.filter(c => c.companyId !== 'comp_1' && c.companyId !== 'comp_2');
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        const filtered = parsed.filter(p => p.companyId !== 'comp_1' && p.companyId !== 'comp_2');
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return initialProducts;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_tables');
      if (saved) {
        const parsed: Table[] = JSON.parse(saved);
        const filtered = parsed.filter(t => t.companyId !== 'comp_1' && t.companyId !== 'comp_2');
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return initialTables;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        const filtered = parsed.filter(o => o.companyId !== 'comp_1' && o.companyId !== 'comp_2');
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return initialOrders;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_employees');
      if (saved) {
        const parsed: Employee[] = JSON.parse(saved);
        const filtered = parsed.filter(e => e.companyId !== 'comp_1' && e.companyId !== 'comp_2');
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return initialEmployees;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_stock_movements');
      if (saved) {
        const parsed: StockMovement[] = JSON.parse(saved);
        const filtered = parsed.filter(m => m.companyId !== 'comp_1' && m.companyId !== 'comp_2');
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return initialStockMovements;
  });

  // Current session & navigation
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: Role } | null>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.email?.toLowerCase().includes('beerexpress')) {
          return parsed;
        }
      }
    } catch {}
    return {
      name: 'Carlos Andrade (Admin Geral)',
      email: 'contato@bebeaqui.com.br',
      role: 'admin' as Role
    };
  });

  const handleSetCurrentRole = (role: Role) => {
    setCurrentRole(role);
    let demoUser = {
      name: 'Carlos Andrade (Admin Geral)',
      email: 'carlos@bebeaqui.com.br',
      role: 'admin' as Role
    };
    if (role === 'admin_distribuidora') {
      demoUser = {
        name: 'Eduardo Ramos (Admin Distribuidora)',
        email: 'eduardo.distribuidora@bebeaqui.com.br',
        role: 'admin_distribuidora' as Role
      };
    } else if (role === 'atacado_operator') {
      demoUser = {
        name: 'Roberto Vendas (Operador Atacado)',
        email: 'roberto.atacado@bebeaqui.com.br',
        role: 'atacado_operator' as Role
      };
    } else if (role === 'staff') {
      demoUser = {
        name: 'Lucas Silveira (Atendente de Balcão)',
        email: 'lucas@bebeaqui.com.br',
        role: 'staff' as Role
      };
    } else if (role === 'customer') {
      demoUser = {
        name: 'Cliente da Loja (Mesa)',
        email: 'cliente@cardapio.com',
        role: 'customer' as Role
      };
    }
    setCurrentUser(demoUser);
    try {
      localStorage.setItem('bebeaqui_current_user', JSON.stringify(demoUser));
    } catch {}
  };

  // Multi-tenant QR & Table identification
  const [customerTableNumber, setCustomerTableNumber] = useState<number | null>(null);

  // Cart & Tracking
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Wholesale (Atacado B2B) state
  const [wholesaleCustomers, setWholesaleCustomers] = useState<WholesaleCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_wholesale_customers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialWholesaleCustomers;
  });

  const [wholesaleOrders, setWholesaleOrders] = useState<WholesaleOrder[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_wholesale_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialWholesaleOrders;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bebeaqui_wholesale_customers', JSON.stringify(wholesaleCustomers));
    } catch {}
  }, [wholesaleCustomers]);

  useEffect(() => {
    try {
      localStorage.setItem('bebeaqui_wholesale_orders', JSON.stringify(wholesaleOrders));
    } catch {}
  }, [wholesaleOrders]);

  // POS Terminals (Maquininhas Ton/Stone) State
  const [posTerminals, setPosTerminals] = useState<PosTerminal[]>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_pos_terminals');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return initialPosTerminals;
  });

  const [activeTerminal, setActiveTerminal] = useState<PosTerminal | null>(() => {
    return initialPosTerminals[0] || null;
  });

  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('bebeaqui_pos_terminals', JSON.stringify(posTerminals));
    } catch {}
  }, [posTerminals]);

  // Listen for Realtime Sync events from Portable Terminals & PC
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeEvents((event: RealtimeEventPayload) => {
      setIsRealtimeSyncing(true);
      setTimeout(() => setIsRealtimeSyncing(false), 2200);

      if (event.type === 'ORDER_CREATED_FROM_TERMINAL') {
        const orderData = event.data as Order;
        if (orderData && orderData.id) {
          setOrders(prev => {
            if (prev.some(o => o.id === orderData.id)) return prev;
            return [orderData, ...prev];
          });
          playNotificationChime('order');
          addToast(
            'success',
            `📡 Novo Pedido na Maquininha!`,
            `${event.sourceTerminalName || 'Terminal'} registrou o pedido ${orderData.displayId} (${orderData.customerName}) de R$ ${orderData.total.toFixed(2).replace('.', ',')}. Sincronizado instantaneamente!`
          );
        }
      } else if (event.type === 'ORDER_PAID') {
        const { orderId, paymentMethod, nsu } = event.data || {};
        if (orderId) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'delivered', paymentMethod: paymentMethod || o.paymentMethod } : o));
          playNotificationChime('pay');
          addToast('success', '💳 Pagamento Aprovado na Maquininha!', `Transação Stone/Ton aprovada! NSU: ${nsu || '88412'}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Accessibility & Toasts
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bebeaqui_font_level');
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= -1 && val <= 3) return val;
      }
    } catch {}
    return 0;
  });

  const fontScale = useMemo(() => {
    switch (fontSizeLevel) {
      case -1: return 90;
      case 0: return 100;
      case 1: return 115;
      case 2: return 130;
      case 3: return 145;
      default: return 100;
    }
  }, [fontSizeLevel]);

  // Synchronize root font-size with document element for instant scaling across entire app
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${fontScale}%`;
      try {
        localStorage.setItem('bebeaqui_font_level', fontSizeLevel.toString());
      } catch {}
      if (fontSizeLevel <= 0) {
        setFontSize('normal');
      } else if (fontSizeLevel === 1) {
        setFontSize('large');
      } else {
        setFontSize('larger');
      }
    }
  }, [fontSizeLevel, fontScale]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const increaseFontSize = () => {
    setFontSizeLevel(prev => {
      const next = Math.min(prev + 1, 3);
      const nextScale = next === 1 ? 115 : next === 2 ? 130 : next === 3 ? 145 : 100;
      addToast('info', 'Letras aumentadas', `Tamanho ampliado para ${nextScale}% para melhor visualização.`);
      return next;
    });
  };

  const decreaseFontSize = () => {
    setFontSizeLevel(prev => {
      const next = Math.max(prev - 1, -1);
      const nextScale = next === -1 ? 90 : next === 0 ? 100 : next === 1 ? 115 : 130;
      addToast('info', 'Letras reduzidas', `Tamanho ajustado para ${nextScale}%.`);
      return next;
    });
  };

  const resetFontSize = () => {
    setFontSizeLevel(0);
    addToast('info', 'Tamanho padrão', 'Letras restauradas para 100%.');
  };

  // Automatically detect and route customers accessing via QR Code (?company=...&table=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const targetCompany = searchParams.get('company') || searchParams.get('empresa');
      const targetTable = searchParams.get('table') || searchParams.get('mesa');
      const targetView = searchParams.get('view');

      if (targetCompany) {
        setActiveCompanyId(targetCompany);
      }

      if (targetTable) {
        const parsedTable = parseInt(targetTable, 10);
        if (!isNaN(parsedTable)) {
          setCustomerTableNumber(parsedTable);
        }
      }

      // If user scanned a table or company menu QR code, immediately route them to digital menu as customer
      if (targetCompany || targetTable || targetView === 'menu') {
        setCurrentRole('customer');
        setCurrentUser(null);
        setActivePage('menu');
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const getTableQrUrl = (companyId?: string, tableNumber?: number): string => {
    if (typeof window === 'undefined') return '';
    const compId = companyId || activeCompanyId;
    const origin = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('company', compId);
    if (tableNumber !== undefined && tableNumber !== null) {
      params.set('table', tableNumber.toString());
    }
    params.set('view', 'menu');
    return `${origin}?${params.toString()}`;
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('bebeaqui_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('bebeaqui_active_company_id', activeCompanyId);
  }, [activeCompanyId]);

  useEffect(() => {
    localStorage.setItem('bebeaqui_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('bebeaqui_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bebeaqui_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('bebeaqui_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bebeaqui_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('bebeaqui_stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  // Toast helper
  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Active company resolution
  const activeCompany: Company = companies.length > 0
    ? (companies.find(c => c.id === activeCompanyId) || companies[0])
    : defaultEmptyCompany;

  // Keep activeCompanyId in sync when companies change
  useEffect(() => {
    if (companies.length > 0) {
      if (!activeCompanyId || !companies.some(c => c.id === activeCompanyId)) {
        setActiveCompanyId(companies[0].id);
      }
    }
  }, [companies, activeCompanyId]);

  // Auth actions
  const login = (email: string, role: Role = 'admin') => {
    const matchedCompany = companies.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (matchedCompany) {
      setActiveCompanyId(matchedCompany.id);
    }
    const matchedEmp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (matchedEmp) {
      setActiveCompanyId(matchedEmp.companyId);
    }

    const companyName = matchedCompany ? matchedCompany.tradeName : activeCompany.tradeName;
    const name = matchedEmp
      ? `${matchedEmp.name} (${matchedEmp.role === 'admin' ? 'Admin' : 'Funcionário'})`
      : role === 'admin'
        ? `${companyName} (Admin)`
        : role === 'staff'
          ? `${companyName} (Funcionário)`
          : 'Cliente';

    const effectiveRole: Role = (matchedEmp && matchedEmp.role) ? matchedEmp.role : role;
    setCurrentRole(effectiveRole);
    const userObj = { name, email, role: effectiveRole };
    setCurrentUser(userObj);
    localStorage.setItem('bebeaqui_current_user', JSON.stringify(userObj));

    if (effectiveRole === 'customer') {
      setActivePage('menu');
    } else {
      setActivePage('dashboard');
    }
    addToast('success', 'Login realizado com sucesso!', `Bem-vindo ao BebêAqui, ${name}.`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bebeaqui_current_user');
    setCurrentRole('customer');
    setActivePage('landing');
    addToast('info', 'Sessão encerrada', 'Você saiu da sua conta.');
  };

  const deleteCompany = (companyId: string) => {
    setCompanies(prev => {
      const filtered = prev.filter(c => c.id !== companyId);
      if (activeCompanyId === companyId) {
        if (filtered.length > 0) {
          setActiveCompanyId(filtered[0].id);
        } else {
          setActiveCompanyId('');
        }
      }
      return filtered;
    });
    setCategories(prev => prev.filter(c => c.companyId !== companyId));
    setProducts(prev => prev.filter(p => p.companyId !== companyId));
    setTables(prev => prev.filter(t => t.companyId !== companyId));
    setOrders(prev => prev.filter(o => o.companyId !== companyId));
    setEmployees(prev => prev.filter(e => e.companyId !== companyId));
    addToast('info', 'Distribuidora removida', 'A distribuidora foi removida do sistema com sucesso.');
  };

  const registerCompany = (data: Partial<Company> & { password?: string }) => {
    const newId = 'comp_' + Date.now();
    const newCompany: Company = {
      id: newId,
      name: data.name || 'Nova Distribuidora de Bebidas Ltda',
      tradeName: data.tradeName || data.name || 'Minha Distribuidora',
      cnpj: data.cnpj || '00.000.000/0001-00',
      phone: data.phone || '(11) 99999-9999',
      email: data.email || 'contato@distribuidora.com',
      zipCode: data.zipCode || '01001-000',
      address: data.address || 'Rua das Bebidas',
      number: data.number || '100',
      neighborhood: data.neighborhood || 'Centro',
      city: data.city || 'São Paulo',
      state: data.state || 'SP',
      logoUrl: data.logoUrl || '',
      coverUrl: data.coverUrl || '',
      plan: data.plan || 'Plano Distribuidora de Bebidas',
      planPrice: data.planPrice || 80.00,
      subscriptionStatus: 'active',
      nextBillingDate: '2026-10-24',
      paymentMethodText: data.paymentMethodText || 'PIX (Telefone: 31975346290)',
      bankDetails: {
        pixKeyType: 'cnpj',
        pixKey: data.cnpj || '00.000.000/0001-00',
        bankName: 'Banco do Brasil',
        agency: '0001',
        account: '12345-6',
        accountType: 'corrente',
        beneficiaryName: data.tradeName || 'Distribuidora BebêAqui',
        document: data.cnpj || '00.000.000/0001-00'
      },
      paymentConfig: {
        acceptPix: true,
        acceptCredit: true,
        acceptDebit: true,
        acceptCash: true,
        defaultDeliveryFee: 10.00,
        minimumOrderValue: 30.00,
        estimatedDeliveryTime: '30 - 45 min'
      },
      createdAt: new Date().toISOString()
    };

    // Default categories for new company
    const defaultCats: Category[] = [
      { id: `cat_${newId}_1`, companyId: newId, name: 'Cervejas & Chopp', slug: 'cervejas', iconName: 'Beer' },
      { id: `cat_${newId}_2`, companyId: newId, name: 'Destilados & Drinks', slug: 'destilados', iconName: 'Wine' },
      { id: `cat_${newId}_3`, companyId: newId, name: 'Refrigerantes & Sucos', slug: 'nao-alcoolicos', iconName: 'CupSoda' },
      { id: `cat_${newId}_4`, companyId: newId, name: 'Gelo & Acessórios', slug: 'gelo', iconName: 'Snowflake' }
    ];

    // Seed 2 default products
    const defaultProds: Product[] = [
      {
        id: `prod_${newId}_1`,
        companyId: newId,
        categoryId: `cat_${newId}_1`,
        name: 'Pack Cerveja Pilsen Especial 6x350ml',
        description: 'Cerveja pilsen gelada e refrescante para comemorações.',
        price: 32.90,
        costPrice: 22.00,
        stock: 50,
        minStock: 10,
        unit: 'pack',
        volume: '6x 350ml',
        imageUrl: '/src/assets/images/hero_beverages_showcase_1790213443501.jpg',
        active: true,
        featured: true,
        alcoholic: true
      },
      {
        id: `prod_${newId}_2`,
        companyId: newId,
        categoryId: `cat_${newId}_4`,
        name: 'Saco de Gelo Cristalino 5kg',
        description: 'Gelo filtrado em cubos.',
        price: 15.00,
        costPrice: 6.50,
        stock: 30,
        minStock: 10,
        unit: 'un',
        volume: '5kg',
        imageUrl: '/src/assets/images/hero_beverages_showcase_1790213443501.jpg',
        active: true,
        featured: false,
        alcoholic: false
      }
    ];

    // Default tables
    const defaultTables: Table[] = [
      { id: `tab_${newId}_1`, companyId: newId, number: 1, name: 'Mesa 01', capacity: 4, status: 'available' },
      { id: `tab_${newId}_2`, companyId: newId, number: 2, name: 'Mesa 02', capacity: 4, status: 'available' },
      { id: `tab_${newId}_3`, companyId: newId, number: 3, name: 'Mesa 03', capacity: 6, status: 'available' }
    ];

    setCompanies(prev => [...prev, newCompany]);
    setCategories(prev => [...prev, ...defaultCats]);
    setProducts(prev => [...prev, ...defaultProds]);
    setTables(prev => [...prev, ...defaultTables]);

    // Switch to new company and login as admin
    setActiveCompanyId(newId);
    setCurrentRole('admin');
    setCurrentUser({
      name: newCompany.tradeName + ' (Admin)',
      email: newCompany.email,
      role: 'admin'
    });
    setActivePage('dashboard');

    addToast('success', 'Distribuidora cadastrada com sucesso!', 'Seu ambiente exclusivo no BebêAqui foi provisionado.');
  };

  const seedSampleProducts = () => {
    const targetCompId = activeCompanyId || (companies[0]?.id) || DEMO_COMPANY_ID;
    const cats: Category[] = initialCategories.map(c => ({
      ...c,
      companyId: targetCompId
    }));

    const prods: Product[] = initialProducts.map(p => ({
      ...p,
      companyId: targetCompId
    }));

    setCategories(prev => [...prev.filter(c => c.companyId !== targetCompId), ...cats]);
    setProducts(prev => [...prev.filter(p => p.companyId !== targetCompId), ...prods]);

    if (tables.filter(t => t.companyId === targetCompId).length === 0) {
      const defaultTbls = initialTables.map(t => ({ ...t, companyId: targetCompId }));
      setTables(prev => [...prev.filter(t => t.companyId !== targetCompId), ...defaultTbls]);
    }

    addToast('success', 'Catálogo Oficial de 30 Bebidas Carregado!', 'Cervejas, Refrigerantes, Destilados, Energéticos, Água e Gelo prontos para venda.');
  };

  // Auto-seed demo products if current products array is empty or lacks items for active company
  useEffect(() => {
    const targetCompId = activeCompanyId || DEMO_COMPANY_ID;
    const hasProducts = products.some(p => p.companyId === targetCompId);
    if (!hasProducts) {
      const defaultCats = initialCategories.map(c => ({ ...c, companyId: targetCompId }));
      const defaultProds = initialProducts.map(p => ({ ...p, companyId: targetCompId }));
      setCategories(prev => {
        const withoutTarget = prev.filter(c => c.companyId !== targetCompId);
        return [...withoutTarget, ...defaultCats];
      });
      setProducts(prev => {
        const withoutTarget = prev.filter(p => p.companyId !== targetCompId);
        return [...withoutTarget, ...defaultProds];
      });
    }
  }, [activeCompanyId, products]);

  // Company data filters with seamless fallback so the catalog is NEVER empty
  const currentCompanyCategories = useMemo(() => {
    const direct = categories.filter(c => c.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    const demo = categories.filter(c => c.companyId === DEMO_COMPANY_ID);
    if (demo.length > 0) return demo;
    return initialCategories;
  }, [categories, activeCompanyId]);

  const currentCompanyProducts = useMemo(() => {
    const direct = products.filter(p => p.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    const demo = products.filter(p => p.companyId === DEMO_COMPANY_ID);
    if (demo.length > 0) return demo;
    return initialProducts;
  }, [products, activeCompanyId]);

  const currentCompanyTables = useMemo(() => {
    const direct = tables.filter(t => t.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    const demo = tables.filter(t => t.companyId === DEMO_COMPANY_ID);
    if (demo.length > 0) return demo;
    return initialTables;
  }, [tables, activeCompanyId]);

  const currentCompanyOrders = useMemo(() => {
    const direct = orders.filter(o => o.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    const demo = orders.filter(o => o.companyId === DEMO_COMPANY_ID);
    if (demo.length > 0) return demo;
    return initialOrders;
  }, [orders, activeCompanyId]);

  const currentCompanyEmployees = useMemo(() => {
    const direct = employees.filter(e => e.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    const demo = employees.filter(e => e.companyId === DEMO_COMPANY_ID);
    if (demo.length > 0) return demo;
    return initialEmployees;
  }, [employees, activeCompanyId]);

  const currentCompanyMovements = useMemo(() => {
    const direct = stockMovements.filter(m => m.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    const demo = stockMovements.filter(m => m.companyId === DEMO_COMPANY_ID);
    if (demo.length > 0) return demo;
    return initialStockMovements;
  }, [stockMovements, activeCompanyId]);

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'companyId'>) => {
    const newProd: Product = {
      ...prodData,
      id: 'prod_' + Date.now(),
      companyId: activeCompanyId
    };
    setProducts(prev => [newProd, ...prev]);
    addToast('success', 'Produto cadastrado', `${newProd.name} foi adicionado ao catálogo.`);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    addToast('info', 'Produto atualizado', 'As alterações foram salvas com sucesso.');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast('warning', 'Produto removido', 'O item foi excluído do catálogo.');
  };

  const addCategory = (name: string, iconName = 'Beer') => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newCat: Category = {
      id: 'cat_' + Date.now(),
      companyId: activeCompanyId,
      name,
      slug,
      iconName
    };
    setCategories(prev => [...prev, newCat]);
    addToast('success', 'Categoria criada', `Categoria "${name}" adicionada.`);
  };

  // Stock Movement & Control
  const addStockMovement = (
    productId: string,
    type: 'in' | 'out' | 'adjustment',
    quantity: number,
    reason: string,
    author: string
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const previousStock = product.stock;
    let newStock = previousStock;
    if (type === 'in') newStock = previousStock + quantity;
    else if (type === 'out') newStock = Math.max(0, previousStock - quantity);
    else if (type === 'adjustment') newStock = quantity;

    const movement: StockMovement = {
      id: 'mov_' + Date.now(),
      companyId: activeCompanyId,
      productId,
      productName: product.name,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      date: new Date().toISOString(),
      author: author || currentUser?.name || 'Administrador'
    };

    setStockMovements(prev => [movement, ...prev]);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    addToast('success', 'Estoque atualizado', `${product.name}: saldo ajustado para ${newStock} ${product.unit}.`);
  };

  // Tables CRUD
  const addTable = (number: number, name: string, capacity: number) => {
    const newTable: Table = {
      id: 'tab_' + Date.now(),
      companyId: activeCompanyId,
      number,
      name: name || `Mesa ${number.toString().padStart(2, '0')}`,
      capacity: capacity || 4,
      status: 'available'
    };
    setTables(prev => [...prev, newTable]);
    addToast('success', 'Mesa adicionada', `${newTable.name} cadastrada com sucesso.`);
  };

  const updateTableStatus = (tableId: string, status: TableStatus, notes?: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status,
          waiterNotes: notes !== undefined ? notes : t.waiterNotes,
          openedAt: status === 'occupied' && !t.openedAt ? new Date().toISOString() : status === 'available' ? undefined : t.openedAt
        };
      }
      return t;
    }));
    addToast('info', 'Status da mesa atualizado');
  };

  const updateProductStock = (productId: string, delta: number, reason?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    }));

    const prod = products.find(p => p.id === productId);
    if (prod) {
      addStockMovement(
        productId,
        delta >= 0 ? 'in' : 'out',
        Math.abs(delta),
        reason || (delta >= 0 ? 'Entrada manual' : 'Saída manual'),
        currentUser?.name || 'Administrador'
      );
    }
    addToast('success', 'Estoque atualizado com sucesso');
  };

  const closeTableBill = (tableNumber: number, paymentMethod: PaymentMethod) => {
    // Mark active table orders as delivered and paid
    setOrders(prev => prev.map(o => {
      if (o.tableNumber === tableNumber && o.status !== 'cancelled' && o.status !== 'delivered') {
        return {
          ...o,
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod,
          completedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    // Release table
    setTables(prev => prev.map(t => {
      if (t.number === tableNumber) {
        return {
          ...t,
          status: 'available',
          currentOrderId: undefined,
          openedAt: undefined
        };
      }
      return t;
    }));

    addToast('success', 'Conta da mesa fechada!', `Mesa ${tableNumber} liberada e pagamento registrado.`);
  };

  const updateCompanyDetails = (data: Partial<Company>) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === activeCompanyId) {
        return {
          ...c,
          ...data,
          bankDetails: data.bankDetails ? { ...c.bankDetails, ...data.bankDetails } : c.bankDetails,
          paymentConfig: data.paymentConfig ? { ...c.paymentConfig, ...data.paymentConfig } : c.paymentConfig
        };
      }
      return c;
    }));
    addToast('success', 'Configurações da distribuidora atualizadas');
  };

  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    addToast('warning', 'Mesa removida');
  };

  // Orders Management
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const completedAt = (status === 'delivered' || status === 'cancelled') ? new Date().toISOString() : o.completedAt;
        const paymentStatus = status === 'delivered' ? 'paid' : o.paymentStatus;
        return { ...o, status, completedAt, paymentStatus };
      }
      return o;
    }));

    // If order was associated with a table and now delivered/cancelled, prompt or auto-release
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder?.tableId && (status === 'delivered' || status === 'cancelled')) {
      // Table can be marked available
      setTables(prev => prev.map(t => t.id === targetOrder.tableId ? { ...t, status: 'available', currentOrderId: undefined } : t));
    }

    addToast('success', 'Status do pedido alterado', `Pedido ${targetOrder?.displayId} agora está "${status}".`);
  };

  const createDirectOrder = (orderData: Partial<Order>): Order => {
    const displayNum = 1000 + orders.length + 1;
    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      displayId: `#${displayNum}`,
      companyId: activeCompanyId,
      type: orderData.type || 'counter',
      tableId: orderData.tableId,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName || 'Cliente Balcão',
      customerPhone: orderData.customerPhone || '',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      serviceFee: orderData.serviceFee || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'pix',
      splitPayments: orderData.splitPayments,
      changeFor: orderData.changeFor,
      paymentStatus: orderData.paymentStatus || 'paid',
      status: orderData.status || 'delivered',
      waiterName: orderData.waiterName,
      notes: orderData.notes,
      originTerminalId: orderData.originTerminalId,
      originTerminalName: orderData.originTerminalName,
      cardBrand: orderData.cardBrand,
      cardNsu: orderData.cardNsu,
      cardAuthCode: orderData.cardAuthCode,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    // Broadcast across windows / devices (Maquininha <-> PC)
    dispatchRealtimeEvent('ORDER_CREATED_FROM_TERMINAL', newOrder, newOrder.originTerminalId, newOrder.originTerminalName);

    // Decrement stock
    newOrder.items.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id === item.productId) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      }));
    });

    addToast('success', 'Venda realizada!', `Pedido ${newOrder.displayId} registrado com sucesso.`);
    return newOrder;
  };

  // Employees CRUD
  const addEmployee = (empData: Omit<Employee, 'id' | 'companyId'>) => {
    const newEmp: Employee = {
      ...empData,
      id: 'emp_' + Date.now(),
      companyId: activeCompanyId
    };
    setEmployees(prev => [...prev, newEmp]);
    addToast('success', 'Funcionário cadastrado', `${newEmp.name} agora faz parte da equipe.`);
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    addToast('info', 'Funcionário atualizado');
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    addToast('warning', 'Funcionário removido');
  };

  // POS Terminals (Maquininhas Ton/Stone) CRUD & Sync
  const addPosTerminal = (terminalData: Omit<PosTerminal, 'id' | 'companyId' | 'totalOrdersToday' | 'totalVolumeToday' | 'lastSyncAt'>): PosTerminal => {
    const newTerm: PosTerminal = {
      ...terminalData,
      id: 'term_' + Date.now(),
      companyId: activeCompanyId,
      totalOrdersToday: 0,
      totalVolumeToday: 0,
      lastSyncAt: new Date().toISOString()
    };
    setPosTerminals(prev => [...prev, newTerm]);
    addToast('success', 'Maquininha conectada!', `${newTerm.name} agora está pronta para receber pedidos sincronizados com o computador.`);
    return newTerm;
  };

  const updatePosTerminal = (id: string, data: Partial<PosTerminal>) => {
    setPosTerminals(prev => prev.map(t => t.id === id ? { ...t, ...data, lastSyncAt: new Date().toISOString() } : t));
    addToast('info', 'Maquininha atualizada');
  };

  const deletePosTerminal = (id: string) => {
    setPosTerminals(prev => prev.filter(t => t.id !== id));
    addToast('warning', 'Maquininha desvinculada');
  };

  const syncTerminalOrder = (order: Order, terminalId?: string) => {
    const term = posTerminals.find(t => t.id === terminalId) || activeTerminal;
    const enriched: Order = {
      ...order,
      originTerminalId: term?.id,
      originTerminalName: term?.name
    };
    setOrders(prev => {
      if (prev.some(o => o.id === enriched.id)) {
        return prev.map(o => o.id === enriched.id ? enriched : o);
      }
      return [enriched, ...prev];
    });

    if (term) {
      setPosTerminals(prev => prev.map(t => t.id === term.id ? {
        ...t,
        totalOrdersToday: t.totalOrdersToday + 1,
        totalVolumeToday: t.totalVolumeToday + enriched.total,
        lastSyncAt: new Date().toISOString()
      } : t));
    }

    dispatchRealtimeEvent('ORDER_CREATED_FROM_TERMINAL', enriched, term?.id, term?.name);
  };

  // Company Settings
  const updateCompanyInfo = (data: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === activeCompanyId ? { ...c, ...data } : c));
    addToast('success', 'Dados da empresa atualizados');
  };

  const updateBankDetails = (details: Partial<BankDetails>) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === activeCompanyId) {
        return {
          ...c,
          bankDetails: { ...c.bankDetails, ...details }
        };
      }
      return c;
    }));
    addToast('success', 'Dados bancários e chave PIX atualizados com sucesso');
  };

  const updatePaymentConfig = (config: Partial<PaymentConfig>) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === activeCompanyId) {
        return {
          ...c,
          paymentConfig: { ...c.paymentConfig, ...config }
        };
      }
      return c;
    }));
    addToast('success', 'Configurações de pagamento e entrega salvas');
  };

  const updateSubscriptionStatus = (status: SubscriptionStatus, nextBilling?: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === activeCompanyId) {
        return {
          ...c,
          subscriptionStatus: status,
          nextBillingDate: nextBilling || c.nextBillingDate
        };
      }
      return c;
    }));
    addToast('info', 'Simulação de Assinatura', `Status alterado para "${status}".`);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, notes?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.notes === notes);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, notes }];
    });
    addToast('success', 'Adicionado ao carrinho!', `${product.name} (${quantity}x)`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Place customer order from digital menu
  const placeCustomerOrder = (orderDetails: {
    type: 'table' | 'delivery' | 'counter';
    tableNumber?: number;
    customerName: string;
    customerPhone: string;
    customerAddress?: {
      street: string;
      number: string;
      neighborhood: string;
      complement?: string;
      city: string;
      reference?: string;
    };
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash';
    changeFor?: number;
    notes?: string;
  }): Order => {
    const deliveryFee = orderDetails.type === 'delivery' ? activeCompany.paymentConfig.defaultDeliveryFee : 0;
    const subtotal = cartTotal;
    const total = subtotal + deliveryFee;
    const displayNum = 1000 + orders.length + 1;

    const effectiveTableNum = orderDetails.type === 'table' ? (orderDetails.tableNumber || customerTableNumber || undefined) : undefined;
    let targetTableId: string | undefined = undefined;
    if (orderDetails.type === 'table' && effectiveTableNum) {
      const matchedTable = currentCompanyTables.find(t => t.number === effectiveTableNum);
      if (matchedTable) {
        targetTableId = matchedTable.id;
        // Update table to occupied
        setTables(prev => prev.map(t => t.id === matchedTable.id ? { ...t, status: 'occupied', openedAt: new Date().toISOString() } : t));
      }
    }

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      volume: item.product.volume,
      notes: item.notes,
      imageUrl: item.product.imageUrl
    }));

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      displayId: `#${displayNum}`,
      companyId: activeCompanyId,
      type: orderDetails.type,
      tableId: targetTableId,
      tableNumber: effectiveTableNum,
      customerName: orderDetails.customerName,
      customerPhone: orderDetails.customerPhone,
      customerAddress: orderDetails.customerAddress,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      paymentMethod: orderDetails.paymentMethod,
      changeFor: orderDetails.changeFor,
      paymentStatus: orderDetails.paymentMethod === 'pix' ? 'pending' : 'pending',
      status: 'received',
      notes: orderDetails.notes,
      createdAt: new Date().toISOString()
    };

    // Deduct stock
    cart.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id === item.product.id) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      }));
    });

    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingOrder(newOrder);
    clearCart();
    setActivePage('order_tracking');

    addToast('success', 'Pedido enviado com sucesso!', `Seu pedido ${newOrder.displayId} foi recebido pela distribuidora.`);
    return newOrder;
  };

  // Wholesale (Atacado B2B) Operations
  const currentCompanyWholesaleOrders = useMemo(() => {
    const direct = wholesaleOrders.filter(o => o.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    return initialWholesaleOrders;
  }, [wholesaleOrders, activeCompanyId]);

  const currentCompanyWholesaleCustomers = useMemo(() => {
    const direct = wholesaleCustomers.filter(c => c.companyId === activeCompanyId);
    if (direct.length > 0) return direct;
    return initialWholesaleCustomers;
  }, [wholesaleCustomers, activeCompanyId]);

  const addWholesaleOrder = (orderData: Omit<WholesaleOrder, 'id' | 'displayId' | 'companyId' | 'createdAt'>): WholesaleOrder => {
    const newId = `w_order_${Date.now()}`;
    const displayNum = 1049 + wholesaleOrders.length;
    const newOrder: WholesaleOrder = {
      ...orderData,
      id: newId,
      displayId: `#AT-${displayNum}`,
      companyId: activeCompanyId,
      createdAt: new Date().toISOString()
    };

    setWholesaleOrders(prev => [newOrder, ...prev]);

    // Automatically deduct stock and register stock movement
    orderData.items.forEach(item => {
      setProducts(prevProducts =>
        prevProducts.map(p => {
          if (p.id === item.productId) {
            const updatedStock = Math.max(0, p.stock - item.totalUnits);
            return { ...p, stock: updatedStock };
          }
          return p;
        })
      );

      addStockMovement(
        item.productId,
        'out',
        item.totalUnits,
        `Venda Atacado Pedido ${newOrder.displayId} (${item.packageQuantity} ${item.packageType}s)`,
        orderData.sellerName || 'Operador Atacado'
      );
    });

    addToast('success', `Pedido de Atacado Emitido: ${newOrder.displayId}!`, `Total: R$ ${newOrder.total.toFixed(2).replace('.', ',')} para ${newOrder.customerName}`);
    return newOrder;
  };

  const updateWholesaleOrderStatus = (orderId: string, status: WholesaleOrderStatus) => {
    setWholesaleOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const isComplete = status === 'entregue' || status === 'faturado';
          return {
            ...o,
            status,
            completedAt: isComplete ? new Date().toISOString() : o.completedAt
          };
        }
        return o;
      })
    );
    addToast('info', 'Status do Pedido Atualizado', `Novo status: ${status.toUpperCase()}`);
  };

  const deleteWholesaleOrder = (orderId: string) => {
    setWholesaleOrders(prev => prev.filter(o => o.id !== orderId));
    addToast('warning', 'Pedido de Atacado Removido');
  };

  const addWholesaleCustomer = (custData: Omit<WholesaleCustomer, 'id' | 'companyId' | 'createdAt' | 'usedCredit'>): WholesaleCustomer => {
    const newId = `w_cust_${Date.now()}`;
    const newCustomer: WholesaleCustomer = {
      ...custData,
      id: newId,
      companyId: activeCompanyId,
      usedCredit: 0,
      createdAt: new Date().toISOString()
    };
    setWholesaleCustomers(prev => [...prev, newCustomer]);
    addToast('success', 'Cliente B2B Cadastrado!', `${newCustomer.tradeName || newCustomer.name} pronto para pedidos.`);
    return newCustomer;
  };

  const updateWholesaleCustomer = (customerId: string, data: Partial<WholesaleCustomer>) => {
    setWholesaleCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, ...data } : c))
    );
    addToast('success', 'Cadastro Atualizado');
  };

  // Plan Management & Access Control
  const activePlanType: PlanType = useMemo(() => {
    if (activeCompany.planType) return activeCompany.planType;
    if (activeCompany.planPrice === 180 || activeCompany.plan?.toLowerCase().includes('180') || activeCompany.plan?.toLowerCase().includes('atacado e varejo')) {
      return 'distribuidora_atacado';
    }
    if (activeCompany.planPrice === 120 || activeCompany.plan?.toLowerCase().includes('120') || activeCompany.plan?.toLowerCase().includes('atacado')) {
      return 'atacado';
    }
    return 'distribuidora';
  }, [activeCompany]);

  const activePlan: PlanConfig = useMemo(() => {
    const found = initialPlans.find(p => p.id === activePlanType);
    return found || initialPlans[2];
  }, [activePlanType]);

  const availablePlans = initialPlans;

  const canAccessWholesale = activePlanType === 'atacado' || activePlanType === 'distribuidora_atacado';
  const canAccessDistribuidora = activePlanType === 'distribuidora' || activePlanType === 'distribuidora_atacado';

  const switchCompanyPlan = (planType: PlanType) => {
    const targetPlan = initialPlans.find(p => p.id === planType) || initialPlans[0];
    updateCompanyDetails({
      plan: targetPlan.name,
      planType: targetPlan.id,
      planPrice: targetPlan.price
    });
    addToast('success', `Plano Alterado: ${targetPlan.name}!`, `Valor: R$ ${targetPlan.price.toFixed(2).replace('.', ',')}/mês`);
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        activeCompanyId,
        setActiveCompanyId,
        activeCompany,
        companies,
        deleteCompany,
        currentRole,
        setCurrentRole: handleSetCurrentRole,
        currentUser,
        login,
        logout,
        registerCompany,
        seedSampleProducts,
        categories: currentCompanyCategories,
        products: currentCompanyProducts,
        tables: currentCompanyTables,
        orders: currentCompanyOrders,
        employees: currentCompanyEmployees,
        stockMovements: currentCompanyMovements,
        wholesaleOrders: currentCompanyWholesaleOrders,
        wholesaleCustomers: currentCompanyWholesaleCustomers,
        addWholesaleOrder,
        updateWholesaleOrderStatus,
        deleteWholesaleOrder,
        addWholesaleCustomer,
        updateWholesaleCustomer,
        activePlan,
        availablePlans,
        switchCompanyPlan,
        canAccessWholesale,
        canAccessDistribuidora,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        addCategory,
        addStockMovement,
        addTable,
        updateTableStatus,
        deleteTable,
        closeTableBill,
        updateOrderStatus,
        createDirectOrder,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateCompanyInfo,
        updateCompanyDetails,
        updateBankDetails,
        updatePaymentConfig,
        updateSubscriptionStatus,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        activeTrackingOrder,
        setActiveTrackingOrder,
        placeCustomerOrder,
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
        fontSizeLevel,
        fontScale,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        toasts,
        addToast,
        removeToast,
        customerTableNumber,
        setCustomerTableNumber,
        getTableQrUrl,
        posTerminals,
        activeTerminal,
        setActiveTerminal,
        addPosTerminal,
        updatePosTerminal,
        deletePosTerminal,
        syncTerminalOrder,
        isRealtimeSyncing
      }}
    >
      <div className={`${highContrast ? 'high-contrast' : ''} ${fontSize === 'large' ? 'text-lg' : fontSize === 'larger' ? 'text-xl' : 'text-base'}`}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
