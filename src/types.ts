export type LeadPhase = 
  | 'Primer Contacto'
  | 'Contactado'
  | 'Interesado'
  | 'En Propuesta'
  | 'Negociación'
  | 'Cerrado Ganado'
  | 'Perdido'
  | 'Pausado';

export type Priority = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA';

export type Platform = 'Facebook' | 'Instagram' | 'Formulario Web' | 'Manual';

export type MatchStatus = 'Nombre Exacto' | 'Nombre Coincidente' | 'Nuevo Lead sin Coincidencia';

export type ContactChannel = 'WhatsApp' | 'Llamada' | 'Correo' | 'Reunión Presencial' | 'Videollamada';

export type ContactResult = 
  | 'Contactado con éxito'
  | 'No contesta'
  | 'Dejó en visto'
  | 'Pidió cotización'
  | 'Reunión agendada'
  | 'Venta cerrada'
  | 'Rechazado';

export interface Lead {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  ciudad: string;
  segmento: string;
  fase: LeadPhase;
  prioridad: Priority;
  probabilidad: number; // 0 - 100
  ultimo_contacto: string; // YYYY-MM-DD
  proxima_accion: string;
  fecha_proxima_accion: string; // YYYY-MM-DD
  accion_completada: boolean;
  notas: string;
  plataforma: Platform;
  campaign_name: string;
  campaign_id: string;
  anuncio: string;
  adset: string;
  formulario: string;
  tipo_negocio: string;
  puntos_venta: string;
  necesidad: string;
  fecha_lead: string; // YYYY-MM-DD
  ciudad_formulario: string;
  coincidencia: MatchStatus;
  señales: string[]; // e.g. ['🛒', '📦', '🤝', '💰', '👀', '🔴']
  motivo_perdida?: string;
  valor_estimado?: number;
  // Perfil 360° KAMU fields
  rol_contacto?: string;
  responsable_gestion?: string;
  estado_registro?: string;
  producto_interes?: string;
  canal_contacto?: ContactChannel;
  resultado_ultimo_contacto?: ContactResult;
  archivos_origen?: string;
  id_original_crm?: string;
  resultado_cruce?: string;
}

export interface Interaction {
  id: string;
  leadId: string;
  leadNombre: string;
  leadEmpresa: string;
  fecha: string;
  hora: string;
  canal: ContactChannel;
  resultado: ContactResult;
  resumen: string;
  proximaAccion: string;
  fechaProximaAccion: string;
  usuario: string;
}

export interface Campaign {
  id: string;
  name: string;
  code: string;
  leadsCount: number;
  activeLeads: number;
  formularios: string[];
  adsets: string[];
  conversionRate: number;
  cplEstimado: number;
  presupuesto: number;
}

export interface CommercialTemplate {
  id: string;
  titulo: string;
  categoria: 'Primer Contacto' | 'Seguimiento' | 'Negociación' | 'Cierre' | 'Campañas';
  icono: string;
  descripcion: string;
  asunto?: string;
  cuerpo: string;
  variables: string[];
}
