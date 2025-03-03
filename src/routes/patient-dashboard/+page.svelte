<script lang="ts">
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/helpers/firebase';
    import { authStore } from '$stores/authStore';
    import { doc, getDoc } from 'firebase/firestore';
    import type { User } from '$firebase/types/userType'
    import { checkAndResetProgress, getUserStats, getWeeklyProgress } from '$firebase/services/statService';
    import { getCurrentProgram } from '$firebase/services/programService';

    import { goto } from '$app/navigation';
    import { typography } from '$lib/design-system';
    import PlayButton from '$lib/assets/iconography/PlayButton.svg';
    import Streak from '$lib/assets/iconography/Streak.svg';
    import homeBackgroundLarge from '$lib/assets/background-images/home-background-large.svg';
    import homeBackgroundSmall from '$lib/assets/background-images/home-background-small.svg';
    import Chart from '$lib/design-system/components/Chart.svelte';
    import UserExerciseView from '$lib/design-system/components/UserExerciseView.svelte';

    let user = null;
    let userData = null;
    let program = null;
    let stats = null;
    let weeklyProgress = null
    let loading = true;

    onMount(async () => {
        if ($authStore.currentUser) {
            await checkAndResetProgress($authStore.currentUser.uid);
        }
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

    /* Sab Commented this out for now  */

    // onMount(() => {
    //     const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
    //         if (authUser) {
    //             try {
    //                 user = authUser;
    //                 await checkAndResetProgress(user.uid);

    //                 const userDoc = await getDoc(doc(db, 'users', user.uid));
    //                 if (userDoc.exists()) {
    //                     userData = userDoc.data();
    //                     if (userData.isTherapist) {
    //                         goto('/therapist-dashboard');
    //                         return;
    //                     }
    //                     [program, stats, weeklyProgress] = await Promise.all([
    //                         getCurrentProgram(user.uid),
    //                         getUserStats(user.uid),
    //                         getWeeklyProgress(user.uid)
    //                     ]);
    //                     console.log("User data loaded:", userData);
    //                 } else {
    //                     console.error("User document not found");
    //                 }
    //             } catch (err) {
    //                 console.error("Error loading dashboard data:", err);
    //             } finally {
    //                 loading = false;
    //             }
    //         } else {
    //             goto('/login');
    //         }
    //     });
        
    //     return unsubscribe;
    // });
</script>

{#if user && userData}
<div class="header-container">
    <img class="background-wave" src={homeBackgroundSmall} alt="background wave"/>
    <div class="cta-container">
        <h2 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h2}; font-weight: {typography.fontWeights.regular};">Hi {userData.firstName}!</h2>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.light}; padding-bottom: 3px;">Start your program for today</p>
        <a href='/your-program'>
            <img src={PlayButton} />
        </a>
    </div>
</div>
<div class="body-container">
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
    <div class="break"/>
    <div class="metrics-container">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.medium};">Weekly Metrics</p>
        <Chart />
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
    .break {
        position: relative;
        width: 100vw;
        height: 8px;
        background-color: var(--color-blue-50);
    }
    .background-wave {
        /* position: absolute;
        top: 0;
        transform: translateY(-50%);
        z-index: -1; */
        position: absolute;
        top: -75%;
        left: 50%;
        transform: translateX(-50%);
        z-index: -1;
        width: 562px;
    }
    .header-container {
        /* width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center; */
        position: relative;
        width: 100%;
        /* height: 400px; */
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding-top: 40px;
    }
    .body-container {
        margin: 16px 16px 0 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-items: center;
        row-gap: 8px;
    }
    .program-streak-container {
        width: 100%;
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
        row-gap: 8px;
    }
    .streak-item--rect {
        height: 12px;
        width: 100%;
        background-color: var(--color-purple-200);
        border-radius: 4px;
    }
    .day-one {
        background-color: var(--color-purple-600);
    }

    .metrics-container {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        align-items: flex-start;
    }
    @media (min-width: 505px) {
        .background-wave {
            content: url('/background-images/home-background-large.svg');
            width: 2258px;
            top: -125%;
        }
    }
</style>