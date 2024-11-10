<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '../../../stores/authStore';
    import { db } from '$lib/helpers/firebase';
    import { collection, getDocs, QueryCompositeFilterConstraint } from 'firebase/firestore';

    let documents = [];
    onMount(async () => {
        try {
            console.log(db);
            const querySnapshot = await getDocs(collection(db, 'users'));
            documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(documents);
        } catch (err) {
            console.error('Error fetching documents:', err);
        }
    })
    /**
     * @type {string}
     */
    let name: String;
    authStore.subscribe((curr) => {
        console.log('CURR', curr);
        name = curr?.currentUser?.displayName;
        console.log(curr?.currentUser?.isTherapist)

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

{#if name}
<h1>Hello {name}</h1>
{/if}
<h1>Notifications</h1>
<button on:click={onClick}>Click Me</button>