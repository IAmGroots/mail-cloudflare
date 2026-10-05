<script lang="ts">
  import Icon from '$lib/components/atoms/Icon.svelte';
  import InputText from '$lib/components/atoms/InputText.svelte';

  export let id: string;
  export let label: string;
  export let value = '';
  export let placeholder = '';
  export let type: 'text' | 'password' | 'email' = 'text';
  export let icon = '';
  export let autocomplete: AutoFill | undefined = undefined;
  export let hint = '';
  export let showPasswordToggle = false;

  let showPassword = false;
  $: resolvedType = showPasswordToggle && showPassword ? 'text' : type;
</script>

<div class="field">
  <label for={id}>
    {#if icon}<span class="field-icon" aria-hidden="true"><Icon name={icon} size={14} /></span>{/if}
    {label}
  </label>
  <div class="input-wrap">
    <InputText {id} bind:value {placeholder} type={resolvedType} {autocomplete} />
    {#if showPasswordToggle}
      <button
        class="toggle-pw"
        type="button"
        on:click={() => (showPassword = !showPassword)}
        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
      >
        <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={16} />
      </button>
    {/if}
  </div>
  {#if hint}
    <span class="field-meta" id={`${id}-hint`}>{hint}</span>
  {/if}
</div>

<style>
  .field {
    display: grid;
    gap: 0.375rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text);
  }

  .field-icon {
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
  }

  .field-meta {
    font-family: var(--font-mono);
    font-size: var(--font-size-label-xs);
    color: var(--color-text-muted);
  }

  .input-wrap {
    position: relative;
  }

  .input-wrap :global(.input) {
    padding-right: 2.75rem;
  }

  .toggle-pw {
    position: absolute;
    right: 0.35rem;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
  }

  .toggle-pw:hover {
    color: var(--color-tertiary-text);
  }
</style>
