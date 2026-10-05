<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import type { UserDto } from '$lib/types/dto';
  import CardSurface from '$lib/components/atoms/CardSurface.svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
  import Avatar from '$lib/components/atoms/Avatar.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';
  import InputText from '$lib/components/atoms/InputText.svelte';
  import { apiRequest, jsonBody } from '$lib/utils/api';
  import { getInitials } from '$lib/utils/format';

  export let users: UserDto[] = [];

  const dispatch = createEventDispatcher<{ usercreated: void; userchanged: void }>();

  let modalOpen = false;
  let username = '';
  let isSubmitting = false;
  let actionUserId = '';
  let errorMessage = '';
  let copyMessage = '';
  let listMessage = '';
  let listMessageTone: 'info' | 'error' = 'info';
  let credentialContext: 'create' | 'reset' = 'create';
  let pendingConfirm: { type: 'reset' | 'delete'; user: UserDto } | null = null;
  let confirmButton: HTMLButtonElement | null = null;
  let generatedCredentials: {
    username: string;
    email: string;
    password: string;
  } | null = null;

  function formatCount(value: number | undefined) {
    return Number(value ?? 0).toLocaleString('id-ID');
  }

  async function openModal() {
    modalOpen = true;
    resetForm();
    await tick();
  }

  function closeModal() {
    if (isSubmitting) return;
    modalOpen = false;
    resetForm();
  }

  function resetForm() {
    username = '';
    errorMessage = '';
    copyMessage = '';
    generatedCredentials = null;
    credentialContext = 'create';
  }

  async function handleCreateUser() {
    if (isSubmitting) return;

    errorMessage = '';
    isSubmitting = true;

    const normalized = username.trim().toLowerCase();
    if (!normalized) {
      errorMessage = 'Nama pengguna wajib diisi.';
      isSubmitting = false;
      return;
    }
    if (normalized.length < 3 || normalized.length > 64) {
      errorMessage = 'Nama pengguna harus 3 sampai 64 karakter.';
      isSubmitting = false;
      return;
    }
    if (!/^[a-z0-9._-]+$/.test(normalized)) {
      errorMessage = 'Nama pengguna hanya boleh huruf a-z, angka, titik, garis bawah, dan tanda hubung.';
      isSubmitting = false;
      return;
    }

    try {
      const result = await apiRequest<{
        error?: string;
        user?: { id: string; email: string; displayName: string; password: string };
      }>('/api/users', jsonBody({ username: normalized }));

      if (!result.ok) {
        errorMessage = result.data?.error ?? 'Gagal membuat user.';
        return;
      }

      if (!result.data?.user?.password) {
        errorMessage = 'Kredensial tidak diterima dari server. Coba lagi.';
        return;
      }

      generatedCredentials = {
        username: result.data.user.displayName,
        email: result.data.user.email,
        password: result.data.user.password
      };
      credentialContext = 'create';
      username = '';
      dispatch('usercreated');
      dispatch('userchanged');
    } catch {
      errorMessage = 'Tidak dapat menghubungi server. Coba lagi.';
    } finally {
      isSubmitting = false;
    }
  }

  async function copyValue(label: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      copyMessage = `${label} disalin.`;
    } catch {
      copyMessage = 'Gagal menyalin. Salin secara manual.';
    }
  }

  async function handleQuickCopyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setListMessage('Email disalin.', 'info');
    } catch {
      setListMessage('Gagal menyalin email.', 'error');
    }
  }

  function setListMessage(message: string, tone: 'info' | 'error') {
    listMessage = message;
    listMessageTone = tone;
  }

  async function runConfirm() {
    if (!pendingConfirm) return;
    const request = pendingConfirm;
    pendingConfirm = null;

    if (request.type === 'reset') {
      await handleQuickResetPassword(request.user);
    } else {
      await handleQuickSoftDelete(request.user);
    }
  }

  function askResetPassword(user: UserDto) {
    pendingConfirm = { type: 'reset', user };
    void tick().then(() => confirmButton?.focus());
  }

  function askSoftDelete(user: UserDto) {
    if (user.role === 'owner') {
      setListMessage('Akun pemilik tidak bisa dinonaktifkan.', 'error');
      return;
    }
    pendingConfirm = { type: 'delete', user };
    void tick().then(() => confirmButton?.focus());
  }

  function cancelConfirm() {
    pendingConfirm = null;
  }

  function handleConfirmKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelConfirm();
    }
  }

  async function handleQuickResetPassword(user: UserDto) {
    if (isSubmitting || actionUserId) return;

    errorMessage = '';
    listMessage = '';
    actionUserId = user.id;

    try {
      const result = await apiRequest<{ error?: string; password?: string }>(
        `/api/users/${user.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetPassword: true })
        }
      );

      if (!result.ok || !result.data?.password) {
        setListMessage(result.data?.error ?? 'Gagal mengatur ulang password.', 'error');
        return;
      }

      generatedCredentials = {
        username: user.displayName,
        email: user.email,
        password: result.data.password
      };

      copyMessage = '';
      credentialContext = 'reset';
      modalOpen = true;
      dispatch('userchanged');
    } catch {
      setListMessage('Tidak dapat menghubungi server. Coba lagi.', 'error');
    } finally {
      actionUserId = '';
    }
  }

  async function handleQuickSoftDelete(user: UserDto) {
    if (isSubmitting || actionUserId) return;

    listMessage = '';
    actionUserId = user.id;

    try {
      const result = await apiRequest<{ error?: string }>(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'x-mailflare-confirm': 'soft-delete-user' }
      });

      if (!result.ok) {
        setListMessage(result.data?.error ?? 'Gagal menonaktifkan user.', 'error');
        return;
      }

      setListMessage(`${user.email} dinonaktifkan.`, 'info');
      dispatch('userchanged');
    } catch {
      setListMessage('Tidak dapat menghubungi server. Coba lagi.', 'error');
    } finally {
      actionUserId = '';
    }
  }
</script>

<CardSurface>
  <div class="panel-header">
    <div>
      <h2>Manajemen user</h2>
      <p class="text-muted">Daftar seluruh kolaborator dan perannya di infrastruktur ini.</p>
    </div>
    <Button on:click={openModal}>
      <Icon name="person_add" size={18} />
      Tambah user
    </Button>
  </div>

  <p class:error-text={listMessageTone === 'error'} class="list-feedback" role="status" aria-live="polite">
    {listMessage}
  </p>

  {#if users.length === 0}
    <div class="empty">
      <Icon name="person_off" size={36} />
      <h3>Belum ada user</h3>
      <p class="text-muted">Tambahkan user pertama untuk mulai mengelola tim Anda.</p>
    </div>
  {:else}
    <div class="list">
      {#each users as user (user.id)}
        <div class="row">
          <a href={`/users/${user.id}/inbox`} class="identity-link">
            <Avatar initials={getInitials(user.displayName)} alt={user.displayName} />
            <div>
              <div class="name">{user.displayName}</div>
              <div class="text-muted">{user.email}</div>
              <div class="text-muted identity-metrics">
                <span>Email: {formatCount(user.totalEmails)}</span>
                <span>Belum dibaca: {formatCount(user.unreadEmails)}</span>
              </div>
            </div>
          </a>
          <div class="meta">
            <Badge tone={user.status === 'active' ? 'success' : 'neutral'}>
              {user.status === 'active' ? 'aktif' : 'nonaktif'}
            </Badge>
            <span class="role">{user.role === 'owner' ? 'pemilik' : 'anggota'}</span>
            <div class="quick-actions">
              <button class="icon-action" type="button" aria-label="Salin email" title="Salin email" on:click={() => handleQuickCopyEmail(user.email)}>
                <Icon name="content_copy" size={16} />
              </button>
              <button
                class="icon-action"
                type="button"
                aria-label="Atur ulang password"
                title="Atur ulang password"
                disabled={actionUserId === user.id || user.status !== 'active'}
                on:click={() => askResetPassword(user)}
              >
                <Icon name="lock_reset" size={16} />
              </button>
              <button
                class="icon-action danger"
                type="button"
                aria-label="Nonaktifkan user"
                title="Nonaktifkan user"
                disabled={actionUserId === user.id || user.role === 'owner' || user.status !== 'active'}
                on:click={() => askSoftDelete(user)}
              >
                <Icon name="person_remove" size={16} />
              </button>
            </div>
            <Button href={`/users/${user.id}/edit`} variant="ghost">Ubah</Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</CardSurface>

{#if pendingConfirm}
  <button
    class="modal-backdrop"
    type="button"
    aria-label="Batalkan konfirmasi"
    on:click={cancelConfirm}
  ></button>
  <div class="modal" role="presentation" on:click={cancelConfirm} on:keydown={handleConfirmKeydown}>
    <div
      class="confirm-card"
      role="alertdialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="confirm-title"
      on:click|stopPropagation={() => {}}
      on:keydown={handleConfirmKeydown}
    >
      <h3 id="confirm-title">
        {pendingConfirm.type === 'reset' ? 'Atur ulang password?' : 'Nonaktifkan user?'}
      </h3>
      <p class="text-muted">
        {#if pendingConfirm.type === 'reset'}
          Password baru untuk {pendingConfirm.user.email} akan dibuat dan ditampilkan sekali.
        {:else}
          {pendingConfirm.user.email} akan dinonaktifkan dan tidak bisa masuk sampai diaktifkan kembali.
        {/if}
      </p>
      <div class="confirm-actions">
        <Button variant="secondary" on:click={cancelConfirm}>Batal</Button>
        <button class="confirm-btn" type="button" bind:this={confirmButton} on:click={runConfirm}>
          {pendingConfirm.type === 'reset' ? 'Ya, atur ulang' : 'Ya, nonaktifkan'}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if modalOpen}
  <button class="modal-backdrop" type="button" aria-label="Tutup dialog tambah user" on:click={closeModal}></button>
  <div class="modal" role="presentation">
    <div class="modal-card" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="add-user-title">
      {#if generatedCredentials}
        <div class="modal-body credentials-pane">
          <div class="success-head">
            <div class="success-icon-wrap" aria-hidden="true">
              <Icon name="check_circle" size={32} />
            </div>
            <h3 id="add-user-title" class="success-title">Berhasil</h3>
            {#if credentialContext === 'create'}
              <p class="text-muted success-subtitle">User baru sudah ditambahkan. Simpan kredensial di bawah ini.</p>
            {:else}
              <p class="text-muted success-subtitle">Password sudah diatur ulang. Simpan dan bagikan kredensial baru dengan aman.</p>
            {/if}
          </div>

          <div class="credential-list">
            <div class="credential-item">
              <span class="credential-label">Email</span>
              <div class="credential-row">
                <code>{generatedCredentials.email}</code>
                <button
                  class="copy-btn"
                  type="button"
                  aria-label="Salin email"
                  on:click={() => generatedCredentials && copyValue('Email', generatedCredentials.email)}
                >
                  <Icon name="content_copy" size={18} />
                </button>
              </div>
            </div>
            <div class="credential-item">
              <span class="credential-label">Password</span>
              <div class="credential-row">
                <code>{generatedCredentials.password}</code>
                <button
                  class="copy-btn"
                  type="button"
                  aria-label="Salin password"
                  on:click={() => generatedCredentials && copyValue('Password', generatedCredentials.password)}
                >
                  <Icon name="content_copy" size={18} />
                </button>
              </div>
            </div>
          </div>

          <div class="warning-box">
            <div class="warning-icon" aria-hidden="true">
              <Icon name="warning" size={18} />
            </div>
            <p>Simpan password ini sekarang. Password tidak akan ditampilkan lagi.</p>
          </div>

          <p class="copy-feedback" role="status" aria-live="polite">{copyMessage}</p>

          <div class="modal-footer success-footer">
            <Button variant="primary" fullWidth on:click={closeModal}>Selesai</Button>
          </div>
        </div>
      {:else}
        <form class="modal-body modal-form" on:submit|preventDefault={handleCreateUser}>
          <div class="modal-head">
            <h3 id="add-user-title">Tambah user baru</h3>
            <p class="text-muted">Beri akses ke anggota tim baru.</p>
          </div>

          <div class="field">
            <label for="add-user-username">Nama pengguna</label>
            <div class="input-shell">
              <InputText id="add-user-username" bind:value={username} placeholder="mis. alex" required />
              <span class="input-icon" aria-hidden="true">
                <Icon name="alternate_email" size={16} />
              </span>
            </div>
            <p class="hint text-muted">Email dan password dibuat otomatis sesuai domain yang ditentukan.</p>
          </div>

          {#if errorMessage}
            <p class="error" role="alert">{errorMessage}</p>
          {/if}

          <div class="modal-footer">
            <Button variant="secondary" disabled={isSubmitting} on:click={closeModal}>Batal</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Membuat...' : 'Tambah user'}
            </Button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .panel-header {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: center;
    margin-bottom: var(--space-3);
  }

  h2 {
    font-size: 1.4rem;
    margin-bottom: 0.25rem;
  }

  .list-feedback {
    margin: 0 0 var(--space-2);
    font-size: var(--font-size-body-sm);
    color: var(--color-text-muted);
    min-height: 1.2em;
  }

  .list-feedback.error-text {
    color: var(--color-error);
  }

  .list {
    display: grid;
    gap: 0.5rem;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.75rem 0.85rem;
    background: var(--color-surface-card);
    transition: border-color 120ms ease;
  }

  .row:hover {
    border-color: var(--color-tertiary-text);
  }

  .identity-link {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 0;
    flex: 1;
  }

  .name {
    font-weight: var(--weight-medium);
  }

  .identity-metrics {
    margin-top: 0.22rem;
    display: inline-flex;
    gap: 0.8rem;
    font-size: var(--font-size-label-sm);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .quick-actions {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .icon-action {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: var(--color-surface-card);
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 120ms ease, border-color 120ms ease;
  }

  .icon-action:hover:not(:disabled) {
    color: var(--color-tertiary-text);
    border-color: var(--color-tertiary-text);
  }

  .icon-action.danger:hover:not(:disabled) {
    color: var(--color-error);
    border-color: var(--color-error);
  }

  .icon-action:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .role {
    font-size: var(--font-size-label-sm);
    color: var(--color-text-muted);
    font-weight: var(--weight-medium);
  }

  .empty {
    min-height: 12rem;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.6rem;
    text-align: center;
    color: var(--color-text-muted);
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    border: 0;
    background: color-mix(in srgb, var(--color-text), transparent 55%);
    z-index: 20;
  }

  .modal {
    position: fixed;
    inset: 0;
    z-index: 21;
    display: grid;
    place-items: center;
    padding: var(--space-3);
  }

  .modal-card {
    width: min(28rem, 100%);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface-card);
    overflow: hidden;
  }

  .confirm-card {
    width: min(26rem, 100%);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface-card);
    padding: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }

  .confirm-card h3 {
    margin: 0;
  }

  .confirm-card p {
    margin: 0;
  }

  .confirm-actions {
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

  .modal-head {
    padding: 0;
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.3rem;
  }

  .modal-body {
    padding: var(--space-3);
  }

  .modal-form {
    display: grid;
    gap: var(--space-2);
  }

  .credentials-pane {
    display: grid;
    gap: var(--space-2);
  }

  .success-head {
    display: grid;
    justify-items: center;
    text-align: center;
    gap: 0.45rem;
  }

  .success-icon-wrap {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-success), transparent 88%);
    color: var(--color-success-text);
    display: grid;
    place-items: center;
  }

  .success-title {
    font-size: 1.5rem;
    line-height: 1.1;
    margin: 0;
  }

  .success-subtitle {
    max-width: 24rem;
    margin: 0;
    font-size: var(--font-size-body-sm);
  }

  .field {
    display: grid;
    gap: var(--space-1);
  }

  label {
    display: block;
    color: var(--color-text);
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
  }

  .input-shell {
    position: relative;
  }

  .input-icon {
    position: absolute;
    right: var(--space-2);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
  }

  .input-shell :global(.input) {
    padding-right: 2.5rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--space-2);
  }

  .hint {
    margin-top: 0;
    font-size: var(--font-size-label-sm);
  }

  .credential-list {
    display: grid;
    gap: var(--space-2);
  }

  .credential-item {
    display: grid;
    gap: 0.3rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface-low);
    padding: 0.7rem 0.85rem;
  }

  .credential-label {
    color: var(--color-text-muted);
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
  }

  .credential-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  code {
    font-size: 0.85rem;
    font-family: var(--font-mono);
    color: var(--color-text);
    overflow-wrap: anywhere;
  }

  .copy-btn {
    border: 1px solid var(--color-border);
    background: var(--color-surface-card);
    color: var(--color-text);
    border-radius: var(--radius-sm);
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .copy-btn:hover {
    color: var(--color-tertiary-text);
    border-color: var(--color-tertiary-text);
  }

  .warning-box {
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    background: color-mix(in srgb, var(--color-error), transparent 94%);
    border: 1px solid color-mix(in srgb, var(--color-error), transparent 70%);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .warning-box p {
    margin: 0;
    font-size: var(--font-size-label-sm);
    line-height: 1.45;
    color: var(--color-text);
  }

  .warning-icon {
    color: var(--color-error);
    flex-shrink: 0;
  }

  .copy-feedback {
    font-size: var(--font-size-label-sm);
    margin: 0;
    min-height: 1.2em;
    color: var(--color-text-muted);
  }

  .success-footer {
    padding-top: 0;
  }

  .error {
    color: var(--color-error);
    font-size: var(--font-size-body-sm);
    margin: 0;
  }

  @media (max-width: 960px) {
    .panel-header {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: var(--space-3);
    }

    .row {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-2);
      padding: 0.75rem;
    }

    .meta {
      width: 100%;
      flex-wrap: wrap;
      justify-content: space-between;
      row-gap: var(--space-2);
    }

    .modal {
      align-items: end;
      padding: 0;
    }

    .modal-card,
    .confirm-card {
      width: 100%;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      max-height: 92dvh;
      overflow: auto;
    }

    .modal-footer {
      flex-wrap: wrap;
    }

    .modal-footer :global(.btn) {
      flex: 1;
    }
  }
</style>
