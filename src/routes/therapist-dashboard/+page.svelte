<script lang="ts">
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/helpers/firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import { goto } from '$app/navigation';

    let therapist = null;
    let therapistData = null;
    let patientsData = [];

    onMount(async () => {
        auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                const therapistDoc = await getDoc(doc(db, 'therapists', authUser.uid));

                if (therapistDoc.exists()) {
                    therapistData = therapistDoc.data();
                    therapist = authUser;

                    // Fetch patient details
                    patientsData = await Promise.all(
                        therapistData.patients.map(async (patientId) => {
                            const patientDoc = await getDoc(doc(db, 'users', patientId));
                            return patientDoc.exists() ? patientDoc.data() : null;
                        })
                    );
                    patientsData = patientsData.filter(Boolean);
                } else {
                    console.warn("Therapist not found, redirecting to login.");
                    goto('/login');
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
{#if therapistData}
    <h1>Welcome, {therapistData.firstName} {therapistData.lastName}!</h1>
    <h2>Your Patients</h2>

    {#if patientsData.length > 0}
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
                {#each patientsData as patient}
                    <tr on:click={() => handleRowClick(patient.userId)}>
                        <td>{patient.firstName} {patient.lastName}</td>
                        <td>{patient.injury || "N/A"}</td>
                        <td>{patient.startDate || "N/A"}</td>
                        <td>
                            {#each patient.exercises as exercise}
                                <p>{exercise.exerciseName}</p>
                            {/each}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p>No patients assigned yet.</p>
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