<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from "$stores/authStore";
    import { checkInStore } from '$stores/checkInStore';
    import CheckInPain from '$lib/design-system/components/CheckInPain.svelte';
    import CheckInMood from '$lib/design-system/components/CheckInMood.svelte';
    import Chart from '$lib/design-system/components/Chart.svelte';
    import { get } from 'svelte/store';
    import { getMoodDescription } from '$firebase/types/checkInType';

    let step = 1;
    let isSubmitting = false;
    let errorMessage = '';

    let userId: string | null = null;
    let hasCompletedToday = false;

    onMount(() => {
        console.log("Check-in page mounted");

        const unsubAuth = authStore.subscribe(state => {
            if (state.currentUser) {
                userId = state.currentUser.uid;
                console.log("Auth user ID:", userId);
                checkIfAlreadyCompleted();
            }
        });

        return () => unsubAuth();
    });

    async function checkIfAlreadyCompleted() {
        if (!userId) return;
        try {
            console.log("Checking if check-in is completed for user:", userId);
            await checkInStore.checkTodayStatus();
            hasCompletedToday = get(checkInStore).todayCompleted;
            console.log("Check-in completed today:", hasCompletedToday);
        } catch (err) {
            console.error("Error checking check-in status:", err);
            errorMessage = err instanceof Error ? err.message : "Unknown error";
        }
    }

    function handlePainSelection(event: CustomEvent<number>) {
        const painValue = event.detail;
        console.log("Pain level selected:", painValue);
        checkInStore.setPainLevel(painValue);
    }

    function handleMoodSelection(event: CustomEvent<number>) {
        const moodValue = event.detail;
        console.log("Mood selected:", moodValue);
        checkInStore.setMoodLevel(moodValue);
    }

    function nextStep() {
        if (step < 3) step++;
    }

    function prevStep() {
        if (step > 1) step--;
    }

    async function submitCheckIn() {
        if (!userId) {
            errorMessage = "Not logged in";
            return;
        }

        const storeState = get(checkInStore);
        if (storeState.currentCheckIn.painLevel === null || storeState.currentCheckIn.moodLevel === null) {
            errorMessage = "Please complete all selections";
            return;
        }

        console.log("Submitting check-in:", storeState.currentCheckIn);

        isSubmitting = true;

        try {
            const success = await checkInStore.submitCheckIn();
            if (success) {
                console.log("Check-in submitted successfully!");
                hasCompletedToday = true;
            } else {
                errorMessage = "Failed to submit check-in";
            }
        } catch (err) {
            console.error("Error submitting check-in:", err);
            errorMessage = err instanceof Error ? err.message : "Unknown error";
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="checkin-container">
    <h1>Daily Check-in</h1>

    {#if errorMessage}
        <div class="error-message">
            <p>{errorMessage}</p>
            <button on:click={() => errorMessage = ''}>Dismiss</button>
        </div>
    {/if}

    {#if hasCompletedToday}
        <div class="completed-message">
            <h2>You've completed your check-in for today!</h2>
            <p>Thanks for keeping track of your progress.</p>

            <div class="chart-container">
                <h3>Your Progress This Week</h3>
                <Chart />
            </div>
        </div>
    {:else}
        <div class="step-container">
            <div class="step-indicators">
                <div class="step {step >= 1 ? 'active' : ''}">1</div>
                <div class="step {step >= 2 ? 'active' : ''}">2</div>
                <div class="step {step >= 3 ? 'active' : ''}">3</div>
            </div>

            {#if step === 1}
                <div class="step-content">
                    <h2>How would you rate your pain level today?</h2>
                    <CheckInPain on:select={handlePainSelection} />

                    <div class="button-container">
                        <button on:click={nextStep}>Next</button>
                    </div>
                </div>
            {:else if step === 2}
                <div class="step-content">
                    <h2>How are you feeling today?</h2>
                    <CheckInMood on:select={handleMoodSelection} />

                    <div class="button-container">
                        <button on:click={prevStep}>Back</button>
                        <button on:click={nextStep}>Next</button>
                    </div>
                </div>
            {:else if step === 3}
                <div class="step-content">
                    <h2>Confirm your check-in</h2>

                    <p>Please review your answers before submitting:</p>
                    <div class="summary">
                        {#if get(checkInStore).currentCheckIn.painLevel !== null}
                            <p><strong>Pain Level:</strong> {get(checkInStore).currentCheckIn.painLevel}</p>
                        {:else}
                            <p><strong>Pain Level:</strong> Not selected</p>
                        {/if}

                        {#if get(checkInStore).currentCheckIn.moodLevel !== null}
                            <p><strong>Mood:</strong> {getMoodDescription(get(checkInStore).currentCheckIn.moodLevel)}</p>
                        {:else}
                            <p><strong>Mood:</strong> Not selected</p>
                        {/if}
                    </div>

                    <div class="button-container">
                        <button on:click={prevStep}>Back</button>
                        <button on:click={submitCheckIn} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .checkin-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }

    h1, h2, h3 {
        text-align: center;
    }

    .error-message {
        background-color: #ffebee;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .step-indicators {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 20px;
    }

    .step {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #e0e0e0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .step.active {
        background-color: #76D0D6;
        color: white;
    }

    .step-content {
        margin-top: 20px;
    }

    .button-container {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    button {
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        background-color: #76D0D6;
        color: white;
        cursor: pointer;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>