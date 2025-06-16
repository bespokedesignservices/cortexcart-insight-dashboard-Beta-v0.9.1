'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- FIX: Added 'currencySymbol' prop with a default value ---
const SalesBarChart = ({ apiData = [], currencySymbol = '$' }) => {
  
  const chartJsData = {
    labels: apiData.map(item => new Date(item.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        // --- FIX: Use the dynamic currency symbol in the label ---
        label: `Sales (${currencySymbol})`,
        data: apiData.map(item => item.total_sales),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
        y: { beginAtZero: true }
    }
  };

  return <Bar data={chartJsData} options={options} />;
};

export default SalesBarChart;
