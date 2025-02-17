<script lang="ts">
    import { goto } from "$app/navigation";
    import { authHandlers, authStore } from "../../stores/authStore";
    import { getUser } from "$firebase/userService";

    let register = false;
    let firstName = "";
    let lastName = "";
    let email = "";
    let password = "";
    let confirmPassword = "";

    async function handleSubmit() {
        if (!email || !password || (register && !confirmPassword)) {
            console.warn("⚠️ Missing required fields.");
            return;
        }

        if (register && password === confirmPassword) {
            try {
                await authHandlers.signup(email, password, firstName, lastName, false); // ✅ Patients only
                console.log("✅ Patient signed up.");
                goto('/patient-dashboard');
            } catch (err) {
                console.error("🔥 Signup failed:", err);
                alert("Signup failed. Please try again.");
            }
        } else {
            try {
                await authHandlers.login(email, password);
                console.log("✅ User logged in.");

                // ✅ Ensure authStore updates before fetching user
                let user = authStore.currentUser;
                if (!user) {
                    console.warn("⚠️ User not found in authStore.");
                    return;
                }

                // ✅ Fetch user data from Firestore
                const userData = await getUser(user.uid);
                if (!userData) {
                    console.warn("⚠️ No Firestore data found for user.");
                    return;
                }

                // ✅ Redirect based on user role
                if (userData.isTherapist) {
                    console.log("✅ Redirecting to Therapist Dashboard.");
                    goto('/therapist-dashboard');
                } else {
                    console.log("✅ Redirecting to Patient Dashboard.");
                    goto('/patient-dashboard');
                }
            } catch (err) {
                console.error("🔥 Login failed:", err);
                alert("Login failed. Please check your credentials.");
            }
        }
    }
</script>

<div class="container">
    <h1>{register ? 'Register' : 'Log in'}</h1>
    <form on:submit|preventDefault={handleSubmit}>
        {#if register}
            <label>
                <input bind:value={firstName} type="text" placeholder="First Name" required />
            </label>
            <label>
                <input bind:value={lastName} type="text" placeholder="Last Name" required />
            </label>
        {/if}
        <label>
            <input bind:value={email} type="email" placeholder="Email" required />
        </label>
        <label>
            <input bind:value={password} type="password" placeholder="Password" required autocomplete="current-password" />
        </label>
        {#if register}
            <label>
                <input bind:value={confirmPassword} type="password" placeholder="Confirm Password" required />
            </label>
        {/if}
        <button type="submit">{register ? 'Register' : 'Log in'}</button>
    </form>
    {#if register}
        <p>Already have an account?</p>
        <button on:click={() => register = false}>Log in</button>
    {:else}
        <p>Don't have an account?</p>
        <button on:click={() => register = true}>Sign Up</button>
    {/if}
    <button on:click={() => goto('/logout')}>Logout</button>
</div>

<style>
    p {
        margin: 0;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-self: center;
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