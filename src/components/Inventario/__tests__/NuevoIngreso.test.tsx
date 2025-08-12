import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NuevoIngreso from '../NuevoIngreso';
import { Vacuna, Jeringa } from '../../../types';

// Mock data
const mockVacunas: Vacuna[] = [
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
    nombre: 'Hepatitis B',
    tipo: 'Hepatitis B',
    presentacion: 'Jeringa prellenada',
    dosisPorFrasco: 1,
    tiempoVidaUtil: 1095,
    temperaturaAlmacenamiento: '2°C a 8°C',
    estado: 'inactivo', // This one is inactive
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockJeringas: Jeringa[] = [
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

const mockProps = {
  onClose: jest.fn(),
  onSuccess: jest.fn(),
  vacunas: mockVacunas,
  jeringas: mockJeringas,
};

describe('NuevoIngreso Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with vacuna type', () => {
    render(<NuevoIngreso {...mockProps} tipoFijo="vacuna" />);
    
    expect(screen.getByText('Nuevo Ingreso de Inventario')).toBeInTheDocument();
    expect(screen.getByText('Datos del Lote de Vacuna')).toBeInTheDocument();
  });

  test('renders correctly with jeringa type', () => {
    render(<NuevoIngreso {...mockProps} tipoFijo="jeringa" />);
    
    expect(screen.getByText('Datos del Lote de Jeringa')).toBeInTheDocument();
  });

  test('shows only active vacunas in select', () => {
    render(<NuevoIngreso {...mockProps} tipoFijo="vacuna" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Solo debería mostrar la vacuna activa (BCG)
    expect(screen.getByText('BCG - Frasco multidosis')).toBeInTheDocument();
    expect(screen.queryByText('Hepatitis B - Jeringa prellenada')).not.toBeInTheDocument();
  });

  test('shows all active jeringas in select', () => {
    render(<NuevoIngreso {...mockProps} tipoFijo="jeringa" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Debería mostrar ambas jeringas activas
    expect(screen.getByText('Desechable 1ml - Transparente')).toBeInTheDocument();
    expect(screen.getByText('Desechable 5ml - Azul')).toBeInTheDocument();
  });

  test('handles empty vacunas array', () => {
    render(<NuevoIngreso {...mockProps} vacunas={[]} tipoFijo="vacuna" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(screen.getByText('No hay vacunas activas disponibles')).toBeInTheDocument();
    expect(screen.getByText(/No hay vacunas activas disponibles/)).toBeInTheDocument();
  });

  test('handles empty jeringas array', () => {
    render(<NuevoIngreso {...mockProps} jeringas={[]} tipoFijo="jeringa" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(screen.getByText('No hay jeringas activas disponibles')).toBeInTheDocument();
  });

  test('handles vacunas with missing properties gracefully', () => {
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
      }
    ];

    render(<NuevoIngreso {...mockProps} vacunas={vacunasWithMissingProps} tipoFijo="vacuna" />);
    
    // Debería mostrar fallbacks para propiedades faltantes
    expect(screen.getByText('Sin nombre - Sin presentación')).toBeInTheDocument();
  });

  test('disables submit button when no options available', () => {
    render(<NuevoIngreso {...mockProps} vacunas={[]} tipoFijo="vacuna" />);
    
    const submitButton = screen.getByText('Registrar Ingreso');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('cursor-not-allowed');
  });

  test('enables submit button when options are available', () => {
    render(<NuevoIngreso {...mockProps} tipoFijo="vacuna" />);
    
    const submitButton = screen.getByText('Registrar Ingreso');
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).not.toHaveClass('cursor-not-allowed');
  });

  test('shows validation error for empty selection', async () => {
    render(<NuevoIngreso {...mockProps} tipoFijo="vacuna" />);
    
    const submitButton = screen.getByText('Registrar Ingreso');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Debe seleccionar una vacuna')).toBeInTheDocument();
    });
  });

  test('calls onSuccess with correct data when form is valid', async () => {
    render(<NuevoIngreso {...mockProps} tipoFijo="vacuna" />);
    
    // Fill form
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    
    const numeroInput = screen.getByPlaceholderText('Ej: BCG-2024-001');
    fireEvent.change(numeroInput, { target: { value: 'TEST-001' } });
    
    const cantidadInput = screen.getByPlaceholderText('0');
    fireEvent.change(cantidadInput, { target: { value: '100' } });
    
    const fechaVencimientoInput = screen.getByDisplayValue('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(fechaVencimientoInput, { 
      target: { value: tomorrow.toISOString().split('T')[0] } 
    });
    
    const comprobanteInput = screen.getByPlaceholderText('Ej: P-001-2024');
    fireEvent.change(comprobanteInput, { target: { value: 'P-001-2024' } });
    
    const submitButton = screen.getByText('Registrar Ingreso');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalledWith('vacuna', expect.objectContaining({
        numero: 'TEST-001',
        vacunaId: '1',
        cantidadInicial: 100,
        numeroComprobante: 'P-001-2024'
      }));
    });
  });
});
