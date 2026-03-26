import React, { useState } from 'react';
import { Calculator, Package, Syringe, Buildings, CircleNotch, Info } from '@phosphor-icons/react';
import { apiClient } from '../../config/api';
import { COMPONENT_STYLES } from './constants';

interface Vacuna {
  id: string;
  nombre: string;
  tipo: string;
  dosisPorFrasco: number;
}

interface CentroAcopio {
  id: string;
  nombre: string;
  codigo: string;
}

interface JeringaCalculada {
  jeringaId: string;
  cantidad: number;
  multiplicador: number;
  prioridad: number;
  origen: 'defecto' | 'centro';
}

interface CalculadoraJeringasProps {
  vacunas: Vacuna[];
  centrosAcopio: CentroAcopio[];
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const CalculadoraJeringas: React.FC<CalculadoraJeringasProps> = ({
  vacunas,
  centrosAcopio,
  onNotification
}) => {
  const [selectedVacuna, setSelectedVacuna] = useState('');
  const [selectedCentro, setSelectedCentro] = useState('');
  const [cantidadVacunas, setCantidadVacunas] = useState(1);
  const [resultado, setResultado] = useState<JeringaCalculada[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const calcularJeringas = async () => {
    if (!selectedVacuna || cantidadVacunas <= 0) {
      onNotification('error', 'Seleccione una vacuna y especifique una cantidad válida');
      return;
    }

    setIsCalculating(true);
    try {
      const payload = {
        vacunaId: selectedVacuna,
        cantidadVacunas: cantidadVacunas,
        ...(selectedCentro && { centroAcopioId: selectedCentro })
      };

      const response = await apiClient.post('/configuracion-jeringa-vacuna/calcular', payload);

      if (response.data.success) {
        setResultado(response.data.data || []);

        if (response.data.data && response.data.data.length > 0) {
          onNotification('success', 'Cálculo realizado exitosamente');
        } else {
          onNotification('info', 'No se encontraron configuraciones para esta vacuna');
        }
      } else {
        throw new Error('Error al calcular jeringas necesarias');
      }
    } catch (error) {
      console.error('Error al calcular jeringas:', error);
      onNotification('error', 'Error al calcular jeringas necesarias');
      setResultado([]);
    } finally {
      setIsCalculating(false);
    }
  };

  const vacunaSeleccionada = vacunas.find(v => v.id === selectedVacuna);
  const centroSeleccionado = centrosAcopio.find(c => c.id === selectedCentro);
  const totalDosis = vacunaSeleccionada ? cantidadVacunas * vacunaSeleccionada.dosisPorFrasco : 0;

  return (
    <div className={COMPONENT_STYLES.panel}>
      <div className="p-4 border-b border-zinc-200">
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="flex items-center gap-2 text-lg font-semibold text-zinc-900 transition-colors hover:text-zinc-600"
        >
          <Calculator className="h-5 w-5" weight="duotone" />
          Calculadora de Jeringas
          <span className="text-sm font-normal text-zinc-500">
            (Simular cálculos)
          </span>
        </button>
      </div>

      {showCalculator && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={COMPONENT_STYLES.input.label}>
                <Package className="inline h-4 w-4 mr-1" />
                Vacuna *
              </label>
              <select
                value={selectedVacuna}
                onChange={(e) => setSelectedVacuna(e.target.value)}
                className={COMPONENT_STYLES.input.base}
              >
                <option value="">Seleccione una vacuna</option>
                {vacunas.map(vacuna => (
                  <option key={vacuna.id} value={vacuna.id}>
                    {vacuna.nombre} ({vacuna.dosisPorFrasco} dosis/frasco)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={COMPONENT_STYLES.input.label}>
                <Buildings className="inline h-4 w-4 mr-1" />
                Centro de Acopio (Opcional)
              </label>
              <select
                value={selectedCentro}
                onChange={(e) => setSelectedCentro(e.target.value)}
                className={COMPONENT_STYLES.input.base}
              >
                <option value="">Usar configuración por defecto</option>
                {centrosAcopio.map(centro => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={COMPONENT_STYLES.input.label}>
                Cantidad de Frascos *
              </label>
              <input
                type="number"
                min="1"
                value={cantidadVacunas}
                onChange={(e) => setCantidadVacunas(parseInt(e.target.value) || 1)}
                className={COMPONENT_STYLES.input.base}
                placeholder="1"
              />
            </div>
          </div>

          {vacunaSeleccionada && (
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-zinc-600 mt-0.5" weight="fill" />
                <div>
                  <h4 className="font-medium text-zinc-900">Información del Cálculo</h4>
                  <div className="mt-2 text-sm text-zinc-700 space-y-1">
                    <p><strong className="text-zinc-900">Vacuna:</strong> {vacunaSeleccionada.nombre} - {vacunaSeleccionada.tipo}</p>
                    <p><strong className="text-zinc-900">Dosis por frasco:</strong> {vacunaSeleccionada.dosisPorFrasco}</p>
                    <p><strong className="text-zinc-900">Cantidad de frascos:</strong> {cantidadVacunas}</p>
                    <p><strong className="text-zinc-900">Total de dosis:</strong> {totalDosis}</p>
                    {centroSeleccionado && (
                      <p><strong className="text-zinc-900">Centro específico:</strong> {centroSeleccionado.nombre}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-start">
            <button
              onClick={calcularJeringas}
              disabled={!selectedVacuna || cantidadVacunas <= 0 || isCalculating}
              className={COMPONENT_STYLES.button.primary}
            >
              {isCalculating ? (
                <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
              ) : (
                <Calculator className="h-4 w-4" weight="bold" />
              )}
              <span>{isCalculating ? 'Calculando...' : 'Calcular Jeringas Necesarias'}</span>
            </button>
          </div>

          {resultado.length > 0 && (
            <div className="border-t border-zinc-200/80 pt-6">
              <h4 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Syringe className="h-5 w-5" weight="duotone" />
                Resultado del Cálculo
              </h4>
              
              <div className="space-y-3">
                {resultado.map((jeringa, index) => (
                  <div key={index} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200/50 text-zinc-700">
                          <Syringe className="h-5 w-5" weight="duotone" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">
                            Jeringa ID: {jeringa.jeringaId}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Prioridad: {jeringa.prioridad} | Origen: {jeringa.origen}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-zinc-900">
                          {jeringa.cantidad.toLocaleString()}
                        </p>
                        <p className="text-sm text-zinc-500">
                          jeringas (x{jeringa.multiplicador})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-zinc-900 border border-zinc-900 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-100">Total de Jeringas Necesarias</p>
                    <p className="text-sm text-zinc-400">
                      Para {cantidadVacunas} frasco(s) de {vacunaSeleccionada?.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {resultado.reduce((total, jeringa) => total + jeringa.cantidad, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-400 uppercase tracking-widest">jeringas</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculadoraJeringas;
