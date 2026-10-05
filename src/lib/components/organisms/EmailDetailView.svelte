<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AppSidebar from '$lib/components/organisms/AppSidebar.svelte';
  import AppTopbar from '$lib/components/organisms/AppTopbar.svelte';
  import MailboxTopbar from '$lib/components/organisms/MailboxTopbar.svelte';
  import CardSurface from '$lib/components/atoms/CardSurface.svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';
  import EmailBodyViewer from '$lib/components/molecules/EmailBodyViewer.svelte';
  import { apiRequest } from '$lib/utils/api';
  import { formatDateTime } from '$lib/utils/format';

  type EmailQuickAction = 'star' | 'archive' | 'delete';

  export let email: {
    id: string;
    sender: string;
    recipient: string;
    subject: string;
    snippet: string;
    receivedAt: string;
    bodyText: string;
    bodyHtml: string;
    isRead: boolean;
    isStarred: boolean;
  };
  export let actionApiBase = '/api/me/emails';
  export let inboxHref = '/me/inbox';
  export let userLabel = '';
  export let showChrome = false;

  $: adminEmail = $page.data.sessionEmail ?? null;

  let activeEmailId = email.id;
  let isStarred = email.isStarred;
  let actionPending = false;
  let actionMessage = '';
  let actionError = '';
  let confirmOpen = false;
  let confirmButton: HTMLButtonElement | null = null;
  $: if (email.id !== activeEmailId) {
    activeEmailId = email.id;
    isStarred = email.isStarred;
    actionPending = false;
    actionMessage = '';
    actionError = '';
  }

  $: receivedLabel = email.receivedAt ? formatDateTime(email.receivedAt) : '-';

  async function performAction(action: EmailQuickAction) {
    if (actionPending) return;

    actionMessage = '';
    actionError = '';
    actionPending = true;

    try {
      const result = await apiRequest<{ error?: string; email?: { isStarred?: boolean } }>(
        `${actionApiBase}/${encodeURIComponent(email.id)}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action })
        }
      );

      if (!result.ok) {
        actionError = result.data?.error ?? 'Gagal memperbarui status email.';
        return;
      }

      if (action === 'star') {
        isStarred =
          typeof result.data?.email?.isStarred === 'boolean'
            ? result.data.email.isStarred
            : !isStarred;
        actionMessage = isStarred ? 'Email ditandai bintang.' : 'Bintang dihapus.';
        return;
      }

      await goto(inboxHref);
    } catch {
      actionError = 'Tidak dapat menghubungi server. Coba lagi.';
    } finally {
      actionPending = false;
    }
  }

  function requestDelete() {
    confirmOpen = true;
    actionMessage = '';
    actionError = '';
    requestAnimationFrame(() => confirmButton?.focus());
  }

  function cancelDelete() {
    confirmOpen = false;
  }

  function confirmDelete() {
    confirmOpen = false;
    void performAction('delete');
  }

  function handleDialogKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelDelete();
    }
  }
</script>

{#if showChrome}
  <div class="layout-shell">
    <AppSidebar active="users" {adminEmail} />
    <section class="main">
      <AppTopbar title="Email" variant="minimal" showRefresh={false} showLogout={false} />
      <div class="content">
        <div class="detail-toolbar">
          <Button variant="secondary" href={inboxHref}>
            <Icon name="arrow_back" size={18} />
            Kembali ke Inbox
          </Button>
        </div>
        {@render detail()}
      </div>
    </section>
  </div>
{:else}
  <section class="standalone">
    <MailboxTopbar {userLabel} showSearch={false} showRefresh={false}>
      <svelte:fragment slot="actions">
        <Button variant="secondary" href={inboxHref}>
          <Icon name="arrow_back" size={18} />
          Kembali ke Inbox
        </Button>
      </svelte:fragment>
    </MailboxTopbar>
    <div class="content">
      {@render detail()}
    </div>
  </section>
{/if}

{#snippet detail()}
  <CardSurface>
    <div class="head">
      <div>
        <h2>{email.subject}</h2>
        <p class="text-muted">ID: {email.id}</p>
      </div>
      <div class="top-actions">
        <div class="badges">
          <Badge tone={email.isRead ? 'primary' : 'warning'}>{email.isRead ? 'Terbaca' : 'Belum dibaca'}</Badge>
          {#if isStarred}
            <Badge tone="success">Berbintang</Badge>
          {/if}
        </div>
        <div class="icon-actions">
          <button
            class="icon-action"
            type="button"
            aria-label={isStarred ? 'Hapus bintang' : 'Tandai bintang'}
            title={isStarred ? 'Hapus bintang' : 'Tandai bintang'}
            on:click={() => performAction('star')}
            disabled={actionPending}
          >
            <Icon name={isStarred ? 'star' : 'star_border'} size={18} />
          </button>
          <button
            class="icon-action"
            type="button"
            aria-label="Arsipkan email"
            title="Arsipkan"
            on:click={() => performAction('archive')}
            disabled={actionPending}
          >
            <Icon name="archive" size={18} />
          </button>
          <button
            class="icon-action danger"
            type="button"
            aria-label="Hapus email"
            title="Hapus"
            on:click={requestDelete}
            disabled={actionPending}
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
        <p class="action-feedback" role="status" aria-live="polite">
          {actionError || actionMessage}
        </p>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-label">Dari</div>
        <div class="meta-value">{email.sender}</div>
      </div>
      <div>
        <div class="meta-label">Kepada</div>
        <div class="meta-value">{email.recipient}</div>
      </div>
      <div>
        <div class="meta-label">Diterima</div>
        <div class="meta-value">{receivedLabel}</div>
      </div>
    </div>

    <div class="body">
      <h3>Isi email</h3>
      <EmailBodyViewer bodyHtml={email.bodyHtml} bodyText={email.bodyText} snippet={email.snippet} />
    </div>
  </CardSurface>
{/snippet}

{#if confirmOpen}
  <div class="dialog-backdrop" role="presentation" on:click={cancelDelete} on:keydown={handleDialogKeydown}>
    <div
      class="dialog"
      role="alertdialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      on:click|stopPropagation={() => {}}
      on:keydown={handleDialogKeydown}
    >
      <h3 id="confirm-delete-title">Hapus email ini?</h3>
      <p>Email akan dipindahkan ke daftar terhapus dan tetap tersimpan selama masa retensi.</p>
      <div class="dialog-actions">
        <Button variant="secondary" on:click={cancelDelete}>Batal</Button>
        <button class="confirm-btn" type="button" bind:this={confirmButton} on:click={confirmDelete}>
          Ya, hapus
        </button>
      </div>
    </div>
  </div>
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
    padding: var(--space-4) var(--space-3);
  }

  .detail-toolbar {
    margin-bottom: var(--space-3);
  }

  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  h2 {
    margin-bottom: 0.2rem;
    line-height: 1.3;
    font-size: 1.25rem;
  }

  .top-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-2);
  }

  .badges {
    display: flex;
    gap: var(--space-2);
    justify-content: flex-end;
  }

  .icon-actions {
    display: inline-flex;
    align-items: center;
    background: var(--color-surface-low);
    border: 1px solid var(--color-border);
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    gap: 0.2rem;
  }

  .icon-action {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 120ms ease, background-color 120ms ease;
  }

  .icon-action:disabled {
    opacity: 0.45;
    cursor: wait;
  }

  .icon-action:hover:not(:disabled) {
    background: var(--color-surface-card);
    color: var(--color-tertiary-text);
  }

  .icon-action.danger:hover:not(:disabled) {
    color: var(--color-danger);
  }

  .action-feedback {
    margin: 0;
    font-size: var(--font-size-label-sm);
    color: var(--color-text-muted);
    min-height: 1.2em;
  }

  .meta-grid {
    margin-top: var(--space-3);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .meta-label {
    color: var(--color-text-muted);
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
  }

  .meta-value {
    margin-top: 0.2rem;
    font-size: 0.9rem;
    overflow-wrap: anywhere;
  }

  .body {
    margin-top: var(--space-3);
  }

  h3 {
    margin-bottom: var(--space-2);
    font-size: 1rem;
  }

  .dialog-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    padding: var(--space-3);
    background: color-mix(in srgb, var(--color-text), transparent 45%);
  }

  .dialog {
    width: min(26rem, 100%);
    background: var(--color-surface-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }

  .dialog h3 {
    margin: 0;
  }

  .dialog p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-body-sm);
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .confirm-btn {
    min-height: 44px;
    padding: 0.6rem 1rem;
    border: 1px solid var(--color-error);
    border-radius: var(--radius-sm);
    background: var(--color-error);
    color: #ffffff;
    font-weight: var(--weight-medium);
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  .confirm-btn:hover {
    background: color-mix(in srgb, var(--color-error), #000000 12%);
  }

  @media (max-width: 960px) {
    .head {
      flex-direction: column;
      align-items: flex-start;
    }

    .top-actions {
      align-items: flex-start;
    }

    .badges {
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }
</style>
