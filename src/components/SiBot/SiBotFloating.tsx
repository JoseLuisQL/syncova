import React, { useEffect, useState } from 'react';
import { ArrowsInSimple, ArrowsOutSimple, X, Trash } from '@phosphor-icons/react';
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
      {/* Boton Flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleOpen}
          className={`flex items-center justify-center w-[58px] h-[58px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] active:scale-[0.96] shadow-[0_8px_30px_-6px_rgba(13,148,136,0.4)] hover:shadow-[0_12px_44px_-8px_rgba(13,148,136,0.5)] ${
            isOpen ? 'bg-zinc-900 rotate-[135deg] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_44px_-8px_rgba(0,0,0,0.4)]' : 'bg-teal-600'
          } text-white`}
          aria-label="Toggle SiBot"
        >
          {isOpen ? <X className="w-[22px] h-[22px] -rotate-[135deg]" weight="bold" /> : <SiBotLogo className="w-8 h-8 drop-shadow-md" />}
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
                  className="fixed inset-0 z-40 hidden bg-zinc-950/10 backdrop-blur-[2px] lg:block"
                />
              )}
            </AnimatePresence>

            <motion.div
              layout
              initial={{ opacity: 0, y: 15, scale: 0.96, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 12, scale: 0.96, filter: 'blur(3px)' }}
              transition={{ duration: 0.35, type: 'spring', damping: 24, stiffness: 280 }}
              className={`fixed ${panelLayoutClass} bg-zinc-50/95 backdrop-blur-[24px] border border-zinc-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15),_0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden z-50 ring-1 ring-zinc-900/5 transition-[width,height,max-width,max-height,bottom,right,border-radius] duration-300 ease-out`}
            >
            {/* Header Limpio */}
            <div className="flex flex-col px-5 pt-5 pb-3 bg-transparent shrink-0">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white rounded-[10px] flex items-center justify-center shadow-sm border border-zinc-200/60 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent"></div>
                      <SiBotLogo className="w-4 h-4 text-teal-600 relative z-10" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-zinc-900 text-[14px] tracking-tight leading-none">SiBot</h3>
                      <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5 leading-none mt-1.5">
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500"></span>
                        </span>
                        En línea
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleExpanded}
                      className="hidden lg:inline-flex p-2 text-zinc-400 hover:text-zinc-700 hover:bg-white/90 rounded-[10px] transition-all duration-300 focus:outline-none border border-transparent hover:border-zinc-200/80"
                      title={isExpanded ? 'Volver a tamaño compacto' : 'Expandir panel'}
                    >
                      {isExpanded ? (
                        <ArrowsInSimple className="w-5 h-5" weight="duotone" />
                      ) : (
                        <ArrowsOutSimple className="w-5 h-5" weight="duotone" />
                      )}
                    </button>

                    {messages.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50/80 rounded-[10px] transition-all duration-300 focus:outline-none"
                        title="Limpiar historial"
                      >
                        <Trash className="w-5 h-5" weight="duotone" />
                      </button>
                    )}
                  </div>
               </div>

            </div>

            {/* Area De Conversacion. Added min-h-0 to prevent flex children from blowing out the bounds */}
            <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${messagePanePaddingClass} scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 hover:scrollbar-thumb-zinc-300`}>
              {messages.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center text-center opacity-100 ${emptyStateOffsetClass}`}>
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    className="w-[56px] h-[56px] bg-white border border-zinc-200/60 rounded-[1.2rem] flex items-center justify-center mb-4 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-transparent"></div>
                    <SiBotLogo className="w-7 h-7 text-teal-600 relative z-10" />
                  </motion.div>
                  <h4 className="text-zinc-900 font-bold mb-1.5 text-[15px] tracking-tight">Hola, soy SiBot</h4>
                  <p className="text-zinc-500 text-[12px] max-w-[240px] leading-relaxed font-medium">
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
                        role={msg.role as any}
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
                      <SiBotMessage role="assistant" content="" />
                    </motion.div>
                  )}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`px-4 py-3.5 rounded-[1rem] text-[13px] flex gap-3 items-start mt-4 shadow-sm mx-auto w-fit max-w-[90%] border ${
                        error.message.includes('Límite') || error.message.includes('429') || error.message.toLowerCase().includes('quota')
                          ? 'bg-amber-50/90 border-amber-200/60 text-amber-800'
                          : 'bg-red-50/90 border-red-200/60 text-red-600'
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {error.message.includes('Límite') || error.message.includes('429') || error.message.toLowerCase().includes('quota') ? '⚠️' : '🚨'}
                      </span> 
                      <div className="flex flex-col">
                        <span className="font-semibold mb-0.5">
                          {error.message.includes('Límite') || error.message.includes('429') || error.message.toLowerCase().includes('quota') 
                            ? 'Límite de Consultas (API Quota)' 
                            : 'Error de Red'}
                        </span>
                        <span className="opacity-90 leading-relaxed text-[12px]">
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
