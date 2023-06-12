<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<h1>Fight</h1>

<form action="/inventory?/add" method="post" use:enhance>
	<p>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" />
	</p>
	<p>
		<label for="count">Count</label>
		<input type="number" id="count" name="count" />
	</p>
	<button>Submit</button>
</form>
