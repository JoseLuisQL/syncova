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
import { Microred, CreateMicroredDto, UpdateMicroredDto } from '@/types';
import { useRedes } from '@/hooks/useRedes';

interface MicroredFormProps {
  microred?: Microred | null;
  onSubmit: (data: CreateMicroredDto | UpdateMicroredDto) => void;
  onCancel: () => void;
}

const MicroredForm: React.FC<MicroredFormProps> = ({ microred, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    redId: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Hook para obtener redes
  const { redes, loading: redesLoading } = useRedes({ estado: 'activo', limit: 1000 });

  // Cargar datos del microred si está editando
  useEffect(() => {
    if (microred) {
      setFormData({
        nombre: microred.nombre || '',
        codigo: microred.codigo || '',
        descripcion: microred.descripcion || '',
        redId: microred.redId || '',
        estado: microred.estado as 'activo' | 'inactivo'
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        redId: '',
        estado: 'activo'
      });
    }
    setErrors({});
  }, [microred]);

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

    // Validar red (requerido)
    if (!formData.redId) {
      newErrors.redId = 'La red es requerida';
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
        redId: formData.redId,
        ...(microred && { estado: formData.estado })
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (microred) {
      setFormData({
        nombre: microred.nombre || '',
        codigo: microred.codigo || '',
        descripcion: microred.descripcion || '',
        redId: microred.redId || '',
        estado: microred.estado as 'activo' | 'inactivo'
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        redId: '',
        estado: 'activo'
      });
    }
    setErrors({});
  };

  if (redesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

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
            label="Nombre de la Microred"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            error={!!errors.nombre}
            helperText={errors.nombre || 'Nombre descriptivo de la microred'}
            required
            placeholder="Ej: Microred Huancabamba"
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
            placeholder="Ej: HCB"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.redId} required>
            <InputLabel>Red de Salud</InputLabel>
            <Select
              value={formData.redId}
              label="Red de Salud"
              onChange={(e) => handleInputChange('redId', e.target.value)}
            >
              <MenuItem value="">Seleccionar red...</MenuItem>
              {redes.map((red) => (
                <MenuItem key={red.id} value={red.id}>
                  {red.nombre} {red.codigo && `(${red.codigo})`}
                </MenuItem>
              ))}
            </Select>
            {errors.redId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.redId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            error={!!errors.descripcion}
            helperText={errors.descripcion || 'Descripción detallada de la microred (opcional)'}
            multiline
            rows={3}
            placeholder="Descripción de la microred, su cobertura geográfica y características principales..."
          />
        </Grid>

        {/* Estado (solo para edición) */}
        {microred && (
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
        {microred && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Información:</strong> Esta microred tiene {microred._count?.centrosAcopio || 0} centro(s) de acopio asociado(s).
                {microred._count?.centrosAcopio > 0 && ' No podrá eliminar esta microred mientras tenga centros de acopio asociados.'}
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
              {loading ? 'Guardando...' : (microred ? 'Actualizar' : 'Crear')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MicroredForm;
 