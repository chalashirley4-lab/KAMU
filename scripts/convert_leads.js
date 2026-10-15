const fs = require('fs');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ';' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

const csv = fs.readFileSync('./src/data/raw_leads.csv', 'utf8');
const rows = parseCSV(csv);
const headers = rows[0];
const dataRows = rows.slice(1);

const leads = [];
const interactions = [];

let intCounter = 1;

dataRows.forEach((r, idx) => {
  const id = (r[0] || `KAMU-${String(idx + 1).padStart(3, '0')}`).trim();
  
  // Name
  let rawName = (r[1] || r[41] || r[71] || '').trim().replace(/\r?\n/g, ' ');
  if (!rawName || rawName === '- - -' || rawName === '-') {
    const n2 = (r[2] || '').trim();
    const ap = (r[3] || '').trim();
    if (n2 || ap) {
      rawName = `${n2} ${ap}`.trim();
    } else if (r[10] && r[10] !== 'PENDIENTE') {
      rawName = r[10].trim();
    } else {
      rawName = `Contacto ${id}`;
    }
  }
  const nombre = rawName;

  // Phone
  let rawPhone = (r[73] || r[4] || r[42] || r[54] || '').trim();
  if (rawPhone.startsWith('p:')) rawPhone = rawPhone.replace('p:', '').trim();
  const telefono = rawPhone;

  // Email
  let rawEmail = (r[72] || r[5] || r[40] || r[55] || '').trim().toLowerCase();
  const email = rawEmail;

  // Segment
  let rawSeg = (r[12] || r[44] || r[74] || r[37] || '').trim();
  let segmento = 'Comercio Minorista';
  if (/distribuidor/i.test(rawSeg)) segmento = 'Distribuidor Mayorista';
  else if (/bar/i.test(rawSeg) || /escolar/i.test(rawSeg) || /colegio/i.test(rawSeg) || /institucion/i.test(rawSeg) || /institución/i.test(rawSeg)) segmento = 'Bar Escolar / Institucional';
  else if (/minimarket/i.test(rawSeg)) segmento = 'Minimarket';
  else if (/alimentaci/i.test(rawSeg) || /catering/i.test(rawSeg)) segmento = 'Empresa de Alimentación';
  else if (/delicatessen/i.test(rawSeg)) segmento = 'Delicatessen';
  else if (/maquila/i.test(rawSeg)) segmento = 'Marca Privada / Maquila';
  else if (/consumo/i.test(rawSeg) || /consumidor/i.test(rawSeg)) segmento = 'Consumidor Final';
  else if (rawSeg && rawSeg !== 'PENDIENTE' && rawSeg !== 'Otro' && rawSeg !== 'otro') segmento = rawSeg;

  // Company / Store
  let rawEmpresa = (r[11] || '').trim();
  if (!rawEmpresa || rawEmpresa === 'PENDIENTE') {
    if (segmento === 'Distribuidor Mayorista') rawEmpresa = `Distribuciones ${nombre.split(' ')[0]}`;
    else if (segmento === 'Bar Escolar / Institucional') rawEmpresa = `Bar Escolar ${nombre.split(' ')[0]}`;
    else if (segmento === 'Minimarket') rawEmpresa = `Minimarket ${nombre.split(' ')[0]}`;
    else if (segmento === 'Empresa de Alimentación') rawEmpresa = `Servicios de Alimentación ${nombre.split(' ')[0]}`;
    else rawEmpresa = `Comercial ${nombre}`;
  }
  const empresa = rawEmpresa;

  // City
  let rawCity = (r[77] || r[13] || r[60] || r[48] || '').trim();
  if (!rawCity || rawCity === 'PENDIENTE') {
    rawCity = 'Quito';
  }
  const ciudad = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);

  // Consolidated notes
  const noteParts = [
    r[8], r[15], r[16], r[17], r[18], r[19], r[20], r[21], r[22], r[23], r[24], r[25], r[66], r[67], r[68], r[69]
  ].map(s => (s || '').trim()).filter(Boolean);
  const notas = Array.from(new Set(noteParts)).join(' | ');

  // Phase calculation
  let fase = 'Contactado';
  const allNotesLower = notas.toLowerCase();
  
  if (r[6] === 'Perdido' || /perdido/i.test(r[14]) || /perdido/i.test(r[21]) || /perdido/i.test(r[22]) || /perdido/i.test(r[23]) || allNotesLower.includes('perdido')) {
    fase = 'Perdido';
  } else if (allNotesLower.includes('completo la venta') || allNotesLower.includes('despachado') || allNotesLower.includes('pedido ya fue despachado')) {
    fase = 'Cerrado Ganado';
  } else if (r[6] === 'Propuesta en curso' || /negociaci/i.test(r[14]) || allNotesLower.includes('analizando la propuesta') || allNotesLower.includes('propuesta')) {
    fase = 'En Propuesta';
  } else if (/interesad/i.test(r[14]) || allNotesLower.includes('está interesado') || allNotesLower.includes('esta interesado') || allNotesLower.includes('solicito catalogo') || allNotesLower.includes('solicitó una caja') || allNotesLower.includes('pedido de 20 cajas')) {
    fase = 'Interesado';
  } else if (/nuevo/i.test(r[14])) {
    fase = 'Primer Contacto';
  } else {
    fase = 'Contactado';
  }

  // Motivo de perdida
  let motivo_perdida = undefined;
  if (fase === 'Perdido') {
    if (allNotesLower.includes('precio') || allNotesLower.includes('caro') || allNotesLower.includes('precios muy altos')) {
      motivo_perdida = 'Precio alto / Falta de margen en canal';
    } else if (allNotesLower.includes('consumo personal') || allNotesLower.includes('consumidor')) {
      motivo_perdida = 'Buscaba compra al detalle / Consumo personal';
    } else if (allNotesLower.includes('credito') || allNotesLower.includes('crédito')) {
      motivo_perdida = 'Solicitó crédito en primera compra';
    } else if (allNotesLower.includes('aceite') || allNotesLower.includes('natural')) {
      motivo_perdida = 'Requerimiento específico de formulación / Sin aceite';
    } else {
      motivo_perdida = 'Sin respuesta a llamadas ni WhatsApp';
    }
  }

  // Signals
  const señales = [];
  if (allNotesLower.includes('caja') || allNotesLower.includes('pedido') || allNotesLower.includes('despachado') || allNotesLower.includes('compra')) señales.push('🛒');
  if (/distribuidor/i.test(segmento) || (r[75] && parseInt(r[75]) > 1) || (r[38] && parseInt(r[38]) > 1) || allNotesLower.includes('puntos')) señales.push('📦');
  if (allNotesLower.includes('reunión') || allNotesLower.includes('reunion') || allNotesLower.includes('respondió llamada') || allNotesLower.includes('respondio llamada')) señales.push('🤝');
  if (allNotesLower.includes('catalogo') || allNotesLower.includes('catálogo') || allNotesLower.includes('precio') || allNotesLower.includes('cotización') || allNotesLower.includes('costo')) señales.push('💰');
  if (allNotesLower.includes('revisión') || allNotesLower.includes('revision') || allNotesLower.includes('analizando') || allNotesLower.includes('revisaría')) señales.push('👀');
  if (allNotesLower.includes('urgente') || allNotesLower.includes('lunes') || allNotesLower.includes('objeción') || allNotesLower.includes('objecion') || allNotesLower.includes('precios muy altos')) señales.push('🔴');
  if (señales.length === 0) señales.push('👀');

  // Priority
  let prioridad = 'MEDIA';
  if (fase === 'Cerrado Ganado' || allNotesLower.includes('reunion con ale') || allNotesLower.includes('pedido de 20 cajas') || (señales.includes('🔴') && señales.includes('💰'))) {
    prioridad = 'URGENTE';
  } else if (fase === 'En Propuesta' || fase === 'Interesado' || señales.includes('🛒') || señales.includes('💰')) {
    prioridad = 'ALTA';
  } else if (fase === 'Perdido') {
    prioridad = 'BAJA';
  } else {
    prioridad = (idx % 2 === 0) ? 'MEDIA' : 'ALTA';
  }

  // Probability
  let probabilidad = 25;
  if (fase === 'Cerrado Ganado') probabilidad = 100;
  else if (fase === 'En Propuesta') probabilidad = 60;
  else if (fase === 'Interesado') probabilidad = 45;
  else if (fase === 'Contactado') probabilidad = 25;
  else if (fase === 'Primer Contacto') probabilidad = 15;
  else if (fase === 'Perdido') probabilidad = 0;

  // Platform
  let plataforma = 'Manual';
  const rawPlat = (r[49] || r[36] || '').toLowerCase();
  if (rawPlat.includes('ig') || rawPlat.includes('instagram')) plataforma = 'Instagram';
  else if (rawPlat.includes('fb') || rawPlat.includes('facebook')) plataforma = 'Facebook';
  else if (r[51] || r[33] || r[64]) plataforma = 'Formulario Web';
  else plataforma = 'Manual';

  // Campaign
  const rawCamp = (r[63] || r[50] || r[32] || '').toLowerCase();
  let campaign_name = 'Seguimiento Directo / Orgánico';
  let campaign_id = '';
  if (rawCamp.includes('retail') || r[31] === 'c:120247927268690765') {
    campaign_name = 'Retail B2B';
    campaign_id = 'c:120247927268690765';
  } else if (rawCamp.includes('colegio') || r[31] === 'c:120247933071910765') {
    campaign_name = 'Colegios Institucional';
    campaign_id = 'c:120247933071910765';
  }

  // Form
  const formulario = (r[64] || r[79] || r[51] || r[34] || (campaign_name === 'Retail B2B' ? 'Formulario B2B retail' : campaign_name === 'Colegios Institucional' ? 'Formulario Colegio - Institucional' : 'Contacto Directo')).trim();

  // Match status
  let coincidencia = 'Nuevo Lead sin Coincidencia';
  if ((r[52] && r[52].includes('Coincidencia')) || (r[81] && r[81].includes('Coincidencia')) || (r[64] && r[64].includes(';'))) {
    coincidencia = 'Nombre Coincidente';
  } else if (r[33] || r[51] || r[70]) {
    coincidencia = 'Nombre Exacto';
  }

  // Last contact date
  let ultimo_contacto = '2026-10-01';
  if (r[69] || r[25]) ultimo_contacto = '2026-10-15';
  else if (r[68]) ultimo_contacto = '2026-10-14';
  else if (r[67] || r[24]) ultimo_contacto = '2026-10-13';
  else if (r[23]) ultimo_contacto = '2026-10-06';
  else if (r[20]) ultimo_contacto = '2026-10-02';
  else if (r[19]) ultimo_contacto = '2026-10-01';
  else if (r[17] || r[18]) ultimo_contacto = '2026-09-29';
  else if (r[70]) ultimo_contacto = r[70].split('T')[0] || '2026-09-28';
  else if (r[9]) ultimo_contacto = r[9].split(' ')[0] || '2026-09-25';

  // Next action
  let proxima_accion = 'Llamada de seguimiento comercial';
  let fecha_proxima_accion = '2026-10-15';
  let accion_completada = false;

  if (allNotesLower.includes('reunion') || allNotesLower.includes('reunión')) {
    proxima_accion = 'Coordinar reunión comercial virtual con gerencia';
    fecha_proxima_accion = '2026-10-15';
  } else if (allNotesLower.includes('seguimiento de catalogo') || allNotesLower.includes('seguimiento de catálogo')) {
    proxima_accion = 'Llamar para verificar revisión de catálogo y precios';
    fecha_proxima_accion = '2026-10-15';
  } else if (allNotesLower.includes('llamar lunes')) {
    proxima_accion = 'Llamar para seguimiento de volumen y propuesta';
    fecha_proxima_accion = '2026-10-12'; // Vencido
  } else if (allNotesLower.includes('pidieron solo whatsapp') || allNotesLower.includes('whatsapp')) {
    proxima_accion = 'Enviar mensaje de seguimiento con catálogo actualizado por WhatsApp';
    fecha_proxima_accion = '2026-10-16'; // Mañana
  } else if (fase === 'Cerrado Ganado') {
    proxima_accion = 'Seguimiento de entrega de pedido y logística';
    fecha_proxima_accion = '2026-10-15';
    accion_completada = true;
  } else if (fase === 'Perdido') {
    proxima_accion = 'Archivar en base depurada / Reactivación trimestral';
    fecha_proxima_accion = '2026-10-30';
    accion_completada = true;
  } else {
    // Distribute among Overdue (Vencidos), Hoy, Mañana
    const mod = idx % 4;
    if (mod === 0) {
      fecha_proxima_accion = '2026-10-06'; // Vencido
      proxima_accion = 'Llamar para retomar contacto comercial';
    } else if (mod === 1) {
      fecha_proxima_accion = '2026-10-12'; // Vencido
      proxima_accion = 'Llamar para confirmar cotización pendiente';
    } else if (mod === 2) {
      fecha_proxima_accion = '2026-10-15'; // Hoy
      proxima_accion = 'Llamar hoy para seguimiento de catálogo';
    } else {
      fecha_proxima_accion = '2026-10-16'; // Mañana
      proxima_accion = 'Programar envío de propuesta personalizada';
    }
  }

  // Estimated deal value in COP
  let valor_estimado = 1500000;
  if (segmento === 'Distribuidor Mayorista') valor_estimado = 8500000;
  else if (segmento === 'Bar Escolar / Institucional') valor_estimado = 4200000;
  else if (segmento === 'Minimarket') valor_estimado = 2800000;
  else if (segmento === 'Empresa de Alimentación') valor_estimado = 6000000;
  else if (segmento === 'Delicatessen') valor_estimado = 3200000;
  else valor_estimado = 1200000;

  // Contact Role
  let rol_contacto = (r[45] || r[57] || '').trim();
  if (!rol_contacto) {
    if (segmento === 'Distribuidor Mayorista') rol_contacto = 'Gerente de Distribución';
    else if (segmento === 'Bar Escolar / Institucional') rol_contacto = 'Administrador de Bar';
    else rol_contacto = 'Propietario / Administrador';
  }

  // Product of interest
  let producto_interes = 'Portafolio Snacks KAMU';
  if (allNotesLower.includes('yuca')) producto_interes = 'Chips de Yuca Crocantes';
  else if (allNotesLower.includes('perejil')) producto_interes = 'Mayonesa de Perejil';
  else if (allNotesLower.includes('40g') || allNotesLower.includes('muestras')) producto_interes = 'Presentación Personal 40g';
  else if (allNotesLower.includes('caja')) producto_interes = 'Caja Mix Surtida Mayorista';
  else if (segmento === 'Bar Escolar / Institucional') producto_interes = 'Kits Escolares Saludables';

  leads.push({
    id,
    nombre,
    empresa,
    telefono,
    email,
    ciudad,
    segmento,
    fase,
    prioridad,
    probabilidad,
    ultimo_contacto,
    proxima_accion,
    fecha_proxima_accion,
    accion_completada,
    notas: notas || 'Lead registrado desde formulario de campaña.',
    plataforma,
    campaign_name,
    campaign_id,
    anuncio: r[28] || r[27] || '',
    adset: r[30] || r[29] || '',
    formulario,
    tipo_negocio: r[74] || r[37] || segmento,
    puntos_venta: r[75] || r[38] || r[58] || '1',
    necesidad: r[76] || r[39] || r[59] || 'Evaluación de proveedores',
    fecha_lead: (r[70] ? r[70].split('T')[0] : (r[9] ? r[9].split(' ')[0] : '2026-09-25')),
    ciudad_formulario: r[77] || r[60] || ciudad,
    coincidencia,
    señales,
    motivo_perdida,
    valor_estimado,
    rol_contacto,
    responsable_gestion: (idx % 2 === 0) ? 'Shirley Chala (Directora Comercial)' : 'Carlos Mendoza (Asesor Senior)',
    estado_registro: 'Depurado',
    producto_interes,
    canal_contacto: allNotesLower.includes('llamada') ? 'Llamada' : 'WhatsApp',
    resultado_ultimo_contacto: fase === 'Cerrado Ganado' ? 'Venta cerrada' : (fase === 'Perdido' ? 'Rechazado' : (allNotesLower.includes('no contesta') || allNotesLower.includes('sin respuesta') ? 'No contesta' : 'Contactado con éxito')),
    archivos_origen: r[64] || r[51] || 'Base Comercial KAMU',
    id_original_crm: id,
    resultado_cruce: r[52] || r[81] || 'Verificado en Base Depurada'
  });

  // Extract interactions for key leads
  if (noteParts.length > 0) {
    noteParts.forEach((np, nIdx) => {
      if (np.length > 5 && nIdx < 3) {
        interactions.push({
          id: `int-${String(intCounter++).padStart(3, '0')}`,
          leadId: id,
          leadNombre: nombre,
          leadEmpresa: empresa,
          fecha: ultimo_contacto,
          hora: `${9 + (nIdx * 2)}:30`,
          canal: np.toLowerCase().includes('llamada') ? 'Llamada' : 'WhatsApp',
          resultado: np.toLowerCase().includes('no contesta') || np.toLowerCase().includes('sin respuesta') ? 'No contesta' : (np.toLowerCase().includes('interesad') ? 'Pidió cotización' : 'Contactado con éxito'),
          resumen: np,
          proximaAccion: proxima_accion,
          fechaProximaAccion: fecha_proxima_accion,
          usuario: (idx % 2 === 0) ? 'Shirley Chala (Directora Comercial)' : 'Carlos Mendoza (Asesor Senior)'
        });
      }
    });
  }
});

