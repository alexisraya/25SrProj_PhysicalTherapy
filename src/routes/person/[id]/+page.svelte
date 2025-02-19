<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { auth, db } from '$lib/helpers/firebase';
    import { doc, getDoc } from 'firebase/firestore';

    let therapist = null;
    let patient = null;
    let patientId = $page.params.id;

    onMount(async () => {
        auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                // Ensure the therapist is authenticated
                const therapistDoc = await getDoc(doc(db, 'therapists', authUser.uid));
                if (therapistDoc.exists()) {
                    therapist = therapistDoc.data();
                    
                    // Retrieve the selected patient's details
                    const patientDoc = await getDoc(doc(db, 'users', patientId));
                    if (patientDoc.exists()) {
                        patient = patientDoc.data();
                    } else {
                        console.warn("Patient not found.");
                    }
                } else {
                    console.warn("Access denied. Redirecting...");
                    goto('/login');
                }
            } else {
                goto('/login');
            }
        });
    });

    function goBack() {
        goto('/therapist-dashboard');
    }
</script>

{#if patient}
<div class="patient-container">
    <button on:click={goBack} class="back-button">Back to Dashboard</button>

    <h1 class="page-title">Patient Details</h1>

    <div class="details-container">
        <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
        <p><strong>Injury:</strong> {patient.injury || "N/A"}</p>
        <p><strong>Start Date:</strong> {patient.startDate || "N/A"}</p>
        <p><strong>Exercises Assigned:</strong></p>
        <ul>
            {#each patient.exercises as exercise}
                <li>{exercise.exerciseName} - {exercise.reps} reps</li>
            {/each}
        </ul>
    </div>
</div>
{:else}
<p>Loading patient data...</p>
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
</style>