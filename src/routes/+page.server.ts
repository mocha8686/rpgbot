import { auth } from '$lib/server/lucia';

import { type Actions, redirect } from '@sveltejs/kit';

export const actions = {
	logout: async ({ request, locals }) => {
		const { session } = await locals.auth.validateUser();
		if (!session) return;

		const formData = await request.formData();
		const redirectPath = (formData.get('redirect') as string) ?? '/';

		auth.invalidateSession(session.sessionId);
		locals.auth.setSession(null);
		throw redirect(302, redirectPath);
	},
} satisfies Actions;
