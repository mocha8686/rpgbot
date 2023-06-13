import { type RequestHandler, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';

export const GET = (async ({ locals }) => {
	const { session } = await locals.auth.validateUser();
	if (session) auth.invalidateSession(session.sessionId);
	throw redirect(302, '/');
}) satisfies RequestHandler;
