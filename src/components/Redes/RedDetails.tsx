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
import { Red } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RedDetailsProps {
  red: Red;
}

const RedDetails: React.FC<RedDetailsProps> = ({ red }) => {
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
                {red.nombre}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {getEstadoChip(red.estado)}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Código
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {red.codigo || 'No asignado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    ID del Sistema
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {red.id}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {red.descripcion || 'Sin descripción'}
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
                    {formatDate(red.createdAt)}
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
                    {formatDate(red.updatedAt)}
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
                    primary="Microredes"
                    secondary={`${red._count?.microredes || 0} microred(es)`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BuildingIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Centros de Acopio"
                    secondary={`${red._count?.centrosAcopio || 0} centro(s)`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <HospitalIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Establecimientos"
                    secondary={`${red._count?.establecimientos || 0} establecimiento(s)`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Microredes Asociadas */}
        {red.microredes && red.microredes.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Microredes Asociadas
                </Typography>
                
                <Grid container spacing={2}>
                  {red.microredes.map((microred) => (
                    <Grid item xs={12} sm={6} md={4} key={microred.id}>
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
                          {microred.nombre}
                        </Typography>
                        
                        {microred.codigo && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Código: {microred.codigo}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <BuildingIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {microred._count?.centrosAcopio || 0} centro(s) de acopio
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={microred.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          color={microred.estado === 'activo' ? 'success' : 'default'}
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
              • Las redes de salud organizan y coordinan los servicios de salud en una región específica.
              <br />
              • Cada red puede contener múltiples microredes que agrupan establecimientos por proximidad geográfica.
              <br />
              • Los centros de acopio son puntos estratégicos para la distribución de insumos médicos.
              <br />
              • Una red activa puede recibir asignaciones de recursos y planificaciones.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RedDetails;
