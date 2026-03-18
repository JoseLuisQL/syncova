export const formatCompactDate = (value: Date | string) =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const formatLastUpdated = (value?: Date | string | null) => {
  if (!value) return 'Sin actualización reciente';
  return `Actualizado ${formatDateTime(value)}`;
};

export const getFechaPeruActual = () => {
  const ahora = new Date();
  const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
  return fechaPeru.toISOString().split('T')[0];
};

export const getFechaPeruMesAnterior = () => {
  const ahora = new Date();
  const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
  fechaPeru.setMonth(fechaPeru.getMonth() - 1);
  return fechaPeru.toISOString().split('T')[0];
};
