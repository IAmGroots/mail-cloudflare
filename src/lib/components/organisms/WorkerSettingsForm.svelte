<script lang="ts">
  import { onMount } from 'svelte';
  import type { WorkerSettingsDto } from '$lib/types/dto';
  import type { WorkerSettingsPageDto } from '$lib/server/services/worker-settings.service';
  import CardSurface from '$lib/components/atoms/CardSurface.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import FieldLabelInput from '$lib/components/molecules/FieldLabelInput.svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
  import Checkbox from '$lib/components/atoms/Checkbox.svelte';
  import { apiRequest } from '$lib/utils/api';

  export let data: WorkerSettingsPageDto;

  interface ApiKeyRecordView {
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
  }

  interface ApiKeyStatusPayload {
    hasActiveKey: boolean;
    activeKey: ApiKeyRecordView | null;
  }

  let settings: WorkerSettingsDto = { ...data.settings };
  let botTokenInput = '';
  let webhookSecretInput = '';
  let saveMessage = '';
  let saveError = '';
  let saving = false;
  let testingConnection = false;
  let connectingWebhook = false;
  let apiKeyLoading = true;
  let apiKeyActionLoading = false;
  let apiKeyStatus: ApiKeyStatusPayload = { hasActiveKey: false, activeKey: null };
  let apiKeyMessage = '';
  let apiKeyError = '';
  let apiKeyPlaintext = '';

  onMount(() => {
    void loadApiKeyStatus();
  });

  async function saveSettings(): Promise<void> {
    saving = true;
    saveMessage = '';
    saveError = '';

    try {
      const result = await apiRequest<{
        ok?: boolean;
        error?: string;
        payload?: WorkerSettingsPageDto;
      }>('/api/worker-settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...(botTokenInput.trim() ? { botToken: botTokenInput.trim() } : {}),
          ...(webhookSecretInput.trim() ? { webhookSecret: webhookSecretInput.trim() } : {}),
          allowedIds: settings.allowedIds.trim(),
          forwardInbound: settings.forwardInbound,
          targetMode: settings.targetMode.trim(),
          defaultChatId: settings.defaultChatId.trim(),
          testChatId: settings.testChatId.trim()
        })
      });

      if (!result.ok || !result.data?.ok || !result.data.payload) {
        throw new Error(result.data?.error ?? 'Gagal menyimpan pengaturan');
      }

      settings = { ...result.data.payload.settings };
      data = result.data.payload;
      botTokenInput = '';
      webhookSecretInput = '';
      saveMessage = 'Konfigurasi Telegram tersimpan.';
    } catch (error) {
      saveError = error instanceof Error ? error.message : 'Gagal menyimpan pengaturan';
    } finally {
      saving = false;
    }
  }

  async function testConnection(): Promise<void> {
    if (testingConnection) return;

    testingConnection = true;
    saveMessage = '';
    saveError = '';

    try {
      const result = await apiRequest<{
        ok?: boolean;
        error?: string;
        payload?: {
          message?: string;
          targetChatId?: string;
          webhook?: WorkerSettingsPageDto['webhook'] | null;
        };
      }>('/api/worker-settings/test-telegram', { method: 'POST' });

      if (!result.ok || !result.data?.ok || !result.data.payload) {
        throw new Error(result.data?.error ?? 'Gagal mengirim uji koneksi');
      }

      if (result.data.payload.webhook) {
        data = { ...data, webhook: { ...data.webhook, ...result.data.payload.webhook } };
      }

      const syntheticEmailId = `test-notify-${Date.now()}`;
      const notifyResult = await apiRequest<{ ok?: boolean; error?: string; sentTo?: number }>(
        '/api/telegram/notify-email',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            emailId: syntheticEmailId,
            sender: 'worker-settings-test@mailflare.local',
            recipient: 'admin@mailflare.local',
            subject: '[TEST] notify-email dari pengaturan worker',
            skipPersist: true,
            snippet: 'Notifikasi email masuk contoh dari tombol uji di Pengaturan Worker.'
          })
        }
      );

      if (!notifyResult.ok || !notifyResult.data?.ok) {
        throw new Error(notifyResult.data?.error ?? 'Gagal mengirim notifikasi uji');
      }

      saveMessage = `${result.data.payload.message ?? 'Uji koneksi terkirim'}${result.data.payload.targetChatId ? ` (${result.data.payload.targetChatId})` : ''}. Notifikasi terkirim ke ${notifyResult.data.sentTo ?? 0} chat.`;
    } catch (error) {
      saveError = error instanceof Error ? error.message : 'Gagal mengirim uji koneksi';
    } finally {
      testingConnection = false;
    }
  }

  async function connectWebhook(): Promise<void> {
    if (connectingWebhook) return;

    connectingWebhook = true;
    saveMessage = '';
    saveError = '';

    try {
      const result = await apiRequest<{
        ok?: boolean;
        error?: string;
        payload?: { message?: string; webhook?: WorkerSettingsPageDto['webhook'] | null };
      }>('/api/worker-settings/connect-webhook', { method: 'POST' });

      if (!result.ok || !result.data?.ok || !result.data.payload) {
        throw new Error(result.data?.error ?? 'Gagal menghubungkan webhook');
      }

      if (result.data.payload.webhook) {
        data = { ...data, webhook: { ...data.webhook, ...result.data.payload.webhook } };
      }

      saveMessage = result.data.payload.message ?? 'Webhook terhubung.';
    } catch (error) {
      saveError = error instanceof Error ? error.message : 'Gagal menghubungkan webhook';
    } finally {
      connectingWebhook = false;
    }
  }

  async function loadApiKeyStatus(): Promise<void> {
    apiKeyLoading = true;
    apiKeyError = '';

    try {
      const result = await apiRequest<{ ok?: boolean; error?: string; payload?: ApiKeyStatusPayload }>(
        '/api/worker-settings/api-key',
        { method: 'GET', headers: { 'content-type': 'application/json' } }
      );

      if (!result.ok || !result.data?.ok || !result.data.payload) {
        throw new Error(result.data?.error ?? 'Gagal memuat status API key');
      }

      apiKeyStatus = result.data.payload;
    } catch (error) {
      apiKeyError = error instanceof Error ? error.message : 'Gagal memuat status API key';
    } finally {
      apiKeyLoading = false;
    }
  }

  async function generateApiKey(regenerate: boolean): Promise<void> {
    if (apiKeyActionLoading) return;

    apiKeyActionLoading = true;
    apiKeyMessage = '';
    apiKeyError = '';
    apiKeyPlaintext = '';

    try {
      const endpoint = regenerate
        ? '/api/worker-settings/api-key/regenerate'
        : '/api/worker-settings/api-key/generate';
      const result = await apiRequest<{
        ok?: boolean;
        error?: string;
        payload?: { apiKey?: string; activeKey?: ApiKeyRecordView; hasActiveKey?: boolean };
      }>(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' } });

      if (!result.ok || !result.data?.ok || !result.data.payload?.apiKey || !result.data.payload.activeKey) {
        throw new Error(
          result.data?.error ??
            (result.status === 409 ? 'API key aktif sudah ada' : 'Gagal membuat API key')
        );
      }

      apiKeyPlaintext = result.data.payload.apiKey;
      apiKeyStatus = { hasActiveKey: true, activeKey: result.data.payload.activeKey };
      apiKeyMessage = regenerate
        ? 'API key dibuat ulang. Key lama tidak berlaku lagi.'
        : 'API key dibuat.';
    } catch (error) {
      apiKeyError = error instanceof Error ? error.message : 'Gagal membuat API key';
      await loadApiKeyStatus();
    } finally {
      apiKeyActionLoading = false;
    }
  }
</script>

<div class="wrap">
  <CardSurface>
    <h2>Konfigurasi bot Telegram</h2>
    <p class="text-muted">Teruskan email masuk dan uji target pengiriman.</p>
    <form class="fields" on:submit|preventDefault={saveSettings}>
      <FieldLabelInput id="botStatus" label="Status bot" value={settings.botStatus} readonly />
      <FieldLabelInput
        id="botToken"
        label="Token bot (opsional)"
        bind:value={botTokenInput}
        placeholder={settings.botTokenConfigured ? 'Sudah diatur (kosongkan untuk mempertahankan)' : 'Tempel token bot'}
        type="password"
      />
      <FieldLabelInput
        id="webhookSecret"
        label="Webhook secret (opsional)"
        bind:value={webhookSecretInput}
        placeholder={settings.webhookSecretConfigured ? 'Sudah diatur (kosongkan untuk mempertahankan)' : 'Secret token opsional'}
        type="password"
      />
      <FieldLabelInput id="allowedIds" label="ID yang diizinkan" bind:value={settings.allowedIds} />
      <FieldLabelInput id="targetMode" label="Mode target" bind:value={settings.targetMode} />
      <label class="toggle" for="forwardInbound">
        <Checkbox id="forwardInbound" bind:checked={settings.forwardInbound} />
        <span>Teruskan email masuk ke Telegram</span>
      </label>
      <FieldLabelInput id="defaultChatId" label="Chat ID default" bind:value={settings.defaultChatId} placeholder="Chat id cadangan" />
      <FieldLabelInput id="testChatId" label="Chat ID uji" bind:value={settings.testChatId} placeholder="Target uji sementara" />
      <div class="actions">
        <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan konfigurasi'}</Button>
        <Button type="button" variant="secondary" on:click={testConnection} disabled={testingConnection}>
          {testingConnection ? 'Menguji...' : 'Uji koneksi'}
        </Button>
      </div>
      <p class="feedback success" role="status" aria-live="polite">{saveMessage}</p>
      <p class="feedback error" role="alert">{saveError}</p>
    </form>
  </CardSurface>

  <CardSurface>
    <h2>Status webhook</h2>
    <div class="webhook-grid">
      <div>
        <div class="label">Pembaruan tertunda</div>
        <div class="value">{data.webhook.pendingUpdates}</div>
      </div>
      <div>
        <div class="label">Alamat IP</div>
        <div class="value">{data.webhook.ipAddress}</div>
      </div>
      <div>
        <div class="label">Koneksi maksimum</div>
        <div class="value">{data.webhook.maxConnections}</div>
      </div>
      <div>
        <div class="label">Pembaruan diizinkan</div>
        <div class="value">{data.webhook.allowedUpdates.join(', ')}</div>
      </div>
    </div>
    <div class="url">
      <div class="label">URL webhook</div>
      <code>{data.webhook.url}</code>
    </div>
    {#if data.webhook.lastErrorMessage}
      <p class="feedback error" role="alert">Error Telegram terakhir: {data.webhook.lastErrorMessage}</p>
      {#if data.webhook.lastErrorAt}
        <p class="feedback error">Pada: {data.webhook.lastErrorAt}</p>
      {/if}
    {/if}
    <div class="footer">
      {#if data.webhook.connected}
        <Badge tone="success">Terhubung ({data.webhook.source})</Badge>
      {:else}
        <Button type="button" on:click={connectWebhook} disabled={connectingWebhook || saving || testingConnection}>
          {connectingWebhook ? 'Menghubungkan...' : 'Hubungkan webhook Telegram'}
        </Button>
      {/if}
    </div>
  </CardSurface>

  <CardSurface>
    <h2>API key</h2>
    <p class="text-muted">Buat atau ganti API key mesin dengan awalan <code class="inline-code">cmf_v1_</code>.</p>
    {#if apiKeyLoading}
      <p class="feedback" role="status">Memuat status API key...</p>
    {:else}
      <div class="api-key-status">
        {#if apiKeyStatus.hasActiveKey}
          <Badge tone="success">Key aktif</Badge>
          {#if apiKeyStatus.activeKey}
            <p class="value"><strong>Dibuat oleh:</strong> {apiKeyStatus.activeKey.createdBy || '-'}</p>
            <p class="value"><strong>Dibuat pada:</strong> {apiKeyStatus.activeKey.createdAt || '-'}</p>
          {/if}
        {:else}
          <Badge tone="warning">Tidak ada key aktif</Badge>
        {/if}
      </div>
      <div class="actions">
        {#if apiKeyStatus.hasActiveKey}
          <Button type="button" on:click={() => generateApiKey(true)} disabled={apiKeyActionLoading}>
            {apiKeyActionLoading ? 'Membuat ulang...' : 'Buat ulang API key'}
          </Button>
        {:else}
          <Button type="button" on:click={() => generateApiKey(false)} disabled={apiKeyActionLoading}>
            {apiKeyActionLoading ? 'Membuat...' : 'Buat API key'}
          </Button>
        {/if}
        <Button type="button" variant="secondary" on:click={loadApiKeyStatus} disabled={apiKeyLoading || apiKeyActionLoading}>
          Muat ulang status
        </Button>
      </div>
      {#if apiKeyPlaintext}
        <div class="api-key-box">
          <div class="label">API key (hanya tampil sekali)</div>
          <code>{apiKeyPlaintext}</code>
          <p class="feedback notice">Simpan key ini sekarang. Teks penuh tidak ditampilkan lagi setelah halaman dimuat ulang.</p>
        </div>
      {/if}
      <p class="feedback success" role="status" aria-live="polite">{apiKeyMessage}</p>
      <p class="feedback error" role="alert">{apiKeyError}</p>
    {/if}
  </CardSurface>
</div>

<style>
  .wrap {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-3);
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }

  .fields {
    margin-top: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }

  .actions {
    margin-top: var(--space-2);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-body-sm);
    font-weight: var(--weight-medium);
    min-height: 44px;
  }

  .feedback {
    margin: 0;
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
    min-height: 1.2em;
  }

  .feedback.success {
    color: var(--color-success-text);
  }

  .feedback.error {
    color: var(--color-error);
  }

  .feedback.notice {
    color: var(--color-text-muted);
  }

  .webhook-grid {
    margin-top: var(--space-3);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .label {
    color: var(--color-text-muted);
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
  }

  .value {
    margin-top: 0.25rem;
    font-weight: var(--weight-medium);
    font-size: 0.85rem;
    overflow-wrap: anywhere;
  }

  .url {
    margin-top: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
  }

  code {
    display: block;
    margin-top: 0.4rem;
    font-size: 0.78rem;
    color: var(--color-text);
    overflow-wrap: anywhere;
  }

  .inline-code {
    display: inline;
    margin-top: 0;
    font-size: 0.85em;
    color: var(--color-tertiary-text);
  }

  .api-key-status {
    margin-top: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }

  .api-key-box {
    margin-top: var(--space-2);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
  }

  .footer {
    margin-top: var(--space-3);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  @media (max-width: 960px) {
    .wrap {
      grid-template-columns: 1fr;
    }

    .actions {
      grid-template-columns: 1fr;
    }

    .webhook-grid {
      grid-template-columns: 1fr;
      gap: var(--space-2);
    }
  }
</style>
