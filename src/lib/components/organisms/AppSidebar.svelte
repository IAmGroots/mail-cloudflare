<script lang="ts">
  import { goto } from '$app/navigation';
  import { darkMode } from '$lib/stores/ui.store';
  import BrandLockup from '$lib/components/molecules/BrandLockup.svelte';
  import SidebarNavItem from '$lib/components/molecules/SidebarNavItem.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let active: 'dashboard' | 'users' | 'worker' = 'dashboard';
  export let adminEmail: string | null = null;

  const compact = false;
  $: adminName = adminEmail ? adminEmail.split('@')[0] : '';

  let loggingOut = false;

  async function handleLogout() {
    if (loggingOut) return;
    loggingOut = true;
    try {
      await fetch('/api/auth/logout');
    } finally {
      await goto('/auth/login');
      loggingOut = false;
    }
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <div class="brand-wrap">
      <BrandLockup compact={compact} />
    </div>
  </div>

  <nav class="nav" aria-label="Navigasi utama">
    <SidebarNavItem href="/dashboard" icon="dashboard" label="Dashboard" active={active === 'dashboard'} compact={compact} />
    <SidebarNavItem href="/users" icon="group" label="Daftar User" active={active === 'users'} compact={compact} />
    <SidebarNavItem href="/worker/settings" icon="settings_input_component" label="Pengaturan Worker" active={active === 'worker'} compact={compact} />
  </nav>

  <div class="sidebar-footer">
    <div class="bottom-actions">
      {#if adminEmail}
        <div class="admin-info" title={adminEmail}>
          <Icon name="person" size={18} />
          <span class="admin-name">{adminName}</span>
        </div>
      {/if}

      <button
        class="sidebar-action"
        type="button"
        aria-label={$darkMode ? 'Mode terang' : 'Mode gelap'}
        on:click={() => darkMode.update(v => !v)}
      >
        <Icon name={$darkMode ? 'light_mode' : 'dark_mode'} size={18} />
        <span>{$darkMode ? 'Mode terang' : 'Mode gelap'}</span>
      </button>

      <button
        class="sidebar-action logout"
        type="button"
        aria-label="Keluar"
        disabled={loggingOut}
        on:click={handleLogout}
      >
        <Icon name="logout" size={18} />
        <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
      </button>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    height: 100dvh;
    width: var(--size-sidebar-expanded);
    display: flex;
    flex-direction: column;
    background: var(--color-surface-card);
    border-right: 1px solid var(--color-border);
    z-index: 9;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2);
    height: 64px;
    border-bottom: 1px solid var(--color-border);
  }

  .brand-wrap {
    min-width: 0;
    display: flex;
    justify-content: center;
  }

  .nav {
    flex: 1;
    display: grid;
    align-content: start;
    gap: 0.35rem;
    padding: var(--space-3);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .nav::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .sidebar-footer {
    border-top: 1px solid var(--color-border);
    padding: calc(var(--space-3) + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0.5rem 0.6rem;
    border-radius: var(--radius-sm);
    min-height: 44px;
    color: var(--color-text-muted);
    transition: color 120ms ease, background-color 120ms ease;
    cursor: pointer;
  }

  .admin-info:hover {
    color: var(--color-text);
    background: var(--color-surface-low);
  }

  .admin-name {
    font-size: var(--font-size-body-sm);
    font-weight: var(--weight-medium);
    color: inherit;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bottom-actions {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .sidebar-action {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0.5rem 0.6rem;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-body-sm);
    font-family: inherit;
    cursor: pointer;
    transition: color 120ms ease, background-color 120ms ease;
    width: 100%;
    text-align: left;
    min-height: 44px;
  }

  .sidebar-action:hover {
    color: var(--color-text);
    background: var(--color-surface-low);
  }

  .sidebar-action.logout {
    color: var(--color-danger);
  }

  .sidebar-action.logout:hover {
    background: color-mix(in srgb, var(--color-danger), transparent 90%);
  }

  @media (max-width: 960px) {
    .sidebar {
      position: sticky;
      inset: auto;
      top: 0;
      width: 100%;
      height: auto;
      max-height: none;
      border-right: none;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 9;
    }

    .nav {
      overflow: visible;
    }
  }
</style>
