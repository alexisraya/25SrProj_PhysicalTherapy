<script lang="ts">
    import { goto } from "$app/navigation";
	import { authHandlers, authStore } from "../../../stores/authStore";

	let register = false;
	let email = '';
	let password = '';
	let confirmPassword = '';

	async function handleSubmit() {
		if (!email || !password || (register && !confirmPassword)) {
			return;
		}

		if (register && password === confirmPassword) {
			try {
				await authHandlers.signup(email, password);
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				await authHandlers.login(email, password);
                console.log("SUCCESS");
                goto('/exploration/hidden-page');
			} catch (err) {
                console.log("ERROR");
				console.log(err);
			}
		}
	}
    if ($authStore.currentUser) {
        console.log("current user is in");
        goto('/exploration/hidden-page');
    }
</script>

<div class="container">
	<h1>{register ? 'Register' : 'Log in'}</h1>
	<form>
		<label>
			<input bind:value={email} type="email" placeholder="Email" />
		</label>
		<label>
			<input bind:value={password} type="password" placeholder="Password" />
		</label>
		{#if register}
			<label>
				<input bind:value={confirmPassword} type="password" placeholder="Confirm Password" />
			</label>
		{/if}
		<button on:click={handleSubmit}>Submit</button>
	</form>
	{#if register}
		<button
			on:click={() => {
				register = false;
			}}
		>
			Already have an account?
			<p>Log in</p>
		</button>
	{:else}
		<button
			on:click={() => {
				register = true;
			}}
		>
			Don't have an account? <p>Sign Up</p>
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
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.container form {
		display: flex;
		flex-direction: column;
	}
</style>