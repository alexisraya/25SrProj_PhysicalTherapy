<script lang="ts">
  import CheckboxEmptyIcon from '$lib/assets/iconography/CheckboxExmptyIcon.svg';
  import CheckboxSelectedIcon from '$lib/assets/iconography/CheckboxSelectedIcon.svg';

  export let isSelected = false;

  function toggleCheckbox() {
    isSelected = !isSelected;
  }
</script>

<!-- TODO: ALEXIS may need to do custom styling check w Dane -->
<label class="checkbox-container">
  <!-- Hidden default checkbox -->
  <input type="checkbox" bind:checked={isSelected} class="hidden-checkbox" />

  <!-- Image-based checkbox -->
  <button on:click={toggleCheckbox}>
    <img src={isSelected ? CheckboxSelectedIcon : CheckboxEmptyIcon} alt="Checkbox" />
  </button>
</label>

<style>
  .checkbox-container {
    display: inline-block;
    cursor: pointer;
    width: 24px; /* Adjust based on image size */
  }
  .checkbox-container button {
    background-color: transparent;
    border: none;
    padding: 0;
  }

  .hidden-checkbox {
    display: none; /* Hide the default checkbox */
  }
</style>
