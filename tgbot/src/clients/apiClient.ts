import { type Fetcher, parseJsonResponse } from './http.js';

type StatusResponse = {
  Status?: string;
  status?: string;
};

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: Fetcher = fetch
  ) {}

  async getStatus(): Promise<string> {
    const response = await this.fetcher(`${this.baseUrl}/status`, {
      method: 'GET',
    });

    const body = await parseJsonResponse<StatusResponse>(response);
    return body.status || body.Status || 'Running';
  }
}
