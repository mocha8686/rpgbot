<script lang="ts">
	import type { LayoutData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	export let data: LayoutData;

	$: user = data.user;
</script>

<header>
	{#if user}
		<img src={user.avatar} alt="Avatar" />
		<p>{user.username}</p>
		<form action="/?/logout" method="post" use:enhance>
			<input type="hidden" name="redirect" value={$page.url.pathname} />
			<button>Sign out</button>
		</form>
	{:else}
		<a href={`/api/oauth/discord?redirect=${$page.url.pathname}`}>Sign in with Discord</a>
	{/if}
</header>

<nav>
	<a href="/">Home</a>
	<a href="/fight">Fight</a>
	<a href="/inventory">Inventory</a>
</nav>

<main>
	<slot />
</main>
