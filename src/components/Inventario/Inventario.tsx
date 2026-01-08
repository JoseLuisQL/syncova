import React, { useState, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import NuevoIngreso from './NuevoIngreso';
import LotesVacunasPage from './LotesVacunasPage';
import LotesJeringasPage from './LotesJeringasPage';
import GestionVacunas from './GestionVacunas';
import GestionJeringas from './GestionJeringas';
import ConfiguracionJeringas from './ConfiguracionJeringas';
import { useVacunas } from '../../hooks/useVacunas';
import { useJeringas } from '../../hooks/useJeringas';
import { useLotesVacunas } from '../../hooks/useLotesVacunas';
import { useLotesJeringas } from '../../hooks/useLotesJeringas';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { INVENTORY_SECTIONS, COMPONENT_STYLES } from './constants';
import { CreateLoteVacunaDto, CreateLoteJeringaDto } from '../../types';

const Inventario: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();
  const [showNuevoIngreso, setShowNuevoIngreso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canAccessSection, hasPermission } = usePermissions();

  const { vacunasActivas, loadVacunasActivas, isLoadingActivas: isLoadingVacunas } = useVacunas();
  const { jeringasActivas, loadJeringasActivas, isLoadingActivas: isLoadingJeringas } = useJeringas();
  const { createLote: createLoteVacuna } = useLotesVacunas();
  const { createLote: createLoteJeringa } = useLotesJeringas();
  const { toast } = useToastContext();

  // Filtrar secciones según permisos
  const filteredSections = useMemo(() => {
    return INVENTORY_SECTIONS.filter(section => canAccessSection('inventario', section.id));
  }, [canAccessSection]);

  // Verificar si puede registrar ingresos
  const canRegisterIngreso = hasPermission('inventario:ingreso');

  React.useEffect(() => {
    if (showNuevoIngreso) {
      loadVacunasActivas();
      loadJeringasActivas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNuevoIngreso]);

  const handleNuevoIngresoSuccess = useCallback(async (tipo: 'vacuna' | 'jeringa', data: any) => {
    setIsSubmitting(true);
    try {
      if (tipo === 'vacuna') {
        const loteData: CreateLoteVacunaDto = {
          numero: data.numero,
          vacunaId: data.vacunaId,
          fechaIngreso: data.fechaIngreso instanceof Date ? data.fechaIngreso.toISOString() : data.fechaIngreso,
          fechaVencimiento: data.fechaVencimiento instanceof Date ? data.fechaVencimiento.toISOString() : data.fechaVencimiento,
          formaIngreso: data.formaIngreso,
          comprobanteClase: data.comprobanteClase,
          numeroComprobante: data.numeroComprobante,
          cantidadInicial: data.cantidadInicial,
          cantidadActual: data.cantidadInicial,
          observaciones: data.observaciones || undefined,
        };
        const result = await createLoteVacuna(loteData);
        if (result.success) {
          toast.success('Lote de vacuna registrado exitosamente');
        } else {
          const errorMsg = result.error || 'Error al registrar el lote de vacuna';
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }
      } else {
        const loteData: CreateLoteJeringaDto = {
          numero: data.numero,
          jeringaId: data.jeringaId,
          fechaIngreso: data.fechaIngreso instanceof Date ? data.fechaIngreso.toISOString() : data.fechaIngreso,
          fechaVencimiento: data.fechaVencimiento instanceof Date ? data.fechaVencimiento.toISOString() : (data.fechaVencimiento || undefined),
          formaIngreso: data.formaIngreso,
          comprobanteClase: data.comprobanteClase,
          numeroComprobante: data.numeroComprobante,
          cantidadInicial: data.cantidadInicial,
          cantidadActual: data.cantidadInicial,
          observaciones: data.observaciones || undefined,
        };
        const result = await createLoteJeringa(loteData);
        if (result.success) {
          toast.success('Lote de jeringa registrado exitosamente');
        } else {
          const errorMsg = result.error || 'Error al registrar el lote de jeringa';
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }
      }
      setShowNuevoIngreso(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [createLoteVacuna, createLoteJeringa, toast]);

  const handleOpenNuevoIngreso = useCallback(() => {
    setShowNuevoIngreso(true);
  }, []);

  const handleCloseNuevoIngreso = useCallback(() => {
    setShowNuevoIngreso(false);
  }, []);

  const activeSection = useMemo(() => 
    currentSubModule || 'vacunas',
  [currentSubModule]);

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={COMPONENT_STYLES.header.iconWrapper}>
                <Package className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Inventario
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Gestion de vacunas, jeringas y lotes
                </p>
              </div>
            </div>

            {canRegisterIngreso && (
              <button
                onClick={handleOpenNuevoIngreso}
                className={COMPONENT_STYLES.button.primary}
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span>Nuevo Ingreso</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-100 sticky top-[73px] z-10" aria-label="Secciones">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => navigateToModule('inventario', section.id)}
                  className={`${COMPONENT_STYLES.nav.tab} ${
                    isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                  } flex-shrink-0`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="vacunas" replace />} />
            <Route path="vacunas" element={<GestionVacunas />} />
            <Route path="jeringas" element={<GestionJeringas />} />
            <Route path="lotes-vacunas" element={<LotesVacunasPage />} />
            <Route path="lotes-jeringas" element={<LotesJeringasPage />} />
            <Route path="configuracion-jeringas" element={<ConfiguracionJeringas />} />
          </Routes>
        </div>
      </div>

      {/* Modal de Nuevo Ingreso */}
      {showNuevoIngreso && (
        <NuevoIngreso
          onClose={handleCloseNuevoIngreso}
          onSuccess={handleNuevoIngresoSuccess}
          vacunas={vacunasActivas}
          jeringas={jeringasActivas}
          isLoadingVacunas={isLoadingVacunas}
          isLoadingJeringas={isLoadingJeringas}
        />
      )}
    </main>
  );
};

export default Inventario;
