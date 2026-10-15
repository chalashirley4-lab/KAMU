import { Lead, Interaction, Campaign } from '../types';

// Deterministic seed helper for 281 rich realistic Colombian/LatAm B2B CRM leads
const FIRST_NAMES = [
  'Carlos', 'María', 'Andrés', 'Diana', 'Jorge', 'Patricia', 'Alejandro', 'Laura', 'Felipe', 'Camila',
  'Santiago', 'Paola', 'Juan Pablo', 'Catalina', 'Mateo', 'Valentina', 'Sebastián', 'Carolina', 'Daniel', 'Natalia',
  'Fernando', 'Andrea', 'Ricardo', 'Tatiana', 'Gustavo', 'Lucía', 'Mauricio', 'Adriana', 'Diego', 'Gloria'
];

const LAST_NAMES = [
  'Rodríguez', 'Gómez', 'González', 'Martínez', 'López', 'García', 'Pérez', 'Sánchez', 'Ramírez', 'Hernández',
  'Torres', 'Díaz', 'Vargas', 'Castro', 'Ríos', 'Morales', 'Suárez', 'Ortiz', 'Gutiérrez', 'Mendoza',
  'Castillo', 'Reyes', 'Moreno', 'Jiménez', 'Navarro', 'Salazar', 'Herrera', 'Medina', 'Rojas', 'Peña'
];

const BUSINESS_NAMES = [
  'Distribuidora Central Papelera', 'Librería El Estudiante', 'Colegio San Bartolomé', 'Almacenes El Éxito Escolar',
  'Inversiones Andina B2B', 'Gimnasio Los Cerros', 'Comercializadora Occidente', 'Papelería Moderna Express',
  'Colegio Nueva Granada Sur', 'Suministros Escolares del Caribe', 'Mayorista Santa Fe', 'Liceo Pedagógico Siglo XXI',
  'Mundo Creativo Papelerías', 'Colegio Colombo Británico', 'Distribuciones La 14', 'Instituto Campestre del Saber',
  'Variedades & Regalos La Fontana', 'Kits & Didácticos de Colombia', 'Colegio Gimnasio Campestre', 'Bazar Comercial San Victorino',
  'Dotaciones e Impresos Andinos', 'Cooperativa Multiactiva Docente', 'Colegio San José', 'Papelería La Gran Vía',
  'Distribuciones El Diamante', 'Colegio Montessori del Norte', 'Librería y Útiles Panamericana Regional', 'Comercial Valle SAS'
];

const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Cartagena', 'Manizales', 'Cúcuta', 'Ibagué'];

const SEGMENTS = ['Retail B2B', 'Mayorista', 'Colegios e Institucional', 'Papelería / Librería', 'Tienda de Regalos'];

const CAMPAIGN_1_ID = 'c:120247927268690765';
const CAMPAIGN_1_NAME = 'Retail B2B';
const CAMPAIGN_1_FORMS = ['neg 1', 'neg 2', 'neg 3', 'neg 4'];
const CAMPAIGN_1_ADSETS = ['Conjunto_B2B_Comercio', 'Conjunto_Papelerias_Margen', 'Conjunto_Distribuidores_Regionales'];
const CAMPAIGN_1_ADS = ['Anuncio_Catalogo_B2B_Margen', 'Anuncio_Muestras_Distribuidores', 'Anuncio_Pack_Mayorista_50Off'];

const CAMPAIGN_2_ID = 'c:120247933071910765';
const CAMPAIGN_2_NAME = 'Colegios Institucional';
const CAMPAIGN_2_FORMS = ['COL1', 'COL2', 'COL3', 'COL4'];
const CAMPAIGN_2_ADSETS = ['Conjunto_Directores_Compras', 'Conjunto_Rectores_Instituciones', 'Conjunto_Comites_Padres'];
const CAMPAIGN_2_ADS = ['Anuncio_Kits_Escolares_V1', 'Anuncio_Dotacion_Institucional_2026', 'Anuncio_Agenda_Muestras_Colegios'];

const PROB_BY_PHASE: Record<string, number> = {
  'Primer Contacto': 15,
  'Contactado': 25,
  'Interesado': 45,
  'En Propuesta': 65,
  'Negociación': 80,
  'Cerrado Ganado': 100,
  'Perdido': 0,
  'Pausado': 10,
};

// Today is 2026-10-15 based on metadata
const TODAY_STR = '2026-10-15';

