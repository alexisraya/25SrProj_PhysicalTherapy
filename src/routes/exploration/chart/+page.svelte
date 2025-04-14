<script>
  import Chart from '$lib/design-system/components/Chart.svelte';

  let chartType = 'bar';

  let myData = {
    labels: ['Aurora', 'Goldon', 'Thornton', 'Colorado Springs'],
    datasets: [
      {
        label: 'Appointment Requests (by location)',
        backgroundColor: ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9'],
        data: [42, 32, 23, 52],
        tension: 0.32,
        borderWidth: 1
      }
    ]
  };

  let myOptions = null;

  let config = {
    chartType,
    myData,
    myOptions
  };
</script>

<div class="container">
  <Chart />
</div>

<style>
  .container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
