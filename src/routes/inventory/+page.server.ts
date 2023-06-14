import { validateRoute } from '$lib/server/lucia';
import prisma from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	const user = await validateRoute(locals, url.pathname);

	const res = await prisma.authUser.findUniqueOrThrow({
		where: {
			id: user.userId,
		},
		select: {
			items: {
				select: {
					name: true,
					count: true,
				},
			},
		},
	});

	return {
		user,
		items: res.items,
	};
}) satisfies PageServerLoad;
