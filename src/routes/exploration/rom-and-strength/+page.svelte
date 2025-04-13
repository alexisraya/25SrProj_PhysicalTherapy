<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getUserMetrics } from '$firebase/services/metricsService';
  import type { UserMetrics } from '$firebase/types/userType';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  let metricsData: UserMetrics | null = null;
  let loading = true;
  let error: string | null = null;
  let userId = '';

  let romCanvas: HTMLCanvasElement;
  let strengthCanvas: HTMLCanvasElement;
  let romChart: Chart | null = null;
  let strengthChart: Chart | null = null;

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        error = 'Please log in to view this page';
        loading = false;
        return;
      }

      userId = user.uid;
      await loadMetricsData();
    });

    return unsubscribe;
  });

  async function loadMetricsData() {
    try {
      loading = true;
      error = null;

      const metrics = await getUserMetrics(userId);

      if (!metrics) {
        error = 'Could not load metrics data';
        loading = false;
        return;
      }

      metricsData = metrics;

      setTimeout(() => {
        if (metricsData) {
          initializeCharts();
        }
      }, 100);
    } catch (err) {
      console.error('Error loading metrics:', err);
      error = 'Failed to load metrics data';
    } finally {
      loading = false;
    }
  }

  function initializeCharts() {
    if (!metricsData) return;

    // ROM Chart
    if (romCanvas) {
      if (romChart) {
        romChart.destroy();
      }

      const romData =
        metricsData.rangeOfMotion && metricsData.rangeOfMotion.length > 0
          ? metricsData.rangeOfMotion.sort((a, b) => a.month - b.month)
          : [];

      romChart = new Chart(romCanvas, {
        type: 'bar',
        data: {
          labels: romData.map((rom) => `Month ${rom.month}`),
          datasets: [
            {
              label: 'Degrees',
              data: romData.map((rom) => rom.degrees),
              backgroundColor: '#333',
              borderColor: '#000',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20,
                callback: function (value) {
                  return value;
                }
              },
              title: {
                display: true,
                text: 'Degrees'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Months'
              }
            }
          }
        }
      });
    }
    if (strengthCanvas) {
      if (strengthChart) {
        strengthChart.destroy();
      }

      const strengthData =
        metricsData.strength && metricsData.strength.length > 0
          ? metricsData.strength.sort((a, b) => a.month - b.month)
          : [];

      strengthChart = new Chart(strengthCanvas, {
        type: 'bar',
        data: {
          labels: strengthData.map((str) => `Month ${str.month}`),
          datasets: [
            {
              label: 'Strength Scale',
              data: strengthData.map((str) => str.strengthScale),
              backgroundColor: '#333',
              borderColor: '#000',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              ticks: {
                stepSize: 1
              },
              title: {
                display: true,
                text: 'Strength Scale'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Months'
              }
            }
          }
        }
      });
    }
  }
</script>

<div class="container">
  <h1>Recovery Metrics</h1>
  {#if loading}
    <p class="loading">Loading data...</p>
  {:else if error}
    <div class="error">{error}</div>
    <button on:click={loadMetricsData} class="reload-btn">Try Again</button>
  {:else}
    <div class="metrics-container">
      <div class="chart-box">
        <h2>Range of Motion</h2>
        <div class="chart">
          <canvas bind:this={romCanvas}></canvas>
        </div>
        {#if !metricsData || !metricsData.rangeOfMotion || metricsData.rangeOfMotion.length === 0}
          <p class="no-data">No range of motion data available yet</p>
        {/if}
      </div>
      <div class="chart-box">
        <h2>Strength</h2>
        <div class="chart">
          <canvas bind:this={strengthCanvas}></canvas>
        </div>
        {#if !metricsData || !metricsData.strength || metricsData.strength.length === 0}
          <p class="no-data">No strength data available yet</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    text-align: center;
    margin-bottom: 30px;
  }

  h2 {
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .loading {
    text-align: center;
    padding: 20px;
  }

  .error {
    background-color: #ffdddd;
    border: 1px solid #f99;
    color: #700;
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 4px;
  }

  .reload-btn {
    background-color: #333;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    display: block;
    margin: 0 auto;
  }

  .metrics-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  @media (min-width: 768px) {
    .metrics-container {
      flex-direction: row;
    }

    .chart-box {
      width: 50%;
    }
  }

  .chart-box {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
  }

  .chart {
    height: 250px;
    margin-bottom: 20px;
  }

  .no-data {
    text-align: center;
    color: #888;
    padding: 20px;
  }
</style>
