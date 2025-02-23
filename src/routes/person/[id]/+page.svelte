<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/helpers/firebase';
    import { getUser, assignProgram, type User, type AssignedExercise } from '$firebase/userService';
    import { getAllExercisesFromLibrary, type Exercise, isDistanceExercise, isWeightExercise, isTimeExercise } from '$firebase/exerciseService';

    let patient: User | null = null;
    let availableExercises: Exercise[] = [];
    let loading = true;
    let error: string | null = null;
    
    // Program creation state
    let selectedExercises: AssignedExercise[] = [];
    let estimatedTime = 30; // default 30 minutes
    let selectedExercise: Exercise | null = null;
    let exerciseValues = {
        sets: 3,
        reps: 10,
        steps: 10,
        seconds: 10,
        weight: 0
    };
    let isAssigning = false;

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (!authUser) {
                goto('/login');
                return;
            }

            try {
                const patientId = $page.params.id;
                console.log("Loading patient details for:", patientId);
                
                const patientData = await getUser(patientId);
                if (patientData) {
                    patient = patientData;
                } else {
                    error = "Patient not found";
                }
                
                // Load exercise library
                availableExercises = await getAllExercisesFromLibrary();
                
            } catch (err) {
                console.error('Error fetching data:', err);
                error = "Error loading data";
            } finally {
                loading = false;
            }
        });

        return unsubscribe;
    });

    function handleAddExercise() {
        if (!selectedExercise) return;

        const baseExercise = {
            exerciseId: selectedExercise.exerciseId,
            exerciseName: selectedExercise.exerciseName,
            exerciseType: selectedExercise.exerciseType,
            equipment: selectedExercise.equipment,
            order: selectedExercises.length,
            completed: false
        };

        let exerciseToAdd: AssignedExercise;

        if (isDistanceExercise(selectedExercise)) {
            exerciseToAdd = {
                ...baseExercise,
                sets: exerciseValues.sets,
                steps: exerciseValues.steps
            };
        } else if (isWeightExercise(selectedExercise)) {
            exerciseToAdd = {
                ...baseExercise,
                sets: exerciseValues.sets,
                reps: exerciseValues.reps,
                weight: exerciseValues.weight
            };
        } else {
            exerciseToAdd = {
                ...baseExercise,
                sets: 1,
                reps: exerciseValues.reps,
                seconds: exerciseValues.seconds
            };
        }

        selectedExercises = [...selectedExercises, exerciseToAdd];
    }

    function handleRemoveExercise(index: number) {
        selectedExercises = selectedExercises.filter((_, i) => i !== index);
        // Recalculate order
        selectedExercises = selectedExercises.map((ex, i) => ({
            ...ex,
            order: i
        }));
    }

    async function handleAssignProgram() {
        if (!patient || selectedExercises.length === 0) return;
        
        try {
            isAssigning = true;
            await assignProgram(patient.userId, selectedExercises, estimatedTime);
            
            // Refresh patient data to show new program
            const updatedPatient = await getUser(patient.userId);
            if (updatedPatient) {
                patient = updatedPatient;
            }
            
            // Clear selection
            selectedExercises = [];
            estimatedTime = 30;
            
        } catch (err) {
            console.error('Error assigning program:', err);
            error = "Failed to assign program";
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

{#if loading}
    <div class="loading-container">
        <p>Loading patient data...</p>
    </div>
{:else if error}
    <div class="error-container">
        <p class="error">{error}</p>
        <button on:click={goBack} class="back-button">Back to Dashboard</button>
    </div>
{:else if patient}
    <div class="patient-container">
        <button on:click={goBack} class="back-button">Back to Dashboard</button>

        <h1 class="page-title">Patient Details</h1>

        <div class="details-container">
            <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Start Date:</strong> {formatDate(patient.createdAt)}</p>
            
            <!-- Current Program Section -->
            {#if patient.currentProgram}
                <div class="current-program">
                    <h2>Current Program</h2>
                    <p>Estimated time: {patient.currentProgram.estimatedTime} minutes</p>
                    <div class="equipment-list">
                        <strong>Equipment needed:</strong>
                        {#each [...new Set(patient.currentProgram.exercises.filter(ex => ex.equipment).map(ex => ex.equipment))] as equipment}
                            <span class="equipment-tag">{equipment}</span>
                        {/each}
                    </div>
                    
                    <table class="exercise-table">
                        <thead>
                            <tr>
                                <th>Exercise</th>
                                <th>Details</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each patient.currentProgram.exercises as exercise}
                                <tr>
                                    <td>{exercise.exerciseName}</td>
                                    <td>
                                        {#if exercise.exerciseType === 'distance'}
                                            {exercise.sets} sets of {exercise.steps} steps
                                        {:else if exercise.exerciseType === 'weight'}
                                            {exercise.sets} sets of {exercise.reps} reps at {exercise.weight}lbs
                                        {:else}
                                            {exercise.reps} times, {exercise.seconds} seconds each
                                        {/if}
                                    </td>
                                    <td>
                                        {#if exercise.completed}
                                            <span class="status-completed">✓ Completed</span>
                                        {:else if exercise.skipped}
                                            <span class="status-skipped">Skipped</span>
                                        {:else}
                                            <span class="status-pending">Pending</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}

            <!-- Program Creation Section -->
            <div class="program-creation">
                <h2>Create New Program</h2>
                
                <div class="time-input">
                    <label>
                        Estimated Program Time (minutes):
                        <input 
                            type="number" 
                            bind:value={estimatedTime}
                            min="1"
                        />
                    </label>
                </div>

                <div class="exercise-selection">
                    <select bind:value={selectedExercise}>
                        <option value={null}>Select an exercise to add</option>
                        {#each availableExercises as exercise}
                            <option value={exercise}>{exercise.exerciseName}</option>
                        {/each}
                    </select>

                    {#if selectedExercise}
                        <div class="exercise-values">
                            {#if isDistanceExercise(selectedExercise)}
                                <label>
                                    Sets:
                                    <input type="number" bind:value={exerciseValues.sets} min="1" />
                                </label>
                                <label>
                                    Steps per set:
                                    <input type="number" bind:value={exerciseValues.steps} min="1" />
                                </label>
                            {:else if isWeightExercise(selectedExercise)}
                                <label>
                                    Sets:
                                    <input type="number" bind:value={exerciseValues.sets} min="1" />
                                </label>
                                <label>
                                    Reps per set:
                                    <input type="number" bind:value={exerciseValues.reps} min="1" />
                                </label>
                                <label>
                                    Weight (lbs):
                                    <input type="number" bind:value={exerciseValues.weight} min="0" step="5" />
                                </label>
                            {:else}
                                <label>
                                    Times to perform:
                                    <input type="number" bind:value={exerciseValues.reps} min="1" />
                                </label>
                                <label>
                                    Seconds to hold:
                                    <input type="number" bind:value={exerciseValues.seconds} min="1" />
                                </label>
                            {/if}

                            <button 
                                class="add-exercise-btn"
                                on:click={handleAddExercise}
                            >
                                Add to Program
                            </button>
                        </div>
                    {/if}
                </div>

                {#if selectedExercises.length > 0}
                    <div class="selected-exercises">
                        <h3>Selected Exercises</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Exercise</th>
                                    <th>Details</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each selectedExercises as exercise, i}
                                    <tr>
                                        <td>{exercise.exerciseName}</td>
                                        <td>
                                            {#if exercise.exerciseType === 'distance'}
                                                {exercise.sets} sets of {exercise.steps} steps
                                            {:else if exercise.exerciseType === 'weight'}
                                                {exercise.sets} sets of {exercise.reps} reps at {exercise.weight}lbs
                                            {:else}
                                                {exercise.reps} times, {exercise.seconds} seconds each
                                            {/if}
                                        </td>
                                        <td>
                                            <button 
                                                class="remove-btn"
                                                on:click={() => handleRemoveExercise(i)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>

                        <button 
                            class="assign-program-btn"
                            on:click={handleAssignProgram}
                            disabled={isAssigning}
                        >
                            {isAssigning ? 'Assigning Program...' : 'Assign Program'}
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{:else}
    <div class="error-container">
        <p>Patient not found</p>
        <button on:click={goBack} class="back-button">Back to Dashboard</button>
    </div>
{/if}

<style>
    /* ... Keeping existing styles ... */
    
    .current-program {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
    }

    .program-creation {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
    }

    .equipment-tag {
        background-color: #f3f4f6;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        margin-right: 0.5rem;
    }

    .time-input {
        margin-bottom: 1rem;
    }

    .exercise-selection {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .exercise-values {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        padding: 1rem;
        background-color: #f9fafb;
        border-radius: 0.5rem;
    }

    .add-exercise-btn {
        grid-column: 1 / -1;
        padding: 0.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .selected-exercises {
        margin-top: 1.5rem;
    }

    .assign-program-btn {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background-color: #059669;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        width: 100%;
    }

    .assign-program-btn:disabled {
        background-color: #d1d5db;
        cursor: not-allowed;
    }

    .status-completed {
        color: #059669;
    }

    .status-pending {
        color: #d97706;
    }

    .status-skipped {
        color: #dc2626;
    }
</style>