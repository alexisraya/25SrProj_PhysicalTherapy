<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getTherapist, type Therapist } from '$firebase/services/therapistService';
  import { getUser } from '$firebase/services/userService';
  import { goto } from '$app/navigation';
  import type { User as FirebaseUser } from 'firebase/auth';

  let therapist: FirebaseUser | null = null;
  let therapistData: Therapist | null = null;
  let patients: Array<{
    id: string;
    name: string;
    startDate: string;
  }> = [];
  let loading = true;
  let debugInfo = {
    therapistId: '',
    patientIds: [] as string[],
    errors: [] as string[],
  };

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        goto('/login');
        return;
      }

      try {
        therapist = authUser;
        debugInfo.therapistId = authUser.uid;
        console.log('Therapist auth ID:', authUser.uid);

        const fetchedTherapistData = await getTherapist(authUser.uid);
        console.log('Fetched therapist data:', fetchedTherapistData);

        if (fetchedTherapistData) {
          therapistData = fetchedTherapistData;

          if (therapistData.patients) {
            debugInfo.patientIds = [...therapistData.patients];
            console.log('Patient IDs from therapist:', therapistData.patients);
          } else {
            console.log('No patients array found in therapist data');
            debugInfo.errors.push('No patients array in therapist data');
          }

          if (therapistData.patients && therapistData.patients.length > 0) {
            const patientPromises = therapistData.patients.map(async (patientId) => {
              try {
                console.log('Fetching patient:', patientId);
                const patientData = await getUser(patientId);
                console.log('Patient data for', patientId, ':', patientData);

                if (patientData) {
                  return {
                    id: patientId,
                    name: `${patientData.firstName} ${patientData.lastName}`,
                    startDate: patientData.createdAt,
                  };
                }
                debugInfo.errors.push(`Patient ${patientId} not found`);
                return null;
              } catch (err) {
                console.error(`Error fetching patient ${patientId}:`, err);
                debugInfo.errors.push(`Error fetching patient ${patientId}: ${err}`);
                return null;
              }
            });

            const fetchedPatients = (await Promise.all(patientPromises)).filter(Boolean) as Array<{
              id: string;
              name: string;
              startDate: string;
            }>;

            console.log('Fetched patients:', fetchedPatients);
            patients = fetchedPatients;
          }
        } else {
          console.error('No therapist data found');
          debugInfo.errors.push('No therapist data found');
        }
      } catch (error) {
        console.error('Error loading therapist data:', error);
        debugInfo.errors.push(`Error: ${error}`);
      } finally {
        loading = false;
      }
    });

    return unsubscribe;
  });

  function handleRowClick(id: string) {
    goto(`/person/${id}`);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toDateString();
  }
</script>

<a href="/logout">Log Out</a>
<h1>Therapist Dashboard</h1>

{#if loading}
  <p>Loading...</p>
{:else if therapist && therapistData}
  <h1>Welcome, {therapistData.firstName} {therapistData.lastName}!</h1>

  {#if patients.length > 0}
    <h2>Your Patients ({patients.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Start Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each patients as patient}
          <tr on:click={() => handleRowClick(patient.id)}>
            <td>{patient.name}</td>
            <td>{formatDate(patient.startDate)}</td>
            <td>
              <button class="view-btn">View Details</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="error-section">
      <p>No patients found. Check the debugging information below.</p>

      <div class="debug-info">
        <h3>Debug Information</h3>
        <p><strong>Therapist ID:</strong> {debugInfo.therapistId}</p>

        <p><strong>Patient IDs from database:</strong></p>
        {#if debugInfo.patientIds.length > 0}
          <ul>
            {#each debugInfo.patientIds as id}
              <li>{id}</li>
            {/each}
          </ul>
        {:else}
          <p>No patient IDs found</p>
        {/if}

        {#if debugInfo.errors.length > 0}
          <p><strong>Errors:</strong></p>
          <ul class="error-list">
            {#each debugInfo.errors as error}
              <li>{error}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  <p>Could not load therapist data. Please check console for errors.</p>

  <div class="debug-info">
    <h3>Debug Information</h3>
    {#if debugInfo.errors.length > 0}
      <p><strong>Errors:</strong></p>
      <ul class="error-list">
        {#each debugInfo.errors as error}
          <li>{error}</li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
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

  .view-btn {
    background-color: #4682b4;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  }

  .view-btn:hover {
    background-color: #36648b;
  }

  .debug-info {
    margin-top: 2rem;
    padding: 1rem;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .error-list {
    color: #d32f2f;
  }

  .error-section {
    margin-top: 1rem;
  }
</style>
