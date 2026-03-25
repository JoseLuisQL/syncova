import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';

// Importar componentes de módulos
import Dashboard from '../Dashboard/Dashboard';
import EstablecimientosModule from '../Establecimientos/EstablecimientosModule';
import Inventario from '../Inventario/Inventario';
import Movimientos from '../Movimientos/Movimientos';
import Planificacion from '../Planificacion/Planificacion';
import IciDemid from '../IciDemid/IciDemid';
import Kardex from '../Kardex/Kardex';
import Reportes from '../Reportes/Reportes';
import AlertasModule from '../Alertas/AlertasModule';
import UsuariosModule from '../Usuarios/UsuariosModule';
import Configuracion from '../Configuracion/Configuracion';

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

      <Route
        path="/ici-demid/*"
        element={
          <ProtectedRoute>
            <IciDemid />
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
      
      {/* Reportes - con rutas anidadas */}
      <Route 
        path="/reportes/*" 
        element={
          <ProtectedRoute>
            <Reportes />
          </ProtectedRoute>
        } 
      />
      
      {/* Alertas - con rutas anidadas */}
      <Route 
        path="/alertas/*" 
        element={
          <ProtectedRoute>
            <AlertasModule />
          </ProtectedRoute>
        } 
      />
      
      {/* Usuarios */}
      <Route 
        path="/usuarios/*" 
        element={
          <ProtectedRoute requiredRoles={['administrador']}>
            <UsuariosModule />
          </ProtectedRoute>
        } 
      />
      
      {/* Configuración */}
      <Route 
        path="/configuracion/*" 
        element={
          <ProtectedRoute requiredRoles={['administrador']}>
            <Configuracion />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta 404 - redirigir al dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
