<script>
  export let name;
  export let size = 'medium'; // Default size

  // Construct the SVG path
  const iconPath = `/icons/${name}-${size}.svg`;
</script>

<img src={iconPath} alt={name} class="icon" style="overflow: visible;" />
