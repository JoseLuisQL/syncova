import React, { memo, useState } from 'react';
import { Vacuna } from '../../../../types';
import { CentroAcopioOption } from '../../../../types/reportes';
import { ReportSectionCard } from '../ReportPrimitives';
import CenaresTable from './CenaresTable';

interface CenaresTabProps {
  centrosAcopio: CentroAcopioOption[];
  vacunas: Vacuna[];
}

const CenaresTab: React.FC<CenaresTabProps> = memo(() => {
  const currentYear = new Date().getFullYear();
  const [selectedAnio, setSelectedAnio] = useState<number>(currentYear);
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');

  return (
    <ReportSectionCard showHeader={false}>
      <CenaresTable
        anio={selectedAnio}
        onAnioChange={setSelectedAnio}
        tipoItem={selectedTipo}
        onTipoItemChange={setSelectedTipo}
      />
    </ReportSectionCard>
  );
});

CenaresTab.displayName = 'CenaresTab';

export default CenaresTab;
