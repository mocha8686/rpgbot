import type { Actions, PageServerLoad } from './$types';
import { validateRoute } from '$lib/server/lucia';
import { z } from 'zod';

const InventoryAdd = z.object({
	name: z.string(),
	count: z.coerce.number(),
});

const items: z.infer<typeof InventoryAdd>[] = [];

export const load = (async ({ locals, url }) => {
	const user = validateRoute(locals, url.pathname);

	return {
		user,
		items,
	};
}) satisfies PageServerLoad;

export const actions = {
	add: async ({ request }) => {
		const form = Object.fromEntries((await request.formData()).entries());
		const item = InventoryAdd.parse(form);
		items.push(item);
	},
} satisfies Actions;
