import { type Fetcher, parseJsonResponse } from './http.js';

type StatusResponse = {
  status?: string;
  service?: string;
};

export class BusinessClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: Fetcher = fetch
  ) {}

  async getStatus(): Promise<string> {
    const response = await this.fetcher(`${this.baseUrl}/status`, {
      method: 'GET',
    });

    const body = await parseJsonResponse<StatusResponse>(response);
    if (body.service) {
      return `${body.status || 'Running'} (${body.service})`;
    }
    return body.status || 'Running';
  }
}
