<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  // Props for the component
  export let dataArr: number[] = []; // Add default empty array

  console.log('DATA ARR');
  console.log(dataArr);

  // Add reactivity statement to rebuild chart when dataArr changes
  $: if (svgElement && dataArr && dataArr.length > 0) {
    updateChart();
  }

  export let timeframe = 'week'; // 'week', '1month', '3months', '6months', 'all time'
  export let type = 'pain'; // 'pain', 'mood';
  export let width = 600;
  export let height = 400;
  export let marginTop = 20;
  export let marginRight = 30;
  export let marginBottom = 40;
  export let marginLeft = 50;
  export let xLabel = 'Days';
  export let yLabel = 'Rating';
  export let pointRadius = 7;
  export let title = '';
  export let lineColor = 'var(--text-primary)';
  export let lineWidth = 2;
  export let lineStyle = 'solid'; // 'solid', 'dashed', 'dotted'

  export let axisColor = 'var(--text-primary)';
  export let axisWidth = 2; // Width/thickness of the axis lines
  export let tickSize = 0; // Size of the tick marks
  export let tickWidth = 1; // Width/thickness of the tick marks

  // New props for axis title backgrounds
  export let axisTitleBgColor = 'var(--background)'; // Background color for axis titles
  export let axisTitlePadding = 5; // Padding around axis titles in pixels

  let xLimit = 7;
  let xSteps = 1;
  let yLimit = 10;
  let ySteps = 2;

  if (timeframe == '1month') {
    xLimit = 4;
    xLabel = 'Weeks';
  } else if (timeframe == '3months') {
    xLimit = 12;
    xLabel = 'Weeks';
  } else if (timeframe == '6months') {
    xLimit = 6;
    xLabel = 'Months';
  } else if (timeframe == 'all time') {
    xLimit = 12; // change later
    xLabel = 'Months';
  }

  if (type == 'mood') {
    yLimit = 5;
    ySteps = 1;
  }

  // Props for conditional coloring - using CSS variable references
  export let colorMap = {
    1: 'var(--color-blue-525)',
    2: 'var(--color-blue-525)',
    3: 'var(--color-blue-525)',
    4: 'var(--color-blue-525)',
    5: 'var(--color-yellow-550)',
    6: 'var(--color-yellow-550)',
    7: 'var(--color-yellow-550)',
    8: 'var(--color-orange-550)',
    9: 'var(--color-orange-550)',
    10: 'var(--color-orange-550)'
  };
  export let defaultColor = 'var(--color-default)';

  let svgElement;

  function convertToCoordinates(): { x: number; y: number }[] {
    if (!dataArr || !dataArr.length) return [];

    return dataArr.map((y, index) => ({
      x: index + 1,
      y
    }));
  }

  function updateChart() {
    // Clear previous chart if it exists
    if (svgElement) {
      d3.select(svgElement).selectAll('*').remove();
    }

    const data = convertToCoordinates();
    console.log('DATA in updateChart');
    console.log(data);

    if (!data || data.length === 0) return;

    // Create the SVG container
    const svg = d3
      .select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Compute values for x and y scales
    const X = data.map((d) => d.x);
    const Y = data.map((d) => d.y);

    // Find max values for x and y (needed for domain)
    const maxX = Math.max(...X);
    const maxY = Math.max(...Y);

    // Create scales that start at 0 and go to max+1 for padding
    const xScale = d3
      .scaleLinear()
      .domain([0, xLimit]) // Use xLimit for the domain
      .range([marginLeft, width - marginRight]);

    const yScale = d3
      .scaleLinear()
      .domain([0, yLimit]) // Use yLimit for the domain
      .range([height - marginBottom, marginTop]);

    // Create line generator
    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    // Draw the line connecting the points (before the points so points appear on top)
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr(
        'stroke-dasharray',
        lineStyle === 'dashed' ? '5,5' : lineStyle === 'dotted' ? '2,2' : 'none'
      )
      .attr('d', line);

    // Create axis generators with custom tick size
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => (d === 0 ? '' : d3.format('d')(d)))
      .tickValues(d3.range(0, xLimit + 1, xSteps))
      .tickSize(tickSize)
      .tickPadding(15);

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(d3.format('d'))
      .tickValues(d3.range(0, yLimit + 1, ySteps))
      .tickSize(tickSize)
      .tickPadding(15);

    // Add the x-axis with custom styling
    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(xAxis);

    // Style the x-axis
    xAxisGroup
      .select('.domain') // The axis line
      .attr('stroke', axisColor)
      .attr('stroke-width', axisWidth);

    xAxisGroup
      .selectAll('.tick line') // The tick marks
      .attr('stroke', axisColor)
      .attr('stroke-width', tickWidth);

    xAxisGroup
      .selectAll('.tick text') // The tick labels
      .attr('fill', axisColor)
      .attr('font-size', '12px');

    // Add the y-axis with custom styling
    const yAxisGroup = svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(yAxis);

    // Style the y-axis
    yAxisGroup
      .select('.domain') // The axis line
      .attr('stroke', axisColor)
      .attr('stroke-width', axisWidth);

    yAxisGroup
      .selectAll('.tick line') // The tick marks
      .attr('stroke', axisColor)
      .attr('stroke-width', tickWidth);

    yAxisGroup
      .selectAll('.tick text') // The tick labels
      .attr('fill', axisColor)
      .attr('font-size', '12px');

    // Add x-axis label with background
    // We calculate the center point of the x-axis
    const xAxisCenter = marginLeft + (width - marginLeft - marginRight) / 2;

    // First add background for x-axis label
    const xLabelBg = xAxisGroup
      .append('rect')
      .attr('fill', axisTitleBgColor)
      .attr('rx', 3) // rounded corners
      .attr('ry', 3); // rounded corners

    // Add the x-axis label text
    const xLabelText = xAxisGroup
      .append('text')
      .attr('x', xAxisCenter) // Set x position to center of axis
      .attr('y', 0) // Position relative to axis
      .attr('dy', '0.35em') // Fine-tune vertical position
      .attr('fill', axisColor)
      .attr('text-anchor', 'middle') // Center the text horizontally
      .style('font-size', '12px')
      .text(xLabel);

    // Measure the text and position the background appropriately
    const xTextBox = xLabelText.node().getBBox();
    xLabelBg
      .attr('x', xTextBox.x - axisTitlePadding)
      .attr('y', xTextBox.y - axisTitlePadding)
      .attr('width', xTextBox.width + axisTitlePadding * 2)
      .attr('height', xTextBox.height + axisTitlePadding * 2);

    // Add y-axis label with background
    // Calculate the center point of the y-axis
    const yAxisCenter = marginTop + (height - marginTop - marginBottom) / 2;

    // First create a group for the y-axis label (this helps with the rotation)
    const yLabelGroup = yAxisGroup.append('g').attr('transform', `translate(3, ${yAxisCenter})`); // Move label group left of axis

    // First add background for y-axis label
    const yLabelBg = yLabelGroup
      .append('rect')
      .attr('fill', axisTitleBgColor)
      .attr('rx', 3) // rounded corners
      .attr('ry', 3); // rounded corners

    // Add the y-axis label text
    const yLabelText = yLabelGroup
      .append('text')
      .attr('transform', 'rotate(-90)') // Rotate text to be vertical
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', axisColor)
      .attr('text-anchor', 'middle') // Center the text horizontally
      .style('font-size', '12px')
      .text(yLabel);

    // Measure the text and position the background appropriately
    // We need to be more careful with rotated text measurements
    const yTextBox = yLabelText.node().getBBox();
    yLabelBg
      .attr('transform', 'rotate(-90)')
      .attr('x', yTextBox.x - axisTitlePadding)
      .attr('y', yTextBox.y - axisTitlePadding)
      .attr('width', yTextBox.width + axisTitlePadding * 2)
      .attr('height', yTextBox.height + axisTitlePadding * 2);
    yLabelGroup
      .insert('rect', 'text') // Insert before text so it's underneath
      .attr('transform', 'rotate(-90)')
      .attr('fill', axisTitleBgColor)
      .attr('x', yTextBox.x - axisTitlePadding)
      .attr('y', yTextBox.y - axisTitlePadding)
      .attr('width', yTextBox.width + axisTitlePadding * 2)
      .attr('height', yTextBox.height + axisTitlePadding * 2)
      .attr('rx', 3) // rounded corners
      .attr('ry', 3); // rounded corners

    // Add the scatter plot points with conditional coloring
    svg
      .append('g')
      .attr('stroke', 'var(--color-blue-1100)')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', pointRadius)
      .attr('fill', (d) => {
        // Use color from colorMap if y value exists there, otherwise use defaultColor
        return colorMap[d.y] || defaultColor;
      });
  }

  onMount(() => {
    // Only attempt to draw the chart if we have data
    if (dataArr && dataArr.length > 0) {
      updateChart();
    }
  });
</script>

<svg bind:this={svgElement}></svg>
