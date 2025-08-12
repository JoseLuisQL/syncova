import React, { useState } from 'react';
import NuevoIngreso from './NuevoIngreso';
import { Vacuna, Jeringa } from '../../types';

// Test data scenarios
const normalVacunas: Vacuna[] = [
  {
    id: '1',
    nombre: 'BCG',
    tipo: 'Antituberculosa',
    presentacion: 'Frasco multidosis',
    dosisPorFrasco: 10,
    tiempoVidaUtil: 1825,
    temperaturaAlmacenamiento: '2°C a 8°C',
    estado: 'activo',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nombre: 'HVB Pediátrico',
    tipo: 'Hepatitis B',
    presentacion: 'Frasco unidosis',
    dosisPorFrasco: 1,
    tiempoVidaUtil: 1095,
    temperaturaAlmacenamiento: '2°C a 8°C',
    estado: 'activo',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    nombre: 'Hepatitis B Inactiva',
    tipo: 'Hepatitis B',
    presentacion: 'Jeringa prellenada',
    dosisPorFrasco: 1,
    tiempoVidaUtil: 1095,
    temperaturaAlmacenamiento: '2°C a 8°C',
    estado: 'inactivo', // This should not appear in dropdown
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const normalJeringas: Jeringa[] = [
  {
    id: '1',
    tipo: 'Desechable',
    capacidad: '1ml',
    color: 'Transparente',
    estado: 'activo',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    tipo: 'Desechable',
    capacidad: '5ml',
    color: 'Azul',
    estado: 'activo',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const vacunasWithMissingProps: Vacuna[] = [
  {
    id: '1',
    nombre: '',
    tipo: 'Test',
    presentacion: '',
    dosisPorFrasco: 1,
    tiempoVidaUtil: 365,
    temperaturaAlmacenamiento: '2°C a 8°C',
    estado: 'activo',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nombre: 'BCG',
    tipo: 'Test',
    presentacion: '',
    dosisPorFrasco: 1,
    tiempoVidaUtil: 365,
    temperaturaAlmacenamiento: '2°C a 8°C',
    estado: 'activo',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const DropdownDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [testScenario, setTestScenario] = useState<'normal' | 'empty' | 'missing-props'>('normal');
  const [tipoFijo, setTipoFijo] = useState<'vacuna' | 'jeringa'>('vacuna');

  const getTestData = () => {
    switch (testScenario) {
      case 'empty':
        return { vacunas: [], jeringas: [] };
      case 'missing-props':
        return { vacunas: vacunasWithMissingProps, jeringas: normalJeringas };
      default:
        return { vacunas: normalVacunas, jeringas: normalJeringas };
    }
  };

  const handleSuccess = (tipo: 'vacuna' | 'jeringa', data: any) => {
    console.log('Success:', tipo, data);
    alert(`Éxito: ${tipo} registrada correctamente`);
  };

  const testData = getTestData();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dropdown Component Demo</h1>
      
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Scenario:</label>
            <select 
              value={testScenario} 
              onChange={(e) => setTestScenario(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="normal">Normal Data</option>
              <option value="empty">Empty Arrays</option>
              <option value="missing-props">Missing Properties</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Product Type:</label>
            <select 
              value={tipoFijo} 
              onChange={(e) => setTipoFijo(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="vacuna">Vacuna</option>
              <option value="jeringa">Jeringa</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowModal(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open Modal
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Current Scenario:</strong> {testScenario}</p>
          <p><strong>Product Type:</strong> {tipoFijo}</p>
          <p><strong>Active Vacunas:</strong> {testData.vacunas.filter(v => v.estado === 'activo').length}</p>
          <p><strong>Active Jeringas:</strong> {testData.jeringas.filter(j => j.estado === 'activo').length}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Expected Behavior</h2>
        <div className="space-y-2 text-sm">
          {testScenario === 'normal' && (
            <>
              <p>✅ Should show active {tipoFijo}s in dropdown</p>
              <p>✅ Should filter out inactive items</p>
              <p>✅ Submit button should be enabled</p>
            </>
          )}
          {testScenario === 'empty' && (
            <>
              <p>✅ Dropdown should be disabled</p>
              <p>✅ Should show "No hay ... disponibles" message</p>
              <p>✅ Submit button should be disabled</p>
            </>
          )}
          {testScenario === 'missing-props' && (
            <>
              <p>✅ Should show fallback text for missing properties</p>
              <p>✅ Should display "Sin nombre - Sin presentación" for empty fields</p>
              <p>✅ Should still be functional</p>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <NuevoIngreso
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          vacunas={testData.vacunas}
          jeringas={testData.jeringas}
          tipoFijo={tipoFijo}
        />
      )}
    </div>
  );
};

export default DropdownDemo;
