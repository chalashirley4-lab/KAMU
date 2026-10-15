import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ChevronRight,
  PhoneCall,
  User,
  MapPin,
  Check
} from 'lucide-react';
import { Lead } from '../types';
import { getTaskScheduleStatus, CURRENT_DATE_STRING } from '../utils/helpers';

interface AgendaViewProps {
  leads: Lead[];
  onToggleTaskComplete: (leadId: string) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenNewInteraction: (lead: Lead) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  leads,
  onToggleTaskComplete,
  onSelectLead,
  onOpenNewInteraction,
}) => {
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Vencidos' | 'Hoy' | 'Mañana' | 'Completados'>('Todos');

  // Compute 4 counters
  const tasksWithStatus = useMemo(() => {
    return leads.map(l => {
      const status = getTaskScheduleStatus(l.fecha_proxima_accion, l.accion_completada);
      return { lead: l, status };
    });
  }, [leads]);

  const countVencidos = tasksWithStatus.filter(t => t.status === 'Vencido').length;
  const countHoy = tasksWithStatus.filter(t => t.status === 'Hoy').length;
  const countMañana = tasksWithStatus.filter(t => t.status === 'Mañana').length;
  const countCompletados = tasksWithStatus.filter(t => t.status === 'Completado').length;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = tasksWithStatus;
    if (activeFilter === 'Vencidos') result = result.filter(t => t.status === 'Vencido');
    else if (activeFilter === 'Hoy') result = result.filter(t => t.status === 'Hoy');
    else if (activeFilter === 'Mañana') result = result.filter(t => t.status === 'Mañana');
    else if (activeFilter === 'Completados') result = result.filter(t => t.status === 'Completado');

    // Priority ordering: URGENTE (1) -> ALTA (2) -> MEDIA (3) -> BAJA (4)
    const priorityWeight: Record<string, number> = {
      URGENTE: 1,
      ALTA: 2,
      MEDIA: 3,
      BAJA: 4,
    };

    return result.sort((a, b) => {
      // Completed go last
      if (a.lead.accion_completada && !b.lead.accion_completada) return 1;
      if (!a.lead.accion_completada && b.lead.accion_completada) return -1;

      // Status urgency: Vencido first, then Hoy, then Mañana
      const statusWeight: Record<string, number> = {
        Vencido: 1,
        Hoy: 2,
        Mañana: 3,
        Pendiente: 4,
        Completado: 5
      };

      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return statusWeight[a.status] - statusWeight[b.status];
      }

      // Then by priority
      return (priorityWeight[a.lead.prioridad] || 5) - (priorityWeight[b.lead.prioridad] || 5);
    });
  }, [tasksWithStatus, activeFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#24445C] flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#24445C]" />
            <span>Agenda del Día & Compromisos Comerciales</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jornada de gestión comercial del 15 de Octubre de 2026 • Acciones priorizadas por urgencia y fecha
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#DCE6EF] text-[#24445C]">
          {countVencidos + countHoy} acciones críticas pendientes
        </div>
      </div>

      {/* 4 Contadores Interactivos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Vencidos */}
        <div
          onClick={() => setActiveFilter('Vencidos')}
          className={`p-4 rounded-xl border cursor-pointer transition shadow-2xs ${
            activeFilter === 'Vencidos'
              ? 'bg-[#F6D7D7] border-red-400 ring-2 ring-red-400'
              : 'bg-[#F6D7D7]/40 border-red-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#9e1c1c] mb-1">
            <span>Vencidos</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-[#9e1c1c]">{countVencidos}</div>
          <p className="text-[10px] text-red-700 mt-1">Requieren atención urgente</p>
        </div>

        {/* Hoy */}
        <div
          onClick={() => setActiveFilter('Hoy')}
          className={`p-4 rounded-xl border cursor-pointer transition shadow-2xs ${
            activeFilter === 'Hoy'
              ? 'bg-[#FFF0C2] border-yellow-400 ring-2 ring-yellow-400'
              : 'bg-[#FFF0C2]/40 border-yellow-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#8a6508] mb-1">
            <span>Para Hoy</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-[#8a6508]">{countHoy}</div>
          <p className="text-[10px] text-amber-800 mt-1">15 de Octubre de 2026</p>
        </div>

        {/* Mañana */}
        <div
          onClick={() => setActiveFilter('Mañana')}
          className={`p-4 rounded-xl border cursor-pointer transition shadow-2xs ${
            activeFilter === 'Mañana'
              ? 'bg-[#DCE6EF] border-[#24445C] ring-2 ring-[#24445C]'
              : 'bg-[#DCE6EF]/40 border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#24445C] mb-1">
            <span>Para Mañana</span>
            <Calendar className="w-4 h-4 text-[#24445C]" />
          </div>
          <div className="text-2xl font-black text-[#24445C]">{countMañana}</div>
          <p className="text-[10px] text-slate-600 mt-1">16 de Octubre de 2026</p>
        </div>

        {/* Completados */}
        <div
          onClick={() => setActiveFilter('Completados')}
          className={`p-4 rounded-xl border cursor-pointer transition shadow-2xs ${
            activeFilter === 'Completados'
              ? 'bg-[#DDEFE3] border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-[#DDEFE3]/40 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#1b5e32] mb-1">
            <span>Completados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#1b5e32]">{countCompletados}</div>
          <p className="text-[10px] text-emerald-700 mt-1">Gestiones exitosas</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['Todos', 'Vencidos', 'Hoy', 'Mañana', 'Completados'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === filter
                ? 'bg-[#24445C] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {filter} ({filter === 'Todos' ? tasksWithStatus.length : filter === 'Vencidos' ? countVencidos : filter === 'Hoy' ? countHoy : filter === 'Mañana' ? countMañana : countCompletados})
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No hay compromisos pendientes para el filtro seleccionado.
          </div>
        ) : (
          filteredTasks.map(({ lead, status }) => {
            return (
              <div
                key={lead.id}
                className={`p-4 rounded-2xl border transition shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  lead.accion_completada
                    ? 'bg-[#DDEFE3]/30 border-emerald-200 opacity-75'
                    : status === 'Vencido'
                    ? 'bg-[#F6D7D7]/30 border-red-200'
                    : status === 'Hoy'
                    ? 'bg-[#FFF0C2]/30 border-yellow-200'
                    : 'bg-white border-slate-200 hover:border-[#24445C]'
                }`}
              >
                {/* Left: Checkbox + Action info */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onToggleTaskComplete(lead.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                      lead.accion_completada
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-[#24445C] bg-white'
                    }`}
                    title={lead.accion_completada ? 'Marcar pendiente' : 'Marcar completado'}
                  >
                    {lead.accion_completada && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                        status === 'Vencido'
                          ? 'bg-[#F6D7D7] text-[#9e1c1c] border-red-300'
                          : status === 'Hoy'
                          ? 'bg-[#FFF0C2] text-[#8a6508] border-yellow-300'
                          : status === 'Completado'
                          ? 'bg-[#DDEFE3] text-[#1b5e32] border-emerald-300'
                          : 'bg-[#DCE6EF] text-[#24445C] border-slate-300'
                      }`}>
                        {status} • {lead.fecha_proxima_accion}
                      </span>

                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        lead.prioridad === 'URGENTE'
                          ? 'bg-red-100 text-red-700'
                          : lead.prioridad === 'ALTA'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lead.prioridad}
                      </span>

                      <span className="text-xs font-extrabold text-slate-900">
                        {lead.nombre} ({lead.empresa})
                      </span>
                    </div>

                    <p className={`text-sm font-semibold ${lead.accion_completada ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {lead.proxima_accion}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {lead.ciudad}
                      </span>
                      <span>•</span>
                      <span>Fase: <strong className="text-slate-700">{lead.fase}</strong></span>
                      <span>•</span>
                      <span>Campaña: {lead.campaign_name}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onOpenNewInteraction(lead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0C2] hover:bg-[#ffe699] text-[#8a6508] font-bold text-xs rounded-lg transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Gestionar</span>
                  </button>

                  <button
                    onClick={() => onSelectLead(lead)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#24445C] hover:bg-[#1b364a] text-white font-bold text-xs rounded-lg transition"
                  >
                    <span>Ficha Lead</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
