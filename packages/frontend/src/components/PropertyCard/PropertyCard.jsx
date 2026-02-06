import React, { useState } from 'react';
import ImageCarousel from '../UI/ImageCarousel';

const MAX_VISIBLE_FEATURES = 5;

function PropertyCard({ property, onRemove }) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const {
    url,
    price,
    title,
    size,
    rooms,
    bathrooms,
    description,
    images = [],
    features = []
  } = property;

  const visibleFeatures = showAllFeatures
    ? features
    : features.slice(0, MAX_VISIBLE_FEATURES);
  const hiddenCount = features.length - MAX_VISIBLE_FEATURES;

  return (
    <div className="w-[350px] flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Remove button */}
      <div className="relative">
        <ImageCarousel images={images} />
        <button
          onClick={() => onRemove(url)}
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-500 shadow-sm transition-colors"
          title="Remove property"
        >
          &times;
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Price */}
        {price && (
          <p className="text-2xl font-bold text-idealista-green">{price}</p>
        )}

        {/* Title */}
        {title && (
          <h3 className="text-sm font-semibold text-idealista-dark leading-tight line-clamp-2">
            {title}
          </h3>
        )}

        {/* Key details */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          {size && (
            <span className="bg-gray-100 px-2 py-1 rounded">{size}</span>
          )}
          {rooms && (
            <span className="bg-gray-100 px-2 py-1 rounded">{rooms}</span>
          )}
          {bathrooms && (
            <span className="bg-gray-100 px-2 py-1 rounded">{bathrooms}</span>
          )}
        </div>

        {/* Description (truncated) */}
        {description && (
          <p className="text-xs text-gray-500 line-clamp-3">{description}</p>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
              {visibleFeatures.map((feature, i) => (
                <span
                  key={i}
                  className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                >
                  {feature}
                </span>
              ))}
              {!showAllFeatures && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllFeatures(true)}
                  className="text-xs text-idealista-green hover:underline px-1"
                >
                  +{hiddenCount} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* View on Idealista link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-idealista-green hover:underline font-medium pt-1"
        >
          View on Idealista &rarr;
        </a>
      </div>
    </div>
  );
}

export default PropertyCard;
