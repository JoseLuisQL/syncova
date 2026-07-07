import React, { memo, useEffect, useMemo, useState } from 'react';
import { Alerta } from '../../../types';
import { DataTable, Pagination } from '../../Inventario/components/FilterAndTable';
import { COMPONENT_STYLES, ITEMS_PER_PAGE, NIVELES_ALERTA, TIPOS_ALERTA } from '../constants';
import { AlertaCard } from './AlertaCard';
import { EmptyState } from './EmptyState';

interface AlertasListProps {
  alertas: Alerta[];
  selectedAlertas: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarcarLeida: (id: string) => void;
  onMarcarNoLeida: (id: string) => void;
  onEliminar: (id: string) => void;
  onMarcarSeleccionadasLeidas: () => void;
  onEliminarSeleccionadas: () => void;
  isLoading?: boolean;
}

const formatearFecha = (fecha: Date | string) => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diferencia = ahora.getTime() - fechaObj.getTime();
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `${minutos} min`;
  if (horas < 24) return `${horas}h`;
  if (dias < 7) return `${dias}d`;
  return fechaObj.toLocaleDateString('es-PE');
};

export const AlertasList: React.FC<AlertasListProps> = memo(({
  alertas,
  selectedAlertas,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
  onMarcarSeleccionadasLeidas,
  onEliminarSeleccionadas,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(alertas.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const alertasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return alertas.slice(start, start + ITEMS_PER_PAGE);
  }, [alertas, currentPage]);

  if (!isLoading && alertas.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="space-y-3">
      <div className="border-b border-[#eeeef3] bg-white pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[1.05rem] font-semibold text-[#15171d]">Alertas filtradas</h3>
            <p className="mt-1 text-sm text-[#747986]">{alertas.length} resultado(s) listos para revisión.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onClick={onSelectAll} className={COMPONENT_STYLES.button.ghost}>
              Seleccionar todo
            </button>
            <button type="button" onClick={onDeselectAll} className={COMPONENT_STYLES.button.ghost}>
              Limpiar selección
            </button>
          </div>
        </div>
      </div>

      {selectedAlertas.length > 0 ? (
        <div className="rounded-xl border border-[#e7e7ef] bg-[#fbfafd] px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <span className="text-sm font-medium text-[#15171d]">
              {selectedAlertas.length} alerta{selectedAlertas.length === 1 ? '' : 's'} seleccionada{selectedAlertas.length === 1 ? '' : 's'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onMarcarSeleccionadasLeidas} className={COMPONENT_STYLES.button.primary}>
                Marcar leídas
              </button>
              <button type="button" onClick={onEliminarSeleccionadas} className={COMPONENT_STYLES.button.secondary}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="block md:hidden space-y-3 p-4 sm:p-5">
        {alertasPaginadas.map((alerta) => (
          <AlertaCard
            key={alerta.id}
            alerta={alerta}
            isSelected={selectedAlertas.includes(alerta.id)}
            onToggleSelect={onToggleSelect}
            onMarcarLeida={onMarcarLeida}
            onMarcarNoLeida={onMarcarNoLeida}
            onEliminar={onEliminar}
          />
        ))}
      </div>

      <div className="hidden md:block">
        <DataTable isLoading={isLoading} loadingMessage="Cargando alertas..." skeletonRows={5} skeletonColumns={7}>
          <table className="min-w-full table-auto border-separate border-spacing-0">
            <thead className={COMPONENT_STYLES.table.header}>
              <tr>
                <th className="w-10 rounded-l-[14px] bg-[#fbfafd] px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={alertas.length > 0 && selectedAlertas.length === alertas.length}
                    onChange={() => {
                      if (selectedAlertas.length === alertas.length) {
                        onDeselectAll();
                        return;
                      }
                      onSelectAll();
                    }}
                    className="h-4 w-4 rounded-[5px] border-[#e0e2ea] text-[#7c3aed] focus:ring-[#7c3aed]/20"
                    aria-label="Seleccionar todas las alertas"
                  />
                </th>
                <th className={COMPONENT_STYLES.table.headerCell}>Alerta</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Tipo</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Nivel</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Fecha</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Estado</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} rounded-r-[14px] text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {alertasPaginadas.map((alerta) => {
                const tipoInfo = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo);
                const nivelInfo = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel);

                return (
                  <tr key={alerta.id} className={`${COMPONENT_STYLES.table.row} ${selectedAlertas.includes(alerta.id) ? 'bg-zinc-100/60' : ''}`}>
                    <td className="w-10 border-b border-[#eeeef3] px-3 py-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selectedAlertas.includes(alerta.id)}
                        onChange={() => onToggleSelect(alerta.id)}
                        className="h-4 w-4 rounded-[5px] border-[#e7e7ef] text-[#7c3aed] focus:ring-[#7c3aed]/20"
                        aria-label={`Seleccionar alerta: ${alerta.titulo}`}
                      />
                    </td>
                    <td className={COMPONENT_STYLES.table.cell}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#15171d]">{alerta.titulo}</p>
                          {!alerta.leida ? <span className="h-2 w-2 rounded-full bg-[#7c3aed]" /> : null}
                        </div>
                        <p className="mt-1 text-sm text-[#747986]">{alerta.descripcion}</p>
                      </div>
                    </td>
                    <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                      <span className="inline-flex items-center rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
                        {tipoInfo?.label || alerta.tipo}
                      </span>
                    </td>
                    <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                      <span className="inline-flex items-center rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
                        {nivelInfo?.label || alerta.nivel}
                      </span>
                    </td>
                    <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                      <span className="text-sm text-zinc-600">{formatearFecha(alerta.fechaCreacion)}</span>
                    </td>
                    <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                      <span className={alerta.leida ? COMPONENT_STYLES.badge.neutral : COMPONENT_STYLES.badge.count}>
                        {alerta.leida ? 'Leída' : 'Pendiente'}
                      </span>
                    </td>
                    <td className={`${COMPONENT_STYLES.table.cell} text-right`}>
                      <div className="flex justify-end gap-2">
                        {alerta.leida ? (
                          <button type="button" onClick={() => onMarcarNoLeida(alerta.id)} className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`} aria-label="Marcar no leída">
                            <span className="text-xs font-semibold">NL</span>
                          </button>
                        ) : (
                          <button type="button" onClick={() => onMarcarLeida(alerta.id)} className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`} aria-label="Marcar leída">
                            <span className="text-xs font-semibold">L</span>
                          </button>
                        )}
                        <button type="button" onClick={() => onEliminar(alerta.id)} className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`} aria-label="Eliminar alerta">
                          <span className="text-xs font-semibold">X</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTable>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={alertas.length}
        limit={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </section>
  );
});

AlertasList.displayName = 'AlertasList';
 