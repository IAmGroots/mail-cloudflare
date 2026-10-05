<script lang="ts">
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let href = '#';
  export let icon = 'dashboard';
  export let label = '';
  export let active = false;
  export let compact = false;
</script>

<a class={`item ${active ? 'active' : ''} ${compact ? 'compact' : ''}`} {href} aria-current={active ? 'page' : undefined}>
  <Icon name={icon} size={20} />
  {#if !compact}
    <span>{label}</span>
  {/if}
</a>

<style>
  .item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.75rem;
    min-height: 44px;
    color: var(--color-text-muted);
    font-weight: var(--weight-medium);
    transition: background-color 120ms ease, color 120ms ease;
  }

  .item:hover {
    background: var(--color-surface-low);
    color: var(--color-text);
  }

  .item.active {
    color: var(--color-tertiary-text);
    background: color-mix(in srgb, var(--color-tertiary), transparent 92%);
    font-weight: var(--weight-semibold);
  }

  .compact {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
  }
</style>
