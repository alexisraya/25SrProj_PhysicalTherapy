<script>
    import { onMount } from 'svelte';
    import ExerciseModel from '$lib/ExerciseModel.svelte';
    import ModelBackground from '$lib/assets/ModelBackground.svg';

    let modelUrl = '';
    let errorMessage = '';

    onMount(async () => {
        console.log("📡 Fetching model URL from API...");
        try {
            const response = await fetch('/api?filename=meditation_pose_female.glb');
            const data = await response.json();

            console.log("🖥️ API Response:", response);
            console.log("📄 Data Received:", data);

            if (response.ok) {
                modelUrl = data.url;
                console.log("✅ Fetched 3D model URL:", modelUrl);
            } else {
                console.error('❌ API Error:', response.status, data);
                errorMessage = `Failed to fetch 3D model URL: ${response.status}`;
            }
        } catch (error) {
            console.error('❌ Fetching error:', error);
            errorMessage = 'An error occurred while fetching the 3D model URL.';
        }
    });
</script>

<main>
    <h1>Cloud Test Page</h1>

    <!-- SVG Background -->
    <img src={ModelBackground} alt="Background SVG" class="svg-background" />

    {#if errorMessage}
        <p style="color: red;">{errorMessage}</p>
    {/if}

    {#if modelUrl}
        <section>
            <h2>3D Model:</h2>
            <ExerciseModel modelPath={modelUrl} />
        </section>
    {:else}
        <p>Loading 3D model...</p>
    {/if}
</main>


