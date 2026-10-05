import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Printer,
  Calendar,
  ArrowUpRight,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  BarChart2
} from 'lucide-react';

export const WeeklyReportView: React.FC = () => {
  const { activeCompany, orders, products } = useApp();

  const currentWeekDays = [
    { day: 'Segunda-feira', current: 1580.00, prev: 1180.00, orders: 14 },
    { day: 'Terça-feira', current: 1340.00, prev: 1050.00, orders: 15 },
    { day: 'Quarta-feira', current: 1950.00, prev: 1420.00, orders: 18 },
    { day: 'Quinta-feira', current: 2450.00, prev: 1980.00, orders: 22 },
    { day: 'Sexta-feira', current: 3850.00, prev: 3150.00, orders: 32 },
    { day: 'Sábado', current: 4890.00, prev: 4120.00, orders: 38 },
    { day: 'Domingo', current: 3120.00, prev: 2680.00, orders: 26 }
  ];

  const totalCurrentWeek = currentWeekDays.reduce((acc, d) => acc + d.current, 0);
  const totalPrevWeek = currentWeekDays.reduce((acc, d) => acc + d.prev, 0);
  const diffPercent = ((totalCurrentWeek - totalPrevWeek) / totalPrevWeek) * 100;
  const totalOrders = currentWeekDays.reduce((acc, d) => acc + d.orders, 0);
  const weeklyTicketMedio = totalCurrentWeek / totalOrders;

  // Lucratividade por produto
  const profitabilityProducts = products.map(p => {
    const profitMargin = ((p.price - p.costPrice) / p.price) * 100;
    const profitUnit = p.price - p.costPrice;
    return {
      ...p,
      profitMargin,
      profitUnit
    };
  }).sort((a, b) => b.profitMargin - a.profitMargin);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              📈 Relatório Semanal de Vendas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Análise consolidada da semana e comparativo de desempenho na <strong>{activeCompany.tradeName}</strong>.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total na Semana</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            R$ {totalCurrentWeek.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-bold">+{diffPercent.toFixed(1)}%</span>
            <span className="text-slate-400">vs semana anterior</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Semana Anterior</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-300">
            R$ {totalPrevWeek.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Base comparativa</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Pedidos</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {totalOrders} <span className="text-sm font-sans font-normal text-slate-400">pedidos</span>
          </div>
          <p className="text-[11px] text-slate-400">Média de {(totalOrders / 7).toFixed(1)} pedidos/dia</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ticket Médio</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
            R$ {weeklyTicketMedio.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Por comanda / entrega</p>
        </div>
      </div>

      {/* Tabela de Vendas por Dia da Semana (Seg a Dom) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Evolução Diária e Comparativo Semanal
          </h3>
          <p className="text-xs text-slate-400">
            Acompanhe o faturamento dia a dia em relação à semana anterior
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Dia da Semana</th>
                <th className="py-3 px-4 text-center">Pedidos</th>
                <th className="py-3 px-4 text-right">Semana Atual</th>
                <th className="py-3 px-4 text-right">Semana Anterior</th>
                <th className="py-3 px-4 text-right">Variação (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentWeekDays.map((item, idx) => {
                const dayDiff = ((item.current - item.prev) / item.prev) * 100;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.day}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {item.orders}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      R$ {item.current.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      R$ {item.prev.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={dayDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {dayDiff >= 0 ? `+${dayDiff.toFixed(1)}%` : `${dayDiff.toFixed(1)}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise de Rentabilidade e Margem de Lucro dos Produtos */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Produtos de Maior Rentabilidade e Margem Bruta
          </h3>
          <p className="text-xs text-slate-400">
            Diferença entre o preço de venda e o custo de aquisição do estoque
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4 text-right">Preço Custo</th>
                <th className="py-3 px-4 text-right">Preço Venda</th>
                <th className="py-3 px-4 text-right">Lucro Unitário</th>
                <th className="py-3 px-4 text-right">Margem (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {profitabilityProducts.slice(0, 6).map(prod => (
                <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {prod.name}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    R$ {prod.costPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    R$ {prod.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    R$ {prod.profitUnit.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                    {prod.profitMargin.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
