import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function TaskChart({ stats }) {
  // Prepare chart data
  const chartData = {
    labels: stats?.stats?.map(item => {
      // Convert status to readable format
      switch(item._id) {
        case 'pending': return 'Pending Tasks';
        case 'completed': return 'Completed Tasks';
        case 'overdue': return 'Overdue Tasks';
        default: return item._id;
      }
    }) || [],
    datasets: [
      {
        data: stats?.stats?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',  // Red for pending
          'rgba(54, 162, 235, 0.7)',   // Blue for completed
          'rgba(255, 206, 86, 0.7)',   // Yellow for overdue
          'rgba(75, 192, 192, 0.7)',   // Green for others
          'rgba(153, 102, 255, 0.7)',  // Purple for others
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}