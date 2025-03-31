<script lang="ts">
    import { typography } from '$lib/design-system';
    import PlayButtonLight from '$lib/assets/iconography/PlayButtonLight.svg';
    import PlayButtonDark from '$lib/assets/iconography/PlayButtonDark.svg';
    import ExerciseCard from '$lib/design-system/components/ExerciseCard.svelte';

    import { onMount } from "svelte";
    import {
        checkAndResetProgress,
        getUserStats,
        getWeeklyProgress,
    } from "$firebase/services/statService";
    import {
        getCurrentProgram,
        updateProgram,
    } from "$firebase/services/programService";
    import {
        completeExercise,
        skipExercise,
    } from "$firebase/services/userexerciseService";
    import type { Program } from "$firebase/types/userType";
    import type { UserStats } from "$firebase/types/userType";
    import { authStore } from "$stores/authStore";
    import { writable } from "svelte/store";
    import { goto } from "$app/navigation";
    import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

    let isEditing = false;
    // TODO: Alexis update button copy
    let buttonLabel = "Mark them complete here";

    let program = writable<Program | null>(null);
    let stats = writable<UserStats | null>(null);
    let weeklyProgress = writable<any>(null);
    let userId = "";
    let isLoading = writable(true);
    let error = writable<string | null>(null);
    $: equipment = [];

    let selectedExercises: Record<string, boolean> = {};
    let isSaving = false;

    $: hasIncompleteExercises =
        $program?.exercises?.some((ex) => !ex.completed && !ex.skipped) ||
        false;
    $: hasStartedProgram =
        $program?.exercises?.some((ex) => ex.completed || ex.skipped) || false;
    $: programCompleted = $program?.completed || false;

    let currentTheme: 'light' | 'dark' = 'light';

    function updateThemeFromStorage() {
        // Check localStorage directly
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        
        if (savedTheme) {
            currentTheme = savedTheme;
        } else {
            // Fallback to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            currentTheme = prefersDark ? 'dark' : 'light';
        }
    }

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (store) => {
            if (!store.isLoading && store.currentUser) {
                userId = store.currentUser.uid;

                try {
                    await checkAndResetProgress(userId);

                    const [programData, statsData, weeklyData] =
                        await Promise.all([
                            getCurrentProgram(userId),
                            getUserStats(userId),
                            getWeeklyProgress(userId),
                        ]);

                    program.set(programData);
                    stats.set(statsData);
                    weeklyProgress.set(weeklyData);

                    if (programData) {
                        resetSelections();
                        
                        // Extract equipment list
                        equipment = [];
                        programData.exercises.forEach(exercise => {
                            if (exercise.equipment && !equipment.includes(exercise.equipment)) {
                                equipment.push(exercise.equipment);
                            }
                        });
                    }
                } catch (err) {
                    console.error("Error loading data:", err);
                    error.set(
                        err instanceof Error
                            ? err.message
                            : "Failed to load program",
                    );
                } finally {
                    console.log($program);
                    isLoading.set(false);
                }
            }
        });

        updateThemeFromStorage();

        // Listen for custom theme change events
        const handleThemeChange = () => {
            updateThemeFromStorage();
        };
        
        window.addEventListener('themeChanged', handleThemeChange);

        return () => {
            unsubscribe();
            window.removeEventListener('themeChanged', updateThemeFromStorage);
        }
    });

    function formatDate(dateString: string | undefined): string {
        return dateString ? new Date(dateString).toLocaleDateString() : "N/A";
    }

    function startProgram() {
        if (!$program?.exercises || $program.exercises.length === 0) {
            console.log("No exercises found");
            return;
        }

        const firstIncomplete = $program.exercises.find(
            (ex) => !ex.completed && !ex.skipped,
        );
        if (firstIncomplete) {
            goto(
                `/your-program/${firstIncomplete.exerciseId}`,
            );
        } else {
            goto("/your-program/summary");
        }
    }

    async function handleSkipExercise(exerciseId: string) {
        try {
            isLoading.set(true);
            await skipExercise(userId, exerciseId);

            // Refresh data
            const [programData, statsData, weeklyData] = await Promise.all([
                getCurrentProgram(userId),
                getUserStats(userId),
                getWeeklyProgress(userId),
            ]);

            program.set(programData);
            stats.set(statsData);
            weeklyProgress.set(weeklyData);
        } catch (err) {
            console.error("Error skipping exercise:", err);
            error.set(
                err instanceof Error ? err.message : "Failed to skip exercise",
            );
        } finally {
            isLoading.set(false);
        }
    }

    async function handleMoveExercise(
        exerciseId: string,
        direction: "up" | "down",
    ) {
        if (!$program) return;

        let exercises = [...$program.exercises];
        const index = exercises.findIndex((ex) => ex.exerciseId === exerciseId);

        if (
            (direction === "up" && index > 0) ||
            (direction === "down" && index < exercises.length - 1)
        ) {
            const swapIndex = direction === "up" ? index - 1 : index + 1;
            [exercises[index], exercises[swapIndex]] = [
                exercises[swapIndex],
                exercises[index],
            ];

            const updatedExercises = exercises.map((ex, i) => ({
                ...ex,
                order: i,
            }));

            try {
                isLoading.set(true);
                await updateProgram(userId, { exercises: updatedExercises });

                const programData = await getCurrentProgram(userId);
                program.set(programData);
            } catch (err) {
                console.error("Error updating exercise order:", err);
                error.set(
                    err instanceof Error
                        ? err.message
                        : "Error updating exercise order",
                );
            } finally {
                isLoading.set(false);
            }
        }
    }

    function resetSelections() {
        if (!$program) return;

        selectedExercises = {};
        $program.exercises.forEach((ex) => {
            if (!ex.completed && !ex.skipped) {
                selectedExercises[ex.exerciseId] = false;
            }
        });
    }

    function handleToggleSelection(exerciseId: string, isSelected: boolean) {
        selectedExercises[exerciseId] = isSelected;
    }

    async function saveCompletedExercises() {
        if (!$program) return;

        try {
            isSaving = true;
            error.set(null);

            // Get all selected exercises
            const exercisesToComplete = Object.entries(selectedExercises)
                .filter(([_, isSelected]) => isSelected)
                .map(([exerciseId, _]) => {
                    const exercise = $program?.exercises.find(
                        (ex) => ex.exerciseId === exerciseId,
                    );
                    if (!exercise) return null;

                    const adjustedValues = {
                        sets: exercise.sets || 0,
                        reps: exercise.reps || 0,
                        steps: exercise.steps || 0,
                        seconds: exercise.seconds || 0,
                        weight: exercise.weight || 0,
                    };

                    return completeExercise(userId, exerciseId, adjustedValues);
                })
                .filter(Boolean);

            // Complete all selected exercises
            if (exercisesToComplete.length > 0) {
                await Promise.all(exercisesToComplete);
                
                // Refresh data
                const [programData, statsData, weeklyData] = await Promise.all([
                    getCurrentProgram(userId),
                    getUserStats(userId),
                    getWeeklyProgress(userId),
                ]);

                program.set(programData);
                stats.set(statsData);
                weeklyProgress.set(weeklyData);
                
                // Check if all exercises are completed
                if (programData?.exercises.every(ex => ex.completed || ex.skipped)) {
                    goto("/exploration/firebase-test/program-complete");
                }
            }
            
            // Exit edit mode
            isEditing = false;
            buttonLabel = "Mark them complete here";
            resetSelections();
            
        } catch (err) {
            console.error("Error saving completed exercises:", err);
            error.set(
                err instanceof Error
                    ? err.message
                    : "Failed to mark exercises as complete",
            );
        } finally {
            console.log("SAVED PROGRAM");
            console.log($program);
            isSaving = false;
        }
    }

    function getExerciseDetails(exercise: any): string {
        if (exercise.exerciseType === "distance") {
            return `${exercise.sets || 0} sets of ${exercise.steps || 0} steps`;
        } else if (exercise.exerciseType === "weight") {
            return `${exercise.sets || 0} sets of ${exercise.reps || 0} reps at ${exercise.weight || 0}lbs`;
        } else {
            return `${exercise.reps || 0} times, ${exercise.seconds || 0} seconds each`;
        }
    }

    function toggleEditMode() {
        if (isEditing) {
            // If we're leaving edit mode and have selected exercises, save them
            if (Object.values(selectedExercises).some(selected => selected)) {
                saveCompletedExercises();
            } else {
                isEditing = false;
                buttonLabel = "Mark them complete here";
            }
        } else {
            isEditing = true;
            buttonLabel = "Save changes";
            resetSelections();
        }
    }
