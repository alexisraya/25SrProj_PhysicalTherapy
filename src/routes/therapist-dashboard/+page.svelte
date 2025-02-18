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

    function handleRowClick(id) {
        goto(`/person/${id}`);
    }
</script>

<a href="/logout">Log Out</a>
<h1>Therapist Dashboard</h1>
{#if user && userData}
<h1>Welcome, {userData.displayName}!</h1>
{#if userData.injury}
<p>Injury: {userData.injury}</p>
{/if}
{#if userData.patients}
<h2>Patients:</h2>
<table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Injury</th>
        <th>Start Date</th>
        <th>Exercises</th>
      </tr>
    </thead>
    <tbody>
      {#each userData.patients as patient}
        <tr on:click={() => handleRowClick(patient.id)}>
            <td>{patient.name}</td>
            <td>{patient.injury}</td>
            <td>{patient.therapy_start_date.toDate().toDateString()}</td>
            <td>
                {#each patient.exercises as exercise}
                    <p>{exercise.title}, {exercise.reps}</p>
                {/each}
            </td>
        </tr>
      {/each}
    </tbody>
</table>
{/if}
{:else}
<p>Loading...</p>
{/if}

<style>
    table {
      border-collapse: collapse;
      width: 100%;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
    }

    tr {
      background-color: #ffffff;
    }
    tr:hover {
        background-color: lightgray;
        cursor: pointer;
    }
</style>