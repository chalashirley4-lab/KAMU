import React from 'react';
import { Filter, TrendingDown, ArrowDown, DollarSign, AlertCircle } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Lead } from '../types';

interface FunnelViewProps {
  leads: Lead[];
}

export const FunnelView: React.FC<FunnelViewProps> = ({ leads }) => {
  const total = leads.length || 1;

  // Stages in commercial order
  const stages = [
    { name: 'Primer Contacto', color: '#24445C', barColor: 'bg-[#24445C]' },
    { name: 'Contactado', color: '#0284c7', barColor: 'bg-sky-600' },
    { name: 'Interesado', color: '#0d9488', barColor: 'bg-teal-600' },
    { name: 'En Propuesta', color: '#eab308', barColor: 'bg-amber-500' },
    { name: 'Negociación', color: '#f97316', barColor: 'bg-orange-500' },
    { name: 'Cerrado Ganado', color: '#16a34a', barColor: 'bg-emerald-600' },
  ];

  const stageCounts = stages.map(s => {
    const count = leads.filter(l => l.fase === s.name).length;
    const pct = Math.round((count / total) * 100);
    return { ...s, count, pct };
  });

  // Calculate step-by-step conversion
  const stageStats = stageCounts.map((s, idx) => {
    let convFromPrev = 100;
    if (idx > 0) {
      const prevCount = stageCounts[idx - 1].count;
      convFromPrev = prevCount > 0 ? Math.round((s.count / prevCount) * 100) : 0;
    }
    return {
      ...s,
      convFromPrev,
    };
  });

  // Loss reasons breakdown
  const lostLeads = leads.filter(l => l.fase === 'Perdido');
  const lossReasonsCount: Record<string, number> = {};
  lostLeads.forEach(l => {
    const reason = l.motivo_perdida || 'Sin motivo especificado';
    lossReasonsCount[reason] = (lossReasonsCount[reason] || 0) + 1;
  });

  const lossChartData = {
    labels: Object.keys(lossReasonsCount),
    datasets: [
      {
        data: Object.values(lossReasonsCount),
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#64748b', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const lossOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, font: { size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-extrabold text-[#24445C] flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#24445C]" />
          <span>Embudo Comercial & Conversión por Etapas</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tasa de paso entre fases, retención del pipeline y motivos de descarte comercial.
        </p>
      </div>

      {/* Visual Funnel Bars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
          Visualización de Barras Proporcionales
        </h2>

        <div className="space-y-3">
          {stageStats.map((st, index) => {
            const widthPct = Math.max(12, Math.round((st.count / (stageStats[0].count || 1)) * 100));

            return (
              <div key={st.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                      {index + 1}
                    </span>
                    <span>{st.name}</span>
                  </span>
                  <span>
                    {st.count} leads ({st.pct}% del total)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-9 rounded-xl overflow-hidden flex items-center p-1">
                  <div
                    className={`h-full rounded-lg ${st.barColor} text-white flex items-center justify-between px-3 text-xs font-bold transition-all duration-500`}
                    style={{ width: `${widthPct}%` }}
                  >
                    <span>{st.count}</span>
                    <span className="text-[10px] opacity-80">{widthPct}%</span>
                  </div>
                </div>

                {index < stageStats.length - 1 && (
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 py-0.5">
                    <ArrowDown className="w-3 h-3 text-slate-400" />
                    <span>Paso a siguiente etapa: {stageStats[index + 1].convFromPrev}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Conversion Table & Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table: 2 Columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 bg-[#24445C] text-white flex items-center justify-between">
            <h3 className="text-sm font-bold">Métricas Detalladas de Conversión</h3>
            <span className="text-xs bg-white/20 text-[#FFF0C2] px-2.5 py-0.5 rounded-full font-bold">
              Pipeline Activo
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-bold">Etapa Comercial</th>
                <th className="py-3 px-3 font-bold">Leads</th>
                <th className="py-3 px-3 font-bold">% del Total</th>
                <th className="py-3 px-4 font-bold">Conversión vs Etapa Anterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stageStats.map((st) => (
                <tr key={st.name} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                    <span>{st.name}</span>
                  </td>
                  <td className="py-3 px-3 font-black text-slate-800">{st.count}</td>
                  <td className="py-3 px-3 font-bold text-slate-600">{st.pct}%</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded font-extrabold text-[11px] ${
                      st.convFromPrev >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {st.convFromPrev}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loss Reasons Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-[#24445C]">Motivos de Pérdida</h3>
              <p className="text-[11px] text-slate-400">Total perdidos: {lostLeads.length} leads</p>
            </div>
            <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>

          <div className="h-48 flex items-center justify-center">
            <Pie data={lossChartData} options={lossOptions} />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {Object.entries(lossReasonsCount).map(([reason, count]) => (
              <div key={reason} className="flex justify-between items-center text-slate-600">
                <span className="truncate max-w-[170px]">{reason}</span>
                <span className="font-bold text-slate-800">
                  {count} ({Math.round((count / (lostLeads.length || 1)) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
