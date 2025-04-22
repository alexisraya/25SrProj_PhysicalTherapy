<script lang="ts">
  import { applyWizardScenario, WizardScenario } from '$firebase/services/wizardOfOzService';

  export let patientId: string;
  
  let isLoading = false;
  let error: string | null = null;
  let successMessage: string | null = null;
  
  async function applyScenario(scenario: WizardScenario) {
    clearMessages();
    isLoading = true;
    
    try {
      const success = await applyWizardScenario(patientId, scenario);
      if (success) {
        successMessage = `Successfully applied scenario: ${getScenarioName(scenario)}`;
      } else {
        error = `Failed to apply scenario: ${getScenarioName(scenario)}`;
      }
    } catch (err) {
      console.error('Error applying scenario:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred';
    } finally {
      isLoading = false;

      if (successMessage) {
        setTimeout(() => {
          successMessage = null;
        }, 3000);
      }
    }
  }
  
  function getScenarioName(scenario: WizardScenario): string {
    switch(scenario) {
      case WizardScenario.RUN_1_BASELINE:
        return 'Run 1: First day';
      case WizardScenario.RUN_2_PRE_COMPLETION:
        return 'Run 2: Week 3, Day 5 (Pre-completion)';
      case WizardScenario.RUN_3_POST_COMPLETION:
        return 'Run 3: Month 3, Day 1 (Post-completion)';
      default:
        return scenario;
    }
  }
  
  /**
   * Clear any messages
   */
  function clearMessages() {
    error = null;
    successMessage = null;
  }
</script>

<div class="wizard-controls">
  <div class="buttons">
    <button 
      class="btn primary"
      on:click={() => applyScenario(WizardScenario.RUN_1_BASELINE)}
      disabled={isLoading}
    >
      Run #1: Month 1, Wk 1, Day 1
    </button>
    
    <button 
      class="btn secondary"
      on:click={() => applyScenario(WizardScenario.RUN_2_PRE_COMPLETION)}
      disabled={isLoading}
    >
      Run #2: Month 1, Wk 3, Day 5
    </button>
    
    <button 
      class="btn secondary"
      on:click={() => applyScenario(WizardScenario.RUN_3_POST_COMPLETION)}
      disabled={isLoading}
    >
      Run #3: Month 3, Wk 1, Day 1
    </button>
  </div>
  
  {#if isLoading}
    <div class="loading">Applying scenario... Please wait.</div>
  {/if}
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  {#if successMessage}
    <div class="success">{successMessage}</div>
  {/if}
</div>

<style>
  .wizard-controls {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-top: 2rem;
    border: 1px solid #e5e7eb;
  }
  
  h3 {
    margin-top: 0;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .info {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }
  
  .buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .primary {
    background-color: #4f46e5;
    color: white;
  }
  
  .primary:hover:not(:disabled) {
    background-color: #4338ca;
  }
  
  .secondary {
    background-color: #6b7280;
    color: white;
  }
  
  .secondary:hover:not(:disabled) {
    background-color: #4b5563;
  }
  
  .loading, .error, .success {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .loading {
    background-color: #e9eef6;
    color: #3b82f6;
  }
  
  .error {
    background-color: #fee2e2;
    color: #b91c1c;
  }
  
  .success {
    background-color: #d1fae5;
    color: #047857;
  }
</style>