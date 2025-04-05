<script lang="ts">
  import { goto } from '$app/navigation';
  import { typography } from '$lib/design-system';
  import Button from '$lib/design-system/components/Button.svelte';
  import { authHandlers } from '../../stores/authStore';
  import LoginBlob from '$lib/assets/background-images/LoginBlob.svg';
  import MendLogo from '$lib/assets/iconography/MendLogo.svg';
  import { onMount } from 'svelte';

  let register = false;
  let firstName = '';
  let lastName = '';
  let email = '';
  let password = '';
  let confirmPassword = '';

  // Email validation variables
  let isValidEmail = true;
  let isFocused = false;
  let emailTouched = false;

  // Password validation variables
  let passwordsMatch = true;
  let confirmPasswordTouched = false;
  let confirmPasswordFocused = false;

  // Authentication error state
  let authError = false;

  type Theme = 'light' | 'dark';
  let theme: Theme = 'light';

  function applyTheme(newTheme: Theme): void {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    theme = newTheme;

    // Dispatch a custom event that other components can listen for
    window.dispatchEvent(new Event('themeChanged'));
  }

  onMount(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    // Check for system preference if no saved preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    } else {
      theme = savedTheme;
    }

    // Apply the theme
    applyTheme(theme);
  });

  // Email validation function
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to handle email input changes
  function handleEmailChange() {
    // Clear auth error when the user starts typing again
    if (authError) {
      authError = false;
    }

    if (email.length > 0) {
      emailTouched = true;
      isValidEmail = validateEmail(email);
    } else {
      // Empty email - don't show error yet
      isValidEmail = true;
    }
  }

  // Focus handling functions for email
  function handleFocus() {
    isFocused = true;
  }

  function handleBlur() {
    isFocused = false;
    // When focus is lost, validate email if it has content
    if (email.length > 0) {
      emailTouched = true;
      isValidEmail = validateEmail(email);
    }
  }

  // Password matching validation
  function validatePasswordMatch() {
    if (register && confirmPassword.length > 0) {
      confirmPasswordTouched = true;
      passwordsMatch = password === confirmPassword;
    } else {
      // Don't show error if confirm password is empty
      passwordsMatch = true;
    }
  }

  // Password confirmation focus handling
  function handleConfirmFocus() {
    confirmPasswordFocused = true;
  }

  function handleConfirmBlur() {
    confirmPasswordFocused = false;
    validatePasswordMatch();
  }

  // Handle password change to check matching
  function handlePasswordChange() {
    // Clear auth error when the user starts typing again
    if (authError) {
      authError = false;
    }

    if (confirmPasswordTouched) {
      validatePasswordMatch();
    }
  }

  async function handleSubmit() {
    // Clear previous auth errors
    authError = false;

    // Validate email before submission
    isValidEmail = validateEmail(email);
    emailTouched = true;

    // Validate password match if in register mode
    if (register) {
      passwordsMatch = password === confirmPassword;
      confirmPasswordTouched = true;
    }

    if (
      !isValidEmail ||
      !email ||
      !password ||
      (register && (!confirmPassword || !passwordsMatch))
    ) {
      return;
    }

    if (register && password === confirmPassword) {
      try {
        await authHandlers.signup(email, password, firstName, lastName);
        console.log('Signup successful.');
      } catch (err) {
        console.error('Signup failed:', err);
        authError = true;
      }
    } else {
      try {
        const result = await authHandlers.login(email, password);
        if (result.success) {
          console.log('Login successful.');
          goto('/patient-dashboard');
        } else {
          console.error('Login failed:', result.error);
          authError = true;
        }
      } catch (err) {
        console.error('Login failed with exception:', err);
        authError = true;
      }
    }
  }
</script>

