<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // Only require two coordinates
  export let coordinates: { month: string; degrees: number }[] = [];

  // New prop to determine chart type
  export let chartType: 'ROM' | 'Strength' = 'ROM';

  // Chart dimensions and labels
  export let width = 200;
  export let height = 200;
  export let marginTop = 20;
  export let marginRight = 30;
  export let marginBottom = 60;
  export let marginLeft = 70;
  export let xAxisTitle = 'Months';
  export let yAxisTitle = chartType === 'ROM' ? 'Degrees' : 'Pounds';
  export let yAxisMax = chartType === 'ROM' ? 180 : 100;
  export let yAxisTicks = chartType === 'ROM' ? [0, 45, 90, 135, 180] : [0, 20, 40, 60, 80, 100];

  // Color schemes
  const colorSchemes = {
    ROM: {
      barColor: 'var(--text-primary)',
      xAxisLineColor: 'var(--text-primary)',
      xAxisTextColor: 'var(--background)',
      xAxisTitleColor: 'var(--background)', // Separate color for x-axis title
      yAxisLineColor: 'var(--color-blue-1100)',
      yAxisTextColor: 'var(--color-blue-1100)',
      yAxisTitleColor: 'var(--color-blue-1100)' // Separate color for y-axis title
    },
    Strength: {
      barColor: 'var(--color-blue-525)',
      xAxisLineColor: 'var(--color-blue-525)',
      xAxisTextColor: 'var(--color-blue-1100)',
      xAxisTitleColor: 'var(--olor-blue-1100)', // Separate color for x-axis title
      yAxisLineColor: 'var(--text-primary)',
      yAxisTextColor: 'var(--text-primary)',
      yAxisTitleColor: 'var(--text-primary)' // Separate color for y-axis title
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

    // X-axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);

    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(xAxis);

    // Style x-axis line (domain) and text separately
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

    // Style y-axis line (domain) and text separately
    yAxisGroup.select('.domain').attr('stroke', yAxisLineColor).attr('stroke-width', 2);

    yAxisGroup.selectAll('.tick text').attr('fill', yAxisTextColor);

    // Add x-axis title with its own color
    svg
      .append('text')
      .attr('class', 'x-axis-title')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + (width - marginLeft - marginRight) / 2)
      .attr('y', height - 10)
      .attr('fill', xAxisTitleColor)
      .text(xAxisTitle);

    // Add y-axis title with its own color
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

  onMount(() => {
    if (coordinates && coordinates.length > 0) {
      updateChart();
    }
  });

  // Update chart when data, dimensions, or chartType changes
  $: if (svgElement && coordinates && coordinates.length > 0) {
    updateChart();
  }
</script>

<svg bind:this={svgElement}></svg>
