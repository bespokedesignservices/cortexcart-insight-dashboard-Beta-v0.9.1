'use client';

import React from 'react';

const CountryViewsList = ({ locationData = [] }) => {
  if (locationData.length === 0) {
    return <p className="text-sm text-gray-500">No location data available for this period.</p>;
  }

  return (
    // --- FIX: Added h-full and overflow-y-auto to make the list scrollable ---
    <div className="flow-root h-full overflow-y-auto">
      <ul role="list" className="divide-y divide-gray-200">
        {locationData.map((loc) => (
          <li key={loc.id || loc.name} className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p title={loc.id || loc.name} className="text-sm font-medium text-gray-900 truncate">
                  {loc.id || loc.name}
                </p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">
                {loc.value.toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CountryViewsList;
