import React from 'react';
import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { Modal } from '../Establecimientos/components';

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
    title="Sin disponibilidad programada"
    subtitle="La entrega puede registrarse en el mes actual con actualización automática."
    icon={AlertCircle}
    size="md"
    footer={
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? <AlertCircle className="h-4 w-4 animate-pulse" /> : <CheckCircle className="h-4 w-4" />}
          <span>{isProcessing ? 'Procesando...' : 'Confirmar registro'}</span>
        </button>
      </div>
    }
  >
    <div className="space-y-4">
      <section className="rounded-[20px] border border-amber-200 bg-amber-50/70 p-4">
        <p className="text-sm font-medium text-amber-900">
          <span className="font-semibold">{establecimientoNombre}</span> no tiene disponibilidad programada para esta
          entrega en {anio}.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Vacuna</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{vacunaNombre}</p>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Tipo</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              tipoEntrega === 'base' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {tipoEntrega === 'base' ? 'Entrega base' : 'Entrega adicional'}
          </span>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Cantidad</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{cantidad.toLocaleString()} unidades</p>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Período</p>
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {mesActual} {anio}
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-900">Qué sucederá</p>
            <p className="mt-1 text-sm text-emerald-700">
              Se registrará la entrega en el mes actual y se sincronizará automáticamente la planificación.
            </p>
          </div>
        </div>
      </section>
    </div>
  </Modal>
);

export default ConfirmacionSinDisponibilidadModal;
