import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Save, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Tag, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Lead, LeadPhase, Priority, ContactChannel, ContactResult } from '../types';
import { CURRENT_DATE_STRING } from '../utils/helpers';
import { generatePerfil360Excel } from '../services/excelExportService';

interface Perfil360ViewProps {
  leads: Lead[];
  currentLeadId?: string;
  onUpdateLead: (updated: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onSelectLeadId: (leadId: string) => void;
  onOpenWorkspaceModal: () => void;
}

// Helper to ensure all input fields are strictly defined strings/numbers (prevents React uncontrolled-to-controlled warning)
const enrichLeadForPerfil360 = (lead?: Lead): Lead => {
  if (!lead) {
    return {
      id: '',
      nombre: '',
      empresa: '',
      telefono: '',
      email: '',
      ciudad: '',
      segmento: 'Retail B2B',
      fase: 'Primer Contacto',
      prioridad: 'ALTA',
      probabilidad: 30,
      ultimo_contacto: CURRENT_DATE_STRING,
      proxima_accion: 'Llamar y presentar catálogo comercial',
      fecha_proxima_accion: CURRENT_DATE_STRING,
      accion_completada: false,
      notas: '',
      plataforma: 'Manual',
      campaign_name: 'Retail B2B',
      campaign_id: 'c:120247927268690765',
      anuncio: 'Ingreso CRM',
      adset: 'Prospección',
      formulario: 'General',
      tipo_negocio: 'Comercial',
      puntos_venta: '1',
      necesidad: '',
      fecha_lead: CURRENT_DATE_STRING,
      ciudad_formulario: '',
      coincidencia: 'Nuevo Lead sin Coincidencia',
      señales: ['👀'],
      valor_estimado: 0,
      rol_contacto: 'Director de Compras / Propietario',
      responsable_gestion: 'Shirley Chala (Directora Comercial)',
      estado_registro: 'Activo en Seguimiento',
      producto_interes: 'Catálogo Mayorista / Kits Escolares',
      canal_contacto: 'WhatsApp',
      resultado_ultimo_contacto: 'Contactado con éxito',
      archivos_origen: 'Base_Depurada_2026.xlsx',
      id_original_crm: '',
      resultado_cruce: 'Nuevo Lead sin Coincidencia',
      motivo_perdida: ''
    };
  }

  return {
    ...lead,
    nombre: lead.nombre ?? '',
    empresa: lead.empresa ?? '',
    telefono: lead.telefono ?? '',
    email: lead.email ?? '',
    ciudad: lead.ciudad ?? '',
    segmento: lead.segmento ?? 'Retail B2B',
    fase: lead.fase ?? 'Primer Contacto',
    prioridad: lead.prioridad ?? 'MEDIA',
    probabilidad: lead.probabilidad ?? 30,
    ultimo_contacto: lead.ultimo_contacto ?? CURRENT_DATE_STRING,
    proxima_accion: lead.proxima_accion ?? '',
    fecha_proxima_accion: lead.fecha_proxima_accion ?? '',
    notas: lead.notas ?? '',
    plataforma: lead.plataforma ?? 'Manual',
    campaign_name: lead.campaign_name ?? '',
    campaign_id: lead.campaign_id ?? '',
    anuncio: lead.anuncio ?? '',
    adset: lead.adset ?? '',
    formulario: lead.formulario ?? '',
    tipo_negocio: lead.tipo_negocio ?? '',
    puntos_venta: lead.puntos_venta ?? '1',
    necesidad: lead.necesidad ?? '',
    fecha_lead: lead.fecha_lead ?? CURRENT_DATE_STRING,
    ciudad_formulario: lead.ciudad_formulario ?? '',
    coincidencia: lead.coincidencia ?? 'Nuevo Lead sin Coincidencia',
    señales: lead.señales ?? [],
    valor_estimado: lead.valor_estimado ?? 0,
    rol_contacto: lead.rol_contacto || 'Director de Compras / Propietario',
    responsable_gestion: lead.responsable_gestion || 'Shirley Chala (Directora Comercial)',
    estado_registro: lead.estado_registro || 'Activo en Seguimiento',
    producto_interes: lead.producto_interes || 'Catálogo Mayorista / Kits Escolares',
    canal_contacto: lead.canal_contacto || 'WhatsApp',
    resultado_ultimo_contacto: lead.resultado_ultimo_contacto || 'Contactado con éxito',
    archivos_origen: lead.archivos_origen || 'Base_Depurada_2026.xlsx',
    id_original_crm: lead.id_original_crm || lead.id || '',
    resultado_cruce: lead.resultado_cruce || lead.coincidencia || 'Nuevo Lead sin Coincidencia',
    motivo_perdida: lead.motivo_perdida || ''
  };
};

export const Perfil360View: React.FC<Perfil360ViewProps> = ({
  leads,
  currentLeadId,
  onUpdateLead,
  onDeleteLead,
  onSelectLeadId,
  onOpenWorkspaceModal,
}) => {
  // Current active lead in Perfil 360
  const activeLead = leads.find(l => l.id === currentLeadId) || leads[0];

  // Local state for editable fields - ALWAYS initialized with fully defined properties
  const [formData, setFormData] = useState<Lead>(() => enrichLeadForPerfil360(activeLead));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state when selected lead changes
  useEffect(() => {
    if (activeLead) {
      setFormData(enrichLeadForPerfil360(activeLead));
    }
  }, [activeLead]);

  if (!activeLead) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
        No hay leads disponibles en la base.
      </div>
    );
  }

  // Calculate days remaining formula
  const getDaysRemainingInfo = () => {
    if (!formData.fecha_proxima_accion) {
      return { days: null, text: 'Sin fecha programada', status: 'neutral' };
    }
    const today = new Date('2026-10-15T00:00:00');
    const target = new Date(`${formData.fecha_proxima_accion}T00:00:00`);
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { days: diff, text: `Vencido hace ${Math.abs(diff)} día(s)`, status: 'overdue' };
    } else if (diff === 0) {
      return { days: 0, text: 'Vence HOY (Atención Inmediata)', status: 'urgent' };
    } else if (diff <= 3) {
      return { days: diff, text: `${diff} día(s) restante(s) (Próximo)`, status: 'upcoming' };
    } else {
      return { days: diff, text: `${diff} días restantes`, status: 'neutral' };
    }
  };

  const daysInfo = getDaysRemainingInfo();

  // Save changes
  const handleSave = () => {
    onUpdateLead(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Delete lead
  const handleConfirmDelete = () => {
    onDeleteLead(formData.id);
    setShowDeleteConfirm(false);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls & KAMU Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#24445C] text-[#FFF0C2]">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-[#24445C]">
              Ficha de Lead «Perfil 360° de KAMU»
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Formato Oficial Excel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualización individual completa tipo ficha ejecutiva. Carga automática de datos de la Base Maestra y exportación a Excel.
          </p>
        </div>

        {/* Lead Selector + Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropdown selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">Cargar Lead:</span>
            <select
              value={formData.id || ''}
              onChange={(e) => onSelectLeadId(e.target.value)}
              className="text-xs font-extrabold text-[#24445C] bg-transparent focus:outline-none cursor-pointer"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.id} — {l.nombre} ({l.empresa})
                </option>
              ))}
            </select>
          </div>

          {/* Export to Excel (.xlsx) */}
          <button
            onClick={() => generatePerfil360Excel(formData, leads)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition active:scale-95"
            title="Descargar libro Excel con hojas Perfil 360° y Base Maestra"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Excel (.xlsx)</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition"
            title="Imprimir ficha en formato horizontal"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir Horizontal</span>
          </button>

          {/* Save modifications */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#24445C] hover:bg-[#1b364a] text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <Save className="w-4 h-4 text-[#FFF0C2]" />
            <span>{saveSuccess ? '¡Guardado!' : 'Guardar Cambios'}</span>
          </button>

          {/* Delete Lead */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl border border-red-200 transition"
            title="Eliminar este lead de la base"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">¿Eliminar este Lead?</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Se eliminará definitivamente el lead <strong>{formData.id} - {formData.nombre} ({formData.empresa})</strong> de la base consolidada de KAMU.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
              >
                Sí, Eliminar Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE EXCEL PERFIL 360° KAMU DOSSIER SHEET (Styling matches prompt constitution)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-[#24445C] shadow-md overflow-hidden print:border-none print:shadow-none print:m-0 text-slate-800">
        
        {/* Top Branding Banner in Excel Style */}
        <div className="bg-[#24445C] text-white px-8 py-5 flex items-center justify-between border-b-4 border-[#FFF0C2]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-xl text-[#FFF0C2] tracking-wider">
              KAMU
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#DCE6EF] uppercase tracking-widest block">
                Sistema Integral de Gestión Comercial
              </span>
              <h1 className="text-xl font-extrabold tracking-tight">
                Ficha Individual: Perfil 360° de KAMU
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/70 uppercase block font-semibold">Identificador Principal</span>
            <div className="text-2xl font-black font-mono text-[#FFF0C2] bg-black/20 px-3 py-0.5 rounded-lg border border-white/20 inline-block">
              {formData.id}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 bg-slate-50/30">

          {/* ==================== A. ENCABEZADO DEL PERFIL ==================== */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-[#DCE6EF] px-5 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#24445C]">
                A. Encabezado del Perfil
              </h2>
              <span className="text-[10px] font-bold text-slate-600 font-mono">ID: {formData.id}</span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Nombre Completo */}
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Nombre Completo del Lead *
                </label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full text-base font-extrabold text-[#24445C] bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#24445C]"
                />
              </div>

              {/* ID KAMU */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  ID Cliente KAMU (Principal)
                </label>
                <div className="font-mono text-base font-black text-slate-800 bg-slate-100 border border-slate-300 rounded-lg p-2">
                  {formData.id}
                </div>
              </div>

              {/* Prioridad con Semáforo */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Prioridad del Lead
                </label>
                <select
                  value={formData.prioridad || 'MEDIA'}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Priority })}
                  className={`w-full text-xs font-black p-2.5 rounded-lg border cursor-pointer ${
                    formData.prioridad === 'URGENTE'
                      ? 'bg-[#F6D7D7] text-[#9e1c1c] border-red-300'
                      : formData.prioridad === 'ALTA'
                      ? 'bg-[#FCE2CC] text-[#9e4400] border-orange-300'
                      : formData.prioridad === 'MEDIA'
                      ? 'bg-[#FFF0C2] text-[#8a6508] border-yellow-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <option value="URGENTE">🔴 URGENTE</option>
                  <option value="ALTA">🟠 ALTA</option>
                  <option value="MEDIA">🟡 MEDIA</option>
                  <option value="BAJA">⚪ BAJA</option>
                </select>
              </div>

              {/* Plataforma */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Plataforma de Origen
                </label>
                <select
                  value={formData.plataforma || 'Facebook'}
                  onChange={(e) => setFormData({ ...formData, plataforma: e.target.value as any })}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Facebook">🔵 Facebook</option>
                  <option value="Instagram">🩷 Instagram</option>
                  <option value="Formulario Web">🟣 Formulario Web</option>
                  <option value="Manual">⚙️ Manual / Referido</option>
                </select>
              </div>

              {/* Segmento Comercial */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Segmento Comercial
                </label>
                <input
                  type="text"
                  value={formData.segmento || ''}
                  onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                  className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              {/* Empresa */}
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Empresa o Tienda Comercial
                </label>
                <input
                  type="text"
                  value={formData.empresa || ''}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* ==================== B. RESUMEN COMERCIAL ==================== */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-[#DCE6EF] px-5 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#24445C]">
                B. Resumen Comercial & Estado
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">Listas Desplegables Validadas</span>
            </div>

            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fase Comercial</label>
                <select
                  value={formData.fase || 'Primer Contacto'}
                  onChange={(e) => setFormData({ ...formData, fase: e.target.value as LeadPhase })}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-lg text-[#24445C]"
                >
                  <option value="Primer Contacto">Nuevo / Primer Contacto</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Interesado">Interesado</option>
                  <option value="En Propuesta">Cotización / En Propuesta</option>
                  <option value="Negociación">Negociación</option>
                  <option value="Cerrado Ganado">Convertido (Ganado) 🎉</option>
                  <option value="Perdido">Perdido</option>
                  <option value="Pausado">Pausado / Standby</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Responsable de Gestión</label>
                <input
                  type="text"
                  value={formData.responsable_gestion || ''}
                  onChange={(e) => setFormData({ ...formData, responsable_gestion: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Estado del Registro</label>
                <select
                  value={formData.estado_registro || 'Activo en Seguimiento'}
                  onChange={(e) => setFormData({ ...formData, estado_registro: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Activo en Seguimiento">Activo en Seguimiento</option>
                  <option value="Propuesta Presentada">Propuesta Presentada</option>
                  <option value="Requiere Aprobación">Requiere Aprobación</option>
                  <option value="Cerrado Exitoso">Cerrado Exitoso</option>
                  <option value="Descartado / Inactivo">Descartado / Inactivo</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Probabilidad de Cierre (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.probabilidad ?? 0}
                  onChange={(e) => setFormData({ ...formData, probabilidad: Number(e.target.value) })}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-lg text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* ==================== C. INFORMACIÓN DE CONTACTO ==================== */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-[#DCE6EF] px-5 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#24445C]">
                C. Información de Contacto
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">Datos Verificados (Sin inventar datos)</span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full font-mono font-bold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ciudad Principal</label>
                <input
                  type="text"
                  value={formData.ciudad || ''}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Empresa o Razón Social</label>
                <input
                  type="text"
                  value={formData.empresa || ''}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Rol del Contacto</label>
                <input
                  type="text"
                  value={formData.rol_contacto || ''}
                  onChange={(e) => setFormData({ ...formData, rol_contacto: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tipo de Formulario Captado</label>
                <input
                  type="text"
                  value={formData.formulario || ''}
                  onChange={(e) => setFormData({ ...formData, formulario: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* ==================== D. OPORTUNIDAD Y NECESIDAD COMERCIAL ==================== */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-[#DCE6EF] px-5 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#24445C]">
                D. Oportunidad y Necesidad Comercial
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">Potencial & Escala de Negocio</span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Necesidad / Descripción del Pedido Solicitado
                </label>
                <input
                  type="text"
                  value={formData.necesidad || ''}
                  onChange={(e) => setFormData({ ...formData, necesidad: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Puntos de Venta</label>
                <select
                  value={formData.puntos_venta || '1'}
                  onChange={(e) => setFormData({ ...formData, puntos_venta: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="1">1 punto</option>
                  <option value="2-5">2 a 5 puntos</option>
                  <option value="6-10">6 a 10 puntos</option>
                  <option value="10+">Más de 10 puntos</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Producto o Línea de Interés</label>
                <input
                  type="text"
                  value={formData.producto_interes || ''}
                  onChange={(e) => setFormData({ ...formData, producto_interes: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Presupuesto o Volumen Estimado (COP)</label>
                <input
                  type="number"
                  value={formData.valor_estimado ?? 0}
                  onChange={(e) => setFormData({ ...formData, valor_estimado: Number(e.target.value) })}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-lg text-emerald-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Motivo de Pérdida (Si aplica)</label>
                <select
                  value={formData.motivo_perdida || ''}
                  onChange={(e) => setFormData({ ...formData, motivo_perdida: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg text-red-700"
                >
                  <option value="">N/A (Oportunidad Activa)</option>
                  <option value="Precio alto / Falta de margen">Precio alto / Falta de margen</option>
                  <option value="Eligió competidor">Eligió competidor</option>
                  <option value="Sin presupuesto asignado">Sin presupuesto asignado</option>
                  <option value="No responde / Inubicable">No responde / Inubicable</option>
                  <option value="Fuera de zona de cobertura">Fuera de zona de cobertura</option>
                </select>
              </div>
            </div>
          </div>

          {/* ==================== E. SEGUIMIENTO COMERCIAL Y PRÓXIMA ACCIÓN (DESTACADA) ==================== */}
          <div className="bg-[#FFF0C2]/30 rounded-xl border-2 border-[#fef08a] shadow-sm overflow-hidden">
            <div className="bg-[#FFF0C2] px-5 py-3 border-b border-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8a6508]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#8a6508]">
                  E. Seguimiento Comercial y Próxima Acción (Sección Prioritaria)
                </h2>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${
                daysInfo.status === 'overdue'
                  ? 'bg-[#F6D7D7] text-[#9e1c1c] border-red-300'
                  : daysInfo.status === 'urgent'
                  ? 'bg-amber-400 text-amber-950 border-amber-500'
                  : daysInfo.status === 'upcoming'
                  ? 'bg-yellow-200 text-yellow-900 border-yellow-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {daysInfo.text}
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fecha Último Contacto</label>
                <input
                  type="date"
                  value={formData.ultimo_contacto || ''}
                  onChange={(e) => setFormData({ ...formData, ultimo_contacto: e.target.value })}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Canal de Contacto</label>
                <select
                  value={formData.canal_contacto || 'WhatsApp'}
                  onChange={(e) => setFormData({ ...formData, canal_contacto: e.target.value as ContactChannel })}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="WhatsApp">💬 WhatsApp</option>
                  <option value="Llamada">📞 Llamada Telefónica</option>
                  <option value="Correo">✉️ Correo Electrónico</option>
                  <option value="Reunión Presencial">🏢 Reunión Presencial</option>
                  <option value="Videollamada">💻 Videollamada</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Resultado del Último Contacto</label>
                <select
                  value={formData.resultado_ultimo_contacto || 'Contactado con éxito'}
                  onChange={(e) => setFormData({ ...formData, resultado_ultimo_contacto: e.target.value as ContactResult })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
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

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Próxima Acción Programada (Lista Desplegable)
                </label>
                <div className="flex gap-2">
                  <select
                    value={(formData.proxima_accion || '').split(' - ')[0] || formData.proxima_accion || 'Llamar'}
                    onChange={(e) => setFormData({ ...formData, proxima_accion: e.target.value })}
                    className="font-black p-2 bg-white border border-slate-300 rounded-lg text-[#24445C] shrink-0"
                  >
                    <option value="Llamar">Llamar</option>
                    <option value="Enviar WhatsApp">Enviar WhatsApp</option>
                    <option value="Enviar correo">Enviar correo</option>
                    <option value="Enviar catálogo">Enviar catálogo</option>
                    <option value="Enviar cotización">Enviar cotización</option>
                    <option value="Agendar reunión">Agendar reunión</option>
                    <option value="Esperar respuesta">Esperar respuesta</option>
                    <option value="Cerrar lead">Cerrar lead</option>
                  </select>
                  <input
                    type="text"
                    value={formData.proxima_accion || ''}
                    onChange={(e) => setFormData({ ...formData, proxima_accion: e.target.value })}
                    placeholder="Detalle de la acción..."
                    className="flex-1 font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Fecha Próxima Acción (Formato Condicional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_proxima_accion || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_proxima_accion: e.target.value })}
                  className={`w-full font-black p-2 rounded-lg border ${
                    daysInfo.status === 'overdue'
                      ? 'bg-[#F6D7D7] border-red-400 text-[#9e1c1c]'
                      : daysInfo.status === 'urgent'
                      ? 'bg-amber-100 border-amber-400 text-amber-900'
                      : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ==================== F. NOTAS E HISTORIAL DE GESTIÓN ==================== */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-[#DCE6EF] px-5 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#24445C]">
                F. Notas e Historial de Gestión
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">Espacio Amplio Editable</span>
            </div>

            <div className="p-5">
              <textarea
                rows={4}
                value={formData.notas || ''}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Documentar llamadas realizadas, mensajes enviados, respuestas recibidas, objeciones y acuerdos comerciales..."
                className="w-full text-xs font-medium p-3 bg-slate-50/50 border border-slate-300 rounded-xl leading-relaxed focus:ring-2 focus:ring-[#24445C]"
              />
            </div>
          </div>

          {/* ==================== G. ORIGEN Y ATRIBUCIÓN DE CAMPAÑA ==================== */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-[#DCE6EF] px-5 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#24445C]">
                G. Origen y Atribución de Campaña Publicitaria
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">Trazabilidad de Captación</span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre de la Campaña</label>
                <input
                  type="text"
                  value={formData.campaign_name || ''}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">ID de Campaña</label>
                <input
                  type="text"
                  value={formData.campaign_id || ''}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                  className="w-full font-mono text-[11px] p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre del Anuncio</label>
                <input
                  type="text"
                  value={formData.anuncio || ''}
                  onChange={(e) => setFormData({ ...formData, anuncio: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Conjunto de Anuncios (Adset)</label>
                <input
                  type="text"
                  value={formData.adset || ''}
                  onChange={(e) => setFormData({ ...formData, adset: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Formulario de Origen</label>
                <input
                  type="text"
                  value={formData.formulario || ''}
                  onChange={(e) => setFormData({ ...formData, formulario: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fecha de Captación</label>
                <input
                  type="date"
                  value={formData.fecha_lead || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_lead: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ciudad en Formulario</label>
                <input
                  type="text"
                  value={formData.ciudad_formulario || ''}
                  onChange={(e) => setFormData({ ...formData, ciudad_formulario: e.target.value })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resultado del Cruce</label>
                <select
                  value={formData.coincidencia || 'Nuevo Lead sin Coincidencia'}
                  onChange={(e) => setFormData({ ...formData, coincidencia: e.target.value as any })}
                  className="w-full font-semibold p-2 bg-white border border-slate-300 rounded-lg text-purple-700"
                >
                  <option value="Nombre Exacto">Nombre Exacto</option>
                  <option value="Nombre Coincidente">Nombre Coincidente</option>
                  <option value="Nuevo Lead sin Coincidencia">Nuevo Lead sin Coincidencia</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">ID Original CRM / Archivo</label>
                <input
                  type="text"
                  value={formData.id_original_crm || ''}
                  onChange={(e) => setFormData({ ...formData, id_original_crm: e.target.value })}
                  className="w-full font-mono text-[11px] p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer in Excel Style */}
        <div className="bg-[#24445C] text-white px-8 py-3 flex items-center justify-between text-xs">
          <span>KAMU CRM v2.4 • Ficha Técnica Oficial Perfil 360°</span>
          <span className="font-mono text-[#FFF0C2]">Confidencial Comercial • KAMU B2B</span>
        </div>
      </div>
    </div>
  );
};
