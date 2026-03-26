import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { CentroAcopio, CreateCentroAcopioDto, UpdateCentroAcopioDto } from '@/types';
import CascadingSelector from '@/components/common/CascadingSelector';

interface CentroAcopioFormProps {
  centroAcopio?: CentroAcopio | null;
  onSubmit: (data: CreateCentroAcopioDto | UpdateCentroAcopioDto) => void;
  onCancel: () => void;
}

const CentroAcopioForm: React.FC<CentroAcopioFormProps> = ({ centroAcopio, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    direccion: '',
    responsable: '',
    telefono: '',
    email: '',
    redId: '',
    microredId: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del centro de acopio si está editando
  useEffect(() => {
    if (centroAcopio) {
      setFormData({
        nombre: centroAcopio.nombre || '',
        codigo: centroAcopio.codigo || '',
        descripcion: centroAcopio.descripcion || '',
        direccion: centroAcopio.direccion || '',
        responsable: centroAcopio.responsable || '',
        telefono: centroAcopio.telefono || '',
        email: centroAcopio.email || '',
        redId: centroAcopio.microred?.redId || '',
        microredId: centroAcopio.microredId || '',
        estado: centroAcopio.estado as 'activo' | 'inactivo'
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        direccion: '',
        responsable: '',
        telefono: '',
        email: '',
        redId: '',
        microredId: '',
        estado: 'activo'
      });
    }
    setErrors({});
  }, [centroAcopio]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre (requerido)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 255) {
      newErrors.nombre = 'El nombre no puede exceder 255 caracteres';
    }

    // Validar microred (requerido)
    if (!formData.microredId) {
      newErrors.microredId = 'La microred es requerida';
    }

    // Validar responsable (requerido)
    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    } else if (formData.responsable.trim().length > 255) {
      newErrors.responsable = 'El responsable no puede exceder 255 caracteres';
    }

    // Validar código (opcional, pero si se proporciona debe ser válido)
    if (formData.codigo && formData.codigo.trim()) {
      if (formData.codigo.trim().length < 2) {
        newErrors.codigo = 'El código debe tener al menos 2 caracteres';
      } else if (formData.codigo.trim().length > 50) {
        newErrors.codigo = 'El código no puede exceder 50 caracteres';
      } else if (!/^[A-Z0-9-_]+$/i.test(formData.codigo.trim())) {
        newErrors.codigo = 'El código solo puede contener letras, números, guiones y guiones bajos';
      }
    }

    // Validar dirección (opcional)
    if (formData.direccion && formData.direccion.trim().length > 500) {
      newErrors.direccion = 'La dirección no puede exceder 500 caracteres';
    }

    // Validar teléfono (opcional)
    if (formData.telefono && formData.telefono.trim()) {
      if (!/^[\d\s\-\+\(\)]+$/.test(formData.telefono.trim())) {
        newErrors.telefono = 'El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +';
      } else if (formData.telefono.trim().length > 20) {
        newErrors.telefono = 'El teléfono no puede exceder 20 caracteres';
      }
    }

    // Validar email (opcional)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'El email debe tener un formato válido';
      } else if (formData.email.trim().length > 255) {
        newErrors.email = 'El email no puede exceder 255 caracteres';
      }
    }

    // Validar descripción (opcional)
    if (formData.descripcion && formData.descripcion.trim().length > 1000) {
      newErrors.descripcion = 'La descripción no puede exceder 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCascadingChange = (redId: string, microredId: string) => {
    setFormData(prev => ({
      ...prev,
      redId,
      microredId
    }));

    // Limpiar errores relacionados
    if (errors.microredId) {
      setErrors(prev => ({
        ...prev,
        microredId: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim() || undefined,
        descripcion: formData.descripcion.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        responsable: formData.responsable.trim(),
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        microredId: formData.microredId,
        ...(centroAcopio && { estado: formData.estado })
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (centroAcopio) {
      setFormData({
        nombre: centroAcopio.nombre || '',
        codigo: centroAcopio.codigo || '',
        descripcion: centroAcopio.descripcion || '',
        direccion: centroAcopio.direccion || '',
        responsable: centroAcopio.responsable || '',
        telefono: centroAcopio.telefono || '',
        email: centroAcopio.email || '',
        redId: centroAcopio.microred?.redId || '',
        microredId: centroAcopio.microredId || '',
        estado: centroAcopio.estado as 'activo' | 'inactivo'
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        direccion: '',
        responsable: '',
        telefono: '',
        email: '',
        redId: '',
        microredId: '',
        estado: 'activo'
      });
    }
    setErrors({});
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Información básica */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Información Básica
          </Typography>
        </Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Nombre del Centro de Acopio"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            error={!!errors.nombre}
            helperText={errors.nombre || 'Nombre descriptivo del centro de acopio'}
            required
            placeholder="Ej: Centro de Acopio Huancabamba"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Código"
            value={formData.codigo}
            onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
            error={!!errors.codigo}
            helperText={errors.codigo || 'Código único de identificación (opcional)'}
            placeholder="Ej: CA-HCB"
          />
        </Grid>

        {/* Selector en cascada */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Ubicación en la Estructura
          </Typography>
          <CascadingSelector
            selectedRedId={formData.redId}
            selectedMicroredId={formData.microredId}
            onRedChange={(redId) => handleCascadingChange(redId, '')}
            onMicroredChange={(microredId) => handleCascadingChange(formData.redId, microredId)}
            showCentroAcopio={false}
            required={{ microred: true }}
            errors={{ microred: errors.microredId }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Responsable"
            value={formData.responsable}
            onChange={(e) => handleInputChange('responsable', e.target.value)}
            error={!!errors.responsable}
            helperText={errors.responsable || 'Nombre del responsable del centro de acopio'}
            required
            placeholder="Ej: Dr. Juan Pérez Rodríguez"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => handleInputChange('telefono', e.target.value)}
            error={!!errors.telefono}
            helperText={errors.telefono || 'Número de teléfono de contacto (opcional)'}
            placeholder="Ej: 083-421234"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email || 'Correo electrónico de contacto (opcional)'}
            placeholder="Ej: centro.huancabamba@salud.gob.pe"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => handleInputChange('direccion', e.target.value)}
            error={!!errors.direccion}
            helperText={errors.direccion || 'Dirección física del centro de acopio (opcional)'}
            multiline
            rows={2}
            placeholder="Dirección completa del centro de acopio..."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            error={!!errors.descripcion}
            helperText={errors.descripcion || 'Descripción detallada del centro de acopio (opcional)'}
            multiline
            rows={3}
            placeholder="Descripción del centro de acopio, sus funciones y características principales..."
          />
        </Grid>

        {/* Estado (solo para edición) */}
        {centroAcopio && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                label="Estado"
                onChange={(e) => handleInputChange('estado', e.target.value)}
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Información adicional para edición */}
        {centroAcopio && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Información:</strong> Este centro de acopio tiene {centroAcopio._count?.establecimientos || 0} establecimiento(s) asociado(s).
                {centroAcopio._count?.establecimientos > 0 && ' No podrá eliminar este centro mientras tenga establecimientos asociados.'}
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Botones de acción */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
            >
              Restablecer
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (centroAcopio ? 'Actualizar' : 'Crear')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CentroAcopioForm;
 