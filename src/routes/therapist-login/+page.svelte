<script lang="ts">
    import { goto } from "$app/navigation";
    import { authHandlers, authStore } from "../../stores/authStore";
    import { getTherapist } from "$firebase/therapistService";

    let email = "";
    let password = "";

    async function handleTherapistLogin() {
        try {
            await authHandlers.login(email, password);
            console.log("✅ Therapist logged in.");

            // Wait for Firebase to update auth state
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Get current user ID
            const therapistId = authStore.currentUser?.uid;
            if (!therapistId) {
                console.error("🔥 No therapist UID found.");
                return;
            }

            // Fetch therapist data from Firestore
            const therapist = await getTherapist(therapistId);
            if (therapist?.isTherapist) {
                console.log("✅ Redirecting to Therapist Dashboard.");
                goto('/therapist-dashboard');
            } else {
                console.warn("⚠️ Not a therapist. Redirecting to user login.");
                goto('/login');
            }
        } catch (err) {
            console.error("🔥 Login failed:", err);
            alert("Login failed. Please check your email and password.");
        }
    }
</script>

<h1>Therapist Login</h1>
<form on:submit|preventDefault={handleTherapistLogin}>
    <label>Email: <input type="email" bind:value={email} required /></label>
    <label>Password: <input type="password" bind:value={password} required autocomplete="current-password" /></label>
    <button type="submit">Login</button>
</form>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 15px;
    }

    .container form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 20px;
    }
</style>