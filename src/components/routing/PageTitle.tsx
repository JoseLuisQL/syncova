import { useEffect } from 'react';
import { usePageTitle, useCurrentRoute } from '../../hooks/useRouting';

/**
 * Componente para gestionar el título de la página y meta tags dinámicamente
 */
const PageTitle: React.FC = () => {
  const pageTitle = usePageTitle();
  const { currentModule, currentSubModule } = useCurrentRoute();

  useEffect(() => {
    // Actualizar título de la página
    document.title = pageTitle;

    // Actualizar meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', getMetaDescription(currentModule, currentSubModule));
    }

    // Actualizar meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', getMetaKeywords(currentModule, currentSubModule));
    } else {
      // Crear meta keywords si no existe
      const keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      keywordsMeta.content = getMetaKeywords(currentModule, currentSubModule);
      document.head.appendChild(keywordsMeta);
    }
  }, [pageTitle, currentModule, currentSubModule]);

  return null; // Este componente no renderiza nada
};

/**
 * Obtener descripción meta basada en el módulo actual
 */
const getMetaDescription = (module: string, subModule?: string | null): string => {
  const descriptions: Record<string, string> = {
    dashboard: 'Panel principal del Sistema Integral de Gestión de Vacunas SIVAC - DIRESA Apurímac II',
    establecimientos: 'Gestión de establecimientos de salud, redes, microredes y centros de acopio',
    inventario: 'Control de inventario de vacunas y jeringas con gestión de lotes y vencimientos',
    movimientos: 'Registro y seguimiento de movimientos de vacunas entre establecimientos',
    planificacion: 'Planificación anual de distribución de vacunas por establecimiento',
    kardex: 'Kardex detallado de movimientos y stock de vacunas',
    reportes: 'Reportes y análisis estadísticos del sistema de vacunación',
    alertas: 'Sistema de alertas y notificaciones para gestión de vacunas',
    usuarios: 'Gestión de usuarios y permisos del sistema',
    configuracion: 'Configuración general del sistema SIVAC',
    debug: 'Herramientas de depuración y diagnóstico del sistema'
  };

  let description = descriptions[module] || descriptions.dashboard;

  if (subModule) {
    const subDescriptions: Record<string, string> = {
      redes: 'Gestión de redes de salud regionales',
      microredes: 'Administración de microredes por proximidad geográfica',
      'centros-acopio': 'Control de centros de acopio para distribución',
      vacunas: 'Catálogo y gestión de tipos de vacunas',
      jeringas: 'Inventario de jeringas y material médico',
      'lotes-vacunas': 'Control de lotes de vacunas y fechas de vencimiento',
      'lotes-jeringas': 'Gestión de lotes de jeringas',
      recepcion: 'Registro de nuevos ingresos al inventario',
      programacion: 'Programación anual por tipo de vacuna',
      importar: 'Importación masiva de datos de planificación',
      distribucion: 'Distribución automática de vacunas',
    };

    if (subDescriptions[subModule]) {
      description = `${subDescriptions[subModule]} - ${description}`;
    }
  }

  return description;
};

/**
 * Obtener palabras clave meta basadas en el módulo actual
 */
const getMetaKeywords = (module: string, subModule?: string | null): string => {
  const baseKeywords = 'SIVAC, vacunas, DIRESA, Apurímac, salud, inmunización, gestión, inventario';

  const moduleKeywords: Record<string, string> = {
    dashboard: 'dashboard, panel, estadísticas',
    establecimientos: 'establecimientos, redes, microredes, centros acopio',
    inventario: 'inventario, stock, lotes, vencimientos',
    movimientos: 'movimientos, transferencias, distribución',
    planificacion: 'planificación, programación, distribución anual',
    kardex: 'kardex, historial, movimientos',
    reportes: 'reportes, análisis, estadísticas',
    alertas: 'alertas, notificaciones, avisos',
    usuarios: 'usuarios, permisos, administración',
    configuracion: 'configuración, ajustes, sistema',
    debug: 'debug, depuración, diagnóstico'
  };

  let keywords = `${baseKeywords}, ${moduleKeywords[module] || ''}`;

  if (subModule) {
    const subKeywords: Record<string, string> = {
      redes: 'redes salud',
      microredes: 'microredes',
      'centros-acopio': 'centros acopio',
      vacunas: 'catálogo vacunas',
      jeringas: 'jeringas material médico',
      'lotes-vacunas': 'lotes vacunas',
      'lotes-jeringas': 'lotes jeringas',
      recepcion: 'recepción ingresos',
      programacion: 'programación anual',
      importar: 'importación datos',
      distribucion: 'distribución automática'
    };

    if (subKeywords[subModule]) {
      keywords += `, ${subKeywords[subModule]}`;
    }
  }

  return keywords;
};

export default PageTitle;
