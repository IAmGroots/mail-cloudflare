<script lang="ts">
  export let id = '';
  export let value = '';
  export let placeholder = '';
  export let type: 'text' | 'password' | 'email' | 'search' = 'text';
  export let readonly = false;
  export let name = '';
  export let required = false;
  export let autocomplete: AutoFill | undefined = undefined;
</script>

<input
  class="input"
  {id}
  {name}
  {type}
  bind:value
  {placeholder}
  {readonly}
  {required}
  {autocomplete}
/>

<style>
  .input {
    width: 100%;
    border: 1px solid var(--color-border);
    background: var(--color-surface-card);
    color: var(--color-text);
    padding: 0.6rem 0.75rem;
    min-height: 44px;
    border-radius: var(--radius-sm);
  }

  .input:focus-visible {
    outline: none;
    border-color: var(--color-tertiary);
    box-shadow: var(--focus-ring);
  }
</style>
