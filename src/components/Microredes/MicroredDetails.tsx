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
  Business as BuildingIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Microred } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MicroredDetailsProps {
  microred: Microred;
}

const MicroredDetails: React.FC<MicroredDetailsProps> = ({ microred }) => {
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
                {microred.nombre}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {getEstadoChip(microred.estado)}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Código
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {microred.codigo || 'No asignado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Red de Salud
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {microred.red?.nombre || 'Sin red asignada'}
                    {microred.red?.codigo && ` (${microred.red.codigo})`}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    ID del Sistema
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {microred.id}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {microred.descripcion || 'Sin descripción'}
                  </Typography>
                </Grid>
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
                    {formatDate(microred.createdAt)}
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
                    {formatDate(microred.updatedAt)}
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
                    primary="Red Padre"
                    secondary={microred.red?.nombre || 'Sin red asignada'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BuildingIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Centros de Acopio"
                    secondary={`${microred._count?.centrosAcopio || 0} centro(s)`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <HospitalIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Establecimientos"
                    secondary={`${microred._count?.establecimientos || 0} establecimiento(s)`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Centros de Acopio Asociados */}
        {microred.centrosAcopio && microred.centrosAcopio.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Centros de Acopio Asociados
                </Typography>
                
                <Grid container spacing={2}>
                  {microred.centrosAcopio.map((centro) => (
                    <Grid item xs={12} sm={6} md={4} key={centro.id}>
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
                          {centro.nombre}
                        </Typography>
                        
                        {centro.codigo && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Código: {centro.codigo}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Responsable: {centro.responsable}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <HospitalIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {centro._count?.establecimientos || 0} establecimiento(s)
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={centro.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          color={centro.estado === 'activo' ? 'success' : 'default'}
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

        {/* Información de la Red Padre */}
        {microred.red && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Red de Salud Padre
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
                    {microred.red.nombre}
                  </Typography>
                  
                  {microred.red.codigo && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Código: {microred.red.codigo}
                    </Typography>
                  )}
                  
                  {microred.red.descripcion && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {microred.red.descripcion}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NetworkIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {microred.red._count?.microredes || 0} microred(es)
                      </Typography>
                    </Box>
                    
                    <Chip
                      label={microred.red.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      color={microred.red.estado === 'activo' ? 'success' : 'default'}
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
              • Las microredes agrupan establecimientos de salud por proximidad geográfica dentro de una red.
              <br />
              • Cada microred puede contener múltiples centros de acopio para la distribución de insumos.
              <br />
              • Los centros de acopio coordinan el suministro de vacunas y otros insumos médicos.
              <br />
              • Una microred activa puede recibir asignaciones de recursos y planificaciones específicas.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MicroredDetails;
