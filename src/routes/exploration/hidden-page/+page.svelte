<script>
	import Modal from "$lib/design-system/components/Modal.svelte";

	let showModal = false;
</script>

<button on:click={() => showModal = true}>
	Open Modal
</button>

<Modal 
	isOpen={showModal} 
	title="Example Modal"
	on:close={() => showModal = false}
>
	<p>This is the modal content!</p>

</Modal>