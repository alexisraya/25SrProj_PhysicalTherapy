<script>
    import Goal from "$lib/design-system/components/Goal.svelte";

    let lightModeGoals = [
        { goalName: "Unlocked Goal", isLocked: false, hasExtraInfo: false },
        { goalName: "Unlocked Goal", isLocked: false, hasExtraInfo: true, extraInfo: "Time" },
        { goalName: "Locked Goal", isLocked: true, hasExtraInfo: false },
        { goalName: "Locked Goal", isLocked: true, hasExtraInfo: true, extraInfo: "Time" }
    ];

    let darkModeGoals = [
        { goalName: "Unlocked Goal", isLocked: false, hasExtraInfo: false, isDarkMode: true },
        { goalName: "Unlocked Goal", isLocked: false, hasExtraInfo: true, extraInfo: "Time", isDarkMode: true },
        { goalName: "Locked Goal", isLocked: true, hasExtraInfo: false, isDarkMode: true },
        { goalName: "Locked Goal", isLocked: true, hasExtraInfo: true, extraInfo: "Time", isDarkMode: true }
    ];
</script>

<div class="container">
    <h1>Component Showcase</h1>

    <div class="component-section">
        <h2>Goals</h2>

        <!-- Light Mode Section -->
        <h3>Light Mode</h3>
        <div class="goal-grid">
            {#each lightModeGoals as goal}
                <Goal {...goal} />
            {/each}
        </div>

        <!-- Dark Mode Section -->
        <h3 class="dark-mode-title">Dark Mode</h3>
        <div class="dark-mode-section">
            <div class="goal-grid">
                {#each darkModeGoals as goal}
                    <Goal {...goal} />
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    h1, h2, h3, h4, h5, p {
        margin: 0;
    }

    .container {
        margin: 20px;
    }

    .component-section {
        display: flex;
        flex-direction: column;
        row-gap: 16px;
    }

    .goal-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
        gap: 16px;
        justify-content: center;
        padding-top: 10px;
    }

    /* Light Mode Styling */
    h3 {
        color: #0F1B1F; /* Blue/110 */
    }

    /* Dark Mode Section */
    .dark-mode-title {
        margin-top: 24px; /* Adds space before dark mode section */
    }

    .dark-mode-section {
        background-color: #0F1B1F; /* Blue/110 */
        padding: 20px;
        border-radius: 8px;
        margin-top: 10px; /* Adds separation from light mode section */
    }

    .dark-mode-section h3 {
        color: #FFFFFF; /* Ensure title is readable in dark mode */
    }
</style>
