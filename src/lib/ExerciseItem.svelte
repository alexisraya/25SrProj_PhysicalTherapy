<script lang="ts">
    import Modal from "./Modal.svelte";

    export let title: String;
    export let reps: String;
    export let description: String;
    let showModal= false;
</script>

<button class="exercise_container" on:click={() => showModal = true}>
    <h1>{title}</h1>
    <p>{reps}</p>
</button>

<Modal 
	isOpen={showModal} 
	title={title}
	on:close={() => showModal = false}
>
	<p>{reps}</p>
    <p>{description}</p>

</Modal>

<style>
    .exercise_container {
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        border: 1px solid black;
        border-radius: 5px;
        width: 100%;
        padding: 15px;
    }
    .exercise_container:hover {
        cursor: pointer;
        background-color: lightgray;
    }
    .exercise_container h1 {
        font-size: 18px;
    }
</style>