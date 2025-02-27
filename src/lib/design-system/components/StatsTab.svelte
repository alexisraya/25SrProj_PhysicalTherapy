<script>
    import StatBlock from "$lib/design-system/components/StatBlock.svelte";

</script>
<div class="stats-container">
    <div class="stat-section recovery-metrics">
    </div>
    <div class="stat-section stats">
        <StatBlock statTitle="Completed Exercises" stat="--" />
        <StatBlock statTitle="Completed Programs" stat="--" />
        <StatBlock statTitle="Total Reps" stat="--" />
        <StatBlock statTitle="Total Sets" stat="--" />
        <StatBlock statTitle="Total Lifted" stat="--" />
        <StatBlock statTitle="Total Distance" stat="--" />
    </div>
    <div class="stat-section check-in-metrics">

    </div>
</div>

<style>
    .stats-container {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
    }
    .stat-section {
        background-color: var(--color-grey-0);
        width: 100%;
    }
    .recovery-metrics {
        min-height: 210px;
    }
    .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-items: start;
        row-gap: 48px;
        column-gap: 24px;
        padding: 16px 0 16px 24px;
    }
    .check-in-metrics {
        min-height: 250px;
    }
</style>