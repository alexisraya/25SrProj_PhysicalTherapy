<script>
  import { typography } from '$lib/design-system';
  import ExerciseModel from '$lib/design-system/components/ExerciseModel.svelte';
  import Editicon from '$lib/assets/iconography/EditIcon.svg';
  import RightArrow from '$lib/assets/iconography/RightArrow.svg';
  import LeftArrow from '$lib/assets/iconography/LeftArrow.svg';
  import HoldToCompleteButton from '$lib/assets/iconography/HoldToCompleteButton.svg';
</script>

<div class="page_container">
  <div class="exercise_nav">
    <img class="back_button" src={LeftArrow} />
    <div class="progress_bar">
      <div class="progress_bar--item"></div>
      <div class="progress_bar--item"></div>
      <div class="progress_bar--item empty"></div>
    </div>
  </div>
  <ExerciseModel modelPath="/meditation_pose_female.glb" />
  <div class="exercise_text">
    <div class="exercise_text--info">
      <div class="exercise_text--title">
        <h3 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h3}; font-weight: {typography.fontWeights.regular};">Long Sitting Quad Set</h3>
        <div class="exercise_text--description">
          <img src={Editicon} />
          <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular};">3 sets</p>
          <p>•</p>
          <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular};">10 reps</p>
          <p>•</p>
          <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular};">3lbs</p>
          <p>•</p>
          <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular};">Kettle Bell</p>
        </div>
      </div>
      <div class="exercise_text--description">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular}; line-height: {typography.lineHeight.expanded}">
          This exercise helps to strengthen your quad muscle. The motion mimics walking up the stairs and will help you achieve your goal. 
        </p>
      </div>
    </div>
    <div class="buttons">
      <button class="skip_button">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">Skip</p>
      </button>
      <div class="hold_to_complete_container">
        <div class="hold_to_complete_label">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">hold to complete</p>
            <img src={RightArrow} />
        </div>
        <img src={HoldToCompleteButton} />
      </div>
    </div>
  </div>
</div>

<style>
  h3, p{
    margin: 0;
  }
  .page_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh; /* Use the full viewport height */
  }
  .exercise_nav {
    width: 100%;
    padding: 24px 24px 0 24px;
    display: flex;
    background-color: #BB9CF9;
    align-items: center;
    justify-content: center;
  }
  .back_button {
    margin-left: 24px;
  }
  .progress_bar {
    /* position: absolute;
    left: 0;
    top: 0; */
    width: 100%;
    display: flex;
    column-gap: 8px;
    justify-content: center;
    z-index: 1000;
    margin-right: 24px;
  }
  .progress_bar--item {
    border-radius: 8px;
    height: 9px;
    width: 90px;
    background-color: #000;
  }
  .empty {
    opacity: 40%;
  }
  .exercise_text {
    box-sizing: border-box; /* Includes padding in the element's width */
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Ensures the two children are spaced apart */
    flex-grow: 1; /* Allows the exercise_text to fill available vertical space */
    width: 100%; /* Ensure it spans full width if needed */
    margin: 42px 0;
    padding: 0px 24px;
    }
  .exercise_text--title {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
  }
  .exercise_text--info {
    display: flex;
    flex-direction: column;
    row-gap: 24px;
    flex-shrink: 0; /* Prevents shrinking */
  }
  .exercise_text--description {
    display: flex;
    column-gap: 8px;
  }
  .buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    flex-shrink: 0; /* Prevents shrinking */
  }
  .skip_button {
    width: 108px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 23px;
    border: 1px solid #18282E;
    background-color: transparent;
  }
  .hold_to_complete_container {
    display: flex;
    align-items: center;
    column-gap: 4px;
  }
  .hold_to_complete_label {
    display: flex;
    align-items: center;
  }

	@media (min-width: 600px) {
		.exercise_text {
      padding: 0px 42px;
    }
  }
</style>