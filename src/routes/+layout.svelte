<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import MobileBottomNav from '$lib/components/organisms/MobileBottomNav.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  type NavItem = { key: string; href: string; label: string; icon: string };

  const ownerNav: NavItem[] = [
    { key: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'users', href: '/users', label: 'User', icon: 'group' },
    { key: 'worker', href: '/worker/settings', label: 'Worker', icon: 'settings_input_component' }
  ];

  const memberNav: NavItem[] = [
    { key: 'inbox', href: '/me/inbox', label: 'Inbox', icon: 'inbox' }
  ];

  $: pathname = $page.url.pathname;
  $: showAppNav = !pathname.startsWith('/auth') && !pathname.startsWith('/api');
  $: navItems = data.sessionRole === 'owner' ? ownerNav : memberNav;
</script>

<div class={`app-frame ${showAppNav ? 'with-mobile-nav' : ''}`}>
  <slot />
</div>

{#if showAppNav}
  <MobileBottomNav items={navItems} />
{/if}

<style>
  .app-frame {
    min-height: 100dvh;
  }

  @media (max-width: 960px) {
    .app-frame.with-mobile-nav {
      padding-bottom: var(--mobile-nav-height);
    }
  }
</style>
