export type Fetcher = typeof fetch;

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message =
      typeof body?.error === 'string' ? body.error : `HTTP ${response.status}`;
    throw new HttpError(message, response.status, body);
  }

  return body as T;
}
