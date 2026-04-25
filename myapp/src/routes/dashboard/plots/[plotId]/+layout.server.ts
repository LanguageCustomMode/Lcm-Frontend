import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const [plotRes, gamificationRes] = await Promise.all([
		fetch(`/api/plots/${params.plotId}`),
		fetch('/api/users/me/gamification')
	]);
	const plot = plotRes.ok ? await plotRes.json() : null;
	const gamification = gamificationRes.ok ? await gamificationRes.json() : null;
	return { plot, gamification };
};
