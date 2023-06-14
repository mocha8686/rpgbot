<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let name: string;
	let count: number;

	async function addItem() {
		await fetch('/api/inventory', {
			method: 'POST',
			body: JSON.stringify({
				name,
				count,
				userId: data.user.userId,
			}),
		});
	}
</script>

<h1>Fight</h1>

<form on:submit|preventDefault={() => addItem()}>
	<p>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" bind:value={name} />
	</p>
	<p>
		<label for="count">Count</label>
		<input type="number" id="count" name="count" bind:value={count} />
	</p>
	<input type="hidden" id="user-id" name="userId" value={data.user.userId} />
	<button>Submit</button>
</form>
