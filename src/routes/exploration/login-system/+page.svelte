<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/firebase';
    import { signInWithEmailAndPassword } from 'firebase/auth';

    let email = '';
    let password = '';
    
    async function handleLogin(event: Event) {
        event.preventDefault();

        if (!email || !password) {
            alert("Please Enter a Valid Email and Password")
            return;
        }

        try {
            const userAccount = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in user:", userAccount.user);
            goto('/exploration/notifications');
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please check if your email and password are correct.");
        }
    }
</script>

<h1>Log In System</h1>

<form on:submit={handleLogin}>
    <div>
        <label for="email">Email</label>
        <input type="email" id="email" bind:value={email} />
    </div>
    
    <div>  
        <label for="password">Password</label>
        <input type="password" id="password" bind:value={password} />
    </div>

    <button type="submit">Login</button>
</form>