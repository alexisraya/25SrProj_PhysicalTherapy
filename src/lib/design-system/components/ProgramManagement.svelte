<script lang="ts">
    // This is for Therapist management
    import type { Program, AssignedExercise } from "$firebase/types/userType";
    import type { Exercise } from "$firebase/types/exerciseType";
    import {
        isDistanceExercise,
        isWeightExercise,
    } from "$firebase/types/exerciseType";

    export let currentProgram: Program | null;
    export let availableExercises: Exercise[] = [];
    export let onUpdateProgram: (program: Program) => void;
    export let isLoading = false;

    let selectedExercise: Exercise | null = null;
    let estimatedTime = currentProgram?.estimatedTime || 30;
    let exercises = currentProgram?.exercises || [];

    let exerciseValues = {
        sets: 3,
        reps: 10,
        steps: 10,
        seconds: 10,
        weight: 0,
    };

    $: if (currentProgram) {
        exercises = currentProgram.exercises;
        estimatedTime = currentProgram.estimatedTime;
    }

    function handleAddExercise() {
        if (!selectedExercise) return;

        const baseExercise = {
            exerciseId: selectedExercise.exerciseId,
            exerciseName: selectedExercise.exerciseName,
            exerciseType: selectedExercise.exerciseType,
            equipment: selectedExercise.equipment,
            order: exercises.length,
            completed: false,
            skipped: false,
        };

        let exerciseToAdd: AssignedExercise;

        if (isDistanceExercise(selectedExercise)) {
            exerciseToAdd = {
                ...baseExercise,
                sets: exerciseValues.sets,
                steps: exerciseValues.steps,
            };
        } else if (isWeightExercise(selectedExercise)) {
            exerciseToAdd = {
                ...baseExercise,
                sets: exerciseValues.sets,
                reps: exerciseValues.reps,
                weight: exerciseValues.weight,
            };
        } else {
            exerciseToAdd = {
                ...baseExercise,
                sets: exerciseValues.sets,
                reps: exerciseValues.reps,
                seconds: exerciseValues.seconds,
            };
        }

        const updatedExercises = [...exercises, exerciseToAdd];
        exercises = updatedExercises;
        onUpdateProgram({
            exercises: updatedExercises,
            estimatedTime,
            assignedAt: currentProgram?.assignedAt || new Date().toISOString(),
            completed: false,
        });

        // Reset selection
        selectedExercise = null;
    }

    function handleRemoveExercise(index: number) {
        const updatedExercises = exercises
            .filter((_, i) => i !== index)
            .map((ex, i) => ({ ...ex, order: i }));

        exercises = updatedExercises;
        onUpdateProgram({
            exercises: updatedExercises,
            estimatedTime,
            assignedAt: currentProgram?.assignedAt || new Date().toISOString(),
            completed: false,
        });
    }

    function moveExercise(index: number, direction: "up" | "down") {
        let updatedExercises = [...exercises];

        if (direction === "up" && index > 0) {
            [updatedExercises[index - 1], updatedExercises[index]] = [
                updatedExercises[index],
                updatedExercises[index - 1],
            ];
        } else if (direction === "down" && index < exercises.length - 1) {
            [updatedExercises[index], updatedExercises[index + 1]] = [
                updatedExercises[index + 1],
                updatedExercises[index],
            ];
        }

        updatedExercises = updatedExercises.map((ex, i) => ({
            ...ex,
            order: i,
        }));
        exercises = updatedExercises;
        onUpdateProgram({
            exercises: updatedExercises,
            estimatedTime,
            assignedAt: currentProgram?.assignedAt || new Date().toISOString(),
            completed: false,
        });
    }

    function handleTimeChange() {
        onUpdateProgram({
            exercises: exercises || [],
            estimatedTime,
            assignedAt: currentProgram?.assignedAt || new Date().toISOString(),
            completed: false,
        });
    }

    function getExerciseDetails(exercise: AssignedExercise): string {
        if (exercise.exerciseType === "distance") {
            return `${exercise.sets} sets of ${exercise.steps} steps`;
        } else if (exercise.exerciseType === "weight") {
            return `${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight}lbs`;
        } else {
            return `${exercise.sets} sets of ${exercise.reps} reps, ${exercise.seconds} seconds each`;
        }
    }
