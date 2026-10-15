import React, { useState } from 'react';
import { Library, CheckCircle2, AlertCircle, Clock, ShieldCheck, Tag, Layers } from 'lucide-react';
import { CATALOGS } from '../data/catalogs';

export const CatalogsView: React.FC = () => {
  const [activeCatalogTab, setActiveCatalogTab] = useState<
    'fases' | 'estados' | 'prioridades' | 'canales' | 'resultados' | 'motivos' | 'plataformas' | 'campañas' | 'segmentos'
  >('fases');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-extrabold text-[#24445C] flex items-center gap-2">
          <Library className="w-5 h-5 text-[#24445C]" />
          <span>Catálogos & Diccionario Operativo Comercial</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Taxonomía estandarizada, tiempos máximos de respuesta (SLA) y valores normalizados de KAMU.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'fases', label: 'Fases Comerciales' },
          { id: 'estados', label: 'Estados de Seguimiento' },
          { id: 'prioridades', label: 'Prioridades & SLA' },
          { id: 'canales', label: 'Canales de Contacto' },
          { id: 'resultados', label: 'Resultados de Gestión' },
          { id: 'motivos', label: 'Motivos de Pérdida' },
          { id: 'plataformas', label: 'Plataformas & Redes' },
          { id: 'campañas', label: 'Campañas & Formularios' },
          { id: 'segmentos', label: 'Tipos de Negocio' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCatalogTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeCatalogTab === tab.id
                ? 'bg-[#24445C] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        {/* Fases */}
        {activeCatalogTab === 'fases' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Ciclo de Vida Comercial (8 Fases)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATALOGS.fasesComerciales.map((fase) => (
                <div key={fase.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                  <div className="w-3.5 h-3.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: fase.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{fase.nombre}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        SLA: {fase.sla}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{fase.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estados */}
        {activeCatalogTab === 'estados' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Estados de la Agenda & Semáforos Visuales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATALOGS.estadosSeguimiento.map((est) => (
                <div key={est.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: est.color, borderColor: '#e2e8f0' }}>
                  <div>
                    <h3 className="font-black text-sm" style={{ color: est.textColor }}>{est.nombre}</h3>
                    <p className="text-xs text-slate-700 mt-0.5">{est.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prioridades */}
        {activeCatalogTab === 'prioridades' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Prioridades & Acuerdos de Nivel de Servicio (SLA)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATALOGS.prioridades.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                  <span className="text-xl">{p.icono}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-900">{p.nombre}</h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#24445C] text-white">
                        {p.sla}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canales */}
        {activeCatalogTab === 'canales' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Canales Oficiales de Contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CATALOGS.canales.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <span className="text-2xl">{c.icono}</span>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-800">{c.nombre}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        {activeCatalogTab === 'resultados' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Resultados de Interacciones Comerciales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATALOGS.resultados.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-xs text-slate-800">{r.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{r.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivos */}
        {activeCatalogTab === 'motivos' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Motivos Tipificados de Pérdida
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATALOGS.motivosPerdida.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-red-900">{m.nombre}</span>
                  <span className="text-xs font-black text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
                    {m.porcentajeTipico} incidencia
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plataformas */}
        {activeCatalogTab === 'plataformas' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Plataformas y Redes de Captación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATALOGS.plataformas.map((pl) => (
                <div key={pl.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pl.icono}</span>
                    <span className="font-extrabold text-xs text-slate-800">{pl.nombre}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${pl.badgeColor}`}>
                    Badge: {pl.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campañas */}
        {activeCatalogTab === 'campañas' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Estructura Oficial de Campañas y Formularios
            </h2>
            <div className="space-y-3">
              {CATALOGS.campañas.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm text-[#24445C]">{c.nombre}</h3>
                    <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      ID: {c.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{c.objetivo}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500">Formularios mapeados:</span>
                    {c.formularios.map(f => (
                      <span key={f} className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Segmentos */}
        {activeCatalogTab === 'segmentos' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#24445C] uppercase tracking-wider">
              Tipos de Negocio & Necesidades Comerciales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Tipos de Negocio</h3>
                <ul className="space-y-1 text-xs">
                  {CATALOGS.tiposNegocio.map(t => (
                    <li key={t} className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                      • {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Necesidades Declaradas</h3>
                <ul className="space-y-1 text-xs">
                  {CATALOGS.necesidades.map(n => (
                    <li key={n} className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                      • {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
