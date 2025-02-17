<script lang="ts">
    import { onMount } from "svelte";
    import { getUser } from "$firebase/userService"; //  Use alias
    import { authStore } from "$stores/authStore"; //  Import authStore

    let userId = "";
    let userData = null;
    let isLoading = true;

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (store) => {
            if (!store.isLoading && store.currentUser) {
                console.log(" User is signed in:", store.currentUser.uid);
                userId = store.currentUser.uid;
                userData = await getUser(userId);
                console.log("Fetched User Data:", userData);
            } else {
                console.error("No user signed in! Try logging in.");
            }
            isLoading = false;
        });

        return () => unsubscribe(); // Cleanup subscription
    });
</script>

<h1>User Database Test</h1>

{#if isLoading}
    <p>Loading user data...</p>
{:else}
    {#if userData}
        <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Injury:</strong> {userData.injury || "None"}</p>
        <p><strong>Is Therapist:</strong> {userData.isTherapist ? "Yes" : "No"}</p>
        <p><strong>Therapist ID:</strong> {userData.therapistId || "N/A"}</p>
    {:else}
        <p>No user data found. Try logging in again.</p>
    {/if}
{/if}