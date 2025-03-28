<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { auth } from "$lib/helpers/firebase";
    import { getUser } from "$firebase/services/userService";
    import {
        getCurrentProgram,
        assignProgram,
    } from "$firebase/services/programService";
    import { getAllExercisesFromLibrary } from "$firebase/services/exerciseService";
    import {
        getUserGoals,
        updateGoalLockStatus,
        assignGoalsToUser,
    } from "$firebase/services/milestoneService";
    import type { User, Program } from "$firebase/types/userType";
    import type { Exercise } from "$firebase/types/exerciseType";
    import ProgramManagement from "$lib/design-system/components/ProgramManagement.svelte";

    let patient: User | null = null;
    let currentProgram: Program | null = null;
    let availableExercises: Exercise[] = [];
    let loading = true;
    let error: string | null = null;
    let isAssigning = false;
    let patientGoals: Record<string, any[]> = {};
    let goalsLoading = false;
    let debugInfo = {
        patientId: "",
        goalsCount: 0,
        errors: [] as string[],
    };

    async function loadPatientData() {
        if (!auth.currentUser) {
            goto("/login");
            return;
        }

        const patientId = $page.params.id;
        debugInfo.patientId = patientId;

        try {
            loading = true;
            error = null;
            debugInfo.errors = [];

            const patientData = await getUser(patientId);
            if (!patientData) {
                error = "Patient not found";
                debugInfo.errors.push("Patient not found");
                return;
            }

            patient = patientData;

            try {
                currentProgram = await getCurrentProgram(patientId);
                if (!currentProgram) {
                    currentProgram = {
                        exercises: [],
                        estimatedTime: 30,
                        assignedAt: new Date().toISOString(),
                        completed: false,
                    };
                }
            } catch (err) {
                console.error("Error fetching program:", err);
                debugInfo.errors.push(`Program error: ${err}`);
                currentProgram = {
                    exercises: [],
                    estimatedTime: 30,
                    assignedAt: new Date().toISOString(),
                    completed: false,
                };
            }

            try {
                availableExercises = await getAllExercisesFromLibrary();
            } catch (err) {
                console.error("Error fetching exercises:", err);
                debugInfo.errors.push(`Exercises error: ${err}`);
            }

            try {
                patientGoals = await getUserGoals(patientId);
                debugInfo.goalsCount =
                    Object.values(patientGoals).flat().length;
                if (Object.keys(patientGoals).length === 0) {
                    console.log(
                        "No goals found, assigning goals for patient:",
                        patientId,
                    );
                    await assignGoalsToUser(patientId);
                    patientGoals = await getUserGoals(patientId);
                    debugInfo.goalsCount =
                        Object.values(patientGoals).flat().length;
                }
            } catch (err) {
                console.error("Error fetching goals:", err);
                debugInfo.errors.push(`Goals error: ${err}`);
            }
        } catch (err) {
            console.error("Error loading patient data:", err);
            error = "Error loading data";
            debugInfo.errors.push(`General error: ${err}`);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (!authUser) {
                goto("/login");
                return;
            }

            await loadPatientData();
        });

        return unsubscribe;
    });

    async function handleProgramUpdate(program: Program) {
        if (!patient) return;

        try {
            isAssigning = true;
            error = null;

            const exercises = program.exercises || [];

            await assignProgram(
                patient.userId,
                exercises,
                program.estimatedTime,
            );

            currentProgram = await getCurrentProgram(patient.userId);
            if (!currentProgram) {
                currentProgram = {
                    exercises: [],
                    estimatedTime: program.estimatedTime || 30,
                    assignedAt: new Date().toISOString(),
                    completed: false,
                };
            }
        } catch (err) {
            console.error("Error updating program:", err);
            error = "Failed to update program";
        } finally {
            isAssigning = false;
        }
    }

    async function toggleGoalLock(goalId: string, unlocked: boolean) {
        if (!patient) return;

        try {
            goalsLoading = true;
            console.log(
                `Toggling goal ${goalId} for patient ${patient.userId} to ${!unlocked ? "unlocked" : "locked"}`,
            );

            await updateGoalLockStatus(patient.userId, goalId, !unlocked);

            patientGoals = Object.fromEntries(
                Object.entries(patientGoals).map(([month, goals]) => [
                    month,
                    goals.map((goal) =>
                        goal.goalId === goalId
                            ? { ...goal, unlocked: !unlocked }
                            : goal,
                    ),
                ]),
            );

            const refreshedGoals = await getUserGoals(patient.userId);
            patientGoals = refreshedGoals;

            console.log("Updated goals:", patientGoals);
        } catch (err) {
            console.error("Error updating goal status:", err);
            error = "Failed to update goal status";
        } finally {
            goalsLoading = false;
        }
    }

    async function handleAssignGoals() {
        if (!patient) return;

        try {
            goalsLoading = true;
            await assignGoalsToUser(patient.userId);
            patientGoals = await getUserGoals(patient.userId);
            console.log("Assigned goals and refreshed:", patientGoals);
        } catch (err) {
            console.error("Error assigning goals:", err);
            error = "Failed to assign goals";
        } finally {
            goalsLoading = false;
        }
    }

    function goBack() {
        goto("/therapist-dashboard");
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }

    function sortedGoals() {
        return Object.entries(patientGoals).sort(
            ([a], [b]) => parseInt(a) - parseInt(b),
        );
    }
