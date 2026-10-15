import React, { useState } from 'react';
import { MessageSquareText, Copy, Check, Sparkles, Filter, Mail, MessageCircle } from 'lucide-react';
import { COMMERCIAL_TEMPLATES } from '../data/templates';
import { CommercialTemplate } from '../types';

export const TemplatesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic variable preview fields
  const [previewValues, setPreviewValues] = useState({
    '{NOMBRE}': 'Juan Pérez',
    '{EMPRESA}': 'Distribuidora Santa Fe',
    '{CIUDAD}': 'Bogotá',
    '{HORA}': '10:30 AM',
    '{NECESIDAD}': 'Catálogo mayorista y kits',
  });

  const categories = ['Todas', 'Primer Contacto', 'Seguimiento', 'Negociación', 'Cierre', 'Campañas'];

  const filteredTemplates = selectedCategory === 'Todas'
    ? COMMERCIAL_TEMPLATES
    : COMMERCIAL_TEMPLATES.filter(t => t.categoria === selectedCategory);

  const getPopulatedText = (text: string) => {
    let result = text;
    Object.entries(previewValues).forEach(([key, val]) => {
      result = result.replaceAll(key, val);
    });
    return result;
  };

  const handleCopy = (template: CommercialTemplate) => {
    const textToCopy = getPopulatedText(template.cuerpo);
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(template.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#24445C] flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-[#24445C]" />
            <span>11 Plantillas Comerciales de Comunicación</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mensajes estandarizados y probados para WhatsApp y correo comercial. Copia en un clic o personaliza variables.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#DCE6EF] text-[#24445C] px-3 py-1.5 rounded-lg">
          11 Plantillas Listas
        </span>
      </div>

      {/* Variables Quick Customizer */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#24445C]">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Personalizar Variables Dinámicas para Copia Inmediata</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nombre ({'{NOMBRE}'})</label>
            <input
              type="text"
              value={previewValues['{NOMBRE}']}
              onChange={(e) => setPreviewValues(p => ({ ...p, '{NOMBRE}': e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Empresa ({'{EMPRESA}'})</label>
            <input
              type="text"
              value={previewValues['{EMPRESA}']}
              onChange={(e) => setPreviewValues(p => ({ ...p, '{EMPRESA}': e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Ciudad ({'{CIUDAD}'})</label>
            <input
              type="text"
              value={previewValues['{CIUDAD}']}
              onChange={(e) => setPreviewValues(p => ({ ...p, '{CIUDAD}': e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Hora ({'{HORA}'})</label>
            <input
              type="text"
              value={previewValues['{HORA}']}
              onChange={(e) => setPreviewValues(p => ({ ...p, '{HORA}': e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Necesidad ({'{NECESIDAD}'})</label>
            <input
              type="text"
              value={previewValues['{NECESIDAD}']}
              onChange={(e) => setPreviewValues(p => ({ ...p, '{NECESIDAD}': e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#24445C] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isCopied = copiedId === template.id;
          const populatedText = getPopulatedText(template.cuerpo);

          return (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-[#24445C] transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl p-2 rounded-xl bg-slate-100 border border-slate-200">
                      {template.icono}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#24445C]">{template.titulo}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {template.categoria}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(template)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#FFF0C2] hover:bg-[#ffe699] text-[#8a6508]'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? '¡Copiado!' : 'Copiar Mensaje'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500">{template.descripcion}</p>

                {template.asunto && (
                  <div className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700">
                    <strong className="text-slate-500">Asunto correo:</strong> {getPopulatedText(template.asunto)}
                  </div>
                )}

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
                  {populatedText}
                </div>
              </div>

              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Variables: {template.variables.join(', ')}</span>
                <span className="text-slate-600 font-semibold">Listo para WhatsApp</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
