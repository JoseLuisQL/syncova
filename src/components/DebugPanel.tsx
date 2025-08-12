import React, { useState, useEffect } from 'react';
import { Bug, X } from 'lucide-react';

interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    // Interceptar console.log para mostrar en el panel
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: string, message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-50), `[${timestamp}] ${type}: ${message}`]);
    };

    console.log = (...args) => {
      originalLog(...args);
      if (args[0]?.includes?.('SIVAC')) {
        addLog('LOG', args.join(' '));
      }
    };

    console.error = (...args) => {
      originalError(...args);
      if (args[0]?.includes?.('SIVAC')) {
        addLog('ERROR', args.join(' '));
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      if (args[0]?.includes?.('SIVAC')) {
        addLog('WARN', args.join(' '));
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-64 bg-black bg-opacity-90 text-green-400 rounded-lg border border-gray-600 z-50">
      <div className="flex items-center justify-between p-2 border-b border-gray-600">
        <div className="flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          <span className="text-sm font-mono">Debug Panel</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-2 h-48 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500">Esperando logs...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 border-t border-gray-600">
        <button
          onClick={() => setLogs([])}
          className="text-xs text-gray-400 hover:text-white"
        >
          Limpiar logs
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;
