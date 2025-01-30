<script>
  import { typography } from '$lib/design-system';
  import ExerciseModel from '$lib/design-system/components/ExerciseModel.svelte';
  import Editicon from '$lib/assets/iconography/EditIcon.svg';
  import RightArrow from '$lib/assets/iconography/RightArrow.svg';
  import LeftArrow from '$lib/assets/iconography/LeftArrow.svg';
  import Character from '$lib/assets/iconography/Character.png';
  import HoldToCompleteButton from '$lib/assets/iconography/HoldToCompleteButton.svg';
  import Button from '$lib/design-system/components/Button.svelte';
</script>

<div class="page_container">
  <div class="exercise_container--top">
    <div class="exercise_nav">
      <img class="back_button" src={LeftArrow} />
      <div class="progress_bar">
        <div class="progress_bar--item"></div>
        <div class="progress_bar--item"></div>
        <div class="progress_bar--item empty"></div>
      </div>
    </div>
    <ExerciseModel modelPath="/meditation_pose_female.glb" />
    <div class="exercise_info">
      <button class="edit_btn">
        <img src={Editicon} />
      </button>
      <h5 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.h5}; font-weight: {typography.fontWeights.bold};">Long Sitting Quad Set</h5>
      <div class="exercise_text--description">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">3 sets</p>
        <div class="line"></div>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">10 reps</p>
        <div class="line"></div>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">3lbs</p>
        <div class="line"></div>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">Kettle Bell</p>
      </div>
    </div>
  </div>
  <div class="exercise_container-bottom">
    <div class="exercise_description">
      <div class="exercise_description--section">
        <h6 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography.lineHeight.expanded}">Instructions</h6>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular}; line-height: {typography.lineHeight.expanded}">
          These are instructions on how you should do this exercise and some tips on good form! yay wahoo
        </p>
      </div>
      <div class="exercise_description--section">
        <h6 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography.lineHeight.expanded}">Information</h6>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular}; line-height: {typography.lineHeight.expanded}">
          This exercise helps to strengthen your quad muscle. The motion mimics walking up the stairs and will help you achieve your goal. 
        </p>
      </div>
      <div class="exercise_description--section">
          <h6 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography.lineHeight.expanded}">Select model</h6>
          <div class="select-character-section">
            <div class="character selected">
              <img class="character--img selected-img" src={Character} alt="Character" />
              <div class="character--overlay selected-overlay"></div>
              <div class="character--name selected-name">
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.bold}; line-height: {typography.lineHeight.expanded}" class="selected-name">Name</p>
              </div>
            </div>
            <div class="character">
              <img src={Character} alt="Character" />
              <div class="character--overlay"></div>
              <div class="character--name">
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium}; line-height: {typography.lineHeight.expanded}">Name</p>
              </div>
            </div>
            <div class="character">
              <img src={Character} alt="Character" />
              <div class="character--overlay"></div>
              <div class="character--name">
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium}; line-height: {typography.lineHeight.expanded}">Name</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
  <!-- TODO: ALEXIS this will be a component later -->
  <div class="buttons">
    <div class="skip_btn">
      <Button cta="Skip" buttonType="secondary"/>
    </div>
    <div class="hold_to_complete_container">
      <div class="hold_to_complete_label">
          <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">hold to complete</p>
          <img src={RightArrow} />
      </div>
      <!-- NOTE: THIS SHOULD NOT GO TO YOUR-PROGRESS BUT BACK TO THE YOUR PROGRAM IN A DIFF STATE -->
      <a href="/your-progress"> 
        <img src={HoldToCompleteButton} />
      </a>
    </div>
  </div>
</div>

<style>
  h5, h6, p{
    margin: 0;
  }
  .page_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    width: 100%;
  }
  .exercise_container--top {
    box-sizing: border-box;
    background: linear-gradient(to bottom, #BE9AEC, #6C5786);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 515px;
    border-radius: 0 0 60px 60px;
    padding: 20px;
  }
  .exercise_nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .progress_bar {
    width: 100%;
    display: flex;
    column-gap: 8px;
    justify-content: center;
    z-index: 1000;
  }
  .progress_bar--item {
    border-radius: 8px;
    height: 9px;
    width: 90px;
    background-color: var(--color-blue-1100);
  }
  .empty {
    opacity: 40%;
  }
  .exercise_info {
    position: relative;
    background: rgba(255, 255, 255, 0.50);
    border-radius: 30px;
    color: var(--color-blue-1100);
    padding: 12px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .line{
    border: 0.5px solid var(--color-purple-100);
    height: 28px;
  }
  .edit_btn {
    background-color: white;
    border: none;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    position: absolute;
    left: 0px;
    top: 0px;
  }
  .exercise_text--description {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 12px;
    height: 45px;
  }
  .exercise_container-bottom {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 45vh;
    padding: 16px 24px;
  }
  .exercise_description {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
  }
  .exercise_description--section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 4px;
  }
  .exercise_description--section p {
    color: var(--color-grey-400);
  }
  .select-character-section {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 16px;
  }
  .character {
    border-radius: 8px;
    position: relative;
    display: inline-block;
    width: 99px; /* Adjust as needed */
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
    background: rgba(255, 255, 255, 0.5);
  }
  .character--name {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
  .selected-img {
    border: 1px solid var(--color-blue-1100);
  }
  .selected-overlay {
    display: none;
  }
  .selected-name {
    color: #fff !important;
  }
  .buttons {
    background: linear-gradient(to top, #FFF 60%, transparent);
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    height: 96px;
    flex-shrink: 0;
    padding-bottom: 16px;
  }
  .skip_btn{
    padding-left: 24px;
    width: 108px;
  }
  .hold_to_complete_container {
    padding-right: 24px;
    display: flex;
    align-items: center;
    column-gap: 4px;
  }
  .hold_to_complete_label {
    display: flex;
    align-items: center;
  }
</style>