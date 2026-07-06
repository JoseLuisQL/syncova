import React, { useState } from 'react';
import { Question, BookOpen, Lightbulb, WarningCircle, CheckCircle, ArrowRight, X } from '@phosphor-icons/react';

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
          <p className="text-zinc-700 leading-relaxed">
            El sistema de <strong>Configuración Jeringa-Vacuna</strong> permite establecer automáticamente 
            cuántas jeringas se necesitan para cada vacuna durante la generación de vales de entrega.
          </p>
          <div className="bg-zinc-100 p-5 rounded-xl border border-zinc-200/80">
            <h4 className="font-semibold text-zinc-900 mb-2">¿Cómo funciona?</h4>
            <p className="text-zinc-700 text-sm leading-relaxed">
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
        <div className="space-y-4">
          <div className="border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors">
            <h4 className="font-semibold text-zinc-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-zinc-900 mr-2" weight="fill" />
              Configuración por Defecto
            </h4>
            <p className="text-zinc-600 text-sm mb-3">
              Configuraciones globales que se aplican a todos los centros de acopio cuando no existe 
              una configuración específica.
            </p>
            <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-sm text-zinc-800">
              <span className="font-semibold text-zinc-900">Ejemplo:</span> BCG → Jeringa 1cc (Multiplicador: 1.0)
            </div>
          </div>

          <div className="border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors">
            <h4 className="font-semibold text-zinc-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-zinc-500 mr-2" weight="fill" />
              Configuración por Centro
            </h4>
            <p className="text-zinc-600 text-sm mb-3">
              Configuraciones específicas para un centro de acopio que sobrescriben las configuraciones 
              por defecto.
            </p>
            <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-sm text-zinc-800">
              <span className="font-semibold text-zinc-900">Ejemplo:</span> Centro Principal → BCG → Jeringa 1cc (Multiplicador: 1.2)
            </div>
          </div>

          <div className="bg-teal-600 p-5 rounded-xl border border-teal-600 text-white shadow-sm mt-6">
            <div className="flex items-start">
              <WarningCircle className="h-5 w-5 text-zinc-400 mr-3 mt-0.5" weight="fill" />
              <div>
                <h4 className="font-semibold text-white">Prioridad de Configuraciones</h4>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
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
        <div className="space-y-5">
          <p className="text-zinc-700 leading-relaxed">
            El <strong>multiplicador</strong> determina cuántas jeringas se necesitan por cada dosis de vacuna.
          </p>
          
          <div className="space-y-4">
            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
              <h4 className="font-semibold text-zinc-900 mb-2">Multiplicador 1.0 (Estándar)</h4>
              <p className="text-zinc-600 text-sm">
                Una jeringa por cada dosis de vacuna. Es la configuración más común.
              </p>
              <div className="mt-3 text-xs text-zinc-800 bg-white border border-zinc-200 p-2 rounded-lg inline-block">
                <strong>Fórmula:</strong> 10 frascos × 20 dosis/frasco × 1.0 = 200 jeringas
              </div>
            </div>

            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
              <h4 className="font-semibold text-zinc-900 mb-2">Multiplicador mayor a 1.0 (Reserva)</h4>
              <p className="text-zinc-600 text-sm">
                Más jeringas que dosis. Útil para incluir jeringas de reserva o contingencia.
              </p>
              <div className="mt-3 text-xs text-zinc-800 bg-white border border-zinc-200 p-2 rounded-lg inline-block">
                <strong>Fórmula:</strong> 10 frascos × 20 dosis/frasco × 1.2 = 240 jeringas (20% extra)
              </div>
            </div>

            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
              <h4 className="font-semibold text-zinc-900 mb-2">Multiplicador menor a 1.0 (Compartida)</h4>
              <p className="text-zinc-600 text-sm">
                Menos jeringas que dosis. Para casos donde una jeringa puede usarse para múltiples dosis.
              </p>
              <div className="mt-3 text-xs text-zinc-800 bg-white border border-zinc-200 p-2 rounded-lg inline-block">
                <strong>Fórmula:</strong> 10 frascos × 20 dosis/frasco × 0.5 = 100 jeringas (jeringa compartida)
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
          <p className="text-zinc-700 leading-relaxed">
            La <strong>prioridad</strong> determina el orden de selección cuando una vacuna tiene 
            múltiples jeringas configuradas.
          </p>
          
          <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
            <h4 className="font-semibold text-zinc-900 mb-4">Reglas de Prioridad</h4>
            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex items-start">
                <span className="bg-zinc-200 text-zinc-800 w-5 h-5 flex items-center justify-center rounded text-xs font-bold mr-3 mt-0.5">1</span>
                Menor número = Mayor prioridad
              </li>
              <li className="flex items-start">
                <span className="bg-zinc-200 text-zinc-800 w-5 h-5 flex items-center justify-center rounded text-xs font-bold mr-3 mt-0.5">2</span>
                Se selecciona la jeringa con prioridad más alta (número menor)
              </li>
              <li className="flex items-start">
                <span className="bg-zinc-200 text-zinc-800 w-5 h-5 flex items-center justify-center rounded text-xs font-bold mr-3 mt-0.5">3</span>
                Si hay empate, se usa el orden de creación
              </li>
            </ul>
          </div>

          <div className="bg-zinc-100 p-5 rounded-xl border border-zinc-200/80">
            <h4 className="font-semibold text-zinc-900 mb-3 hover:underline underline-offset-4 decoration-zinc-300">Ejemplo Práctico</h4>
            <div className="text-sm text-zinc-800 space-y-2 bg-white p-4 rounded-lg border border-zinc-200">
              <p className="font-medium text-zinc-900">Vacuna BCG configurada con:</p>
              <div className="pl-2 border-l-2 border-zinc-200 space-y-1.5 py-1 text-zinc-600">
                <p>• Jeringa 1cc (Prioridad: 1, Multiplicador: 1.0)</p>
                <p>• Jeringa 0.5cc (Prioridad: 2, Multiplicador: 1.2)</p>
              </div>
              <p className="pt-2 font-medium text-zinc-900 flex items-center gap-1.5">
                <ArrowRight className="h-4 w-4 text-zinc-500" /> Se seleccionará la Jeringa 1cc por tener prioridad 1
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
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">Configuración por Defecto</h4>
            <ol className="space-y-4 text-sm text-zinc-700">
              <li className="flex items-start">
                <span className="bg-teal-600 text-white rounded-full min-w-[24px] h-[24px] flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">1</span>
                <div>
                  <strong className="text-zinc-900">Ir a la pestaña "Configuración por Defecto"</strong>
                  <p className="text-zinc-500 mt-0.5">Seleccione la pestaña correspondiente en la interfaz</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-teal-600 text-white rounded-full min-w-[24px] h-[24px] flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">2</span>
                <div>
                  <strong className="text-zinc-900">Hacer clic en "Nueva Configuración"</strong>
                  <p className="text-zinc-500 mt-0.5">Abrir el formulario de creación</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-teal-600 text-white rounded-full min-w-[24px] h-[24px] flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">3</span>
                <div>
                  <strong className="text-zinc-900">Seleccionar Vacuna y Jeringa</strong>
                  <p className="text-zinc-500 mt-0.5">Elegir la combinación que desea configurar</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-teal-600 text-white rounded-full min-w-[24px] h-[24px] flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">4</span>
                <div>
                  <strong className="text-zinc-900">Establecer Multiplicador y Prioridad</strong>
                  <p className="text-zinc-500 mt-0.5">Definir cuántas jeringas por dosis y el orden de selección</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-teal-600 text-white rounded-full min-w-[24px] h-[24px] flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">5</span>
                <div>
                  <strong className="text-zinc-900">Guardar la Configuración</strong>
                  <p className="text-zinc-500 mt-0.5">Confirmar y activar la nueva configuración</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="pt-5 border-t border-zinc-200">
            <h4 className="font-semibold text-zinc-900 mb-2">Configuración por Centro</h4>
            <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#111318]/20 p-4 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="flex max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]">
        <div className="flex w-64 flex-col border-r border-[#eeeef3] bg-[#fbfafd] p-5">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/80">
            <h3 className="font-semibold text-zinc-900 flex items-center tracking-tight">
              <Question className="h-5 w-5 mr-2 text-zinc-700" weight="duotone" />
              Documentación
            </h3>
            <button type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50 p-1.5 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </div>
          
          <nav className="space-y-1.5 flex-1 relative">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button type="button"
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2.5" weight={isActive ? "fill" : "regular"} />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 p-8 sm:p-10 overflow-y-auto bg-white">
          {activeContent && (
            <div className="max-w-xl">
              <div className="flex items-center mb-8 pb-4 border-b border-zinc-100">
                <div className="h-10 w-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <activeContent.icon className="h-5 w-5 text-zinc-800" weight="duotone" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {activeContent.title}
                </h2>
              </div>
              
              <div className="prose prose-zinc prose-sm sm:prose-base max-w-none">
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
