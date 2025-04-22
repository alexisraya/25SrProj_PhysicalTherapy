<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // Required coordinates data
  export let coordinates: { x: number; y: number }[] = [];

  // Chart dimensions
  export let width = 600;
  export let height = 400;
  export let marginTop = 20;
  export let marginRight = 30;
  export let marginBottom = 20;
  export let marginLeft = 20;

  // Styling options
  export let pointRadius = 7;
  export let lineColor = 'var(--text-primary)';
  export let lineWidth = 2;
  export let lineStyle = 'solid'; // 'solid', 'dashed', 'dotted'

  // Point styling
  export let defaultPointColor = 'var(--color-blue-525)';
  export let highlightPointColor = 'var(--color-orange-550)';
  export let pointStroke = 'var(--color-blue-1100)';
  export let pointStrokeWidth = 1.5;

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

    // Compute values for x and y scales
    const X = coordinates.map((d) => d.x);
    const Y = coordinates.map((d) => d.y);

    // Find min/max values for scaling
    const minX = Math.min(...X);
    const maxX = Math.max(...X);
    const minY = Math.min(...Y);
    const maxY = Math.max(...Y);

    // Add some padding to the domains
    const xPadding = (maxX - minX) * 0.1;
    const yPadding = (maxY - minY) * 0.1;

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([minX - xPadding, maxX + xPadding])
      .range([marginLeft, width - marginRight]);

    const yScale = d3
      .scaleLinear()
      .domain([minY - yPadding, maxY + yPadding])
      .range([height - marginBottom, marginTop]);

    // Create line generator
    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    // Draw the line connecting the points
    svg
      .append('path')
      .datum(coordinates)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr(
        'stroke-dasharray',
        lineStyle === 'dashed' ? '5,5' : lineStyle === 'dotted' ? '2,2' : 'none'
      )
      .attr('d', line);

    // Find the index of the point with the highest y value
    const highestYIndex = Y.indexOf(Math.max(...Y));

    // Add the scatter plot points
    svg
      .append('g')
      .selectAll('circle')
      .data(coordinates)
      .join('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', pointRadius)
      .attr('fill', (d, i) => (i === highestYIndex ? highlightPointColor : defaultPointColor))
      .attr('stroke', pointStroke)
      .attr('stroke-width', pointStrokeWidth);
  }

  onMount(() => {
    // Only attempt to draw the chart if we have data
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
