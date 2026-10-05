<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { darkMode } from '$lib/stores/ui.store';
  import SearchField from '$lib/components/molecules/SearchField.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let title = 'MailFlare';
  export let breadcrumb = '';
  export let showSearch = true;
  export let searchQuery = '';
  export let searchPlaceholder = 'Cari...';
  export let searchLabel = 'Cari';
  export let onSearch: (() => void) | undefined = undefined;
  export let showRefresh = true;
  export let showLogout = true;
  export let showThemeToggle = true;
  export let variant: 'full' | 'minimal' = 'full';

  $: isMinimal = variant === 'minimal';

  let refreshing = false;
  let loggingOut = false;

  async function handleRefresh() {
    if (refreshing || loggingOut) {
      return;
    }
    refreshing = true;
    try {
      await invalidateAll();
    } finally {
      refreshing = false;
    }
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    loggingOut = true;
    try {
      await fetch('/api/auth/logout');
    } finally {
      await goto('/auth/login');
      loggingOut = false;
    }
  }

  function handleThemeToggle() {
    darkMode.update((value) => !value);
  }
</script>

<header class="topbar" class:minimal={isMinimal}>
  <div class="left">
    {#if !isMinimal && breadcrumb}
      <div class="crumb">{breadcrumb}</div>
    {/if}
    <h1>{title}</h1>
  </div>
  <div class="right">
    {#if !isMinimal}
      {#if showSearch}
        <div class="search">
          <SearchField
            bind:value={searchQuery}
            placeholder={searchPlaceholder}
            {searchLabel}
            {onSearch}
          />
        </div>
      {/if}
      <slot name="actions" />
      {#if showRefresh}
        <Button variant="secondary" disabled={refreshing || loggingOut} on:click={handleRefresh}>
          <Icon name="refresh" size={18} />
          {refreshing ? 'Memuat...' : 'Muat ulang'}
        </Button>
      {/if}
      {#if showThemeToggle}
        <button
          class="icon-action"
          type="button"
          aria-label={$darkMode ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          on:click={handleThemeToggle}
        >
          <Icon name={$darkMode ? 'light_mode' : 'dark_mode'} size={18} />
        </button>
      {/if}
      {#if showLogout}
        <Button variant="ghost" disabled={loggingOut} on:click={handleLogout}>
          <Icon name="logout" size={18} />
          {loggingOut ? 'Keluar...' : 'Keluar'}
        </Button>
      {/if}
    {/if}
  </div>
</header>

<style>
  .topbar {
    height: 64px;
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-card);
  }

  .topbar.minimal {
    padding: var(--space-3);
  }

  .left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }
  .left h1 {
    font-size: 1rem;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .minimal .left h1 {
    font-size: 1.05rem;
    font-weight: var(--weight-bold);
  }

  .crumb {
    font-size: var(--font-size-label-sm);
    color: var(--color-text-muted);
    font-weight: var(--weight-medium);
  }

  .right {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
  }

  .search {
    width: min(28rem, 42vw);
  }

  .icon-action {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 120ms ease, border-color 120ms ease, background-color 120ms ease;
  }

  .icon-action:hover {
    color: var(--color-tertiary-text);
    border-color: var(--color-tertiary-text);
  }

  @media (max-width: 960px) {
    .topbar {
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--space-1);
      padding: 0.75rem 0.9rem;
    }

    .topbar.minimal {
      padding: 0.6rem 0.9rem;
    }

    .left {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
      width: 100%;
    }

    .left h1 {
      margin-top: 0;
      font-size: 0.95rem;
    }

    .crumb {
      display: none;
    }

    .right {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .search {
      width: 100%;
      min-width: min(18rem, 100%);
    }

    .right :global(.btn),
    .icon-action {
      flex: 0 0 auto;
    }
  }
</style>
