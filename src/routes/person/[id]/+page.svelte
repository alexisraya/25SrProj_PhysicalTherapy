<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/helpers/firebase';
    import { getUser, getCurrentProgram, assignProgram, type User, type Program } from '$firebase/userService';
    import { getAllExercisesFromLibrary } from '$firebase/services/exerciseService';
    import type { Exercise } from '$firebase/types/exerciseType';
    import ProgramManagement from '$lib/design-system/components/ProgramManagement.svelte';

    let patient: User | null = null;
    let currentProgram: Program | null = null;
    let availableExercises: Exercise[] = [];
    let loading = true;
    let error: string | null = null;
    let isAssigning = false;

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (!authUser) {
                goto('/login');
                return;
            }

            try {
                const patientId = $page.params.id;
                const [patientData, programData, exercises] = await Promise.all([
                    getUser(patientId),
                    getCurrentProgram(patientId),
                    getAllExercisesFromLibrary()
                ]);

                if (patientData) {
                    patient = patientData;
                    currentProgram = programData;
                    availableExercises = exercises;
                } else {
                    error = "Patient not found";
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                error = "Error loading data";
            } finally {
                loading = false;
            }
        });

        return unsubscribe;
    });

    async function handleProgramUpdate(program: Program) {
        if (!patient) return;
        
        try {
            isAssigning = true;
            await assignProgram(
                patient.userId,
                program.exercises,
                program.estimatedTime
            );
            
            // Refresh program data
            currentProgram = await getCurrentProgram(patient.userId);
        } catch (err) {
            console.error('Error updating program:', err);
            error = "Failed to update program";
        } finally {
            isAssigning = false;
        }
    }

    function goBack() {
        goto('/therapist-dashboard');
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }
</script>

<div class="patient-container">
    <button on:click={goBack} class="back-button">Back to Dashboard</button>

    <h1 class="page-title">Patient Details</h1>

    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else if patient}
        <div class="details-section">
            <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Start Date:</strong> {formatDate(patient.createdAt)}</p>

            <ProgramManagement
                {currentProgram}
                {availableExercises}
                onUpdateProgram={handleProgramUpdate}
                isLoading={isAssigning}
            />
        </div>
    {:else}
        <p>No patient data found</p>
    {/if}
</div>

<style>
    .patient-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    .back-button {
        margin-bottom: 1rem;
        padding: 0.5rem 1rem;
        background-color: #e5e7eb;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .page-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .details-section {
        margin-bottom: 2rem;
    }

    .error {
        color: #ef4444;
    }
</style>