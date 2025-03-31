<script lang="ts">
  import type { Page } from '@sveltejs/kit';
  import { typography } from '$lib/design-system';
  import ExerciseModel from '$lib/design-system/components/ExerciseModel.svelte';
  import LeftArrow from '$lib/assets/iconography/LeftArrow.svg';
  import Button from '$lib/design-system/components/Button.svelte';
  import HoldToComplete from '$lib/design-system/components/HoldToComplete.svelte';
  import ProgressBar from '$lib/design-system/components/ProgressBar.svelte';
  import CharacterSelect from '$lib/design-system/components/CharacterSelect.svelte';
  import ExerciseInfoBlock from '$lib/design-system/components/ExerciseInfoBlock.svelte';
  import { onDestroy, onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$stores/authStore';
  import { getCurrentProgram, moveExerciseToEnd } from '$firebase/services/programService';
  import { completeExercise, skipExercise } from '$firebase/services/userexerciseService';
  import { getUserStats, checkAndResetProgress } from '$firebase/services/statService';
  import type { Program, UserStats, AssignedExercise } from '$firebase/types/userType';
  import type { Exercise } from '$firebase/types/exerciseType';
  import { getExercise } from '$firebase/services/exerciseService';
  import { derived, get } from 'svelte/store';
  import Interstital from '$lib/design-system/components/Interstital.svelte';
  import DownArrow from '$lib/assets/iconography/DownArrow.svg';
  import InstructionsIcon from '$lib/assets/iconography/InstructionsIcon.svg';
  import InformationIcon from '$lib/assets/iconography/InformationIcon.svg';
  import ModificationsIcon from '$lib/assets/iconography/ModificationsIcon.svg';
  import SelectModelIcon from '$lib/assets/iconography/SelectModelIcon.svg';
  import { browser } from '$app/environment';
  import SkipModal from '$lib/design-system/components/SkipModal.svelte';

  let currentExercise: AssignedExercise | null = null;
  let program: Program | null = null;
  let stats: UserStats | null = null;
  let exerciseDetails: Exercise | null = null;
  let exerciseInstructions: string | null = null;
  let completedExercises: number | null = null;
  let loading = true;
  let error: string | null = null;
  let showInterstitial = false;
  let interstitialType: string | null = null;

  let adjustedValues = {
    sets: 0,
    reps: 0,
    steps: 0,
    seconds: 0,
    weight: 0,
  };

  let sectionsOpen = {
    instructions: true,
    information: false,
    modifications: false,
    modelSelect: false,
  };

  let detailsInitialized = false;
  let modalOpen: boolean = false;

  function initializeDetails() {
    if (browser) {
      // Use a short timeout to let Svelte complete its initial rendering
      setTimeout(() => {
        detailsInitialized = true;

        // Add the 'initialized' class to all details elements
        const detailsElements = document.querySelectorAll('.exercise_description--section');
        detailsElements.forEach((el) => {
          el.classList.add('initialized');
        });
      }, 50);
    }
  }

  function parseInstructions(text: string) {
    return text.split(/\d+\.\s/).filter((step) => step.trim() !== '');
  }

  async function loadExercise(exerciseId: string | undefined) {
    if (!exerciseId) {
      console.error('No exercise ID provided.');
      return;
    }

    loading = true;
    error = null;

    try {
      if (!$authStore.currentUser) return;
      await checkAndResetProgress($authStore.currentUser.uid);

      const [programData, statsData, exerciseData] = await Promise.all([
        getCurrentProgram($authStore.currentUser.uid),
        getUserStats($authStore.currentUser.uid),
        getExercise(exerciseId),
      ]);

      program = programData;
      stats = statsData;
      exerciseDetails = exerciseData;
      exerciseInstructions = parseInstructions(exerciseData?.instructions);
      completedExercises = program?.exercises?.filter((ex) => ex.completed).length ?? 0;

      currentExercise = program?.exercises?.find((ex) => ex.exerciseId === exerciseId) ?? null;

      if (!currentExercise) {
        error = 'Exercise not found in your program';
        console.error(error);
        return;
      }

      adjustedValues = { ...currentExercise };
    } catch (err) {
      console.error('Error loading exercise:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred';
    } finally {
      console.log('CURRENT EXERCISE REPS');
      console.log(currentExercise?.reps);
      console.log(adjustedValues);
      loading = false;
    }
  }

  // Fix: Reactively update exercise when navigating
  const pageSubscription = derived(page, ($page) => {
    if ($page.params && $page.params.exerciseId) {
      loadExercise($page.params.exerciseId);
    }
  }).subscribe(() => {}); // Add this subscription

  onDestroy(() => {
    if (pageSubscription) pageSubscription(); // Cleanup subscription
  });

  onMount(() => {
    const $currentPage = get(page) as Page;
    if ($currentPage.params?.exerciseId) {
      loadExercise($currentPage.params.exerciseId);
    }

    initializeDetails();
  });

  function openModal(): void {
    modalOpen = true;
  }

  async function handleAddToEnd() {
    if (!$authStore.currentUser || !currentExercise) {
      error = 'No exercise selected.';
      return;
    }

    try {
      modalOpen = false;
      interstitialType = 'skipped';
      showInterstitial = true;

      const nextExerciseId = await moveExerciseToEnd(
        $authStore.currentUser.uid,
        currentExercise.exerciseId
      );

      program = await getCurrentProgram($authStore.currentUser.uid);
      completedExercises = program?.exercises?.filter((ex) => ex.completed).length ?? 0;

      if (nextExerciseId) {
        goto(`/your-program/${nextExerciseId}`);
      } else {
        goto('/your-program/interstital');
      }
    } catch (err) {
      console.error('Error handling exercise:', err);
      error = err instanceof Error ? err.message : 'Failed to process exercise';
    } finally {
      interstitialType = null;
      showInterstitial = false;
    }
  }

  async function handleSkip() {
    if (!$authStore.currentUser || !currentExercise) {
      error = 'No exercise selected.';
      return;
    }

    try {
      modalOpen = false;
      interstitialType = 'too-painful';
      showInterstitial = true;
      // Update Firebase
      await skipExercise($authStore.currentUser.uid, currentExercise.exerciseId);

      // Explicitly refresh the program data before navigating
      program = await getCurrentProgram($authStore.currentUser.uid);
      completedExercises = program?.exercises?.filter((ex) => ex.completed).length ?? 0;

      await navigateToNext();
    } catch (err) {
      console.error('Error skipping exercise:', err);
      error = err instanceof Error ? err.message : 'Failed to skip exercise';
    } finally {
      interstitialType = null;
      showInterstitial = false;
    }
  }

  async function handleComplete() {
    if (!$authStore.currentUser || !currentExercise) {
      error = 'No exercise selected.';
      return;
    }

    try {
      // Check if this is the last exercise before showing any interstitial
      program = await getCurrentProgram($authStore.currentUser.uid);
      const remainingExercises =
        program?.exercises?.filter(
          (ex) => !ex.completed && !ex.skipped && ex.exerciseId !== currentExercise.exerciseId
        ).length ?? 0;
      const isLastExercise = remainingExercises === 0;

      // If it's the last exercise, don't show interstitial here
      // Just complete the exercise and navigate directly
      if (!isLastExercise) {
        interstitialType = 'completed';
        showInterstitial = true;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      console.log('Before completing exercise:', currentExercise.exerciseId);

      // Update Firebase
      await completeExercise(
        $authStore.currentUser.uid,
        currentExercise.exerciseId,
        adjustedValues
      );

      console.log('After completing exercise, fetching updated program');

      // Explicitly refresh the program data before navigating
      program = await getCurrentProgram($authStore.currentUser.uid);
      console.log('Updated program:', program);

      completedExercises = program?.exercises?.filter((ex) => ex.completed).length ?? 0;
      console.log('Completed exercises count:', completedExercises);

      await navigateToNext();
    } catch (err) {
      console.error('Error completing exercise:', err);
      error = err instanceof Error ? err.message : 'Failed to complete exercise';
    } finally {
      interstitialType = null;
      showInterstitial = false;
    }
  }

  async function navigateToNext() {
    if (!$authStore.currentUser || !currentExercise) return;

    try {
      program = await getCurrentProgram($authStore.currentUser.uid);
      if (!program || !program.exercises.length) {
        goto('/your-program');
        return;
      }

      const nextExercise = program.exercises.find((ex) => !ex.completed && !ex.skipped);
      if (nextExercise) {
        goto(`/your-program/${nextExercise.exerciseId}`);
        await tick(); // Ensures UI updates
      } else {
        // If we're here, all exercises are completed or skipped
        // Go directly to the final interstitial
        goto('/your-program/interstital');
      }
    } catch (err) {
      console.error('Error navigating to next exercise:', err);
    }
  }
</script>

<div class="page_container">
  {#if showInterstitial}
    <Interstital interstitalType={interstitialType} />
  {:else if program && currentExercise && exerciseDetails}
    <div class="exercise_container--top">
      <div class="exercise_nav">
        <a href="/your-program" class="back-button--link">
          <img class="back_button" src={LeftArrow} alt="left arrow" />
        </a>

        <ProgressBar totalExercises={program.exercises.length} {completedExercises} />
      </div>
      <!-- <ExerciseModel modelPath="/models/TestGLTF01/Test01.gltf" /> -->
      <!-- <ExerciseModel modelPath="/models/test01.glb" /> -->
      <!-- <ExerciseModel modelPath="/meditation_pose_female.glb" /> -->
      <ExerciseModel modelPath="/models/SmallTest2.glb" />
      <ExerciseInfoBlock
        exerciseName={currentExercise.exerciseName}
        sets={adjustedValues.sets}
        reps={adjustedValues.reps}
        time={adjustedValues.seconds}
        steps={adjustedValues.steps}
        weight={adjustedValues.weight}
        equipment={currentExercise.equipment}
      />
    </div>
    <div class="exercise_container-bottom">
      <div class="exercise_description">
        <details
          class="exercise_description--section {detailsInitialized ? 'initialized' : ''}"
          bind:open={sectionsOpen.instructions}
        >
          <summary>
            <div class="exercise_description--title">
              <img src={InstructionsIcon} alt="Instructions Icon" />
              <h6
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography
                  .lineHeight.expanded}"
              >
                Instructions
              </h6>
            </div>
            <img src={DownArrow} alt="toggle arrow" class="arrow-icon" />
          </summary>
          <div class="content-wrapper">
            <ol>
              {#each exerciseInstructions as instruction}
                <li
                  style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                    .regular}; font-weight: {typography.fontWeights
                    .regular}; line-height: {typography.lineHeight.expanded}"
                >
                  {instruction}
                </li>
              {/each}
            </ol>
          </div>
        </details>
        <details
          class="exercise_description--section {detailsInitialized ? 'initialized' : ''}"
          bind:open={sectionsOpen.information}
        >
          <summary>
            <div class="exercise_description--title">
              <img src={InformationIcon} alt="Information Icon" />
              <h6
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography
                  .lineHeight.expanded}"
              >
                Information
              </h6>
            </div>
            <img src={DownArrow} alt="toggle arrow" class="arrow-icon" />
          </summary>
          <div class="content-wrapper">
            <p
              style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                .regular}; font-weight: {typography.fontWeights.regular}; line-height: {typography
                .lineHeight.expanded}"
            >
              {exerciseDetails.information}
            </p>
          </div>
        </details>
        <details
          class="exercise_description--section {detailsInitialized ? 'initialized' : ''}"
          bind:open={sectionsOpen.modifications}
        >
          <summary>
            <div class="exercise_description--title">
              <img src={ModificationsIcon} alt="Modifications Icon" />
              <h6
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography
                  .lineHeight.expanded}"
              >
                Modifications
              </h6>
            </div>
            <img src={DownArrow} alt="toggle arrow" class="arrow-icon" />
          </summary>
          <div class="content-wrapper">
            <!-- TODO: ALEXIS CHANGE TO PULL FROM BE ONCE UPDATED -->
            <p
              style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                .regular}; font-weight: {typography.fontWeights.regular}; line-height: {typography
                .lineHeight.expanded}"
            >
              This is an example of a suggested modification, they're all pretty short.
            </p>
          </div>
        </details>
        <details
          class="exercise_description--section {detailsInitialized ? 'initialized' : ''}"
          bind:open={sectionsOpen.modelSelect}
        >
          <summary>
            <div class="exercise_description--title">
              <img src={SelectModelIcon} alt="Select Model Icon" />
              <h6
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography
                  .lineHeight.expanded}"
              >
                Select model
              </h6>
            </div>
            <img src={DownArrow} alt="toggle arrow" class="arrow-icon" />
          </summary>
          <div class="content-wrapper character-content">
            <CharacterSelect />
          </div>
        </details>
      </div>
    </div>
    <div class="buttons">
      <div class="skip_btn">
        <Button cta="Skip" buttonType="secondary" onClickFunc={openModal} />
      </div>
      <HoldToComplete nextPage="" navigateFunc={handleComplete} />
    </div>
    <SkipModal bind:open={modalOpen} handleTooPainful={handleSkip} {handleAddToEnd} />
  {/if}
