export interface ElasticORMConfig {
  node: string;
  auth?: {
    username: string;
    password: string;
  } | {
    apiKey: string;
  };
  ssl?: {
    rejectUnauthorized?: boolean;
  };
  headers?: Record<string, string>;
}

export class ElasticConnection {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: ElasticORMConfig) {
    this.baseUrl = config.node.replace(/\/$/, '');
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (config.auth) {
      if ('apiKey' in config.auth) {
        this.headers['Authorization'] = `ApiKey ${config.auth.apiKey}`;
      } else {
        const credentials = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64');
        this.headers['Authorization'] = `Basic ${credentials}`;
      }
    }
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;

    if (queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const paramString = params.toString();
      if (paramString) {
        url += `?${paramString}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseBody = await response.text();
    let data: T;

    try {
      data = JSON.parse(responseBody) as T;
    } catch {
      throw new ElasticError(`Failed to parse response: ${responseBody}`, response.status);
    }

    if (!response.ok) {
      const errorMessage = (data as any)?.error?.reason || (data as any)?.error?.type || responseBody;
      throw new ElasticError(errorMessage, response.status, data);
    }

    return data;
  }

  async get<T = unknown>(path: string, queryParams?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>('GET', path, undefined, queryParams);
  }

  async post<T = unknown>(path: string, body?: unknown, queryParams?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>('POST', path, body, queryParams);
  }

  async put<T = unknown>(path: string, body?: unknown, queryParams?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>('PUT', path, body, queryParams);
  }

  async delete<T = unknown>(path: string, queryParams?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, queryParams);
  }

  async head(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'HEAD',
        headers: this.headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async requestNdjson<T = unknown>(
    method: string,
    path: string,
    body: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;

    if (queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const paramString = params.toString();
      if (paramString) {
        url += `?${paramString}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-ndjson',
      },
      body,
    });

    const responseBody = await response.text();
    let data: T;

    try {
      data = JSON.parse(responseBody) as T;
    } catch {
      throw new ElasticError(`Failed to parse response: ${responseBody}`, response.status);
    }

    if (!response.ok) {
      const errorMessage = (data as any)?.error?.reason || (data as any)?.error?.type || responseBody;
      throw new ElasticError(errorMessage, response.status, data);
    }

    return data;
  }
}

export class ElasticError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ElasticError';
  }
}