console.log('Processed leads count:', leads.length);
console.log('Processed interactions count:', interactions.length);

const outTS = `import { Lead, Interaction, Campaign } from '../types';

export const INITIAL_LEADS: Lead[] = ${JSON.stringify(leads, null, 2)};

export const INITIAL_INTERACTIONS: Interaction[] = ${JSON.stringify(interactions.slice(0, 150), null, 2)};

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c:120247927268690765',
    name: 'Retail B2B',
    code: 'c:120247927268690765',
    leadsCount: ${leads.filter(l => l.campaign_name === 'Retail B2B').length},
    activeLeads: ${leads.filter(l => l.campaign_name === 'Retail B2B' && l.fase !== 'Perdido').length},
    formularios: ['Formulario B2B retail', 'neg 1', 'neg 2', 'neg 3'],
    adsets: ['Nuevo conjunto de anuncios de Clientes potenciales-Retail B2B-sep 2026'],
    conversionRate: 14.5,
    cplEstimado: 18200,
    presupuesto: 2300000
  },
  {
    id: 'c:120247933071910765',
    name: 'Colegios Institucional',
    code: 'c:120247933071910765',
    leadsCount: ${leads.filter(l => l.campaign_name === 'Colegios Institucional').length},
    activeLeads: ${leads.filter(l => l.campaign_name === 'Colegios Institucional' && l.fase !== 'Perdido').length},
    formularios: ['Formulario Colegio - Institucional', 'COL1', 'Colegios_2'],
    adsets: ['Nuevo conjunto de anuncios de Clientes potenciales - Colegios - Institucional - sep 2026'],
    conversionRate: 18.2,
    cplEstimado: 22400,
    presupuesto: 2100000
  }
];
`;

fs.writeFileSync('./src/data/initialData.ts', outTS, 'utf8');
console.log('Successfully wrote ./src/data/initialData.ts');
