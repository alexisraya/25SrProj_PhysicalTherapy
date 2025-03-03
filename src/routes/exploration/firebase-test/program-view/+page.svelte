<script lang="ts">
    import { onMount } from "svelte";
    import { authStore } from "$stores/authStore";
    import { checkAndResetProgress } from "$firebase/services/statService";
    import UserExerciseView from "$lib/design-system/components/UserExerciseView.svelte";

    let loading = true;
    let error: string | null = null;

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (store) => {
            if (!store.isLoading && store.currentUser) {
                try {
                    // Just run the check and reset - UserExerciseView will handle the rest
                    await checkAndResetProgress(store.currentUser.uid);
                    loading = false;
                } catch (err) {
                    console.error("Error checking daily progress:", err);
                    error =
                        err instanceof Error
                            ? err.message
                            : "An unknown error occurred";
                    loading = false;
                }
            }
        });

        return unsubscribe;
    });
</script>

<div class="program-container">
    {#if loading}
        <p>Loading program...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <UserExerciseView />
    {/if}
</div>

<style>
    .program-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    h1 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .error {
        color: #ef4444;
        padding: 1rem;
        background-color: #fee2e2;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
</style>
