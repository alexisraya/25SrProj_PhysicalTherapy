<script lang="ts">
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/helpers/firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import { goto } from '$app/navigation';
    import { typography } from '$lib/design-system';

    let user = null;
    let userData = null;

    onMount(async () => {
        auth.onAuthStateChanged(async (authUser) => {
        if (authUser) {
            user = authUser;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                userData = userDoc.data();
                if (userData.isTherapist) {
                    goto('/therapist-dashboard');
                }
                console.log(userData.exercises);
            }
        } else {
            goto('/login');
        }
        });
    });
</script>

{#if user && userData}
<div class="header-container">
    <div class="cta-container">
        <h2 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h2};">Hi {userData.displayName}!</h2>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular};">Start your program for today</p>
        <button>
            Play Button
        </button>
    </div>
    <div class="program-streak-container">
        <div class="program-streak-container--title">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Weekly program streak</p>
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">4 Icon</p>
        </div>
    </div>
</div>
{:else}
<p>Loading...</p>
{/if}

<style>
    .header-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .program-streak-container--title {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
</style>