<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getTooPainfulLogs } from '$firebase/services/tooPainfulLogService';
  import { getUser } from '$firebase/services/userService';
  import type { TooPainfulLog, User } from '$firebase/types/userType';

  let patientId: string;
  let patient: User | null = null;
  let painLogs: TooPainfulLog[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      patientId = $page.params.id;
      if (!patientId) {
        error = 'No patient ID provided';
        return;
      }

      // Load patient and their pain logs
      const [patientData, logs] = await Promise.all([
        getUser(patientId),
        getTooPainfulLogs(patientId)
      ]);

      patient = patientData;

      // Sort logs by date (newest first)
      painLogs = logs.sort(
        (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
      );
    } catch (err) {
      console.error('Error loading pain logs:', err);
      error = err instanceof Error ? err.message : 'Failed to load pain logs';
    } finally {
      loading = false;
    }
  });

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }

  function goBack() {
    goto(`/person/${patientId}`);
  }

  // Map exercise types to more readable names
  function getExerciseTypeDisplay(type: 'distance' | 'weight' | 'time'): string {
    switch (type) {
      case 'distance':
        return 'Distance';
      case 'weight':
        return 'Strength';
      case 'time':
        return 'Time-based';
      default:
        return type;
    }
  }
</script>

<div class="pain-logs-container">
  <a href="/person/{patientId}" class="back-button">← Back to Patient</a>
  <h1>Exercise Pain Logs</h1>

  {#if patient}
    <h2>Patient: {patient.firstName} {patient.lastName}</h2>
  {/if}

  {#if loading}
    <p>Loading logs...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if painLogs.length === 0}
    <div class="no-logs">
      <p>No painful exercise logs recorded for this patient.</p>
    </div>
  {:else}
    <div class="logs-count">Total logs: {painLogs.length}</div>

    <table class="logs-table">
      <thead>
        <tr>
          <th>Exercise Name</th>
          <th>Exercise Type</th>
          <th>Date Logged</th>
        </tr>
      </thead>
      <tbody>
        {#each painLogs as log}
          <tr>
            <td>{log.exerciseName}</td>
            <td><span class="exercise-type">{getExerciseTypeDisplay(log.exerciseType)}</span></td>
            <td>{formatDate(log.loggedAt)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .pain-logs-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .back-button {
    display: inline-block;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    background-color: #e5e7eb;
    border: none;
    border-radius: 0.25rem;
    text-decoration: none;
    color: #000;
  }

  .logs-count {
    margin: 1rem 0;
    font-weight: bold;
  }

  .logs-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  .logs-table th,
  .logs-table td {
    padding: 0.5rem;
    border: 1px solid #ddd;
    text-align: left;
  }

  .logs-table th {
    background-color: #f2f2f2;
    font-weight: bold;
  }

  .exercise-type {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #f3e8ff;
    color: #8b5cf6;
    border-radius: 1rem;
    font-size: 0.875rem;
  }

  .error {
    color: #ef4444;
    padding: 1rem;
    background-color: #fee2e2;
    border-radius: 0.25rem;
  }

  .no-logs {
    padding: 2rem;
    text-align: center;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    color: #6b7280;
  }
</style>
