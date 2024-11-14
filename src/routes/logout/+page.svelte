<script lang="ts">
    import { onMount } from "svelte";
    import { authHandlers } from "../../stores/authStore";
    import { goto } from "$app/navigation";

    onMount(() => {
        authHandlers.logout();
        goto('/login');
    });
</script>