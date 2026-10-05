<script lang="ts">
  export let tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
</script>

<span class={`badge badge-${tone}`}><slot /></span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--font-size-label-xs);
    font-weight: var(--weight-medium);
    border-radius: var(--radius-sm);
    padding: 0.15rem 0.45rem;
  }

  .badge-neutral {
    color: var(--color-text-muted);
    background: var(--color-surface-low);
    border: 1px solid var(--color-border);
  }

  .badge-primary {
    color: var(--color-tertiary-text);
    background: color-mix(in srgb, var(--color-tertiary), transparent 92%);
    border: 1px solid color-mix(in srgb, var(--color-tertiary), transparent 70%);
  }

  .badge-success {
    color: var(--color-success-text);
    background: color-mix(in srgb, var(--color-success), transparent 92%);
    border: 1px solid color-mix(in srgb, var(--color-success), transparent 70%);
  }

  .badge-warning {
    color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning), transparent 92%);
    border: 1px solid color-mix(in srgb, var(--color-warning), transparent 70%);
  }

  .badge-danger {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger), transparent 92%);
    border: 1px solid color-mix(in srgb, var(--color-danger), transparent 70%);
  }
</style>
