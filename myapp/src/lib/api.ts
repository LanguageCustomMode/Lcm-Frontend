/**
 * Typed fetch wrapper for /api/* calls to the FastAPI backend.
 * All requests are proxied through SvelteKit hooks.server.ts.
 */

export class ApiError extends Error {
	constructor(
		public status: number,
		public detail: string
	) {
		super(detail);
	}
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const body = await response.json().catch(() => ({ detail: response.statusText }));
		throw new ApiError(response.status, body.detail ?? response.statusText);
	}
	return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
	const response = await fetch(`/api${path}`);
	return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
	const response = await fetch(`/api${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined
	});
	return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
	const response = await fetch(`/api${path}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
	const response = await fetch(`/api${path}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return handleResponse<T>(response);
}

export async function apiDelete(path: string): Promise<void> {
	const response = await fetch(`/api${path}`, { method: 'DELETE' });
	if (!response.ok) {
		const body = await response.json().catch(() => ({ detail: response.statusText }));
		throw new ApiError(response.status, body.detail ?? response.statusText);
	}
}
