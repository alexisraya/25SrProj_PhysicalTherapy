<script lang="ts">
    import { auth } from "$lib/helpers/firebase";
    import { onMount } from "svelte";
    import { authStore } from "../stores/authStore";
	import { userStore } from "../stores/userStore";
	import { programStore } from "../stores/programStore";
	import { goalStore } from "../stores/goalStore";
	import ThemeProvider from "$lib/design-system/ThemeProvider.svelte";
	import '../app.css';
    import Nav from "$lib/design-system/components/Nav.svelte";
	import { page } from '$app/stores';

	let currentUserId: string | null = null;

    onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			authStore.update((curr) => {
				return { ...curr, isLoading: false, currentUser: user };
			});

			if (user) {
                if (currentUserId !== user.uid) {
                    currentUserId = user.uid;
                    console.log("User authenticated, loading data for:", user.uid);
                    
                    userStore.loadUser(user.uid);
                    programStore.loadProgram(user.uid);
                    goalStore.loadGoals(user.uid);
                }
            } else {
                currentUserId = null;
                userStore.reset();
                programStore.reset();
                goalStore.reset();
            }

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