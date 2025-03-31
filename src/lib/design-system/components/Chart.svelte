<script>
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  let canvas;
  let chart;

  Chart.register(...registerables);

  const data = {
    labels: ['1', '2', '3', '4', '5', '6', '7'], // Days 1-7
    datasets: [
      {
        label: 'User Rating',
        data: [5], // Example ratings for each day
        borderColor: '#0F1B1F',
        backgroundColor: '#79C9E8',
        borderWidth: 1,
        tension: 0, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hides chart legend
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days', // X-axis label
          font: { size: 12 },
          position: 'right',
          align: 'center',
          color: '#0F1B1F',
          // padding: { top: -35 },
        },
        grid: { display: false, color: '#0F1B1F' },
        ticks: {
          color: '#0F1B1F',
        },
        border: {
          color: '#0F1B1F',
        },
        offset: true,
      },
      y: {
        title: {
          display: true,
          text: 'Rating', // Y-axis label
          font: { size: 12 },
          position: 'right',
          align: 'center',
          color: '#0F1B1F',
          // padding: { right: -30 },
        },
        min: 0,
        max: 10,
        ticks: {
          color: '#0F1B1F',
          stepSize: 2, // Ensures only event numbers (0-10)
        },
        grid: { display: false },
        border: {
          color: '#0F1B1F',
        },
      },
    },
  };

  onMount(() => {
    if (canvas) {
      chart = new Chart(canvas, {
        type: 'line',
        data,
        options,
      });
    }

    return () => {
      if (chart) chart.destroy(); // Cleanup on component unmount
    };
  });
</script>

<div style="width: 100%; height: 180px;">
  <canvas bind:this={canvas}></canvas>
</div>
