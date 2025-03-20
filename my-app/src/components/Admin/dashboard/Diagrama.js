import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function Diagrama({ messageStats }) {
  const labels = Object.keys(messageStats).slice(0, 15); 
  const dataValues = Object.values(messageStats).slice(0, 15); 

  const backgroundColors = [
    'rgba(144, 164, 174, 0.33)', 'rgba(21, 101, 192, 1)', 'rgba(0, 137, 123, 0.68)',
    'rgba(129, 212, 250, 0.53)', 'rgba(245, 124, 0, 0.6)', 'rgba(255, 87, 34, 0.7)',
    'rgba(255, 193, 7, 0.7)', 'rgba(76, 175, 80, 0.7)', 'rgba(233, 30, 99, 0.7)',
    'rgba(103, 58, 183, 0.7)', 'rgba(0, 188, 212, 0.7)', 'rgba(158, 158, 158, 0.7)',
    'rgba(0, 150, 136, 0.7)', 'rgba(63, 81, 181, 0.7)', 'rgba(205, 220, 57, 0.7)'
  ];

  const borderColors = backgroundColors.map(color => color.replace('0.7', '1')); // Convertir a sólido

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Porcentaje de Mensajes',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right', 
        labels: {
          boxWidth: 15, 
          padding: 10, 
        }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
}

export default Diagrama;
