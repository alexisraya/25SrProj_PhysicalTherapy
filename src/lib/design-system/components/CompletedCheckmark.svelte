<script>
  import CompleteIcon from '$lib/assets/iconography/CompleteIcon.svg';
  import CompleteTooPainfulIcon from '$lib/assets/iconography/CompleteTooPainfulIcon.svg';

  export let isTooPainful = false;
  let imgsrc = isTooPainful ? CompleteTooPainfulIcon : CompleteIcon;
</script>

<img src={imgsrc} alt="checkmark" />
