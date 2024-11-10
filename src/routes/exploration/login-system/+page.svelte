<script lang="ts">
    import { goto } from "$app/navigation";
	import { authHandlers, authStore } from "../../../stores/authStore";

	let register = false;
	let firstName = '';
    let lastName = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	async function handleSubmit() {
		if (!email || !password || (register && !confirmPassword)) {
			return;
		}

		if (register && password === confirmPassword) {
			try {
				await authHandlers.signup(email, password, firstName, lastName);
				console.log("SIGNUP SUCESSFUL");
				goto('/exploration/notifications');
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				await authHandlers.login(email, password);
                console.log("SUCCESS");
                goto('/exploration/notifications');
			} catch (err) {
                console.error("Login failed:", err);
            	alert("Login failed. Please check if your email and password are correct.");
			}
		}
	}
    if ($authStore.currentUser) {
        console.log("current user is in");
        goto('/exploration/notifications');
    }
</script>

<div class="container">
	<h1>{register ? 'Register' : 'Log in'}</h1>
	<form>
		{#if register}
			<label>
				<input type="text" id="firstName" bind:value={firstName} placeholder="Firth Name" required />
			</label>
			<label>
				<input type="text" id="lastName" bind:value={lastName} placeholder="Last Name" required />
			</label>
		{/if}
		<label>
			<input bind:value={email} type="email" placeholder="Email" required />
		</label>
		<label>
			<input bind:value={password} type="password" placeholder="Password" required />
		</label>
		{#if register}
			<label>
				<input bind:value={confirmPassword} type="password" placeholder="Confirm Password" />
			</label>
		{/if}
		<button on:click={handleSubmit}>Submit</button>
	</form>
	{#if register}
		<p>Already have an account?</p>
		<button
			on:click={() => {
				register = false;
			}}
		>
			Log in
		</button>
	{:else}
		<p>Don't have an account?</p>
		<button
			on:click={() => {
				register = true;
			}}
		>
			Sign Up
		</button>
	{/if}
    <button
        on:click={() => {
            goto('/logout');
        }}
    >
       Logout
    </button>
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