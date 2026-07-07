import React from 'react';
import { Warning, WarningCircle } from '@phosphor-icons/react';
import { IciDemidImportPreview, IciDemidImportResult } from '../../types';
import { Modal } from '../ui/ModalElements';
import { COMPONENT_STYLES } from '../Establecimientos/constants';

interface IciDemidErroresModalProps {
  isOpen: boolean;
  onClose: () => void;
  errores: IciDemidImportPreview | IciDemidImportResult | null;
}

const IciDemidErroresModal: React.FC<IciDemidErroresModalProps> = ({ isOpen, onClose, errores }) => {
  if (!isOpen || !errores) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Errores encontrados en la importación"
      subtitle="Se detectaron inconsistencias en el Excel. Revisa la fila, el valor y el motivo exacto antes de volver a importar."
      icon={WarningCircle}
      size="xl"
      footer={
        <div className="flex w-full justify-end">
          <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.primary}>
            Entendido
          </button>
        </div>
      }
    >
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-medium text-rose-600">Errores detectados</p>
                <p className="mt-2 text-2xl font-semibold text-rose-700">{errores.erroresDetalle?.length || 0}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-soft px-4 py-3">
                <p className="text-xs font-medium text-muted">Establecimientos no mapeados</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{errores.establecimientosNoMapeados.length}</p>
              </div>
              <div className="rounded-xl border border-line bg-white px-4 py-3">
                <p className="text-xs font-medium text-muted">Vacunas no mapeadas</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{errores.vacunasNoMapeadas.length}</p>
              </div>
              {'omitidos' in errores ? (
                <div className="rounded-xl border border-line bg-white px-4 py-3">
                  <p className="text-xs font-medium text-muted">Filas omitidas</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{errores.omitidos}</p>
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="border-b border-line-soft px-4 py-3">
                <div className="flex items-center gap-2">
                  <Warning className="h-4 w-4 text-rose-500" />
                  <h4 className="text-sm font-semibold text-ink">Detalle por fila</h4>
                </div>
              </div>
              <div className="max-h-[420px] overflow-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className={`sticky top-0 ${COMPONENT_STYLES.table.header}`}>
                    <tr>
                      <th className={`${COMPONENT_STYLES.table.headerCell} border-b border-r border-line-soft`}>Fila</th>
                      <th className={`${COMPONENT_STYLES.table.headerCell} border-b border-r border-line-soft`}>Tipo</th>
                      <th className={`${COMPONENT_STYLES.table.headerCell} border-b border-r border-line-soft`}>Valor detectado</th>
                      <th className={`${COMPONENT_STYLES.table.headerCell} border-b border-line-soft`}>Descripción del error</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(errores.erroresDetalle || []).map((error, index) => (
                      <tr key={`${error.fila}-${index}`} className="transition-colors hover:bg-surface-soft">
                        <td className={`${COMPONENT_STYLES.table.cell} border-b border-r border-line-soft`}>
                          <span className="font-semibold text-ink">{error.fila}</span>
                        </td>
                        <td className={`${COMPONENT_STYLES.table.cell} border-b border-r border-line-soft`}>
                          <span className={COMPONENT_STYLES.badge.danger}>
                            {error.tipo}
                          </span>
                        </td>
                        <td className={`${COMPONENT_STYLES.table.cell} border-b border-r border-line-soft`}>
                          <span className="text-sm font-medium text-ink">{error.valor}</span>
                        </td>
                        <td className={`${COMPONENT_STYLES.table.cell} border-b border-line-soft`}>
                          <span className="text-sm text-muted-2">{error.mensaje}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
    </Modal>
  );
};

export default IciDemidErroresModal;
 