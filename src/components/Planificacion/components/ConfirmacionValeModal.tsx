import React from 'react';
import { 
  AlertTriangle, 
  X, 
  Loader2, 
  Package, 
  FileText, 
  Syringe,
  Building2,
  Calendar,
  Pill,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
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
    { icon: FileText, label: 'Kardex y vale', description: 'Se actualizará automáticamente' },
  ];

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header con gradiente */}
        <div className="relative px-6 py-6 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  VALE YA GENERADO
                </h3>
                <p className="text-amber-100 text-sm mt-0.5">
                  Se requiere confirmación para continuar
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Info Card - Establecimiento y Período */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200/80">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Building2 className="h-4 w-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Establecimiento</p>
                  <p className="font-semibold text-gray-900 truncate">{establecimientoNombre}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-cyan-100">
                    <Calendar className="h-3.5 w-3.5 text-cyan-600" />
                  </div>
                  <span className="text-sm text-gray-700">{mesNombre} {anio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-100">
                    <Pill className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-emerald-700">{vacunaNombre}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cambio de valor - Diseño prominente */}
          <div className={`rounded-xl p-5 border-2 ${
            esReduccion 
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' 
              : 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200'
          }`}>
            <div className="flex items-center justify-center gap-6">
              {/* Valor Actual */}
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Actual</p>
                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
                  <p className="text-3xl font-bold text-gray-700">{valorOriginal.toLocaleString()}</p>
                </div>
              </div>

              {/* Flecha */}
              <div className={`p-2 rounded-full ${esReduccion ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                <ArrowRight className={`h-5 w-5 ${esReduccion ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>

              {/* Valor Nuevo */}
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nuevo</p>
                <div className={`px-4 py-2 rounded-xl shadow-sm border ${
                  esReduccion 
                    ? 'bg-emerald-100 border-emerald-300' 
                    : 'bg-rose-100 border-rose-300'
                }`}>
                  <p className={`text-3xl font-bold ${esReduccion ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {valorNuevo.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Badge de diferencia */}
              <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${
                esReduccion 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-rose-600 text-white'
              }`}>
                {esReduccion ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                <span className="text-lg font-bold">
                  {diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Items afectados */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Al continuar, se {esReduccion ? 'restaurarán' : 'deducirán'} los siguientes recursos:
            </p>
            <div className="space-y-2">
              {itemsAfectados.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    esReduccion ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    <item.icon className={`h-4 w-4 ${
                      esReduccion ? 'text-emerald-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <CheckCircle2 className={`h-5 w-5 ${
                    esReduccion ? 'text-emerald-400' : 'text-amber-400'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              esReduccion
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-200'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-200'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar cambio</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionValeModal;
