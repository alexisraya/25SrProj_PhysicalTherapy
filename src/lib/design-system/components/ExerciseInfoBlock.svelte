<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  // Props for the exercise information
  export let exerciseName: string | null = null;
  export let sets: number | null = null;
  export let reps: number | null = null;
  export let weight: number | null = null;
  export let time: number | null = null;
  export let steps: number | null = null;
  export let equipment: string | null = null;

  // State variables
  let isEditing = false;
  let editedSets = sets;
  let editedReps = reps;
  let editedWeight = weight;
  let editedTime = time;
  let editedSteps = steps;

  console.log('Weight');
  console.log(weight);
  console.log('Time');
  console.log(time);
  console.log('sets');
  console.log(sets);
  console.log('reps');
  console.log(reps);
  console.log(editedSets);
  console.log('equipment');
  console.log(equipment);
  console.log(equipment != null);

  // Toggle edit mode
  function toggleEdit() {
    if (isEditing) {
      // Save the changes
      sets = editedSets;
      reps = editedReps;
      weight = editedWeight;
      time = editedTime;
      steps = editedSteps;
    } else {
      // Reset the edited values to current values
      editedSets = sets;
      editedReps = reps;
      editedWeight = weight;
      editedTime = time;
      editedSteps = steps;
    }

    isEditing = !isEditing;
  }

  // Handle the enter key press to save changes
  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      toggleEdit();
    }
  }
</script>

<div class="exercise_info">
  <button class="edit_btn" on:click={toggleEdit}>
    {#if isEditing}
      <RemixIcon name="check-fill" color="var(--color-blue-1100" size="15px" />
    {:else}
      <RemixIcon name="pencil-fill" color="var(--color-blue-1100" size="15px" />
    {/if}
  </button>
  <h5
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .h5}; font-weight: {typography.fontWeights.bold};"
  >
    {exerciseName}
  </h5>
  <div class="exercise_text--description">
    {#if isEditing}
      <!-- Editable view with labels -->
      <div class="edit-field">
        <input
          type="number"
          bind:value={editedSets}
          class="edit-input"
          on:keypress={handleKeyPress}
          min="1"
        />
        <span
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};">sets</span
        >
      </div>
      <div class="line"></div>
      <div class="edit-field">
        <input
          type="number"
          bind:value={editedReps}
          class="edit-input"
          on:keypress={handleKeyPress}
          min="1"
        />
        <span
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};">reps</span
        >
      </div>
      <div class="line"></div>
      {#if weight && weight != 0}
        <div class="edit-field">
          <input
            type="number"
            bind:value={editedWeight}
            class="edit-input"
            on:keypress={handleKeyPress}
            min="0"
          />
          <span
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .small}; font-weight: {typography.fontWeights.regular};">lbs</span
          >
        </div>
      {/if}
      {#if time && time != 0}
        <div class="edit-field">
          <input
            type="number"
            bind:value={editedTime}
            class="edit-input"
            on:keypress={handleKeyPress}
            min="0"
          />
          <span
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .small}; font-weight: {typography.fontWeights.regular};">secs</span
          >
        </div>
      {/if}
      {#if steps && steps != 0}
        <div class="edit-field">
          <input
            type="number"
            bind:value={editedSteps}
            class="edit-input"
            on:keypress={handleKeyPress}
            min="0"
          />
          <span
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .small}; font-weight: {typography.fontWeights.regular};">steps</span
          >
        </div>
      {/if}
      {#if equipment != null}
        <div class="line"></div>
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};"
        >
          {equipment}
        </p>
      {/if}
    {:else}
      <!-- Display view -->
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.regular};"
      >
        {sets} sets
      </p>
      <div class="line"></div>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.regular};"
      >
        {reps} reps
      </p>
      <div class="line"></div>
      {#if weight && weight != 0}
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};"
        >
          {weight}lbs
        </p>
      {/if}
      {#if time && time != 0}
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};"
        >
          {time} secs
        </p>
      {/if}
      {#if steps && steps != 0}
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};"
        >
          {steps} steps
        </p>
      {/if}
      {#if equipment != null}
        <div class="line equipment"></div>
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};"
        >
          {equipment}
        </p>
      {/if}
    {/if}
  </div>
</div>

<style>
  h5,
  p {
    margin: 0;
  }
  .exercise_info {
    position: relative;
    bottom: 15px;
    background: var(--color-grey-opactity-dark); /* light/dark mode exception */
    border-radius: 30px;
    color: var(--text-primary);
    padding: 12px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 268px;
    max-width: 80%;
  }
  .exercise_text--description {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 12px;
    height: 45px;
    text-align: center;
  }

  .line {
    border: 0.5px solid var(--exercise-info-divider);
    height: 28px;
  }
  .edit_btn {
    background-color: var(--color-grey-0); /* light/dark mode exception */
    border: none;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    position: absolute;
    right: 0px;
    top: 0px;
    cursor: pointer;
  }
  .edit-input {
    background: var(--color-grey-opactity-dark); /* light/dark mode exception */
    border: 0;
    border-radius: 4px;
    padding: 2px 4px;
    width: 14px;
    max-width: 26px;
    text-align: center;
    color: var(--text-primary);
  }
  .edit-field {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  /* Remove spinner buttons from number inputs */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>
