<script lang="ts">
  export let bodyHtml = '';
  export let bodyText = '';
  export let snippet = '';

  $: hasHtml = bodyHtml.trim().length > 0;
  $: plainText = (bodyText || snippet || '(Tidak ada konten)').trim();
  $: frameSrcDoc = buildFrameSrcDoc(bodyHtml);

  function buildFrameSrcDoc(rawHtml: string): string {
    const html = rawHtml.trim();
    if (!html) {
      return '';
    }

    if (/<html[\s>]/i.test(html)) {
      return html;
    }

    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}</body></html>`;
  }
</script>

{#if hasHtml}
  <iframe
    title="Email HTML Preview"
    class="email-frame"
    sandbox=""
    loading="lazy"
    referrerpolicy="no-referrer"
    srcdoc={frameSrcDoc}
  ></iframe>
{:else}
  <pre>{plainText}</pre>
{/if}

<style>
  .email-frame {
    width: 100%;
    min-height: 60vh;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: #ffffff;
  }

  pre {
    white-space: pre-wrap;
    line-height: 1.6;
    margin: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    background: var(--color-surface-low);
  }
</style>
