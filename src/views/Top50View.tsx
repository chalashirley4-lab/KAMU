import React, { useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  ArrowUpRight, 
  Phone, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Building,
  Target
} from 'lucide-react';
import { Lead } from '../types';
import { calculateTop50Score, getDaysWithoutContact, formatCOP } from '../utils/helpers';

interface Top50ViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenNewInteraction: (lead: Lead) => void;
}

export const Top50View: React.FC<Top50ViewProps> = ({
  leads,
  onSelectLead,
  onOpenNewInteraction,
}) => {
  // Rank leads by calculated composite score
  const top50Leads = useMemo(() => {
    return leads
      .map(lead => ({
        lead,
        score: calculateTop50Score(lead),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }, [leads]);

  const signalExplanations: Record<string, string> = {
    '🛒': 'Pedido en curso / Carrito activo',
    '📦': 'Catálogo o muestras solicitadas',
    '🤝': 'Reunión o llamada agendada',
    '💰': 'Propuesta económica enviada',
    '👀': 'Alto interés demostrado',
    '🔴': 'Requiere atención urgente',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#24445C] to-[#1b364a] text-white p-6 rounded-2xl shadow-md border border-[#24445C] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#FFF0C2]/20 border border-[#FFF0C2]/30 text-[#FFF0C2]">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold tracking-wide">Top 50 Leads Calientes</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FCE2CC] text-[#9e4400] font-black uppercase tracking-wider">
              Prioridad Máxima
            </span>
          </div>
          <p className="text-xs text-[#DCE6EF]/90 max-w-xl">
            Algoritmo inteligente de scoring comercial basado en compromiso de compra (🛒), propuestas pendientes (💰), reuniones agendadas (🤝) y días sin contacto.
          </p>
        </div>

        {/* Legend of Signals */}
        <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-[11px] grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(signalExplanations).map(([emoji, label]) => (
            <div key={emoji} className="flex items-center gap-1.5" title={label}>
              <span className="text-base">{emoji}</span>
              <span className="truncate max-w-[100px] text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 50 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {top50Leads.map(({ lead, score }, index) => {
          const days = getDaysWithoutContact(lead.ultimo_contacto);
          const cleanPhone = lead.telefono.replace(/[^0-9]/g, '');

          // Medals for top 3
          const isGold = index === 0;
          const isSilver = index === 1;
          const isBronze = index === 2;

          return (
            <div
              key={lead.id}
              className={`p-5 rounded-2xl border transition shadow-2xs hover:shadow-md bg-white flex flex-col justify-between space-y-4 ${
                isGold 
                  ? 'border-amber-400 ring-2 ring-amber-300/40 bg-amber-50/10' 
                  : isSilver
                  ? 'border-slate-300 ring-2 ring-slate-200 bg-slate-50/10'
                  : isBronze
                  ? 'border-orange-300 ring-1 ring-orange-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Header: Rank + Name + Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isGold
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : isSilver
                      ? 'bg-slate-300 text-slate-900 shadow-sm'
                      : isBronze
                      ? 'bg-orange-300 text-orange-950 shadow-sm'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{lead.nombre}</h3>
                      <span className="font-mono text-[10px] text-slate-400">({lead.id})</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.empresa}</span>
                      <span>•</span>
                      <span className="text-slate-400">{lead.ciudad}</span>
                    </div>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                  <div className="flex items-center gap-1 bg-[#FCE2CC] text-[#9e4400] font-black px-2.5 py-0.5 rounded-full text-xs">
                    <Flame className="w-3.5 h-3.5 fill-[#9e4400]" />
                    <span>{score} pts</span>
                  </div>
                </div>
              </div>

              {/* Signals & Phase */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 mr-1">Señales:</span>
                  {lead.señales?.map((emoji, i) => (
                    <span 
                      key={i} 
                      className="text-lg bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs"
                      title={signalExplanations[emoji] || 'Señal comercial'}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#24445C] text-white">
                    {lead.fase}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {lead.probabilidad}%
                  </span>
                </div>
              </div>

              {/* Next Action & Days */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Sin contacto: <strong className={days > 7 ? 'text-red-600' : 'text-slate-700'}>{days} días</strong></span>
                  </span>
                  <span>Compromiso: <strong className="text-slate-700">{lead.fecha_proxima_accion}</strong></span>
                </div>
                <p className="font-semibold text-slate-800 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  {lead.proxima_accion}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg transition"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${lead.telefono}`}
                    className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                    title="Llamar"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenNewInteraction(lead)}
                    className="px-3 py-1.5 bg-[#FFF0C2] hover:bg-[#ffe699] text-[#8a6508] font-bold text-xs rounded-lg transition"
                  >
                    Registrar Gestión
                  </button>
                  <button
                    onClick={() => onSelectLead(lead)}
                    className="px-3 py-1.5 bg-[#24445C] hover:bg-[#1b364a] text-white font-bold text-xs rounded-lg transition"
                  >
                    Ver Ficha
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
