export interface CatalogItem {
  id: string;
  nombre: string;
  descripcion: string;
  color?: string;
  icono?: string;
  sla?: string;
}

export const CATALOGS = {
  fasesComerciales: [
    { id: 'f1', nombre: 'Primer Contacto', descripcion: 'Lead recién captado sin contacto previo establecido.', color: '#24445C', sla: '< 24 horas' },
    { id: 'f2', nombre: 'Contactado', descripcion: 'Se logró comunicación inicial por teléfono o WhatsApp.', color: '#0284c7', sla: '< 48 horas' },
    { id: 'f3', nombre: 'Interesado', descripcion: 'Mostró interés confirmado en referencias o catálogo.', color: '#0d9488', sla: '< 72 horas' },
    { id: 'f4', nombre: 'En Propuesta', descripcion: 'Cotización o propuesta económica personalizada enviada.', color: '#eab308', sla: '< 3 días' },
    { id: 'f5', nombre: 'Negociación', descripcion: 'Ajuste de volúmenes, descuentos o condiciones de pago.', color: '#f97316', sla: '< 48 horas' },
    { id: 'f6', nombre: 'Cerrado Ganado', descripcion: 'Venta concretada, orden generada o anticipo recibido.', color: '#16a34a', sla: 'Inmediato' },
    { id: 'f7', nombre: 'Perdido', descripcion: 'Oportunidad descartada por precio, competencia o desinterés.', color: '#dc2626', sla: 'Revisión mensual' },
    { id: 'f8', nombre: 'Pausado', descripcion: 'Lead temporalmente inactivo a la espera de temporada o presupuesto.', color: '#64748b', sla: 'Reactivar en 30 días' },
  ],

  estadosSeguimiento: [
    { id: 's1', nombre: 'Vencido', descripcion: 'Fecha de próxima acción es anterior a hoy.', color: '#F6D7D7', textColor: '#9e1c1c' },
    { id: 's2', nombre: 'Para Hoy', descripcion: 'Compromiso agendado para la jornada actual.', color: '#FFF0C2', textColor: '#8a6508' },
    { id: 's3', nombre: 'Mañana', descripcion: 'Compromiso planificado para el siguiente día hábil.', color: '#DCE6EF', textColor: '#1b364a' },
    { id: 's4', nombre: 'Completado', descripcion: 'Acción ejecutada y registrada en el historial.', color: '#DDEFE3', textColor: '#1b5e32' },
  ],

  prioridades: [
    { id: 'p1', nombre: 'URGENTE', descripcion: 'Compromiso de compra, pedido en curso o reunión inminente.', color: '#ef4444', icono: '🔴', sla: 'Atención < 4h' },
    { id: 'p2', nombre: 'ALTA', descripcion: 'Interés confirmado, cotización enviada o >5 días sin contacto.', color: '#f97316', icono: '🟠', sla: 'Atención < 24h' },
    { id: 'p3', nombre: 'MEDIA', descripcion: 'Seguimiento estándar en evaluación o exploración de catálogo.', color: '#eab308', icono: '🟡', sla: 'Atención < 48h' },
    { id: 'p4', nombre: 'BAJA', descripcion: 'Lead pausado, frío o en fase de descarte.', color: '#94a3b8', icono: '⚪', sla: 'Atención según ciclo' },
  ],

  canales: [
    { id: 'c1', nombre: 'WhatsApp', icono: '💬', descripcion: 'Mensajería instantánea comercial y envío de catálogos.' },
    { id: 'c2', nombre: 'Llamada', icono: '📞', descripcion: 'Contacto telefónico directo con tomador de decisión.' },
    { id: 'c3', nombre: 'Correo', icono: '✉️', descripcion: 'Envío de cotizaciones formales, contratos y fichas.' },
    { id: 'c4', nombre: 'Reunión Presencial', icono: '🏢', descripcion: 'Visita comercial a tienda, colegio o sede corporativa.' },
    { id: 'c5', nombre: 'Videollamada', icono: '💻', descripcion: 'Sesión virtual de demostración de productos por Meet / Zoom.' },
  ],

  resultados: [
    { id: 'r1', nombre: 'Contactado con éxito', descripcion: 'Se habló con la persona adecuada y se avanzó en la conversación.' },
    { id: 'r2', nombre: 'No contesta', descripcion: 'Timbró sin respuesta o no estuvo disponible.' },
    { id: 'r3', nombre: 'Dejó en visto', descripcion: 'Mensaje leído en WhatsApp sin respuesta tras 24h.' },
    { id: 'r4', nombre: 'Pidió cotización', descripcion: 'Solicitó propuesta económica formal para referencias específicas.' },
    { id: 'r5', nombre: 'Reunión agendada', descripcion: 'Se pactó una cita o videollamada comercial.' },
    { id: 'r6', nombre: 'Venta cerrada', descripcion: 'Aprobó propuesta y solicitó facturación / despacho.' },
    { id: 'r7', nombre: 'Rechazado', descripcion: 'No tiene interés en comercializar o adquirir los productos.' },
  ],

  motivosPerdida: [
    { id: 'm1', nombre: 'Precio alto / Falta de margen', porcentajeTipico: '34%' },
    { id: 'm2', nombre: 'Eligió competidor', porcentajeTipico: '26%' },
    { id: 'm3', nombre: 'Sin presupuesto asignado', porcentajeTipico: '18%' },
    { id: 'm4', nombre: 'No responde / Inubicable', porcentajeTipico: '14%' },
    { id: 'm5', nombre: 'Fuera de zona de cobertura', porcentajeTipico: '8%' },
  ],

  plataformas: [
    { id: 'pl1', nombre: 'Facebook', badgeColor: 'bg-blue-100 text-blue-700 border-blue-200', tag: 'fb', icono: '🔵' },
    { id: 'pl2', nombre: 'Instagram', badgeColor: 'bg-pink-100 text-pink-700 border-pink-200', tag: 'ig', icono: '🩷' },
    { id: 'pl3', nombre: 'Formulario Web', badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200', tag: 'form', icono: '🟣' },
    { id: 'pl4', nombre: 'Manual / Referido', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200', tag: 'manual', icono: '⚙️' },
  ],

  campañas: [
    {
      id: 'c:120247927268690765',
      nombre: 'Retail B2B',
      objetivo: 'Captación de comerciantes mayoristas, papelerías y tiendas con margen 35%-50%.',
      formularios: ['neg 1', 'neg 2', 'neg 3', 'neg 4'],
      estado: 'Activa'
    },
    {
      id: 'c:120247933071910765',
      nombre: 'Colegios Institucional',
      objetivo: 'Dotaciones para comités de compras de colegios privados y kits para temporadas escolares.',
      formularios: ['COL1', 'COL2', 'COL3', 'COL4'],
      estado: 'Activa'
    }
  ],

  tiposNegocio: [
    'Colegio / Institución Educativa',
    'Papelería / Librería',
    'Distribuidor Mayorista',
    'Tienda Retail / Regalos',
    'Empresa Corporativa',
    'Comercio Digital / E-commerce',
    'Otros'
  ],

  necesidades: [
    'Catálogo mayorista con descuento por volumen',
    'Dotación escolar anual de kits personalizados',
    'Distribución regional exclusiva',
    'Material de apoyo y exhibidores para tienda',
    'Reposición inmediata con despacho preferente',
    'Muestras físicas de producto'
  ]
};
