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
    
    // Exercise selection state
    let selectedExercise: Exercise | null = null;
    let exerciseValues = {
        sets: 3,
        reps: 10,
        steps: 10,
        seconds: 10,
        weight: 0
    };

    // Program state
    let newExercises: AssignedExercise[] = [];
    let estimatedTime = 30;
    let isAssigning = false;

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (!authUser) {
                goto('/login');
                return;
            }

            try {
                const patientId = $page.params.id;
                const patientData = await getUser(patientId);
                if (patientData) {
                    patient = patientData;
                    // If patient has existing exercises, initialize new exercises with them
                    if (patient.assignedExercises?.length > 0) {
                        newExercises = [...patient.assignedExercises];
                        estimatedTime = patient.estimatedTime || 30;
                    }
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
            order: newExercises.length,
            completed: false,
            skipped: false
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

        newExercises = [...newExercises, exerciseToAdd];
        // Reset selection
        selectedExercise = null;
    }

    function handleRemoveExercise(index: number) {
        newExercises = newExercises.filter((_, i) => i !== index);
        // Recalculate order
        newExercises = newExercises.map((ex, i) => ({
            ...ex,
            order: i
        }));
    }

    async function handleAssignProgram() {
    if (!patient || !newExercises || newExercises.length === 0 || estimatedTime === undefined) {
        console.error("Error: Invalid program assignment", { patient, newExercises, estimatedTime });
        error = "Cannot assign an empty program.";
        return;
    }
    
    try {
        isAssigning = true;
        console.log("Attempting to assign program with values:");
        console.log("User ID:", patient?.userId);
        console.log("New Exercises:", newExercises);
        console.log("Estimated Time:", estimatedTime);
        console.log("New Exercises Length:", newExercises?.length);
        console.log("First Exercise (if exists):", newExercises?.[0]);


        await assignProgram(patient.userId, newExercises, estimatedTime);

        const updatedPatient = await getUser(patient.userId);
        if (updatedPatient) {
            patient = updatedPatient;
        }
        
        selectedExercise = null;
        
    } catch (err) {
        console.error('Error assigning program:', err);
        error = "Failed to assign program";
    } finally {
        isAssigning = false;
    }
}

    function moveExercise(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index > 0) {
            // Swap with previous exercise
            [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
            // Update order values
            newExercises = newExercises.map((ex, i) => ({ ...ex, order: i }));
        } else if (direction === 'down' && index < newExercises.length - 1) {
            // Swap with next exercise
            [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
            // Update order values
            newExercises = newExercises.map((ex, i) => ({ ...ex, order: i }));
        }
    }

    function goBack() {
        goto('/therapist-dashboard');
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }

    function getExerciseDetails(exercise: AssignedExercise): string {
        if (exercise.exerciseType === 'distance') {
            return `${exercise.sets} sets of ${exercise.steps} steps`;
        } else if (exercise.exerciseType === 'weight') {
            return `${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight}lbs`;
        } else {
            return `${exercise.reps} times, ${exercise.seconds} seconds each`;
        }
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

            <!-- Program Management Section -->
            <div class="program-section">
                <h2>Exercise Program</h2>
                
                <!-- Time estimation -->
                <div class="time-input">
                    <label>
                        Program Time (minutes):
                        <input 
                            type="number" 
                            bind:value={estimatedTime}
                            min="1"
                            max="120"
                        />
                    </label>
                </div>

                <!-- Exercise selection -->
                <div class="exercise-selection">
                    <select 
                        bind:value={selectedExercise}
                        class="exercise-select"
                    >
                        <option value={null}>Select an exercise to add</option>
                        {#each availableExercises as exercise}
                            <option value={exercise}>{exercise.exerciseName}</option>
                        {/each}
                    </select>

                    {#if selectedExercise}
                        <div class="exercise-values">
                            {#if isDistanceExercise(selectedExercise)}
                                <div class="value-group">
                                    <label>
                                        Sets:
                                        <input type="number" bind:value={exerciseValues.sets} min="1" />
                                    </label>
                                    <label>
                                        Steps per set:
                                        <input type="number" bind:value={exerciseValues.steps} min="1" />
                                    </label>
                                </div>
                            {:else if isWeightExercise(selectedExercise)}
                                <div class="value-group">
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
                                </div>
                            {:else}
                                <div class="value-group">
                                    <label>
                                        Times to perform:
                                        <input type="number" bind:value={exerciseValues.reps} min="1" />
                                    </label>
                                    <label>
                                        Seconds to hold:
                                        <input type="number" bind:value={exerciseValues.seconds} min="1" />
                                    </label>
                                </div>
                            {/if}

                            <button 
                                class="add-btn"
                                on:click={handleAddExercise}
                            >
                                Add Exercise
                            </button>
                        </div>
                    {/if}
                </div>

                <!-- Exercise list -->
                {#if newExercises.length > 0}
                    <div class="exercise-list">
                        <h3>Current Exercises</h3>
                        {#each newExercises as exercise, i}
                            <div class="exercise-item">
                                <div class="exercise-info">
                                    <h4>{exercise.exerciseName}</h4>
                                    <p>{getExerciseDetails(exercise)}</p>
                                    {#if exercise.equipment}
                                        <small>Equipment: {exercise.equipment}</small>
                                    {/if}
                                </div>
                                <div class="exercise-controls">
                                    <button 
                                        class="order-btn"
                                        disabled={i === 0}
                                        on:click={() => moveExercise(i, 'up')}
                                    >
                                        ↑
                                    </button>
                                    <button 
                                        class="order-btn"
                                        disabled={i === newExercises.length - 1}
                                        on:click={() => moveExercise(i, 'down')}
                                    >
                                        ↓
                                    </button>
                                    <button 
                                        class="remove-btn"
                                        on:click={() => handleRemoveExercise(i)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        {/each}

                        <button 
                            class="save-btn"
                            on:click={handleAssignProgram}
                            disabled={isAssigning}
                        >
                            {isAssigning ? 'Saving...' : 'Save Program'}
                        </button>
                    </div>
                {:else}
                    <p class="no-exercises">No exercises assigned yet. Add some exercises above.</p>
                {/if}
            </div>
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

    .program-section {
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
    }

    .time-input {
        margin-bottom: 1rem;
    }

    .exercise-select {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
    }

    .value-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .value-group label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .value-group input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
    }

    .exercise-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        margin-bottom: 0.5rem;
    }

    .exercise-info h4 {
        margin: 0;
        margin-bottom: 0.25rem;
    }

    .exercise-info p {
        margin: 0;
        color: #6b7280;
    }

    .exercise-info small {
        color: #9ca3af;
    }

    .exercise-controls {
        display: flex;
        gap: 0.5rem;
    }

    .order-btn {
        padding: 0.25rem 0.5rem;
        background-color: #e5e7eb;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .order-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .remove-btn {
        padding: 0.25rem 0.5rem;
        background-color: #ef4444;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .add-btn {
        padding: 0.5rem 1rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        width: 100%;
    }

    .save-btn {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background-color: #059669;
        color: white;
    }
    </style>