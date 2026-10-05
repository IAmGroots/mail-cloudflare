<script lang="ts">
  import type { EmailDto } from '$lib/types/dto';
  import CardSurface from '$lib/components/atoms/CardSurface.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let emails: EmailDto[] = [];
  export let userId = '';
  export let emailHrefPrefix = '';

  $: rowHrefPrefix = emailHrefPrefix || `/users/${userId}/emails`;
  $: primaryCount = emails.filter((email) => !email.isArchived).length;
  $: starredCount = emails.filter((email) => email.isStarred && !email.isArchived).length;
  $: archivedCount = emails.filter((email) => email.isArchived).length;

  type InboxTab = 'primary' | 'starred' | 'archived';
  let activeTab: InboxTab = 'primary';

  const tabs: { key: InboxTab; label: string }[] = [
    { key: 'primary', label: 'Utama' },
    { key: 'starred', label: 'Berbintang' },
    { key: 'archived', label: 'Diarsip' }
  ];

  $: countFor = (key: InboxTab) =>
    key === 'starred' ? starredCount : key === 'archived' ? archivedCount : primaryCount;

  $: visibleEmails = (
    activeTab === 'starred'
      ? emails.filter((email) => email.isStarred && !email.isArchived)
      : activeTab === 'archived'
        ? emails.filter((email) => email.isArchived)
        : emails.filter((email) => !email.isArchived)
  )
    .slice()
    .sort((a, b) => {
      const ta = new Date(a.receivedAt).getTime();
      const tb = new Date(b.receivedAt).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });

  $: emptyMessage =
    activeTab === 'starred'
      ? 'Belum ada email berbintang.'
      : activeTab === 'archived'
        ? 'Belum ada email diarsip.'
        : 'Inbox masih kosong.';

  function initials(sender: string): string {
    const plain = sender.replace(/["<>]/g, ' ').trim();
    const parts = plain.split(/\s+/).filter(Boolean);
    if (!parts.length) return 'EM';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  function timeLabel(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '-';

    const now = new Date();
    const sameDay =
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate();

    if (sameDay) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  }
</script>

<CardSurface className="mailbox-card">
  <div class="mailbox-filter">
    <div class="tabs" role="tablist" aria-label="Filter email">
      {#each tabs as tab (tab.key)}
        <button
          type="button"
          role="tab"
          id={`tab-${tab.key}`}
          aria-selected={activeTab === tab.key}
          aria-controls="mailbox-list"
          class={`tab ${activeTab === tab.key ? 'active' : ''}`}
          on:click={() => (activeTab = tab.key)}
        >
          {tab.label} <span>{countFor(tab.key)}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="table" id="mailbox-list" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
    {#if visibleEmails.length === 0}
      <div class="empty">{emptyMessage}</div>
    {:else}
      {#each visibleEmails as email (email.id)}
        <a href={`${rowHrefPrefix}/${email.id}`} class={`mailbox-row ${email.isRead ? 'read' : 'unread'}`}>
          <div class="mailbox-left">
            <Icon name={email.isStarred ? 'star' : 'star_outline'} size={18} />
            <span class="avatar" aria-hidden="true">{initials(email.sender)}</span>
            <span class="sender">{email.sender}</span>
          </div>
          <div class="summary">
            <span class="subject">{email.subject}</span>
            <span class="snippet">{email.snippet}</span>
          </div>
          <div class="time">{timeLabel(email.receivedAt)}</div>
        </a>
      {/each}
    {/if}
  </div>
</CardSurface>

<style>
  .mailbox-card {
    border-radius: var(--radius-md);
    overflow: hidden;
    padding: 0;
  }

  .mailbox-filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-low);
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .tab {
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.7rem;
    min-height: 36px;
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
    cursor: pointer;
  }

  .tab span {
    border-radius: var(--radius-sm);
    min-width: 1.2rem;
    padding: 0 0.35rem;
    background: var(--color-surface-card);
    border: 1px solid var(--color-border);
  }

  .tab.active {
    color: var(--color-tertiary-text);
    background: var(--color-surface-card);
    border-color: var(--color-tertiary);
  }

  .table {
    display: grid;
    gap: 0.5rem;
    padding: var(--space-2);
  }

  .mailbox-row {
    display: grid;
    grid-template-columns: minmax(180px, 300px) minmax(0, 1fr) auto;
    gap: var(--space-2);
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.7rem 0.8rem;
    min-height: 44px;
    background: var(--color-surface-card);
    transition: border-color 120ms ease;
  }

  .mailbox-row:hover {
    border-color: var(--color-tertiary);
  }

  .mailbox-left {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .avatar {
    width: 1.95rem;
    height: 1.95rem;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-low);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 0.68rem;
    font-weight: var(--weight-semibold);
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .summary {
    min-width: 0;
    display: inline-flex;
    gap: var(--space-2);
  }

  .summary .subject {
    max-width: 320px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: var(--weight-medium);
  }

  .summary .snippet {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text-muted);
  }

  .sender,
  .snippet,
  .subject,
  .time {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mailbox-row .time {
    text-align: right;
    color: var(--color-text-muted);
    font-size: var(--font-size-label-sm);
  }

  .unread .subject {
    font-weight: var(--weight-semibold);
  }

  .unread .sender {
    font-weight: var(--weight-medium);
  }

  .empty {
    border-radius: var(--radius-sm);
    border: 1px dashed var(--color-border);
    padding: var(--space-3);
    text-align: center;
    color: var(--color-text-muted);
  }

  @media (max-width: 960px) {
    .mailbox-row {
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }

    .mailbox-left {
      width: 100%;
    }

    .mailbox-left .sender {
      min-width: 0;
      flex: 1;
    }

    .summary {
      display: block;
      width: 100%;
    }

    .summary .subject,
    .summary .snippet {
      max-width: none;
      display: block;
    }

    .summary .snippet {
      margin-top: 0.18rem;
    }

    .mailbox-row .time {
      text-align: left;
    }
  }
</style>
