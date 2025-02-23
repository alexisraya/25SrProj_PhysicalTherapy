<script lang="ts">
    import { onMount } from 'svelte';
    import { getUser, completeProgram } from '$firebase/userService';
    import { authStore } from '$stores/authStore';
    import { goto } from '$app/navigation';

    let isProcessing = true;
    let error: string | null = null;

    onMount(async () => {
        if (!$authStore.currentUser) {
            goto('/login');
            return;
        }

        try {
            await completeProgram($authStore.currentUser.uid);
            isProcessing = false;
        } catch (err) {
            console.error('Error completing program:', err);
            error = "Error completing program";
            isProcessing = false;
        }
    });

    function handleReturn() {
        goto('/exploration/firebase-test/user-database');
    }
</script>

<div class="completion-container">
    {#if isProcessing}
        <p>Finalizing your program...</p>
    {:else if error}
        <div class="error">
            <p>{error}</p>
            <button on:click={handleReturn}>Return to Dashboard</button>
        </div>
    {:else}
        <div class="success">
            <h1>Program Complete!</h1>
            <p>Great job completing your exercises!</p>
            <button on:click={handleReturn}>Return to Dashboard</button>
        </div>
    {/if}
</div>

<style>
    .completion-container {
        max-width: 600px;
        margin: 4rem auto;
        text-align: center;
        padding: 2rem;
    }

    .success h1 {
        color: #059669;
        margin-bottom: 1rem;
    }

    .error {
        color: #dc2626;
    }

    button {
        margin-top: 2rem;
        padding: 0.75rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }

    button:hover {
        background-color: #2563eb;
    }
</style>