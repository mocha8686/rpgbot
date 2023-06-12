<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Inventory</h1>
<ul>
	{#each data.items as item}
		<li>{item.name} x{item.count}</li>
	{:else}
		<li>Empty</li>
	{/each}
</ul>
