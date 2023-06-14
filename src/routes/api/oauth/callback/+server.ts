import path from 'node:path';

import { auth, discordAuth } from '$lib/server/lucia';

import { error, redirect, type RequestHandler } from '@sveltejs/kit';

export const GET = (async ({ cookies, url, locals }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const storedState = cookies.get('discordOAuthState');

	if (!code || !state || !storedState || state !== storedState) throw error(401);

	try {
		const { existingUser, providerUser, createUser } = await discordAuth.validateCallback(code);

		const user =
			existingUser ??
			(await createUser({
				username: providerUser.username,
				avatar: new URL(
					path.join('avatars', providerUser.id, `${providerUser.avatar}.webp`),
					'https://cdn.discordapp.com'
				).toString(),
				snowflake: providerUser.id,
			}));
		const session = await auth.createSession(user.userId);
		locals.auth.setSession(session);
	} catch (e) {
		console.error(e);
		throw error(500);
	}

	throw redirect(302, cookies.get('redirect') ?? '/');
}) satisfies RequestHandler;
