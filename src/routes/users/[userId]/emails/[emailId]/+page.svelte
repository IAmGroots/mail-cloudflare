<script lang="ts">
  import EmailDetailView from '$lib/components/organisms/EmailDetailView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: inboxHref = data.inboxOnly ? '/me/inbox' : `/users/${data.userId}/inbox`;
  $: actionApiBase = data.inboxOnly ? '/api/me/emails' : `/api/users/${data.userId}/emails`;
</script>

<EmailDetailView
  email={data.email}
  {actionApiBase}
  {inboxHref}
  userLabel={data.currentUser?.displayName ?? data.currentUser?.email ?? data.userId}
  showChrome={!data.inboxOnly}
/>
