<script lang="ts">
    import { onMount } from "svelte";
    import { getUser } from "$firebase/userService"; // Fetch user data
    import { authStore } from "$stores/authStore"; // Auth state tracking

    let userId = "";
    let userData = null;
    let isLoading = true;

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (store) => {
            if (!store.isLoading && store.currentUser) {
                userId = store.currentUser.uid;
                userData = await getUser(userId);
                console.log("Fetched User Data:", userData);
            } else {
                console.warn("No user signed in!");
            }
            isLoading = false;
        });

        return () => unsubscribe();
    });
</script>

<h1>User Database Test</h1>

{#if isLoading}
    <p>Loading user data...</p>
{:else}
    {#if userData}
        <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Is Therapist:</strong> {userData.isTherapist ? "Yes" : "No"}</p>
    {:else}
        <p>No user data found. Try logging in again.</p>
    {/if}
{/if}