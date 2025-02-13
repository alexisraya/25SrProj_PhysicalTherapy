<script>
    import icons from "$lib/icons.json";
</script>
  
<div class="container">
    <h1>Icon Showcase</h1>
    <div class="icons-grid">
        {#each icons as icon}
            <div class="icon-wrapper">
                <img src={`/icons/${icon}-small.svg`} alt={`${icon}`} />
                <p>{icon}</p>
            </div>
        {/each}
    </div>
</div>

<style>
.container{
    margin: 20px;
}
.icons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
}

.icon-wrapper {
    text-align: center;
}

img {
    width: 48px;
    height: auto;
}
</style>
  