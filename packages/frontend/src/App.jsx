import React, { useEffect, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import BookmarkletInstall from './components/BookmarkletInstall/BookmarkletInstall';
import ComparisonContainer from './components/ComparisonView/ComparisonContainer';
import ErrorBoundary from './components/UI/ErrorBoundary';

function App() {
  const { properties, addProperty, removeProperty, clearAll } = useLocalStorage();
  const [importMessage, setImportMessage] = useState(null);

  // Handle bookmarklet import via URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#import=')) return;

      try {
        const encoded = hash.slice('#import='.length);
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);

        if (!data.url || !data.url.includes('idealista.com')) {
          setImportMessage({ type: 'error', text: 'Invalid property data received.' });
          return;
        }

        // Check for duplicates
        if (properties.some(p => p.url === data.url)) {
          setImportMessage({ type: 'info', text: 'This property is already in your comparison.' });
        } else {
          addProperty(data);
          setImportMessage({ type: 'success', text: `Added: ${data.title || data.url}` });
        }
      } catch {
        setImportMessage({ type: 'error', text: 'Failed to import property data.' });
      }

      // Clear hash
      window.history.replaceState(null, '', window.location.pathname);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [addProperty, properties]);

  // Auto-dismiss messages
  useEffect(() => {
    if (!importMessage) return;
    const timer = setTimeout(() => setImportMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [importMessage]);

  const handleClearAll = () => {
    if (properties.length === 0) return;
    if (window.confirm('Remove all properties from comparison?')) {
      clearAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-idealista-dark">
            IdealistaPlus
          </h1>
          {properties.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              aria-label={`Clear all ${properties.length} properties`}
            >
              Clear all ({properties.length})
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <BookmarkletInstall />
        </div>

        {importMessage && (
          <div
            role="alert"
            className={`rounded-lg p-4 flex items-start justify-between ${
              importMessage.type === 'success' ? 'bg-green-50 border border-green-200' :
              importMessage.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}
          >
            <p className={`text-sm ${
              importMessage.type === 'success' ? 'text-green-600' :
              importMessage.type === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>{importMessage.text}</p>
            <button
              onClick={() => setImportMessage(null)}
              className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
              aria-label="Dismiss message"
            >
              &times;
            </button>
          </div>
        )}

        <ErrorBoundary>
          <ComparisonContainer
            properties={properties}
            onRemove={removeProperty}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
