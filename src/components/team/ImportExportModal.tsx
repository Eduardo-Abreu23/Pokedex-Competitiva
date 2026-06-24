import { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';

interface ImportExportModalProps {
  mode: 'import' | 'export';
  /** Pre-filled Showdown text for export mode. */
  initialText?: string;
  onClose: () => void;
  /** Called with pasted text in import mode. */
  onImport?: (text: string) => Promise<void>;
}

export function ImportExportModal({ mode, initialText = '', onClose, onImport }: ImportExportModalProps) {
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleImport() {
    if (!onImport) return;
    setBusy(true);
    setError(null);
    try {
      await onImport(text);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao importar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">
            {mode === 'export' ? 'Exportar time (Showdown)' : 'Importar time (Showdown)'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={mode === 'export'}
            placeholder={mode === 'import' ? 'Cole aqui o time no formato Pokémon Showdown…' : ''}
            className="w-full h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
          {mode === 'export' ? (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={!text.trim() || busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <Download size={16} />
              {busy ? 'Importando…' : 'Importar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
