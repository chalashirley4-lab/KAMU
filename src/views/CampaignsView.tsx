import React from 'react';
import { Target, Layers, FileCheck, DollarSign, TrendingUp, BarChart2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Lead } from '../types';
import { INITIAL_CAMPAIGNS } from '../data/initialData';
import { formatCOP } from '../utils/helpers';

interface CampaignsViewProps {
  leads: Lead[];
  onFilterCampaignLeads: (campaignName: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  leads,
  onFilterCampaignLeads,
}) => {
  const totalLeads = leads.length || 1;
  const matchCount = leads.filter(l => l.coincidencia !== 'Nuevo Lead sin Coincidencia').length;
  const matchPct = Math.round((matchCount / totalLeads) * 100);

  // Forms count
  const allForms = new Set(leads.map(l => l.formulario).filter(Boolean));

  // Compute live stats for the 2 active campaigns
  const campRetailLeads = leads.filter(l => l.campaign_name === 'Retail B2B');
  const campColegiosLeads = leads.filter(l => l.campaign_name === 'Colegios Institucional');

  const getCampMetrics = (campLeads: Lead[], defaultBudget: number) => {
    const total = campLeads.length;
    const contactados = campLeads.filter(l => l.fase !== 'Primer Contacto').length;
    const enPropuesta = campLeads.filter(l => l.fase === 'En Propuesta' || l.fase === 'Negociación').length;
    const ganados = campLeads.filter(l => l.fase === 'Cerrado Ganado').length;
    const cpl = total > 0 ? Math.round(defaultBudget / total) : 0;
    const convRate = total > 0 ? Math.round((ganados / total) * 100) : 0;

    return { total, contactados, enPropuesta, ganados, cpl, convRate };
  };

  const metricsRetail = getCampMetrics(campRetailLeads, 2300000);
  const metricsColegios = getCampMetrics(campColegiosLeads, 2100000);

  // Chart comparison
  const comparisonData = {
    labels: ['Leads Totales', 'Contactados', 'En Propuesta', 'Cerrados Ganados'],
    datasets: [
      {
        label: 'Retail B2B',
        data: [metricsRetail.total, metricsRetail.contactados, metricsRetail.enPropuesta, metricsRetail.ganados],
        backgroundColor: '#24445C',
        borderRadius: 6,
      },
      {
        label: 'Colegios Institucional',
        data: [metricsColegios.total, metricsColegios.contactados, metricsColegios.enPropuesta, metricsColegios.ganados],
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
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
          <Target className="w-5 h-5 text-[#24445C]" />
          <span>Campañas & Fuentes de Prospección</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditoría de retorno, mapeo de formularios publicitarios y cruce de datos por origen.
        </p>
      </div>

      {/* 3 Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Campañas Publicitarias</span>
            <div className="text-2xl font-black text-[#24445C]">2 Activas</div>
            <p className="text-[10px] text-slate-400 mt-1">Retail B2B & Colegios Institucional</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#DCE6EF] text-[#24445C] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Formularios Integrados</span>
            <div className="text-2xl font-black text-purple-700">{allForms.size} Tipos</div>
            <p className="text-[10px] text-purple-600 font-medium mt-1">neg 1-4 & COL 1-4</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tasa de Coincidencia</span>
            <div className="text-2xl font-black text-emerald-700">{matchPct}% Match</div>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">{matchCount} de {totalLeads} cruzados</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fichas Detalladas de las 2 Campañas Activas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaña 1: Retail B2B */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Activa en Meta Ads</span>
                </div>
                <h2 className="text-lg font-black text-[#24445C] mt-1">Retail B2B</h2>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  ID: c:120247927268690765
                </span>
              </div>
              <span className="text-2xl font-black text-[#24445C] bg-[#DCE6EF] px-3 py-1 rounded-xl">
                {metricsRetail.total} Leads
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Captación de papelerías, mayoristas y tiendas retail interesadas en márgenes comerciales del 35% al 50%.
            </p>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">CPL Estimado:</span>
                <span className="font-black text-slate-800 block text-sm">{formatCOP(metricsRetail.cpl)} COP</span>
              </div>
              <div>
                <span className="text-slate-400">Conversión Venta:</span>
                <span className="font-black text-emerald-700 block text-sm">{metricsRetail.convRate}%</span>
              </div>
              <div>
                <span className="text-slate-400">Contactados:</span>
                <span className="font-bold text-slate-700 block">{metricsRetail.contactados} leads</span>
              </div>
              <div>
                <span className="text-slate-400">En Propuesta:</span>
                <span className="font-bold text-amber-600 block">{metricsRetail.enPropuesta} leads</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">Formularios vinculados:</span>
              <div className="flex flex-wrap gap-1.5">
                {['neg 1', 'neg 2', 'neg 3', 'neg 4'].map(f => (
                  <span key={f} className="text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-lg">
                    Formulario {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => onFilterCampaignLeads('Retail B2B')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#24445C] hover:bg-[#1b364a] text-white text-xs font-bold rounded-lg transition"
            >
              <span>Ver Leads de Retail B2B ({metricsRetail.total})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Campaña 2: Colegios Institucional */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Activa en Meta Ads</span>
                </div>
                <h2 className="text-lg font-black text-[#24445C] mt-1">Colegios Institucional</h2>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  ID: c:120247933071910765
                </span>
              </div>
              <span className="text-2xl font-black text-amber-800 bg-[#FFF0C2] px-3 py-1 rounded-xl">
                {metricsColegios.total} Leads
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Dotaciones escolares anuales, kits para rectores, directores de compras y comités de padres de familia.
            </p>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">CPL Estimado:</span>
                <span className="font-black text-slate-800 block text-sm">{formatCOP(metricsColegios.cpl)} COP</span>
              </div>
              <div>
                <span className="text-slate-400">Conversión Venta:</span>
                <span className="font-black text-emerald-700 block text-sm">{metricsColegios.convRate}%</span>
              </div>
              <div>
                <span className="text-slate-400">Contactados:</span>
                <span className="font-bold text-slate-700 block">{metricsColegios.contactados} leads</span>
              </div>
              <div>
                <span className="text-slate-400">En Propuesta:</span>
                <span className="font-bold text-amber-600 block">{metricsColegios.enPropuesta} leads</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">Formularios vinculados:</span>
              <div className="flex flex-wrap gap-1.5">
                {['COL1', 'COL2', 'COL3', 'COL4'].map(f => (
                  <span key={f} className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                    Formulario {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => onFilterCampaignLeads('Colegios Institucional')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#24445C] hover:bg-[#1b364a] text-white text-xs font-bold rounded-lg transition"
            >
              <span>Ver Leads de Colegios ({metricsColegios.total})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico Comparativo de Rendimiento */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-[#24445C]">Comparativo Directo entre Campañas</h3>
            <p className="text-[11px] text-slate-400">Volumen vs Calificación vs Cierres</p>
          </div>
        </div>
        <div className="h-64">
          <Bar data={comparisonData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
