import React from 'react';
import { 
  Warning, 
  X, 
  CircleNotch, 
  Package, 
  FileText, 
  Syringe,
  Buildings,
  CalendarBlank,
  Pill,
  ArrowRight,
  TrendUp,
  TrendDown,
  CheckCircle
} from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

interface ConfirmacionValeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  establecimientoNombre: string;
  vacunaNombre: string;
  mesNombre: string;
  anio: number;
  valorOriginal: number;
  valorNuevo: number;
  isProcessing?: boolean;
}

const ConfirmacionValeModal: React.FC<ConfirmacionValeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  establecimientoNombre,
  vacunaNombre,
  mesNombre,
  anio,
  valorOriginal,
  valorNuevo,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  const diferencia = valorNuevo - valorOriginal;
  const esReduccion = diferencia < 0;

  const itemsAfectados = [
    { icon: Package, label: 'Stock de vacunas', description: esReduccion ? 'Se restaurará' : 'Se deducirá' },
    { icon: Syringe, label: 'Stock de jeringas', description: esReduccion ? 'Se restaurará' : 'Se deducirá' },
    { icon: FileText, label: 'Kardex y vale', description: 'Se sincronizará automáticamente' },
  ];

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className="bg-white rounded-[20px] max-w-lg w-full shadow-2xl overflow-hidden border border-zinc-200">
        
        {/* Header Flat Warning */}
        <div className="px-6 py-5 bg-amber-500 border-b border-amber-600 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-900/20 text-amber-950">
              <Warning className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-amber-950">
                VALE OPERATIVO DECTECTADO
              </h3>
              <p className="text-sm font-semibold text-amber-900/80 mt-0.5">
                Mutación de datos condicionada
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-amber-900/60 hover:bg-amber-900/10 hover:text-amber-950 transition-colors"
            >
              <X className="h-5 w-5" weight="bold" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Info Card - Establecimiento y Período */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-zinc-200 p-2 text-zinc-600">
                  <Buildings className="h-4 w-4" weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Unidad Ejecutora</p>
                  <p className="text-sm font-black text-zinc-900 truncate">{establecimientoNombre}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 border-t border-zinc-200/60 pt-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-zinc-200 p-1.5 text-zinc-600">
                    <CalendarBlank className="h-3.5 w-3.5" weight="duotone" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-700">{mesNombre} {anio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-zinc-200 p-1.5 text-zinc-600">
                    <Pill className="h-3.5 w-3.5" weight="duotone" />
                  </div>
                  <span className="text-sm font-black text-zinc-900">{vacunaNombre}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cambio de valor - Data Density Design */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-center gap-8">
              
              <div className="text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Origen</p>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2">
                  <p className="text-2xl font-black tabular-nums text-zinc-500">{valorOriginal.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="rounded-full bg-zinc-100 p-2 text-zinc-400 mb-2">
                  <ArrowRight className="h-4 w-4" weight="bold" />
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-bold 
                  ${esReduccion ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {esReduccion ? <TrendDown className="h-3 w-3" weight="bold" /> : <TrendUp className="h-3 w-3" weight="bold" />}
                  <span>{diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-900 mb-1.5">Destino</p>
                <div className="rounded-lg border-2 border-zinc-900 bg-white px-4 py-2 shadow-sm">
                  <p className="text-2xl font-black tabular-nums text-zinc-900">{valorNuevo.toLocaleString()}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Items afectados */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Impacto transaccional
            </p>
            <div className="space-y-2">
              {itemsAfectados.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                >
                  <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600">
                    <item.icon className="h-4 w-4" weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                    <p className="text-xs font-medium text-zinc-500">{item.description}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-zinc-300" weight="fill" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-50"
          >
            Abortar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-sm hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                <span>Inyectando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" weight="bold" />
                <span>Aplicar mutación</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionValeModal;
