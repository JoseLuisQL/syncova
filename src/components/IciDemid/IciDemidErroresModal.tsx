import React from 'react';
import { Warning, WarningCircle, X } from '@phosphor-icons/react';
import { IciDemidImportPreview } from '../../types';
import { COMPONENT_STYLES } from '../Planificacion/constants';

interface IciDemidErroresModalProps {
  isOpen: boolean;
  onClose: () => void;
  errores: IciDemidImportPreview | null;
}

const IciDemidErroresModal: React.FC<IciDemidErroresModalProps> = ({ isOpen, onClose, errores }) => {
  if (!isOpen || !errores) return null;

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className={COMPONENT_STYLES.modal.containerLarge}>
        <div className={`${COMPONENT_STYLES.modal.panel} max-w-5xl`}>
          <div className={COMPONENT_STYLES.modal.header}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <WarningCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Errores encontrados en la importación</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Se detectaron inconsistencias en el Excel. Revisa la fila, el valor y el motivo exacto antes de volver a importar.
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.ghost}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`${COMPONENT_STYLES.modal.body} space-y-4`}>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-600">Errores detectados</p>
                <p className="mt-2 text-2xl font-bold text-rose-700">{errores.erroresDetalle?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-600">Establecimientos no mapeados</p>
                <p className="mt-2 text-2xl font-bold text-amber-700">{errores.establecimientosNoMapeados.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">Vacunas no mapeadas</p>
                <p className="mt-2 text-2xl font-bold text-zinc-700">{errores.vacunasNoMapeadas.length}</p>
              </div>
              {'omitidos' in errores ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">Filas omitidas</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-700">{errores.omitidos}</p>
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-[18px] border border-[#e7e7ef] bg-white">
              <div className="border-b border-[#eeeef3] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Warning className="h-4 w-4 text-rose-500" />
                  <h4 className="text-sm font-semibold text-zinc-800">Detalle por fila</h4>
                </div>
              </div>
              <div className="max-h-[420px] overflow-auto">
                <table className="min-w-full">
                  <thead className={`sticky top-0 ${COMPONENT_STYLES.table.header}`}>
                    <tr>
                      <th className={COMPONENT_STYLES.table.headerCell}>Fila</th>
                      <th className={COMPONENT_STYLES.table.headerCell}>Tipo</th>
                      <th className={COMPONENT_STYLES.table.headerCell}>Valor detectado</th>
                      <th className={COMPONENT_STYLES.table.headerCell}>Descripción del error</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(errores.erroresDetalle || []).map((error, index) => (
                      <tr key={`${error.fila}-${index}`} className={COMPONENT_STYLES.table.row}>
                        <td className={COMPONENT_STYLES.table.cell}>
                          <span className="font-semibold text-zinc-700">{error.fila}</span>
                        </td>
                        <td className={COMPONENT_STYLES.table.cell}>
                          <span className={COMPONENT_STYLES.badge.danger}>
                            {error.tipo}
                          </span>
                        </td>
                        <td className={COMPONENT_STYLES.table.cell}>
                          <span className="text-sm font-medium text-zinc-700">{error.valor}</span>
                        </td>
                        <td className={COMPONENT_STYLES.table.cell}>
                          <span className="text-sm text-zinc-600">{error.mensaje}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={COMPONENT_STYLES.modal.footer}>
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.primary}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IciDemidErroresModal;
 