import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw redirect(303, '/auth/login');

	const [profileRes, plotsRes, gamificationRes] = await Promise.all([
		fetch('/api/users/me'),
		fetch('/api/plots'),
		fetch('/api/users/me/gamification')
	]);

	const profile = profileRes.ok ? await profileRes.json() : null;
	const plots = plotsRes.ok ? await plotsRes.json() : [];
	const gamification = gamificationRes.ok ? await gamificationRes.json() : null;

	return { session, profile, plots, gamification };
};
