<script lang="ts">
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/helpers/firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import { goto } from '$app/navigation';
    import ExerciseItem from '$lib/ExerciseItem.svelte';

    let user = null;
    let userData = null;

    onMount(async () => {
        auth.onAuthStateChanged(async (authUser) => {
        if (authUser) {
            user = authUser;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                userData = userDoc.data();
                if (userData.isTherapist) {
                    goto('/therapist-dashboard');
                }
                console.log(userData.exercises);
            }
        } else {
            goto('/login');
        }
        });
    });
</script>
<a href="/logout">Log Out</a>
<h1>Patient Dashboard</h1>
{#if user && userData}
<h1>Welcome, {userData.displayName}!</h1>
{#if userData.injury}
<p>Injury: {userData.injury}</p>
{/if}
{#if userData.exercises}
<p>Exercises:</p>
<div class="exercise-container">
    {#each userData.exercises as exercise}
        <ExerciseItem title={exercise.title} reps={exercise.reps} description={exercise.description}/>
    {/each}
</div>
{/if}
{:else}
<p>Loading...</p>
{/if}

<style>
    .exercise-container {
        width: fit-content;
        display: flex;
        column-gap: 45px;
    }
</style>