<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  // Props for the component
  export let dataArr: number[] = []; // Add default empty array

  console.log('DATA ARR');
  console.log(dataArr);

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

  // Add mood labels for text-based y-axis
  export let moodLabels = {
    1: 'Discouraged',
    2: 'Uncertain',
    3: 'Indifferent',
    4: 'Hopeful',
    5: 'Motivated'
  };

  // Add mood colors if needed
  export let moodColorMap = {
    1: 'var(--color-orange-550)',
    2: 'var(--color-blue-700)',
    3: 'var(--color-purple-550)',
    4: 'var(--color-blue-525)',
    5: 'var(--color-green-550)'
  };

  let xLimit = 7;
  let xSteps = 1;
  let yLimit = 10;
  let ySteps = 2;

  $: if (svgElement && dataArr && dataArr.length > 0) {
    updateChart();
  }

  // Add this reactive statement to update limits when timeframe changes
  // Update the reactive statement for consistent xLimits
  $: {
    // Set timeframe-specific constants
    if (timeframe === 'week') {
      xLimit = 7; // 7 days in a week
      xSteps = 1;
      xLabel = 'Days';
    } else if (timeframe === 'month') {
      xLimit = 4; // 4 weeks in a month
      xSteps = 1;
      xLabel = 'Weeks';
    } else if (timeframe === '3months') {
      xLimit = 13; // 13 weeks in 3 months
      xSteps = 1;
      xLabel = 'Weeks';
    } else if (timeframe === '6months') {
      xLimit = 26; // 26 weeks in 6 months
      xSteps = 2; // Skip every other tick for better readability
      xLabel = 'Weeks';
    } else if (timeframe === 'year') {
      xLimit = 12; // 12 months in a year
      xSteps = 1;
      xLabel = 'Months';
    } else if (timeframe === 'all') {
      xLimit = 12; // Default to 12 for all time
      xSteps = 1;
      xLabel = 'Months';
    }

    // Update the chart if it exists
    if (svgElement && dataArr && dataArr.length > 0) {
      updateChart();
    }
  }

  // Helper function to get default x-axis limits
  function getDefaultXLimit(timeframe: string): number {
    switch (timeframe) {
      case 'week':
        return 7;
      case 'month':
        return 4;
      case '3months':
        return 12;
      case '6months':
        return 6;
      case 'year':
        return 12;
      case 'all':
        return 12;
      default:
        return 7;
    }
  }

  // Props for conditional coloring - using CSS variable references
  export let colorMap = {
    1: 'var(--color-green-500)',
    2: '#70DEB0',
    3: '#73D7C3',
    4: '#76D0D6',
    5: 'var(--color-blue-525)',
    6: 'var(--color-yellow-550)',
    7: '#FED25E',
    8: '#FEB554',
    9: '#FF984B',
    10: 'var(--color-orange-550)'
  };
  export let defaultColor = 'var(--color-default)';

  let svgElement;

  // Add this function to aggregate data based on timeframe
  function aggregateDataByTimeframe(rawData: number[], timeframe: string): number[] {
    if (!rawData || rawData.length === 0) return [];

    // For 'week' timeframe, return raw data (daily measurements)
    if (timeframe === 'week') return rawData;

    // For other timeframes, aggregate based on the period
    let aggregatedData: number[] = [];

    if (timeframe === 'month') {
      // Group by week (assuming data points are daily)
      const weeksData = [];
      for (let i = 0; i < rawData.length; i += 7) {
        // Get slice of up to 7 days
        const weekSlice = rawData.slice(i, i + 7);
        // Calculate average (only including non-zero/defined values)
        const validValues = weekSlice.filter(
          (val) => val !== undefined && val !== null && val !== 0
        );
        if (validValues.length > 0) {
          const avg = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
          weeksData.push(Math.round(avg * 10) / 10); // Round to 1 decimal place
        }
      }
      aggregatedData = weeksData;
    } else if (timeframe === '3months' || timeframe === '6months') {
      // Group by week for 3-month view
      const weeksData = [];
      for (let i = 0; i < rawData.length; i += 7) {
        const weekSlice = rawData.slice(i, i + 7);
        const validValues = weekSlice.filter(
          (val) => val !== undefined && val !== null && val !== 0
        );
        if (validValues.length > 0) {
          const avg = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
          weeksData.push(Math.round(avg * 10) / 10);
        }
      }
      aggregatedData = weeksData;
    } else if (timeframe === 'year' || timeframe === 'all') {
      // Group by month (assuming ~30 days per month)
      const monthsData = [];
      for (let i = 0; i < rawData.length; i += 30) {
        const monthSlice = rawData.slice(i, i + 30);
        const validValues = monthSlice.filter(
          (val) => val !== undefined && val !== null && val !== 0
        );
        if (validValues.length > 0) {
          const avg = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
          monthsData.push(Math.round(avg * 10) / 10);
        }
      }
      aggregatedData = monthsData;
    }

    return aggregatedData;
  }

  function convertToCoordinates(): { x: number; y: number }[] {
    // First aggregate the data based on timeframe
    const aggregatedData = aggregateDataByTimeframe(dataArr, timeframe);

    if (!aggregatedData || aggregatedData.length === 0) return [];

    // Calculate spacing between points based on the number of data points
    const pointCount = aggregatedData.length;

    // Create evenly spaced points
    return aggregatedData.map((y, index) => ({
      x: index + 1, // Start from 1 for better readability
      y
    }));
  }

  function updateChart() {
    // Set y-axis limits based on chart type
    if (type === 'mood') {
      console.log('mood');
      yLimit = 5;
      ySteps = 1;

      // For mood charts, we might need more margin for text labels
      if (marginLeft < 85) marginLeft = 85; // Adjust margin for text labels
    } else if (type === 'pain') {
      console.log('pain');
      yLimit = 10;
      ySteps = 2;
    }

    // Clear previous chart
    if (svgElement) {
      d3.select(svgElement).selectAll('*').remove();
    }

    // Get aggregated data
    const aggregatedData = aggregateDataByTimeframe(dataArr, timeframe);

    // IMPORTANT FIX: Limit data points to xLimit
    const data = aggregatedData
      .map((y, index) => ({ x: index + 1, y }))
      .filter((d) => d.x <= xLimit); // This ensures we only plot points within our axis range

    console.log('Aggregated data for timeframe', timeframe, data);

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

    // Adjust x-axis ticks based on data points
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => (d === 0 ? '' : d3.format('d')(d)))
      // Always use the full xLimit range of ticks, regardless of data length
      .tickValues(d3.range(1, xLimit + 1, xSteps))
      .tickSize(tickSize)
      .tickPadding(15);

    // Create y-axis with different formatting based on chart type
    let yAxis;
    if (type === 'mood') {
      yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => {
          const value = Number(d);
          return value >= 1 && value <= 5 ? moodLabels[value] : '';
        })
        .tickValues(d3.range(1, yLimit + 1, ySteps))
        .tickSize(tickSize)
        .tickPadding(15);
    } else {
      yAxis = d3
        .axisLeft(yScale)
        .tickFormat(d3.format('d'))
        .tickValues(d3.range(0, yLimit + 1, ySteps))
        .tickSize(tickSize)
        .tickPadding(15);
    }

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

    // If it's a mood chart, give more space for text labels
    if (type === 'mood') {
      yAxisGroup.selectAll('.tick text').attr('transform', 'translate(0,0)'); // Shift labels to the left for more space
    }

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
        // Round the y value to nearest integer for color mapping
        const roundedValue = Math.round(d.y);
        // Use appropriate color map based on chart type
        if (type === 'mood') {
          return moodColorMap[roundedValue] || defaultColor;
        } else {
          return colorMap[roundedValue] || defaultColor;
        }
      });

    // Optional: Add tooltips for more information when hovering over points
    const tooltip = svg.append('g').attr('class', 'tooltip').style('display', 'none');

    tooltip
      .append('rect')
      .attr('width', 60)
      .attr('height', 20)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('rx', 3)
      .attr('ry', 3);

    tooltip
      .append('text')
      .attr('x', 30)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px');

    // Add hover events to show tooltip
    svg
      .selectAll('circle')
      .on('mouseover', function (event, d) {
        const tooltipText = type === 'mood' ? `${d.y} - ${moodLabels[Math.round(d.y)]}` : `${d.y}`;

        tooltip.select('text').text(tooltipText);
        tooltip.style('display', null);

        const [x, y] = d3.pointer(event);
        tooltip.attr('transform', `translate(${x - 30},${y - 30})`);
      })
      .on('mouseout', function () {
        tooltip.style('display', 'none');
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
