import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { Table } from '../types';
import {
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Layers,
  UtensilsCrossed,
  Store,
  Sparkles,
  Info
} from 'lucide-react';

interface TableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTable?: Table | null;
}

export const TableQrModal: React.FC<TableQrModalProps> = ({
  isOpen,
  onClose,
  initialTable = null
}) => {
  const { activeCompany, tables, getTableQrUrl, setActivePage, setCurrentRole, setCustomerTableNumber, addToast } = useApp();
  
  // Modes: 'single' (specific table), 'all' (printable batch of all tables), 'general' (general menu QR)
  const [viewMode, setViewMode] = useState<'single' | 'all' | 'general'>(
    initialTable ? 'single' : 'all'
  );
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(
    initialTable ? initialTable.number : (tables[0]?.number || 1)
  );
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentTable = tables.find(t => t.number === selectedTableNumber) || tables[0];
  const singleUrl = getTableQrUrl(activeCompany.id, selectedTableNumber);
  const generalUrl = getTableQrUrl(activeCompany.id);

  const handleCopyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedUrl(true);
    addToast('info', 'Link copiado!', 'O link exclusivo foi copiado.');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateCustomer = (tableNum?: number) => {
    if (tableNum) {
      setCustomerTableNumber(tableNum);
    } else {
      setCustomerTableNumber(null);
    }
    setCurrentRole('customer');
    setActivePage('menu');
    onClose();
    addToast('info', 'Visão do Cliente Ativada', tableNum ? `Simulando acesso à Mesa ${tableNum}` : 'Simulando cardápio digital do cliente');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-5 sm:p-7 text-white shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <span>Central de QR Codes para Mesas & Cardápio</span>
              </h2>
              <p className="text-xs text-slate-400">
                Geração automática e exclusiva para <strong>{activeCompany.tradeName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View mode tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todas as Mesas ({tables.length})</span>
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'single'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Mesa Individual</span>
            </button>
            <button
              onClick={() => setViewMode('general')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'general'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Cardápio Geral (Balcão/Redes)</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Plaquinhas</span>
          </button>
        </div>

        {/* Explain how it works notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3 shrink-0">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-400">Como funciona a separação entre estabelecimentos: </span>
            Cada administrador tem seu próprio código de empresa (<code className="font-mono bg-slate-950 px-1 py-0.5 rounded text-amber-300">id={activeCompany.id}</code>).
            Ao ler o QR code, o cliente abre automaticamente o cardápio da sua loja já fixado na mesa correspondente. Nenhum pedido ou cliente se mistura com outros comércios!
          </div>
        </div>

        {/* Content body based on tab */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: ALL TABLES (BATCH DISPLAY) */}
          {viewMode === 'all' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Displays de mesa prontos para recorte e totem acrílico:</span>
                <span className="font-mono text-amber-400 font-bold">{tables.length} mesas configuradas</span>
              </div>

              {/* Printable Grid of All Table Displays */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="printable-qr-section">
                {tables.map(table => {
                  const url = getTableQrUrl(activeCompany.id, table.number);
                  return (
                    <div
                      key={table.id}
                      className="bg-white text-slate-900 rounded-2xl p-5 border-2 border-slate-200 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden break-inside-avoid"
                    >
                      {/* Decorative top stripe */}
                      <div className="w-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1 px-2 rounded-lg">
                        {activeCompany.tradeName}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Mesa</span>
                        <div className="text-3xl font-black font-mono tracking-tight text-slate-950">
                          {table.number.toString().padStart(2, '0')}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">({table.name})</p>
                      </div>

                      {/* QR Code SVG */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <QRCodeSVG
                          value={url}
                          size={135}
                          level="M"
                          includeMargin={false}
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900 leading-snug">
                          Aponte a câmera do seu celular
                        </p>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          Faça seu pedido diretamente pelo cardápio digital
                        </p>
                      </div>

                      {/* Footer URL / table signature */}
                      <div className="pt-2 border-t border-slate-200 w-full text-[9px] font-mono text-slate-400 truncate">
                        bebêaqui · {activeCompany.tradeName} · mesa {table.number}
                      </div>

                      {/* Screen-only quick actions */}
                      <div className="flex gap-2 w-full pt-1 print:hidden">
                        <button
                          onClick={() => handleCopyLink(url)}
                          className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>
                        <button
                          onClick={() => handleSimulateCustomer(table.number)}
                          className="flex-1 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Testar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SINGLE TABLE */}
          {viewMode === 'single' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Select Table & Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Escolha a Mesa:</label>
                  <select
                    value={selectedTableNumber}
                    onChange={e => setSelectedTableNumber(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-amber-400"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.number}>
                        Mesa {t.number.toString().padStart(2, '0')} — {t.name} ({t.capacity} lugares)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Link exclusivo desta mesa:</span>
                    <button
                      onClick={() => handleCopyLink(singleUrl)}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 break-all select-all">
                    {singleUrl}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Este Display</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCustomer(selectedTableNumber)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>Testar como Cliente</span>
                  </button>
                </div>
              </div>

              {/* Single Display Card Preview */}
              <div className="flex justify-center" id="printable-qr-section">
                <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border-4 border-slate-200 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-xs w-full">
                  <div className="w-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-xl shadow-sm">
                    {activeCompany.tradeName}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Mesa</span>
                    <div className="text-5xl font-black font-mono tracking-tight text-slate-950">
                      {currentTable?.number.toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">({currentTable?.name})</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <QRCodeSVG
                      value={singleUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-950 leading-tight">
                      Aponte a câmera do seu celular
                    </p>
                    <p className="text-xs text-slate-600 leading-snug">
                      Cardápio digital exclusivo · Faça seu pedido sem esperar pelo garçom
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 w-full text-[10px] font-mono text-slate-400">
                    bebêaqui · {activeCompany.tradeName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL MENU (BALCÃO / REDES SOCIAIS) */}
          {viewMode === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">QR Code Geral da Distribuidora / Bar</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ideal para colocar no balcão de atendimento, panfletos, cartões de visita, balcão de retirada, ou divulgar em redes sociais para pedidos de delivery e retirada.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Link direto do seu cardápio:</span>
                    <button
                      onClick={() => handleCopyLink(generalUrl)}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 break-all select-all">
                    {generalUrl}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Cartaz</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCustomer()}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>Abrir Cardápio</span>
                  </button>
                </div>
              </div>

              {/* General Display Card Preview */}
              <div className="flex justify-center" id="printable-qr-section">
                <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border-4 border-slate-200 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-xs w-full">
                  <div className="w-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-xl shadow-sm">
                    {activeCompany.tradeName}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Cardápio Digital & Pedidos</span>
                    <div className="text-2xl font-black text-slate-950">
                      Peça Aqui! 🍻
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <QRCodeSVG
                      value={generalUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-950 leading-tight">
                      Aponte a câmera e peça agora
                    </p>
                    <p className="text-xs text-slate-600 leading-snug">
                      Bebidas geladas, combos e entregas rápidas
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 w-full text-[10px] font-mono text-slate-400">
                    bebêaqui · {activeCompany.tradeName}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
