import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Building2, Monitor, Calendar, Image, Upload, Trash2, Loader2 } from 'lucide-react';
import { FormSection, InputField, SelectField } from './FormSection';
import { ConfiguracionService } from '../../../services/configuracionService';
import { useToastContext } from '../../../contexts/ToastContext';

interface ConfiguracionGeneralProps {
  config: {
    sistemaNombre: string;
    institucionNombre: string;
    institucionDireccion: string;
    institucionTelefono: string;
    institucionEmail: string;
    timezone: string;
    formatoFecha: string;
    anioNombre: string;
  };
  onUpdate: (field: string, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionGeneral: React.FC<ConfiguracionGeneralProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  const { toast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const loadLogo = useCallback(async () => {
    try {
      setIsLoadingLogo(true);
      const logoData = await ConfiguracionService.getLogo();
      console.log('Logo data:', logoData);
      console.log('Logo file URL:', ConfiguracionService.getLogoFileUrl());
      if (logoData?.exists) {
        const url = `${ConfiguracionService.getLogoFileUrl()}?t=${Date.now()}`;
        console.log('Setting logo URL:', url);
        setLogoUrl(url);
      } else {
        setLogoUrl(null);
      }
    } catch (err) {
      console.error('Error loading logo:', err);
      setLogoUrl(null);
    } finally {
      setIsLoadingLogo(false);
    }
  }, []);

  useEffect(() => {
    loadLogo();
  }, [loadLogo]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g)$/)) {
      toast.error('Solo se permiten imagenes PNG o JPG');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 2MB');
      return;
    }

    try {
      setIsUploadingLogo(true);
      await ConfiguracionService.uploadLogo(file);
      toast.success('Logo subido exitosamente');
      await loadLogo();
    } catch (error) {
      toast.error('Error al subir el logo');
      console.error('Error uploading logo:', error);
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteLogo = async () => {
    if (!logoUrl) return;

    try {
      setIsUploadingLogo(true);
      await ConfiguracionService.deleteLogo();
      toast.success('Logo eliminado exitosamente');
      setLogoUrl(null);
    } catch (error) {
      toast.error('Error al eliminar el logo');
      console.error('Error deleting logo:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <FormSection
      title="Informacion General"
      subtitle="Configuracion basica de la institucion y sistema"
      icon={Building2}
      iconColor="bg-teal-100 text-teal-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="space-y-8">
        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sistema */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-teal-600" />
              Informacion del Sistema
            </h4>

            <InputField
              label="Nombre del Sistema"
              value={config.sistemaNombre || ''}
              onChange={(value) => onUpdate('sistemaNombre', value)}
            />

            <SelectField
              label="Zona Horaria"
              value={config.timezone || 'America/Lima'}
              onChange={(value) => onUpdate('timezone', value)}
              options={[
                { value: 'America/Lima', label: 'Lima (UTC-5)' },
                { value: 'America/Bogota', label: 'Bogota (UTC-5)' },
                { value: 'America/Mexico_City', label: 'Mexico (UTC-6)' },
              ]}
            />

            <SelectField
              label="Formato de Fecha"
              value={config.formatoFecha || 'DD/MM/YYYY'}
              onChange={(value) => onUpdate('formatoFecha', value)}
              options={[
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
              ]}
            />
          </div>

          {/* Institucion */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-600" />
              Informacion de la Institucion
            </h4>

            <InputField
              label="Nombre de la Institucion"
              value={config.institucionNombre || ''}
              onChange={(value) => onUpdate('institucionNombre', value)}
            />

            <InputField
              label="Direccion"
              value={config.institucionDireccion || ''}
              onChange={(value) => onUpdate('institucionDireccion', value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Telefono"
                value={config.institucionTelefono || ''}
                onChange={(value) => onUpdate('institucionTelefono', value)}
              />
              <InputField
                label="Email"
                type="email"
                value={config.institucionEmail || ''}
                onChange={(value) => onUpdate('institucionEmail', value)}
              />
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200" />

        {/* Configuracion del Anio */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            Configuracion del Anio
          </h4>

          <InputField
            label="Nombre del Anio Actual"
            value={config.anioNombre || ''}
            onChange={(value) => onUpdate('anioNombre', value)}
            placeholder="Ej: Año del Bicentenario, de la consolidacion de nuestra independencia..."
          />
          <p className="text-xs text-gray-500 -mt-2">
            Este texto aparecera en los documentos exportados (Excel, PDF)
          </p>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200" />

        {/* Logo Institucional */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Image className="h-4 w-4 text-purple-600" />
            Logo Institucional
          </h4>

          <div className="flex items-start gap-6">
            {/* Preview del logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                {isLoadingLogo ? (
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo institucional"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Image className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                    <span className="text-xs text-gray-400">Sin logo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Subir Logo
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteLogo}
                    disabled={isUploadingLogo}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Formatos permitidos: PNG, JPG</p>
                <p>Tamano maximo: 2MB</p>
                <p>Recomendado: 200x200 pixeles o mayor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionGeneral.displayName = 'ConfiguracionGeneral';

export default ConfiguracionGeneral;
