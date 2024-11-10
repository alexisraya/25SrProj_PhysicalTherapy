<script>
	import { authStore } from '../../../stores/authStore';

	/**
     * @type {string}
     */
	let name;
	authStore.subscribe((curr) => {
		console.log('CURR', curr);
		// name = curr?.currentUser?.displayName;
	});
</script>

<!-- <h1>Hello {name}</h1> -->