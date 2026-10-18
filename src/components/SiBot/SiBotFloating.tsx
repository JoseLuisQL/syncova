import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowsInSimple,
  ArrowsOutSimple,
  DownloadSimple,
  SidebarSimple,
  Trash,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useSiBot } from '../../hooks/useSiBot';
import { useCurrentRoute } from '../../hooks/useRouting';
import { useToastContext } from '../../contexts/ToastContext';
import { SiBotMessage } from './SiBotMessage';
import { SiBotInput } from './SiBotInput';
import { SiBotSuggestions } from './SiBotSuggestions';
import { SiBotLogo } from './SiBotLogo';

type PanelMode = 'compact' | 'docked' | 'expanded';

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  establecimientos: 'Establecimientos',
  inventario: 'Inventario',
  movimientos: 'Movimientos',
  planificacion: 'Planificación',
  'ici-demid': 'ICI-DEMID',
  kardex: 'Kardex',
  reportes: 'Reportes',
  alertas: 'Alertas',
  usuarios: 'Usuarios',
  configuracion: 'Configuración',
};

export const SiBotFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('compact');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { currentModule } = useCurrentRoute();
  const { toast } = useToastContext();
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    clearError,
    stop,
    regenerateLast,
    append,
    clearHistory,
  } = useSiBot();

  const isExpanded = panelMode === 'expanded';
  const isDocked = panelMode === 'docked';
  const activeModuleLabel = MODULE_LABELS[currentModule] || 'General';

  const handleSuggestion = (text: string) => {
    append({ role: 'user', content: text });
  };

  // Ajuste responsivo en pantallas menores a lg
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (event: MediaQueryList | MediaQueryListEvent) => {
      if (!event.matches) {
        setPanelMode('compact');
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

  // Atajos de teclado globales: Cmd/Ctrl + J para abrir/cerrar, Escape para contraer/cerrar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.key === 'Escape' && isOpen) {
        if (panelMode === 'expanded') {
          setPanelMode('compact');
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, panelMode]);

  // Auto-scroll inteligente cuando llegan mensajes nuevos
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom(isLoading ? 'auto' : 'smooth');
    }
  }, [messages, isOpen, isLoading]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBottom(distanceFromBottom > 140);
  };

  const toggleOpen = () => {
    if (isOpen && panelMode === 'expanded') {
      setPanelMode('compact');
    }
    setIsOpen((current) => !current);
  };

  const handleExportSession = () => {
    if (messages.length === 0) return;

    const dateStr = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const markdownLines = [
      `# Informe de Consulta Analítica SiBot - SIVAC`,
      `Fecha: ${dateStr} · Contexto: ${activeModuleLabel}`,
      '',
      ...messages.map((msg) => {
        const speaker = msg.role === 'user' ? '### Consulta' : '### Análisis SiBot';
        return `${speaker}\n\n${msg.content.trim()}\n`;
      }),
    ];

    const blob = new Blob([markdownLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis_sibot_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Informe exportado', 'La sesión de análisis se descargó correctamente.');
  };

  const getPanelLayoutClass = () => {
    if (isExpanded) {
      return 'bottom-4 right-4 w-[min(1120px,calc(100vw-2rem))] h-[min(88vh,920px)] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] rounded-3xl';
    }
    if (isDocked) {
      return 'bottom-4 right-4 top-4 w-[min(520px,calc(100vw-2rem))] h-[calc(100dvh-2rem)] rounded-3xl';
    }
    return 'inset-x-2.5 bottom-[5.25rem] sm:inset-x-auto lg:bottom-[92px] sm:right-6 w-auto sm:w-[410px] h-[calc(100dvh-6.5rem)] sm:h-[650px] max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100vh-120px)] max-w-[calc(100vw-1.25rem)] sm:max-w-[calc(100vw-3rem)] rounded-2xl sm:rounded-3xl';
  };

  let lastAssistantMessageId: string | undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant' && messages[i].content.trim()) {
      lastAssistantMessageId = messages[i].id;
      break;
    }
  }

  return (
    <>
      {/* Lanzador Flotante Especializado de SiBot */}
      <div className="fixed bottom-[4.5rem] right-3.5 lg:bottom-6 lg:right-6 z-40">
        <button
          type="button"
          onClick={toggleOpen}
          aria-label={isOpen ? 'Cerrar copiloto SiBot (⌘J)' : 'Abrir copiloto SiBot (⌘J)'}
          aria-expanded={isOpen}
          className={`group relative flex items-center gap-2.5 rounded-2xl border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 active:scale-[0.97] ${
            isOpen
              ? 'h-12 w-12 sm:h-13 sm:w-13 justify-center border-line bg-ink text-white shadow-[0_18px_44px_-22px_rgba(12,15,24,0.75)]'
              : 'h-12 px-3.5 sm:h-13 sm:px-4 border-brand/30 bg-ink text-white shadow-[0_20px_48px_-20px_rgba(124,58,237,0.65)] hover:border-brand hover:bg-[#1b1e26]'
          }`}
        >
          {isOpen ? (
            <X className="h-5 w-5" weight="bold" />
          ) : (
            <>
              <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
                <SiBotLogo className="h-5 w-5" />
              </span>
              <span className="flex flex-col items-start text-left">
                <span className="flex items-center gap-1.5 text-xs font-semibold leading-none tracking-tight text-white whitespace-nowrap shrink-0">
                  <span>SiBot IA</span>
                  {isLoading && (
                    <span className="inline-block h-2 w-2 animate-spin rounded-full border border-white border-r-transparent" />
                  )}
                </span>
                <span className="mt-1 hidden text-[10px] font-medium leading-none text-zinc-400 sm:inline whitespace-nowrap shrink-0">
                  Copiloto · ⌘J
                </span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Panel / Estudio Analítico de SiBot */}
      <AnimatePresence>
        {isOpen && (
          <>
            <AnimatePresence>
              {isExpanded && (
                <motion.button
                  type="button"
                  aria-label="Contraer vista expandida"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setPanelMode('compact')}
                  className="fixed inset-0 z-40 hidden bg-zinc-950/20 backdrop-blur-[1px] lg:block"
                />
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed ${getPanelLayoutClass()} z-50 flex flex-col overflow-hidden border border-line bg-surface shadow-[0_28px_80px_-48px_rgba(12,15,24,0.78)]`}
              role="dialog"
              aria-label="Asistente Analítico SiBot"
            >
              {/* Cabecera del Copiloto */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-surface-tint text-brand">
                    <SiBotLogo className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold leading-none tracking-tight text-ink">
                        SiBot Copiloto
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium leading-none text-muted-2">
                      <span>Contexto: {activeModuleLabel}</span>
                      {messages.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{Math.ceil(messages.length / 2)} consultas</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controles de Vista y Sesión */}
                <div className="flex shrink-0 items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportSession}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
                      title="Descargar informe de la sesión (.md)"
                      aria-label="Descargar informe de la sesión"
                    >
                      <DownloadSimple className="h-4 w-4" weight="bold" />
                    </button>
                  )}

                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        clearHistory();
                        toast.info('Nueva sesión', 'Se limpió el historial de conversación.');
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Nueva consulta (limpiar historial)"
                      aria-label="Limpiar historial"
                    >
                      <Trash className="h-4 w-4" weight="duotone" />
                    </button>
                  )}

                  {/* Alternar modo Acoplado Lateral en escritorio */}
                  <button
                    type="button"
                    onClick={() => setPanelMode((prev) => (prev === 'docked' ? 'compact' : 'docked'))}
                    className={`hidden h-8 w-8 items-center justify-center rounded-lg transition-colors lg:inline-flex ${
                      isDocked
                        ? 'bg-surface-tint text-brand'
                        : 'text-muted-2 hover:bg-surface-soft hover:text-ink'
                    }`}
                    title={isDocked ? 'Salir de vista acoplada' : 'Acoplar como panel lateral'}
                    aria-label="Alternar vista acoplada"
                  >
                    <SidebarSimple className="h-4 w-4" weight="duotone" />
                  </button>

                  {/* Alternar modo Estudio Expandido en escritorio */}
                  <button
                    type="button"
                    onClick={() => setPanelMode((prev) => (prev === 'expanded' ? 'compact' : 'expanded'))}
                    className={`hidden h-8 w-8 items-center justify-center rounded-lg transition-colors lg:inline-flex ${
                      isExpanded
                        ? 'bg-surface-tint text-brand'
                        : 'text-muted-2 hover:bg-surface-soft hover:text-ink'
                    }`}
                    title={isExpanded ? 'Volver a tamaño compacto' : 'Expandir lienzo para tablas y gráficos'}
                    aria-label="Alternar lienzo expandido"
                  >
                    {isExpanded ? (
                      <ArrowsInSimple className="h-4 w-4" weight="bold" />
                    ) : (
                      <ArrowsOutSimple className="h-4 w-4" weight="bold" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink lg:hidden"
                    title="Cerrar panel"
                    aria-label="Cerrar panel"
                  >
                    <X className="h-4 w-4" weight="bold" />
                  </button>
                </div>
              </div>

              {/* Cuerpo Principal de Conversación / Centro de Comando */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${
                  isExpanded ? 'px-6 py-5' : 'px-3.5 py-4 sm:px-4'
                } scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 hover:scrollbar-thumb-zinc-300`}
              >
                {messages.length === 0 ? (
                  <div className="flex min-h-full flex-col items-center justify-center py-2">
                    <div className={`mb-4 flex w-full ${isExpanded ? 'max-w-2xl' : 'max-w-full'} items-start gap-3`}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand/25 bg-surface-tint text-brand">
                        <SiBotLogo className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="text-base font-semibold tracking-tight text-ink">
                          Centro Analítico de Inmunizaciones
                        </h4>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-2">
                          Consulta en lenguaje natural el stock de biológicos, caducidades por lote, metas anuales y reportes exportables a Excel.
                        </p>
                      </div>
                    </div>

                    <SiBotSuggestions
                      onSelect={handleSuggestion}
                      currentModule={currentModule}
                      isExpanded={isExpanded}
                    />
                  </div>
                ) : (
                  <div className={`mx-auto flex w-full ${isExpanded ? 'max-w-4xl' : 'max-w-full'} flex-col pb-2`}>
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
                          onQuotePrompt={(promptPrefix) => setInput(promptPrefix)}
                          onRegenerate={regenerateLast}
                          isLastAssistant={msg.id === lastAssistantMessageId}
                          isStreaming={isStreamingMessage}
                        />
                      );
                    })}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                      <div className="mb-4 flex w-full justify-start">
                        <SiBotMessage messageRole="assistant" content="" isStreaming />
                      </div>
                    )}

                    {error && (
                      <div
                        className={`mx-auto mt-2 flex w-full items-start justify-between gap-3 rounded-xl border px-3.5 py-3 text-xs ${
                          error.message.includes('Límite') ||
                          error.message.includes('429') ||
                          error.message.toLowerCase().includes('quota')
                            ? 'border-amber-200 bg-amber-50 text-amber-900'
                            : 'border-rose-200 bg-rose-50 text-rose-800'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {error.message.includes('Límite') ||
                              error.message.includes('429') ||
                              error.message.toLowerCase().includes('quota')
                                ? 'Límite de consultas alcanzado (Cuota API)'
                                : 'No se pudo completar la consulta'}
                            </span>
                            <span className="mt-0.5 leading-relaxed opacity-90">
                              {error.message.includes('Límite') ||
                              error.message.includes('429') ||
                              error.message.toLowerCase().includes('quota')
                                ? 'Se alcanzó el límite temporal de peticiones al motor de IA. Espera unos segundos y vuelve a intentar.'
                                : error.message || 'Ocurrió un error al procesar la respuesta.'}
                            </span>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={regenerateLast}
                                className="rounded-lg border border-current/20 bg-white/80 px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-white"
                              >
                                Reintentar consulta
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearError}
                          className="rounded-md p-1 opacity-70 hover:opacity-100"
                          aria-label="Cerrar alerta de error"
                        >
                          <X className="h-3.5 w-3.5" weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón flotante para bajar al último mensaje */}
                {showScrollBottom && messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom('smooth')}
                    className="sticky bottom-2 left-1/2 z-20 mx-auto flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-line bg-surface/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-md backdrop-blur-xs transition-colors hover:border-brand/40 hover:text-brand"
                  >
                    <ArrowDown className="h-3.5 w-3.5" weight="bold" />
                    <span>Ir al final</span>
                  </button>
                )}
              </div>

              {/* Compositor de Consultas IA */}
              <SiBotInput
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                stop={stop}
                onQuickAction={handleSuggestion}
                onClearDraft={() => setInput('')}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
