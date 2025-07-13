import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CostChart = ({ conversationCosts }) => {
  const chartRef = useRef(null);

  const prepareChartData = () => {
    if (!conversationCosts || conversationCosts.length === 0) {
      return null;
    }

    const colors = [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)'
    ];

    const maxTurns = Math.max(...conversationCosts.map(c => c.turnCosts.length));
    const labels = Array.from({ length: maxTurns }, (_, i) => `Turn ${i + 1}`);

    const datasets = conversationCosts.map((cost, index) => {
      const cumulativeCosts = [];
      let cumulative = 0;
      
      cost.turnCosts.forEach(turn => {
        cumulative += turn.totalCost;
        cumulativeCosts.push(cumulative);
      });

      return {
        label: `${cost.vendorName} - ${cost.modelName}`,
        data: cumulativeCosts,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '33',
        tension: 0.1
      };
    });

    return {
      labels,
      datasets
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cumulative Cost by Turn'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 4
            }).format(value);
          }
        }
      }
    }
  };

  const chartData = prepareChartData();

  if (!chartData) {
    return null;
  }

  return (
    <div className="cost-chart-container">
      <div style={{ height: '400px' }}>
        <Line ref={chartRef} options={options} data={chartData} />
      </div>
    </div>
  );
};

export default CostChart;