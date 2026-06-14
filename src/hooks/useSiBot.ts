import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '../config/api';
import { STORAGE_KEYS } from '../constants';

const STORAGE_KEY = 'sivac_sibot_chat_history';

interface StoredMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  parts?: Array<{ type?: string; text?: string }>;
  content?: string;
}

const isStoredMessage = (value: unknown): value is StoredMessage => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as StoredMessage;

  if (!candidate.role || !['user', 'assistant', 'system'].includes(candidate.role)) {
    return false;
  }

  if (typeof candidate.content === 'string') return true;

  return Array.isArray(candidate.parts);
};

const normalizeStoredMessages = (
  value: unknown,
): Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string }> | null => {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .filter(isStoredMessage)
    .map((message, index) => {
      const textFromParts = Array.isArray(message.parts)
        ? message.parts
            .filter((part) => part?.type === 'text' && typeof part.text === 'string')
            .map((part) => part.text)
            .join('')
        : '';

      const content = typeof message.content === 'string' ? message.content : textFromParts;

      if (!content.trim()) {
        return null;
      }

      return {
        id: message.id ?? `sibot-${index}-${Date.now()}`,
        role: message.role,
        content,
      };
    })
    .filter(Boolean) as Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string }>;

  return normalized.length > 0 ? normalized : [];
};

export function useSiBot() {
  const apiUrl = `${getApiBaseUrl()}/sibot/chat`;
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalized = normalizeStoredMessages(parsed);

        if (normalized === null) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        if (normalized.length > 0) {
          setMessages?.(normalized);
        }
      } catch (e) {
        console.error('Failed to parse SiBot chat history', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [setMessages]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [messages]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleInputChange = (e: any) => {
    if (e.target) setInput(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e?.preventDefault();

    void sendMessage(input);
  };

  const handleSuggestionAppend = (message: any) => {
    const content = typeof message === 'string' ? message : message?.content;

    if (typeof content === 'string' && content.trim()) {
      void sendMessage(content);
    }
  };

  const sendMessage = async (rawInput: string) => {
    const content = rawInput.trim();

    if (!content || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content,
    };

    const assistantId = `assistant-${Date.now()}`;

    setError(null);
    setInput('');
    setIsLoading(true);
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        const rawText = await response.text();

        try {
          const payload = JSON.parse(rawText) as { message?: string; error?: string };
          throw new Error(payload.message || payload.error || 'Error al conectar con SiBot');
        } catch {
          throw new Error(rawText || `Error HTTP ${response.status} al conectar con SiBot`);
        }
      }

      if (!response.body) {
        throw new Error('No se recibió una respuesta válida.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: accumulatedText }
              : message,
          ),
        );
      }

      accumulatedText += decoder.decode();

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: accumulatedText.trim() || 'No se recibió una respuesta válida.',
              }
            : message,
        ),
      );
    } catch (err) {
      const finalError = err instanceof Error ? err : new Error('Error desconocido al conectar con SiBot');
      setError(finalError);
      setMessages((current) => current.filter((message) => message.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    clearHistory,
    stop: undefined,
    append: handleSuggestionAppend
  };
}
