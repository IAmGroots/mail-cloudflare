<script lang="ts">
  import MailboxView from '$lib/components/organisms/MailboxView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<MailboxView
  userId={data.userId}
  emails={data.emails}
  currentUser={data.currentUser}
  search={data.search}
  archivedCount={data.archivedCount ?? 0}
  hrefBase="/me/inbox"
  emailHrefPrefix="/me/emails"
  showChrome={false}
  userLabel={data.currentUser.displayName}
/>
