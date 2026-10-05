<script lang="ts">
  export let compact = false;
</script>

<div class="brand">
  <div class="logo">
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <path d="M6 11.5A1.5 1.5 0 0 1 7.5 10h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 6 20.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="m7 11 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
  {#if !compact}
    <div class="name">MailFlare</div>
  {/if}
</div>

<style>
  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .logo {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-sm);
    background: var(--color-primary);
    color: var(--color-inverse-text);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .name {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: var(--weight-semibold);
    color: var(--color-text);
  }
</style>
