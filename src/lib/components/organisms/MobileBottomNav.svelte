<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Icon from '$lib/components/atoms/Icon.svelte';

  type NavItem = {
    key: string;
    href: string;
    label: string;
    icon: string;
  };

  // Owner sees the three admin destinations; members see their own inbox.
  export let items: NavItem[] = [
    { key: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'users', href: '/users', label: 'User', icon: 'group' },
    { key: 'worker', href: '/worker/settings', label: 'Worker', icon: 'settings_input_component' }
  ];

  let optimisticKey = '';

  function normalizePath(path: string): string {
    return (path || '/').replace(/\/+$/, '') || '/';
  }

  function resolveActiveKey(path: string): string {
    return items.find((item) => path.startsWith(item.href))?.key ?? '';
  }

  $: pathname = normalizePath($page.url.pathname);
  $: routeActiveKey = resolveActiveKey(pathname);
  $: activeKey = optimisticKey || routeActiveKey;
  $: if (optimisticKey && routeActiveKey === optimisticKey) optimisticKey = '';

  async function handleNavigate(event: MouseEvent, item: NavItem) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    optimisticKey = item.key;
    await goto(item.href);
  }
</script>

<nav class="mobile-nav" aria-label="Navigasi utama" style={`grid-template-columns: repeat(${items.length}, minmax(0, 1fr))`}>
  {#each items as item (item.key)}
    <a
      href={item.href}
      class={`item ${activeKey === item.key ? 'active' : ''}`}
      aria-current={activeKey === item.key ? 'page' : undefined}
      on:click={(event) => handleNavigate(event, item)}
    >
      <Icon name={item.icon} size={18} />
      <span>{item.label}</span>
    </a>
  {/each}
</nav>

<style>
  .mobile-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: none;
    gap: 0.25rem;
    min-height: var(--mobile-nav-height);
    padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom));
    border-top: 1px solid var(--color-border);
    background: var(--color-surface-card);
  }

  .item {
    min-height: 44px;
    border-radius: var(--radius-sm);
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 0.2rem;
    color: var(--color-text-muted);
    font-size: 0.7rem;
    font-weight: var(--weight-medium);
    transition: color 120ms ease, background-color 120ms ease;
  }

  .item.active {
    color: var(--color-tertiary-text);
    background: color-mix(in srgb, var(--color-tertiary), transparent 92%);
  }

  .item span {
    white-space: nowrap;
  }

  @media (max-width: 960px) {
    .mobile-nav {
      display: grid;
    }
  }
</style>
