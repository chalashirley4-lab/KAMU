import { Lead, Priority } from '../types';

export const CURRENT_DATE_STRING = '2026-10-15';
const CURRENT_DATE = new Date('2026-10-15T00:00:00');

export function getDaysWithoutContact(lastContactDate: string): number {
  if (!lastContactDate) return 99;
  const last = new Date(`${lastContactDate}T00:00:00`);
  const diffTime = CURRENT_DATE.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getTaskScheduleStatus(actionDate: string, completed: boolean): 'Vencido' | 'Hoy' | 'Mañana' | 'Pendiente' | 'Completado' {
  if (completed) return 'Completado';
  if (!actionDate) return 'Pendiente';
  
  if (actionDate < CURRENT_DATE_STRING) return 'Vencido';
  if (actionDate === CURRENT_DATE_STRING) return 'Hoy';
  if (actionDate === '2026-10-16') return 'Mañana';
  return 'Pendiente';
}

export function calculateTop50Score(lead: Lead): number {
  let score = 50;

  // Fase weight
  if (lead.fase === 'Negociación') score += 35;
  else if (lead.fase === 'En Propuesta') score += 28;
  else if (lead.fase === 'Interesado') score += 18;
  else if (lead.fase === 'Contactado') score += 8;
  else if (lead.fase === 'Cerrado Ganado') score -= 30;
  else if (lead.fase === 'Perdido') score -= 50;

  // Signals weight
  if (lead.señales?.includes('🛒')) score += 25; // Cart / order in progress
  if (lead.señales?.includes('🤝')) score += 20; // Meeting agreed
  if (lead.señales?.includes('💰')) score += 18; // Proposal sent
  if (lead.señales?.includes('👀')) score += 10; // High interest
  if (lead.señales?.includes('📦')) score += 12; // Catalog requested
  if (lead.señales?.includes('🔴')) score += 15; // Urgent attention needed

  // Priority weight
  if (lead.prioridad === 'URGENTE') score += 20;
  else if (lead.prioridad === 'ALTA') score += 12;

  // Days without contact: if hot phase and not contacted in >3 days, extra urgency score
  const days = getDaysWithoutContact(lead.ultimo_contacto);
  if (days >= 3 && (lead.fase === 'En Propuesta' || lead.fase === 'Negociación')) {
    score += Math.min(20, days * 2);
  }

  return score;
}

export function formatCOP(amount?: number): string {
  if (amount === undefined || amount === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateForExcel(dateStr?: string): string {
  if (!dateStr) return '';
  // Convert YYYY-MM-DD to DD/MM/YYYY for complete Excel compatibility in Spanish/Latin America
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

/**
 * Exports all leads to a complete CSV file including ALL columns defined in the system
 * with dates formatted as DD/MM/YYYY and UTF-8 BOM for 100% native compatibility with Excel.
 */
export function exportAllLeadsToCompleteCSV(
  leads: Lead[],
  filename: string = `KAMU_Base_Depurada_Completa_${new Date().toISOString().slice(0, 10)}.csv`,
  delimiter: string = ','
): void {
  const headers = [
    'ID Lead',
    'Nombre Completo',
    'Empresa / Tienda',
    'Teléfono / WhatsApp',
    'Correo Electrónico',
    'Ciudad Principal',
    'Segmento Comercial',
    'Fase Comercial',
    'Prioridad',
    'Probabilidad Cierre (%)',
    'Valor Estimado (COP)',
    'Fecha Último Contacto',
    'Días Sin Contacto',
    'Próxima Acción Programada',
    'Fecha Próxima Acción',
    'Estado Acción',
    'Canal de Contacto',
    'Resultado Último Contacto',
    'Responsable de Gestión',
    'Rol del Contacto',
    'Estado del Registro',
    'Plataforma de Origen',
    'Nombre de Campaña',
    'ID de Campaña',
    'Nombre del Anuncio',
    'Conjunto de Anuncios (Adset)',
    'Formulario de Origen',
    'Tipo de Negocio',
    'Puntos de Venta',
    'Necesidad Declarada',
    'Producto de Interés',
    'Fecha de Captación',
    'Ciudad en Formulario',
    'Estado Coincidencia',
    'Señales Registradas',
    'Motivo de Pérdida',
    'Archivos de Origen',
    'ID Original CRM',
    'Notas y Observaciones'
  ];

  const escapeCell = (val: any): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map(l => {
    const days = getDaysWithoutContact(l.ultimo_contacto);
    return [
      escapeCell(l.id),
      escapeCell(l.nombre),
      escapeCell(l.empresa),
      escapeCell(l.telefono),
      escapeCell(l.email),
      escapeCell(l.ciudad),
      escapeCell(l.segmento),
      escapeCell(l.fase),
      escapeCell(l.prioridad),
      escapeCell(`${l.probabilidad}%`),
      escapeCell(l.valor_estimado ? l.valor_estimado : 0),
      escapeCell(formatDateForExcel(l.ultimo_contacto)),
      escapeCell(days),
      escapeCell(l.proxima_accion || ''),
      escapeCell(formatDateForExcel(l.fecha_proxima_accion)),
      escapeCell(l.accion_completada ? 'Completada' : 'Pendiente'),
      escapeCell(l.canal_contacto || 'WhatsApp'),
      escapeCell(l.resultado_ultimo_contacto || 'Contactado con éxito'),
      escapeCell(l.responsable_gestion || 'Equipo Comercial KAMU'),
      escapeCell(l.rol_contacto || 'Tomador de Decisión'),
      escapeCell(l.estado_registro || 'Activo en Seguimiento'),
      escapeCell(l.plataforma),
      escapeCell(l.campaign_name),
      escapeCell(l.campaign_id),
      escapeCell(l.anuncio),
      escapeCell(l.adset),
      escapeCell(l.formulario),
      escapeCell(l.tipo_negocio),
      escapeCell(l.puntos_venta),
      escapeCell(l.necesidad),
      escapeCell(l.producto_interes || 'Catálogo Mayorista / Kits Escolares'),
      escapeCell(formatDateForExcel(l.fecha_lead)),
      escapeCell(l.ciudad_formulario),
      escapeCell(l.coincidencia),
      escapeCell((l.señales || []).join(' ')),
      escapeCell(l.motivo_perdida || 'N/A'),
      escapeCell(l.archivos_origen || 'Base_Depurada.xlsx'),
      escapeCell(l.id_original_crm || l.id),
      escapeCell(l.notas || '')
    ].join(delimiter);
  });

  const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(delimiter);
  // Add UTF-8 BOM (\uFEFF) to guarantee Excel opens characters and accents seamlessly
  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportLeadsToCSV(leads: Lead[], filename: string = 'KAMU_CRM_Base_Depurada_9Col.csv', delimiter: string = ',') {
  // Columns matching Base_Depurada original 9 columns formatted for Excel
  const headers = [
    '1. ID Lead',
    '2. Nombre Completo / Empresa',
    '3. Teléfono',
    '4. Email',
    '5. Ciudad',
    '6. Fase Comercial',
    '7. Prioridad',
    '8. Último Contacto',
    '9. Próxima Acción'
  ];

  const escapeCell = (val: any): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map(l => [
    escapeCell(l.id),
    escapeCell(l.empresa ? `${l.nombre} (${l.empresa})` : l.nombre),
    escapeCell(l.telefono),
    escapeCell(l.email),
    escapeCell(l.ciudad),
    escapeCell(l.fase),
    escapeCell(l.prioridad),
    escapeCell(formatDateForExcel(l.ultimo_contacto)),
    escapeCell(l.proxima_accion || '')
  ].join(delimiter));

  const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(delimiter);
  const csvString = '\uFEFF' + [headerRow, ...rows].join('\r\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getCSVString(leads: Lead[]): string {
  const headers = [
    'ID Lead',
    'Nombre Completo / Empresa',
    'Teléfono',
    'Email',
    'Ciudad',
    'Fase Comercial',
    'Prioridad',
    'Último Contacto',
    'Próxima Acción',
    'Plataforma',
    'Campaña',
    'Formulario'
  ];

  const rows = leads.map(l => [
    l.id,
    `"${(l.empresa ? `${l.nombre} - ${l.empresa}` : l.nombre).replace(/"/g, '""')}"`,
    `"${l.telefono}"`,
    `"${l.email}"`,
    `"${l.ciudad}"`,
    `"${l.fase}"`,
    `"${l.prioridad}"`,
    `"${formatDateForExcel(l.ultimo_contacto)}"`,
    `"${(l.proxima_accion || '').replace(/"/g, '""')}"`,
    `"${l.plataforma}"`,
    `"${l.campaign_name}"`,
    `"${l.formulario}"`
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}
