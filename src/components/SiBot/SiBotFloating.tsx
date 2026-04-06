import React, { useState } from 'react';
import { X, DotsThreeCircle, Trash } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useSiBot } from '../../hooks/useSiBot';
import { SiBotMessage } from './SiBotMessage';
import { SiBotInput } from './SiBotInput';
import { SiBotSuggestions } from './SiBotSuggestions';
import { SiBotLogo } from './SiBotLogo';

const getMessageContent = (message: any): string => {
  if (typeof message?.content === 'string' && message.content.trim()) {
    return message.content;
  }

  if (Array.isArray(message?.parts)) {
    return message.parts
      .filter((part: any) => part?.type === 'text' && typeof part.text === 'string')
      .map((part: any) => part.text)
      .join('');
  }

  return '';
};

export const SiBotFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, clearHistory, stop, append } = useSiBot();

  const handleSuggestion = (text: string) => {
    append({ role: 'user', content: text });
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
            isOpen ? 'bg-zinc-800' : 'bg-teal-600'
          } text-white`}
          aria-label="Toggle SiBot"
        >
          {isOpen ? <X className="w-6 h-6" /> : <SiBotLogo className="w-8 h-8 drop-shadow-md" />}
        </button>
      </div>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[400px] h-[650px] max-h-[80vh] max-w-[calc(100vw-3rem)] bg-zinc-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-zinc-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200">
              <div className="flex items-center gap-2 relative">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white">
                  <SiBotLogo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">SiBot</h3>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    En línea
                  </p>
                </div>
              </div>
              
              <button 
                onClick={clearHistory}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 rounded-xl transition-colors"
                title="Limpiar historial"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <SiBotLogo className="w-10 h-10 text-teal-600" />
                  </div>
                  <h4 className="text-zinc-800 font-semibold mb-2">¡Hola! Soy SiBot</h4>
                  <p className="text-zinc-500 text-sm max-w-[250px] mb-6">
                    Tu asistente virtual especializado en SIVAC. Puedo analizar datos, inventarios y generar gráficos.
                  </p>
                  
                  <div className="w-full text-left">
                     <SiBotSuggestions onSelect={handleSuggestion} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {messages.map((msg) => {
                    const content = getMessageContent(msg);

                    if (!content.trim()) return null;

                    return (
                      <SiBotMessage
                        key={msg.id}
                        role={msg.role as any}
                        content={content}
                      />
                    );
                  })}
                  {isLoading && (
                    <div className="flex w-full mb-6 justify-start">
                      <div className="flex max-w-[85%] flex-row items-end gap-2">
                         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <SiBotLogo className="w-5 h-5" />
                         </div>
                         <div className="bg-white border border-zinc-200 text-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                           <DotsThreeCircle className="w-6 h-6 animate-pulse text-zinc-400" />
                         </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex gap-2 items-start mt-2">
                      <p>Ha ocurrido un error al conectar con SiBot: {error.message || 'No se recibió una respuesta válida.'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <SiBotInput 
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

