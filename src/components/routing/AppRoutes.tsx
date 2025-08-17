import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';

// Importar componentes de módulos
import Dashboard from '../Dashboard/Dashboard';
import EstablecimientosModule from '../Establecimientos/EstablecimientosModule';
import Inventario from '../Inventario/Inventario';
import Movimientos from '../Movimientos/Movimientos';
import Planificacion from '../Planificacion/Planificacion';
import Kardex from '../Kardex/Kardex';
import Reportes from '../Reportes/Reportes';
import Alertas from '../Alertas/Alertas';
import Usuarios from '../Usuarios/Usuarios';
import Configuracion from '../Configuracion/Configuracion';
import VacunasDebug from '../Debug/VacunasDebug';

/**
 * Componente de rutas principales de la aplicación
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ruta raíz - redirigir al dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Establecimientos - con rutas anidadas */}
      <Route 
        path="/establecimientos/*" 
        element={
          <ProtectedRoute>
            <EstablecimientosModule />
          </ProtectedRoute>
        } 
      />
      
      {/* Inventario - con rutas anidadas */}
      <Route 
        path="/inventario/*" 
        element={
          <ProtectedRoute>
            <Inventario />
          </ProtectedRoute>
        } 
      />
      
      {/* Movimientos */}
      <Route 
        path="/movimientos" 
        element={
          <ProtectedRoute>
            <Movimientos />
          </ProtectedRoute>
        } 
      />
      
      {/* Planificación - con rutas anidadas */}
      <Route 
        path="/planificacion/*" 
        element={
          <ProtectedRoute>
            <Planificacion />
          </ProtectedRoute>
        } 
      />
      
      {/* Kardex */}
      <Route 
        path="/kardex" 
        element={
          <ProtectedRoute>
            <Kardex />
          </ProtectedRoute>
        } 
      />
      
      {/* Reportes */}
      <Route 
        path="/reportes" 
        element={
          <ProtectedRoute>
            <Reportes />
          </ProtectedRoute>
        } 
      />
      
      {/* Alertas */}
      <Route 
        path="/alertas" 
        element={
          <ProtectedRoute>
            <Alertas />
          </ProtectedRoute>
        } 
      />
      
      {/* Usuarios */}
      <Route 
        path="/usuarios" 
        element={
          <ProtectedRoute requiredRoles={['administrador']}>
            <Usuarios />
          </ProtectedRoute>
        } 
      />
      
      {/* Configuración */}
      <Route 
        path="/configuracion" 
        element={
          <ProtectedRoute requiredRoles={['administrador']}>
            <Configuracion />
          </ProtectedRoute>
        } 
      />
      
      {/* Debug */}
      <Route 
        path="/debug" 
        element={
          <ProtectedRoute requiredRoles={['administrador']}>
            <VacunasDebug />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta 404 - redirigir al dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
