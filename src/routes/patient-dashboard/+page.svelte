<script lang="ts">
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/helpers/firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import { goto } from '$app/navigation';
    import { typography } from '$lib/design-system';
    import PlayButton from '$lib/assets/iconography/PlayButton.svg';
    import Streak from '$lib/assets/iconography/Streak.svg';

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
        <h2 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h2}; font-weight: {typography.fontWeights.regular};">Hi {userData.firstName}!</h2>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.light};">Start your program for today</p>
        <button>
            <img src={PlayButton} />
        </button>
    </div>
    <div class="program-streak-container">
        <div class="program-streak-container--title">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Weekly program streak</p>
            <span class="program-title--streak"><p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">4</p> <img src={Streak} /> </span>
        </div>
        <div class="program-streak-container--streaks">
            <div class="streak-item">
                <div class="streak-item--rect day-one"></div>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic">Day 1</p>
            </div>
            <div class="streak-item">
                <div class="streak-item--rect"></div>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">Day 2</p>
            </div>
            <div class="streak-item">
                <div class="streak-item--rect"></div>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">Day 3</p>
            </div>
            <div class="streak-item">
                <div class="streak-item--rect"></div>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">Day 4</p>
            </div>
            <div class="streak-item">
                <div class="streak-item--rect"></div>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">Day 5</p>
            </div>
        </div>
    </div>
</div>
{:else}
<p>Loading...</p>
{/if}

<style>
    p {
        margin: 0;
    }
    button {
        background-color: transparent;
        border: none;
    }
    .header-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .program-streak-container {
        width: 100%;
        padding: 15px 14px 8px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 12px;
    }
    .program-streak-container--title {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .program-title--streak {
        display: flex;
        column-gap: 4px;
    }
    .program-streak-container--streaks {
        width: 100%;
        /* display: flex;
        justify-content: space-between; */
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        column-gap: 2px;
    }
    .streak-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        column-gap: 8px;
    }
    .streak-item--rect {
        height: 12px;
        width: 100%;
        background-color: #E9DDF9;
        border-radius: 4px;
    }
    .day-one {
        background-color: #9E80C5;
    }
</style>