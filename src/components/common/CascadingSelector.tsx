import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Red, Microred, CentroAcopio } from '../../types';
import { useRedes } from '../../hooks/useRedes';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useCentrosAcopio } from '../../hooks/useCentrosAcopio';
import { logger } from '../../utils/debug';

interface CascadingSelectorProps {
  selectedRedId?: string;
  selectedMicroredId?: string;
  selectedCentroAcopioId?: string;
  onRedChange?: (redId: string) => void;
  onMicroredChange?: (microredId: string) => void;
  onCentroAcopioChange?: (centroAcopioId: string) => void;
  showRed?: boolean;
  showMicrored?: boolean;
  showCentroAcopio?: boolean;
  required?: {
    red?: boolean;
    microred?: boolean;
    centroAcopio?: boolean;
  };
  disabled?: {
    red?: boolean;
    microred?: boolean;
    centroAcopio?: boolean;
  };
  errors?: {
    red?: string;
    microred?: string;
    centroAcopio?: string;
  };
}

const CascadingSelector: React.FC<CascadingSelectorProps> = ({
  selectedRedId = '',
  selectedMicroredId = '',
  selectedCentroAcopioId = '',
  onRedChange,
  onMicroredChange,
  onCentroAcopioChange,
  showRed = true,
  showMicrored = true,
  showCentroAcopio = true,
  required = {},
  disabled = {},
  errors = {}
}) => {
  const [localRedId, setLocalRedId] = useState(selectedRedId);
  const [localMicroredId, setLocalMicroredId] = useState(selectedMicroredId);
  const [localCentroAcopioId, setLocalCentroAcopioId] = useState(selectedCentroAcopioId);

  // Hooks para obtener datos reales de la API
  const { redes, loading: redesLoading } = useRedes();

  const {
    microredes,
    loading: microredesLoading,
    getMicroredesByRed
  } = useMicroredes();

  const {
    centrosAcopio,
    loading: centrosLoading,
    getCentrosAcopioByMicrored
  } = useCentrosAcopio();

  // Estados para datos filtrados
  const [filteredMicroredes, setFilteredMicroredes] = useState<Microred[]>([]);
  const [filteredCentrosAcopio, setFilteredCentrosAcopio] = useState<CentroAcopio[]>([]);

  // Loading general
  const loading = redesLoading || microredesLoading || centrosLoading;

  // Cargar microredes cuando cambie la red seleccionada
  useEffect(() => {
    const loadMicroredes = async () => {
      if (localRedId) {
        try {
          logger.debug('Cargando microredes para red:', localRedId);
          const microredesData = await getMicroredesByRed(localRedId);
          setFilteredMicroredes(microredesData);
          logger.info(`Microredes cargadas: ${microredesData.length}`);
        } catch (error) {
          logger.error('Error al cargar microredes:', error);
          setFilteredMicroredes([]);
        }
      } else {
        setFilteredMicroredes([]);
      }
    };

    loadMicroredes();
  }, [localRedId, getMicroredesByRed]);

  // Cargar centros de acopio cuando cambie la microred seleccionada
  useEffect(() => {
    const loadCentrosAcopio = async () => {
      if (localMicroredId) {
        try {
          logger.debug('Cargando centros de acopio para microred:', localMicroredId);
          const centrosData = await getCentrosAcopioByMicrored(localMicroredId);
          setFilteredCentrosAcopio(centrosData);
          logger.info(`Centros de acopio cargados: ${centrosData.length}`);
        } catch (error) {
          logger.error('Error al cargar centros de acopio:', error);
          setFilteredCentrosAcopio([]);
        }
      } else {
        setFilteredCentrosAcopio([]);
      }
    };

    loadCentrosAcopio();
  }, [localMicroredId, getCentrosAcopioByMicrored]);

  // Sync with props
  useEffect(() => {
    setLocalRedId(selectedRedId);
  }, [selectedRedId]);

  useEffect(() => {
    setLocalMicroredId(selectedMicroredId);
  }, [selectedMicroredId]);

  useEffect(() => {
    setLocalCentroAcopioId(selectedCentroAcopioId);
  }, [selectedCentroAcopioId]);

  // Handle changes
  const handleRedChange = (redId: string) => {
    setLocalRedId(redId);
    setLocalMicroredId('');
    setLocalCentroAcopioId('');
    onRedChange?.(redId);
    onMicroredChange?.('');
    onCentroAcopioChange?.('');
  };

  const handleMicroredChange = (microredId: string) => {
    setLocalMicroredId(microredId);
    setLocalCentroAcopioId('');
    onMicroredChange?.(microredId);
    onCentroAcopioChange?.('');
  };

  const handleCentroAcopioChange = (centroAcopioId: string) => {
    setLocalCentroAcopioId(centroAcopioId);
    onCentroAcopioChange?.(centroAcopioId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Selector de Red */}
      {showRed && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Red de Salud {required.red && <span className="text-red-500">*</span>}
          </label>
          <select
            value={localRedId}
            onChange={(e) => handleRedChange(e.target.value)}
            disabled={loading || disabled.red}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.red
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${disabled.red ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {loading ? 'Cargando...' : 'Seleccionar red...'}
            </option>
            {redes.map((red) => (
              <option key={red.id} value={red.id}>
                {red.nombre} {red.codigo && `(${red.codigo})`}
              </option>
            ))}
          </select>
          {errors.red && (
            <p className="mt-1 text-sm text-red-600">{errors.red}</p>
          )}
        </div>
      )}

      {/* Selector de Microred */}
      {showMicrored && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Microred {required.microred && <span className="text-red-500">*</span>}
          </label>
          <select
            value={localMicroredId}
            onChange={(e) => handleMicroredChange(e.target.value)}
            disabled={loading || disabled.microred || !localRedId}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.microred
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${disabled.microred || !localRedId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {!localRedId
                ? 'Seleccione una red primero...'
                : loading
                  ? 'Cargando...'
                  : 'Seleccionar microred...'
              }
            </option>
            {filteredMicroredes.map((microred) => (
              <option key={microred.id} value={microred.id}>
                {microred.nombre}
              </option>
            ))}
          </select>
          {errors.microred && (
            <p className="mt-1 text-sm text-red-600">{errors.microred}</p>
          )}
        </div>
      )}

      {/* Selector de Centro de Acopio */}
      {showCentroAcopio && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Centro de Acopio {required.centroAcopio && <span className="text-red-500">*</span>}
          </label>
          <select
            value={localCentroAcopioId}
            onChange={(e) => handleCentroAcopioChange(e.target.value)}
            disabled={loading || disabled.centroAcopio || !localMicroredId}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.centroAcopio
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${disabled.centroAcopio || !localMicroredId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {!localMicroredId
                ? 'Seleccione una microred primero...'
                : loading
                  ? 'Cargando...'
                  : 'Seleccionar centro de acopio...'
              }
            </option>
            {filteredCentrosAcopio.map((centro) => (
              <option key={centro.id} value={centro.id}>
                {centro.nombre}
              </option>
            ))}
          </select>
          {errors.centroAcopio && (
            <p className="mt-1 text-sm text-red-600">{errors.centroAcopio}</p>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="col-span-full">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando opciones...
          </div>
        </div>
      )}
    </div>
  );
};

export default CascadingSelector;
