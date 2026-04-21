import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	throw redirect(
		307,
		`/dashboard/plots/${params.plotId}/activities/${params.activityId}/flows/flashcard_review`
	);
};
