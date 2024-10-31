<script>
    import { authStore } from '../../../stores/authStore';

    /**
     * @type {string}
     */
    let email;
    authStore.subscribe((curr) => {
        console.log('CURR', curr);
        email = curr?.currentUser?.email;
    });

    const onClick = () => {
        Notification.requestPermission().then(perm => {
            if (perm === "granted") {
                new Notification("Hello, World", {
                    body: "this is an example notification",
                })
            }
        })
    }

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            new Notification("See ya, World", {
                body: "Where'd you go?",
            })
        }
    })
</script>

{#if email}
<h1>Hello {email}</h1>
{/if}
<h1>Notifications</h1>
<button on:click={onClick}>Click Me</button>