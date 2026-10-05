<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import AuthShell from '$lib/components/organisms/AuthShell.svelte';
  import AuthField from '$lib/components/molecules/AuthField.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import { apiRequest, jsonBody } from '$lib/utils/api';

  let identifier = '';
  let password = '';
  let setupToken = '';
  let errorMessage = '';
  let isSubmitting = false;
  let turnstileToken = '';

  export let turnstileSiteKey: string;
  export let showSetupTokenField = false;

  onMount(() => {
    if (typeof window === 'undefined') return;
    const timer = setInterval(() => {
      if ((window as any).turnstile) {
        clearInterval(timer);
        (window as any).turnstile.render('#turnstile-widget', {
          sitekey: turnstileSiteKey,
          callback: (token: string) => {
            turnstileToken = token;
          }
        });
      }
    }, 200);
    return () => clearInterval(timer);
  });

  async function handleSubmit() {
    if (isSubmitting) return;

    errorMessage = '';
    isSubmitting = true;

    try {
      const result = await apiRequest<{ error?: string }>(
        '/api/auth/login',
        jsonBody({
          identifier,
          password,
          setupToken: showSetupTokenField ? setupToken : '',
          turnstileToken
        })
      );

      if (!result.ok) {
        errorMessage = result.data?.error ?? 'Login gagal.';
        return;
      }

      await goto('/dashboard');
    } catch {
      errorMessage = 'Tidak dapat menghubungi server. Coba lagi.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<AuthShell footerHref="/auth/access-code" footerLabel="Gunakan kode akses" footerIcon="vpn_key">
  <form class="login-form" on:submit|preventDefault={handleSubmit}>
    {#if showSetupTokenField}
      <AuthField
        id="setupToken"
        label="Token setup"
        bind:value={setupToken}
        type="password"
        icon="vpn_key"
        placeholder="Diperlukan untuk setup pemilik pertama"
        hint="Hanya untuk login pertama kali"
      />
    {/if}

    <AuthField
      id="identifier"
      label="Username atau email"
      bind:value={identifier}
      icon="person"
      autocomplete="username"
      placeholder="nama@domain.com"
    />

    <AuthField
      id="password"
      label="Password"
      bind:value={password}
      type="password"
      icon="lock"
      autocomplete="current-password"
      placeholder="••••••••"
      showPasswordToggle={true}
    />

    <div class="turnstile-wrap">
      <div id="turnstile-widget"></div>
    </div>

    {#if errorMessage}
      <p class="error" role="alert">{errorMessage}</p>
    {/if}

    <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
      {isSubmitting ? 'Memproses...' : 'Masuk'}
    </Button>
  </form>
</AuthShell>

<style>
  .login-form {
    display: grid;
    gap: var(--space-2);
  }

  .turnstile-wrap {
    display: flex;
    justify-content: center;
  }

  .error {
    margin: 0;
    font-size: var(--font-size-body-sm);
    color: var(--color-error);
  }
</style>
