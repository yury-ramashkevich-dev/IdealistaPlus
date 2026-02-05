import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-idealista-dark">
            IdealistaPlus - Property Comparison
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-idealista-green mb-4">
            Welcome to IdealistaPlus!
          </h2>
          <p className="text-gray-600">
            Frontend is running successfully. Backend integration coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
