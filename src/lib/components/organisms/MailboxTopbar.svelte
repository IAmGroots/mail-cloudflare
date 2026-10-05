<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { darkMode } from '$lib/stores/ui.store';
  import SearchField from '$lib/components/molecules/SearchField.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let userLabel = '';
  export let searchQuery = '';
  export let searchPlaceholder = 'Cari email...';
  export let searchLabel = 'Cari';
  export let onSearch: (() => void) | undefined = undefined;
  export let showSearch = true;
  export let showRefresh = true;
  export let showLogout = true;

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

<header class="topbar">
  <div class="inner">
    <div class="left">
      <a class="brand" href="/me/inbox" aria-label="Ke inbox">
        <span class="brand-icon" aria-hidden="true"><Icon name="cloud" size={18} /></span>
        <span class="brand-name">MailFlare</span>
      </a>
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
    </div>

    <div class="right">
      {#if showRefresh}
        <button class="icon-btn" type="button" aria-label="Muat ulang inbox" on:click={handleRefresh} disabled={refreshing || loggingOut}>
          <Icon name="refresh" size={18} />
        </button>
      {/if}

      <slot name="actions" />

      <button
        class="icon-btn"
        type="button"
        aria-label={$darkMode ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
        on:click={handleThemeToggle}
      >
        <Icon name={$darkMode ? 'light_mode' : 'dark_mode'} size={18} />
      </button>

      {#if showLogout}
        <div class="divider" aria-hidden="true"></div>
        {#if userLabel}
          <span class="user">{userLabel}</span>
        {/if}
        <button class="logout" type="button" disabled={loggingOut} on:click={handleLogout}>
          <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
          <Icon name="logout" size={18} />
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--color-surface-card);
    border-bottom: 1px solid var(--color-border);
  }

  .inner {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0.75rem 1.25rem;
    display: flex;
    gap: var(--space-3);
    justify-content: space-between;
    align-items: center;
  }

  .left {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .brand-icon {
    width: 1.9rem;
    height: 1.9rem;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-inverse-text);
    background: var(--color-primary);
  }

  .brand-name {
    font-family: var(--font-mono);
    color: var(--color-text);
    font-size: 1rem;
    font-weight: var(--weight-semibold);
  }

  .search {
    width: min(42rem, 100%);
  }

  .right {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: nowrap;
    justify-content: flex-end;
    min-width: 0;
  }

  .icon-btn {
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
  }

  .icon-btn:hover {
    color: var(--color-tertiary-text);
    border-color: var(--color-tertiary-text);
  }

  .divider {
    width: 1px;
    height: 1.8rem;
    background: var(--color-border);
  }

  .user {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    font-weight: var(--weight-medium);
    color: var(--color-text);
  }

  .logout {
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
    min-height: 44px;
    padding: 0 0.4rem;
  }

  .logout:hover {
    color: var(--color-danger);
  }

  @media (max-width: 960px) {
    .inner {
      padding: 0.65rem 0.85rem;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .left {
      width: 100%;
    }

    .search {
      width: 100%;
    }

    .right {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .right :global(.btn),
    .icon-btn,
    .logout,
    .user {
      flex: 0 0 auto;
    }

    .divider,
    .user {
      display: none;
    }
  }
</style>
