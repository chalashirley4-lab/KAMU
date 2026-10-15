import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  HardDrive, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Table, 
  UserCheck, 
  Calendar, 
  Check, 
  Settings2, 
  FileCheck2, 
  FileDown,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Lead } from '../types';
import { 
  exportLeadsToCSV, 
  exportAllLeadsToCompleteCSV,
  formatDateForExcel 
} from '../utils/helpers';
import { exportAllLeadsToExcel } from '../services/excelExportService';

interface BaseDepuradaViewProps {
  leads: Lead[];
  onOpenWorkspaceModal: () => void;
  onSelectLead: (lead: Lead) => void;
  onOpenPerfil360?: (lead: Lead) => void;
  onOpenImportModal?: () => void;
  onDeleteLead?: (leadId: string) => void;
  onDeleteMultipleLeads?: (leadIds: string[]) => void;
}

export const BaseDepuradaView: React.FC<BaseDepuradaViewProps> = ({
  leads,
  onOpenWorkspaceModal,
  onSelectLead,
  onOpenPerfil360,
  onOpenImportModal,
  onDeleteLead,
  onDeleteMultipleLeads,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // CSV Configuration state
  const [delimiter, setDelimiter] = useState<',' | ';'>(',');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const totalPages = Math.ceil(leads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    return leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [leads, currentPage, itemsPerPage]);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Selection helpers
  const isAllPageSelected = paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.has(l.id));

  const handleToggleSelectAllPage = () => {
    const next = new Set(selectedIds);
    if (isAllPageSelected) {
      paginatedLeads.forEach(l => next.delete(l.id));
    } else {
      paginatedLeads.forEach(l => next.add(l.id));
    }
    setSelectedIds(next);
  };

  const handleSelectAllLeads = () => {
    setSelectedIds(new Set(leads.map(l => l.id)));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleToggleSelectOne = (leadId: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(leadId)) {
      next.delete(leadId);
    } else {
      next.add(leadId);
    }
    setSelectedIds(next);
  };

  const selectedLeadsList = useMemo(() => {
    return leads.filter(l => selectedIds.has(l.id));
  }, [leads, selectedIds]);

  // 1. Export Complete CSV with ALL system columns & Excel DD/MM/YYYY date formatting
  const handleExportCompleteCSV = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const fileName = `KAMU_Base_Depurada_Completa_Excel_${todayStr}.csv`;
    exportAllLeadsToCompleteCSV(leads, fileName, delimiter);
    triggerToast(`¡Exportados ${leads.length} leads a CSV con las 39 columnas del sistema en formato Excel (DD/MM/AAAA)!`);
  };

  // 2. Export 9-Column official CSV with Excel DD/MM/YYYY date formatting
  const handleExport9ColsCSV = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const fileName = `KAMU_Base_Depurada_Oficial_9Col_Excel_${todayStr}.csv`;
    exportLeadsToCSV(leads, fileName, delimiter);
    triggerToast(`¡Exportadas las 9 columnas oficiales de ${leads.length} leads a CSV en formato Excel!`);
  };

  // 3. Export Selected Leads to CSV
  const handleExportSelectedCSV = () => {
    if (selectedLeadsList.length === 0) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const fileName = `KAMU_Base_Depurada_Seleccionados_${selectedLeadsList.length}_Excel_${todayStr}.csv`;
    exportAllLeadsToCompleteCSV(selectedLeadsList, fileName, delimiter);
    triggerToast(`¡Exportados ${selectedLeadsList.length} leads seleccionados a CSV!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16a34a] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#DDEFE3] text-[#1b5e32]">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-[#24445C]">Base Depurada Oficial</h1>
            <span className="text-xs bg-[#24445C] text-white px-2.5 py-0.5 rounded-full font-bold">
              {leads.length} Leads Registrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Estructura compatible con el formato Base_Depurada original con opciones avanzadas de exportación a CSV para Excel y eliminación masiva.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && onDeleteMultipleLeads && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-lg shadow-sm transition active:scale-95 animate-in fade-in"
              title={`Eliminar ${selectedIds.size} leads seleccionados de forma masiva`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Masivo ({selectedIds.size})</span>
            </button>
          )}

          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Importar</span>
            </button>
          )}

          <button
            onClick={() => exportAllLeadsToExcel(leads, 'KAMU_Base_Depurada.xlsx')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-2xs transition"
            title="Descargar libro Excel completo"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={onOpenWorkspaceModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#24445C] hover:bg-[#1b364a] text-white font-bold text-xs rounded-lg shadow-sm transition active:scale-95"
          >
            <HardDrive className="w-4 h-4 text-[#FFF0C2]" />
            <span>Google Workspace</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when leads are selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-[#24445C] to-[#1b364a] text-white p-3.5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedIds.size} seleccionados</span>
            </span>
            <span className="text-xs text-slate-200 hidden sm:inline">
              de {leads.length} leads en la Base Depurada
            </span>
            {selectedIds.size < leads.length && (
              <button
                onClick={handleSelectAllLeads}
                className="text-xs underline text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
              >
                Seleccionar todos los {leads.length} leads
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportAllLeadsToExcel(selectedLeadsList, `KAMU_Base_Depurada_Seleccionados_${selectedIds.size}.xlsx`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
              title="Exportar leads seleccionados a Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel ({selectedIds.size})</span>
            </button>
            <button
              onClick={handleExportSelectedCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition"
              title="Exportar leads seleccionados a CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV ({selectedIds.size})</span>
            </button>
            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition"
            >
              Desmarcar
            </button>
            {onDeleteMultipleLeads && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-sm transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Selección Masiva</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PANEL DESTACADO DE EXPORTACIÓN A CSV CON TOTAL COMPATIBILIDAD CON EXCEL
         ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 p-5 rounded-2xl border-2 border-emerald-300 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs mt-0.5">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                  Exportación a CSV compatible con Microsoft Excel & Google Sheets
                </h2>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                  Formato DD/MM/AAAA + UTF-8 BOM
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 max-w-2xl leading-relaxed">
                Descarga instantánea de la base de prospectos con <strong>todas las columnas de datos definidas en el sistema</strong> (identificación, contacto, fases, semáforos, campañas publicitarias, formularios, métricas de prospección y notas). Las fechas se transforman automáticamente al estándar de fecha <strong>DD/MM/AAAA</strong> para evitar errores de interpretación regional en Excel.
              </p>
            </div>
          </div>

          {/* Separator selector for Excel regional settings */}
          <div className="flex items-center gap-2 bg-white/90 p-2 rounded-xl border border-emerald-200 shrink-0 text-xs shadow-2xs">
            <span className="font-bold text-slate-600 text-[11px] flex items-center gap-1">
              <Settings2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Separador CSV:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDelimiter(',')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  delimiter === ','
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Estándar internacional (coma)"
              >
                Coma ( , )
              </button>
              <button
                onClick={() => setDelimiter(';')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  delimiter === ';'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Estándar para Excel en español / configuración regional con coma decimal"
              >
                Punto y Coma ( ; )
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons for CSV Export */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-200/60">
          {/* Main Button: Complete CSV (All columns) */}
          <button
            onClick={handleExportCompleteCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Exportar Todos los Leads a CSV (Completo - 39 Columnas)</span>
            <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full font-mono">
              {leads.length} registros
            </span>
          </button>

          {/* Secondary Button: 9 columns original Base Depurada */}
          <button
            onClick={handleExport9ColsCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV Base Depurada (9 Columnas Oficiales)</span>
          </button>
        </div>

        {/* Quality and Technical Verification Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-emerald-900 font-medium">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Fechas uniformes: <strong>DD/MM/AAAA</strong> (ej. {formatDateForExcel('2026-10-15')})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Codificación: <strong>UTF-8 con BOM</strong> (acentos, ñ y emojis)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Escapeo de comillas dobles y campos protegidos RFC 4180</span>
          </div>
        </div>
      </div>

      {/* 9 Columns Info Banner */}
      <div className="bg-[#DCE6EF]/50 p-3.5 rounded-xl border border-[#DCE6EF] flex items-center justify-between text-xs text-[#24445C]">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-[#24445C] shrink-0" />
          <span>
            <strong>Orden estricto de las 9 columnas visualizadas:</strong> 1. ID Lead | 2. Nombre / Empresa | 3. Teléfono | 4. Email | 5. Ciudad | 6. Fase Comercial | 7. Prioridad | 8. Último Contacto | 9. Próxima Acción
          </span>
        </div>
        <span className="font-bold shrink-0">{leads.length} registros</span>
      </div>

      {/* 9-Column Table with Bulk Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#24445C] text-white font-sans select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleToggleSelectAllPage}
                    className="w-4 h-4 rounded text-[#24445C] focus:ring-[#24445C] border-slate-300 cursor-pointer accent-[#24445C]"
                    title={isAllPageSelected ? 'Desmarcar toda la página' : 'Seleccionar toda la página'}
                  />
                </th>
                <th className="py-3 px-3 font-bold">1. ID Lead</th>
                <th className="py-3 px-4 font-bold">2. Nombre / Empresa</th>
                <th className="py-3 px-3 font-bold">3. Teléfono</th>
                <th className="py-3 px-3 font-bold">4. Email</th>
                <th className="py-3 px-3 font-bold">5. Ciudad</th>
                <th className="py-3 px-3 font-bold">6. Fase Comercial</th>
                <th className="py-3 px-3 font-bold">7. Prioridad</th>
                <th className="py-3 px-3 font-bold">8. Último Contacto</th>
                <th className="py-3 px-4 font-bold">9. Próxima Acción</th>
                <th className="py-3 px-3 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No hay leads en la Base Depurada.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition ${
                        isSelected ? 'bg-amber-50/70 border-l-4 border-l-[#24445C]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectOne(lead.id, e)}
                          className="w-4 h-4 rounded text-[#24445C] focus:ring-[#24445C] border-slate-300 cursor-pointer accent-[#24445C]"
                        />
                      </td>

                      {/* Col 1 */}
                      <td className="py-2.5 px-3 font-mono font-bold text-[#24445C]">
                        {lead.id}
                      </td>

                      {/* Col 2 */}
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {lead.nombre} {lead.empresa ? `(${lead.empresa})` : ''}
                      </td>

                      {/* Col 3 */}
                      <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                        {lead.telefono}
                      </td>

                      {/* Col 4 */}
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                        {lead.email}
                      </td>

                      {/* Col 5 */}
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {lead.ciudad}
                      </td>

                      {/* Col 6 */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                          lead.fase === 'Cerrado Ganado'
                            ? 'bg-[#DDEFE3] text-[#1b5e32]'
                            : lead.fase === 'Negociación'
                            ? 'bg-[#FCE2CC] text-[#9e4400]'
                            : lead.fase === 'En Propuesta'
                            ? 'bg-[#FFF0C2] text-[#8a6508]'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.fase}
                        </span>
                      </td>

                      {/* Col 7 */}
                      <td className="py-2.5 px-3">
                        <span className="font-extrabold text-[11px]">
                          {lead.prioridad === 'URGENTE' ? '🔴' : lead.prioridad === 'ALTA' ? '🟠' : lead.prioridad === 'MEDIA' ? '🟡' : '⚪'} {lead.prioridad}
                        </span>
                      </td>

                      {/* Col 8: Fecha formateada DD/MM/AAAA para consistencia */}
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] font-mono">
                        {formatDateForExcel(lead.ultimo_contacto)}
                      </td>

                      {/* Col 9 */}
                      <td className="py-2.5 px-4 text-slate-800 font-medium max-w-xs truncate" title={lead.proxima_accion}>
                        {lead.proxima_accion}
                      </td>

                      {/* Action Col */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {onOpenPerfil360 && (
                            <button
                              onClick={() => onOpenPerfil360(lead)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                              title="Abrir en Perfil 360° Excel"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteLead && (
                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Eliminar lead de la base"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Single Lead Delete Confirmation Modal */}
        {leadToDelete && onDeleteLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">¿Eliminar Lead de la Base Depurada?</h3>
                  <p className="text-xs text-slate-500">Se removerá permanentemente de todos los registros.</p>
                </div>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                ¿Confirmas eliminar a <strong>{leadToDelete.nombre} ({leadToDelete.empresa || leadToDelete.id})</strong>?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setLeadToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteLead(leadToDelete.id);
                    setLeadToDelete(null);
                    triggerToast(`Lead ${leadToDelete.id} eliminado correctamente.`);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
                >
                  Sí, Eliminar Lead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && onDeleteMultipleLeads && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    ¿Eliminar {selectedIds.size} Leads de la Base Depurada?
                  </h3>
                  <p className="text-xs text-red-600 font-semibold">
                    Esta acción es irreversible y eliminará todos los prospectos seleccionados.
                  </p>
                </div>
              </div>

              <div className="bg-red-50/60 border border-red-100 rounded-xl p-3.5 text-xs text-red-900 space-y-2">
                <p>
                  Estás a punto de eliminar masivamente <strong>{selectedIds.size} leads</strong> de la Base Depurada Oficial y de todas las métricas del CRM.
                </p>
                <div className="max-h-40 overflow-y-auto bg-white rounded-lg p-2.5 border border-red-200 divide-y divide-slate-100 text-[11px] font-sans">
                  {selectedLeadsList.slice(0, 30).map((l) => (
                    <div key={l.id} className="py-1 flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{l.id} - {l.nombre}</span>
                      <span className="text-slate-500 truncate max-w-[150px]">{l.empresa || l.ciudad} • {l.fase}</span>
                    </div>
                  ))}
                  {selectedLeadsList.length > 30 && (
                    <div className="pt-1 text-center font-bold text-slate-500">
                      ... y {selectedLeadsList.length - 30} leads más
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  Total seleccionados: <strong>{selectedIds.size}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkDeleteConfirm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const count = selectedIds.size;
                      onDeleteMultipleLeads(Array.from(selectedIds));
                      setSelectedIds(new Set());
                      setShowBulkDeleteConfirm(false);
                      triggerToast(`Se eliminaron masivamente ${count} leads.`);
                    }}
                    className="px-5 py-2 text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar {selectedIds.size} Leads Definitivamente</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando registros {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, leads.length)} de {leads.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
