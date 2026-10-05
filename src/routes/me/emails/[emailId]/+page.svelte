<script lang="ts">
  import EmailDetailView from '$lib/components/organisms/EmailDetailView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<EmailDetailView
  email={data.email}
  actionApiBase="/api/me/emails"
  inboxHref="/me/inbox"
  userLabel={data.currentUser?.displayName ?? data.currentUser?.email ?? ''}
  showChrome={false}
/>
