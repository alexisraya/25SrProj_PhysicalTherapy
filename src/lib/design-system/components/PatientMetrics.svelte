<script lang="ts">
    import { onMount } from "svelte";
    import { getUserMetrics, updateRangeOfMotion, updateStrength } from "$firebase/services/metricsService";
    import type { UserMetrics } from "$firebase/types/userType";
    
    export let patientId: string;
    export let reloadTrigger = 0;
    
    let metricsData: UserMetrics | null = null;
    let loading = true;
    let error: string | null = null;
    let success: string | null = null;
    
    let newRomMonth = 1;
    let newRomDegrees = 0;
    let newStrengthMonth = 1;
    let newStrengthScale = 0;
    
    $: if (patientId || reloadTrigger) {
        loadMetrics();
    }
    
    onMount(() => {
        if (patientId) {
            loadMetrics();
        }
    });
    
    async function loadMetrics() {
        try {
            loading = true;
            error = null;
            
            const metrics = await getUserMetrics(patientId);
            
            if (!metrics) {
                error = "Failed to load metrics data";
                return;
            }
            
            metricsData = metrics;
            
            if (metricsData && metricsData.rangeOfMotion && metricsData.rangeOfMotion.length > 0) {
                const maxMonth = Math.max(...metricsData.rangeOfMotion.map(m => m.month));
                newRomMonth = maxMonth + 1;
            } else {
                newRomMonth = 1;
            }
            
            if (metricsData && metricsData.strength && metricsData.strength.length > 0) {
                const maxMonth = Math.max(...metricsData.strength.map(m => m.month));
                newStrengthMonth = maxMonth + 1;
            } else {
                newStrengthMonth = 1;
            }
            
        } catch (err) {
            console.error("Error loading metrics data:", err);
            error = "Failed to load metrics data";
        } finally {
            loading = false;
        }
    }
    
    async function handleRomSubmit() {
        if (newRomDegrees < 0 || newRomDegrees > 100) {
            error = "Range of motion must be between 0 and 100 degrees";
            return;
        }
        
        try {
            loading = true;
            error = null;
            success = null;
            
            await updateRangeOfMotion(patientId, newRomMonth, newRomDegrees);
            
            await loadMetrics();
            
            newRomDegrees = 0;
            
            success = `Range of motion updated for Month ${newRomMonth}`;
            
            setTimeout(() => {
                success = null;
            }, 3000);
            
        } catch (err) {
            console.error("Error updating ROM:", err);
            error = "Failed to update range of motion";
        } finally {
            loading = false;
        }
    }
    
    async function handleStrengthSubmit() {
        if (newStrengthScale < 0 || newStrengthScale > 5) {
            error = "Strength scale must be between 0 and 5";
            return;
        }
        
        try {
            loading = true;
            error = null;
            success = null;
            
            await updateStrength(patientId, newStrengthMonth, newStrengthScale);
            
            await loadMetrics();
            
            newStrengthScale = 0;
            
            success = `Strength updated for Month ${newStrengthMonth}`;
            
            setTimeout(() => {
                success = null;
            }, 3000);
            
        } catch (err) {
            console.error("Error updating strength:", err);
            error = "Failed to update strength";
        } finally {
            loading = false;
        }
    }
</script>

