import React, { useRef, useState } from 'react';
import {
  WarningCircle,
  CheckCircle,
  DownloadSimple,
  MicrosoftExcelLogo,
  Stack,
  CircleNotch,
  Syringe,
  UploadSimple,
} from '@phosphor-icons/react';
import { Modal } from '../Establecimientos/components';
import { Vacuna } from '../../types';
import { COMPONENT_STYLES } from './constants';

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
      title="Importar Movimientos"
      subtitle="Carga controlada desde excel, con plantilla y resumen de resultados."
      icon={MicrosoftExcelLogo}
      size="lg"
      footer={
        !mostrarResultado ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className={COMPONENT_STYLES.button.secondary}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImportar}
              disabled={!canImport || isImportingExcel}
              className={COMPONENT_STYLES.button.primary}
            >
              {isImportingExcel ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <UploadSimple className="h-4 w-4" weight="bold" />}
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
              className={COMPONENT_STYLES.button.secondary}
            >
              Importar otro
            </button>
            <button
              type="button"
              onClick={handleClose}
              className={COMPONENT_STYLES.button.primary}
            >
              Cerrar
            </button>
          </div>
        )
      }
    >
      {!mostrarResultado ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setTipoImportacion('vacuna');
                resetForm();
              }}
              className={`rounded-xl border p-5 text-left transition-colors duration-200 ${
                tipoImportacion === 'vacuna'
                  ? 'border-brand-100 bg-surface-soft'
                  : 'border-line bg-white hover:border-line-strong hover:bg-surface-soft'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border ${tipoImportacion === 'vacuna' ? 'border-line-focus bg-[#f3f0ff] text-brand' : 'border-line bg-surface-soft text-muted-2'}`}>
                  <Syringe className="h-5 w-5" weight={tipoImportacion === 'vacuna' ? 'fill' : 'duotone'} />
                </div>
                <span className={`text-[0.95rem] font-bold tracking-tight ${tipoImportacion === 'vacuna' ? 'text-zinc-900' : 'text-zinc-600'}`}>Por vacuna</span>
              </div>
              <p className="mt-3 text-sm text-zinc-500 leading-relaxed">Carga controlada para una vacuna específica. Ideal para envíos focales.</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoImportacion('masivo');
                resetForm();
              }}
              className={`rounded-xl border p-5 text-left transition-colors duration-200 ${
                tipoImportacion === 'masivo'
                  ? 'border-brand-100 bg-surface-soft'
                  : 'border-line bg-white hover:border-line-strong hover:bg-surface-soft'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border ${tipoImportacion === 'masivo' ? 'border-line-focus bg-[#f3f0ff] text-brand' : 'border-line bg-surface-soft text-muted-2'}`}>
                  <Stack className="h-5 w-5" weight={tipoImportacion === 'masivo' ? 'fill' : 'duotone'} />
                </div>
                <span className={`text-[0.95rem] font-bold tracking-tight ${tipoImportacion === 'masivo' ? 'text-zinc-900' : 'text-zinc-600'}`}>Masivo</span>
              </div>
              <p className="mt-3 text-sm text-zinc-500 leading-relaxed">Procesa todas las vacunas del archivo en un solo flujo maestro.</p>
            </button>
          </section>

          <section className="grid gap-4 rounded-xl border border-line bg-surface-soft p-5 sm:grid-cols-2">
            {tipoImportacion === 'vacuna' ? (
              <label className="sm:col-span-2">
                <span className={COMPONENT_STYLES.input.label}>Vacuna Destino</span>
                <select
                  value={selectedVacuna}
                  onChange={(event) => setSelectedVacuna(event.target.value)}
                  className={COMPONENT_STYLES.input.base}
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
              <span className={COMPONENT_STYLES.input.label}>Año de Ejecución</span>
              <select
                value={selectedAnio}
                onChange={(event) => setSelectedAnio(parseInt(event.target.value, 10))}
                className={COMPONENT_STYLES.input.base}
              >
                {[2024, 2025, 2026].map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded-xl border border-line bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[0.95rem] font-bold text-zinc-900 tracking-tight">Paso 1. Descargar plantilla</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Obtén el formato base estandarizado para completar los datos fuera de línea.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDescargarPlantilla}
                disabled={isDownloadingTemplate || !canDownload}
                className={COMPONENT_STYLES.button.secondary}
              >
                {isDownloadingTemplate ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <DownloadSimple className="h-4 w-4" weight="bold" />}
                <span>Descargar plantilla</span>
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-5">
            <div>
              <p className="text-[0.95rem] font-bold text-zinc-900 tracking-tight">Paso 2. Subir archivo completo</p>
              <p className="mt-1 text-sm text-zinc-500">Asegúrate de no alterar las cabeceras del formato original.</p>
            </div>
            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface-soft px-6 py-10 text-center transition hover:border-brand-100 hover:bg-[#f8f5ff]">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-white text-muted-2">
                <UploadSimple className="h-6 w-6" weight="duotone" />
              </div>
              <p className="text-[0.95rem] font-bold tracking-tight text-zinc-900">
                {archivo ? archivo.name : 'Haz clic para explorar archivos'}
              </p>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">.xlsx / .xls únicamente</p>
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
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-soft px-5 py-4">
            <CheckCircle className="h-6 w-6 text-brand" weight="fill" />
            <h3 className="text-[0.95rem] font-bold text-zinc-900 tracking-tight">Proceso de Importación Completado</h3>
          </div>

          {tipoImportacion === 'vacuna' ? (
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-white p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Filas Creadas</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{resultadoImportacion?.creadas || 0}</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Filas Actualizadas</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{resultadoImportacion?.actualizadas || 0}</p>
              </div>
            </section>
          ) : (
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-white p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Creadas</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{resultadoImportacion?.totalCreadas || 0}</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Actualizadas</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{resultadoImportacion?.totalActualizadas || 0}</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Vacunas Prcsds.</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{resultadoImportacion?.vacunasProcesadas || 0}</p>
              </div>
            </section>
          )}

          {hasErrors ? (
            <section className="mt-4 rounded-xl border border-rose-200 bg-rose-50/50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <WarningCircle className="h-5 w-5 text-rose-600" weight="duotone" />
                  <p className="text-[0.95rem] font-bold text-rose-900 tracking-tight">
                    {tipoImportacion === 'vacuna'
                      ? `${resultadoImportacion?.errores?.length || 0} anomalías detectadas`
                      : `${resultadoImportacion?.erroresPorVacuna?.length || 0} vacunas con observaciones`}
                  </p>
                </div>
                {tipoImportacion === 'masivo' && onGenerarReporteErrores && resultadoImportacion?.erroresPorVacuna ? (
                  <button
                    type="button"
                    onClick={() => onGenerarReporteErrores(resultadoImportacion.erroresPorVacuna || [])}
                    className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-white border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-50 hover:border-rose-300"
                  >
                    <DownloadSimple className="h-4 w-4" weight="bold" />
                    <span>Descargar Log</span>
                  </button>
                ) : null}
              </div>

              <div className="mt-4 max-h-40 overflow-y-auto space-y-2 text-sm text-rose-800 bg-white/50 rounded-xl p-4 border border-rose-100">
                {tipoImportacion === 'vacuna'
                  ? resultadoImportacion?.errores?.map((error, index) => (
                      <p key={`${error}-${index}`} className="flex gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{error}</span>
                      </p>
                    ))
                  : resultadoImportacion?.erroresPorVacuna?.map((item, index) => (
                      <div key={`${item.vacuna}-${index}`} className="mb-2">
                        <p className="font-bold text-rose-900">{item.vacuna}:</p>
                        <p className="ml-3 text-rose-700 opacity-90">{item.errores.length} errores registrados.</p>
                      </div>
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
