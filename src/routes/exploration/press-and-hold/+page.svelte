<script>
  /**
   * @type {HTMLButtonElement}
   */
  let button;
  const delay = 2000;
  let timeout = null;

  // function removing or adding (after a delay) a class of active
  function toggleActive() {
    if (button.classList.contains('active')) {
      console.log('active');
      button.classList.remove('active');
    } else {
      timeout = setTimeout(() => {
        button.classList.add('active');
        timeout = null;
      }, delay);
    }
  }

  // function removing the existing, if any, timeout
  // this is made necessary in a situation where the press is removed before the timeout has run out
  function removeActive() {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
</script>

<h1>Press and Hold Validation</h1>
<div class="press_hold_button_container">
  <button bind:this={button} on:mousedown={toggleActive} on:mouseup={removeActive}>
    <!-- svg describing a plus sign -->
    <svg viewBox="-50 -50 100 100" width="100" height="100">
      <circle r="50" fill="hsl(0, 0%, 100%)" />
      <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
        <path d="M -15 0 h 30 m -15 -15 v 30" />
      </g>
    </svg>
  </button>
</div>

<style>
  /* custom-properties describing the colors used throughout the project
    && the time after which the button is considered active */
  :root {
    --gradient-start: hsl(300, 100%, 70%);
    --gradient-end: hsl(340, 85%, 60%);
    --accent: hsl(320, 92.5%, 65%);
    --delay: 2s;
    --easeInCirc: cubic-bezier(0.6, 0.04, 0.98, 0.335);
    --easeOutCirc: cubic-bezier(0.075, 0.82, 0.165, 1);
    --easeInOutCubic: cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  .press_hold_button_container {
    height: 50vh;
    display: flex;
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
    color: hsl(0, 0%, 20%);
    background: linear-gradient(to bottom right, var(--gradient-start), var(--gradient-end));
    cursor: pointer;
  }
  button {
    width: 80px;
    height: 80px;
    display: block;
    color: var(--accent);
    border: none;
    background: none;
    border-radius: 50%;
    filter: drop-shadow(0 0 8px hsla(0, 0%, 0%, 0.2));
    outline: none;
    position: relative;
    z-index: 5;
    user-select: none;
  }
  button svg {
    /* transition the rotation of the + sign with a considerable duration
        use a timing function which snaps toward the end
        */
    transition: all 0.2s var(--easeInOutCubic);
    width: 100%;
    height: 100%;
    display: block;
  }
  /* in favor of the default outline use a pseudo element to add a semitransparent border around the button */
  button:after {
    z-index: -5;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: hsla(0, 0%, 100%, 0.3);
    border-radius: inherit;
    transform: scale(1);
    transition: all 0.2s var(--easeInOutCubic);
  }
  button:focus:after,
  button:hover:after {
    transform: scale(1.2);
  }
  /* with a second pseudo element, show momentarily a set of particles
    ! only following the active state
    */
  button:before {
    z-index: -5;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-50 -50 100 100' width='100' height='100'%3E%3Cg fill='hsl(0, 0%25, 100%25)' stroke-width='1' stroke-linecap='round' stroke-linejoin='round' stroke='hsl(0, 0%25, 100%25)'%3E%3Cg%3E%3Ccircle cx='-30' r='4' /%3E%3Ccircle cx='20' cy='35' r='3' /%3E%3Ccircle cx='40' cy='15' r='1' /%3E%3Ccircle cx='-10' cy='-30' r='1' /%3E%3Crect transform='translate(38 -10) rotate(-15)' x='-3.5' y='-3.5' width='7' height='7' /%3E%3Crect transform='translate(-35 -30) rotate(10)' x='-3' y='-3' width='6' height='6' /%3E%3C/g%3E%3Cg %3E%3Cpath transform='translate(-10 35) rotate(12)' d='M -3 3 l 6 0 -3 -6 z' /%3E%3Cpath transform='translate(-35 25) rotate(50)' d='M -4 0 h 8 m -4 -4 v 8' /%3E%3Cpath transform='translate(25 -30) rotate(50)' d='M -4 0 h 8 m -4 -4 v 8' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    background-size: 100%;
    transform: scale(1);
    opacity: 1;
    /* to have the transition only one way, be sure to describe it as the active state is enabled */
    transition: none;
  }

  /* as the button is pressed, rotate the button
    ! apply the rotation also through a class, which is added after the transition has had a change to complete
    */
  button:active svg,
  button.active svg {
    transform: rotate(45deg);
    transition: all var(--delay) var(--easeInCirc);
  }

  /* always as the button is being pressed, increase the area of the pseudo element
    ! use a similar timing function
    */
  button:active:after,
  button.active:after {
    transform: scale(2);
    opacity: 0;
    transition: all var(--delay) var(--easeInCirc);
  }
  /* finally and momentarily show the particles described by the before pseudo element
    ! use a different timing function for the opacity than for the transform
    opacity should change slowly at first, while transform should initially move fast
    */
  button:active:before,
  button.active:before {
    transition-property: transform, opacity;
    transition-duration: 0.55s, 0.5s;
    transition-delay: var(--delay);
    transition-timing-function: var(--easeOutCirc), var(--easeInCirc);
    transform: scale(2);
    opacity: 0;
  }
</style>
