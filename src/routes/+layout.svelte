<script lang="ts">
    import { auth } from "$lib/helpers/firebase";
    import { onMount } from "svelte";
    import { authStore } from "../stores/authStore";
	import ThemeProvider from "$lib/design-system/ThemeProvider.svelte";

    onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			authStore.update((curr) => {
				return { ...curr, isLoading: false, currentUser: user };
			});
		});
		return unsubscribe;
	});
</script>

<ThemeProvider>
	<div class="main-container">
		<slot />
	</div>
</ThemeProvider>

<style>
	.main-container {
		padding: 0 18px;
	}
</style>
