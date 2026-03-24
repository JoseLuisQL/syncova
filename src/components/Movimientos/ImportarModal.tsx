import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Layers,
  Loader2,
  Syringe,
  Upload,
} from 'lucide-react';
import { Modal } from '../Establecimientos/components';
import { Vacuna } from '../../types';

interface ImportarModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacunas: Vacuna[];
  onDescargarPlantillaVacuna: (vacunaId: string, anio: number) => Promise<boolean>;
  onDescargarPlantillaMasiva: (anio: number) => Promise<boolean>;
  onImportarVacuna: (vacunaId: string, anio: number, archivo: File) => Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  } | null>;
  onImportarMasivo: (anio: number, archivo: File) => Promise<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
  } | null>;
  onGenerarReporteErrores?: (erroresPorVacuna: { vacuna: string; errores: string[] }[]) => Promise<boolean>;
  isDownloadingTemplate: boolean;
  isImportingExcel: boolean;
}

type TipoImportacion = 'vacuna' | 'masivo';

const ImportarModal: React.FC<ImportarModalProps> = ({
  isOpen,
  onClose,
  vacunas,
  onDescargarPlantillaVacuna,
  onDescargarPlantillaMasiva,
  onImportarVacuna,
  onImportarMasivo,
  onGenerarReporteErrores,
  isDownloadingTemplate,
  isImportingExcel,
}) => {
  const [tipoImportacion, setTipoImportacion] = useState<TipoImportacion>('vacuna');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultadoImportacion, setResultadoImportacion] = useState<{
    creadas?: number;
    actualizadas?: number;
    errores?: string[];
    totalCreadas?: number;
    totalActualizadas?: number;
    erroresPorVacuna?: { vacuna: string; errores: string[] }[];
    vacunasProcesadas?: number;
  } | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivo(file);
      setResultadoImportacion(null);
      setMostrarResultado(false);
    }
  };

  const handleDescargarPlantilla = async () => {
    if (tipoImportacion === 'vacuna' && !selectedVacuna) return;

    const success =
      tipoImportacion === 'vacuna'
        ? await onDescargarPlantillaVacuna(selectedVacuna, selectedAnio)
        : await onDescargarPlantillaMasiva(selectedAnio);

    if (!success) {
      console.error('Error al descargar plantilla');
    }
  };

  const handleImportar = async () => {
    if (!archivo) return;
    if (tipoImportacion === 'vacuna' && !selectedVacuna) return;

    const resultado =
      tipoImportacion === 'vacuna'
        ? await onImportarVacuna(selectedVacuna, selectedAnio, archivo)
        : await onImportarMasivo(selectedAnio, archivo);

    if (resultado) {
      setResultadoImportacion(resultado);
      setMostrarResultado(true);
    }
  };

  const resetForm = () => {
    setArchivo(null);
    setResultadoImportacion(null);
    setMostrarResultado(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canDownload = tipoImportacion === 'masivo' || Boolean(selectedVacuna);
  const canImport = Boolean(archivo) && (tipoImportacion === 'masivo' || Boolean(selectedVacuna));
  const hasErrors =
    (tipoImportacion === 'vacuna' && Boolean(resultadoImportacion?.errores?.length)) ||
    (tipoImportacion === 'masivo' && Boolean(resultadoImportacion?.erroresPorVacuna?.length));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar movimientos"
      subtitle="Carga controlada desde Excel, con plantilla y resumen de resultados."
      icon={FileSpreadsheet}
      size="lg"
      footer={
        !mostrarResultado ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImportar}
              disabled={!canImport || isImportingExcel}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImportingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isImportingExcel ? 'Importando...' : 'Importar'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setMostrarResultado(false);
                resetForm();
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Importar otro
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-700"
            >
              Cerrar
            </button>
          </div>
        )
      }
    >
      {!mostrarResultado ? (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setTipoImportacion('vacuna');
                resetForm();
              }}
              className={`rounded-[20px] border p-4 text-left transition ${
                tipoImportacion === 'vacuna'
                  ? 'border-teal-200 bg-teal-50/80'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Syringe className={`h-4 w-4 ${tipoImportacion === 'vacuna' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-900">Por vacuna</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Carga controlada para una vacuna específica.</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoImportacion('masivo');
                resetForm();
              }}
              className={`rounded-[20px] border p-4 text-left transition ${
                tipoImportacion === 'masivo'
                  ? 'border-teal-200 bg-teal-50/80'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className={`h-4 w-4 ${tipoImportacion === 'masivo' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-900">Masivo</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Procesa todas las vacunas del archivo en un solo flujo.</p>
            </button>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            {tipoImportacion === 'vacuna' ? (
              <label className="sm:col-span-2">
                <span className="mb-1 block text-[0.84rem] font-medium text-slate-700">Vacuna</span>
                <select
                  value={selectedVacuna}
                  onChange={(event) => setSelectedVacuna(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/18"
                >
                  <option value="">Seleccione una vacuna</option>
                  {vacunas.map((vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      {vacuna.nombre}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className={tipoImportacion === 'masivo' ? 'sm:col-span-2' : ''}>
              <span className="mb-1 block text-[0.84rem] font-medium text-slate-700">Año</span>
              <select
                value={selectedAnio}
                onChange={(event) => setSelectedAnio(parseInt(event.target.value, 10))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/18"
              >
                {[2024, 2025, 2026].map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Paso 1. Descargar plantilla</p>
                <p className="mt-1 text-sm text-slate-500">
                  Completa los campos del archivo respetando el formato entregado.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDescargarPlantilla}
                disabled={isDownloadingTemplate || !canDownload}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloadingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Descargar plantilla</span>
              </button>
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Paso 2. Subir archivo</p>
            <p className="mt-1 text-sm text-slate-500">Selecciona un archivo `.xlsx` o `.xls` previamente completado.</p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center transition hover:border-teal-300 hover:bg-teal-50/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-teal-600">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {archivo ? archivo.name : 'Haz clic para seleccionar el archivo'}
              </p>
              <p className="text-xs text-slate-500">Solo se aceptan archivos de Excel.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </section>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Importación completada</h3>
          </div>

          {tipoImportacion === 'vacuna' ? (
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Creados</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-900">{resultadoImportacion?.creadas || 0}</p>
              </div>
              <div className="rounded-[18px] border border-teal-200 bg-teal-50 px-4 py-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Actualizados</p>
                <p className="mt-1 text-2xl font-semibold text-teal-900">{resultadoImportacion?.actualizadas || 0}</p>
              </div>
            </section>
          ) : (
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Creados</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-900">{resultadoImportacion?.totalCreadas || 0}</p>
              </div>
              <div className="rounded-[18px] border border-teal-200 bg-teal-50 px-4 py-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Actualizados</p>
                <p className="mt-1 text-2xl font-semibold text-teal-900">{resultadoImportacion?.totalActualizadas || 0}</p>
              </div>
              <div className="rounded-[18px] border border-cyan-200 bg-cyan-50 px-4 py-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Vacunas</p>
                <p className="mt-1 text-2xl font-semibold text-cyan-900">{resultadoImportacion?.vacunasProcesadas || 0}</p>
              </div>
            </section>
          )}

          {hasErrors ? (
            <section className="rounded-[22px] border border-rose-200 bg-rose-50/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <p className="text-sm font-semibold text-rose-900">
                    {tipoImportacion === 'vacuna'
                      ? `${resultadoImportacion?.errores?.length || 0} errores encontrados`
                      : `${resultadoImportacion?.erroresPorVacuna?.length || 0} vacunas con errores`}
                  </p>
                </div>
                {tipoImportacion === 'masivo' && onGenerarReporteErrores && resultadoImportacion?.erroresPorVacuna ? (
                  <button
                    type="button"
                    onClick={() => onGenerarReporteErrores(resultadoImportacion.erroresPorVacuna || [])}
                    className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-rose-600 hover:to-red-600"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Generar reporte</span>
                  </button>
                ) : null}
              </div>

              <div className="mt-3 max-h-32 overflow-y-auto space-y-1 text-sm text-rose-700">
                {tipoImportacion === 'vacuna'
                  ? resultadoImportacion?.errores?.slice(0, 5).map((error, index) => (
                      <p key={`${error}-${index}`}>• {error}</p>
                    ))
                  : resultadoImportacion?.erroresPorVacuna?.slice(0, 4).map((item, index) => (
                      <p key={`${item.vacuna}-${index}`}>• {item.vacuna}: {item.errores.length} errores</p>
                    ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </Modal>
  );
};

export default ImportarModal;
