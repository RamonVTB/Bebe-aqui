import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Bike,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { formatPhone, formatAddressNumber, formatCEP, getDigitCount } from '../utils/masks';
import { fetchAddressByCep } from '../utils/cep';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    cartTotal,
    cartItemCount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    activeCompany,
    tables,
    placeCustomerOrder,
    customerTableNumber
  } = useApp();

  const [orderType, setOrderType] = useState<'table' | 'delivery' | 'counter'>(
    customerTableNumber ? 'table' : 'delivery'
  );
  const [tableNumber, setTableNumber] = useState<number>(customerTableNumber || 1);

  // Sync table if customer scanned a table QR code
  React.useEffect(() => {
    if (customerTableNumber) {
      setOrderType('table');
      setTableNumber(customerTableNumber);
    }
  }, [customerTableNumber, isOpen]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cep, setCep] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash'>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomerCepChange = async (val: string) => {
    const formatted = formatCEP(val);
    setCep(formatted);
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await fetchAddressByCep(clean);
        if (res) {
          if (res.street) setStreet(res.street);
          if (res.neighborhood) setNeighborhood(res.neighborhood);
        }
      } catch {
        // Fallback silently
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  if (!isOpen) return null;

  const deliveryFee = orderType === 'delivery' ? activeCompany.paymentConfig.defaultDeliveryFee : 0;
  const finalTotal = cartTotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Adicione ao menos um item ao carrinho antes de finalizar.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Por favor, informe seu nome para identificação do pedido.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg('Por favor, informe seu telefone / WhatsApp.');
      return;
    }

    if (orderType === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setErrorMsg('Preencha os dados completos de entrega (rua, número e bairro).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      placeCustomerOrder({
        type: orderType,
        tableNumber: orderType === 'table' ? Number(tableNumber) : undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: orderType === 'delivery' ? {
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          complement: complement.trim(),
          city: activeCompany.city,
          reference: reference.trim()
        } : undefined,
        paymentMethod,
        changeFor: paymentMethod === 'cash' && changeFor ? parseFloat(changeFor) : undefined,
        notes: orderNotes.trim()
      });

      onClose();
    } catch {
      setErrorMsg('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">Seu Pedido BebêAqui</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {cartItemCount} itens
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
                  🍻
                </div>
                <h3 className="text-base font-semibold text-slate-200">Seu carrinho está vazio</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Explore as melhores cervejas, vinhos, destilados e combos do cardápio e adicione aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* List of items */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Itens Selecionados</span>
                    <button
                      onClick={clearCart}
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Limpar tudo
                    </button>
                  </div>

                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                          R$ {item.product.price.toFixed(2)} {item.product.volume ? `· ${item.product.volume}` : ''}
                        </p>
                        {item.notes && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">Obs: {item.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-amber-400">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Type Selector */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Onde você vai receber?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                        orderType === 'delivery'
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Entrega</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('table')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                        orderType === 'table'
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Na Mesa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('counter')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                        orderType === 'counter'
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Balcão</span>
                    </button>
                  </div>
                </div>

                {/* Table Choice */}
                {orderType === 'table' && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">Selecione o número da Mesa:</label>
                      {customerTableNumber && (
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Identificada via QR Code
                        </span>
                      )}
                    </div>
                    <select
                      value={tableNumber}
                      onChange={e => setTableNumber(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      {tables.map(table => (
                        <option key={table.id} value={table.number}>
                          Mesa {table.number.toString().padStart(2, '0')} - {table.name} ({table.status === 'available' ? 'Livre' : 'Ocupada'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer Info Form */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400">Seu Nome *</label>
                      <input
                        type="text"
                        placeholder="Ex: João Silva"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                        <span>WhatsApp / Telefone *</span>
                        {customerPhone && (
                          <span className="text-[10px] font-mono text-slate-400">{getDigitCount(customerPhone)}/11</span>
                        )}
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={15}
                        placeholder="(11) 98765-4321"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(formatPhone(e.target.value))}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  {orderType === 'delivery' && (
                    <div className="space-y-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Endereço de Entrega</span>
                        </div>
                        {isSearchingCep && (
                          <span className="text-[10px] text-amber-300 font-normal flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Localizando...
                          </span>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          placeholder="CEP: 00000-000 (preenche rua e bairro)"
                          value={cep}
                          onChange={e => handleCustomerCepChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Rua / Avenida *"
                            value={street}
                            onChange={e => setStreet(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Número *"
                            value={number}
                            onChange={e => setNumber(formatAddressNumber(e.target.value, 6))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Bairro *"
                          value={neighborhood}
                          onChange={e => setNeighborhood(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Complemento / Apto"
                          value={complement}
                          onChange={e => setComplement(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Ponto de Referência (opcional)"
                        value={reference}
                        onChange={e => setReference(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                          paymentMethod === 'pix'
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>PIX Imediato</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('credit_card')}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                          paymentMethod === 'credit_card'
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span>Cartão Crédito</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('debit_card')}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                          paymentMethod === 'debit_card'
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-purple-400" />
                        <span>Cartão Débito</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                          paymentMethod === 'cash'
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-amber-400" />
                        <span>Dinheiro</span>
                      </button>
                    </div>

                    {paymentMethod === 'cash' && (
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-400">Precisa de troco para quanto?</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 50.00"
                          value={changeFor}
                          onChange={e => setChangeFor(e.target.value)}
                          className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {paymentMethod === 'pix' && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Chave PIX da distribuidora ({activeCompany.bankDetails.pixKeyType.toUpperCase()}):</span>
                        </div>
                        <p className="font-mono bg-slate-900/80 px-2 py-1 rounded text-white select-all text-[11px]">
                          {activeCompany.bankDetails.pixKey}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* General order notes */}
                  <div className="pt-1">
                    <label className="text-[11px] font-medium text-slate-400">Observações adicionais (opcional)</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Bebidas bem geladas, copos descartáveis..."
                      value={orderNotes}
                      onChange={e => setOrderNotes(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer with Totals and Submit */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">R$ {cartTotal.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa de Entrega</span>
                    <span className="font-mono">R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
                  <span>Total</span>
                  <span className="font-mono text-amber-400">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Processando...' : 'Finalizar Pedido Agora'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
