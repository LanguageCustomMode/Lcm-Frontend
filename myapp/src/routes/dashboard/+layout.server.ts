import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw redirect(303, '/auth/login');

	const profileRes = await fetch('/api/users/me');
	const profile = profileRes.ok ? await profileRes.json() : null;

	const plotsRes = await fetch('/api/plots');
	const plots = plotsRes.ok ? await plotsRes.json() : [];

	return { session, profile, plots };
};
