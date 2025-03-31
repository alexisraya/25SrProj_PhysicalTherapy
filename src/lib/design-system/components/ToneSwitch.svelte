<script lang="ts">
  import Button from '$lib/design-system/components/Button.svelte';
  import Heart from '$lib/assets/iconography/Heart.svg';
  import Megaphone from '$lib/assets/iconography/Megaphone.svg';
  import { getTone } from '$lib/helpers/toneContext';

  const { tone, setTone } = getTone();
  $: buttonLabel = $tone == 'kind' ? 'Switch to Tough Tone' : 'Switch to Kind Tone';
  $: toneIcon = $tone == 'kind' ? Megaphone : Heart;

  const toggleTone = () => {
    setTone($tone === 'kind' ? 'tough' : 'kind');
  };
</script>

<Button buttonType="secondary" cta={buttonLabel} onClickFunc={toggleTone} buttonIcon={toneIcon} />
