<!-- THIS PAGE IS JUST TO HELP POPULATE DOCUMENTS IN THE DATABASE ONCE, BUT KEEPING THIS IN CASE CONTENTS GET LOST AND REPOPULATING IS NEEDED -->

<script lang="ts">
    import { seedGoals } from '$lib/seeds/goalSeeder';
    import { seedExercises } from '$lib/seeds/exerciseSeeder';

    let seedingGoals = false;
    let seedingExercises = false;
    let goalResult = '';
    let exerciseResult = '';

    async function handleSeedGoals() {
        seedingGoals = true;
        goalResult = '';
        try {
            console.log("Starting goal seeding process...");
            await seedGoals();
            console.log("Goal seeding completed!");
            goalResult = 'Successfully seeded goals!';
        } catch (error) {
            console.error("Detailed seeding error:", error);
            goalResult = 'Error seeding goals: ' + error.message;
        } finally {
            seedingGoals = false;
        }
    }

    async function handleSeedExercises() {
        seedingExercises = true;
        exerciseResult = '';
        try {
            console.log("Starting exercise seeding process...");
            await seedExercises();
            console.log("Exercise seeding completed!");
            exerciseResult = 'Successfully seeded exercises!';
        } catch (error) {
            console.error("Detailed seeding error:", error);
            exerciseResult = 'Error seeding exercises: ' + error.message;
        } finally {
            seedingExercises = false;
        }
    }
</script>

<div>
    <h1>Seed Library</h1>
    
    <h2>Seed Goal Library</h2>
    <button on:click={handleSeedGoals} disabled={seedingGoals}>
        {seedingGoals ? 'Seeding...' : 'Seed Goals'}
    </button>
    {#if goalResult}
        <p>{goalResult}</p>
    {/if}

    <h2>Seed Exercise Library</h2>
    <button on:click={handleSeedExercises} disabled={seedingExercises}>
        {seedingExercises ? 'Seeding...' : 'Seed Exercises'}
    </button>
    {#if exerciseResult}
        <p>{exerciseResult}</p>
    {/if}
</div>