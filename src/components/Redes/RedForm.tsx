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
  Alert
} from '@mui/material';
import { Red, CreateRedDto, UpdateRedDto } from '@/types';

interface RedFormProps {
  red?: Red | null;
  onSubmit: (data: CreateRedDto | UpdateRedDto) => void;
  onCancel: () => void;
}

const RedForm: React.FC<RedFormProps> = ({ red, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del red si está editando
  useEffect(() => {
    if (red) {
      setFormData({
        nombre: red.nombre || '',
        codigo: red.codigo || '',
        descripcion: red.descripcion || '',
        estado: red.estado as 'activo' | 'inactivo'
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        estado: 'activo'
      });
    }
    setErrors({});
  }, [red]);

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
        ...(red && { estado: formData.estado })
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (red) {
      setFormData({
        nombre: red.nombre || '',
        codigo: red.codigo || '',
        descripcion: red.descripcion || '',
        estado: red.estado as 'activo' | 'inactivo'
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
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
            label="Nombre de la Red"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            error={!!errors.nombre}
            helperText={errors.nombre || 'Nombre descriptivo de la red de salud'}
            required
            placeholder="Ej: Red de Salud José María Arguedas"
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
            placeholder="Ej: JMA"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            error={!!errors.descripcion}
            helperText={errors.descripcion || 'Descripción detallada de la red (opcional)'}
            multiline
            rows={3}
            placeholder="Descripción de la red de salud, su cobertura geográfica y características principales..."
          />
        </Grid>

        {/* Estado (solo para edición) */}
        {red && (
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
        {red && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Información:</strong> Esta red tiene {red._count?.microredes || 0} microred(es) asociada(s).
                {red._count?.microredes > 0 && ' No podrá eliminar esta red mientras tenga microredes asociadas.'}
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
              {loading ? 'Guardando...' : (red ? 'Actualizar' : 'Crear')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RedForm;
