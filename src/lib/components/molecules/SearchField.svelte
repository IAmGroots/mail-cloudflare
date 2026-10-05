<script lang="ts">
  import Icon from '$lib/components/atoms/Icon.svelte';
  export let value = '';
  export let placeholder = 'Cari...';
  export let onSearch: (() => void) | undefined = undefined;
  export let searchLabel = 'Cari';
  export let ariaLabel = 'Cari email';

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && onSearch) {
      event.preventDefault();
      onSearch();
    }
  }
</script>

<label class="search">
  <span class="icon" aria-hidden="true"><Icon name="search" size={18} /></span>
  <input
    bind:value
    {placeholder}
    type="search"
    aria-label={ariaLabel}
    on:keydown={handleKeydown}
  />
  {#if onSearch}
    <button
      type="button"
      class="submit"
      aria-label={ariaLabel}
      on:click={onSearch}
    >
      {searchLabel}
    </button>
  {/if}
</label>

<style>
  .search {
    display: block;
    position: relative;
    width: 100%;
  }

  .icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
  }

  input {
    width: 100%;
    border: 1px solid var(--color-border);
    background: var(--color-surface-card);
    color: var(--color-text);
    border-radius: var(--radius-sm);
    padding: 0.6rem 5rem 0.6rem 2.4rem;
    min-height: 44px;
  }

  input:focus-visible {
    outline: none;
    border-color: var(--color-tertiary-text);
    box-shadow: var(--focus-ring);
  }

  .submit {
    position: absolute;
    right: 0.3rem;
    top: 50%;
    transform: translateY(-50%);
    border: 1px solid var(--color-border);
    background: var(--color-surface-low);
    color: var(--color-text);
    font-weight: var(--weight-medium);
    font-size: 0.78rem;
    padding: 0.4rem 0.95rem;
    min-height: 34px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: border-color 120ms ease, color 120ms ease;
  }

  .submit:hover {
    border-color: var(--color-tertiary-text);
    color: var(--color-tertiary-text);
  }
</style>
