import * as XLSX from 'xlsx';
import { Lead } from '../types';
import { CURRENT_DATE_STRING } from '../utils/helpers';

/**
 * Generates an official Excel (.xlsx) workbook for the "Perfil 360° de KAMU"
 * with two sheets:
 * 1. "Perfil 360° KAMU": The individual executive dossier formatted in structured blocks.
 * 2. "Base Maestra Leads": The full database allowing ID lookup and master record keeping.
 */
export function generatePerfil360Excel(lead: Lead, allLeads: Lead[]): void {
  const wb = XLSX.utils.book_new();

  // Calculate days remaining formula or value
  let diasRestantesText = 'Sin fecha';
  if (lead.fecha_proxima_accion) {
    const today = new Date('2026-10-15');
    const target = new Date(lead.fecha_proxima_accion);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    diasRestantesText = diff < 0 ? `${Math.abs(diff)} días vencido` : diff === 0 ? 'Vence HOY' : `${diff} días restantes`;
  }

  // Format date helper DD/MM/YYYY
  const fmtDate = (d?: string) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return d;
  };

  // 1. Build Perfil 360 individual worksheet
  const p360Rows: any[][] = [
    ['KAMU - SISTEMA INTEGRAL DE GESTIÓN COMERCIAL', '', '', '', '', ''],
    ['FICHA INDIVIDUAL DE CLIENTE: PERFIL 360° DE KAMU', '', '', '', 'ID CLIENTE KAMU:', lead.id],
    ['', '', '', '', 'Fecha Reporte:', fmtDate(CURRENT_DATE_STRING)],
    [],
    ['A. ENCABEZADO DEL PERFIL', '', '', '', '', ''],
    ['Nombre Completo:', lead.nombre, '', 'ID KAMU Principal:', lead.id, ''],
    ['Empresa / Tienda:', lead.empresa || 'No especificada', '', 'Prioridad:', lead.prioridad, ''],
    ['Plataforma de Origen:', lead.plataforma, '', 'Segmento Comercial:', lead.segmento, ''],
    [],
    ['B. RESUMEN COMERCIAL', '', '', '', '', ''],
    ['Fase Comercial:', lead.fase, '', 'Responsable Gestión:', lead.responsable_gestion || 'Shirley Chala (Dir. Comercial)', ''],
    ['Prioridad Asignada:', lead.prioridad, '', 'Estado del Registro:', lead.estado_registro || 'Activo en Seguimiento', ''],
    ['Plataforma:', lead.plataforma, '', 'Probabilidad de Cierre:', `${lead.probabilidad}%`, ''],
    [],
    ['C. INFORMACIÓN DE CONTACTO', '', '', '', '', ''],
    ['Teléfono / WhatsApp:', lead.telefono, '', 'Ciudad Principal:', lead.ciudad, ''],
    ['Correo Electrónico:', lead.email, '', 'Rol del Contacto:', lead.rol_contacto || 'Tomador de Decisión / Compras', ''],
    ['Empresa o Razón Social:', lead.empresa, '', 'Tipo de Formulario:', lead.formulario, ''],
    [],
    ['D. OPORTUNIDAD Y NECESIDAD COMERCIAL', '', '', '', '', ''],
    ['Necesidad / Descripción:', lead.necesidad, '', 'Puntos de Venta:', lead.puntos_venta, ''],
    ['Producto de Interés:', lead.producto_interes || 'Catálogo Mayorista / Kits Escolares', '', 'Presupuesto Estimado:', lead.valor_estimado ? `$ ${lead.valor_estimado.toLocaleString('es-CO')}` : '$ 0', ''],
    ['Señales Registradas:', (lead.señales || []).join(' '), '', 'Motivo de Pérdida:', lead.motivo_perdida || 'N/A (Oportunidad Activa)', ''],
    [],
    ['E. SEGUIMIENTO COMERCIAL Y PRÓXIMA ACCIÓN', '', '', '', '', ''],
    ['Fecha Último Contacto:', fmtDate(lead.ultimo_contacto), '', 'Canal de Contacto:', lead.canal_contacto || 'WhatsApp', ''],
    ['Próxima Acción Programada:', lead.proxima_accion, '', 'Resultado Último Contacto:', lead.resultado_ultimo_contacto || 'Contactado con éxito', ''],
    ['Fecha Próxima Acción:', fmtDate(lead.fecha_proxima_accion), '', 'Días Restantes (Fórmula):', diasRestantesText, ''],
    [],
    ['F. NOTAS E HISTORIAL DE GESTIÓN', '', '', '', '', ''],
    ['Bitácora y Observaciones:', lead.notas, '', '', '', ''],
    [],
    ['G. ORIGEN Y ATRIBUCIÓN DE CAMPAÑA PUBLICITARIA', '', '', '', '', ''],
    ['Nombre de Campaña:', lead.campaign_name, '', 'ID de Campaña:', lead.campaign_id, ''],
    ['Nombre del Anuncio:', lead.anuncio, '', 'Conjunto de Anuncios:', lead.adset, ''],
    ['Formulario de Origen:', lead.formulario, '', 'Fecha de Captación:', fmtDate(lead.fecha_lead), ''],
    ['Ciudad en Formulario:', lead.ciudad_formulario, '', 'Resultado del Cruce:', lead.coincidencia, ''],
    ['Archivos de Origen:', lead.archivos_origen || 'Base_Depurada_2026.xlsx', '', 'ID Original CRM:', lead.id_original_crm || lead.id, ''],
  ];

  const wsPerfil = XLSX.utils.aoa_to_sheet(p360Rows);

  // Column widths for executive presentation
  wsPerfil['!cols'] = [
    { wch: 26 },
    { wch: 36 },
    { wch: 4 },
    { wch: 26 },
    { wch: 34 },
    { wch: 16 }
  ];

  // Set print options for horizontal landscape 1-page fit
  wsPerfil['!pageSetup'] = {
    orientation: 'landscape',
    paperSize: 9, // A4
    fitToWidth: 1,
    fitToHeight: 1
  };

  XLSX.utils.book_append_sheet(wb, wsPerfil, 'Perfil_360_KAMU');

  // 2. Build Base Maestra Leads worksheet
  const masterHeaders = [
    'ID_KAMU',
    'Nombre_Completo',
    'Empresa',
    'Telefono',
    'Email',
    'Ciudad',
    'Segmento',
    'Fase_Comercial',
    'Prioridad',
    'Probabilidad_Pct',
    'Ultimo_Contacto',
    'Proxima_Accion',
    'Fecha_Proxima_Accion',
    'Plataforma',
    'Campana',
    'Campaign_ID',
    'Anuncio',
    'Adset',
    'Formulario',
    'Tipo_Negocio',
    'Puntos_Venta',
    'Necesidad',
    'Fecha_Lead',
    'Ciudad_Formulario',
    'Coincidencia',
    'Valor_Estimado',
    'Notas'
  ];

  const masterRows = allLeads.map(l => [
    l.id,
    l.nombre,
    l.empresa,
    l.telefono,
    l.email,
    l.ciudad,
    l.segmento,
    l.fase,
    l.prioridad,
    l.probabilidad,
    l.ultimo_contacto,
    l.proxima_accion,
    l.fecha_proxima_accion,
    l.plataforma,
    l.campaign_name,
    l.campaign_id,
    l.anuncio,
    l.adset,
    l.formulario,
    l.tipo_negocio,
    l.puntos_venta,
    l.necesidad,
    l.fecha_lead,
    l.ciudad_formulario,
    l.coincidencia,
    l.valor_estimado || 0,
    l.notas
  ]);

  const wsMaster = XLSX.utils.aoa_to_sheet([masterHeaders, ...masterRows]);
  wsMaster['!cols'] = masterHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Base_Maestra_Leads');

  // Trigger browser download
  const fileName = `KAMU_Perfil_360_${lead.id}_${lead.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports all leads to a clean Excel (.xlsx) file
 */
export function exportAllLeadsToExcel(leads: Lead[], filename: string = 'KAMU_CRM_Base_Completa.xlsx'): void {
  const wb = XLSX.utils.book_new();

  const headers = [
    'ID Lead',
    'Nombre',
    'Empresa',
    'Teléfono',
    'Email',
    'Ciudad',
    'Segmento',
    'Fase Comercial',
    'Prioridad',
    'Probabilidad (%)',
    'Último Contacto',
    'Próxima Acción',
    'Fecha Próxima Acción',
    'Plataforma',
    'Campaña',
    'Campaign ID',
    'Anuncio',
    'Adset',
    'Formulario',
    'Tipo de Negocio',
    'Puntos de Venta',
    'Necesidad',
    'Fecha Lead',
    'Coincidencia',
    'Valor Estimado',
    'Notas'
  ];

  const rows = leads.map(l => [
    l.id,
    l.nombre,
    l.empresa,
    l.telefono,
    l.email,
    l.ciudad,
    l.segmento,
    l.fase,
    l.prioridad,
    l.probabilidad,
    l.ultimo_contacto,
    l.proxima_accion,
    l.fecha_proxima_accion,
    l.plataforma,
    l.campaign_name,
    l.campaign_id,
    l.anuncio,
    l.adset,
    l.formulario,
    l.tipo_negocio,
    l.puntos_venta,
    l.necesidad,
    l.fecha_lead,
    l.coincidencia,
    l.valor_estimado || 0,
    l.notas
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map(() => ({ wch: 18 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Base_Depurada_KAMU');
  XLSX.writeFile(wb, filename);
}

/**
 * Parses an uploaded .xlsx or .csv file into Lead records
 */
export async function parseUploadedLeadsFile(file: File, existingCount: number): Promise<Lead[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Use first sheet or 'Base_Maestra_Leads' if present
        const sheetName = workbook.SheetNames.includes('Base_Maestra_Leads')
          ? 'Base_Maestra_Leads'
          : workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonRows || jsonRows.length < 2) {
          throw new Error('El archivo no contiene suficientes filas de datos.');
        }

        const rawHeaders: string[] = jsonRows[0].map((h: any) => String(h || '').trim().toLowerCase());
        const dataRows = jsonRows.slice(1).filter((r: any[]) => r && r.length > 0 && r.some((cell: any) => cell !== undefined && cell !== ''));

        // Identify column indices
        const findIndex = (keywords: string[]) => {
          return rawHeaders.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const idxId = findIndex(['id', 'id lead', 'id_kamu', 'kamu']);
        const idxNombre = findIndex(['nombre', 'cliente', 'contacto']);
        const idxEmpresa = findIndex(['empresa', 'tienda', 'negocio', 'razon']);
        const idxTelefono = findIndex(['telefono', 'tel', 'whatsapp', 'celular']);
        const idxEmail = findIndex(['email', 'correo']);
        const idxCiudad = findIndex(['ciudad', 'municipio']);
        const idxFase = findIndex(['fase', 'etapa']);
        const idxPrioridad = findIndex(['prioridad']);
        const idxPlataforma = findIndex(['plataforma', 'origen', 'fuente']);
        const idxCampana = findIndex(['campana', 'campaña']);
        const idxProximaAccion = findIndex(['proxima accion', 'proxima_accion', 'accion']);
        const idxFechaAccion = findIndex(['fecha proxima', 'fecha_proxima_accion', 'fecha accion']);
        const idxNotas = findIndex(['notas', 'observaciones', 'resumen']);

        const parsedLeads: Lead[] = dataRows.map((row: any[], i: number) => {
          const autoId = `KAMU-${String(existingCount + i + 1).padStart(3, '0')}`;
          const id = (idxId !== -1 && row[idxId]) ? String(row[idxId]).trim() : autoId;
          const nombre = (idxNombre !== -1 && row[idxNombre]) ? String(row[idxNombre]).trim() : `Lead Importado ${i + 1}`;
          const empresa = (idxEmpresa !== -1 && row[idxEmpresa]) ? String(row[idxEmpresa]).trim() : nombre;
          const telefono = (idxTelefono !== -1 && row[idxTelefono]) ? String(row[idxTelefono]).trim() : '+57 300 000 0000';
          const email = (idxEmail !== -1 && row[idxEmail]) ? String(row[idxEmail]).trim() : '';
          const ciudad = (idxCiudad !== -1 && row[idxCiudad]) ? String(row[idxCiudad]).trim() : 'Bogotá';

          const rawFase = (idxFase !== -1 && row[idxFase]) ? String(row[idxFase]).trim() : 'Primer Contacto';
          const fase: any = ['Primer Contacto', 'Contactado', 'Interesado', 'En Propuesta', 'Negociación', 'Cerrado Ganado', 'Perdido', 'Pausado'].includes(rawFase)
            ? rawFase
            : 'Primer Contacto';

          const rawPrio = (idxPrioridad !== -1 && row[idxPrioridad]) ? String(row[idxPrioridad]).trim().toUpperCase() : 'MEDIA';
          const prioridad: any = ['URGENTE', 'ALTA', 'MEDIA', 'BAJA'].includes(rawPrio) ? rawPrio : 'MEDIA';

          const rawPlat = (idxPlataforma !== -1 && row[idxPlataforma]) ? String(row[idxPlataforma]).trim() : 'Formulario Web';
          const plataforma: any = ['Facebook', 'Instagram', 'Formulario Web', 'Manual'].includes(rawPlat) ? rawPlat : 'Formulario Web';

          const campaign_name = (idxCampana !== -1 && row[idxCampana]) ? String(row[idxCampana]).trim() : 'Retail B2B';
          const proxima_accion = (idxProximaAccion !== -1 && row[idxProximaAccion]) ? String(row[idxProximaAccion]).trim() : 'Primer contacto comercial tras importación';
          const fecha_proxima_accion = (idxFechaAccion !== -1 && row[idxFechaAccion]) ? String(row[idxFechaAccion]).trim() : CURRENT_DATE_STRING;
          const notas = (idxNotas !== -1 && row[idxNotas]) ? String(row[idxNotas]).trim() : 'Lead importado mediante archivo externo.';

          return {
            id,
            nombre,
            empresa,
            telefono,
            email,
            ciudad,
            segmento: 'Retail B2B',
            fase,
            prioridad,
            probabilidad: fase === 'Cerrado Ganado' ? 100 : fase === 'En Propuesta' ? 65 : 25,
            ultimo_contacto: CURRENT_DATE_STRING,
            proxima_accion,
            fecha_proxima_accion,
            accion_completada: false,
            notas,
            plataforma,
            campaign_name,
            campaign_id: campaign_name === 'Retail B2B' ? 'c:120247927268690765' : 'c:120247933071910765',
            anuncio: 'Importación Externa',
            adset: 'Base Externa',
            formulario: 'Importado',
            tipo_negocio: 'Distribuidor Mayorista',
            puntos_venta: '1',
            necesidad: 'Cotización inicial',
            fecha_lead: CURRENT_DATE_STRING,
            ciudad_formulario: ciudad,
            coincidencia: 'Nuevo Lead sin Coincidencia',
            señales: ['👀'],
            valor_estimado: 2000000
          };
        });

        resolve(parsedLeads);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
