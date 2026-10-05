<script lang="ts">
  import InputText from '$lib/components/atoms/InputText.svelte';

  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let readonly = false;
  export let type: 'text' | 'password' | 'email' | 'search' = 'text';
  export let id = '';
  export let name = '';

  const fieldId = id || `field-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="field">
  <label for={fieldId}>{label}</label>
  <InputText id={fieldId} {name} bind:value {placeholder} {readonly} {type} />
</div>

<style>
  .field {
    display: grid;
    gap: 0.4rem;
  }

  label {
    color: var(--color-text);
    font-size: var(--font-size-label-sm);
    font-weight: var(--weight-medium);
  }
</style>
