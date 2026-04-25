import { redirect } from '@sveltejs/kit';
import type { Plot } from '$lib/types';
import type { LayoutServerLoad } from './$types';

type DashboardPlot = Omit<Plot, 'archived'> & {
	archived?: boolean | string | number;
	is_archived?: boolean | string | number;
};

export const load: LayoutServerLoad = async ({ locals, fetch, depends }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw redirect(303, '/auth/login');

	// Custom dependency key lets us invalidate dashboard plot data in one place.
	depends('app:dashboard-plots');

	const fetchJson = async <T,>(url: string): Promise<T | null> => {
		const res = await fetch(url);
		return res.ok ? ((await res.json()) as T) : null;
	};

	const [profileRes, plotsRes, gamificationRes] = await Promise.all([
		fetch('/api/users/me'),
		fetch('/api/plots'),
		fetch('/api/users/me/gamification')
	]);

	const profile = profileRes.ok ? await profileRes.json() : null;
	const basePlots = plotsRes.ok ? ((await plotsRes.json()) as DashboardPlot[]) : [];

	// Some backend builds only return active plots by default; try common
	// query variants to include archived and merge by id.
	const [plotsIncludeArchived, plotsArchivedOnly] = await Promise.all([
		fetchJson<DashboardPlot[]>('/api/plots?include_archived=true'),
		fetchJson<DashboardPlot[]>('/api/plots?archived=true')
	]);

	const mergedMap = new Map<string, DashboardPlot>();
	for (const list of [basePlots, plotsIncludeArchived ?? [], plotsArchivedOnly ?? []]) {
		if (!Array.isArray(list)) continue;
		for (const plot of list) {
			const id = typeof plot?.id === 'string' ? plot.id : null;
			if (id) mergedMap.set(id, plot);
		}
	}
	const plots = [...mergedMap.values()];
	const gamification = gamificationRes.ok ? await gamificationRes.json() : null;

	return { session, profile, plots, gamification };
};