</script>

<div class="program-section">
    <h2>Exercise Program</h2>
    <div class="time-input">
        <label>
            Program Time (minutes):
            <input
                type="number"
                value={estimatedTime}
                on:input={(e) => {
                    const newValue = parseInt(e.currentTarget.value);
                    if (!isNaN(newValue)) {
                        estimatedTime = newValue;
                        console.log("Time updated to:", estimatedTime);
                    }
                }}
                min="1"
                max="120"
            />
        </label>
        <button
            on:click={() => {
                onUpdateProgram({
                    exercises,
                    estimatedTime,
                    assignedAt:
                        currentProgram?.assignedAt || new Date().toISOString(),
                    completed: currentProgram?.completed || false,
                });
            }}
            class="update-time-btn"
            disabled={isLoading}
        >
            Update Time
        </button>
    </div>
    <div class="exercise-selection">
        <select bind:value={selectedExercise} class="exercise-select">
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
                            <input
                                type="number"
                                bind:value={exerciseValues.sets}
                                min="1"
                            />
                        </label>
                        <label>
                            Steps per set:
                            <input
                                type="number"
                                bind:value={exerciseValues.steps}
                                min="1"
                            />
                        </label>
                    </div>
                {:else if isWeightExercise(selectedExercise)}
                    <div class="value-group">
                        <label>
                            Sets:
                            <input
                                type="number"
                                bind:value={exerciseValues.sets}
                                min="1"
                            />
                        </label>
                        <label>
                            Reps per set:
                            <input
                                type="number"
                                bind:value={exerciseValues.reps}
                                min="1"
                            />
                        </label>
                        <label>
                            Weight (lbs):
                            <input
                                type="number"
                                bind:value={exerciseValues.weight}
                                min="0"
                                step="5"
                            />
                        </label>
                    </div>
                {:else}
                    <div class="value-group">
                        <label>
                            Sets:
                            <input
                                type="number"
                                bind:value={exerciseValues.sets}
                                min="1"
                            />
                        </label>
                        <label>
                            Reps:
                            <input
                                type="number"
                                bind:value={exerciseValues.reps}
                                min="1"
                            />
                        </label>
                        <label>
                            Seconds to hold:
                            <input
                                type="number"
                                bind:value={exerciseValues.seconds}
                                min="1"
                            />
                        </label>
                    </div>
                {/if}

                <button
                    class="add-btn"
                    on:click={handleAddExercise}
                    disabled={isLoading}
                >
                    Add Exercise
                </button>
            </div>
        {/if}
    </div>
    {#if exercises.length > 0}
        <div class="exercise-list">
            <h3>Current Exercises</h3>
            {#each exercises as exercise, i}
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
                            disabled={i === 0 || isLoading}
                            on:click={() => moveExercise(i, "up")}
                        >
                            ↑
                        </button>
                        <button
                            class="order-btn"
                            disabled={i === exercises.length - 1 || isLoading}
                            on:click={() => moveExercise(i, "down")}
                        >
                            ↓
                        </button>
                        <button
                            class="remove-btn"
                            on:click={() => handleRemoveExercise(i)}
                            disabled={isLoading}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="no-exercises">
            No exercises assigned yet. Add some exercises above.
        </p>
    {/if}
</div>

<style>
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

    .add-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .no-exercises {
        text-align: center;
        color: #6b7280;
        margin-top: 1rem;
    }

    .update-time-btn {
        margin-top: 0.5rem;
        padding: 0.25rem 0.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        cursor: pointer;
    }

    .update-time-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
