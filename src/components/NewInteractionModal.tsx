import React, { useState } from 'react';
import { X, PhoneCall, Calendar, Clock, MessageSquare } from 'lucide-react';
import { Lead, ContactChannel, ContactResult, Interaction, LeadPhase } from '../types';
import { CURRENT_DATE_STRING } from '../utils/helpers';

interface NewInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  preselectedLead?: Lead | null;
  onSaveInteraction: (interaction: Interaction, updatedLead?: Partial<Lead>) => void;
}

export const NewInteractionModal: React.FC<NewInteractionModalProps> = ({
  isOpen,
  onClose,
  leads,
  preselectedLead,
  onSaveInteraction,
}) => {
  if (!isOpen) return null;

  const [selectedLeadId, setSelectedLeadId] = useState(preselectedLead?.id || (leads[0]?.id || ''));
  const currentLead = leads.find(l => l.id === selectedLeadId) || preselectedLead || leads[0];

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [fecha, setFecha] = useState(CURRENT_DATE_STRING);
  const [hora, setHora] = useState(timeStr);
  const [canal, setCanal] = useState<ContactChannel>('WhatsApp');
  const [resultado, setResultado] = useState<ContactResult>('Contactado con éxito');
  const [resumen, setResumen] = useState('');
  const [proximaAccion, setProximaAccion] = useState('Hacer seguimiento a cotización y resolver dudas');
  const [fechaProximaAccion, setFechaProximaAccion] = useState(CURRENT_DATE_STRING);
  const [cambiarFase, setCambiarFase] = useState(false);
  const [nuevaFase, setNuevaFase] = useState<LeadPhase>(currentLead?.fase || 'Interesado');

  React.useEffect(() => {
    if (preselectedLead?.id) {
      setSelectedLeadId(preselectedLead.id);
      setNuevaFase(preselectedLead.fase || 'Interesado');
    } else if (leads[0]?.id && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
      setNuevaFase(leads[0].fase || 'Interesado');
    }
  }, [preselectedLead, leads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumen.trim()) return;

    const newInteraction: Interaction = {
      id: `int-${Date.now().toString().slice(-6)}`,
      leadId: currentLead.id,
      leadNombre: currentLead.nombre,
      leadEmpresa: currentLead.empresa,
      fecha,
      hora,
      canal,
      resultado,
      resumen: resumen.trim(),
      proximaAccion: proximaAccion.trim(),
      fechaProximaAccion,
      usuario: 'Asesor Comercial KAMU'
    };

    const updatedLeadData: Partial<Lead> = {
      ultimo_contacto: fecha,
      proxima_accion: proximaAccion.trim(),
      fecha_proxima_accion: fechaProximaAccion,
      accion_completada: false
    };

    if (cambiarFase) {
      updatedLeadData.fase = nuevaFase;
    }

    if (resultado === 'Venta cerrada') {
      updatedLeadData.fase = 'Cerrado Ganado';
      updatedLeadData.prioridad = 'ALTA';
      updatedLeadData.probabilidad = 100;
    } else if (resultado === 'Pidió cotización') {
      updatedLeadData.fase = 'En Propuesta';
      updatedLeadData.prioridad = 'URGENTE';
      updatedLeadData.probabilidad = 65;
    }

    onSaveInteraction(newInteraction, updatedLeadData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#24445C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <PhoneCall className="w-5 h-5 text-[#FFF0C2]" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registrar Nueva Interacción</h2>
              <p className="text-xs text-[#DCE6EF]/80">Bitácora comercial y actualización del lead</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Lead Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Lead / Empresa *</label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id} - {l.nombre} ({l.empresa}) • {l.ciudad}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha de Contacto</label>
              <input
                type="date"
                value={fecha || ''}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hora</label>
              <input
                type="time"
                value={hora || ''}
                onChange={(e) => setHora(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Canal de Comunicación</label>
              <select
                value={canal || 'WhatsApp'}
                onChange={(e) => setCanal(e.target.value as ContactChannel)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              >
                <option value="WhatsApp">💬 WhatsApp</option>
                <option value="Llamada">📞 Llamada Telefónica</option>
                <option value="Correo">✉️ Correo Electrónico</option>
                <option value="Reunión Presencial">🏢 Reunión Presencial</option>
                <option value="Videollamada">💻 Videollamada</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Resultado de la Gestión</label>
              <select
                value={resultado || 'Contactado con éxito'}
                onChange={(e) => setResultado(e.target.value as ContactResult)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-semibold"
              >
                <option value="Contactado con éxito">Contactado con éxito</option>
                <option value="No contesta">No contesta</option>
                <option value="Dejó en visto">Dejó en visto</option>
                <option value="Pidió cotización">Pidió cotización</option>
                <option value="Reunión agendada">Reunión agendada</option>
                <option value="Venta cerrada">Venta cerrada 🎉</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Resumen de la Interacción *</label>
            <textarea
              required
              rows={3}
              placeholder="¿Qué se habló con el cliente? ¿Qué acuerdos o inquietudes surgieron?"
              value={resumen || ''}
              onChange={(e) => setResumen(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#24445C]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Definir Próximo Paso</h4>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Próxima Acción</label>
              <input
                type="text"
                required
                value={proximaAccion || ''}
                onChange={(e) => setProximaAccion(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha de la Próxima Acción</label>
              <input
                type="date"
                required
                value={fechaProximaAccion || ''}
                onChange={(e) => setFechaProximaAccion(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#24445C] hover:bg-[#1b364a] text-white font-bold shadow-sm"
            >
              Guardar Interacción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
