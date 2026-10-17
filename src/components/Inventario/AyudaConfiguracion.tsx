import React, { useState } from 'react';
import { Question, BookOpen, Lightbulb, WarningCircle, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { Modal } from '../ui/ModalElements';

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
          <p className="text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
            El sistema de <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Configuración Jeringa-Vacuna</strong> permite establecer automáticamente 
            cuántas jeringas se necesitan para cada vacuna durante la generación de vales de entrega.
          </p>
          <div className="bg-zinc-50/80 p-4 rounded-lg border border-zinc-200/80 dark:bg-zinc-900/50 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 mb-1.5 dark:text-zinc-100">¿Cómo funciona?</h4>
            <p className="text-zinc-600 text-xs leading-relaxed dark:text-zinc-400">
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
        <div className="space-y-3.5">
          <div className="border border-zinc-200/80 rounded-lg p-4 bg-white dark:bg-zinc-900/40 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 mb-1.5 flex items-center dark:text-zinc-100">
              <CheckCircle className="h-4 w-4 text-brand mr-2" weight="fill" />
              Configuración por Defecto
            </h4>
            <p className="text-zinc-600 text-xs mb-2.5 leading-relaxed dark:text-zinc-400">
              Configuraciones globales que se aplican a todos los centros de acopio cuando no existe 
              una configuración específica.
            </p>
            <div className="bg-zinc-50 border border-zinc-200/70 px-3 py-2 rounded-md text-xs text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Ejemplo:</span> BCG → Jeringa 1cc (Multiplicador: 1.0)
            </div>
          </div>

          <div className="border border-zinc-200/80 rounded-lg p-4 bg-white dark:bg-zinc-900/40 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 mb-1.5 flex items-center dark:text-zinc-100">
              <CheckCircle className="h-4 w-4 text-zinc-500 mr-2 dark:text-zinc-400" weight="fill" />
              Configuración por Centro
            </h4>
            <p className="text-zinc-600 text-xs mb-2.5 leading-relaxed dark:text-zinc-400">
              Configuraciones específicas para un centro de acopio que sobrescriben las configuraciones 
              por defecto.
            </p>
            <div className="bg-zinc-50 border border-zinc-200/70 px-3 py-2 rounded-md text-xs text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Ejemplo:</span> Centro Principal → BCG → Jeringa 1cc (Multiplicador: 1.2)
            </div>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/50">
            <div className="flex items-start gap-2.5">
              <WarningCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0 dark:text-amber-400" weight="fill" />
              <div>
                <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">Prioridad de Configuraciones</h4>
                <p className="text-amber-800 text-xs mt-1 leading-relaxed dark:text-amber-300/90">
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
          <p className="text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
            El <strong className="font-semibold text-zinc-900 dark:text-zinc-100">multiplicador</strong> determina cuántas jeringas se necesitan por cada dosis de vacuna.
          </p>
          
          <div className="space-y-3">
            <div className="bg-zinc-50/70 p-4 rounded-lg border border-zinc-200/80 dark:bg-zinc-900/50 dark:border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-900 mb-1 dark:text-zinc-100">Multiplicador 1.0 (Estándar)</h4>
              <p className="text-zinc-600 text-xs dark:text-zinc-400">
                Una jeringa por cada dosis de vacuna. Es la configuración más común.
              </p>
              <div className="mt-2.5 text-xs text-zinc-800 bg-white border border-zinc-200/80 px-2.5 py-1.5 rounded-md inline-block dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
                <strong>Fórmula:</strong> 10 frascos × 20 dosis/frasco × 1.0 = 200 jeringas
              </div>
            </div>

            <div className="bg-zinc-50/70 p-4 rounded-lg border border-zinc-200/80 dark:bg-zinc-900/50 dark:border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-900 mb-1 dark:text-zinc-100">Multiplicador mayor a 1.0 (Reserva)</h4>
              <p className="text-zinc-600 text-xs dark:text-zinc-400">
                Más jeringas que dosis. Útil para incluir jeringas de reserva o contingencia.
              </p>
              <div className="mt-2.5 text-xs text-zinc-800 bg-white border border-zinc-200/80 px-2.5 py-1.5 rounded-md inline-block dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
                <strong>Fórmula:</strong> 10 frascos × 20 dosis/frasco × 1.2 = 240 jeringas (20% extra)
              </div>
            </div>

            <div className="bg-zinc-50/70 p-4 rounded-lg border border-zinc-200/80 dark:bg-zinc-900/50 dark:border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-900 mb-1 dark:text-zinc-100">Multiplicador menor a 1.0 (Compartida)</h4>
              <p className="text-zinc-600 text-xs dark:text-zinc-400">
                Menos jeringas que dosis. Para casos donde una jeringa puede usarse para múltiples dosis.
              </p>
              <div className="mt-2.5 text-xs text-zinc-800 bg-white border border-zinc-200/80 px-2.5 py-1.5 rounded-md inline-block dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
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
          <p className="text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
            La <strong className="font-semibold text-zinc-900 dark:text-zinc-100">prioridad</strong> determina el orden de selección cuando una vacuna tiene 
            múltiples jeringas configuradas.
          </p>
          
          <div className="bg-zinc-50/70 p-4 rounded-lg border border-zinc-200/80 dark:bg-zinc-900/50 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 mb-3 dark:text-zinc-100">Reglas de Prioridad</h4>
            <ul className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start">
                <span className="bg-zinc-200 text-zinc-800 w-5 h-5 flex items-center justify-center rounded text-[11px] font-bold mr-2.5 shrink-0 dark:bg-zinc-800 dark:text-zinc-200">1</span>
                Menor número = Mayor prioridad
              </li>
              <li className="flex items-start">
                <span className="bg-zinc-200 text-zinc-800 w-5 h-5 flex items-center justify-center rounded text-[11px] font-bold mr-2.5 shrink-0 dark:bg-zinc-800 dark:text-zinc-200">2</span>
                Se selecciona la jeringa con prioridad más alta (número menor)
              </li>
              <li className="flex items-start">
                <span className="bg-zinc-200 text-zinc-800 w-5 h-5 flex items-center justify-center rounded text-[11px] font-bold mr-2.5 shrink-0 dark:bg-zinc-800 dark:text-zinc-200">3</span>
                Si hay empate, se usa el orden de creación
              </li>
            </ul>
          </div>

          <div className="bg-zinc-50/80 p-4 rounded-lg border border-zinc-200/80 dark:bg-zinc-900/50 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 mb-2.5 dark:text-zinc-100">Ejemplo Práctico</h4>
            <div className="text-xs text-zinc-800 space-y-2 bg-white p-3.5 rounded-md border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Vacuna BCG configurada con:</p>
              <div className="pl-2.5 border-l-2 border-zinc-200 space-y-1 py-0.5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                <p>• Jeringa 1cc (Prioridad: 1, Multiplicador: 1.0)</p>
                <p>• Jeringa 0.5cc (Prioridad: 2, Multiplicador: 1.2)</p>
              </div>
              <p className="pt-1.5 font-medium text-zinc-900 flex items-center gap-1.5 dark:text-zinc-100">
                <ArrowRight className="h-3.5 w-3.5 text-brand" /> Se seleccionará la Jeringa 1cc por tener prioridad 1
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
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3 dark:text-zinc-100">Configuración por Defecto</h4>
            <ol className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
              {[
                { title: 'Ir a la pestaña "Configuración por Defecto"', desc: 'Seleccione la pestaña correspondiente en la interfaz' },
                { title: 'Hacer clic en "Nueva Configuración"', desc: 'Abrir el formulario de creación' },
                { title: 'Seleccionar Vacuna y Jeringa', desc: 'Elegir la combinación que desea configurar' },
                { title: 'Establecer Multiplicador y Prioridad', desc: 'Definir cuántas jeringas por dosis y el orden de selección' },
                { title: 'Guardar la Configuración', desc: 'Confirmar y activar la nueva configuración' },
              ].map((step, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="bg-brand text-white rounded-md min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-semibold mr-2.5 mt-0.5 shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-100">{step.title}</strong>
                    <p className="text-zinc-500 mt-0.5 dark:text-zinc-400">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 mb-1.5 dark:text-zinc-100">Configuración por Centro</h4>
            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/70 p-3.5 rounded-lg border border-zinc-200/80 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400">
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Documentación de Configuración"
      subtitle="Guía de relación Jeringa-Vacuna, multiplicadores y prioridades"
      icon={Question}
      size="lg"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:border-r md:border-zinc-200/80 md:pr-4 dark:md:border-zinc-800">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                type="button"
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" weight={isActive ? 'fill' : 'regular'} />
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {activeContent && (
            <div>
              <div className="mb-4 flex items-center gap-2.5 border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200/80 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  <activeContent.icon className="h-4 w-4" weight="duotone" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {activeContent.title}
                </h3>
              </div>
              {activeContent.content}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AyudaConfiguracion;