function generate281Leads(): Lead[] {
  const leads: Lead[] = [];

  const phasesPool = [
    'En Propuesta', 'Interesado', 'Negociación', 'Contactado', 'Primer Contacto',
    'Cerrado Ganado', 'Perdido', 'Pausado', 'Interesado', 'En Propuesta',
    'Contactado', 'Primer Contacto', 'Negociación'
  ];

  for (let i = 1; i <= 281; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 11) % LAST_NAMES.length];
    const nombre = `${fn} ${ln}`;
    const empresa = BUSINESS_NAMES[(i * 3) % BUSINESS_NAMES.length] + (i % 5 === 0 ? ` Sucursal ${((i % 4) + 1)}` : '');
    const ciudad = CITIES[(i * 13) % CITIES.length];
    const faseIndex = (i * 5) % phasesPool.length;
    const fase = (i <= 10) ? (['En Propuesta', 'Negociación', 'Interesado', 'En Propuesta', 'Negociación'][i % 5]) as any : phasesPool[faseIndex] as any;
    
    // Campaign assignment (Retail B2B ~ 55%, Colegios Institucional ~ 38%, Directo/Manual ~ 7%)
    let campaign_id = CAMPAIGN_1_ID;
    let campaign_name = CAMPAIGN_1_NAME;
    let formulario = CAMPAIGN_1_FORMS[i % CAMPAIGN_1_FORMS.length];
    let anuncio = CAMPAIGN_1_ADS[i % CAMPAIGN_1_ADS.length];
    let adset = CAMPAIGN_1_ADSETS[i % CAMPAIGN_1_ADSETS.length];
    let plataforma: any = (i % 3 === 0) ? 'Facebook' : (i % 3 === 1) ? 'Instagram' : 'Formulario Web';

    if (i % 10 >= 5 && i % 10 <= 8) {
      campaign_id = CAMPAIGN_2_ID;
      campaign_name = CAMPAIGN_2_NAME;
      formulario = CAMPAIGN_2_FORMS[i % CAMPAIGN_2_FORMS.length];
      anuncio = CAMPAIGN_2_ADS[i % CAMPAIGN_2_ADS.length];
      adset = CAMPAIGN_2_ADSETS[i % CAMPAIGN_2_ADSETS.length];
    } else if (i % 10 === 9) {
      campaign_id = 'c:direct_organic';
      campaign_name = 'Directo / Orgánico';
      formulario = 'Directo';
      anuncio = 'Referido Comercial';
      adset = 'Prospección Manual';
      plataforma = 'Manual';
    }

    const coincidencia: any = (i % 5 === 0) ? 'Nombre Coincidente' : (i % 7 === 0) ? 'Nuevo Lead sin Coincidencia' : 'Nombre Exacto';

    // Dates calculation
    const daysAgoContact = (i * 3) % 25; // 0 to 24 days ago
    const contactDate = new Date(2026, 9, 15 - daysAgoContact); // October is month index 9
    const ultimo_contacto = contactDate.toISOString().slice(0, 10);

    // Next action schedule
    let fecha_proxima_accion = TODAY_STR;
    let accion_completada = false;

    if (i % 4 === 0) {
      // Overdue (e.g., 2026-10-10 to 2026-10-14)
      const daysOverdue = (i % 5) + 1;
      const overdueDate = new Date(2026, 9, 15 - daysOverdue);
      fecha_proxima_accion = overdueDate.toISOString().slice(0, 10);
    } else if (i % 4 === 1) {
      // Today
      fecha_proxima_accion = TODAY_STR;
    } else if (i % 4 === 2) {
      // Tomorrow (2026-10-16)
      fecha_proxima_accion = '2026-10-16';
    } else {
      // Future
      fecha_proxima_accion = `2026-10-${17 + (i % 8)}`;
      if (fase === 'Cerrado Ganado' || (i % 11 === 0)) {
        accion_completada = true;
      }
    }

    // Dynamic signals for Top 50 and hot leads
    const señales: string[] = [];
    if (fase === 'Negociación') señales.push('🤝', '💰');
    if (fase === 'En Propuesta') señales.push('💰', '👀');
    if (fase === 'Interesado') señales.push('👀', '📦');
    if (i % 6 === 0) señales.push('🛒');
    if (i % 8 === 0 && daysAgoContact > 10) señales.push('🔴');
    if (señales.length === 0) señales.push('👀');

    // Priority formula
    let prioridad: any = 'MEDIA';
    if (fase === 'Negociación' || señales.includes('🛒') || (fase === 'En Propuesta' && daysAgoContact > 3)) {
      prioridad = 'URGENTE';
    } else if (fase === 'En Propuesta' || fase === 'Interesado' || daysAgoContact > 7) {
      prioridad = 'ALTA';
    } else if (fase === 'Perdido' || fase === 'Pausado') {
      prioridad = 'BAJA';
    }

    const leadActions = [
      'Llamar para confirmar recepción de cotización enviada',
      'Enviar catálogo B2B con escala de precios por volumen',
      'Agendar reunión virtual de demostración de productos',
      'Definir referencias finales y fechas de despacho',
      'Enviar muestras físicas solicitadas a la sede principal',
      'Hacer seguimiento a aprobación con comité de compras',
      'Validar cupo de crédito y condiciones de pago a 30 días',
      'Cerrar orden de compra y generar remisión'
    ];
    const proxima_accion = leadActions[i % leadActions.length];

    const leadId = `KAMU-${String(i).padStart(3, '0')}`;
    const cleanPhone = `+57 3${10 + (i % 15)} ${String(100 + (i * 37) % 900)} ${String(1000 + (i * 83) % 9000)}`;
    const cleanEmail = `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 10 === 0 ? i : ''}@${empresa.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}.com`;

    const puntos = ['1', '2-5', '6-10', '10+'][i % 4];
    const tipo_negocio = campaign_name === 'Colegios Institucional' 
      ? 'Colegio / Institución Educativa' 
      : ['Papelería / Librería', 'Distribuidor Mayorista', 'Tienda Retail / Regalos', 'Empresa Corporativa'][i % 4];

    const necesidad = campaign_name === 'Colegios Institucional'
      ? 'Dotación escolar anual de kits personalizados'
      : ['Catálogo mayorista con descuento por volumen', 'Distribución regional exclusiva', 'Material de apoyo y exhibidores', 'Reposición inmediata de temporada'][i % 4];

    leads.push({
      id: leadId,
      nombre,
      empresa,
      telefono: cleanPhone,
      email: cleanEmail,
      ciudad,
      segmento: SEGMENTS[i % SEGMENTS.length],
      fase,
      prioridad,
      probabilidad: PROB_BY_PHASE[fase] ?? 20,
      ultimo_contacto,
      proxima_accion,
      fecha_proxima_accion,
      accion_completada,
      notas: `Lead registrado mediante formulario ${formulario}. Interés principal en ${necesidad}. Cuenta con ${puntos} punto(s) de atención en ${ciudad}.`,
      plataforma,
      campaign_name,
      campaign_id,
      anuncio,
      adset,
      formulario,
      tipo_negocio,
      puntos_venta: puntos,
      necesidad,
      fecha_lead: new Date(2026, 9, 15 - daysAgoContact - (i % 12)).toISOString().slice(0, 10),
      ciudad_formulario: ciudad,
      coincidencia,
      señales,
      motivo_perdida: fase === 'Perdido' ? ['Precio alto / Falta de margen', 'Eligió competidor', 'Sin presupuesto asignado', 'No responde / Inubicable'][i % 4] : '',
      valor_estimado: Math.round((1200000 + (i * 450000) % 15000000) / 10000) * 10000,
      rol_contacto: 'Director de Compras / Propietario',
      responsable_gestion: i % 2 === 0 ? 'Shirley Chala (Directora Comercial)' : 'Carlos Mendoza (Asesor Senior)',
      estado_registro: fase === 'Cerrado Ganado' ? 'Cerrado Exitoso' : fase === 'Perdido' ? 'Descartado / Inactivo' : 'Activo en Seguimiento',
      producto_interes: campaign_name === 'Colegios Institucional' ? 'Kits Escolares & Dotaciones 2026' : 'Catálogo Mayorista / Papelería y Útiles',
      canal_contacto: 'WhatsApp',
      resultado_ultimo_contacto: fase === 'Cerrado Ganado' ? 'Venta cerrada' : fase === 'En Propuesta' ? 'Pidió cotización' : 'Contactado con éxito',
      archivos_origen: 'Base_Depurada_2026.xlsx',
      id_original_crm: leadId,
      resultado_cruce: coincidencia
    });
  }

  return leads;
}

