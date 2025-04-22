<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // Only require two coordinates
  export let coordinates: { month: string; degrees: number }[] = [];

  // Chart dimensions and labels
  export let width = 200;
  export let height = 200;
  export let marginTop = 20;
  export let marginRight = 30;
  export let marginBottom = 60; // Increased to make room for x-axis title
  export let marginLeft = 70; // Increased to make room for y-axis title
  export let xAxisTitle = 'Months';
  export let yAxisTitle = 'Degrees';
  export let yAxisMax = 100;
  export let yAxisTicks = [20, 40, 60, 80, 100]; // Customizable ticks

  // Styling options
  export let barColor = 'var(--text-primary)';
  export let xAxisColor = 'var(--text-primary)';
  export let yAxisColor = 'var(--color-blue-1100)';
  export let showAxes = true;

  let svgElement;

  function updateChart() {
    // Clear previous chart
    if (svgElement) {
      d3.select(svgElement).selectAll('*').remove();
    }

    if (!coordinates || coordinates.length === 0) return;

    // Create the SVG container
    const svg = d3
      .select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Set up the months as our x-axis labels
    const months = coordinates.map((d) => d.month);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(months)
      .range([marginLeft, width - marginRight])
      .padding(0.3);

    // Set up y scale with customizable max value
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

    // Always show axes
    // X-axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);

    svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .attr('color', xAxisColor); // Apply x-axis color

    // Y-axis with customizable ticks
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yAxisTicks)
      .tickFormat(d3.format('d')) // Use integer format
      .tickSize(0)
      .tickPadding(10);

    svg
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(yAxis)
      .attr('color', yAxisColor); // Apply y-axis color

    // Add x-axis title
    svg
      .append('text')
      .attr('class', 'x-axis-title')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + (width - marginLeft - marginRight) / 2)
      .attr('y', height - 10)
      .attr('fill', xAxisColor)
      .text(xAxisTitle);

    // Add y-axis title
    svg
      .append('text')
      .attr('class', 'y-axis-title')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(marginTop + (height - marginTop - marginBottom) / 2))
      .attr('y', 15)
      .attr('fill', yAxisColor)
      .text(yAxisTitle);
  }

  onMount(() => {
    if (coordinates && coordinates.length > 0) {
      updateChart();
    }
  });

  // Update chart when data or dimensions change
  $: if (svgElement && coordinates && coordinates.length > 0) {
    updateChart();
  }
</script>

<svg bind:this={svgElement}></svg>
