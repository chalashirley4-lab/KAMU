import React, { useState, useMemo } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  Building2, 
  Video, 
  Calendar, 
  Plus, 
  Filter, 
  Search,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import { Interaction, ContactChannel, ContactResult } from '../types';

interface InteractionsViewProps {
  interactions: Interaction[];
  onOpenNewInteraction: () => void;
  onSelectLeadById: (leadId: string) => void;
}

export const InteractionsView: React.FC<InteractionsViewProps> = ({
  interactions,
  onOpenNewInteraction,
  onSelectLeadById,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [canalFilter, setCanalFilter] = useState<string>('Todos');
  const [resultadoFilter, setResultadoFilter] = useState<string>('Todos');

  const filteredInteractions = useMemo(() => {
    return interactions.filter(int => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          int.leadNombre.toLowerCase().includes(q) ||
          int.leadEmpresa.toLowerCase().includes(q) ||
          int.resumen.toLowerCase().includes(q) ||
          int.proximaAccion.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (canalFilter !== 'Todos' && int.canal !== canalFilter) return false;
      if (resultadoFilter !== 'Todos' && int.resultado !== resultadoFilter) return false;

      return true;
    }).sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
  }, [interactions, searchQuery, canalFilter, resultadoFilter]);

  const getChannelIcon = (canal: ContactChannel) => {
    switch (canal) {
      case 'WhatsApp': return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'Llamada': return <PhoneCall className="w-4 h-4 text-blue-600" />;
      case 'Correo': return <Mail className="w-4 h-4 text-purple-600" />;
      case 'Reunión Presencial': return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'Videollamada': return <Video className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getResultBadge = (resultado: ContactResult) => {
    switch (resultado) {
      case 'Venta cerrada':
        return <span className="bg-[#DDEFE3] text-[#1b5e32] border border-emerald-300 px-2 py-0.5 rounded font-black text-[10px]">🎉 Venta Cerrada</span>;
      case 'Pidió cotización':
        return <span className="bg-[#FFF0C2] text-[#8a6508] border border-yellow-300 px-2 py-0.5 rounded font-bold text-[10px]">💰 Pidió Cotización</span>;
      case 'Reunión agendada':
        return <span className="bg-[#DCE6EF] text-[#24445C] border border-slate-300 px-2 py-0.5 rounded font-bold text-[10px]">🤝 Reunión Agendada</span>;
      case 'Contactado con éxito':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold text-[10px]">Contactado</span>;
      case 'Dejó en visto':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium text-[10px]">En Visto</span>;
      case 'No contesta':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium text-[10px]">No Contesta</span>;
      case 'Rechazado':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold text-[10px]">Rechazado</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#24445C] flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#24445C]" />
            <span>Historial de Contactos & Bitácora Comercial</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trazabilidad cronológica de llamadas, mensajes de WhatsApp, cotizaciones y acuerdos comerciales.
          </p>
        </div>

        <button
          onClick={onOpenNewInteraction}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#24445C] hover:bg-[#1b364a] text-white font-bold text-xs rounded-lg shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nueva Interacción</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por lead, empresa o acuerdo en el historial..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#24445C]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={canalFilter || 'Todos'}
            onChange={(e) => setCanalFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Todos">Todos los Canales</option>
            <option value="WhatsApp">💬 WhatsApp</option>
            <option value="Llamada">📞 Llamada</option>
            <option value="Correo">✉️ Correo</option>
            <option value="Reunión Presencial">🏢 Reunión Presencial</option>
            <option value="Videollamada">💻 Videollamada</option>
          </select>

          <select
            value={resultadoFilter || 'Todos'}
            onChange={(e) => setResultadoFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Todos">Todos los Resultados</option>
            <option value="Contactado con éxito">Contactado con éxito</option>
            <option value="Pidió cotización">Pidió cotización</option>
            <option value="Reunión agendada">Reunión agendada</option>
            <option value="Venta cerrada">Venta cerrada</option>
            <option value="No contesta">No contesta</option>
            <option value="Dejó en visto">Dejó en visto</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="space-y-3">
        {filteredInteractions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No se encontraron interacciones registradas con los filtros seleccionados.
          </div>
        ) : (
          filteredInteractions.map((int) => (
            <div
              key={int.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#24445C] transition flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                  {getChannelIcon(int.canal)}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onSelectLeadById(int.leadId)}
                      className="font-extrabold text-sm text-[#24445C] hover:underline"
                    >
                      {int.leadNombre}
                    </button>
                    <span className="text-xs text-slate-500 font-semibold">• {int.leadEmpresa}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {int.leadId}
                    </span>
                    {getResultBadge(int.resultado)}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{int.resumen}"
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8a6508] bg-[#FFF0C2]/30 p-2 rounded-lg border border-[#FFF0C2]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Próximo paso definido: <strong>{int.proximaAccion}</strong> (para el {int.fechaProximaAccion})</span>
                  </div>
                </div>
              </div>

              {/* Timestamp & User */}
              <div className="text-right text-xs text-slate-400 shrink-0 flex md:flex-col justify-between items-end">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{int.fecha} {int.hora}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <User className="w-3 h-3" />
                  <span>{int.usuario}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
