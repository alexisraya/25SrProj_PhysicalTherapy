<script lang="ts">
  import { typography } from '$lib/design-system';
  import ExerciseModel from '$lib/design-system/components/ExerciseModel.svelte';
  import LeftArrow from '$lib/assets/iconography/LeftArrow.svg';
  import Button from '$lib/design-system/components/Button.svelte';
  import HoldToComplete from '$lib/design-system/components/HoldToComplete.svelte';
  import ProgressBar from '$lib/design-system/components/ProgressBar.svelte';
  import CharacterSelect from '$lib/design-system/components/CharacterSelect.svelte';
  import ExerciseInfoBlock from '$lib/design-system/components/ExerciseInfoBlock.svelte';
  import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { authStore } from "$stores/authStore";
    import { getCurrentProgram } from "$firebase/services/programService";
    import {
        completeExercise,
        skipExercise,
    } from "$firebase/services/userexerciseService";
    import {
        getUserStats,
        checkAndResetProgress,
    } from "$firebase/services/statService";
    import type {
        Program,
        UserStats,
        AssignedExercise,
    } from "$firebase/types/userType";
    import type { Exercise } from '$firebase/types/exerciseType';
    import { getExercise } from '$firebase/services/exerciseService';

    let currentExercise: AssignedExercise | null = null;
    let program: Program | null = null;
    let stats: UserStats | null = null;
    let exerciseDetails: Exercise | null = null;
    let exerciseInstructions: string | null = null;
    let completedExercises: number | null = null;
    let loading = true;
    let error: string | null = null;
    let adjustedValues = {
        sets: 0,
        reps: 0,
        steps: 0,
        seconds: 0,
        weight: 0,
    };
    let isCompleting = false;

    function parseInstructions(text) {
        // Split by numbered steps (1., 2., 3., etc.)
        const steps = text.split(/\d+\.\s/).filter(step => step.trim() !== '');
        
        // Handle any notes that might be at the end
        const result = [];
        for (let step of steps) {
            result.push(step.trim());
        }
        
        return result;
  }

    onMount(async () => {
        try {
            if (!$authStore.currentUser) return;
            await checkAndResetProgress($authStore.currentUser.uid);
            const exerciseId = $page.params.exerciseId;
            console.log(exerciseId);

            if (!exerciseId) {
                error = "No exercise ID provided";
                return;
            }

            const [programData, statsData, exerciseData] = await Promise.all([
                getCurrentProgram($authStore.currentUser.uid),
                getUserStats($authStore.currentUser.uid),
                getExercise(exerciseId),
            ]);

            program = programData;
            stats = statsData;
            exerciseDetails = exerciseData;
            exerciseInstructions = parseInstructions(exerciseData?.instructions);   
            completedExercises = program.exercises.filter(exercise => exercise.completed).length;         

            if (!program) {
                error = "No program found";
                return;
            }

            currentExercise =
                program?.exercises.find((ex) => ex.exerciseId === exerciseId) ??
                null;

            if (!currentExercise) {
                error = "Exercise not found in your program";
                return;
            }

            adjustedValues = {
                sets: currentExercise.sets || 0,
                reps: currentExercise.reps || 0,
                steps: currentExercise.steps || 0,
                seconds: currentExercise.seconds || 0,
                weight: currentExercise.weight || 0,
            };
        } catch (err) {
            console.error("Error loading exercise:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
        } finally {
            console.log("adjustedSets");
            console.log(currentExercise?.adjustedSets);
            loading = false;
        }
    });

    async function handleComplete() {
        if (!$authStore.currentUser || !currentExercise) {
            error = "No exercise selected.";
            return;
        }

        try {
            isCompleting = true;
            await completeExercise(
                $authStore.currentUser.uid,
                currentExercise.exerciseId,
                adjustedValues,
            );

            await navigateToNext();
        } catch (err) {
            console.error("Error completing exercise:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "Failed to complete exercise";
        } finally {
            isCompleting = false;
        }
    }

    async function handleSkip() {
        if (!$authStore.currentUser || !currentExercise) {
            error = "No exercise selected.";
            return;
        }

        try {
            await skipExercise(
                $authStore.currentUser.uid,
                currentExercise.exerciseId,
            );
            await navigateToNext();
        } catch (err) {
            console.error("Error skipping exercise:", err);
            error =
                err instanceof Error ? err.message : "Failed to skip exercise";
        }
    }

    async function navigateToNext() {
        if (!$authStore.currentUser || !currentExercise) return;

        try {
            program = await getCurrentProgram($authStore.currentUser.uid);

            if (!program || !program.exercises.length) {
                console.error("No exercises found.");
                goto("/exploration/firebase-test/program-view");
                return;
            }

            const currentIndex = program.exercises.findIndex(
                (ex) => ex.exerciseId === currentExercise?.exerciseId,
            );

            if (currentIndex === -1) {
                console.error("Current exercise not found in program.");
                goto("/exploration/firebase-test/program-view");
                return;
            }

            const allCompleted = program.exercises.every(
                (ex) => ex.completed || ex.skipped,
            );
            if (allCompleted) {
                goto("/exploration/firebase-test/program-complete");
                return;
            }

            let nextIndex = -1;

            for (let i = currentIndex + 1; i < program.exercises.length; i++) {
                if (
                    !program.exercises[i].completed &&
                    !program.exercises[i].skipped
                ) {
                    nextIndex = i;
                    break;
                }
            }

            if (nextIndex === -1) {
                for (let i = 0; i < currentIndex; i++) {
                    if (
                        !program.exercises[i].completed &&
                        !program.exercises[i].skipped
                    ) {
                        nextIndex = i;
                        break;
                    }
                }
            }

            if (nextIndex !== -1) {
                goto(
                    `/exploration/firebase-test/exercise-flow/${program.exercises[nextIndex].exerciseId}`,
                );
            } else {
                goto("/exploration/firebase-test/program-complete");
            }
        } catch (err) {
            console.error("Error navigating to next exercise:", err);
            goto("/exploration/firebase-test/program-view");
        }
    }
</script>

<div class="page_container">
    {#if program && currentExercise && exerciseDetails}
        <div class="exercise_container--top">
            <div class="exercise_nav">
            <img class="back_button" src={LeftArrow} />
            <ProgressBar totalExercises={program.exercises.length} completedExercises={completedExercises} />
            </div>
            <ExerciseModel modelPath="/models/TestGLTF01/Test01.gltf" />
            <!-- <ExerciseModel modelPath="/models/test01.glb" /> -->
            <!-- <ExerciseModel modelPath="/meditation_pose_female.glb" /> -->
            <ExerciseInfoBlock exerciseName={currentExercise.exerciseName} sets={currentExercise.adjustedSets} reps={currentExercise.adjustedReps} time={currentExercise.adjustedSeconds} steps={currentExercise.adjustedSteps} weight={currentExercise.adjustedWeight} equipment={currentExercise.equipment}/>
        </div>
        <div class="exercise_container-bottom">
            <div class="exercise_description">
            <div class="exercise_description--section">
                <h6 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography.lineHeight.expanded}">Instructions</h6>
                <ol>
                    {#each exerciseInstructions as instruction}
                        <li style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular}; line-height: {typography.lineHeight.expanded}">
                            {instruction}
                        </li>
                    {/each}
                </ol>
            </div>
            <div class="exercise_description--section">
                <h6 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography.lineHeight.expanded}">Information</h6>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular}; line-height: {typography.lineHeight.expanded}">
                {exerciseDetails.information} 
                </p>
            </div>
            <div class="exercise_description--section">
                <h6 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography.lineHeight.expanded}">Select model</h6>
                <CharacterSelect />
            </div>
            </div>
        </div>
        <!-- TODO: ALEXIS this will be a component later -->
        <div class="buttons">
            <div class="skip_btn">
            <Button cta="Skip" buttonType="secondary"/>
            </div>
            <HoldToComplete nextPage=""/>
        </div>
    {/if}
</div>

<style>
  h6, p{
    margin: 0;
  }
  .page_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    width: 100%;
  }
  .exercise_container--top {
    box-sizing: border-box;
    background: linear-gradient(to bottom, var(--color-purple-550), #6C5786); /*TODO: ALEXIS*/
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 515px;
    border-radius: 0 0 60px 60px;
    padding: 20px;
  }
  .exercise_nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .exercise_container-bottom {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 50vh;
    padding: 16px 24px;
  }
  .exercise_description {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
  }
  .exercise_description--section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 4px;
  }
  .exercise_description--section ol {
    margin: 0;
    padding: 0;
    list-style-position: inside;
  }
  .exercise_description--section p {
    color: var(--color-grey-400);
  }
  .exercise_description--section li {
    color: var(--color-grey-400);
    text-align: left;
  }
  .exercise_description--section li:not(:last-child) {
    margin-bottom: 16px;
  }
  .buttons {
    background: linear-gradient(to top, var(--color-grey-0) 60%, transparent);
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    height: 96px;
    flex-shrink: 0;
    padding-bottom: 16px;
  }
  .skip_btn{
    padding-left: 24px;
    width: 108px;
  }
</style>