<div class="container">
  <div class="banner">
    <img src={LoginBlob} alt="blob" class="blob" />
    <img src={MendLogo} alt="logo" class="logo" />
  </div>
  <div class="header">
    <h3
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h3}; font-weight: {typography.fontWeights.regular}; text-align: center;"
    >
      Log in to Mend
    </h3>
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .regular}; font-weight: {typography.fontWeights.medium}; text-align: center;"
    >
      Please enter the required details
    </p>
  </div>

  {#if authError}
    <div class="auth-error-container">
      <p class="auth-error-message">
        The email or password entered does not match our records. Please try again.
      </p>
    </div>
  {/if}

  <form>
    {#if register}
      <label>
        <input
          type="text"
          id="firstName"
          bind:value={firstName}
          placeholder="First name"
          required
        />
      </label>
      <label>
        <input type="text" id="lastName" bind:value={lastName} placeholder="Last name" required />
      </label>
    {/if}
    <div class="input-container">
      <label>
        <input
          bind:value={email}
          type="email"
          placeholder="Email"
          required
          on:input={handleEmailChange}
          on:focus={handleFocus}
          on:blur={handleBlur}
          class:error={!isValidEmail && emailTouched}
          class:error-background={!isValidEmail && emailTouched && !isFocused}
        />
      </label>
      {#if !isValidEmail && emailTouched}
        <p class="error-message">Please enter a valid email address</p>
      {/if}
    </div>
    <div class="input-container">
      <label>
        <input
          bind:value={password}
          type="password"
          placeholder="Password"
          required
          on:input={handlePasswordChange}
        />
      </label>
    </div>
    {#if register}
      <div class="input-container">
        <label>
          <input
            bind:value={confirmPassword}
            type="password"
            placeholder="Confirm Password"
            required
            on:input={validatePasswordMatch}
            on:focus={handleConfirmFocus}
            on:blur={handleConfirmBlur}
            class:error={!passwordsMatch && confirmPasswordTouched}
            class:error-background={!passwordsMatch &&
              confirmPasswordTouched &&
              !confirmPasswordFocused}
          />
        </label>
        {#if !passwordsMatch && confirmPasswordTouched}
          <p class="error-message">Passwords do not match</p>
        {/if}
      </div>
    {/if}
    <div class="cta-container">
      <Button
        cta={register ? 'Sign Up' : 'Log in'}
        buttonType="primary"
        onClickFunc={handleSubmit}
      />
    </div>
  </form>
  {#if register}
    <span class="sign-up">
      <p>Already have an account?</p>
      <button
        on:click={() => {
          register = false;
          authError = false; // Clear auth error when switching modes
        }}
      >
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.bold}; text-align: center;"
        >
          Log in
        </p>
      </button>
    </span>
  {:else}
    <span class="sign-up">
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium}; text-align: center;"
      >
        Don't have an account?
      </p>
      <button
        on:click={() => {
          register = true;
          authError = false; // Clear auth error when switching modes
        }}
      >
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.bold}; text-align: center;"
        >
          Sign Up
        </p>
      </button>
    </span>
  {/if}
</div>

<style>
  p {
    margin: 0;
    color: var(--text-primary);
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: center;
    justify-content: center;
    row-gap: 16px;
    margin-bottom: 52px;
  }

  .banner {
    min-height: 200px;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: visible;
    z-index: 0;
  }

  .blob {
    position: absolute;
    top: -418px;
    left: -50px;
    width: auto;
    z-index: 0;
  }

  .logo {
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    z-index: 1;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 12px;
    margin-bottom: 8px;
    margin-top: -16px;
  }

  /* Authentication error styling */
  .auth-error-container {
    width: 100%;
    box-sizing: border-box;
    padding: 0 24px;
  }

  .auth-error-message {
    padding: 16px;
    background-color: var(--background-error);
    color: var(--text-error);
    border: 1px solid var(--text-error);
    border-radius: 4px;
    font-size: 14px;
    font-family: var(--typography-font-family-body);
    text-align: center;
  }

  .container form {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    row-gap: 16px;
    width: 100%;
    padding: 0 24px;
  }

  form input {
    box-sizing: border-box;
    color: var(--text-primary);
    height: 40px;
    padding: 8px;
    width: 100%;
    background-color: var(--background);
    border: 1px solid var(--text-secondary);
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  form input::placeholder {
    color: var(--text-secondary);
    opacity: 1;
  }

  form input:focus {
    outline: none;
    border-color: var(--color-blue-525);
  }

  /* Error states for the input */
  form input.error {
    border-color: var(--text-error); /* Red border for error state */
  }

  form input.error-background {
    background-color: var(--background-error); /* Light red background when not focused */
  }

  /* Input container to hold both input and error message */
  .input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* Error message styling */
  .error-message {
    color: var(--text-error);
    font-size: 12px;
    margin-top: 4px;
    font-family: var(--typography-font-family-body);
  }

  .cta-container {
    margin-top: 40px;
  }

  .sign-up {
    display: flex;
    column-gap: 4px;
  }

  .sign-up button {
    background-color: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
  }
</style>
