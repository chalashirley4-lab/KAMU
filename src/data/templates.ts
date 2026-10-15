import { CommercialTemplate } from '../types';

export const COMMERCIAL_TEMPLATES: CommercialTemplate[] = [
  {
    id: 'tpl-1',
    titulo: '1. Primer Contacto Comercial Formal',
    categoria: 'Primer Contacto',
    icono: '👋',
    descripcion: 'Mensaje de presentación corporativa formal tras registrarse en campaña publicitaria.',
    asunto: 'KAMU | Solución comercial y catálogo mayorista para {EMPRESA}',
    cuerpo: `Hola {NOMBRE}, un gusto saludarte. Te escribe el equipo comercial de KAMU.

Notamos tu interés a través de nuestra campaña sobre nuestras soluciones y productos para {EMPRESA}. Queremos brindarte atención personalizada y entender las necesidades comerciales de tus puntos de venta en {CIUDAD}.

¿Tendrías 5 minutos hoy o mañana para una breve llamada o prefieres que te enviemos nuestro catálogo mayorista directamente por aquí?

Quedo muy atento a tu respuesta.
¡Excelente día!`,
    variables: ['{NOMBRE}', '{EMPRESA}', '{CIUDAD}']
  },
  {
    id: 'tpl-2',
    titulo: '2. Seguimiento Post-Catálogo',
    categoria: 'Seguimiento',
    icono: '📚',
    descripcion: 'Revisión con el cliente tras 24-48 horas de haber recibido el catálogo o portafolio.',
    asunto: 'KAMU | ¿Pudiste revisar nuestro catálogo mayorista?',
    cuerpo: `Hola {NOMBRE}, ¿cómo estás? Te saluda nuevamente tu asesor comercial en KAMU.

Te compartí nuestro catálogo de productos hace un par de días y quería saber si tuviste oportunidad de revisarlo. Me gustaría saber qué líneas de producto o referencias llamaron más tu atención para prepararte una cotización con nuestra escala de descuentos por volumen.

¿Te gustaría que revisemos juntos las opciones más rentables para {EMPRESA}?`,
    variables: ['{NOMBRE}', '{EMPRESA}']
  },
  {
    id: 'tpl-3',
    titulo: '3. Manejo de Objeción de Precio',
    categoria: 'Negociación',
    icono: '💡',
    descripcion: 'Respuesta estratégica ante dudas sobre precios, destacando rentabilidad y garantías.',
    asunto: 'KAMU | Alternativas de volumen y rentabilidad para {EMPRESA}',
    cuerpo: `Hola {NOMBRE}, comprendo totalmente tu punto respecto a la inversión. Es una variable clave en cualquier negocio.

En KAMU trabajamos con márgenes comerciales que oscilan entre el 35% y el 52% para nuestros distribuidores y clientes institucionales, además de contar con garantía de rotación y respaldo en entregas en {CIUDAD}. 

Podemos estructurar una orden inicial con condiciones escalonadas o un paquete de prueba para que verifiques la rotación sin comprometer tu flujo de caja. ¿Te parecería bien que te arme esa alternativa?`,
    variables: ['{NOMBRE}', '{CIUDAD}', '{EMPRESA}']
  },
  {
    id: 'tpl-4',
    titulo: '4. Confirmación de Reunión Comercial',
    categoria: 'Primer Contacto',
    icono: '📅',
    descripcion: 'Recordatorio y enlace para llamada o reunión virtual agendada.',
    asunto: 'Confirmación de reunión KAMU & {EMPRESA}',
    cuerpo: `Hola {NOMBRE}, un gusto saludarte.

Te confirmo nuestra reunión agendada para el día de hoy a las {HORA} para revisar la propuesta comercial de KAMU para {EMPRESA}.

El objetivo es definir las referencias ideales para tu necesidad de {NECESIDAD} y coordinar tiempos de entrega.

Si requieres invitar a alguien de tu equipo de compras, con gusto lo sumamos. ¡Nos vemos en breve!`,
    variables: ['{NOMBRE}', '{EMPRESA}', '{HORA}', '{NECESIDAD}']
  },
  {
    id: 'tpl-5',
    titulo: '5. Envío de Información y Fichas Técnicas',
    categoria: 'Seguimiento',
    icono: '📄',
    descripcion: 'Acompañamiento a cotización o dossier técnico con especificaciones.',
    asunto: 'KAMU | Fichas técnicas y propuesta comercial solicitada',
    cuerpo: `Hola {NOMBRE}, espero que te encuentres muy bien.

Adjunto a este mensaje encontrarás la información detallada que conversamos:
1. Catálogo con especificaciones técnicas y materiales.
2. Lista de precios preferenciales según el volumen estimado para {EMPRESA}.
3. Políticas de despacho y tiempos de entrega para {CIUDAD}.

Cualquier duda puntual sobre alguna referencia, me tienes a tu completa disposición.`,
    variables: ['{NOMBRE}', '{EMPRESA}', '{CIUDAD}']
  },
  {
    id: 'tpl-6',
    titulo: '6. Reactivación de Lead Frío (>15 Días)',
    categoria: 'Seguimiento',
    icono: '🔄',
    descripcion: 'Retomar contacto respetuoso con prospectos pausados o sin respuesta.',
    asunto: 'KAMU | ¿Seguimos adelante con la propuesta de {EMPRESA}?',
    cuerpo: `Hola {NOMBRE}, ¿cómo va todo? Espero que estés teniendo una excelente semana.

Hace unos días conversamos sobre {NECESIDAD} para {EMPRESA}. Sé que en la gestión diaria surgen muchas prioridades, por lo que quería confirmar si este proyecto sigue en pie para este mes o si prefieres que retomemos contacto en otra fecha.

Estamos cerrando programación de despachos para {CIUDAD} y me encantaría poder reservarte las condiciones preferenciales que acordamos.`,
    variables: ['{NOMBRE}', '{EMPRESA}', '{NECESIDAD}', '{CIUDAD}']
  },
  {
    id: 'tpl-7',
    titulo: '7. Cierre de Venta y Datos de Facturación',
    categoria: 'Cierre',
    icono: '🤝',
    descripcion: 'Paso final para formalizar orden de compra y generar orden de despacho.',
    asunto: 'KAMU | Formalización de orden y despacho para {EMPRESA}',
    cuerpo: `¡Excelente noticia {NOMBRE}! Estamos listos para poner en marcha el pedido de {EMPRESA}.

Para emitir la orden oficial y apartar el inventario, te solicito amablemente me compartas los siguientes datos:
- Razón Social / Nombre Completo:
- NIT / Cédula:
- Dirección exacta de entrega en {CIUDAD}:
- Persona y teléfono de contacto para recepción:
- Correo electrónico para facturación:

Una vez recibido, te enviamos el comprobante y el número de guía de seguimiento. ¡Muchas gracias por confiar en KAMU!`,
    variables: ['{NOMBRE}', '{EMPRESA}', '{CIUDAD}']
  },
  {
    id: 'tpl-8',
    titulo: '8. Agradecimiento y Bienvenida Post-Venta',
    categoria: 'Cierre',
    icono: '🎉',
    descripcion: 'Fidelización inmediata y apertura de canal permanente de soporte.',
    asunto: '¡Bienvenido a la red comercial de KAMU!',
    cuerpo: `Hola {NOMBRE}, queremos darte una cordial bienvenida a la familia comercial de KAMU.

Tu pedido ya se encuentra en fase de alistamiento y empaque. Estaré acompañándote en todo momento para garantizar que la entrega en {CIUDAD} sea impecable.

Recuerda que cuentas conmigo como tu ejecutivo de cuenta asignado para cualquier reposición, material de apoyo en punto de venta o nuevas solicitudes. ¡Éxitos totales con los productos!`,
    variables: ['{NOMBRE}', '{CIUDAD}']
  },
  {
    id: 'tpl-9',
    titulo: '9. Seguimiento de Propuesta Pendiente',
    categoria: 'Seguimiento',
    icono: '💰',
    descripcion: 'Recordatorio oportuno para propuestas comerciales enviadas.',
    asunto: 'KAMU | Seguimiento a la propuesta económica presentada',
    cuerpo: `Hola {NOMBRE}, un gusto saludarte.

Quería consultar si el comité o equipo de compras de {EMPRESA} ya tuvo la oportunidad de evaluar la propuesta económica que les enviamos. 

Tenemos disponibilidad inmediata para atender su requerimiento de {NECESIDAD} y podemos ajustar términos de entrega o formas de pago si fuera necesario para ajustarnos a sus políticas internas.

¿Cómo podemos avanzar hoy?`,
    variables: ['{NOMBRE}', '{EMPRESA}', '{NECESIDAD}']
  },
  {
    id: 'tpl-10',
    titulo: '10. Bienvenida Campaña Retail B2B',
    categoria: 'Campañas',
    icono: '🏬',
    descripcion: 'Enfocado exclusivamente a leads captados por campaña Retail B2B (c:120247927268690765).',
    asunto: 'KAMU B2B | Tu solicitud de catálogo mayorista y márgenes comerciales',
    cuerpo: `Hola {NOMBRE}, recibimos tu formulario de registro en nuestra campaña Retail B2B. ¡Bienvenido!

Sabemos que para tu negocio {EMPRESA} la rentabilidad, la calidad y el cumplimiento en entregas son lo más importante. Por eso diseñamos un modelo de distribución con alta rotación y márgenes de hasta el 50%.

Te dejo aquí nuestro portafolio de temporada y la tabla de precios para distribuidores. ¿Te interesaría agendar una breve videollamada para mostrarte las referencias de mayor demanda?`,
    variables: ['{NOMBRE}', '{EMPRESA}']
  },
  {
    id: 'tpl-11',
    titulo: '11. Seguimiento Campaña Colegios e Institucional',
    categoria: 'Campañas',
    icono: '🎓',
    descripcion: 'Enfocado a directivos, coordinadores y colegios (c:120247933071910765).',
    asunto: 'KAMU Institucional | Solución de kits y dotación para {EMPRESA}',
    cuerpo: `Apreciado/a {NOMBRE}, directiva de {EMPRESA}.

Agradecemos su interés en el programa de dotación y kits de KAMU a través de nuestra campaña para Colegios e Instituciones Educativas.

Contamos con experiencia dotando a más de 120 instituciones con kits personalizados, materiales certificados y entregas programadas con beneficios especiales por volumen y financiación a 30 días.

¿Sería posible coordinar un espacio de 15 minutos para presentarles las muestras físicas y la cotización institucional para el periodo académico?`,
    variables: ['{NOMBRE}', '{EMPRESA}']
  }
];
