<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { sidebarCollapsed } from '$lib/stores/ui.store';
  import AppSidebar from '$lib/components/organisms/AppSidebar.svelte';
  import AppTopbar from '$lib/components/organisms/AppTopbar.svelte';
  import MailboxTopbar from '$lib/components/organisms/MailboxTopbar.svelte';
  import InboxTable from '$lib/components/organisms/InboxTable.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let userId: string;
  export let emails: Array<{
    id: string;
    sender: string;
    subject: string;
    snippet: string;
    receivedAt: string;
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
  }>;
  export let currentUser:
    | { displayName?: string; email?: string; totalEmails?: number }
    | null = null;
  export let search: { query: string; resultCount: number } | null = null;
  export let archivedCount = 0;
  export let hrefBase = '/me/inbox';
  export let emailHrefPrefix = '/me/emails';
  export let showChrome = false;
  export let userLabel = '';

  let searchQuery = '';
  $: adminEmail = $page.data.sessionEmail ?? null;

  $: inboxCount = Math.max(0, Number(currentUser?.totalEmails ?? emails.length) - archivedCount);
  $: unreadCount = emails.filter((email) => !email.isRead && !email.isArchived).length;
  $: starredCount = emails.filter((email) => email.isStarred && !email.isArchived).length;
  $: activeQuery = search?.query ?? '';
  $: isSearching = search !== null;

  afterNavigate(({ to }) => {
    const next = to?.url.searchParams.get('q') ?? '';
    if (next !== searchQuery) {
      searchQuery = next;
    }
  });

  function buildHref(q: string): string {
    const trimmed = q.trim();
    if (!trimmed) return hrefBase;
    return `${hrefBase}?q=${encodeURIComponent(trimmed.slice(0, 200))}`;
  }

  function handleSubmit() {
    void goto(buildHref(searchQuery), { replaceState: true, keepFocus: true, noScroll: true });
  }

  function handleClear() {
    searchQuery = '';
    void goto(buildHref(''), { replaceState: true, keepFocus: true, noScroll: true });
  }
</script>

{#snippet resultList()}
  {#if isSearching && emails.length === 0}
    <div class="empty-state">
      <Icon name="search_off" size={32} />
      <h3>Tidak ada email yang cocok</h3>
      <p>Coba kata kunci lain. Pencarian memindai subject, pengirim, penerima, dan isi email.</p>
      <button type="button" class="reset-btn" on:click={handleClear}>
        <Icon name="arrow_back" size={16} />
        <span>Kembali ke inbox</span>
      </button>
    </div>
  {:else}
    <InboxTable {userId} {emails} {emailHrefPrefix} />
  {/if}
{/snippet}

{#snippet statsFooter()}
  <footer class="stats-footer">
    <div class="stats-grid">
      <div class="stat"><span>Total Inbox</span><strong>{inboxCount}</strong></div>
      <div class="separator" aria-hidden="true"></div>
      <div class="stat"><span>Total Berbintang</span><strong>{starredCount}</strong></div>
      <div class="separator" aria-hidden="true"></div>
      <div class="stat"><span>Total Diarsip</span><strong>{archivedCount}</strong></div>
    </div>
  </footer>
{/snippet}

{#if showChrome}
  <div class="layout-shell">
    <AppSidebar active="users" {adminEmail} />
    <section class="main" class:sidebar-collapsed={$sidebarCollapsed}>
      <AppTopbar title="Inbox" variant="minimal" showRefresh={false} showLogout={false} />
      <div class="content">
        <div class="inbox-head">
          {#if isSearching}
            <div class="search-indicator" role="status">
              <Icon name="search" size={16} />
              <span>Hasil untuk <strong>"{activeQuery}"</strong>, {search?.resultCount ?? 0} email</span>
              <button type="button" class="clear-btn" on:click={handleClear} aria-label="Reset pencarian">
                <Icon name="close" size={16} />
                <span>Reset</span>
              </button>
            </div>
          {/if}
        </div>
        {@render resultList()}
      </div>
      {@render statsFooter()}
    </section>
  </div>
{:else}
  <section class="standalone">
    <MailboxTopbar {userLabel} bind:searchQuery searchPlaceholder="Cari di subject, pengirim, atau isi email..." onSearch={handleSubmit} />
    <div class="content">
      <div class="inbox-head">
        <div class="title-wrap">
          <h1>Inbox</h1>
          <span class="badge">{unreadCount} baru</span>
        </div>
        {#if isSearching}
          <div class="search-indicator" role="status">
            <Icon name="search" size={16} />
            <span>Hasil untuk <strong>"{activeQuery}"</strong>, {search?.resultCount ?? 0} email</span>
            <button type="button" class="clear-btn" on:click={handleClear} aria-label="Reset pencarian">
              <Icon name="close" size={16} />
              <span>Reset</span>
            </button>
          </div>
        {/if}
      </div>
      {@render resultList()}
    </div>
    {@render statsFooter()}
  </section>
{/if}

<style>
  .main {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .main .content {
    flex: 1;
  }

  .standalone {
    min-height: 100dvh;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .content {
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-3);
  }

  .inbox-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .title-wrap {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  h1 {
    font-size: 1.6rem;
    line-height: 1.2;
  }

  .badge {
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-tertiary), transparent 92%);
    border: 1px solid color-mix(in srgb, var(--color-tertiary), transparent 70%);
    color: var(--color-tertiary-text);
    padding: 0.15rem 0.45rem;
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
  }

  .search-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.5rem 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    background: var(--color-surface-low);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--font-size-label-sm);
    flex-wrap: wrap;
  }

  .search-indicator strong {
    color: var(--color-text);
    font-weight: var(--weight-medium);
  }

  .clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface-card);
    color: var(--color-text);
    border-radius: var(--radius-sm);
    padding: 0.3rem 0.6rem;
    min-height: 30px;
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
    cursor: pointer;
  }

  .clear-btn:hover {
    border-color: var(--color-tertiary);
    color: var(--color-tertiary-text);
  }

  .empty-state {
    display: grid;
    place-items: center;
    gap: 0.6rem;
    text-align: center;
    padding: var(--space-6) var(--space-3);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
  }

  .empty-state h3 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--color-text);
  }

  .empty-state p {
    margin: 0;
    max-width: 42ch;
  }

  .reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid var(--color-primary);
    background: var(--color-primary);
    color: var(--color-inverse-text);
    font-weight: var(--weight-medium);
    font-size: var(--font-size-body-sm);
    padding: 0.55rem 1rem;
    min-height: 44px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    margin-top: 0.4rem;
  }

  .stats-footer {
    border-top: 1px solid var(--color-border);
    padding: var(--space-4) var(--space-3);
  }

  .standalone .stats-footer {
    margin-top: auto;
  }

  .stats-grid {
    max-width: 80rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
  }

  .stat {
    text-align: center;
  }

  .stat span {
    display: block;
    font-size: var(--font-size-label-sm);
    color: var(--color-text-muted);
    margin-bottom: 0.35rem;
    font-weight: var(--weight-medium);
  }

  .stat strong {
    font-family: var(--font-mono);
    font-size: 1.4rem;
  }

  .separator {
    width: 1px;
    height: 2.2rem;
    background: var(--color-border);
  }

  @media (max-width: 960px) {
    h1 {
      font-size: 1.35rem;
    }

    .stats-grid {
      gap: var(--space-2);
      width: 100%;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .separator {
      display: none;
    }

    .stat strong {
      font-size: 1.2rem;
    }
  }
</style>