<div class="metrics-section">
    <h2>Patient Metrics</h2>
    
    {#if loading && !metricsData}
        <div class="loading-state">Loading patient metrics...</div>
    {:else if error}
        <div class="error-message">{error}</div>
        <button on:click={loadMetrics} class="reload-btn">Reload Data</button>
    {:else}
        {#if success}
            <div class="success-message">{success}</div>
        {/if}
        <div class="metrics-container">
            <div class="metric-box">
                <h3>Range of Motion</h3>
                <p class="description">
                    Range of motion (degrees from 0-100).
                </p>
                <div class="metric-form">
                    <div class="form-group">
                        <label for="romMonth">Month:</label>
                        <input 
                            type="number" 
                            id="romMonth" 
                            bind:value={newRomMonth} 
                            min="1"
                        />
                    </div>
                    <div class="form-group">
                        <label for="romDegrees">Degrees (0-100):</label>
                        <input 
                            type="number" 
                            id="romDegrees" 
                            bind:value={newRomDegrees} 
                            min="0" 
                            max="100"
                        />
                    </div>
                    <button 
                        on:click={handleRomSubmit} 
                        class="save-btn"
                        disabled={loading}
                    >
                        Save ROM
                    </button>
                </div>
                {#if metricsData && metricsData.rangeOfMotion && metricsData.rangeOfMotion.length > 0}
                    <div class="metric-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Degrees</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each metricsData.rangeOfMotion.sort((a, b) => a.month - b.month) as rom}
                                    <tr>
                                        <td>{rom.month}</td>
                                        <td>{rom.degrees}°</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <p class="no-data">No range of motion data recorded yet.</p>
                {/if}
            </div>
            <div class="metric-box">
                <h3>Strength</h3>
                <p class="description">
                    Strength progress (scale from 0-5).
                </p>
                <div class="metric-form">
                    <div class="form-group">
                        <label for="strengthMonth">Month:</label>
                        <input 
                            type="number" 
                            id="strengthMonth" 
                            bind:value={newStrengthMonth} 
                            min="1"
                        />
                    </div>
                    <div class="form-group">
                        <label for="strengthScale">Strength Scale (0-5):</label>
                        <input 
                            type="number" 
                            id="strengthScale" 
                            bind:value={newStrengthScale} 
                            min="0" 
                            max="5" 
                            step="1"
                        />
                    </div>
                    <button 
                        on:click={handleStrengthSubmit} 
                        class="save-btn"
                        disabled={loading}
                    >
                        Save Strength
                    </button>
                </div>
                {#if metricsData && metricsData.strength && metricsData.strength.length > 0}
                    <div class="metric-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Strength Scale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each metricsData.strength.sort((a, b) => a.month - b.month) as str}
                                    <tr>
                                        <td>{str.month}</td>
                                        <td>{str.strengthScale}/5</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <p class="no-data">No strength data recorded yet.</p>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .metrics-section {
        margin: 2rem 0;
        padding: 1.5rem;
        background-color: #f9fafb;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
    }
    
    h2 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 0.75rem;
    }
    
    .loading-state {
        text-align: center;
        padding: 1rem;
        color: #6b7280;
        font-style: italic;
    }
    
    .error-message {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 0.75rem;
        border-radius: 0.375rem;
        margin-bottom: 1rem;
    }
    
    .success-message {
        background-color: #d1fae5;
        color: #065f46;
        padding: 0.75rem;
        border-radius: 0.375rem;
        margin-bottom: 1rem;
    }
    
    .reload-btn {
        display: block;
        margin: 1rem auto;
        padding: 0.5rem 1rem;
        background-color: #4b5563;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .metrics-container {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    @media (min-width: 768px) {
        .metrics-container {
            grid-template-columns: 1fr 1fr;
        }
    }
    
    .metric-box {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .description {
        color: #6b7280;
        margin-bottom: 1rem;
        font-size: 0.875rem;
    }
    
    .metric-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
    }
    
    .form-group input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }
    
    .save-btn {
        grid-column: span 2;
        padding: 0.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-weight: 500;
        margin-top: 1rem;
        font-size: 0.875rem;
    }
    
    .save-btn:hover {
        background-color: #2563eb;
    }
    
    .save-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .metric-table {
        margin-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
        padding-top: 1rem;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
    }
    
    th {
        font-weight: 600;
        color: #4b5563;
        font-size: 0.875rem;
    }
    
    .no-data {
        margin-top: 1rem;
        font-style: italic;
        color: #9ca3af;
        text-align: center;
    }
</style>