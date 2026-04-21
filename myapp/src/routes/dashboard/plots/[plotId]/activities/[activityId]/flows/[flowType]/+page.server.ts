import { error } from '@sveltejs/kit';
import type { Activity, FlowType } from '$lib/types';
import type { PageServerLoad } from './$types';

const VALID_FLOWS: FlowType[] = [
	'flashcard_review',
	'flashcard_audio',
	'audiocard_review',
	'mcq_review',
	'conversation',
	'writing_chat',
	'reading_chat',
	'tutor_chat'
];

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { activityId, flowType } = params;

	if (!VALID_FLOWS.includes(flowType as FlowType)) {
		throw error(404, `Unknown flow type: ${flowType}`);
	}

	const res = await fetch(`/api/activities/${activityId}`);
	if (!res.ok) {
		throw error(res.status, `Activity not found`);
	}
	const activity: Activity = await res.json();

	const supported = activity.supported_flows ?? [];
	if (!supported.includes(flowType as FlowType)) {
		throw error(404, `Flow "${flowType}" not supported for this activity type`);
	}

	return { activity, flowType: flowType as FlowType };
};
