<script>
  import { typography } from '$lib/design-system/typography';
  import Character from '$lib/assets/iconography/Character.png';

  // Define your characters – you could also fetch these from an API or define more properties
  let characters = [
    { id: 1, name: 'Bree', image: Character },
    { id: 2, name: 'Kieran', image: Character },
    { id: 3, name: 'Alex', image: Character },
  ];

  // Set the initial selected character (e.g., the first one)
  let selectedId = characters[0].id;

  // A function to handle selection
  function selectCharacter(id) {
    selectedId = id;
  }
</script>

<div class="select-character-section">
  {#each characters as character}
    <button
      class="character {selectedId === character.id ? 'selected' : ''}"
      on:click={() => selectCharacter(character.id)}
    >
      <img
        class="character--img {selectedId === character.id ? 'selected-img' : ''}"
        src={character.image}
        alt="Character"
      />
      <div class="character--overlay {selectedId === character.id ? 'selected-overlay' : ''}"></div>
      <div class="character--name {selectedId === character.id ? 'selected-name' : ''}">
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {selectedId === character.id
            ? typography.fontWeights.bold
            : typography.fontWeights.medium}; line-height: {typography.lineHeight.expanded}"
        >
          {character.name}
        </p>
      </div>
    </button>
  {/each}
</div>

<style>
  p {
    margin: 0;
  }
  button {
    background-color: transparent;
    border: 0;
  }
  .select-character-section {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 16px;
  }
  .character {
    border-radius: 10px;
    position: relative;
    display: inline-block;
    width: 99px; /* Adjust as needed */
    cursor: pointer;
    padding: 4px;
  }
  .character img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  .character--overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--color-grey-opactity-dark);
  }
  .character--name {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: bold;
    color: var(--color-blue-1100);
    text-align: center;
  }
  /* Styling for the selected character */
  .selected {
    border: 1px solid var(--color-blue-1100);
  }
  .selected-overlay {
    display: none;
  }
  .selected-name {
    color: var(--color-grey-0) !important;
  }
</style>
