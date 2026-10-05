import React from 'react';
import { useApp } from '../context/AppContext';
import { X, SlidersHorizontal, Sun, Eye, Type, Check } from 'lucide-react';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const {
    highContrast,
    setHighContrast,
    fontSizeLevel,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold">Recursos de Acessibilidade</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High contrast option */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Contraste Visual</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHighContrast(false)}
              className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-between transition-colors ${
                !highContrast ? 'border-amber-400 bg-amber-500/10 text-amber-300' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Normal</span>
              {!highContrast && <Check className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={() => setHighContrast(true)}
              className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-between transition-colors ${
                highContrast ? 'border-amber-400 bg-amber-500/10 text-amber-300' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Alto Contraste</span>
              {highContrast && <Check className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Font size adjustment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Tamanho do Texto (Visão)</span>
            </label>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {fontScale}%
            </span>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <button
              onClick={decreaseFontSize}
              disabled={fontSizeLevel <= -1}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 font-bold font-mono text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <span>A-</span>
              <span className="text-xs font-sans text-slate-300">Abaixar Letras</span>
            </button>

            <button
              onClick={resetFontSize}
              title="Redefinir para 100%"
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-xs font-mono font-bold text-slate-300 hover:text-amber-400 transition-colors"
            >
              100%
            </button>

            <button
              onClick={increaseFontSize}
              disabled={fontSizeLevel >= 3}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-black font-mono text-sm text-slate-950 flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <span>A+</span>
              <span className="text-xs font-sans font-bold">Aumentar Letras</span>
            </button>
          </div>
        </div>

        {/* Help info */}
        <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-start gap-3">
          <Eye className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            O <strong>BebêAqui</strong> possui suporte a leitores de tela nativos, navegação completa por teclado (Tab) e padrões de conformidade WCAG AA.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors"
        >
          Confirmar Ajustes
        </button>
      </div>
    </div>
  );
};
