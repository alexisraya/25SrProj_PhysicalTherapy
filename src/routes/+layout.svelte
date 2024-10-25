<script lang="ts">
    import { auth } from "$lib/helpers/firebase";
    import { onMount } from "svelte";
    import { authStore } from "../stores/authStore";

    onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			authStore.update((curr) => {
				return { ...curr, isLoading: false, currentUser: user };
			});
		});
		return unsubscribe;
	});
</script>

<slot />