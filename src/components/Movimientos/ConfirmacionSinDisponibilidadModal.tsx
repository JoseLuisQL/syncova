import React from 'react';
import { Warning, ArrowSquareOut, CalendarBlank } from '@phosphor-icons/react';
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
  establecimientoNombre,
  vacunaNombre,
  cantidad,
  mesActual,
  anio,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Sin planificación disponible"
    subtitle={undefined}
    icon={Warning}
    size="md"
    footer={
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className={COMPONENT_STYLES.button.secondary}
        >
          Entendido
        </button>
      </div>
    }
  >
    <div className="space-y-4">

      {/* ── Mensaje principal ── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
        <p className="text-sm font-bold text-amber-900">{establecimientoNombre}</p>
        <p className="mt-1 text-sm text-amber-700 leading-relaxed">
          No tiene entregas programadas para {mesActual} {anio}. Para ingresar una entrega debes hacerlo desde el módulo de <strong>Planificaciones</strong>.
        </p>
      </div>

      {/* ── Datos del intento ── */}
      <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-zinc-50">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-zinc-500">Vacuna</span>
          <span className="text-sm font-semibold text-zinc-900">{vacunaNombre}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-zinc-500">Cantidad solicitada</span>
          <span className="text-sm font-semibold text-zinc-900">{cantidad.toLocaleString()} unidades</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm text-zinc-500">
            <CalendarBlank className="h-3.5 w-3.5" weight="duotone" />
            Período
          </span>
          <span className="text-sm font-semibold text-zinc-900">{mesActual} {anio}</span>
        </div>
      </div>

      {/* ── Instrucción ── */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5">
        <ArrowSquareOut className="h-4 w-4 mt-0.5 shrink-0 text-zinc-400" weight="bold" />
        <p className="text-sm text-zinc-500 leading-relaxed">
          Ve al módulo de <strong className="text-zinc-800">Planificaciones</strong> y define la cantidad para este establecimiento antes de registrar una entrega.
        </p>
      </div>

    </div>
  </Modal>
);

export default ConfirmacionSinDisponibilidadModal;
