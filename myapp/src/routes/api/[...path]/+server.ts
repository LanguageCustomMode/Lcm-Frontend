import type { RequestHandler } from './$types';

// This catch-all route exists as a fallback.
// The primary API proxy is handled in hooks.server.ts.
// This file ensures the route is recognized by SvelteKit's router.

export const GET: RequestHandler = async ({ url }) => {
	return new Response('API proxy not configured', { status: 502 });
};

export const POST: RequestHandler = async ({ url }) => {
	return new Response('API proxy not configured', { status: 502 });
};

export const PATCH: RequestHandler = async ({ url }) => {
	return new Response('API proxy not configured', { status: 502 });
};

export const PUT: RequestHandler = async ({ url }) => {
	return new Response('API proxy not configured', { status: 502 });
};

export const DELETE: RequestHandler = async ({ url }) => {
	return new Response('API proxy not configured', { status: 502 });
};
