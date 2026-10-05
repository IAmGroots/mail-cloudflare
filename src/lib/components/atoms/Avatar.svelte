<script lang="ts">
  export let initials = 'MF';
  export let src = '';
  export let size = 36;
  export let alt = '';
</script>

<div class="avatar" style={`width:${size}px;height:${size}px`}>
  {#if src}
    <img {src} alt={alt || 'Avatar pengguna'} />
  {:else}
    <span aria-hidden="true">{initials}</span>
  {/if}
</div>

<style>
  .avatar {
    border-radius: var(--radius-sm);
    background: var(--color-surface-low);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    display: grid;
    place-items: center;
    font-size: 0.75rem;
    font-weight: var(--weight-semibold);
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
