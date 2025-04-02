<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { checkInStore, checkInValid } from '$stores/checkInStore';
  import CheckInPain from '$lib/design-system/components/CheckInPain.svelte';
  import CheckInMood from '$lib/design-system/components/CheckInMood.svelte';
  import { get } from 'svelte/store';
  import { getPainDescription, getMoodDescription } from '$firebase/types/checkInType';

  let currentStep = 1;
  let isSubmitting = false;
  let errorMsg = '';
  let showSuccess = false;

  // Check if user has already completed check-in for today
  let checkInCompleted = false;

  onMount(() => {
    const unsubAuth = authStore.subscribe((state) => {
      if (state.userId) {
        loadCheckInStatus();
      }
    });

    return unsubAuth;
  });

  async function loadCheckInStatus() {
    try {
      await checkInStore.checkTodayStatus();
      checkInCompleted = get(checkInStore).todayCompleted;

      if (checkInCompleted) {
        // Load stats for the week if check-in is already completed
        await checkInStore.loadStats('week');
      }
    } catch (err) {
      console.error('Error checking check-in status:', err);
      errorMsg = err instanceof Error ? err.message : 'Failed to load check-in status';
    }
  }

  async function handleSubmit() {
    if (!get(checkInValid)) {
      errorMsg = 'Please complete both pain and mood selections';
      return;
    }

    isSubmitting = true;
    errorMsg = '';

    try {
      const success = await checkInStore.submitCheckIn();
      if (success) {
        showSuccess = true;
        checkInCompleted = true;
        // Load stats after successful submission
        await checkInStore.loadStats('week');
      } else {
        errorMsg = 'Failed to submit check-in';
      }
    } catch (err) {
      console.error('Error submitting check-in:', err);
      errorMsg = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    checkInStore.resetForm();
    errorMsg = '';
    showSuccess = false;
    checkInCompleted = false;
  }
</script>

<div class="test-container">
  <h1>Check-in Testing Page</h1>
  <p class="subtitle">Testing Firebase integration with Check-in components</p>

  {#if errorMsg}
    <div class="error-box">
      <p>{errorMsg}</p>
      <button on:click={() => (errorMsg = '')}>Dismiss</button>
    </div>
  {/if}

  {#if checkInCompleted}
    <div class="completed-box">
      <h2>Check-in completed for today</h2>
      <p>You've already submitted your daily check-in</p>

      {#if get(checkInStore).stats}
        <div class="stats-box">
          <h3>Your Recent Stats</h3>
          <p>
            <strong>Average Pain Level:</strong>
            {get(checkInStore).stats?.averagePainLevel?.toFixed(1) || '0.0'}
          </p>
          <p>
            <strong>Average Mood Level:</strong>
            {get(checkInStore).stats?.averageMoodLevel?.toFixed(1) || '0.0'}
            ({getMoodDescription(Math.round(get(checkInStore).stats?.averageMoodLevel || 0))})
          </p>
          <p>
            <strong>Check-ins Recorded:</strong>
            {get(checkInStore).stats?.checkIns?.length || 0}
          </p>
        </div>
      {/if}

      <button on:click={resetForm}>Reset (Testing Only)</button>
    </div>
  {:else if showSuccess}
    <div class="success-box">
      <h2>Check-in Submitted Successfully!</h2>
      <p>Thank you for tracking your progress today.</p>
      <button on:click={resetForm}>Reset (Testing Only)</button>
    </div>
  {:else}
    <div class="check-in-form">
      <div class="steps-container">
        <div class="steps-header">
          <button class={currentStep === 1 ? 'active' : ''} on:click={() => (currentStep = 1)}
            >Pain Assessment</button
          >
          <button class={currentStep === 2 ? 'active' : ''} on:click={() => (currentStep = 2)}
            >Mood Assessment</button
          >
          <button class={currentStep === 3 ? 'active' : ''} on:click={() => (currentStep = 3)}
            >Review</button
          >
        </div>

        <div class="step-content">
          {#if currentStep === 1}
            <div class="pain-step">
              <h2>How would you rate your knee pain level today?</h2>
              <p class="details">
                This rating will be tracked on the Progress page so you can see how you’re improving
                over time.
              </p>
              <CheckInPain />
              <div class="nav-buttons">
                <button on:click={() => (currentStep = 2)}>Next</button>
              </div>
            </div>
          {:else if currentStep === 2}
            <div class="mood-step">
              <h2>How are you feeling about your recovery today?</h2>
              <CheckInMood />
              <div class="nav-buttons">
                <button on:click={() => (currentStep = 1)}>Back</button>
                <button on:click={() => (currentStep = 3)}>Next</button>
              </div>
            </div>
          {:else if currentStep === 3}
            <div class="review-step">
              <h2>Review Your Check-in</h2>
              <div class="summary-box">
                <div class="summary-item">
                  <h3>Pain Level</h3>
                  {#if get(checkInStore).currentCheckIn.painLevel !== null}
                    <p class="selected-value">{get(checkInStore).currentCheckIn.painLevel}</p>
                    <p class="description">
                      {(() => {
                        const painLevel = get(checkInStore).currentCheckIn.painLevel;
                        return painLevel !== null ? getPainDescription(painLevel) : '';
                      })()}
                    </p>
                  {:else}
                    <p class="not-selected">Not selected</p>
                  {/if}
                </div>

                <div class="summary-item">
                  <h3>Mood</h3>
                  {#if get(checkInStore).currentCheckIn.moodLevel !== null}
                    <p class="selected-value">{get(checkInStore).currentCheckIn.moodLevel}</p>
                    <p class="description">
                      {(() => {
                        const moodLevel = get(checkInStore).currentCheckIn.moodLevel;
                        return moodLevel !== null ? getMoodDescription(moodLevel) : '';
                      })()}
                    </p>
                  {:else}
                    <p class="not-selected">Not selected</p>
                  {/if}
                </div>
              </div>

              <div class="nav-buttons">
                <button on:click={() => (currentStep = 2)}>Back</button>
                <button
                  class="submit-button"
                  on:click={handleSubmit}
                  disabled={isSubmitting || !get(checkInValid)}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .test-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  h1 {
    margin-bottom: 5px;
  }

  .subtitle {
    color: #666;
    margin-top: 0;
    margin-bottom: 30px;
  }

  .steps-header {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
  }

  .steps-header button {
    background: none;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    opacity: 0.7;
  }

  .steps-header button.active {
    border-bottom: 3px solid #76d0d6;
    opacity: 1;
    font-weight: bold;
  }

  .nav-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }

  button {
    padding: 10px 16px;
    background-color: #76d0d6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-box {
    background-color: #ffebee;
    border-left: 4px solid #f44336;
    padding: 10px 15px;
    margin-bottom: 20px;
    border-radius: 4px;
  }

  .completed-box,
  .success-box {
    background-color: #e8f5e9;
    border-left: 4px solid #4caf50;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 4px;
  }

  .stats-box {
    background-color: white;
    padding: 15px;
    border-radius: 4px;
    margin: 15px 0;
  }

  .details {
    color: #666;
    font-style: italic;
    margin-bottom: 20px;
  }

  .summary-box {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 20px 0;
  }

  .summary-item {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    flex: 1;
    min-width: 200px;
  }

  .summary-item h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }

  .selected-value {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
  }

  .description {
    margin-top: 5px;
    color: #555;
  }

  .not-selected {
    color: #999;
    font-style: italic;
  }

  .submit-button {
    background-color: #4caf50;
  }

  .pain-step,
  .mood-step,
  .review-step {
    padding: 10px 0;
  }
</style>
