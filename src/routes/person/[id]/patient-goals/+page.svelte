<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { auth } from "$lib/helpers/firebase";
    import { getUser } from "$firebase/services/userService";
    import {
        getUserGoals,
        updateGoalLockStatus,
        assignGoalsToUser,
    } from "$firebase/services/milestoneService";
    import type { User } from "$firebase/types/userType";

    let patient: User | null = null;
    let patientGoals: Record<string, any[]> = {};
    let loading = true;
    let goalsLoading = false;
    let error: string | null = null;
    let debugInfo = {
        patientId: "",
        goalsCount: 0,
        errors: [] as string[],
    };

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (!authUser) {
                goto("/login");
                return;
            }

            await loadPatientGoals();
        });

        return unsubscribe;
    });

    async function loadPatientGoals() {
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
                patientGoals = await getUserGoals(patientId);
                debugInfo.goalsCount = Object.values(patientGoals).flat().length;
                
                if (Object.keys(patientGoals).length === 0) {
                    console.log(
                        "No goals found, assigning goals for patient:",
                        patientId,
                    );
                    await assignGoalsToUser(patientId);
                    patientGoals = await getUserGoals(patientId);
                    debugInfo.goalsCount = Object.values(patientGoals).flat().length;
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
        goto(`/person/${$page.params.id}`);
    }

    function sortedGoals() {
        return Object.entries(patientGoals).sort(
            ([a], [b]) => parseInt(a) - parseInt(b),
        );
    }
</script>

<div class="patient-goals-container">
    <button on:click={goBack} class="back-button">Back to Patient</button>
    
    <h1 class="page-title">
        {#if patient}
            Patient Goals: {patient.firstName} {patient.lastName}
        {:else}
            Patient Goals
        {/if}
    </h1>
    
    {#if loading}
        <p>Loading patient goals...</p>
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
            <button on:click={loadPatientGoals} class="reload-btn">
                Reload Data
            </button>
        </div>
    {:else if patient}
        <div class="goals-section">
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
    .patient-goals-container {
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
    
    .goals-section {
        margin-top: 1rem;
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
    
    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: bold;
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
</style>