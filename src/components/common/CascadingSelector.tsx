import React, { useEffect, useMemo, useState } from 'react';
import { useCentrosAcopio } from '../../hooks/useCentrosAcopio';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useRedes } from '../../hooks/useRedes';
import { CentroAcopio, Microred } from '../../types';
import { COMPONENT_STYLES } from '../Establecimientos/constants';
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

const _selectorCardBase = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition';

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
  errors = {},
}) => {
  const [localRedId, setLocalRedId] = useState(selectedRedId);
  const [localMicroredId, setLocalMicroredId] = useState(selectedMicroredId);
  const [localCentroAcopioId, setLocalCentroAcopioId] = useState(selectedCentroAcopioId);
  const [filteredMicroredes, setFilteredMicroredes] = useState<Microred[]>([]);
  const [filteredCentrosAcopio, setFilteredCentrosAcopio] = useState<CentroAcopio[]>([]);

  const { redes, loading: redesLoading } = useRedes();
  const { loading: microredesLoading, getMicroredesByRed } = useMicroredes();
  const { loading: centrosLoading, getCentrosAcopioByMicrored } = useCentrosAcopio();

  const loading = redesLoading || microredesLoading || centrosLoading;

  useEffect(() => {
    const loadMicroredes = async () => {
      if (!localRedId) {
        setFilteredMicroredes([]);
        return;
      }

      try {
        const data = await getMicroredesByRed(localRedId);
        setFilteredMicroredes(data);
      } catch (error) {
        logger.error('Error al cargar microredes en el selector jerárquico:', error);
        setFilteredMicroredes([]);
      }
    };

    void loadMicroredes();
  }, [getMicroredesByRed, localRedId]);

  useEffect(() => {
    const loadCentrosAcopio = async () => {
      if (!localMicroredId) {
        setFilteredCentrosAcopio([]);
        return;
      }

      try {
        const data = await getCentrosAcopioByMicrored(localMicroredId);
        setFilteredCentrosAcopio(data);
      } catch (error) {
        logger.error('Error al cargar centros de acopio en el selector jerárquico:', error);
        setFilteredCentrosAcopio([]);
      }
    };

    void loadCentrosAcopio();
  }, [getCentrosAcopioByMicrored, localMicroredId]);

  useEffect(() => {
    setLocalRedId(selectedRedId);
  }, [selectedRedId]);

  useEffect(() => {
    setLocalMicroredId(selectedMicroredId);
  }, [selectedMicroredId]);

  useEffect(() => {
    setLocalCentroAcopioId(selectedCentroAcopioId);
  }, [selectedCentroAcopioId]);

  const _selectedRedLabel = useMemo(
    () => redes.find((red) => red.id === localRedId)?.nombre || 'Sin red seleccionada',
    [localRedId, redes],
  );

  const _selectedMicroredLabel = useMemo(
    () => filteredMicroredes.find((microred) => microred.id === localMicroredId)?.nombre || 'Sin microred seleccionada',
    [filteredMicroredes, localMicroredId],
  );

  const _selectedCentroLabel = useMemo(
    () =>
      filteredCentrosAcopio.find((centroAcopio) => centroAcopio.id === localCentroAcopioId)?.nombre ||
      'Sin centro de acopio seleccionado',
    [filteredCentrosAcopio, localCentroAcopioId],
  );

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

  const getSelectClassName = (hasError?: string, isDisabled?: boolean) =>
    `${COMPONENT_STYLES.input.base} ${hasError ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal} ${
      isDisabled ? 'cursor-not-allowed bg-gray-50 text-gray-500' : ''
    }`;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {showRed ? (
        <div className="flex flex-col">
          <label htmlFor="cascading-red" className={COMPONENT_STYLES.input.label}>
            Red de Salud {required.red ? <span className="ml-1 text-rose-500">*</span> : null}
          </label>
          <select
            id="cascading-red"
            value={localRedId}
            onChange={(event) => handleRedChange(event.target.value)}
            disabled={loading || disabled.red}
            className={getSelectClassName(errors.red, loading || disabled.red)}
          >
            <option value="">{loading ? 'Cargando redes...' : 'Seleccionar red...'}</option>
            {redes.map((red) => (
              <option key={red.id} value={red.id}>
                {red.nombre} {red.codigo ? `(${red.codigo})` : ''}
              </option>
            ))}
          </select>
          {errors.red ? <p className={COMPONENT_STYLES.input.errorText}>{errors.red}</p> : null}
        </div>
      ) : null}

      {showMicrored ? (
        <div className="flex flex-col">
          <label htmlFor="cascading-microred" className={COMPONENT_STYLES.input.label}>
            Microred {required.microred ? <span className="ml-1 text-rose-500">*</span> : null}
          </label>
          <select
            id="cascading-microred"
            value={localMicroredId}
            onChange={(event) => handleMicroredChange(event.target.value)}
            disabled={loading || disabled.microred || !localRedId}
            className={getSelectClassName(errors.microred, loading || disabled.microred || !localRedId)}
          >
            <option value="">
              {!localRedId
                ? 'Seleccione una red primero...'
                : loading
                ? 'Cargando microredes...'
                : 'Seleccionar microred...'}
            </option>
            {filteredMicroredes.map((microred) => (
              <option key={microred.id} value={microred.id}>
                {microred.nombre}
              </option>
            ))}
          </select>
          {errors.microred ? <p className={COMPONENT_STYLES.input.errorText}>{errors.microred}</p> : null}
        </div>
      ) : null}

      {showCentroAcopio ? (
        <div className="flex flex-col">
          <label htmlFor="cascading-centro" className={COMPONENT_STYLES.input.label}>
            Centro de Acopio {required.centroAcopio ? <span className="ml-1 text-rose-500">*</span> : null}
          </label>
          <select
            id="cascading-centro"
            value={localCentroAcopioId}
            onChange={(event) => handleCentroAcopioChange(event.target.value)}
            disabled={loading || disabled.centroAcopio || !localMicroredId}
            className={getSelectClassName(errors.centroAcopio, loading || disabled.centroAcopio || !localMicroredId)}
          >
            <option value="">
              {!localMicroredId
                ? 'Seleccione una microred primero...'
                : loading
                ? 'Cargando centros de acopio...'
                : 'Seleccionar centro de acopio...'}
            </option>
            {filteredCentrosAcopio.map((centroAcopio) => (
              <option key={centroAcopio.id} value={centroAcopio.id}>
                {centroAcopio.nombre}
              </option>
            ))}
          </select>
          {errors.centroAcopio ? <p className={COMPONENT_STYLES.input.errorText}>{errors.centroAcopio}</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export default CascadingSelector;
