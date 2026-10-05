export type Role = 'admin' | 'admin_distribuidora' | 'staff' | 'atacado_operator' | 'customer';

export type PlanType = 'distribuidora' | 'atacado' | 'distribuidora_atacado';

export type SubscriptionStatus = 'active' | 'pending' | 'approved' | 'cancelled' | 'expired';

export interface SubscriptionInvoice {
  id: string;
  month: string; // Ex: '2026-09', '2026-08', '2026-07'
  monthLabel: string; // Ex: 'Setembro de 2026', 'Agosto de 2026', 'Julho de 2026'
  planName: string;
  planType: PlanType;
  amount: number;
  paidAt: string;
  paymentMethod: string;
  pixTransactionId: string;
  status: 'paid' | 'pending';
  receiptNumber: string;
}

export interface Company {
  id: string;
  name: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email: string;
  zipCode: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  logoUrl?: string;
  coverUrl?: string;
  plan: string;
  planType?: PlanType;
  planPrice: number;
  subscriptionStatus: SubscriptionStatus;
  nextBillingDate: string;
  paymentMethodText: string;
  bankDetails: BankDetails;
  paymentConfig: PaymentConfig;
  subscriptionInvoices?: SubscriptionInvoice[];
  createdAt: string;
}

export interface BankDetails {
  pixKeyType: 'cnpj' | 'email' | 'phone' | 'random';
  pixKey: string;
  bankName: string;
  agency: string;
  account: string;
  accountType: 'corrente' | 'poupanca';
  beneficiaryName: string;
  document: string;
}

export interface PaymentConfig {
  acceptPix: boolean;
  acceptCredit: boolean;
  acceptDebit: boolean;
  acceptCash: boolean;
  defaultDeliveryFee: number;
  minimumOrderValue: number;
  minOrderValue?: number;
  estimatedDeliveryTime: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: Role;
  employeeId?: string;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  iconName: string;
}

export interface Product {
  id: string;
  companyId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: 'un' | 'cx' | 'fardo' | 'pack' | 'litro' | 'lata';
  volume: string; // Ex: '350ml', '600ml', '1L'
  imageUrl: string;
  active: boolean;
  featured?: boolean;
  alcoholic?: boolean;
  code?: string;
  barcode?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'bill_requested' | 'closing';

export interface Table {
  id: string;
  companyId: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  waiterNotes?: string;
  openedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  volume?: string;
  imageUrl?: string;
  code?: string;
}

export type OrderType = 'table' | 'delivery' | 'counter';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'fiado' | 'multiple';
export type PaymentStatus = 'pending' | 'paid';

export interface SplitPayment {
  method: string;
  methodLabel: string;
  amount: number;
  date?: string;
}

export interface Order {
  id: string;
  displayId: string; // Ex: #1042
  companyId: string;
  type: OrderType;
  tableId?: string;
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
  items: OrderItem[];
  subtotal: number;
  serviceFee?: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  splitPayments?: SplitPayment[];
  changeFor?: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  waiterName?: string;
  notes?: string;
  originTerminalId?: string;
  originTerminalName?: string;
  cardBrand?: string;
  cardNsu?: string;
  cardAuthCode?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PosTerminal {
  id: string;
  companyId: string;
  name: string; // Ex: 'Maquininha 01 - Ton Pista (Carlos)'
  model: 'ton_t3' | 'stone_smart_p2' | 'pax_d230' | 'generic_android';
  modelLabel: string; // Ex: 'Ton T3 (Stone)'
  serialNumber: string; // Ex: 'TON-8841-SP'
  operatorName: string; // Ex: 'Carlos Andrade'
  status: 'online' | 'busy' | 'offline';
  batteryLevel: number; // 0-100
  signalStrength: 'wifi' | '4g';
  channel: 'balcao' | 'mesas' | 'delivery' | 'todos';
  channelLabel: string;
  lastSyncAt: string;
  ipAddress?: string;
  totalOrdersToday: number;
  totalVolumeToday: number;
}

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  author: string;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  role?: Role;
  position?: string;
  roleTitle?: string;
  email: string;
  phone: string;
  active: boolean;
  hireDate?: string;
  permissions?: {
    canManageOrders: boolean;
    canManageProducts: boolean;
    canManageStock: boolean;
    canViewReports: boolean;
    canManageTables: boolean;
    canManageCompany: boolean;
    canManageWholesale?: boolean;
  };
}

// Wholesale (Atacado B2B) Types
export interface WholesaleCustomer {
  id: string;
  companyId: string;
  name: string;
  tradeName?: string; // Nome Fantasia
  document: string; // CNPJ ou CPF
  stateRegistration?: string; // Inscrição Estadual
  phone: string;
  email?: string;
  address: string;
  number?: string;
  neighborhood: string;
  city: string;
  state: string;
  creditLimit: number;
  usedCredit: number;
  paymentTerms: string; // ex: 'Boleto 14/28 dias' | 'PIX à Vista' | 'A Prazo 15 dias'
  notes?: string;
  createdAt: string;
}

export type WholesalePackageType = 'unidade' | 'fardo' | 'caixa' | 'engradado' | 'pack' | 'pallet';

export interface WholesaleOrderItem {
  productId: string;
  productName: string;
  packageType: WholesalePackageType;
  itemsPerPackage: number; // ex: 12 latas por fardo, 24 garrafas por caixa
  packageQuantity: number; // ex: 10 fardos
  totalUnits: number; // 120 latas
  unitPrice: number; // Preço unitário equivalente no atacado
  packagePrice: number; // Preço por fardo/caixa
  totalPrice: number;
}

export type WholesaleOrderStatus = 'orcamento' | 'confirmado' | 'separacao' | 'faturado' | 'entregue' | 'cancelado';
export type WholesalePaymentCondition = 'pix_vista' | 'boleto_14d' | 'boleto_28d' | 'boleto_14_28d' | 'cartao' | 'dinheiro' | 'a_prazo';

export interface WholesaleOrder {
  id: string;
  displayId: string; // ex: #AT-1048
  companyId: string;
  customerId: string;
  customerName: string;
  customerTradeName?: string;
  customerDocument: string;
  customerPhone: string;
  deliveryAddress: string;
  sellerName: string;
  items: WholesaleOrderItem[];
  subtotal: number;
  discount: number;
  freightFee: number;
  total: number;
  totalPackages: number;
  totalUnits: number;
  paymentCondition: WholesalePaymentCondition;
  deliveryType: 'entrega' | 'retirada';
  deliveryDate?: string;
  status: WholesaleOrderStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  badge?: string;
  tagline: string;
  description: string;
  targetAudience: string;
  features: string[];
  popular?: boolean;
}