</div>

<style>
  h6,
  p {
    margin: 0;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary {
    list-style: none;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin-bottom: 14px;
  }
  .arrow-icon {
    transition: transform 0.3s ease;
  }

  details[open] .arrow-icon {
    transform: rotate(180deg);
  }

  /* Use a CSS custom property to control visibility before JavaScript runs */
  :root {
    --details-initialized: 0;
  }

  .back-button--link {
    display: inline-flex;
  }

  /* Hide all content-wrappers initially to prevent flash */
  .exercise_description--section {
    visibility: hidden;
  }

  /* Once JavaScript loads, this class will be added */
  .exercise_description--section.initialized {
    visibility: visible;
  }

  .content-wrapper {
    overflow: hidden;
    max-height: 0;
    transition:
      max-height 0.4s ease-out,
      opacity 0.4s ease-out,
      transform 0.4s ease-out;
    opacity: 0;
    transform: translateY(-10px);
  }

  details[open] .content-wrapper {
    max-height: 500px; /* Adjust based on your content size */
    opacity: 1;
    transform: translateY(0);
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
    background: linear-gradient(to bottom, var(--color-purple-550), #6c5786); /*TODO: ALEXIS*/
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 515px;
    border-radius: 0 0 44px 44px;
    padding: 20px 20px 0px 20px;
  }
  /* Rest of your styles remain the same */
  .exercise_nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .exercise_container-bottom {
    width: 100%;
  }
  .exercise_description {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    padding: 16px 24px;
  }
  .exercise_description--section {
    width: 100%;
  }
  .content-wrapper ol {
    margin: 0;
    padding: 0;
    list-style-position: inside;
  }
  .content-wrapper p {
    color: var(--color-grey-400);
  }
  .content-wrapper li {
    color: var(--color-grey-400);
    text-align: left;
  }
  .character-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .exercise_description--section li:not(:last-child) {
    margin-bottom: 16px;
  }
  .exercise_description--title {
    display: inline-flex;
    align-items: center;
    column-gap: 12px;
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
  .skip_btn {
    padding-left: 24px;
    width: 108px;
  }
</style>
