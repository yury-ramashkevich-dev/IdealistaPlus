import React from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';

function ComparisonContainer({ properties, onRemove }) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p className="text-lg font-medium">No properties to compare yet</p>
        <p className="text-sm mt-1">
          Paste an Idealista property URL above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4 scroll-smooth">
      <div className="flex gap-4 min-w-min">
        {properties.map((property) => (
          <PropertyCard
            key={property.url}
            property={property}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

export default ComparisonContainer;
