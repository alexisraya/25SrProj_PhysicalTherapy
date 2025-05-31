<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  // Only require two coordinates
  export let coordinates: { month: string; degrees: number }[] = [];

  // New prop to determine chart type
  export let chartType: 'ROM' | 'Strength' = 'ROM';

  // Chart dimensions and labels
  export let height = 300; // Fixed height that won't change
  export let marginTop = 20;
  export let marginRight = 30;
  export let marginBottom = 60;
  export let marginLeft = 70;
  export let xAxisTitle = 'Months';
  export let yAxisTitle = chartType === 'ROM' ? 'Degrees' : 'Pounds';
  export let yAxisMax = chartType === 'ROM' ? 100 : 100;
  export let yAxisTicks = chartType === 'ROM' ? [0, 20, 40, 60, 80, 100] : [0, 20, 40, 60, 80, 100];

  // Color schemes
  const colorSchemes = {
    ROM: {
      barColor: 'var(--background)',
      xAxisLineColor: 'var(--background)',
      xAxisTextColor: 'var(--text-primary)',
      xAxisTitleColor: 'var(--text-primary)',
      yAxisLineColor: 'var(--color-blue-1100)',
      yAxisTextColor: 'var(--color-blue-1100)',
      yAxisTitleColor: 'var(--color-blue-1100)'
    },
    Strength: {
      barColor: 'var(--color-blue-525)',
      xAxisLineColor: 'var(--color-blue-525)',
      xAxisTextColor: 'var(--color-blue-1100)',
      xAxisTitleColor: 'var(--color-blue-1100)',
      yAxisLineColor: 'var(--text-primary)',
      yAxisTextColor: 'var(--text-primary)',
      yAxisTitleColor: 'var(--text-primary)'
    }
  };

  // Apply color scheme based on chart type
  $: activeColorScheme = colorSchemes[chartType];

  // Styling options with reactive values
  $: barColor = activeColorScheme.barColor;
  $: xAxisLineColor = activeColorScheme.xAxisLineColor;
  $: xAxisTextColor = activeColorScheme.xAxisTextColor;
  $: xAxisTitleColor = activeColorScheme.xAxisTitleColor;
  $: yAxisLineColor = activeColorScheme.yAxisLineColor;
  $: yAxisTextColor = activeColorScheme.yAxisTextColor;
  $: yAxisTitleColor = activeColorScheme.yAxisTitleColor;
  export let showAxes = true;

  let svgElement;
  let containerElement;
  let containerWidth = 500; // Default starting width
  let resizeObserver;

  function updateChart() {
    // Clear previous chart
    if (svgElement) {
      d3.select(svgElement).selectAll('*').remove();
    }

    if (!coordinates || coordinates.length === 0) return;

    // Get the current container width for responsive scaling
    const currentWidth = containerWidth;

    // Create the SVG with current dimensions
    const svg = d3.select(svgElement).attr('width', currentWidth).attr('height', height);

    // Set up the months as our x-axis labels
    const months = coordinates.map((d) => d.month);

    // Create scales that adapt to the current width
    const xScale = d3
      .scaleBand()
      .domain(months)
      .range([marginLeft, currentWidth - marginRight])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, yAxisMax])
      .range([height - marginBottom, marginTop]);

    // Create and add the bars
    svg
      .append('g')
      .selectAll('rect')
      .data(coordinates)
      .join('rect')
      .attr('x', (d) => xScale(d.month))
      .attr('y', (d) => yScale(d.degrees))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - marginBottom - yScale(d.degrees))
      .attr('fill', barColor);

    // X-axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);

    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(xAxis);

    // Style x-axis line and text
    xAxisGroup.select('.domain').attr('stroke', xAxisLineColor).attr('stroke-width', 2);
    xAxisGroup.selectAll('.tick text').attr('fill', xAxisTextColor);

    // Y-axis with customizable ticks
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yAxisTicks)
      .tickFormat(d3.format('d'))
      .tickSize(0)
      .tickPadding(10);

    const yAxisGroup = svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(yAxis);

    // Style y-axis line and text
    yAxisGroup.select('.domain').attr('stroke', yAxisLineColor).attr('stroke-width', 2);
    yAxisGroup.selectAll('.tick text').attr('fill', yAxisTextColor);

    // Hide the "0" tick text for ROM charts
    if (chartType === 'ROM') {
      yAxisGroup
        .selectAll('.tick text')
        .filter(function (d) {
          return d === 0;
        })
        .style('opacity', 0);
    }

    // Add x-axis title
    svg
      .append('text')
      .attr('class', 'x-axis-title')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + (currentWidth - marginLeft - marginRight) / 2)
      .attr('y', height - 10)
      .attr('fill', xAxisTitleColor)
      .text(xAxisTitle);

    // Add y-axis title
    svg
      .append('text')
      .attr('class', 'y-axis-title')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(marginTop + (height - marginTop - marginBottom) / 2))
      .attr('y', 15)
      .attr('fill', yAxisTitleColor)
      .text(yAxisTitle);
  }

  // Function to measure container and update chart size
  function updateSize() {
    if (containerElement) {
      containerWidth = containerElement.getBoundingClientRect().width;
      updateChart();
    }
  }

  onMount(() => {
    // Set up resize observer to track container width changes
    resizeObserver = new ResizeObserver((entries) => {
      updateSize();
    });

    if (containerElement) {
      resizeObserver.observe(containerElement);
      updateSize(); // Initial rendering
    }
  });

  onDestroy(() => {
    // Clean up the observer when the component is destroyed
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  // Re-render when data or chart type changes
  $: if (coordinates && coordinates.length > 0 && containerElement) {
    updateChart();
  }

  $: if (chartType && containerElement) {
    updateChart();
  }
</script>

<div class="chart-container" bind:this={containerElement}>
  <svg bind:this={svgElement}></svg>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 300px;
  }
  svg {
    height: 300px;
    display: block;
  }
  /* @media screen and (max-width: 500px) {
    svg {
      height: 200px;
    }
  } */
</style>
