import React, { useState } from 'react';
import ImageCarousel from '../UI/ImageCarousel';

const COMPARISON_ROWS = [
  { key: 'price', label: 'Price' },
  { key: 'propertyType', label: 'Type' },
  { key: 'size', label: 'Size' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'constructionYear', label: 'Year built' },
  { key: 'orientation', label: 'Orientation' },
  { key: 'energyConsumption', label: 'Consumption' },
  { key: 'emissions', label: 'Emissions' },
  { key: 'features', label: 'Features', type: 'tags' },
  { key: 'description', label: 'Description', type: 'text' },
];

const COL_WIDTH_PX = 300;
const LABEL_WIDTH_PX = 160;
const DESCRIPTION_TRUNCATE_LENGTH = 120;

function DescriptionCell({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-gray-300">&mdash;</span>;

  return (
    <div>
      <p className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-3'}`}>
        {text}
      </p>
      {text.length > DESCRIPTION_TRUNCATE_LENGTH && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-idealista-green hover:underline mt-1"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

function FeaturesCell({ features }) {
  const [showAll, setShowAll] = useState(false);
  if (!features || features.length === 0) {
    return <span className="text-gray-300">&mdash;</span>;
  }

  const visible = showAll ? features : features.slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {visible.map((f, i) => (
          <span
            key={i}
            className="inline-block px-2 py-0.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full"
          >
            {f}
          </span>
        ))}
      </div>
      {features.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-idealista-green hover:underline mt-1"
        >
          {showAll ? 'Show less' : `+${features.length - 5} more`}
        </button>
      )}
    </div>
  );
}

function CellValue({ property, row }) {
  if (row.type === 'tags') {
    return <FeaturesCell features={property[row.key]} />;
  }
  if (row.type === 'text') {
    return <DescriptionCell text={property[row.key]} />;
  }
  const val = property[row.key];
  if (!val) return <span className="text-gray-300">&mdash;</span>;
  return <span className="text-sm text-gray-700">{val}</span>;
}

function ComparisonContainer({ properties, onRemove }) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
          Use the bookmarklet on an Idealista property page to get started
        </p>
      </div>
    );
  }

  const tableWidth = LABEL_WIDTH_PX + COL_WIDTH_PX * properties.length;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="border-collapse table-fixed"
          style={{ width: `${tableWidth}px` }}
          aria-label="Property comparison"
        >
          <colgroup>
            <col style={{ width: `${LABEL_WIDTH_PX}px` }} />
            {properties.map((p) => (
              <col key={p.url} style={{ width: `${COL_WIDTH_PX}px` }} />
            ))}
          </colgroup>

          {/* Header row: images + title + remove button */}
          <thead>
            <tr>
              <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200 p-3 text-left align-bottom">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Property
                </span>
              </th>
              {properties.map((property) => (
                <th
                  key={property.url}
                  className="border-b border-r border-gray-200 p-0 align-top"
                >
                  <div className="relative">
                    <ImageCarousel images={property.images || []} />
                    <button
                      onClick={() => onRemove(property.url)}
                      className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-red-500 transition-colors text-sm font-bold"
                      title="Remove property"
                      aria-label={`Remove ${property.title || 'property'}`}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-3">
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-idealista-dark hover:text-idealista-green transition-colors line-clamp-2"
                    >
                      {property.title || 'View on Idealista'}
                    </a>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {COMPARISON_ROWS.map((row, rowIdx) => (
              <tr
                key={row.key}
                className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              >
                <td
                  className={`sticky left-0 z-30 border-b border-r border-gray-200 p-3 ${
                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-500">
                    {row.label}
                  </span>
                </td>
                {properties.map((property) => (
                  <td
                    key={property.url}
                    className="border-b border-r border-gray-200 p-3 align-top overflow-hidden"
                  >
                    <CellValue property={property} row={row} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComparisonContainer;
