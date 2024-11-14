<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { auth, db } from '$lib/helpers/firebase';
    import { doc, getDoc } from 'firebase/firestore';

    let user = null;
    let userData = null;
    let patients = null; // initialize as null to track loading state

    // Use a reactive statement to handle patients data
    $: if (patients) {
        // Now you can safely use patients here
        patient = patients.find(p => p.id === $page.params.id);
    }

    let patient;

    onMount(async () => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                user = authUser;
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        userData = userDoc.data();
                        patients = userData.patients;
                    } else {
                        console.log('No user document found');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                goto('/login');
            }
        });

        // Cleanup subscription on component destruction
        return () => unsubscribe();
    });

    function goBack() {
      goto('/therapist-dashboard');
    }
</script>
  
{#if patient}
<div class="patient-container">
    <button 
        on:click={goBack}
        class="back-button"
    >
        Back to Table
    </button>

    <h1 class="page-title">Patient Details</h1>
    
    <div class="details-container">
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Injury:</strong> {patient.injury}</p>
        <p><strong>Start Date:</strong> {patient.therapy_start_date.toDate().toDateString()}</p>
        <p><strong>Exercises:</strong></p>
        <ul>
            {#each patient.exercises as exercise}
                <li>{exercise.title}, {exercise.reps}</li>
            {/each}
        </ul>
    </div>
</div>
{:else}
<p>patient not found</p>
{/if}

<style>
    .patient-container {
        padding: 1rem;
    }

    .back-button {
        margin-bottom: 1rem;
        padding: 0.5rem 1rem;
        background-color: #e5e7eb;
        border-radius: 0.25rem;
        border: none;
        cursor: pointer;
    }

    .back-button:hover {
        background-color: #d1d5db;
    }

    .page-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
    }

    .details-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .details-container p {
        margin: 0;
    }

    ul {
        margin: 0;
        padding-left: 1.5rem;
    }

    li {
        margin: 0.25rem 0;
    }
</style>