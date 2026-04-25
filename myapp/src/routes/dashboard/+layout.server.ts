import { redirect } from '@sveltejs/kit';
import type { Plot, Profile } from '$lib/types';
import type { LayoutServerLoad } from './$types';

type DashboardPlot = Omit<Plot, 'archived'> & {
	archived?: boolean | string | number;
	is_archived?: boolean | string | number;
};

type Gamification = {
	xp: number;
	level: number;
	coins: number;
	xp_to_next_level: number;
	progress_percent?: number;
	xp_current_level?: number;
};

export const load: LayoutServerLoad = async ({ locals, fetch, depends }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw redirect(303, '/auth/login');

	// Custom dependency key lets us invalidate dashboard plot data in one place.
	depends('app:dashboard-plots');

	const fetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
		const res = await fetch(url);
		return res.ok ? ((await res.json()) as T) : fallback;
	};

	const [profile, basePlots, plotsIncludeArchived, plotsArchivedOnly, gamification] = await Promise.all([
		fetchJson<Profile | null>('/api/users/me', null),
		fetchJson<DashboardPlot[]>('/api/plots', []),
		fetchJson<DashboardPlot[]>('/api/plots?include_archived=true', []),
		fetchJson<DashboardPlot[]>('/api/plots?archived=true', []),
		fetchJson<Gamification | null>('/api/users/me/gamification', null)
	]);

	// Some backend builds only return active plots by default; try common
	// query variants to include archived and merge by id.
	const mergedMap = new Map<string, DashboardPlot>();
	for (const list of [basePlots, plotsIncludeArchived, plotsArchivedOnly]) {
		if (!Array.isArray(list)) continue;
		for (const plot of list) {
			const id = typeof plot?.id === 'string' ? plot.id : null;
			if (id) mergedMap.set(id, plot);
		}
	}
	const plots = [...mergedMap.values()];

	return { session, profile, plots, gamification };
};
