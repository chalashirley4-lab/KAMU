import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload,
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Lead, LeadPhase, Priority, Platform } from '../types';
import { getDaysWithoutContact, formatCOP, exportLeadsToCSV } from '../utils/helpers';
import { exportAllLeadsToExcel } from '../services/excelExportService';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenNewLead: () => void;
  onOpenImportModal: () => void;
  onDeleteLead: (leadId: string) => void;
  onDeleteMultipleLeads: (leadIds: string[]) => void;
  onOpenPerfil360: (lead: Lead) => void;
  initialFaseFilter?: string;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onSelectLead,
  onOpenNewLead,
  onOpenImportModal,
  onDeleteLead,
  onDeleteMultipleLeads,
  onOpenPerfil360,
  initialFaseFilter = 'Todas',
}) => {
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // 5 Combinable filters
  const [searchQuery, setSearchQuery] = useState('');
  const [faseFilter, setFaseFilter] = useState<string>(initialFaseFilter);
  const [prioridadFilter, setPrioridadFilter] = useState<string>('Todas');
  const [plataformaFilter, setPlataformaFilter] = useState<string>('Todas');
  const [campañaFilter, setCampañaFilter] = useState<string>('Todas');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Free search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          lead.nombre.toLowerCase().includes(query) ||
          lead.empresa.toLowerCase().includes(query) ||
          lead.telefono.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.ciudad.toLowerCase().includes(query) ||
          lead.id.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Fase
      if (faseFilter !== 'Todas' && lead.fase !== faseFilter) {
        return false;
      }

      // 3. Prioridad
      if (prioridadFilter !== 'Todas' && lead.prioridad !== prioridadFilter) {
        return false;
      }

      // 4. Plataforma
      if (plataformaFilter !== 'Todas' && lead.plataforma !== plataformaFilter) {
        return false;
      }

      // 5. Campaña
      if (campañaFilter !== 'Todas' && lead.campaign_name !== campañaFilter) {
        return false;
      }

      return true;
    });
  }, [leads, searchQuery, faseFilter, prioridadFilter, plataformaFilter, campañaFilter]);

  // Reset pagination on filter change
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setFaseFilter('Todas');
    setPrioridadFilter('Todas');
    setPlataformaFilter('Todas');
    setCampañaFilter('Todas');
    setCurrentPage(1);
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

  const handleSelectAllFiltered = () => {
    setSelectedIds(new Set(filteredLeads.map(l => l.id)));
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

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-[#24445C]">Base de Leads Comerciales</h1>
              <span className="text-xs bg-[#DCE6EF] text-[#24445C] font-bold px-2.5 py-0.5 rounded-full">
                Mostrando {filteredLeads.length} de {leads.length} leads
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtra, explora y gestiona los prospectos consolidados desde campañas de Facebook, Instagram y formularios.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-lg shadow-sm transition active:scale-95 animate-in fade-in"
                title={`Eliminar ${selectedIds.size} leads seleccionados`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Masivo ({selectedIds.size})</span>
              </button>
            )}
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 transition"
              title="Importar archivo Excel o CSV"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Importar</span>
            </button>
            <button
              onClick={() => exportAllLeadsToExcel(filteredLeads, 'KAMU_Leads_Filtrados.xlsx')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition"
              title="Exportar a libro Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => exportLeadsToCSV(filteredLeads)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>CSV ({filteredLeads.length})</span>
            </button>
            <button
              onClick={onOpenNewLead}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#24445C] hover:bg-[#1b364a] text-white font-bold text-xs rounded-lg shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Lead</span>
            </button>
          </div>
        </div>

        {/* 5 Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* 1. Free search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar libre..."
              value={searchQuery || ''}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#24445C]"
            />
          </div>

          {/* 2. Fase */}
          <div>
            <select
              value={faseFilter || 'Todas'}
              onChange={(e) => { setFaseFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#24445C]"
            >
              <option value="Todas">Fase: Todas ({leads.length})</option>
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

          {/* 3. Prioridad */}
          <div>
            <select
              value={prioridadFilter || 'Todas'}
              onChange={(e) => { setPrioridadFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#24445C]"
            >
              <option value="Todas">Prioridad: Todas</option>
              <option value="URGENTE">🔴 URGENTE</option>
              <option value="ALTA">🟠 ALTA</option>
              <option value="MEDIA">🟡 MEDIA</option>
              <option value="BAJA">⚪ BAJA</option>
            </select>
          </div>

          {/* 4. Plataforma */}
          <div>
            <select
              value={plataformaFilter || 'Todas'}
              onChange={(e) => { setPlataformaFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#24445C]"
            >
              <option value="Todas">Plataforma: Todas</option>
              <option value="Facebook">🔵 Facebook (fb)</option>
              <option value="Instagram">🩷 Instagram (ig)</option>
              <option value="Formulario Web">🟣 Formulario Web</option>
              <option value="Manual">⚙️ Manual / Referido</option>
            </select>
          </div>

          {/* 5. Campaña */}
          <div className="flex gap-2">
            <select
              value={campañaFilter || 'Todas'}
              onChange={(e) => { setCampañaFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#24445C]"
            >
              <option value="Todas">Campaña: Todas</option>
              <option value="Retail B2B">Retail B2B</option>
              <option value="Colegios Institucional">Colegios Institucional</option>
              <option value="Directo / Orgánico">Directo / Orgánico</option>
            </select>
            {(searchQuery || faseFilter !== 'Todas' || prioridadFilter !== 'Todas' || plataformaFilter !== 'Todas' || campañaFilter !== 'Todas') && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg hover:bg-slate-100"
                title="Limpiar filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-[#24445C] to-[#1b364a] text-white p-3.5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedIds.size} seleccionados</span>
            </span>
            <span className="text-xs text-slate-200 hidden sm:inline">
              de {filteredLeads.length} leads filtrados ({leads.length} totales)
            </span>
            {selectedIds.size < filteredLeads.length && (
              <button
                onClick={handleSelectAllFiltered}
                className="text-xs underline text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
              >
                Seleccionar todos los {filteredLeads.length} filtrados
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportAllLeadsToExcel(selectedLeadsList, `KAMU_Leads_Seleccionados_${selectedIds.size}.xlsx`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
              title="Exportar leads seleccionados a Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel ({selectedIds.size})</span>
            </button>
            <button
              onClick={() => exportLeadsToCSV(selectedLeadsList, `KAMU_Leads_Seleccionados_${selectedIds.size}.csv`)}
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
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-sm transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Selección Masiva</span>
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#24445C] text-white select-none">
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
                <th className="py-3 px-4 font-bold">ID / Nombre Lead</th>
                <th className="py-3 px-3 font-bold">Empresa & Ciudad</th>
                <th className="py-3 px-3 font-bold">Fase Comercial</th>
                <th className="py-3 px-3 font-bold">Prioridad</th>
                <th className="py-3 px-3 font-bold">Semáforo Días</th>
                <th className="py-3 px-3 font-bold">Origen / Campaña</th>
                <th className="py-3 px-4 font-bold">Próxima Acción</th>
                <th className="py-3 px-3 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No se encontraron leads con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const days = getDaysWithoutContact(lead.ultimo_contacto);
                  const isSelected = selectedIds.has(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition ${
                        isSelected ? 'bg-amber-50/70 border-l-4 border-l-[#24445C]' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectOne(lead.id, e)}
                          className="w-4 h-4 rounded text-[#24445C] focus:ring-[#24445C] border-slate-300 cursor-pointer accent-[#24445C]"
                        />
                      </td>

                      {/* ID / Nombre */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-slate-400">{lead.id}</span>
                          <span>{lead.nombre}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{lead.telefono}</span>
                        </div>
                      </td>

                      {/* Empresa & Ciudad */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{lead.empresa}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{lead.ciudad}</span>
                        </div>
                      </td>

                      {/* Fase */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          lead.fase === 'Cerrado Ganado'
                            ? 'bg-[#DDEFE3] text-[#1b5e32]'
                            : lead.fase === 'Negociación'
                            ? 'bg-[#FCE2CC] text-[#9e4400]'
                            : lead.fase === 'En Propuesta'
                            ? 'bg-[#FFF0C2] text-[#8a6508]'
                            : lead.fase === 'Interesado'
                            ? 'bg-teal-100 text-teal-800'
                            : lead.fase === 'Perdido'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.fase}
                        </span>
                      </td>

                      {/* Prioridad */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          lead.prioridad === 'URGENTE'
                            ? 'bg-[#F6D7D7] text-[#9e1c1c] border-red-300'
                            : lead.prioridad === 'ALTA'
                            ? 'bg-[#FCE2CC] text-[#9e4400] border-orange-300'
                            : lead.prioridad === 'MEDIA'
                            ? 'bg-[#FFF0C2] text-[#8a6508] border-yellow-300'
                            : 'bg-[#E8EBEF] text-slate-600 border-slate-300'
                        }`}>
                          <span>{lead.prioridad === 'URGENTE' ? '🔴' : lead.prioridad === 'ALTA' ? '🟠' : lead.prioridad === 'MEDIA' ? '🟡' : '⚪'}</span>
                          <span>{lead.prioridad}</span>
                        </span>
                      </td>

                      {/* Semáforo Días */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            days > 15 ? 'bg-red-500 animate-ping' : days > 7 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className={`font-semibold ${
                            days > 15 ? 'text-red-700 font-bold' : days > 7 ? 'text-amber-700' : 'text-slate-700'
                          }`}>
                            {days}d sin contacto
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">Último: {lead.ultimo_contacto}</span>
                      </td>

                      {/* Plataforma & Campaña */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            lead.plataforma === 'Facebook'
                              ? 'bg-blue-100 text-blue-700'
                              : lead.plataforma === 'Instagram'
                              ? 'bg-pink-100 text-pink-700'
                              : lead.plataforma === 'Formulario Web'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {lead.plataforma === 'Facebook' ? 'fb' : lead.plataforma === 'Instagram' ? 'ig' : 'form'}
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[110px] block">
                            {lead.campaign_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">Form: {lead.formulario}</span>
                      </td>

                      {/* Próxima Acción */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 truncate" title={lead.proxima_accion}>
                          {lead.proxima_accion}
                        </p>
                        <span className="text-[10px] font-bold text-slate-500">
                          Fecha: {lead.fecha_proxima_accion}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-[#24445C] transition"
                            title="Ver detalle rápido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenPerfil360(lead)}
                            className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-800 transition"
                            title="Abrir en Ficha Perfil 360°"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition"
                            title="Eliminar Lead individual"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        {leadToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">¿Eliminar Lead?</h3>
                  <p className="text-xs text-slate-500">Se removerá permanentemente de la base.</p>
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
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    ¿Eliminar {selectedIds.size} Leads de forma Masiva?
                  </h3>
                  <p className="text-xs text-red-600 font-semibold">
                    Esta acción es irreversible y eliminará todos los prospectos seleccionados.
                  </p>
                </div>
              </div>

              <div className="bg-red-50/60 border border-red-100 rounded-xl p-3.5 text-xs text-red-900 space-y-2">
                <p>
                  Estás a punto de eliminar <strong>{selectedIds.size} registros</strong> comerciales del CRM. Se removerán permanentemente de la base de datos, del embudo y del seguimiento de tareas.
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
                      onDeleteMultipleLeads(Array.from(selectedIds));
                      setSelectedIds(new Set());
                      setShowBulkDeleteConfirm(false);
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

        {/* Pagination Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Página {currentPage} de {totalPages} • Total: {filteredLeads.length} leads
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-2">{currentPage}</span>
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
