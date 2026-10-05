<script lang="ts">
  export let type: 'button' | 'submit' = 'button';
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let fullWidth = false;
  export let disabled = false;
  export let href = '';
</script>

{#if href}
  <a class={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`} {href}>
    <slot />
  </a>
{:else}
  <button class={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`} {type} {disabled} on:click>
    <slot />
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 44px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    padding: 0.6rem 1rem;
    cursor: pointer;
    font-weight: var(--weight-medium);
    transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-full {
    width: 100%;
  }

  .btn-primary {
    color: var(--color-inverse-text);
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .btn-primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-primary), var(--color-tertiary) 12%);
  }

  .btn-secondary {
    color: var(--color-text);
    background: var(--color-surface-card);
    border-color: var(--color-border);
  }

  .btn-secondary:hover:not(:disabled) {
    border-color: var(--color-tertiary-text);
    color: var(--color-tertiary-text);
  }

  .btn-ghost {
    color: var(--color-text-muted);
    background: transparent;
    border-color: transparent;
  }

  .btn-ghost:hover:not(:disabled) {
    color: var(--color-text);
    background: var(--color-surface-low);
  }
</style>
