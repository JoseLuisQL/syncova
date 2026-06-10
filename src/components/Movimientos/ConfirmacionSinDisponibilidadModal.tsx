import React from 'react';
import { Warning, ShareNetwork } from '@phosphor-icons/react';
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
  const title = isInsuficiente ? "Planificación insuficiente" : "Sin planificación disponible";

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
            className="rounded-[8px] bg-[#0E9F8E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0c8a7b] focus:outline-none"
          >
            Entendido
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── Banner Informativo ── */}
        <div className="rounded-[8px] bg-[#F1F5F7] p-4 text-[#0F2A3B]">
          <p className="text-sm">
            {isInsuficiente ? (
              <>
                El establecimiento <strong className="font-semibold">{establecimientoNombre}</strong> cuenta con una planificación de solo <strong className="font-semibold">{disponibilidadRestante.toLocaleString()} unid.</strong> y está intentando asignar una cantidad mayor para el período detectado.
              </>
            ) : (
              <>
                El establecimiento <strong className="font-semibold">{establecimientoNombre}</strong> no cuenta con distribución aprobada en la planificación para el período detectado.
              </>
            )}
          </p>
        </div>

        {/* ── Tabla de Resumen ── */}
        <div className="overflow-hidden rounded-[8px] border border-[#e5e7eb]">
          <table className="w-full text-left text-sm text-[#0F2A3B]">
            <thead className="bg-[#F1F5F7] font-mono text-[0.65rem] uppercase tracking-wider text-[#4F6B7C]">
              <tr>
                <th className="px-4 py-2 font-semibold border-b border-[#e5e7eb]">Vacuna</th>
                <th className="px-4 py-2 font-semibold border-b border-[#e5e7eb]">Período Detectado</th>
                {isInsuficiente && <th className="px-4 py-2 font-semibold text-right border-b border-[#e5e7eb]">Disponible</th>}
                <th className="px-4 py-2 font-semibold text-right border-b border-[#e5e7eb]">Intento de Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] bg-white">
              <tr>
                <td className="px-4 py-3 font-medium">{vacunaNombre}</td>
                <td className="px-4 py-3 text-[#4F6B7C] font-mono text-[0.8rem] uppercase tracking-wider">{mesActual} {anio}</td>
                {isInsuficiente && <td className="px-4 py-3 text-right font-medium text-[#4F6B7C] tabular-nums">{disponibilidadRestante.toLocaleString()} unid.</td>}
                <td className={`px-4 py-3 text-right font-bold tabular-nums ${isInsuficiente ? 'text-[#f59e0b]' : 'text-[#0E9F8E]'}`}>{cantidad.toLocaleString()} unid.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Call to action ── */}
        <div className="flex items-start gap-3 mt-2 px-1">
          <ShareNetwork className="h-5 w-5 text-[#4F6B7C] mt-0.5" weight="duotone" />
          <p className="text-sm text-[#4F6B7C]">
            Dirígete al módulo de <strong className="font-medium text-[#0F2A3B]">Planificaciones</strong> y define una cantidad base o edita la existente para autorizar futuras distribuciones a esta microred.
          </p>
        </div>

      </div>
    </Modal>
  );
};

export default ConfirmacionSinDisponibilidadModal;
