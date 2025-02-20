<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/helpers/firebase';
    import { getUser, updateUser, type User } from '$firebase/userService';
    import { getAllExercisesFromLibrary, type Exercise } from '$firebase/exerciseService';

    let patient: User | null = null;
    let exercises: Exercise[] = [];
    let loading = true;
    let error: string | null = null;
    
    // Form state
    let selectedExercise: Exercise | null = null;
    let sets = 3;
    let reps = 10;
    let isAssigning = false;
    let assignmentSuccess = false;

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (!authUser) {
                goto('/login');
                return;
            }

            try {
                // Get the specific patient ID from the URL parameter
                const patientId = $page.params.id;
                console.log("Loading patient details for:", patientId);
                
                // Fetch only this specific patient
                const patientData = await getUser(patientId);
                
                if (patientData) {
                    patient = patientData;
                    if (!patient.assignedExercises) {
                        patient.assignedExercises = [];
                    }
                } else {
                    error = "Patient not found";
                }
                
                // Load exercise library
                exercises = await getAllExercisesFromLibrary();
                if (exercises.length > 0) {
                    selectedExercise = exercises[0];
                }
                
            } catch (err) {
                console.error('Error fetching patient data:', err);
                error = "Error loading patient data";
            } finally {
                loading = false;
            }
        });

        return unsubscribe;
    });

    async function handleAssignExercise() {
        if (!patient || !selectedExercise) return;
        
        try {
            isAssigning = true;
            
            // Create the exercise assignment
            const newExercise = {
                exerciseId: selectedExercise.exerciseId,
                exerciseName: selectedExercise.exerciseName,
                sets: sets,
                reps: reps,
                assigned: new Date().toISOString(),
                completed: false
            };
            
            // Add to patient's assigned exercises
            const updatedExercises = [...(patient.assignedExercises || []), newExercise];
            
            // Update the patient record
            await updateUser(patient.userId, {
                assignedExercises: updatedExercises
            });
            
            // Update local state
            patient.assignedExercises = updatedExercises;
            assignmentSuccess = true;
            
            // Reset form after 2 seconds
            setTimeout(() => {
                assignmentSuccess = false;
                sets = 3;
                reps = 10;
            }, 2000);
            
        } catch (err) {
            console.error('Error assigning exercise:', err);
            error = "Failed to assign exercise";
        } finally {
            isAssigning = false;
        }
    }

    function handleRemoveExercise(index: number) {
        if (!patient || !patient.assignedExercises) return;
        
        const updatedExercises = [...patient.assignedExercises];
        updatedExercises.splice(index, 1);
        
        updateUser(patient.userId, {
            assignedExercises: updatedExercises
        }).then(() => {
            patient.assignedExercises = updatedExercises;
        }).catch(err => {
            console.error('Error removing exercise:', err);
            error = "Failed to remove exercise";
        });
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
            
            <div class="exercise-section">
                <h2>Assigned Exercises</h2>
                {#if patient.assignedExercises && patient.assignedExercises.length > 0}
                    <table class="exercise-table">
                        <thead>
                            <tr>
                                <th>Exercise</th>
                                <th>Sets</th>
                                <th>Reps</th>
                                <th>Assigned</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each patient.assignedExercises as exercise, i}
                                <tr>
                                    <td>{exercise.exerciseName}</td>
                                    <td>{exercise.sets || 1}</td>
                                    <td>{exercise.reps}</td>
                                    <td>{formatDate(exercise.assigned)}</td>
                                    <td>
                                        {#if exercise.completed}
                                            <span class="status-completed">Completed</span>
                                        {:else}
                                            <span class="status-pending">Pending</span>
                                        {/if}
                                    </td>
                                    <td>
                                        <button 
                                            class="remove-btn" 
                                            on:click={() => handleRemoveExercise(i)}
                                            aria-label="Remove exercise"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p>No exercises assigned yet.</p>
                {/if}

                <div class="assign-section">
                    <h3>Assign New Exercise</h3>
                    
                    <div class="assign-form">
                        <div class="form-group">
                            <label for="exercise-select">Select Exercise:</label>
                            <select 
                                id="exercise-select"
                                bind:value={selectedExercise}
                                disabled={isAssigning || exercises.length === 0}
                            >
                                {#each exercises as exercise}
                                    <option value={exercise}>{exercise.exerciseName}</option>
                                {/each}
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="sets-input">Sets:</label>
                                <input 
                                    id="sets-input"
                                    type="number" 
                                    bind:value={sets}
                                    min="1"
                                    max="10"
                                    disabled={isAssigning}
                                />
                            </div>
                            
                            <div class="form-group">
                                <label for="reps-input">Reps per set:</label>
                                <input 
                                    id="reps-input"
                                    type="number" 
                                    bind:value={reps}
                                    min="1"
                                    max="50"
                                    disabled={isAssigning}
                                />
                            </div>
                        </div>
                        
                        <button 
                            class="assign-btn"
                            on:click={handleAssignExercise}
                            disabled={isAssigning || !selectedExercise}
                        >
                            {#if isAssigning}
                                Assigning...
                            {:else}
                                Assign Exercise
                            {/if}
                        </button>
                        
                        {#if assignmentSuccess}
                            <p class="success-message">Exercise assigned successfully!</p>
                        {/if}
                    </div>
                </div>
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
    .patient-container {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
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
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.5rem;
    }

    .details-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .loading-container,
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: 1rem;
    }

    .error {
        color: #dc2626;
    }

    .success-message {
        color: #059669;
        font-weight: 500;
        margin-top: 0.5rem;
    }

    .exercise-section {
        margin-top: 1.5rem;
    }

    .exercise-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5rem;
    }
    
    .exercise-table th,
    .exercise-table td {
        border: 1px solid #e5e7eb;
        padding: 0.75rem;
        text-align: left;
    }
    
    .exercise-table th {
        background-color: #f9fafb;
        font-weight: 500;
    }
    
    .status-completed {
        color: #059669;
        font-weight: 500;
    }
    
    .status-pending {
        color: #d97706;
    }

    .remove-btn {
        background-color: #fee2e2;
        color: #dc2626;
        border: none;
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        font-size: 0.75rem;
    }

    .remove-btn:hover {
        background-color: #fecaca;
    }

    .assign-section {
        background-color: #f9fafb;
        padding: 1rem;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;
    }

    .assign-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .form-row {
        display: flex;
        gap: 1rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #4b5563;
    }

    .form-group select,
    .form-group input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
        font-size: 1rem;
    }

    .assign-btn {
        padding: 0.625rem 1rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        align-self: flex-start;
    }

    .assign-btn:hover {
        background-color: #2563eb;
    }

    .assign-btn:disabled {
        background-color: #93c5fd;
        cursor: not-allowed;
    }
</style>