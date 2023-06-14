import prisma from '$lib/server/prisma';
import { z } from 'zod';

import { json, type RequestHandler } from '@sveltejs/kit';

const InventoryAdd = z.object({
	userId: z.string(),
	name: z.string(),
	count: z.coerce.number(),
});

export const POST = (async ({ request }) => {
	const body = await request.json();
	const data = InventoryAdd.parse(body);

	await prisma.item.upsert({
		where: {
			name_ownerId: {
				name: data.name,
				ownerId: data.userId,
			},
		},
		create: {
			name: data.name,
			count: data.count,
			owner: {
				connect: {
					id: data.userId,
				},
			},
		},
		update: {
			count: data.count,
		},
	});

	return json({ success: true });
}) satisfies RequestHandler;
