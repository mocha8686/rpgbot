import { validateRoute } from '$lib/server/lucia';

import type { PageServerLoad } from '../$types';

export const load = (async ({ locals, url }) => {
	const user = validateRoute(locals, url.pathname);
	return { user };
}) satisfies PageServerLoad;
