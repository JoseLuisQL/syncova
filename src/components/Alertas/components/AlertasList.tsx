import React, { memo, useEffect, useMemo, useState } from 'react';
import { Alerta } from '../../../types';
import { DataTable, Pagination, TableCell, TableHeader, TableRow } from '../../Inventario/components/FilterAndTable';
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
    <section className={COMPONENT_STYLES.table.container}>
      <div className="border-b border-zinc-100 bg-zinc-50/70 px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">Alertas filtradas</h3>
            <p className="mt-1 text-sm text-zinc-500">{alertas.length} resultado(s) listos para revisión.</p>
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
        <div className="border-b border-zinc-200 bg-zinc-100/80 px-4 py-3.5 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <span className="text-sm font-medium text-teal-900">
              {selectedAlertas.length} alerta{selectedAlertas.length === 1 ? '' : 's'} seleccionada{selectedAlertas.length === 1 ? '' : 's'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onMarcarSeleccionadasLeidas} className={COMPONENT_STYLES.button.primary}>
                Marcar leídas
              </button>
              <button type="button" onClick={onEliminarSeleccionadas} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-rose-700 hover:to-red-700">
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
        <DataTable isLoading={isLoading} loadingMessage="Cargando alertas..." skeletonRows={5} skeletonColumns={6}>
          <table className="min-w-full table-auto">
            <TableHeader
              columns={[
                { key: 'select', label: '', align: 'center', className: 'w-12' },
                { key: 'alerta', label: 'Alerta' },
                { key: 'tipo', label: 'Tipo', align: 'center' },
                { key: 'nivel', label: 'Nivel', align: 'center' },
                { key: 'fecha', label: 'Fecha', align: 'center' },
                { key: 'estado', label: 'Estado', align: 'center' },
                { key: 'acciones', label: 'Acciones', align: 'right' },
              ]}
            />
            <tbody className="divide-y divide-zinc-100 bg-white">
              {alertasPaginadas.map((alerta) => {
                const tipoInfo = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo);
                const nivelInfo = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel);

                return (
                  <TableRow key={alerta.id} isSelected={selectedAlertas.includes(alerta.id)}>
                    <TableCell align="center">
                      <input
                        type="checkbox"
                        checked={selectedAlertas.includes(alerta.id)}
                        onChange={() => onToggleSelect(alerta.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800"
                        aria-label={`Seleccionar alerta: ${alerta.titulo}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-900">{alerta.titulo}</p>
                          {!alerta.leida ? <span className="h-2 w-2 rounded-full bg-zinc-800" /> : null}
                        </div>
                        <p className="mt-1 text-sm text-zinc-600">{alerta.descripcion}</p>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tipoInfo?.bgColor || 'bg-zinc-100'} ${tipoInfo?.color || 'text-zinc-700'}`}>
                        {tipoInfo?.label || alerta.tipo}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${nivelInfo?.bgColor || 'bg-zinc-100'} ${nivelInfo?.color || 'text-zinc-700'}`}>
                        {nivelInfo?.label || alerta.nivel}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-sm text-zinc-600">{formatearFecha(alerta.fechaCreacion)}</span>
                    </TableCell>
                    <TableCell align="center">
                      <span className={alerta.leida ? COMPONENT_STYLES.badge.neutral : COMPONENT_STYLES.badge.count}>
                        {alerta.leida ? 'Leída' : 'Pendiente'}
                      </span>
                    </TableCell>
                    <TableCell align="right">
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
                    </TableCell>
                  </TableRow>
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
 