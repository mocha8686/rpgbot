import { dev } from '$app/environment';
import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI_BASE,
} from '$env/static/private';
import lucia from 'lucia-auth';
import { sveltekit } from 'lucia-auth/middleware';

import prisma from '@lucia-auth/adapter-prisma';
import { discord } from '@lucia-auth/oauth/providers';
import prismaClient from './prisma';
import { redirect } from '@sveltejs/kit';

import type { LuciaUser } from '@lucia-auth/oauth/lucia';

export const auth = lucia({
	adapter: prisma(prismaClient),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	transformDatabaseUser: (databaseUser) => {
		return {
			userId: databaseUser.id,
			username: databaseUser.username,
			snowflake: databaseUser.snowflake,
			avatar: databaseUser.avatar,
		};
	},
});
export type Auth = typeof auth;

export const discordAuth = discord(auth, {
	clientId: DISCORD_CLIENT_ID,
	clientSecret: DISCORD_CLIENT_SECRET,
	redirectUri: new URL('/api/oauth/callback', DISCORD_REDIRECT_URI_BASE).toString(),
});

export async function validateRoute(
	locals: App.Locals,
	redirectPath: string
): Promise<LuciaUser<Auth>> {
	const { user } = await locals.auth.validateUser();
	if (!user) throw redirect(302, '/api/oauth?redirect=' + redirectPath);
	return user;
}
