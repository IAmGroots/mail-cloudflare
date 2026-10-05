<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import AuthShell from '$lib/components/organisms/AuthShell.svelte';
  import AuthField from '$lib/components/molecules/AuthField.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import { apiRequest, jsonBody } from '$lib/utils/api';

  let accessCode = '';
  let errorMessage = '';
  let isSubmitting = false;
  let turnstileToken = '';

  export let turnstileSiteKey: string;

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
        '/api/auth/access-code',
        jsonBody({ code: accessCode, turnstileToken })
      );

      if (!result.ok) {
        errorMessage = result.data?.error ?? 'Kode akses tidak valid.';
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

<AuthShell footerHref="/auth/login" footerLabel="Masuk dengan username dan password" footerIcon="login">
  <form class="access-form" on:submit|preventDefault={handleSubmit}>
    <AuthField
      id="accessCode"
      label="Kode akses"
      bind:value={accessCode}
      icon="vpn_key"
      placeholder="MF-XXXX-XXXX-XXXX"
      hint="Kode sekali pakai yang dibuat dari perangkat admin"
    />

    <div class="turnstile-wrap">
      <div id="turnstile-widget"></div>
    </div>

    {#if errorMessage}
      <p class="error" role="alert">{errorMessage}</p>
    {/if}

    <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
      {isSubmitting ? 'Membuka...' : 'Buka akses'}
    </Button>
  </form>
</AuthShell>

<style>
  .access-form {
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
