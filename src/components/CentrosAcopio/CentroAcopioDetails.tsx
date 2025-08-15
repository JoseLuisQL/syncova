import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  AccountTree as NetworkIcon,
  Hub as MicroredIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { CentroAcopio } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CentroAcopioDetailsProps {
  centroAcopio: CentroAcopio;
}

const CentroAcopioDetails: React.FC<CentroAcopioDetailsProps> = ({ centroAcopio }) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const getEstadoChip = (estado: string) => {
    return (
      <Chip
        label={estado === 'activo' ? 'Activo' : 'Inactivo'}
        color={estado === 'activo' ? 'success' : 'default'}
        size="medium"
      />
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Información Principal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {centroAcopio.nombre}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {getEstadoChip(centroAcopio.estado)}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Código
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {centroAcopio.codigo || 'No asignado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Microred
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {centroAcopio.microred?.nombre || 'Sin microred asignada'}
                    {centroAcopio.microred?.codigo && ` (${centroAcopio.microred.codigo})`}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Red de Salud
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {centroAcopio.microred?.red?.nombre || 'Sin red asignada'}
                    {centroAcopio.microred?.red?.codigo && ` (${centroAcopio.microred.red.codigo})`}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    ID del Sistema
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {centroAcopio.id}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {centroAcopio.descripcion || 'Sin descripción'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Información de Contacto */}
              <Typography variant="h6" gutterBottom>
                Información de Contacto
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Responsable:
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {centroAcopio.responsable || 'No asignado'}
                  </Typography>
                </Grid>

                {centroAcopio.telefono && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Teléfono:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {centroAcopio.telefono}
                    </Typography>
                  </Grid>
                )}

                {centroAcopio.email && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Email:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {centroAcopio.email}
                    </Typography>
                  </Grid>
                )}

                {centroAcopio.direccion && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Dirección:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {centroAcopio.direccion}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fechas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Creado:
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {formatDate(centroAcopio.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Actualizado:
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {formatDate(centroAcopio.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <NetworkIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Red de Salud"
                    secondary={centroAcopio.microred?.red?.nombre || 'Sin red asignada'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <MicroredIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Microred"
                    secondary={centroAcopio.microred?.nombre || 'Sin microred asignada'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <HospitalIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Establecimientos"
                    secondary={`${centroAcopio._count?.establecimientos || 0} establecimiento(s)`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Establecimientos Asociados */}
        {centroAcopio.establecimientos && centroAcopio.establecimientos.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Establecimientos Asociados
                </Typography>
                
                <Grid container spacing={2}>
                  {centroAcopio.establecimientos.map((establecimiento) => (
                    <Grid item xs={12} sm={6} md={4} key={establecimiento.id}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {establecimiento.nombre}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Tipo: {establecimiento.tipo.replace('_', ' ').toUpperCase()}
                        </Typography>
                        
                        {establecimiento.codigo && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Código: {establecimiento.codigo}
                          </Typography>
                        )}
                        
                        {establecimiento.responsable && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Responsable: {establecimiento.responsable}
                          </Typography>
                        )}
                        
                        <Chip
                          label={establecimiento.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          color={establecimiento.estado === 'activo' ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Información de la Estructura Jerárquica */}
        {centroAcopio.microred && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estructura Jerárquica
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    backgroundColor: 'background.default'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {centroAcopio.microred.red?.nombre || 'Red no asignada'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ↳ {centroAcopio.microred.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    &nbsp;&nbsp;&nbsp;&nbsp;↳ {centroAcopio.nombre}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip
                      label={`Red: ${centroAcopio.microred.red?.estado === 'activo' ? 'Activa' : 'Inactiva'}`}
                      color={centroAcopio.microred.red?.estado === 'activo' ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`Microred: ${centroAcopio.microred.estado === 'activo' ? 'Activa' : 'Inactiva'}`}
                      color={centroAcopio.microred.estado === 'activo' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Información Adicional */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="subtitle2" color="info.main">
                Información Adicional
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              • Los centros de acopio son puntos estratégicos para la distribución de insumos médicos.
              <br />
              • Cada centro de acopio pertenece a una microred específica dentro de una red de salud.
              <br />
              • Los centros coordinan el suministro de vacunas y otros insumos a los establecimientos asociados.
              <br />
              • Un centro activo puede recibir asignaciones de recursos y coordinar distribuciones.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CentroAcopioDetails;
