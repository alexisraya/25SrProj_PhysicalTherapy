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
</script>

<h1>Hello {email}</h1>