export const INITIAL_LEADS: Lead[] = generate281Leads();

export const INITIAL_INTERACTIONS: Interaction[] = [
  {
    id: 'int-001',
    leadId: 'KAMU-001',
    leadNombre: INITIAL_LEADS[0].nombre,
    leadEmpresa: INITIAL_LEADS[0].empresa,
    fecha: '2026-10-15',
    hora: '08:45',
    canal: 'WhatsApp',
    resultado: 'Contactado con éxito',
    resumen: 'Se presentó la escala de descuentos mayoristas del 40% al 48%. El cliente solicitó propuesta formal para 4 puntos de venta.',
    proximaAccion: 'Enviar cotización formal con opciones de entrega en Bogotá',
    fechaProximaAccion: '2026-10-15',
    usuario: 'Shirley Chala (Directora Comercial)'
  },
  {
    id: 'int-002',
    leadId: 'KAMU-002',
    leadNombre: INITIAL_LEADS[1].nombre,
    leadEmpresa: INITIAL_LEADS[1].empresa,
    fecha: '2026-10-15',
    hora: '09:10',
    canal: 'Llamada',
    resultado: 'Reunión agendada',
    resumen: 'Conversación de 12 minutos con la rectora y director de compras. Se acordó reunión virtual para revisar kits escolares 2027.',
    proximaAccion: 'Preparar presentación de kits institucionales y muestras',
    fechaProximaAccion: '2026-10-16',
    usuario: 'Shirley Chala (Directora Comercial)'
  },
  {
    id: 'int-003',
    leadId: 'KAMU-003',
    leadNombre: INITIAL_LEADS[2].nombre,
    leadEmpresa: INITIAL_LEADS[2].empresa,
    fecha: '2026-10-14',
    hora: '15:20',
    canal: 'WhatsApp',
    resultado: 'Pidió cotización',
    resumen: 'Cliente revisó el catálogo B2B de la campaña Retail. Preguntó por pedido mínimo y disponibilidad de exhibidores.',
    proximaAccion: 'Enviar propuesta con combo inicial de exhibidor bonificado',
    fechaProximaAccion: '2026-10-15',
    usuario: 'Carlos Mendoza (Asesor Senior)'
  },
  {
    id: 'int-004',
    leadId: 'KAMU-004',
    leadNombre: INITIAL_LEADS[3].nombre,
    leadEmpresa: INITIAL_LEADS[3].empresa,
    fecha: '2026-10-14',
    hora: '11:00',
    canal: 'Reunión Presencial',
    resultado: 'Venta cerrada',
    resumen: 'Visita presencial a la tienda central. Se firmó orden de compra por $8.500.000 COP con pago 50% anticipo.',
    proximaAccion: 'Enviar orden a logística y remitir factura electrónica',
    fechaProximaAccion: '2026-10-17',
    usuario: 'Shirley Chala (Directora Comercial)'
  },
  {
    id: 'int-005',
    leadId: 'KAMU-008',
    leadNombre: INITIAL_LEADS[7].nombre,
    leadEmpresa: INITIAL_LEADS[7].empresa,
    fecha: '2026-10-13',
    hora: '16:40',
    canal: 'Llamada',
    resultado: 'No contesta',
    resumen: 'Se intentó llamar en 2 oportunidades tras recibir el registro del formulario neg 2. Buzón de voz.',
    proximaAccion: 'Enviar mensaje de WhatsApp con plantilla de primer contacto',
    fechaProximaAccion: '2026-10-15',
    usuario: 'Carlos Mendoza (Asesor Senior)'
  },
  {
    id: 'int-006',
    leadId: 'KAMU-012',
    leadNombre: INITIAL_LEADS[11].nombre,
    leadEmpresa: INITIAL_LEADS[11].empresa,
    fecha: '2026-10-12',
    hora: '14:15',
    canal: 'Correo',
    resultado: 'Contactado con éxito',
    resumen: 'Envío de propuesta institucional para 350 kits de dotación para secundaria. Esperan visto bueno de rectoría.',
    proximaAccion: 'Llamar a verificar recepción y resolver dudas técnicas',
    fechaProximaAccion: '2026-10-15',
    usuario: 'Shirley Chala (Directora Comercial)'
  },
  {
    id: 'int-007',
    leadId: 'KAMU-018',
    leadNombre: INITIAL_LEADS[17].nombre,
    leadEmpresa: INITIAL_LEADS[17].empresa,
    fecha: '2026-10-10',
    hora: '10:30',
    canal: 'WhatsApp',
    resultado: 'Dejó en visto',
    resumen: 'Se envió cotización solicitada. Mensaje leído hace 5 días sin retroalimentación.',
    proximaAccion: 'Enviar plantilla de reactivación respetuosa',
    fechaProximaAccion: '2026-10-15',
    usuario: 'Carlos Mendoza (Asesor Senior)'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: CAMPAIGN_1_ID,
    name: CAMPAIGN_1_NAME,
    code: 'c:120247927268690765',
    leadsCount: 162,
    activeLeads: 138,
    formularios: CAMPAIGN_1_FORMS,
    adsets: CAMPAIGN_1_ADSETS,
    conversionRate: 18.5,
    cplEstimado: 14200,
    presupuesto: 2300000
  },
  {
    id: CAMPAIGN_2_ID,
    name: CAMPAIGN_2_NAME,
    code: 'c:120247933071910765',
    leadsCount: 98,
    activeLeads: 86,
    formularios: CAMPAIGN_2_FORMS,
    adsets: CAMPAIGN_2_ADSETS,
    conversionRate: 24.2,
    cplEstimado: 21500,
    presupuesto: 2100000
  }
];
