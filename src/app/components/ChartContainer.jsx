// app/components/ChartContainer.jsx
import React from 'react';

/**
 * A reusable container component for displaying charts.
 * It provides a consistent card-style wrapper with a title.
 * @param {string} title - The title to display at the top of the chart card.
 * @param {React.ReactNode} children - The actual chart component to be rendered inside the container.
 */
const ChartContainer = ({ title, children }) => {
  return (
    // The main card styling using Tailwind CSS
    <div className="bg-white p-6 rounded-lg shadow-md">
      
      {/* The title of the chart */}
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        {title}
      </h3>
      
      {/* This div holds the chart itself. We give it a height so Chart.js can render correctly. */}
      <div className="h-96">
        {children}
      </div>

    </div>
  );
};

export default ChartContainer;
