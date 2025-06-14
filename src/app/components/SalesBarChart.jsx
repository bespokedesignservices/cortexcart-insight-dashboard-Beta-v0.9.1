// src/app/components/SalesBarChart.jsx
'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Change the prop name to be more descriptive
const SalesBarChart = ({ apiData = [] }) => {

  // This logic transforms the data from our API into the format Chart.js needs
  const chartJsData = {
    labels: apiData.map(item => new Date(item.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Sales ($)',
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
