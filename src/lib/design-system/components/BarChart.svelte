<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  // Props for the component
  export let dataArr = []; // This will now accept objects with month and degrees/strengthScale
  export let width = 600;
  export let height = 200;
  export let marginTop = 20;
  export let marginRight = 30;
  export let marginBottom = 40;
  export let marginLeft = 50;
  export let xLabel = 'Months';
  export let yLabel = 'Value';
  export let title = '';
  export let barColor = 'var(--text-primary)';
  export let axisColor = 'var(--text-primary)';
  export let axisWidth = 2;
  export let tickSize = 0;
  export let tickWidth = 1;
  export let type = 'rom'; // 'rom' or 'strength'
  export let axisTitleBgColor = 'var(--background)';
  export let axisTitlePadding = 5;

  // Color mapping for different values
  export let colorMap = {
    rom: 'var(--color-blue-525)',
    strength: 'var(--color-blue-525)'
  };

  let svgElement;

  // Add reactivity statement to rebuild chart when dataArr changes
  $: if (svgElement && dataArr && dataArr.length > 0) {
    updateChart();
  }

  function getYValue(d) {
    if (type === 'rom') {
      return d.degrees;
    } else {
      return d.strengthScale;
    }
  }

  function updateChart() {
    // Clear previous chart if it exists
    if (svgElement) {
      d3.select(svgElement).selectAll('*').remove();
    }

    if (!dataArr || dataArr.length === 0) return;

    // Create the SVG container
    const svg = d3
      .select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Set up the months as our x-axis labels
    const months = dataArr.map((d) => `${d.month}`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(months)
      .range([marginLeft, width - marginRight])
      .padding(0.3);

    // Use different y scales based on the type
    let yScale;
    if (type === 'rom') {
      yScale = d3
        .scaleLinear()
        .domain([0, 100]) // ROM is always 0-100
        .range([height - marginBottom, marginTop]);
    } else {
      yScale = d3
        .scaleLinear()
        .domain([0, 5]) // Strength is always 0-5
        .range([height - marginBottom, marginTop]);
    }

    // Create and add the bars
    svg
      .append('g')
      .selectAll('rect')
      .data(dataArr)
      .join('rect')
      .attr('x', (d) => xScale(`${d.month}`))
      .attr('y', (d) => yScale(getYValue(d)))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => {
        const value = getYValue(d);
        return height - marginBottom - yScale(value);
      })
      .attr('fill', colorMap[type] || barColor);

    // Create axis generators
    const xAxis = d3.axisBottom(xScale).tickSize(tickSize).tickPadding(15);

    // Y-axis ticks depend on the chart type
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(d3.format('d'))
      .ticks(type === 'rom' ? 5 : 5) // 5 ticks for both types
      .tickSize(tickSize)
      .tickPadding(15);

    // Add the x-axis
    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(xAxis);

    // Style the x-axis
    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', axisWidth);

    xAxisGroup.selectAll('.tick line').attr('stroke', axisColor).attr('stroke-width', tickWidth);

    xAxisGroup
      .selectAll('.tick text')
      .attr('fill', axisColor)
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle');

    // Add the y-axis
    const yAxisGroup = svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(yAxis);

    // Style the y-axis
    yAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', axisWidth);

    yAxisGroup.selectAll('.tick line').attr('stroke', axisColor).attr('stroke-width', tickWidth);

    yAxisGroup.selectAll('.tick text').attr('fill', axisColor).attr('font-size', '12px');

    // Add x-axis label with background
    const xAxisCenter = marginLeft + (width - marginLeft - marginRight) / 2;

    // First add background for x-axis label
    const xLabelBg = xAxisGroup
      .append('rect')
      .attr('fill', axisTitleBgColor)
      .attr('rx', 3)
      .attr('ry', 3);

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
    const yAxisCenter = marginTop + (height - marginTop - marginBottom) / 2;

    // First create a group for the y-axis label
    const yLabelGroup = yAxisGroup.append('g').attr('transform', `translate(-35, ${yAxisCenter})`);

    // First add background for y-axis label
    const yLabelBg = yLabelGroup
      .append('rect')
      .attr('fill', axisTitleBgColor)
      .attr('rx', 3)
      .attr('ry', 3);

    // Add the y-axis label text
    const yLabelText = yLabelGroup
      .append('text')
      .attr('transform', 'rotate(-90)') // Rotate text to be vertical
      .attr('x', 0)
      .attr('y', 38)
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
      .attr('height', yTextBox.height + axisTitlePadding * 2);
  }

  onMount(() => {
    if (dataArr && dataArr.length > 0) {
      updateChart();
    }
  });
</script>

<svg bind:this={svgElement}></svg>
