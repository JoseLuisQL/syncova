import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';

// Carga diferida (code splitting) de los módulos: cada uno se descarga
// solo cuando se navega a su ruta, reduciendo el bundle inicial.
const Dashboard = lazy(() => import('../Dashboard/Dashboard'));
const EstablecimientosModule = lazy(() => import('../Establecimientos/EstablecimientosModule'));
const Inventario = lazy(() => import('../Inventario/Inventario'));
const Movimientos = lazy(() => import('../Movimientos/Movimientos'));
const Planificacion = lazy(() => import('../Planificacion/Planificacion'));
const IciDemid = lazy(() => import('../IciDemid/IciDemid'));
const Kardex = lazy(() => import('../Kardex/Kardex'));
const Reportes = lazy(() => import('../Reportes/Reportes'));
const AlertasModule = lazy(() => import('../Alertas/AlertasModule'));
const UsuariosModule = lazy(() => import('../Usuarios/UsuariosModule'));
const Configuracion = lazy(() => import('../Configuracion/Configuracion'));

/**
 * Fallback mostrado mientras se descarga el chunk del módulo.
 */
const RouteFallback: React.FC = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <div className="flex items-center gap-3 text-zinc-500">
      <div className="h-5 w-5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
      <span className="text-sm font-medium">Cargando módulo...</span>
    </div>
  </div>
);

/**
 * Componente de rutas principales de la aplicación
 */
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
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
          <ProtectedRoute requiredRoles={['administrador']}>
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
    </Suspense>
  );
};

export default AppRoutes;
