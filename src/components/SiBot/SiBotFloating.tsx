import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowsInSimple,
  ArrowsOutSimple,
  DownloadSimple,
  Trash,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useSiBot } from '../../hooks/useSiBot';
import { useCurrentRoute } from '../../hooks/useRouting';
import { useToastContext } from '../../contexts/ToastContext';
import { useApp } from '../../contexts/AppContext';
import { SiBotMessage } from './SiBotMessage';
import { SiBotInput } from './SiBotInput';
import { SiBotSuggestions } from './SiBotSuggestions';
import { SiBotLogo } from './SiBotLogo';

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
  const { sibotOpen, setSibotOpen, sibotExpanded, setSibotExpanded } = useApp();
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

  const activeModuleLabel = MODULE_LABELS[currentModule] || 'General';

  const handleSuggestion = (text: string) => {
    append({ role: 'user', content: text });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (event: MediaQueryList | MediaQueryListEvent) => {
      if (!event.matches) {
        setSibotExpanded(false);
      }
    };

    handleMediaChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    mediaQuery.addListener(handleMediaChange);
    return () => mediaQuery.removeListener(handleMediaChange);
  }, [setSibotExpanded]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setSibotOpen((prev) => !prev);
      } else if (event.key === 'Escape' && sibotOpen) {
        if (sibotExpanded) {
          setSibotExpanded(false);
        } else {
          setSibotOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sibotOpen, sibotExpanded, setSibotOpen, setSibotExpanded]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    if (sibotOpen && messages.length > 0) {
      scrollToBottom(isLoading ? 'auto' : 'smooth');
    }
  }, [messages, sibotOpen, isLoading]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBottom(distanceFromBottom > 140);
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

  let lastAssistantMessageId: string | undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant' && messages[i].content.trim()) {
      lastAssistantMessageId = messages[i].id;
      break;
    }
  }

  return (
    <>
      {/* Lanzador Flotante Aurora AI (solo visible cuando el sidebar está cerrado) */}
      <AnimatePresence>
        {!sibotOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[4.5rem] right-4 lg:bottom-6 lg:right-6 z-40 font-sans antialiased"
          >
            <button
              type="button"
              onClick={() => setSibotOpen(true)}
              aria-label="Abrir panel lateral SiBot IA (⌘J)"
              className="group relative inline-flex items-center rounded-2xl p-[1.5px] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 active:scale-[0.97]"
            >
              <span
                aria-hidden="true"
                className="sibot-aurora-halo pointer-events-none absolute -inset-1.5 rounded-3xl opacity-65 blur-lg transition-all duration-300 group-hover:-inset-2 group-hover:opacity-100 group-hover:blur-xl"
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              >
                <span className="sibot-aurora-spin-beam absolute -inset-[120%] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              </span>

              <span className="relative z-10 flex h-12 items-center gap-2.5 rounded-[14.5px] bg-[#11131c]/95 px-3.5 text-white shadow-[0_16px_40px_-12px_rgba(124,58,237,0.55)] backdrop-blur-md transition-colors duration-200 group-hover:bg-[#151824]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[14.5px] bg-gradient-to-r from-violet-500/15 via-cyan-400/10 to-fuchsia-500/15 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />

                <span className="sibot-aurora-bg relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_0_20px_rgba(6,182,212,0.45)] ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                  <SiBotLogo aurora className="h-5 w-5" />
                </span>

                <span className="relative z-10 flex items-center gap-2 pr-0.5">
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-violet-200 bg-clip-text text-[13px] font-semibold tracking-tight text-transparent whitespace-nowrap shrink-0">
                    SiBot IA
                  </span>

                  {isLoading ? (
                    <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-cyan-300 border-r-transparent" />
                  ) : (
                    <span className="hidden rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-200 sm:inline-block whitespace-nowrap shrink-0">
                      ⌘J
                    </span>
                  )}
                </span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Derecho Minimalista (Push Sidebar en escritorio) */}
      <AnimatePresence>
        {sibotOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar panel lateral"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSibotOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed top-0 right-0 bottom-0 z-50 flex h-[100dvh] flex-col border-l border-line-soft bg-surface font-sans antialiased transition-[width] duration-300 ease-out ${
                sibotExpanded ? 'w-full sm:w-[640px]' : 'w-full sm:w-[400px]'
              }`}
              aria-label="Asistente Analítico SiBot"
            >
              {/* Cabecera Minimalista sin bordes anidados */}
              <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line-soft px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="sibot-aurora-bg flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white">
                    <SiBotLogo aurora className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
                    <span className="font-semibold tracking-[-0.01em] text-ink whitespace-nowrap shrink-0">
                      SiBot
                    </span>
                    <span className="text-muted" aria-hidden="true">
                      ·
                    </span>
                    <span className="truncate text-xs font-normal text-muted-2">
                      {activeModuleLabel}
                    </span>
                  </div>
                </div>

                {/* Controles limpios sin cajas ni bordes */}
                <div className="flex shrink-0 items-center gap-0.5">
                  {messages.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleExportSession}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
                        title="Descargar informe (.md)"
                        aria-label="Descargar informe de la sesión"
                      >
                        <DownloadSimple className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          clearHistory();
                          toast.info('Nueva sesión', 'Se limpió el historial de conversación.');
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-surface-soft hover:text-[rgb(var(--color-status-danger-text))]"
                        title="Limpiar conversación"
                        aria-label="Limpiar conversación"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setSibotExpanded((prev) => !prev)}
                    className={`hidden h-8 w-8 items-center justify-center rounded-lg transition-colors lg:inline-flex ${
                      sibotExpanded
                        ? 'bg-surface-tint text-brand'
                        : 'text-muted-2 hover:bg-surface-soft hover:text-ink'
                    }`}
                    title={
                      sibotExpanded
                        ? 'Volver al ancho estándar (400px)'
                        : 'Ampliar ancho para tablas y gráficos (640px)'
                    }
                    aria-label="Alternar ancho del panel"
                  >
                    {sibotExpanded ? (
                      <ArrowsInSimple className="h-4 w-4" />
                    ) : (
                      <ArrowsOutSimple className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSibotOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
                    title="Cerrar panel (Esc)"
                    aria-label="Cerrar panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lienzo de Conversación Puro */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 scroll-smooth scrollbar-thin"
              >
                {messages.length === 0 ? (
                  <div className="flex min-h-full flex-col justify-center py-6">
                    <div className="mb-6">
                      <h4 className="text-[17px] font-semibold tracking-[-0.015em] leading-snug text-ink [text-wrap:balance]">
                        ¿Qué necesitas consultar en {activeModuleLabel}?
                      </h4>
                      <p className="mt-1.5 text-[13px] font-normal leading-relaxed text-muted-2">
                        Analiza en tiempo real el inventario de biológicos, lotes por vencer, entregas y reportes exportables a Excel.
                      </p>
                    </div>

                    <SiBotSuggestions
                      onSelect={handleSuggestion}
                      currentModule={currentModule}
                    />
                  </div>
                ) : (
                  <div className="flex w-full flex-col gap-6 pb-2">
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
                      <div className="flex w-full justify-start">
                        <SiBotMessage messageRole="assistant" content="" isStreaming />
                      </div>
                    )}

                    {error && (
                      <div
                        className={`flex w-full items-start justify-between gap-2.5 rounded-xl px-3.5 py-3 text-xs ${
                          error.message.includes('Límite') ||
                          error.message.includes('429') ||
                          error.message.toLowerCase().includes('quota')
                            ? 'bg-[rgb(var(--color-status-warning-bg))] text-[rgb(var(--color-status-warning-text))]'
                            : 'bg-[rgb(var(--color-status-danger-bg))] text-[rgb(var(--color-status-danger-text))]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {error.message.includes('Límite') ||
                              error.message.includes('429') ||
                              error.message.toLowerCase().includes('quota')
                                ? 'Límite de consultas alcanzado'
                                : 'No se pudo completar la consulta'}
                            </span>
                            <span className="mt-0.5 leading-relaxed opacity-90">
                              {error.message.includes('Límite') ||
                              error.message.includes('429') ||
                              error.message.toLowerCase().includes('quota')
                                ? 'Se alcanzó el límite temporal de peticiones. Espera unos segundos y vuelve a intentar.'
                                : error.message || 'Ocurrió un error al procesar la respuesta.'}
                            </span>
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={regenerateLast}
                                className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink transition-colors hover:bg-surface-soft"
                              >
                                Reintentar
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearError}
                          className="rounded-md p-1 opacity-75 hover:opacity-100"
                          aria-label="Cerrar alerta de error"
                        >
                          <X className="h-3.5 w-3.5" weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {showScrollBottom && messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom('smooth')}
                    className="sticky bottom-2 left-1/2 z-20 mx-auto flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:text-brand"
                  >
                    <ArrowDown className="h-3.5 w-3.5" weight="bold" />
                    <span>Ir al final</span>
                  </button>
                )}
              </div>

              {/* Compositor Minimalista */}
              <SiBotInput
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                stop={stop}
                onClearDraft={() => setInput('')}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
