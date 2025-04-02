<script>
    import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

    export let isTooPainful = false;
    let circleColor = isTooPainful ? "var(--too-painful-circle)" : "var(--complete-circle)";
</script>

<RemixIcon name="checkbox-circle-fill" color={circleColor}/>