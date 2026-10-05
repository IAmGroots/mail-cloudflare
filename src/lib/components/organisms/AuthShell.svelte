<script lang="ts">
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let footerHref = '';
  export let footerLabel = '';
  export let footerIcon = 'vpn_key';
</script>

<div class="auth-page">
  <div class="auth-card">
    <header class="card-header">
      <span class="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="20" height="20">
          <path d="M6 11.5A1.5 1.5 0 0 1 7.5 10h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 6 20.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          <path d="m7 11 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="brand-label">MailFlare</span>
    </header>

    <div class="divider" aria-hidden="true"></div>

    <main class="form">
      <slot />
    </main>

    {#if footerHref && footerLabel}
      <div class="divider" aria-hidden="true"></div>
      <footer class="card-footer">
        <a class="footer-link" href={footerHref}>
          <Icon name={footerIcon} size={14} />
          <span>{footerLabel}</span>
        </a>
      </footer>
    {/if}
  </div>
</div>

<style>
  .auth-page {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: var(--space-3);
    background: var(--color-surface);
  }

  .auth-card {
    width: min(400px, 100%);
    background: var(--color-surface-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-3);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }

  .brand-icon {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-sm);
    background: var(--color-primary);
    color: var(--color-inverse-text);
    display: grid;
    place-items: center;
  }

  .brand-label {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: var(--weight-semibold);
    color: var(--color-text);
  }

  .divider {
    height: 1px;
    background: var(--color-border);
  }

  .form {
    display: grid;
    gap: var(--space-2);
  }

  .card-footer {
    display: flex;
    justify-content: center;
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--font-size-body-sm);
    color: var(--color-text-muted);
    min-height: 44px;
    padding: 0 0.5rem;
  }

  .footer-link:hover {
    color: var(--color-tertiary-text);
  }
</style>
