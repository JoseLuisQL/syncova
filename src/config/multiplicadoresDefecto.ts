/**
 * Configuración por defecto de multiplicadores de jeringas
 * Define qué jeringas y en qué cantidades se necesitan para cada tipo de vacuna
 */

export interface ConfiguracionMultiplicadorDefecto {
  vacunaNombre: string;
  jeringas: {
    tipo: string;
    capacidad: string;
    multiplicador: number; // Cantidad de jeringas por dosis
    prioridad: number; // 1 = principal, 2 = alternativa
  }[];
}

/**
 * Configuraciones por defecto basadas en las mejores prácticas
 * y los tipos de jeringas más comunes en el sistema
 */
export const MULTIPLICADORES_DEFECTO: ConfiguracionMultiplicadorDefecto[] = [
  {
    vacunaNombre: 'BCG',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 27 G x 1/2"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'HVB Pediatrico',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'HVB Adulto',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 1"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Pentavalente',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'APO',
    jeringas: [
      {
        tipo: 'Jeringa 3 mL con aguja 23 G X 1"',
        capacidad: '3ml',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Neumococo',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Rotavirus',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Influenza Pediatrica',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Influenza Adulto',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 1"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      },
      {
        tipo: 'Jeringa 3 mL con aguja 23 G X 1"',
        capacidad: '3ml',
        multiplicador: 2, // Ejemplo: 2 jeringas de 3ml por cada dosis
        prioridad: 2
      }
    ]
  },
  {
    vacunaNombre: 'DPT',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'SPR X 1 DOSIS',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'SPR X 5 DOSIS',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'AMA',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Dt Adulto',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 1"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Dt Pediatrico',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'IPV',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'VPH',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 1"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'Varicela',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'DPTA',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 1"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  },
  {
    vacunaNombre: 'HEPATITIS A',
    jeringas: [
      {
        tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
        capacidad: '1cc',
        multiplicador: 1,
        prioridad: 1
      }
    ]
  }
];

/**
 * Obtiene la configuración por defecto para una vacuna específica
 */
export const getConfiguracionDefecto = (vacunaNombre: string): ConfiguracionMultiplicadorDefecto | null => {
  return MULTIPLICADORES_DEFECTO.find(config => 
    config.vacunaNombre.toLowerCase() === vacunaNombre.toLowerCase()
  ) || null;
};

/**
 * Obtiene todas las jeringas únicas utilizadas en las configuraciones
 */
export const getJeringasUnicas = (): { tipo: string; capacidad: string }[] => {
  const jeringasSet = new Set<string>();
  const jeringas: { tipo: string; capacidad: string }[] = [];

  MULTIPLICADORES_DEFECTO.forEach(config => {
    config.jeringas.forEach(jeringa => {
      const key = `${jeringa.tipo}-${jeringa.capacidad}`;
      if (!jeringasSet.has(key)) {
        jeringasSet.add(key);
        jeringas.push({
          tipo: jeringa.tipo,
          capacidad: jeringa.capacidad
        });
      }
    });
  });

  return jeringas.sort((a, b) => a.tipo.localeCompare(b.tipo));
};

/**
 * Calcula las jeringas necesarias para una vacuna y cantidad específica
 * usando la configuración por defecto
 */
export const calcularJeringasDefecto = (
  vacunaNombre: string, 
  cantidadVacunas: number, 
  dosisPorFrasco: number = 1
): { tipo: string; capacidad: string; cantidad: number }[] => {
  const config = getConfiguracionDefecto(vacunaNombre);
  
  if (!config) {
    // Si no hay configuración específica, usar jeringa estándar
    return [{
      tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"',
      capacidad: '1cc',
      cantidad: cantidadVacunas * dosisPorFrasco
    }];
  }

  return config.jeringas.map(jeringa => ({
    tipo: jeringa.tipo,
    capacidad: jeringa.capacidad,
    cantidad: cantidadVacunas * dosisPorFrasco * jeringa.multiplicador
  }));
};

/**
 * Valida si una configuración de multiplicadores es válida
 */
export const validarConfiguracion = (config: ConfiguracionMultiplicadorDefecto): string[] => {
  const errores: string[] = [];

  if (!config.vacunaNombre || config.vacunaNombre.trim() === '') {
    errores.push('El nombre de la vacuna es requerido');
  }

  if (!config.jeringas || config.jeringas.length === 0) {
    errores.push('Debe configurar al menos una jeringa');
  }

  config.jeringas.forEach((jeringa, index) => {
    if (!jeringa.tipo || jeringa.tipo.trim() === '') {
      errores.push(`Jeringa ${index + 1}: El tipo es requerido`);
    }

    if (!jeringa.capacidad || jeringa.capacidad.trim() === '') {
      errores.push(`Jeringa ${index + 1}: La capacidad es requerida`);
    }

    if (jeringa.multiplicador <= 0) {
      errores.push(`Jeringa ${index + 1}: El multiplicador debe ser mayor a 0`);
    }

    if (jeringa.prioridad <= 0) {
      errores.push(`Jeringa ${index + 1}: La prioridad debe ser mayor a 0`);
    }
  });

  return errores;
};
