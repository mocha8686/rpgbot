<script lang="ts">
	import { page } from '$app/stores';

	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: user = data.user;
</script>

<header>
	{#if user}
		<img src={user.avatar} alt="Avatar" />
		<p>{user.username}</p>
		<form action="/api/oauth/logout">
			<button>Sign out</button>
		</form>
	{:else}
		<a href={`/api/oauth?redirect=${$page.url.pathname}`}>Sign in with Discord</a>
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
