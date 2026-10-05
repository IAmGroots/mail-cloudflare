<script lang="ts">
  import { goto } from '$app/navigation';
  import AppSidebar from '$lib/components/organisms/AppSidebar.svelte';
  import AppTopbar from '$lib/components/organisms/AppTopbar.svelte';
  import CardSurface from '$lib/components/atoms/CardSurface.svelte';
  import InputText from '$lib/components/atoms/InputText.svelte';
  import Checkbox from '$lib/components/atoms/Checkbox.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import { page } from '$app/stores';
  import { apiRequest } from '$lib/utils/api';
  import { tick } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: adminEmail = $page.data.sessionEmail ?? null;

  let email = data.user.email;
  let displayName = data.user.displayName;
  let telegramEnabled = data.user.telegramEnabled;
  let password = '';
  let confirmPassword = '';
  let isSubmitting = false;
  let isDeleting = false;
  let errorMessage = '';
  let confirmDeleteOpen = false;
  let confirmDeleteButton: HTMLButtonElement | null = null;

  async function handleSave() {
    if (isSubmitting || isDeleting) return;

    isSubmitting = true;
    errorMessage = '';

    if (password && password.length < 8) {
      errorMessage = 'Password minimal 8 karakter.';
      isSubmitting = false;
      return;
    }
    if (password && password !== confirmPassword) {
      errorMessage = 'Konfirmasi password tidak cocok.';
      isSubmitting = false;
      return;
    }

    try {
      const result = await apiRequest<{ error?: string }>(`/api/users/${data.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          displayName,
          telegramEnabled,
          ...(password ? { password } : {})
        })
      });

      if (!result.ok) {
        errorMessage = result.data?.error ?? 'Gagal memperbarui user.';
        return;
      }

      await goto('/users');
    } catch {
      errorMessage = 'Tidak dapat menghubungi server. Coba lagi.';
    } finally {
      isSubmitting = false;
    }
  }

  function askDelete() {
    confirmDeleteOpen = true;
    void tick().then(() => confirmDeleteButton?.focus());
  }

  function cancelDelete() {
    confirmDeleteOpen = false;
  }

  function handleDialogKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelDelete();
    }
  }

  async function handleDelete() {
    if (isDeleting || isSubmitting) return;

    confirmDeleteOpen = false;
    isDeleting = true;
    errorMessage = '';

    try {
      const result = await apiRequest<{
        error?: string;
        dependencies?: { emails?: number; loginSessions?: number };
      }>(`/api/users/${data.user.id}`, {
        method: 'DELETE',
        headers: { 'x-mailflare-confirm': 'delete-user' }
      });

      if (!result.ok) {
        if (result.data?.dependencies) {
          errorMessage = `${result.data.error ?? 'Penghapusan diblokir'} (email: ${result.data.dependencies.emails ?? 0}, sesi: ${result.data.dependencies.loginSessions ?? 0})`;
        } else {
          errorMessage = result.data?.error ?? 'Gagal menghapus user.';
        }
        return;
      }

      await goto('/users');
    } catch {
      errorMessage = 'Tidak dapat menghubungi server. Coba lagi.';
    } finally {
      isDeleting = false;
    }
  }
</script>

<div class="layout-shell">
  <AppSidebar active="users" {adminEmail} />
  <section class="main">
    <AppTopbar title="Ubah user"
      variant="minimal"
      showRefresh={false}
      showLogout={false} breadcrumb="MailFlare / User / Ubah" showSearch={false} />
    <div class="content">
      <CardSurface>
        <div class="panel">
          <div>
            <h2>Ubah user</h2>
            <p class="text-muted">Perbarui identitas dan alamat email user.</p>
          </div>

          <form class="form" on:submit|preventDefault={handleSave}>
            <div>
              <label for="display-name">Nama tampilan</label>
              <InputText id="display-name" bind:value={displayName} required />
            </div>

            <div>
              <label for="email">Email</label>
              <InputText id="email" type="email" bind:value={email} required />
            </div>
            <div>
              <label for="password">Password baru (opsional)</label>
              <InputText id="password" type="password" bind:value={password} autocomplete="new-password" placeholder="Kosongkan jika tidak diubah" />
            </div>
            <div>
              <label for="confirm-password">Konfirmasi password baru</label>
              <InputText id="confirm-password" type="password" bind:value={confirmPassword} autocomplete="new-password" placeholder="Ulangi password baru" />
            </div>

            <div class="inline-field">
              <Checkbox id="telegram-enabled" bind:checked={telegramEnabled} />
              <label for="telegram-enabled" class="inline-label">Teruskan email masuk ke Telegram</label>
            </div>

            {#if errorMessage}
              <p class="error" role="alert">{errorMessage}</p>
            {/if}

            <div class="actions">
              <Button href="/users" variant="ghost">Batal</Button>
              <Button type="button" variant="secondary" disabled={isDeleting || isSubmitting} on:click={askDelete}>
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan perubahan'}
              </Button>
            </div>
          </form>
        </div>
      </CardSurface>
    </div>
  </section>
</div>

{#if confirmDeleteOpen}
  <div class="dialog-backdrop" role="presentation" on:click={cancelDelete} on:keydown={handleDialogKeydown}>
    <div
      class="dialog"
      role="alertdialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="confirm-delete-user"
      on:click|stopPropagation={() => {}}
      on:keydown={handleDialogKeydown}
    >
      <h3 id="confirm-delete-user">Hapus user ini?</h3>
      <p>{data.user.email} akan dihapus permanen beserta datanya. Tindakan ini tidak bisa dibatalkan.</p>
      <div class="dialog-actions">
        <Button variant="secondary" on:click={cancelDelete}>Batal</Button>
        <button class="confirm-btn" type="button" bind:this={confirmDeleteButton} on:click={handleDelete}>
          Ya, hapus
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .main {
    min-width: 0;
  }

  .content {
    padding: var(--space-3);
  }

  .panel {
    display: grid;
    gap: var(--space-3);
    max-width: 40rem;
  }

  h2 {
    font-size: 1.35rem;
    margin-bottom: 0.3rem;
  }

  .form {
    display: grid;
    gap: var(--space-2);
  }

  label {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--color-text);
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
  }

  .inline-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
  }

  .inline-label {
    display: inline;
    margin-bottom: 0;
    font-size: var(--font-size-body-sm);
    font-weight: var(--weight-regular);
    cursor: pointer;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  .error {
    color: var(--color-error);
    font-size: var(--font-size-body-sm);
    margin: 0;
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
    font-size: 1.1rem;
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
  }

  .confirm-btn:hover {
    background: color-mix(in srgb, var(--color-error), #000000 12%);
  }

  @media (max-width: 960px) {
    .actions {
      flex-wrap: wrap;
    }

    .actions :global(.btn) {
      flex: 1;
    }
  }
</style>
