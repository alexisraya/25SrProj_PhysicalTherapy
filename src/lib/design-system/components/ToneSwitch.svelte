<script lang="ts">
    import { toggleTone, toneStore } from "$stores/toneStore";
    import Button from "$lib/design-system/components/Button.svelte";
    import Heart from "$lib/assets/iconography/Heart.svg";
    import Megaphone from "$lib/assets/iconography/Megaphone.svg";

    $: tone = $toneStore.currentTone;
    $: buttonLabel = tone == "kind" ? "Switch to Tough Tone" : "Switch to Kind Tone";
    $: toneIcon = tone == "kind" ? Megaphone : Heart;
</script>

<Button buttonType="secondary" cta={buttonLabel} onClickFunc={toggleTone} buttonIcon={toneIcon}/>