</script>

<div class="patient-container">
    <button on:click={goBack} class="back-button">Back to Dashboard</button>
    <h1 class="page-title">Patient Details</h1>
    {#if loading}
        <p>Loading patient data...</p>
    {:else if error}
        <p class="error">{error}</p>
        <div class="debug-info">
            <h3>Debug Information</h3>
            <p><strong>Patient ID:</strong> {debugInfo.patientId}</p>
            <p><strong>Goals Count:</strong> {debugInfo.goalsCount}</p>
            {#if debugInfo.errors.length > 0}
                <p><strong>Errors:</strong></p>
                <ul>
                    {#each debugInfo.errors as error}
                        <li>{error}</li>
                    {/each}
                </ul>
            {/if}
            <button on:click={loadPatientData} class="reload-btn">
                Reload Data
            </button>
        </div>
    {:else if patient}
        <div class="details-section">
            <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Start Date:</strong> {formatDate(patient.createdAt)}</p>
            <div class="program-header">
                <h2>Exercise Program</h2>
                {#if currentProgram}
                    <div class="program-status">
                        <p>
                            <strong>Status:</strong>
                            <span
                                class="status-badge {currentProgram.completed
                                    ? 'completed'
                                    : 'in-progress'}"
                            >
                                {currentProgram.completed
                                    ? "Completed"
                                    : "In Progress"}
                            </span>
                        </p>
                        <p>
                            <strong>Last Updated:</strong>
                            {currentProgram.updatedAt
                                ? formatDate(currentProgram.updatedAt)
                                : formatDate(currentProgram.assignedAt)}
                        </p>
                    </div>
                    {#if currentProgram.exercises && currentProgram.exercises.length > 0}
                        <div class="exercise-status-section">
                            <h3>Exercise Status</h3>
                            <table class="exercise-status-table">
                                <thead>
                                    <tr>
                                        <th>Exercise</th>
                                        <th>Status</th>
                                        <th>Completed At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each currentProgram.exercises.sort((a, b) => a.order - b.order) as exercise}
                                        <tr
                                            class={exercise.completed
                                                ? "completed"
                                                : exercise.skipped
                                                  ? "skipped"
                                                  : ""}
                                        >
                                            <td>{exercise.exerciseName}</td>
                                            <td>
                                                {#if exercise.completed}
                                                    <span
                                                        class="status-completed"
                                                        >Completed</span
                                                    >
                                                {:else if exercise.skipped}
                                                    <span class="status-skipped"
                                                        >Skipped</span
                                                    >
                                                {:else}
                                                    <span class="status-pending"
                                                        >Pending</span
                                                    >
                                                {/if}
                                            </td>
                                            <td>
                                                {#if exercise.completedAt}
                                                    {formatDate(
                                                        exercise.completedAt,
                                                    )}
                                                {:else}
                                                    -
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <div class="no-exercises-message">
                            <p>
                                No exercises are currently assigned to this
                                patient.
                            </p>
                        </div>
                    {/if}
                {/if}
            </div>
            <ProgramManagement
                {currentProgram}
                {availableExercises}
                onUpdateProgram={handleProgramUpdate}
                isLoading={isAssigning}
            />
        </div>
        <div class="pain-logs-section">
            <h2>Exercise Pain Logs</h2>
            <p>View logs of exercises the patient marked as too painful to complete.</p>
            <a href="/person/{patient.userId}/pain-logs" class="logs-btn">View Pain Logs</a>
        </div>
        <div class="goals-section">
            <h2>Patient Goals</h2>
            <p class="goals-hint">
                Unlock goals as your patient progresses through their recovery.
            </p>

            {#if goalsLoading}
                <p class="loading-goals">Updating goals...</p>
            {/if}

            {#if Object.keys(patientGoals).length === 0}
                <div class="empty-goals">
                    <p>No goals found for this patient.</p>
                    <button
                        class="assign-goals-btn"
                        on:click={handleAssignGoals}
                    >
                        Assign Default Goals
                    </button>
                </div>
            {:else}
                {#each sortedGoals() as [month, goals]}
                    <div class="month-goals">
                        <h3>Month {month}</h3>
                        <div class="goals-grid">
                            {#each goals as goal}
                                <div
                                    class="goal-card {goal.unlocked
                                        ? 'unlocked'
                                        : 'locked'}"
                                >
                                    <div class="goal-card-header">
                                        <h4>{goal.goalName}</h4>
                                        <div class="status-badge-container">
                                            <span
                                                class="status-badge {goal.unlocked
                                                    ? 'unlocked'
                                                    : 'locked'}"
                                            >
                                                {goal.unlocked
                                                    ? "Unlocked"
                                                    : "Locked"}
                                            </span>
                                        </div>
                                        <button
                                            class="toggle-btn {goal.unlocked
                                                ? 'unlock-btn'
                                                : 'lock-btn'}"
                                            on:click={() =>
                                                toggleGoalLock(
                                                    goal.goalId,
                                                    goal.unlocked,
                                                )}
                                            disabled={goalsLoading}
                                        >
                                            {goal.unlocked ? "Lock" : "Unlock"}
                                        </button>
                                    </div>
                                    <p class="goal-description">
                                        {goal.description ||
                                            "No description available"}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    {:else}
        <p>No patient data found</p>
    {/if}
</div>

<style>
    .patient-container {
        max-width: 1000px;
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
        font-weight: bold;
    }

    .debug-info {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
    }

    .reload-btn {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #4b5563;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .program-header {
        margin: 1.5rem 0;
    }

    .program-status {
        display: flex;
        gap: 1.5rem;
        margin: 0.5rem 0;
    }

    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: bold;
    }

    .status-badge.completed {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .status-badge.in-progress {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
    }

    .exercise-status-section {
        margin: 1.5rem 0;
    }

    .exercise-status-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    .exercise-status-table th,
    .exercise-status-table td {
        padding: 0.5rem;
        border: 1px solid #ddd;
        text-align: left;
    }

    .exercise-status-table th {
        background-color: #f2f2f2;
    }

    .exercise-status-table tr.completed {
        background-color: rgba(40, 167, 69, 0.1);
    }

    .exercise-status-table tr.skipped {
        background-color: rgba(255, 193, 7, 0.1);
    }

    .status-completed {
        color: #28a745;
        font-weight: bold;
    }

    .status-skipped {
        color: #ffc107;
        font-weight: bold;
    }

    .status-pending {
        color: #6c757d;
    }

    .no-exercises-message {
        background-color: #f9fafb;
        padding: 1rem;
        border-radius: 0.25rem;
        margin: 1rem 0;
        text-align: center;
        color: #6b7280;
    }

    .goals-section {
        margin-top: 2rem;
    }

    .goals-hint {
        margin-bottom: 1rem;
        color: #6b7280;
        font-style: italic;
    }

    .loading-goals {
        background-color: #f9fafb;
        padding: 0.5rem;
        text-align: center;
        border-radius: 0.25rem;
        margin: 1rem 0;
    }

    .month-goals {
        margin-bottom: 2rem;
    }

    .month-goals h3 {
        margin-bottom: 0.75rem;
        padding-bottom: 0.25rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .goals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .goal-card {
        background-color: #ffffff;
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease-in-out;
    }

    .goal-card.unlocked {
        border-left: 4px solid #10b981;
    }

    .goal-card.locked {
        border-left: 4px solid #d1d5db;
    }

    .goal-card-header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-bottom: 0.75rem;
    }

    .goal-card-header h4 {
        margin: 0;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }

    .status-badge-container {
        margin: 0.25rem 0 0.5rem 0;
    }

    .status-badge.unlocked {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .status-badge.locked {
        background-color: rgba(107, 114, 128, 0.1);
        color: #6b7280;
    }

    .toggle-btn {
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        cursor: pointer;
        border: none;
        font-weight: 500;
        align-self: flex-start;
    }

    .lock-btn {
        background-color: #3b82f6;
        color: white;
    }

    .unlock-btn {
        background-color: #6b7280;
        color: white;
    }

    .toggle-btn:hover {
        opacity: 0.9;
    }

    .toggle-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .goal-description {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        color: #4b5563;
        line-height: 1.4;
    }

    .empty-goals {
        background-color: #f9fafb;
        border-radius: 0.5rem;
        padding: 2rem;
        text-align: center;
        margin-top: 1rem;
    }

    .assign-goals-btn {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .pain-logs-section {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #f9fafb;
        border-radius: 0.5rem;
    }
    
    .logs-btn {
        display: inline-block;
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 0.25rem;
    }
</style>
