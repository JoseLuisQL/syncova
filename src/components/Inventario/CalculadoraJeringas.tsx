import React, { useState, useEffect } from 'react';
import { Calculator, Package, Syringe, Building2, AlertCircle, Loader, Info } from 'lucide-react';
import { apiClient } from '../../config/api';

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <Calculator className="h-5 w-5" />
          Calculadora de Jeringas
          <span className="text-sm font-normal text-gray-500">
            (Simular cálculos)
          </span>
        </button>
      </div>

      {showCalculator && (
        <div className="p-6 space-y-6">
          {/* Formulario de cálculo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Vacuna *
              </label>
              <select
                value={selectedVacuna}
                onChange={(e) => setSelectedVacuna(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline h-4 w-4 mr-1" />
                Centro de Acopio (Opcional)
              </label>
              <select
                value={selectedCentro}
                onChange={(e) => setSelectedCentro(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de Frascos *
              </label>
              <input
                type="number"
                min="1"
                value={cantidadVacunas}
                onChange={(e) => setCantidadVacunas(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
          </div>

          {/* Información de la vacuna seleccionada */}
          {vacunaSeleccionada && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Información del Cálculo</h4>
                  <div className="mt-2 text-sm text-blue-800 space-y-1">
                    <p><strong>Vacuna:</strong> {vacunaSeleccionada.nombre} - {vacunaSeleccionada.tipo}</p>
                    <p><strong>Dosis por frasco:</strong> {vacunaSeleccionada.dosisPorFrasco}</p>
                    <p><strong>Cantidad de frascos:</strong> {cantidadVacunas}</p>
                    <p><strong>Total de dosis:</strong> {totalDosis}</p>
                    {centroSeleccionado && (
                      <p><strong>Centro específico:</strong> {centroSeleccionado.nombre}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón de cálculo */}
          <div className="flex justify-center">
            <button
              onClick={calcularJeringas}
              disabled={!selectedVacuna || cantidadVacunas <= 0 || isCalculating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Calculator className="h-5 w-5" />
              )}
              {isCalculating ? 'Calculando...' : 'Calcular Jeringas Necesarias'}
            </button>
          </div>

          {/* Resultados */}
          {resultado.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Syringe className="h-5 w-5 text-blue-600" />
                Resultado del Cálculo
              </h4>
              
              <div className="space-y-3">
                {resultado.map((jeringa, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Syringe className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Jeringa ID: {jeringa.jeringaId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Prioridad: {jeringa.prioridad} | Origen: {jeringa.origen}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {jeringa.cantidad}
                        </p>
                        <p className="text-sm text-gray-500">
                          jeringas (x{jeringa.multiplicador})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen total */}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Total de Jeringas Necesarias</p>
                    <p className="text-sm text-green-700">
                      Para {cantidadVacunas} frasco(s) de {vacunaSeleccionada?.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {resultado.reduce((total, jeringa) => total + jeringa.cantidad, 0)}
                    </p>
                    <p className="text-sm text-green-600">jeringas</p>
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
