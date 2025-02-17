<script lang="ts">
  import { onMount } from "svelte";
  import { getTherapist } from "$firebase/therapistService";
  import { getUser } from "$firebase/userService";

  let therapistData = null;
  let loading = true;
  let selectedUser = null;

  async function loadTherapistData() {
      const therapistId = "therapisttest"; // Replace with actual therapist ID
      therapistData = await getTherapist(therapistId);
      loading = false;
  }

  async function viewUser(userId: string) {
      selectedUser = await getUser(userId);
  }

  onMount(loadTherapistData);
</script>

<h1>Therapist Dashboard</h1>

{#if loading}
  <p>Loading therapist data...</p>
{:else}
  {#if therapistData}
      <p><strong>Name:</strong> {therapistData.firstName} {therapistData.lastName}</p>
      <p><strong>Email:</strong> {therapistData.email}</p>
      <p><strong>Assigned Patients:</strong></p>
      <ul>
          {#each therapistData.patients as patientId}
              <li on:click={() => viewUser(patientId)}>{patientId}</li>
          {/each}
      </ul>
      {#if selectedUser}
          <h2>User Profile</h2>
          <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Injury:</strong> {selectedUser.injury}</p>
          <p><strong>Assigned Exercises:</strong></p>
          <ul>
              {#each selectedUser.exercises as exercise}
                  <li>{exercise.exerciseName}</li>
              {/each}
          </ul>
      {/if}
  {:else}
      <p>No therapist data found.</p>
  {/if}
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
  }
</style>