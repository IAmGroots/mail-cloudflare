<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { sidebarCollapsed, darkMode } from '$lib/stores/ui.store';
  import BrandLockup from '$lib/components/molecules/BrandLockup.svelte';
  import SidebarNavItem from '$lib/components/molecules/SidebarNavItem.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let active: 'dashboard' | 'users' | 'worker' = 'dashboard';
  export let adminEmail: string | null = null;

  $: compact = $sidebarCollapsed;
  $: adminInitial = adminEmail ? adminEmail.charAt(0).toUpperCase() : '';
  $: adminName = adminEmail ? adminEmail.split('@')[0] : '';

  let sidebarElement: HTMLElement | null = null;
  let isMobileViewport = false;
  let releaseOutsideHandler: (() => void) | null = null;
  let loggingOut = false;

  function bindOutsideCollapse() {
    releaseOutsideHandler?.();
    releaseOutsideHandler = null;

    if (typeof window === 'undefined' || compact || isMobileViewport) {
      return;
    }

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (compact || isMobileViewport) {
        return;
      }

      const target = event.target as Node | null;
      if (!target || !sidebarElement) {
        return;
      }

      const eventPath = 'composedPath' in event ? event.composedPath() : [];
      if (Array.isArray(eventPath) && sidebarElement && eventPath.includes(sidebarElement)) {
        return;
      }

      if (!sidebarElement.contains(target)) {
        sidebarCollapsed.set(true);
      }
    };

    window.addEventListener('mousedown', handleOutside, true);
    window.addEventListener('touchstart', handleOutside, true);
    releaseOutsideHandler = () => {
      window.removeEventListener('mousedown', handleOutside, true);
      window.removeEventListener('touchstart', handleOutside, true);
    };
  }

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

  onMount(() => {
    const media = window.matchMedia('(max-width: 960px)');
    isMobileViewport = media.matches;
    bindOutsideCollapse();

    const handleViewportChange = (event: MediaQueryListEvent) => {
      isMobileViewport = event.matches;
      if (event.matches) {
        sidebarCollapsed.set(true);
      }
      bindOutsideCollapse();
    };

    media.addEventListener('change', handleViewportChange);
    return () => {
      media.removeEventListener('change', handleViewportChange);
      releaseOutsideHandler?.();
    };
  });

  $: bindOutsideCollapse();
</script>

{#if !compact}
  <button class="backdrop" type="button" aria-label="Collapse sidebar overlay" on:click={() => sidebarCollapsed.set(true)}></button>
{/if}

<aside bind:this={sidebarElement} class={`sidebar ${compact ? 'collapsed' : ''}`}>
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
    {#if adminEmail}
      <div class="admin-info" title={adminEmail}>
        <span class="admin-avatar" aria-hidden="true">{adminInitial}</span>
        {#if !compact}
          <span class="admin-name">{adminName}</span>
        {/if}
      </div>
    {/if}

    <div class="bottom-actions">
      <button
        class="sidebar-action"
        type="button"
        aria-label={compact ? 'Ganti tema' : ($darkMode ? 'Mode terang' : 'Mode gelap')}
        on:click={() => darkMode.update(v => !v)}
        title={compact ? 'Ganti tema' : ''}
      >
        <Icon name={$darkMode ? 'light_mode' : 'dark_mode'} size={18} />
        {#if !compact}
          <span>{$darkMode ? 'Mode terang' : 'Mode gelap'}</span>
        {/if}
      </button>

      <button
        class="sidebar-action logout"
        type="button"
        aria-label="Keluar"
        disabled={loggingOut}
        on:click={handleLogout}
        title={compact ? 'Keluar' : ''}
      >
        <Icon name="logout" size={18} />
        {#if !compact}
          <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
        {/if}
      </button>
    </div>
  </div>
</aside>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    border: 0;
    background: color-mix(in srgb, var(--color-text), transparent 75%);
    z-index: 8;
    display: none;
  }

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
    transition: width 200ms ease, transform 200ms ease, background-color 200ms ease;
  }

  .sidebar.collapsed {
    width: 3.5rem !important;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-3) var(--space-2);
    min-height: 3.5rem;
  }

  .brand-wrap {
    min-width: 0;
    flex: 1;
  }

  .sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: var(--space-4) var(--space-3) var(--space-3);
  }

  .nav {
    flex: 1;
    display: grid;
    align-content: start;
    gap: 0.35rem;
    padding: var(--space-2) var(--space-3) var(--space-3);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar.collapsed .nav {
    padding: var(--space-2) 0.5rem var(--space-3);
  }

  .sidebar-footer {
    border-top: 1px solid var(--color-border);
    padding: var(--space-3) var(--space-3) calc(var(--space-4) + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0.45rem 0.5rem;
    border-radius: var(--radius-sm);
    min-height: 2.25rem;
  }

  .sidebar.collapsed .admin-info {
    justify-content: center;
    padding: 0.45rem 0;
  }

  .admin-avatar {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-sm);
    background: var(--color-surface-low);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    display: grid;
    place-items: center;
    font-weight: var(--weight-semibold);
    font-size: 0.7rem;
    font-family: var(--font-mono);
    flex-shrink: 0;
  }

  .admin-name {
    font-size: var(--font-size-body-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text);
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

  .sidebar.collapsed .sidebar-action {
    justify-content: center;
    padding: 0.5rem 0;
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
    .backdrop {
      display: block;
    }

    .sidebar {
      width: min(84vw, var(--size-sidebar-expanded));
      min-width: 15.5rem;
      padding-bottom: env(safe-area-inset-bottom);
      transform: translateX(calc(-100% - 0.5rem));
    }

    .sidebar.collapsed {
      width: min(84vw, var(--size-sidebar-expanded));
      transform: translateX(calc(-100% - 0.5rem));
    }

    .sidebar:not(.collapsed) {
      transform: translateX(0);
    }
  }
</style>
