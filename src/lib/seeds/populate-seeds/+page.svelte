<!-- <script lang="ts">
    import { seedExercises } from '$lib/seeds/exerciseSeeder';
    let seeding = false;
    let result = '';
    
    async function handleSeed() {
        seeding = true;
        try {
            console.log("Starting seeding process...");
            await seedExercises();
            console.log("Seeding completed!");
            result = 'Successfully seeded exercises!';
        } catch (error) {
            console.error("Detailed seeding error:", error);
            result = 'Error seeding exercises: ' + error;
        } finally {
            seeding = false;
        }
    }
</script>

<div>
    <h1>Seed Exercise Library</h1>
    <button on:click={handleSeed} disabled={seeding}>
        {seeding ? 'Seeding...' : 'Seed Exercises'}
    </button>
    {#if result}
        <p>{result}</p>
    {/if}
</div> -->