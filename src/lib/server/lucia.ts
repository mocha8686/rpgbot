import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI_BASE,
} from '$env/static/private';
import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';
import { discord } from '@lucia-auth/oauth/providers';
import lucia from 'lucia-auth';
import prisma from '@lucia-auth/adapter-prisma';
import { sveltekit } from 'lucia-auth/middleware';

export const auth = lucia({
	adapter: prisma(new PrismaClient()),
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

export const discordAuth = discord(auth, {
	clientId: DISCORD_CLIENT_ID,
	clientSecret: DISCORD_CLIENT_SECRET,
	redirectUri: new URL('/api/oauth/discord/callback', DISCORD_REDIRECT_URI_BASE).toString(),
});

export type Auth = typeof auth;
