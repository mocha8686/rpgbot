import { discordAuth } from '$lib/server/lucia';

import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET = (async ({ cookies, url }) => {
	const [discordUrl, state] = await discordAuth.getAuthorizationUrl();

	const ONE_HOUR = 60 * 60;
	cookies.set('discordOAuthState', state, {
		path: '/',
		maxAge: ONE_HOUR,
	});
	cookies.set('redirect', url.searchParams.get('redirect') ?? '/', {
		path: '/',
		maxAge: ONE_HOUR,
	});

	throw redirect(302, discordUrl.toString());
}) satisfies RequestHandler;
