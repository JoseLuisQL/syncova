import React, { useState } from 'react';
import { HelpCircle, BookOpen, Lightbulb, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';

interface AyudaConfiguracionProps {
  isOpen: boolean;
  onClose: () => void;
}

const AyudaConfiguracion: React.FC<AyudaConfiguracionProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('introduccion');

  const sections = [
    {
      id: 'introduccion',
      title: 'Introducción',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            El sistema de <strong>Configuración Jeringa-Vacuna</strong> permite establecer automáticamente 
            cuántas jeringas se necesitan para cada vacuna durante la generación de vales de entrega.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">¿Cómo funciona?</h4>
            <p className="text-blue-800 text-sm">
              Cuando se genera un vale de entrega, el sistema calcula automáticamente las jeringas necesarias 
              basándose en las configuraciones establecidas, multiplicando la cantidad de dosis por el 
              multiplicador configurado.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tipos',
      title: 'Tipos de Configuración',
      icon: Lightbulb,
      content: (
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Configuración por Defecto
            </h4>
            <p className="text-gray-700 text-sm mb-3">
              Configuraciones globales que se aplican a todos los centros de acopio cuando no existe 
              una configuración específica.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Ejemplo:</strong> BCG → Jeringa 1cc (Multiplicador: 1.0)
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
              Configuración por Centro
            </h4>
            <p className="text-gray-700 text-sm mb-3">
              Configuraciones específicas para un centro de acopio que sobrescriben las configuraciones 
              por defecto.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Ejemplo:</strong> Centro Principal → BCG → Jeringa 1cc (Multiplicador: 1.2)
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Prioridad de Configuraciones</h4>
                <p className="text-yellow-800 text-sm mt-1">
                  Las configuraciones por centro tienen prioridad sobre las configuraciones por defecto. 
                  Si no existe configuración específica, se usa la configuración por defecto.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'multiplicador',
      title: 'Multiplicador',
      icon: ArrowRight,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            El <strong>multiplicador</strong> determina cuántas jeringas se necesitan por cada dosis de vacuna.
          </p>
          
          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Multiplicador 1.0 (Estándar)</h4>
              <p className="text-green-800 text-sm">
                Una jeringa por cada dosis de vacuna. Es la configuración más común.
              </p>
              <div className="mt-2 text-xs text-green-700">
                <strong>Ejemplo:</strong> 10 frascos × 20 dosis/frasco × 1.0 = 200 jeringas
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Multiplicador mayor a 1.0 (Reserva)</h4>
              <p className="text-blue-800 text-sm">
                Más jeringas que dosis. Útil para incluir jeringas de reserva o contingencia.
              </p>
              <div className="mt-2 text-xs text-blue-700">
                <strong>Ejemplo:</strong> 10 frascos × 20 dosis/frasco × 1.2 = 240 jeringas (20% extra)
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Multiplicador menor a 1.0 (Compartida)</h4>
              <p className="text-orange-800 text-sm">
                Menos jeringas que dosis. Para casos donde una jeringa puede usarse para múltiples dosis.
              </p>
              <div className="mt-2 text-xs text-orange-700">
                <strong>Ejemplo:</strong> 10 frascos × 20 dosis/frasco × 0.5 = 100 jeringas (jeringa compartida)
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'prioridad',
      title: 'Prioridad',
      icon: ArrowRight,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            La <strong>prioridad</strong> determina el orden de selección cuando una vacuna tiene 
            múltiples jeringas configuradas.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Reglas de Prioridad</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2 mt-0.5">1</span>
                Menor número = Mayor prioridad
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-2 mt-0.5">2</span>
                Se selecciona la jeringa con prioridad más alta (número menor)
              </li>
              <li className="flex items-start">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium mr-2 mt-0.5">3</span>
                Si hay empate, se usa el orden de creación
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Ejemplo Práctico</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Vacuna BCG configurada con:</strong></p>
              <p>• Jeringa 1cc (Prioridad: 1, Multiplicador: 1.0)</p>
              <p>• Jeringa 0.5cc (Prioridad: 2, Multiplicador: 1.2)</p>
              <p className="mt-2 font-medium">
                → Se seleccionará la Jeringa 1cc por tener prioridad 1
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'pasos',
      title: 'Pasos para Configurar',
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Configuración por Defecto</h4>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              <div>
                <strong>Ir a la pestaña "Configuración por Defecto"</strong>
                <p className="text-gray-600">Seleccione la pestaña correspondiente en la interfaz</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              <div>
                <strong>Hacer clic en "Nueva Configuración"</strong>
                <p className="text-gray-600">Abrir el formulario de creación</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              <div>
                <strong>Seleccionar Vacuna y Jeringa</strong>
                <p className="text-gray-600">Elegir la combinación que desea configurar</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
              <div>
                <strong>Establecer Multiplicador y Prioridad</strong>
                <p className="text-gray-600">Definir cuántas jeringas por dosis y el orden de selección</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</span>
              <div>
                <strong>Guardar la Configuración</strong>
                <p className="text-gray-600">Confirmar y activar la nueva configuración</p>
              </div>
            </li>
          </ol>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Configuración por Centro</h4>
            <p className="text-sm text-gray-700 mb-2">
              Siga los mismos pasos, pero en la pestaña "Configuración por Centro" y 
              seleccione adicionalmente el centro de acopio específico.
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Ayuda
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeContent && (
            <div>
              <div className="flex items-center mb-6">
                <activeContent.icon className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeContent.title}
                </h2>
              </div>
              
              <div className="prose max-w-none">
                {activeContent.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AyudaConfiguracion;
