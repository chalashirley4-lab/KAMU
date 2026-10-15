import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Edit3, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Target,
  FileText,
  Plus
} from 'lucide-react';
import { Lead, LeadPhase, Priority } from '../types';
import { getDaysWithoutContact, formatCOP } from '../utils/helpers';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onOpenNewInteraction: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  onOpenPerfil360?: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onOpenNewInteraction,
  onDeleteLead,
  onOpenPerfil360,
}) => {
  if (!isOpen || !lead) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [fase, setFase] = useState<LeadPhase>(lead.fase || 'Primer Contacto');
  const [prioridad, setPrioridad] = useState<Priority>(lead.prioridad || 'ALTA');
  const [proximaAccion, setProximaAccion] = useState(lead.proxima_accion || '');
  const [fechaProximaAccion, setFechaProximaAccion] = useState(lead.fecha_proxima_accion || '');
  const [notas, setNotas] = useState(lead.notas || '');
  const [probabilidad, setProbabilidad] = useState(lead.probabilidad ?? 30);

  React.useEffect(() => {
    if (lead) {
      setFase(lead.fase || 'Primer Contacto');
      setPrioridad(lead.prioridad || 'ALTA');
      setProximaAccion(lead.proxima_accion || '');
      setFechaProximaAccion(lead.fecha_proxima_accion || '');
      setNotas(lead.notas || '');
      setProbabilidad(lead.probabilidad ?? 30);
    }
  }, [lead]);

  const daysWithoutContact = getDaysWithoutContact(lead.ultimo_contacto);

  const handleSave = () => {
    onUpdateLead({
      ...lead,
      fase,
      prioridad,
      proxima_accion: proximaAccion,
      fecha_proxima_accion: fechaProximaAccion,
      notas,
      probabilidad
    });
    setIsEditing(false);
  };

  const cleanPhoneForWa = lead.telefono.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#24445C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-1 rounded bg-[#DCE6EF]/20 text-[#FFF0C2] font-bold border border-white/20">
              {lead.id}
            </span>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>{lead.nombre}</span>
                {lead.empresa && (
                  <span className="text-sm font-normal text-[#DCE6EF]/90">
                    • {lead.empresa}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#DCE6EF]/80">
                <MapPin className="w-3.5 h-3.5" />
                <span>{lead.ciudad}</span>
                <span>•</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#FFF0C2]">
                  {lead.segmento}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPerfil360 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPerfil360(lead);
                }}
                className="flex items-center gap-1.5 bg-[#DCE6EF]/20 hover:bg-[#DCE6EF]/30 text-[#FFF0C2] font-bold text-xs px-3 py-1.5 rounded-lg border border-white/20 transition"
              >
                <span>Perfil 360° Excel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onOpenNewInteraction(lead)}
              className="flex items-center gap-1.5 bg-[#FFF0C2] hover:bg-[#ffe699] text-[#24445C] font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Registrar Contacto</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>¿Confirmas eliminar a <strong>{lead.nombre} ({lead.id})</strong> definitivamente?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onDeleteLead) {
                    onDeleteLead(lead.id);
                    onClose();
                  }
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Semaphores & Contact Badges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              lead.prioridad === 'URGENTE' 
                ? 'bg-[#F6D7D7] border-red-300 text-[#9e1c1c]'
                : lead.prioridad === 'ALTA'
                ? 'bg-[#FCE2CC] border-orange-300 text-[#9e4400]'
                : lead.prioridad === 'MEDIA'
                ? 'bg-[#FFF0C2] border-yellow-300 text-[#8a6508]'
                : 'bg-[#E8EBEF] border-slate-300 text-slate-700'
            }`}>
              <span className="text-lg">
                {lead.prioridad === 'URGENTE' ? '🔴' : lead.prioridad === 'ALTA' ? '🟠' : lead.prioridad === 'MEDIA' ? '🟡' : '⚪'}
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Prioridad</span>
                <span className="text-xs font-extrabold">{lead.prioridad}</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              daysWithoutContact > 15 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : daysWithoutContact > 7 
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <Clock className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Sin Contacto</span>
                <span className="text-xs font-extrabold">{daysWithoutContact} días</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
              <Target className="w-5 h-5 text-[#24445C] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Fase Comercial</span>
                <span className="text-xs font-bold text-[#24445C]">{lead.fase}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
              <span className="text-lg">💰</span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Prob. Cierre</span>
                <span className="text-xs font-bold text-slate-800">{lead.probabilidad}% ({formatCOP(lead.valor_estimado)})</span>
              </div>
            </div>
          </div>

          {/* Direct Communication Channels */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>Canales de Contacto Directo:</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(`Hola ${lead.nombre}, te saludo de KAMU respecto a tu solicitud de catálogo comercial.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${lead.telefono}`}
                className="flex items-center gap-1.5 bg-[#24445C] hover:bg-[#1b364a] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Llamar</span>
              </a>

              <a
                href={`mailto:${lead.email}?subject=Información Comercial KAMU`}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar Email</span>
              </a>
            </div>
          </div>

          {/* Commercial Commitment & Next Action */}
          <div className="p-4 rounded-xl bg-[#FFF0C2]/40 border border-[#FFF0C2] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8a6508]">
                <Calendar className="w-4 h-4" />
                <span>Próxima Acción Comercial Agendada</span>
              </div>
              <span className="text-xs font-extrabold text-[#24445C] bg-white px-2.5 py-0.5 rounded border border-[#FFF0C2]">
                Fecha: {lead.fecha_proxima_accion}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{lead.proxima_accion}</p>
          </div>

          {/* Form & Campaign Cross-Matched Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Datos de Formulario</h3>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Formulario:</span>
                  <span className="font-semibold text-slate-800">{lead.formulario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipo de Negocio:</span>
                  <span className="font-semibold text-slate-800">{lead.tipo_negocio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Puntos de Venta:</span>
                  <span className="font-semibold text-slate-800">{lead.puntos_venta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Necesidad declarada:</span>
                  <span className="font-semibold text-slate-800">{lead.necesidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coincidencia Base:</span>
                  <span className="font-semibold text-purple-700">{lead.coincidencia}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Campaña & Publicidad</h3>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Campaña:</span>
                  <span className="font-semibold text-slate-800">{lead.campaign_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Campaign ID:</span>
                  <span className="font-mono text-slate-700 text-[11px]">{lead.campaign_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plataforma:</span>
                  <span className="font-semibold text-blue-700">{lead.plataforma}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Conjunto / Adset:</span>
                  <span className="font-semibold text-slate-800">{lead.adset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Anuncio:</span>
                  <span className="font-semibold text-slate-800">{lead.anuncio}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Edit Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#24445C]" />
                <span>Actualización Rápida de Lead</span>
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-[#24445C] hover:underline font-bold"
                >
                  Modificar valores
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fase Comercial</label>
                  <select
                    value={fase}
                    onChange={(e) => setFase(e.target.value as LeadPhase)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Primer Contacto">Primer Contacto</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Interesado">Interesado</option>
                    <option value="En Propuesta">En Propuesta</option>
                    <option value="Negociación">Negociación</option>
                    <option value="Cerrado Ganado">Cerrado Ganado</option>
                    <option value="Perdido">Perdido</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prioridad</label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value as Priority)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="URGENTE">🔴 URGENTE</option>
                    <option value="ALTA">🟠 ALTA</option>
                    <option value="MEDIA">🟡 MEDIA</option>
                    <option value="BAJA">⚪ BAJA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Próxima Acción</label>
                  <input
                    type="date"
                    value={fechaProximaAccion || ''}
                    onChange={(e) => setFechaProximaAccion(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Probabilidad de Cierre (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={probabilidad ?? 0}
                    onChange={(e) => setProbabilidad(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Próxima Acción Comercial</label>
                  <input
                    type="text"
                    value={proximaAccion || ''}
                    onChange={(e) => setProximaAccion(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notas Comerciales</label>
                  <textarea
                    rows={3}
                    value={notas || ''}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 text-xs bg-[#24445C] text-white font-bold rounded-lg hover:bg-[#1b364a]"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-200">
                "{lead.notas}"
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Último contacto: <strong className="text-slate-700">{lead.ultimo_contacto}</strong></span>
            {onDeleteLead && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 font-bold hover:underline"
              >
                Eliminar Lead
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
