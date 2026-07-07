import React from 'react';
import { Warning, Info, ArrowSquareOut } from '@phosphor-icons/react';
import { Modal } from '../Establecimientos/components';

interface ConfirmacionSinDisponibilidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  establecimientoNombre: string;
  vacunaNombre: string;
  cantidad: number;
  disponibilidadRestante?: number;
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
  disponibilidadRestante = 0,
  mesActual,
  anio,
}) => {
  const isInsuficiente = disponibilidadRestante > 0;
  const title = isInsuficiente ? "Límite planificado excedido" : "Sin planificación disponible";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={undefined}
      icon={Warning}
      size="md"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#0E9F8E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0c8a7b] focus:outline-none"
          >
            Entendido
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ── Banner Informativo ── */}
        <div className={`rounded-md border p-3 text-sm leading-relaxed ${isInsuficiente ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          {isInsuficiente ? (
            <p>
              La cantidad solicitada supera el límite de <strong>{disponibilidadRestante.toLocaleString()} unidades</strong> programado para <strong>{establecimientoNombre}</strong>.
            </p>
          ) : (
            <p>
              El establecimiento <strong>{establecimientoNombre}</strong> no cuenta con distribución aprobada en la planificación para el período detectado.
            </p>
          )}
        </div>

        {/* ── Detalle Bento-style ── */}
        <div className={`grid ${isInsuficiente ? 'grid-cols-4' : 'grid-cols-3'} gap-3 rounded-md border border-[#e5e7eb] bg-[#F1F5F7] p-3 text-left`}>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4F6B7C] font-mono">Vacuna</span>
            <span className="mt-1 text-sm font-bold text-[#0F2A3B]">{vacunaNombre}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4F6B7C] font-mono">Período</span>
            <span className="mt-1 text-sm font-bold text-[#0F2A3B] uppercase">{mesActual} {anio}</span>
          </div>
          {isInsuficiente && (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4F6B7C] font-mono">Disponible</span>
              <span className="mt-1 text-sm font-bold text-[#4F6B7C]">{disponibilidadRestante.toLocaleString()} u.</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4F6B7C] font-mono">Solicitado</span>
            <span className={`mt-1 text-sm font-bold ${isInsuficiente ? 'text-[#f59e0b]' : 'text-[#0E9F8E]'}`}>
              {cantidad.toLocaleString()} u.
            </span>
          </div>
        </div>

        {/* ── Call to action ── */}
        <div className="flex items-start gap-2.5 rounded-md border border-[#E2E8F0] bg-white p-3 shadow-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0E9F8E]" weight="duotone" />
          <p className="text-xs leading-relaxed text-[#4F6B7C]">
            Para autorizar esta entrega, dirígete al módulo de{' '}
            <a
              href="/planificacion"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-bold text-[#0E9F8E] hover:text-[#0c8a7b] hover:underline"
              title="Abrir Planificaciones en una nueva pestaña"
            >
              Planificaciones
              <ArrowSquareOut className="h-3.5 w-3.5 inline-block shrink-0" weight="bold" />
            </a>{' '}
            y define una cantidad base o edita la existente.
          </p>
        </div>

      </div>
    </Modal>
  );
};

export default ConfirmacionSinDisponibilidadModal;
