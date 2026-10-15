import React, { useState } from 'react';
import { X, UserPlus, Building, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { Lead, LeadPhase, Priority, Platform } from '../types';
import { CURRENT_DATE_STRING } from '../utils/helpers';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (lead: Lead) => void;
  existingCount: number;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onCreateLead,
  existingCount,
}) => {
  if (!isOpen) return null;

  const nextId = `KAMU-${String(existingCount + 1).padStart(3, '0')}`;

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [ciudad, setCiudad] = useState('Bogotá');
  const [segmento, setSegmento] = useState('Retail B2B');
  const [fase, setFase] = useState<LeadPhase>('Primer Contacto');
  const [prioridad, setPrioridad] = useState<Priority>('ALTA');
  const [plataforma, setPlataforma] = useState<Platform>('Manual');
  const [campaignName, setCampaignName] = useState('Retail B2B');
  const [proximaAccion, setProximaAccion] = useState('Llamada de presentación y envío de catálogo comercial');
  const [fechaProximaAccion, setFechaProximaAccion] = useState(CURRENT_DATE_STRING);
  const [tipoNegocio, setTipoNegocio] = useState('Distribuidor Mayorista');
  const [necesidad, setNecesidad] = useState('Catálogo mayorista con descuento por volumen');
  const [notas, setNotas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;

    const newLead: Lead = {
      id: nextId,
      nombre: nombre.trim(),
      empresa: empresa.trim() || nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim() || `contacto@${(empresa || nombre).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      ciudad,
      segmento,
      fase,
      prioridad,
      probabilidad: fase === 'Primer Contacto' ? 15 : fase === 'Interesado' ? 45 : 30,
      ultimo_contacto: CURRENT_DATE_STRING,
      proxima_accion: proximaAccion,
      fecha_proxima_accion: fechaProximaAccion,
      accion_completada: false,
      notas: notas.trim() || `Lead ingresado manualmente. Necesidad: ${necesidad}.`,
      plataforma,
      campaign_name: campaignName,
      campaign_id: campaignName === 'Retail B2B' ? 'c:120247927268690765' : campaignName === 'Colegios Institucional' ? 'c:120247933071910765' : 'c:manual',
      anuncio: 'Ingreso Manual CRM',
      adset: 'Prospección Directa',
      formulario: 'Formulario Manual',
      tipo_negocio: tipoNegocio,
      puntos_venta: '1',
      necesidad,
      fecha_lead: CURRENT_DATE_STRING,
      ciudad_formulario: ciudad,
      coincidencia: 'Nuevo Lead sin Coincidencia',
      señales: ['👀', '📦'],
      valor_estimado: 2500000
    };

    onCreateLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#24445C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <UserPlus className="w-5 h-5 text-[#FFF0C2]" />
            </div>
            <div>
              <h2 className="text-base font-bold">Crear Nuevo Lead Comercial</h2>
              <p className="text-xs text-[#DCE6EF]/80">Registrar prospecto en la base comercial de KAMU</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Carlos Restrepo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#24445C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Empresa / Razón Social</label>
              <input
                type="text"
                placeholder="Ej. Distribuidora Santa Fe"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#24445C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="+57 310 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#24445C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="contacto@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#24445C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              >
                <option value="Bogotá">Bogotá</option>
                <option value="Medellín">Medellín</option>
                <option value="Cali">Cali</option>
                <option value="Barranquilla">Barranquilla</option>
                <option value="Bucaramanga">Bucaramanga</option>
                <option value="Pereira">Pereira</option>
                <option value="Cartagena">Cartagena</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Negocio</label>
              <select
                value={tipoNegocio}
                onChange={(e) => setTipoNegocio(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              >
                <option value="Distribuidor Mayorista">Distribuidor Mayorista</option>
                <option value="Papelería / Librería">Papelería / Librería</option>
                <option value="Colegio / Institución Educativa">Colegio / Institución Educativa</option>
                <option value="Tienda Retail / Regalos">Tienda Retail / Regalos</option>
                <option value="Empresa Corporativa">Empresa Corporativa</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fase Comercial Inicial</label>
              <select
                value={fase}
                onChange={(e) => setFase(e.target.value as LeadPhase)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              >
                <option value="Primer Contacto">Primer Contacto</option>
                <option value="Contactado">Contactado</option>
                <option value="Interesado">Interesado</option>
                <option value="En Propuesta">En Propuesta</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as Priority)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              >
                <option value="URGENTE">🔴 URGENTE</option>
                <option value="ALTA">🟠 ALTA</option>
                <option value="MEDIA">🟡 MEDIA</option>
                <option value="BAJA">⚪ BAJA</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Campaña / Fuente</label>
              <select
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              >
                <option value="Retail B2B">Retail B2B (c:120247927268690765)</option>
                <option value="Colegios Institucional">Colegios Institucional (c:120247933071910765)</option>
                <option value="Directo / Orgánico">Directo / Orgánico</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha Próxima Acción</label>
              <input
                type="date"
                value={fechaProximaAccion}
                onChange={(e) => setFechaProximaAccion(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Próxima Acción Comercial</label>
            <input
              type="text"
              value={proximaAccion}
              onChange={(e) => setProximaAccion(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#24445C]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notas / Observaciones Iniciales</label>
            <textarea
              rows={2}
              placeholder="Detalles sobre lo conversado o el requerimiento del cliente..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#24445C]"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
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
              Guardar Lead ({nextId})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
