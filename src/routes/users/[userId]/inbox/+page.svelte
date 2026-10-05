<script lang="ts">
  import MailboxView from '$lib/components/organisms/MailboxView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: emailHrefPrefix = data.inboxOnly ? '/me/emails' : `/users/${data.userId}/emails`;
</script>

<MailboxView
  userId={data.userId}
  emails={data.emails}
  currentUser={data.currentUser}
  search={data.search}
  archivedCount={data.archivedCount ?? 0}
  hrefBase={`/users/${data.userId}/inbox`}
  {emailHrefPrefix}
  showChrome={!data.inboxOnly}
  userLabel={data.currentUser?.displayName ?? data.currentUser?.email ?? data.userId}
/>
