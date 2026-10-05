<script lang="ts">
  export let checked = false;
  export let name = '';
  export let id = '';
</script>

<input class="checkbox" type="checkbox" bind:checked {name} {id} />

<style>
  .checkbox {
    width: 1.15rem;
    height: 1.15rem;
    accent-color: var(--color-tertiary);
  }
</style>
