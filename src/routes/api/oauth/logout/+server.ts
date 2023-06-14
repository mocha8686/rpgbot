import { auth } from '$lib/server/lucia';

import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET = (async ({ locals }) => {
	const { session } = await locals.auth.validateUser();
	if (session) auth.invalidateSession(session.sessionId);
	throw redirect(302, '/');
}) satisfies RequestHandler;
