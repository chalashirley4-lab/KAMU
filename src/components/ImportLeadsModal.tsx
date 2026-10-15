import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Lead } from '../types';
import { parseUploadedLeadsFile } from '../services/excelExportService';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (newLeads: Lead[]) => void;
  existingCount: number;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
  existingCount,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setErrorMessage(null);

    try {
      const results = await parseUploadedLeadsFile(file, existingCount);
      setParsedLeads(results);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al procesar el archivo. Verifica que sea un formato Excel (.xlsx) o CSV válido.');
      setParsedLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedLeads.length === 0) return;
    onImportLeads(parsedLeads);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#24445C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <Upload className="w-5 h-5 text-[#FFF0C2]" />
            </div>
            <div>
              <h2 className="text-base font-bold">Importar Leads a KAMU CRM</h2>
              <p className="text-xs text-[#DCE6EF]/80">Cargar prospectos desde archivos Excel (.xlsx) o CSV</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#24445C] transition bg-slate-50">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#DCE6EF] text-[#24445C] flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-sm text-[#24445C]">
                {selectedFile ? selectedFile.name : 'Haz clic para seleccionar o arrastra tu archivo'}
              </span>
              <span className="text-slate-400 text-xs">Formatos compatibles: .xlsx, .xls, .csv</span>
            </label>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-[#24445C]" />
              <span>Analizando columnas y registros del archivo...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Table if parsed */}
          {parsedLeads.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Previsualización ({parsedLeads.length} leads detectados para importar)
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  Estructura Válida
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2">ID Asignado</th>
                      <th className="p-2">Nombre Lead</th>
                      <th className="p-2">Empresa</th>
                      <th className="p-2">Teléfono</th>
                      <th className="p-2">Ciudad</th>
                      <th className="p-2">Fase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedLeads.slice(0, 10).map((l, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-[#24445C]">{l.id}</td>
                        <td className="p-2 font-semibold text-slate-800">{l.nombre}</td>
                        <td className="p-2 text-slate-600">{l.empresa}</td>
                        <td className="p-2 text-slate-600 font-mono">{l.telefono}</td>
                        <td className="p-2 text-slate-600">{l.ciudad}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                            {l.fase}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedLeads.length > 10 && (
                <p className="text-[11px] text-slate-400 italic">
                  Mostrando los primeros 10 de {parsedLeads.length} registros analizados.
                </p>
              )}
            </div>
          )}

          {/* Help box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">Reglas de calidad de datos KAMU:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>El ID de KAMU se mantiene como identificador principal sin duplicarse.</li>
              <li>Los campos vacíos permanecen vacíos, sin inventar datos inexistentes.</li>
              <li>Se conservan los datos originales de campaña, ciudad y formulario.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedLeads.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-[#24445C] hover:bg-[#1b364a] disabled:opacity-40 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            <span>Confirmar e Importar ({parsedLeads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
