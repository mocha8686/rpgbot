import type { PageServerLoad } from '../$types';
import { validateRoute } from '$lib/server/lucia';

export const load = (async ({ locals, url }) => {
	const user = validateRoute(locals, url.pathname);
	return { user };
}) satisfies PageServerLoad;
