<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Exercise } from '$firebase/services/exerciseService';
    import type { AssignedExercise } from '$firebase/userService';
    import { isDistanceExercise, isWeightExercise, isTimeExercise } from '$firebase/services/exerciseService';

    export let availableExercises: Exercise[] = [];
    export let selectedExercises: AssignedExercise[] = [];
    export let estimatedTime = 30; // default 30 minutes

    const dispatch = createEventDispatcher();

    let selectedExercise: Exercise | null = null;
    let exerciseValues = {
        sets: 3,
        reps: 10,
        steps: 10,
        seconds: 10,
        weight: 0
    };

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
        dispatch('exercisesUpdated', { exercises: selectedExercises });
    }

    function handleRemoveExercise(index: number) {
        selectedExercises = selectedExercises.filter((_, i) => i !== index);
        // Recalculate order
        selectedExercises = selectedExercises.map((ex, i) => ({
            ...ex,
            order: i
        }));
        dispatch('exercisesUpdated', { exercises: selectedExercises });
    }

    function handleTimeChange() {
        dispatch('timeUpdated', { estimatedTime });
    }

    // Function to move exercise up/down (temporary until drag-drop is implemented)
    function moveExercise(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index > 0) {
            const temp = selectedExercises[index - 1];
            selectedExercises[index - 1] = { ...selectedExercises[index], order: index - 1 };
            selectedExercises[index] = { ...temp, order: index };
            selectedExercises = [...selectedExercises];
        } else if (direction === 'down' && index < selectedExercises.length - 1) {
            const temp = selectedExercises[index + 1];
            selectedExercises[index + 1] = { ...selectedExercises[index], order: index + 1 };
            selectedExercises[index] = { ...temp, order: index };
            selectedExercises = [...selectedExercises];
        }
        dispatch('exercisesUpdated', { exercises: selectedExercises });
    }
</script>

<div class="program-assignment">
    <div class="time-estimation">
        <label>
            Estimated Program Time (minutes):
            <input 
                type="number" 
                bind:value={estimatedTime}
                on:change={handleTimeChange}
                min="1"
            />
        </label>
    </div>

    <div class="exercise-selection">
        <h3>Add Exercise</h3>
        <div class="exercise-form">
            <select bind:value={selectedExercise}>
                <option value={null}>Select an exercise</option>
                {#each availableExercises as exercise}
                    <option value={exercise}>{exercise.exerciseName}</option>
                {/each}
            </select>

            {#if selectedExercise}
                {#if isDistanceExercise(selectedExercise)}
                    <div class="value-inputs">
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
                    <div class="value-inputs">
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
                    <div class="value-inputs">
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

                <button on:click={handleAddExercise}>Add to Program</button>
            {/if}
        </div>
    </div>

    {#if selectedExercises.length > 0}
        <div class="selected-exercises">
            <h3>Program Exercises</h3>
            <div class="exercise-list">
                {#each selectedExercises as exercise, i}
                    <div class="exercise-item">
                        <span class="exercise-name">{exercise.exerciseName}</span>
                        <div class="exercise-details">
                            {#if exercise.exerciseType === 'distance'}
                                <span>{exercise.sets} sets of {exercise.steps} steps</span>
                            {:else if exercise.exerciseType === 'weight'}
                                <span>{exercise.sets} sets of <span>{exercise.sets} sets of {exercise.reps} reps at {exercise.weight}lbs</span>
                                {:else}
                                    <span>{exercise.reps} times, {exercise.seconds} seconds each</span>
                                {/if}
                            </div>
                            <div class="exercise-controls">
                                <button 
                                    class="move-btn" 
                                    on:click={() => moveExercise(i, 'up')} 
                                    disabled={i === 0}
                                >
                                    ↑
                                </button>
                                <button 
                                    class="move-btn" 
                                    on:click={() => moveExercise(i, 'down')} 
                                    disabled={i === selectedExercises.length - 1}
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
                </div>
            </div>
        {/if}
    </div>
    
    <style>
        .program-assignment {
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
        }
    
        .time-estimation {
            margin-bottom: 1.5rem;
        }
    
        .exercise-selection {
            margin-bottom: 1.5rem;
        }
    
        .exercise-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    
        select {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            width: 100%;
        }
    
        .value-inputs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }
    
        label {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
    
        input[type="number"] {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
        }
    
        button {
            padding: 0.5rem 1rem;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
        }
    
        button:hover {
            background-color: #2563eb;
        }
    
        button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
        }
    
        .exercise-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
    
        .exercise-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.25rem;
        }
    
        .exercise-name {
            font-weight: 500;
        }
    
        .exercise-details {
            color: #6b7280;
        }
    
        .exercise-controls {
            display: flex;
            gap: 0.5rem;
        }
    
        .move-btn {
            padding: 0.25rem 0.5rem;
            background-color: #9ca3af;
        }
    
        .remove-btn {
            background-color: #ef4444;
        }
    
        .remove-btn:hover {
            background-color: #dc2626;
        }
    </style>