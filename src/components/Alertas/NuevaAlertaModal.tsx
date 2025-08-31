import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Alerta } from '../../types';

interface NuevaAlertaModalProps {
  onClose: () => void;
  onCrear: (alerta: Alerta) => void;
  tiposAlerta: any[];
  nivelesAlerta: any[];
}

const NuevaAlertaModal: React.FC<NuevaAlertaModalProps> = ({
  onClose,
  onCrear,
  tiposAlerta,
  nivelesAlerta,
}) => {
  const [formData, setFormData] = useState({
    tipo: 'sistema',
    nivel: 'info',
    titulo: '',
    descripcion: '',
    usuarioId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevaAlerta: Alerta = {
      id: Date.now().toString(),
      tipo: formData.tipo as any,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      nivel: formData.nivel as any,
      fechaCreacion: new Date(),
      leida: false,
      usuarioId: formData.usuarioId || undefined,
      parametros: {},
    };

    onCrear(nuevaAlerta);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full m-4 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Alerta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposAlerta.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Criticidad *</label>
                <select
                  required
                  value={formData.nivel}
                  onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {nivelesAlerta.map((nivel) => (
                    <option key={nivel.id} value={nivel.id}>{nivel.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título descriptivo de la alerta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea
                required
                rows={4}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada de la alerta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario Responsable</label>
              <input
                type="text"
                value={formData.usuarioId}
                onChange={(e) => setFormData({...formData, usuarioId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ID del usuario responsable (opcional)"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Alerta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaAlertaModal;
