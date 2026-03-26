import React from 'react';
import { WarningCircle, CalendarBlank, CheckCircle } from '@phosphor-icons/react';
import { Modal } from '../Establecimientos/components';
import { COMPONENT_STYLES } from './constants';

interface ConfirmacionSinDisponibilidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  establecimientoNombre: string;
  vacunaNombre: string;
  cantidad: number;
  mesActual: string;
  anio: number;
  isProcessing?: boolean;
  tipoEntrega: 'base' | 'adicional';
}

const ConfirmacionSinDisponibilidadModal: React.FC<ConfirmacionSinDisponibilidadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  establecimientoNombre,
  vacunaNombre,
  cantidad,
  mesActual,
  anio,
  isProcessing = false,
  tipoEntrega,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {
      if (!isProcessing) onClose();
    }}
    title="Sin Disponibilidad Programada"
    subtitle="La entrega puede registrarse excepcionalmente con actualización automática al plan."
    icon={WarningCircle}
    size="md"
    footer={
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className={COMPONENT_STYLES.button.secondary}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className={COMPONENT_STYLES.button.primary}
        >
          {isProcessing ? <WarningCircle className="h-4 w-4 animate-pulse" weight="bold" /> : <CheckCircle className="h-4 w-4" weight="bold" />}
          <span>{isProcessing ? 'Procesando...' : 'Confirmar registro'}</span>
        </button>
      </div>
    }
  >
    <div className="space-y-4">
      <section className="rounded-[16px] border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-amber-200 text-amber-600 shadow-sm">
            <WarningCircle className="h-4 w-4" weight="fill" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 tracking-tight">Advertencia de flujo</p>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              <span className="font-bold">{establecimientoNombre}</span> carece de disponibilidad validada para esta
              entrega en {anio}.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[16px] border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Biológico</p>
          <p className="mt-1 text-[0.95rem] font-bold tracking-tight text-zinc-900">{vacunaNombre}</p>
        </div>

        <div className="rounded-[16px] border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Categoría</p>
          <span
            className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-bold tracking-widest uppercase ${
              tipoEntrega === 'base' ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' : 'bg-zinc-900 text-white'
            }`}
          >
            {tipoEntrega === 'base' ? 'Regular' : 'Excedente'}
          </span>
        </div>

        <div className="rounded-[16px] border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Volumen</p>
          <p className="mt-1 text-[0.95rem] font-bold tracking-tight text-zinc-900">{cantidad.toLocaleString()} U</p>
        </div>

        <div className="rounded-[16px] border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarBlank className="h-4 w-4 text-zinc-500" weight="duotone" />
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-500">Target</p>
          </div>
          <p className="mt-1 text-[0.95rem] font-bold tracking-tight text-zinc-900">
            {mesActual} {anio}
          </p>
        </div>
      </section>

      <section className="rounded-[16px] border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-300 text-zinc-900 shadow-sm">
            <CheckCircle className="h-4 w-4" weight="fill" />
          </div>
          <div>
            <p className="text-[0.9rem] font-bold text-zinc-900 tracking-tight">Resolución Automática</p>
            <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
              Registraremos la transacción y se adaptará la bitácora logística silenciosamente sin quebrar el balance general.
            </p>
          </div>
        </div>
      </section>
    </div>
  </Modal>
);

export default ConfirmacionSinDisponibilidadModal;
