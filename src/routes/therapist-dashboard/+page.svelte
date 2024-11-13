<script lang="ts">
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/helpers/firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import { goto } from '$app/navigation';

    let user = null;
    let userData = null;

    onMount(async () => {
        auth.onAuthStateChanged(async (authUser) => {
        if (authUser) {
            user = authUser;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                userData = userDoc.data();
                if (!userData.isTherapist) {
                    goto('/patient-dashboard');
                }
            }
        } else {
            goto('/login');
        }
        });
    });
</script>
  
<h1>Therapist Dashboard</h1>
{#if user && userData}
<h1>Welcome, {userData.displayName}!</h1>
{#if userData.injury}
<p>Injury: {userData.injury}</p>
{/if}
{#if userData.exercises}
<p>Exercises: {userData.exercises}</p>
{/if}
{:else}
<p>Loading...</p>
{/if}