import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table, Order } from '../types';
import { TableQrModal } from '../components/TableQrModal';
import {
  UtensilsCrossed,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Receipt,
  X,
  PlusCircle,
  CreditCard,
  QrCode,
  DollarSign,
  Printer
} from 'lucide-react';

export const TablesView: React.FC = () => {
  const {
    tables,
    orders,
    addTable,
    updateTableStatus,
    activeCompany,
    setActivePage,
    closeTableBill
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState(tables.length + 1);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  // QR Code modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);

  // Payment close modal
  const [isCloseBillModalOpen, setIsCloseBillModalOpen] = useState(false);
  const [closePaymentMethod, setClosePaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash'>('pix');

  // Summary counts
  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const billCount = tables.filter(t => t.status === 'closing').length;

  const handleOpenTableDetails = (table: Table) => {
    setSelectedTable(table);
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    addTable(Number(newTableNum), newTableName.trim() || `Mesa ${newTableNum}`, Number(newTableCapacity) || 4);
    setIsAddTableModalOpen(false);
  };

  // Get active orders for selected table
  const tableOrders = selectedTable
    ? orders.filter(o => o.tableNumber === selectedTable.number && o.status !== 'cancelled' && o.status !== 'delivered')
    : [];

  const tableSubtotal = tableOrders.reduce((sum, o) => sum + o.total, 0);

  const handleFinalizeBill = () => {
    if (!selectedTable) return;
    closeTableBill(selectedTable.number, closePaymentMethod);
    setIsCloseBillModalOpen(false);
    setSelectedTable(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-amber-400" />
            <span>Gestão de Mesas e Comandas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mapa interativo do salão da <strong>{activeCompany.tradeName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setQrModalTable(null);
              setIsQrModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Central de QR Codes / Imprimir</span>
          </button>

          <button
            onClick={() => {
              setNewTableNum(tables.length + 1);
              setNewTableName(`Mesa ${(tables.length + 1).toString().padStart(2, '0')}`);
              setIsAddTableModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Mesa</span>
          </button>
        </div>
      </div>

      {/* Hall Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-semibold uppercase">Mesas Livres</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{availableCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 font-semibold uppercase">Mesas Ocupadas</span>
            <div className="text-2xl font-extrabold font-mono text-rose-400 mt-1">{occupiedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-400 font-semibold uppercase">Pediram a Conta</span>
            <div className="text-2xl font-extrabold font-mono text-blue-400 mt-1">{billCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map(table => {
          const isAvailable = table.status === 'available';
          const isClosing = table.status === 'closing';

          return (
            <button
              key={table.id}
              onClick={() => handleOpenTableDetails(table)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all hover:scale-[1.02] cursor-pointer ${
                isAvailable
                  ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60'
                  : isClosing
                  ? 'bg-blue-950/40 border-blue-500/50 hover:border-blue-400'
                  : 'bg-slate-900 border-rose-500/40 hover:border-rose-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-extrabold text-white">
                  Mesa {table.number.toString().padStart(2, '0')}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isAvailable ? 'bg-emerald-400' : isClosing ? 'bg-blue-400 animate-pulse' : 'bg-rose-400'
                }`} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-300 truncate">{table.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} lugares</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isAvailable ? 'text-emerald-400' : isClosing ? 'text-blue-400' : 'text-rose-400'
                }`}>
                  {isAvailable ? 'Livre' : isClosing ? 'Pediu Conta' : 'Ocupada'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrModalTable(table);
                      setIsQrModalOpen(true);
                    }}
                    title="Ver QR Code desta mesa"
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-amber-400 font-bold">Ver →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Table Comanda Drawer / Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono">
                  {selectedTable.number.toString().padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Mesa {selectedTable.number} — {selectedTable.name}</h3>
                  <p className="text-[11px] text-slate-400">Capacidade: {selectedTable.capacity} pessoas</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setQrModalTable(selectedTable);
                    setIsQrModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ver QR Code desta mesa"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <button
                onClick={() => updateTableStatus(selectedTable.id, 'available')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === 'available'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Livre
              </button>
              <button
                onClick={() => updateTableStatus(selectedTable.id, 'occupied')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === 'occupied'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Ocupada
              </button>
              <button
                onClick={() => updateTableStatus(selectedTable.id, 'closing')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === 'closing'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Pediu Conta
              </button>
            </div>

            {/* Orders on Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Comanda em Aberto</span>
                <span className="text-xs text-slate-400 font-mono">{tableOrders.length} pedido(s)</span>
              </div>

              {tableOrders.length === 0 ? (
                <div className="py-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">Nenhum consumo registrado no momento nesta mesa.</p>
                  <button
                    onClick={() => {
                      setSelectedTable(null);
                      setActivePage('pos');
                    }}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    + Lançar Bebidas na Comanda (Abrir PDV)
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {tableOrders.map(order => (
                    <div key={order.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>Pedido #{order.id.slice(-4).toUpperCase()} ({order.customerName})</span>
                        <span className="font-mono text-emerald-400">R$ {order.total.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subtotal & Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Subtotal Acumulado</span>
                <span className="font-mono font-extrabold text-2xl text-amber-400">
                  R$ {tableSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setActivePage('pos');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Lançar Itens</span>
                </button>

                {tableOrders.length > 0 && (
                  <button
                    onClick={() => setIsCloseBillModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Fechar Conta / Liberar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Bill Payment Modal */}
      {isCloseBillModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold">Fechamento — Mesa {selectedTable.number}</h3>
              <button
                onClick={() => setIsCloseBillModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-xs text-slate-400">Valor Total a Pagar</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                R$ {tableSubtotal.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Forma de Pagamento:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['pix', 'credit_card', 'debit_card', 'cash'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setClosePaymentMethod(method)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold capitalize ${
                      closePaymentMethod === method
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300'
                    }`}
                  >
                    {method === 'pix' ? 'PIX' : method === 'credit_card' ? 'Cartão Crédito' : method === 'debit_card' ? 'Cartão Débito' : 'Dinheiro'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinalizeBill}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Receber Pagamento e Liberar Mesa
            </button>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold">Cadastrar Nova Mesa</h3>
              <button
                onClick={() => setIsAddTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTable} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Número da Mesa *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNum}
                  onChange={e => setNewTableNum(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Identificação / Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Varanda 01, Salão Principal"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Capacidade de Pessoas</label>
                <input
                  type="number"
                  min="1"
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Salvar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table QR Codes Management & Print Modal */}
      <TableQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        initialTable={qrModalTable}
      />
    </div>
  );
};
