import { redirect } from '@sveltejs/kit';
import type { Activity } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/activities/${params.activityId}`);
	const activity: Activity | null = res.ok ? await res.json() : null;
	const flowType = activity?.supported_flows?.[0] ?? 'conversation';

	throw redirect(
		307,
		`/dashboard/plots/${params.plotId}/activities/${params.activityId}/flows/${flowType}`
	);
};
