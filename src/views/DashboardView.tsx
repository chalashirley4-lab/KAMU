import React from 'react';
import { 
  Users, 
  UserCheck, 
  Target, 
  FileText, 
  UserX, 
  AlertTriangle, 
  TrendingUp, 
  Facebook, 
  Instagram, 
  Layers, 
  AlertCircle,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Lead } from '../types';
import { getDaysWithoutContact, formatCOP, CURRENT_DATE_STRING } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigateToLeads: (filterFase?: string) => void;
  onNavigateToAgenda: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  onSelectLead,
  onNavigateToLeads,
  onNavigateToAgenda
}) => {
  // 1. 6 KPIs Principales
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => l.fase !== 'Perdido' && l.fase !== 'Cerrado Ganado' && l.fase !== 'Pausado').length;
  const interesadosLeads = leads.filter(l => l.fase === 'Interesado').length;
  const enPropuestaLeads = leads.filter(l => l.fase === 'En Propuesta' || l.fase === 'Negociación').length;
  const perdidosLeads = leads.filter(l => l.fase === 'Perdido').length;
  const cerradosGanados = leads.filter(l => l.fase === 'Cerrado Ganado').length;
  
  const vencidosCount = leads.filter(
    l => !l.accion_completada && l.fecha_proxima_accion < CURRENT_DATE_STRING
  ).length;

  // 2. 4 Métricas de Campañas
  const fbCount = leads.filter(l => l.plataforma === 'Facebook').length;
  const igCount = leads.filter(l => l.plataforma === 'Instagram').length;
  const conFormularioCount = leads.filter(l => l.formulario && l.formulario !== 'Directo' && l.formulario !== 'Formulario Manual').length;
  const sinCoincidenciaCount = leads.filter(l => l.coincidencia === 'Nuevo Lead sin Coincidencia').length;

  // 3. Indicadores Clave
  const contactadosOActivos = leads.filter(l => l.fase !== 'Primer Contacto').length;
  const tasaContacto = Math.round((contactadosOActivos / (totalLeads || 1)) * 100);
  const interesadosYMas = leads.filter(l => ['Interesado', 'En Propuesta', 'Negociación', 'Cerrado Ganado'].includes(l.fase)).length;
  const tasaInteres = Math.round((interesadosYMas / (totalLeads || 1)) * 100);
  const tasaConversion = Math.round((cerradosGanados / (totalLeads || 1)) * 100);
  const tasaCoincidencia = Math.round(((totalLeads - sinCoincidenciaCount) / (totalLeads || 1)) * 100);

  // 4. Critical Alerts: Leads without contact > 15 days
  const criticalAlerts = leads
    .filter(l => getDaysWithoutContact(l.ultimo_contacto) > 15 && l.fase !== 'Perdido' && l.fase !== 'Cerrado Ganado')
    .sort((a, b) => getDaysWithoutContact(b.ultimo_contacto) - getDaysWithoutContact(a.ultimo_contacto));

  // Chart 1: Funnel Fases
  const phases = ['Primer Contacto', 'Contactado', 'Interesado', 'En Propuesta', 'Negociación', 'Cerrado Ganado'];
  const funnelData = {
    labels: phases,
    datasets: [
      {
        label: 'Cantidad de Leads',
        data: phases.map(p => leads.filter(l => l.fase === p).length),
        backgroundColor: [
          '#24445C',
          '#0284c7',
          '#0d9488',
          '#eab308',
          '#f97316',
          '#16a34a',
        ],
        borderRadius: 6,
      },
    ],
  };

  // Chart 2: Platform Doughnut
  const platformData = {
    labels: ['Facebook (fb)', 'Instagram (ig)', 'Formulario Web', 'Manual / Referido'],
    datasets: [
      {
        data: [
          leads.filter(l => l.plataforma === 'Facebook').length,
          leads.filter(l => l.plataforma === 'Instagram').length,
          leads.filter(l => l.plataforma === 'Formulario Web').length,
          leads.filter(l => l.plataforma === 'Manual').length,
        ],
        backgroundColor: ['#2563eb', '#ec4899', '#8b5cf6', '#64748b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Chart 3: Campaigns Bar
  const campaignsList = ['Retail B2B', 'Colegios Institucional', 'Directo / Orgánico'];
  const campaignData = {
    labels: campaignsList,
    datasets: [
      {
        label: 'Total Leads',
        data: campaignsList.map(c => leads.filter(l => l.campaign_name === c).length),
        backgroundColor: '#24445C',
        borderRadius: 6,
      },
      {
        label: 'Leads Calificados (Propuesta/Negociación)',
        data: campaignsList.map(c => leads.filter(l => l.campaign_name === c && (l.fase === 'En Propuesta' || l.fase === 'Negociación' || l.fase === 'Cerrado Ganado')).length),
        backgroundColor: '#FCE2CC',
        borderRadius: 6,
      }
    ],
  };

  // Chart 4: Tipo de Negocio
  const businessTypes = [
    'Colegio / Institución Educativa',
    'Papelería / Librería',
    'Distribuidor Mayorista',
    'Tienda Retail / Regalos',
    'Empresa Corporativa',
  ];
  const businessTypeData = {
    labels: businessTypes,
    datasets: [
      {
        data: businessTypes.map(t => leads.filter(l => l.tipo_negocio === t).length),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Scope */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#24445C]">Dashboard Comercial KAMU</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidado operativo en tiempo real • Campañas activas, semáforos de seguimiento y salud comercial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToAgenda}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0C2] hover:bg-[#ffe699] text-[#8a6508] text-xs font-bold rounded-lg border border-[#fef08a] transition"
          >
            <Clock className="w-4 h-4" />
            <span>Ver Agenda ({vencidosCount} pendientes)</span>
          </button>
          <button
            onClick={() => onNavigateToLeads()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#24445C] hover:bg-[#1b364a] text-white text-xs font-bold rounded-lg transition"
          >
            <Users className="w-4 h-4" />
            <span>Explorar Leads ({totalLeads})</span>
          </button>
        </div>
      </div>

      {/* 6 KPIs Principales */}
      <div>
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 px-1">
          6 KPIs Principales del Negocio
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Total Leads */}
          <div 
            onClick={() => onNavigateToLeads()}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#24445C] shadow-2xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Total Leads</span>
              <Users className="w-4 h-4 text-[#24445C]" />
            </div>
            <div className="text-2xl font-black text-[#24445C]">{totalLeads}</div>
            <div className="text-[10px] text-slate-400 mt-1">100% de la base</div>
          </div>

          {/* 2. Activos */}
          <div 
            onClick={() => onNavigateToLeads()}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 shadow-2xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Activos</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{activeLeads}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-1">
              {Math.round((activeLeads / totalLeads) * 100)}% en pipeline
            </div>
          </div>

          {/* 3. Interesados */}
          <div 
            onClick={() => onNavigateToLeads('Interesado')}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-500 shadow-2xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Interesados</span>
              <Target className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700">{interesadosLeads}</div>
            <div className="text-[10px] text-teal-600 font-medium mt-1">Interés confirmado</div>
          </div>

          {/* 4. En Propuesta */}
          <div 
            onClick={() => onNavigateToLeads('En Propuesta')}
            className="bg-white p-4 rounded-xl border border-[#FFF0C2] bg-amber-50/30 hover:border-amber-400 shadow-2xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
              <span>En Propuesta</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">{enPropuestaLeads}</div>
            <div className="text-[10px] text-amber-600 font-bold mt-1">Cotizaciones enviadas</div>
          </div>

          {/* 5. Perdidos */}
          <div 
            onClick={() => onNavigateToLeads('Perdido')}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-400 shadow-2xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Perdidos</span>
              <UserX className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600">{perdidosLeads}</div>
            <div className="text-[10px] text-red-500 mt-1">{Math.round((perdidosLeads / totalLeads) * 100)}% del total</div>
          </div>

          {/* 6. Seguimientos Vencidos */}
          <div 
            onClick={onNavigateToAgenda}
            className="bg-[#F6D7D7]/40 p-4 rounded-xl border border-red-200 hover:border-red-400 shadow-2xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-red-800 text-xs mb-1 font-bold">
              <span>Vencidos</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-[#9e1c1c]">{vencidosCount}</div>
            <div className="text-[10px] text-red-700 font-bold mt-1">Requieren gestión</div>
          </div>
        </div>
      </div>

      {/* 4 Métricas de Campañas */}
      <div>
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 px-1">
          4 Métricas de Origen y Campañas
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Leads Facebook</span>
              <div className="text-xl font-extrabold text-blue-700">{fbCount}</div>
              <span className="text-[10px] text-slate-400">{Math.round((fbCount / totalLeads) * 100)}% de tráfico</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              fb
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Leads Instagram</span>
              <div className="text-xl font-extrabold text-pink-600">{igCount}</div>
              <span className="text-[10px] text-slate-400">{Math.round((igCount / totalLeads) * 100)}% de tráfico</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
              ig
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Con Formulario</span>
              <div className="text-xl font-extrabold text-purple-700">{conFormularioCount}</div>
              <span className="text-[10px] text-purple-600 font-semibold">{tasaCoincidencia}% match</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Sin Coincidencia</span>
              <div className="text-xl font-extrabold text-slate-700">{sinCoincidenciaCount}</div>
              <span className="text-[10px] text-amber-600 font-medium">Nuevos prospectos</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Indicadores Clave de Eficiencia */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Tasa de Contacto:</span>
          <div className="text-lg font-bold text-[#24445C]">{tasaContacto}%</div>
          <p className="text-[10px] text-slate-400">Leads con gestión inicial</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Tasa de Interés:</span>
          <div className="text-lg font-bold text-teal-700">{tasaInteres}%</div>
          <p className="text-[10px] text-slate-400">Prospectos calificados</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Tasa de Conversión:</span>
          <div className="text-lg font-bold text-emerald-700">{tasaConversion}%</div>
          <p className="text-[10px] text-slate-400">Cierres exitosos</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Match con Formularios:</span>
          <div className="text-lg font-bold text-indigo-700">{tasaCoincidencia}%</div>
          <p className="text-[10px] text-slate-400">Datos enriquecidos</p>
        </div>
      </div>

      {/* 4 Gráficos Interactivos (Chart.js) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico 1: Embudo Comercial */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-[#24445C]">Embudo Comercial por Etapas</h3>
              <p className="text-[11px] text-slate-400">Volumen de prospectos en cada etapa del ciclo</p>
            </div>
            <span className="text-xs bg-[#DCE6EF] text-[#24445C] px-2.5 py-1 rounded-md font-bold">
              {leads.length} Leads
            </span>
          </div>
          <div className="h-64">
            <Bar data={funnelData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico 2: Plataforma de Origen */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-[#24445C]">Plataforma de Origen</h3>
              <p className="text-[11px] text-slate-400">Distribución de leads captados por canal digital</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold">
              Canales
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={platformData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico 3: Leads por Campaña */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-[#24445C]">Rendimiento por Campaña</h3>
              <p className="text-[11px] text-slate-400">Retail B2B vs Colegios Institucional</p>
            </div>
            <span className="text-xs bg-[#FFF0C2] text-[#8a6508] px-2.5 py-1 rounded-md font-bold">
              Campañas
            </span>
          </div>
          <div className="h-64">
            <Bar data={campaignData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico 4: Tipo de Negocio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-[#24445C]">Distribución por Tipo de Negocio</h3>
              <p className="text-[11px] text-slate-400">Segmentación declarada en formularios de captura</p>
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-bold">
              Segmentos
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Pie data={businessTypeData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Panel de Alertas Críticas: Leads sin contacto > 15 días */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-2xs overflow-hidden">
        <div className="bg-[#F6D7D7]/50 px-6 py-4 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-extrabold text-[#9e1c1c]">
                Alertas Críticas: Prospectos sin Contacto &gt; 15 Días ({criticalAlerts.length})
              </h3>
              <p className="text-xs text-red-700">
                Leads de alto valor o activos que requieren reactivación inmediata antes de enfriarse por completo.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {criticalAlerts.slice(0, 6).map((lead) => {
            const days = getDaysWithoutContact(lead.ultimo_contacto);
            return (
              <div 
                key={lead.id}
                className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🔴</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{lead.nombre}</span>
                      <span className="text-xs text-slate-500 font-medium">• {lead.empresa}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {lead.ciudad}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fase actual: <strong className="text-slate-700">{lead.fase}</strong> • Campaña: {lead.campaign_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black text-red-600 block">{days} días sin contacto</span>
                    <span className="text-[10px] text-slate-400">Último: {lead.ultimo_contacto}</span>
                  </div>
                  <button
                    onClick={() => onSelectLead(lead)}
                    className="flex items-center gap-1 bg-[#24445C] hover:bg-[#1b364a] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    <span>Reactivar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
