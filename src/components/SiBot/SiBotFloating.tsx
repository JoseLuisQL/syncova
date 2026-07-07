import React, { useEffect, useState } from 'react';
import { ArrowsInSimple, ArrowsOutSimple, X, Trash, WarningCircle } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useSiBot } from '../../hooks/useSiBot';
import { SiBotMessage } from './SiBotMessage';
import { SiBotInput } from './SiBotInput';
import { SiBotSuggestions } from './SiBotSuggestions';
import { SiBotLogo } from './SiBotLogo';

export const SiBotFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop, append, clearHistory } = useSiBot();

  const handleSuggestion = (text: string) => {
    append({ role: 'user', content: text });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (event: MediaQueryList | MediaQueryListEvent) => {
      if (!event.matches) {
        setIsExpanded(false);
      }
    };

    handleMediaChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    mediaQuery.addListener(handleMediaChange);
    return () => mediaQuery.removeListener(handleMediaChange);
  }, []);

  const toggleOpen = () => {
    if (isOpen) {
      setIsExpanded(false);
    }

    setIsOpen((current) => !current);
  };

  const toggleExpanded = () => {
    setIsExpanded((current) => !current);
  };

  const panelLayoutClass = isExpanded
    ? 'bottom-4 right-4 w-[min(1100px,calc(100vw-2rem))] h-[min(88vh,920px)] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] rounded-[1.9rem]'
    : 'bottom-[96px] right-6 w-[360px] h-[640px] max-h-[calc(100vh-130px)] max-w-[calc(100vw-3rem)] rounded-[1.75rem]';
  const messagePanePaddingClass = isExpanded ? 'px-5 pb-7' : 'px-4 pb-6';
  const emptyStateOffsetClass = isExpanded ? 'mt-0' : 'mt-[-20px]';

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button type="button"
          onClick={toggleOpen}
          className={`flex h-[58px] w-[58px] items-center justify-center rounded-full border transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.97] ${
            isOpen
              ? 'border-line bg-ink text-white shadow-[0_18px_44px_-26px_rgba(12,15,24,0.65)]'
              : 'border-brand-100 bg-brand text-white shadow-[0_18px_44px_-26px_rgba(124,58,237,0.9)]'
          }`}
          aria-label="Toggle SiBot"
        >
          {isOpen ? <X className="h-[22px] w-[22px]" weight="bold" /> : <SiBotLogo className="h-8 w-8" />}
        </button>
      </div>

      {/* Pane Slide-in Principal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <AnimatePresence>
              {isExpanded && (
                <motion.button
                  type="button"
                  aria-label="Contraer panel expandido"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={toggleExpanded}
                  className="fixed inset-0 z-40 hidden bg-zinc-950/10 backdrop-blur-[1px] lg:block"
                />
              )}
            </AnimatePresence>

            <motion.div
              layout
              initial={{ opacity: 0, y: 15, scale: 0.96, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 12, scale: 0.96, filter: 'blur(3px)' }}
              transition={{ duration: 0.35, type: 'spring', damping: 24, stiffness: 280 }}
              className={`fixed ${panelLayoutClass} z-50 flex flex-col overflow-hidden border border-line bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] transition-[width,height,max-width,max-height,bottom,right,border-radius] duration-300 ease-out`}
            >
            <div className="flex shrink-0 flex-col border-b border-line-soft bg-white px-5 py-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-brand">
                      <SiBotLogo className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-md font-semibold leading-none tracking-tight text-ink">SiBot</h3>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium leading-none text-muted-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        En línea
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleExpanded}
                      className="hidden rounded-[9px] border border-transparent p-2 text-muted transition hover:border-line hover:bg-surface-soft hover:text-ink focus:outline-none lg:inline-flex"
                      title={isExpanded ? 'Volver a tamaño compacto' : 'Expandir panel'}
                    >
                      {isExpanded ? (
                        <ArrowsInSimple className="w-5 h-5" weight="duotone" />
                      ) : (
                        <ArrowsOutSimple className="w-5 h-5" weight="duotone" />
                      )}
                    </button>

                    {messages.length > 0 && (
                      <button type="button" 
                        onClick={clearHistory}
                        className="rounded-[9px] p-2 text-muted transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none"
                        title="Limpiar historial"
                      >
                        <Trash className="w-5 h-5" weight="duotone" />
                      </button>
                    )}
                  </div>
               </div>

            </div>

            <div className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${messagePanePaddingClass} scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 hover:scrollbar-thumb-zinc-300`}>
              {messages.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center text-center opacity-100 ${emptyStateOffsetClass}`}>
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    className="mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-2xl border border-line bg-surface-soft text-brand"
                  >
                    <SiBotLogo className="h-7 w-7" />
                  </motion.div>
                  <h4 className="mb-1.5 text-md font-semibold tracking-tight text-ink">Hola, soy SiBot</h4>
                  <p className="max-w-[250px] text-sm font-medium leading-relaxed text-muted-2">
                    Analizo tus datos de SIVAC, inventario de vacunas y planificaciones en tiempo real.
                  </p>
                  <SiBotSuggestions onSelect={handleSuggestion} />
                </div>
              ) : (
                <div className="flex flex-col pt-3 pb-2">
                  {messages.map((msg) => {
                    const content = typeof msg.content === 'string' ? msg.content : '';
                    if (!content.trim() && msg.role !== 'assistant') return null;
                    const isStreamingMessage =
                      isLoading &&
                      msg.id === messages[messages.length - 1]?.id &&
                      msg.role === 'assistant';

                    return (
                      <SiBotMessage
                        key={msg.id}
                        messageRole={msg.role as any}
                        content={content}
                        onSuggestionSelect={handleSuggestion}
                        isStreaming={isStreamingMessage}
                      />
                    );
                  })}
                  
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 6 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="flex w-full mb-6 justify-start"
                    >
                      <SiBotMessage messageRole="assistant" content="" />
                    </motion.div>
                  )}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mx-auto mt-4 flex w-fit max-w-[90%] items-start gap-3 rounded-xl border px-4 py-3.5 text-base ${
                        error.message.includes('Límite') || error.message.includes('429') || error.message.toLowerCase().includes('quota')
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                      <div className="flex flex-col">
                        <span className="font-semibold mb-0.5">
                          {error.message.includes('Límite') || error.message.includes('429') || error.message.toLowerCase().includes('quota') 
                            ? 'Límite de Consultas (API Quota)' 
                            : 'Error de Red'}
                        </span>
                        <span className="opacity-90 leading-relaxed text-sm">
                          {error.message.includes('Límite') || error.message.includes('429') || error.message.toLowerCase().includes('quota') 
                            ? 'Ocurrió un error (429) por agotamiento en la cuota de peticiones a la Inteligencia Artificial de Google. Por favor, espera 1 a 2 minutos o contacta a soporte para elevar tu nivel de acceso.'
                            : error.message || 'La respuesta del asistente falló. Intenta de nuevo.'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Area de Input Inferior */}
            <SiBotInput 
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
            />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
