import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const plotRes = await fetch(`/api/plots/${params.plotId}`);
	const plot = plotRes.ok ? await plotRes.json() : null;
	return { plot };
};
