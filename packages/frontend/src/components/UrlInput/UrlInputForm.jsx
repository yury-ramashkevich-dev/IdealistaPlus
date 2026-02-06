import React, { useState } from 'react';

const URL_PATTERN = /^https?:\/\/(www\.)?idealista\.com\/([a-z]{2}\/)?inmueble\/\d+\/?$/;

function UrlInputForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('Please enter a URL.');
      return;
    }

    if (!URL_PATTERN.test(trimmed)) {
      setValidationError(
        'Invalid URL. Must be an Idealista property link (e.g. https://www.idealista.com/inmueble/12345678/)'
      );
      return;
    }

    onSubmit(trimmed);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder="Paste Idealista property URL..."
          disabled={loading}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-idealista-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {validationError && (
          <p className="mt-1 text-sm text-red-500">{validationError}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-idealista-green text-white font-medium rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading...
          </>
        ) : (
          'Add Property'
        )}
      </button>
    </form>
  );
}

export default UrlInputForm;
