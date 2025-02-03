<script>
    import { onMount } from 'svelte';
    import ExerciseModel from '$lib/design-system/components/ExerciseModel.svelte';

    let model1Url = '';
    let model2Url = '';
    let imageUrl = 'https://storage.googleapis.com/exercise_model_bucket/kuromi.png';

    let imageErrorMessage = '';
    let model1ErrorMessage = '';
    let model2ErrorMessage = '';

    onMount(async () => {
        try {
            const response1 = await fetch('/api?filename=meditation_pose_female.glb');
            const data1 = await response1.json();

            if (response1.ok && data1.url) {
                model1Url = data1.url;
            } else {
                model1ErrorMessage = `Failed to fetch first 3D model: ${response1.status}`;
                console.error(model1ErrorMessage);
            }

            const response2 = await fetch('/api?filename=toothpaste.glb');
            const data2 = await response2.json();

            if (response2.ok && data2.url) {
                model2Url = data2.url;
            } else {
                model2ErrorMessage = `Failed to fetch second 3D model: ${response2.status}`;
                console.error(model2ErrorMessage);
            }
        } catch (error) {
            model1ErrorMessage = 'Error fetching first 3D model.';
            model2ErrorMessage = 'Error fetching second 3D model.';
            console.error("Error fetching models:", error);
        }
    });
</script>

<main>
    <h1>Cloud Test Page</h1>
    <p>This page dynamically fetches items from Google Cloud Storage</p>

    <h2>3D Exercise Model</h2>
    <section class="model-section">
        {#if model1ErrorMessage}
            <p class="error">{model1ErrorMessage}</p>
        {/if}
        {#if model1Url}
            <div class="model-container">
                <ExerciseModel modelPath={model1Url} />
            </div>
        {:else}
            <p>Loading 3D model...</p>
        {/if}
    </section>

    <div class="divider"></div>

    <h2>3D Toothpaste</h2>
    <section class="model-section">
        {#if model2ErrorMessage}
            <p class="error">{model2ErrorMessage}</p>
        {/if}
        {#if model2Url}
            <div class="model-container">
                <ExerciseModel modelPath={model2Url} />
            </div>
        {:else}
            <p>Loading 3D model...</p>
        {/if}
    </section>

    <div class="divider"></div>

    <h2>Image</h2>
    <section class="image-container">
        {#if imageErrorMessage}
            <p class="error">{imageErrorMessage}</p>
        {/if}
        <img 
            src={imageUrl} 
            alt="Cloud Image" 
            onerror={() => imageErrorMessage = 'Failed to load the image.'} 
        />
    </section>
</main>

<style>
    main {
        font-family: Arial, sans-serif;
        padding: 3rem 2rem;
        max-width: 800px;
        margin: auto;
        text-align: center;
    }
    h1 {
        color: #333;
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    h2 {
        color: #222;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }
    p {
        font-size: 1.1rem;
        color: #555;
        margin-bottom: 1rem;
    }
    section {
        margin-bottom: 3rem;
    }
    .divider {
        width: 80%;
        height: 1px;
        background-color: #ddd;
        margin: 3rem auto;
    }
    .error {
        color: red;
        font-weight: bold;
    }
    .image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
    }
    img {
        max-width: 90%;
        max-height: 400px;
        border: 1px solid #ccc;
        border-radius: 8px;
    }
    .model-section {
        background: #f0f0f0;
        padding: 2rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
        max-width: 90%;
    }
    .model-container {
        width: 600px; /* Forces model to be visible */
        height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>