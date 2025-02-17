<script lang="ts">
    import { auth } from "$lib/helpers/firebase";
    import { onMount } from "svelte";
    import { authStore } from "../stores/authStore";
	import ThemeProvider from "$lib/design-system/ThemeProvider.svelte";
	import '../app.css';
    import Nav from "$lib/design-system/components/Nav.svelte";
	import { page } from '$app/stores';

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
		{#if $page.url.pathname != "/login"}
		<Nav />
		{/if}
		<slot />
	</div>
</ThemeProvider>

<style>
	/* * {
		line-height: 150%;
	} */
	.main-container {
		padding: 0;
	}
</style>