</script>

 {#if $program}
    <div class="your-program-container">
        <svg class="background-wave" xmlns="http://www.w3.org/2000/svg" width="332" height="213" viewBox="0 0 332 213" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M331.819 213C318.478 204.931 306.176 192.179 292.717 178.228C256.836 141.034 212.732 95.3173 118.798 107.096C28.3434 118.438 -3.70112 64.6624 0.372848 0L332 0V213H331.819Z"/>
        </svg>
        <div class="your-program-title-container">
            <div class="your-program-title-container--text">
                <h3 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h3}; font-weight: {typography.fontWeights.medium};">Your Program</h3>
                <div class="your-program-title-container--details">
                    <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};" class="time">~{$program?.estimatedTime} Min</p>
                    {#each equipment as eq}
                            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">•</p>
                            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">{eq}</p>
                    {/each}
                </div>
            </div>
            <!-- Change to Start Program -->
            <button class="play-btn" on:click={startProgram}>
                {#if currentTheme == 'light'}
                    <img class="play-btn-img" src={PlayButtonLight} alt="play button"/>
                {:else}
                    <img class="play-btn-img" src={PlayButtonDark} alt="play button"/>
                {/if}
            </button>
        </div>

        <div class="exercises-container">
            {#if $program.exercises.length > 0}
                {#each $program.exercises as exercise, i (exercise.exerciseId)}
                    <ExerciseCard 
                        exerciseName={exercise.exerciseName} 
                        exerciseSet={`${exercise.sets || 0} sets of ${exercise.reps || 0}`} 
                        exerciseEquipment={exercise.equipment} 
                        orderable={false} 
                        isComplete={exercise.completed} 
                        exerciseId={exercise.exerciseId} 
                        isTooPainful={exercise.skipped} 
                        editMode={isEditing}
                        isSelected={selectedExercises[exercise.exerciseId] || false}
                        onToggleSelection={handleToggleSelection}
                        cardType="your-program"
                    />
                {/each}
            {:else}
                <p>No exercises in your program</p>
            {/if}
        </div>

        <div class="exercise-message-container">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;">Already completed some exercises today?</p>
            <button 
                class="exercise-edit-button" 
                on:click={toggleEditMode}
                disabled={isSaving}
            >
                <RemixIcon name={isEditing ? "check-line" : "pencil-fill"} size="12px"/>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">
                    {isSaving ? 'Saving...' : buttonLabel}
                </p>
            </button>
        </div>
    </div>
{/if}

<style>
    .background-wave {
        position: absolute;
        top: -30px;
        right: 0;
        z-index: -1;
        fill: var(--background-secondary);
    }
    .your-program-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 9px;
    }
    .your-program-title-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 350px;
        margin-top: 81px;
    }
    .your-program-title-container--text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .your-program-title-container--details {
        display: flex;
        justify-content: flex-start;
        column-gap: 8px;
    }
    .your-program-title-container--details p{
        width: fit-content;
        max-width: 65px;
    }
    .play-btn {
        background-color: transparent;
        border: 0;
        padding: 0;
    }
    .play-btn-img {
        width: 90px;
        height: 90px;
        cursor: pointer;
    }
    .exercises-container {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        width: 100%;
        max-width: 350px;
    }
    .exercise-message-container {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 7px;
    }
    .exercise-edit-button {
        background-color: transparent;
        border: 1px solid var(--mark-complete-button);
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 8px;
        padding: 12px 32px;
        cursor: pointer;
    }
</style>