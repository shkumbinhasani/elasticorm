import type { ElasticConnection } from '../client/connection.ts';
import type { ESIndex } from '../schema/index-builder.ts';
import type { ESField } from '../schema/fields/base.ts';

export interface IndexInfo {
  aliases: Record<string, unknown>;
  mappings: {
    properties: Record<string, unknown>;
  };
  settings: {
    index: Record<string, unknown>;
  };
}

export interface CreateIndexResponse {
  acknowledged: boolean;
  shards_acknowledged: boolean;
  index: string;
}

export interface UpdateMappingResponse {
  acknowledged: boolean;
}

export interface DeleteIndexResponse {
  acknowledged: boolean;
}

export interface RefreshResponse {
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface FlushResponse {
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
}

export async function createIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<CreateIndexResponse> {
  const path = `/${index.$name}`;
  return connection.put<CreateIndexResponse>(path, index._toIndexBody());
}

export async function updateMapping<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<UpdateMappingResponse> {
  const path = `/${index.$name}/_mapping`;
  return connection.put<UpdateMappingResponse>(path, index._toMappings());
}

export async function deleteIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<DeleteIndexResponse> {
  const path = `/${index.$name}`;
  return connection.delete<DeleteIndexResponse>(path);
}

export async function indexExists<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<boolean> {
  return connection.head(`/${index.$name}`);
}

export async function getIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<Record<string, IndexInfo>> {
  const path = `/${index.$name}`;
  return connection.get<Record<string, IndexInfo>>(path);
}

export async function getMapping<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<Record<string, { mappings: { properties: Record<string, unknown> } }>> {
  const path = `/${index.$name}/_mapping`;
  return connection.get(path);
}

export async function getSettings<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<Record<string, { settings: { index: Record<string, unknown> } }>> {
  const path = `/${index.$name}/_settings`;
  return connection.get(path);
}

export async function updateSettings<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  settings: Record<string, unknown>
): Promise<{ acknowledged: boolean }> {
  const path = `/${index.$name}/_settings`;
  return connection.put(path, { index: settings });
}

export async function refreshIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<RefreshResponse> {
  const path = `/${index.$name}/_refresh`;
  return connection.post<RefreshResponse>(path);
}

export async function flushIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  options?: { force?: boolean; wait_if_ongoing?: boolean }
): Promise<FlushResponse> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (options?.force !== undefined) queryParams.force = options.force;
  if (options?.wait_if_ongoing !== undefined) queryParams.wait_if_ongoing = options.wait_if_ongoing;

  const path = `/${index.$name}/_flush`;
  return connection.post<FlushResponse>(path, undefined, queryParams);
}

export async function closeIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<{ acknowledged: boolean; shards_acknowledged: boolean }> {
  const path = `/${index.$name}/_close`;
  return connection.post(path);
}

export async function openIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>
): Promise<{ acknowledged: boolean; shards_acknowledged: boolean }> {
  const path = `/${index.$name}/_open`;
  return connection.post(path);
}

export async function addAlias<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  alias: string,
  options?: {
    routing?: string;
    filter?: Record<string, unknown>;
    is_write_index?: boolean;
  }
): Promise<{ acknowledged: boolean }> {
  const body = {
    actions: [
      {
        add: {
          index: index.$name,
          alias,
          ...options,
        },
      },
    ],
  };
  return connection.post('/_aliases', body);
}

export async function removeAlias<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  alias: string
): Promise<{ acknowledged: boolean }> {
  const body = {
    actions: [
      {
        remove: {
          index: index.$name,
          alias,
        },
      },
    ],
  };
  return connection.post('/_aliases', body);
}

export async function reindex(
  connection: ElasticConnection,
  source: { index: string; query?: Record<string, unknown>; size?: number },
  dest: { index: string; pipeline?: string },
  options?: {
    refresh?: boolean;
    timeout?: string;
    wait_for_completion?: boolean;
    conflicts?: 'abort' | 'proceed';
  }
): Promise<{
  took: number;
  timed_out: boolean;
  total: number;
  updated: number;
  created: number;
  deleted: number;
  failures: unknown[];
}> {
  const body = {
    source,
    dest,
    conflicts: options?.conflicts,
  };

  const queryParams: Record<string, string | number | boolean> = {};
  if (options?.refresh !== undefined) queryParams.refresh = options.refresh;
  if (options?.timeout) queryParams.timeout = options.timeout;
  if (options?.wait_for_completion !== undefined) queryParams.wait_for_completion = options.wait_for_completion;

  return connection.post('/_reindex', body, queryParams);
}

export class IndexManager<Schemas extends Record<string, ESIndex<any, any>>> {
  constructor(
    private readonly connection: ElasticConnection,
    private readonly schemas: Schemas
  ) {}

  async sync(): Promise<void> {
    for (const index of Object.values(this.schemas)) {
      const exists = await indexExists(this.connection, index);
      if (!exists) {
        await createIndex(this.connection, index);
      } else {
        await updateMapping(this.connection, index);
      }
    }
  }

  async createAll(): Promise<void> {
    for (const index of Object.values(this.schemas)) {
      const exists = await indexExists(this.connection, index);
      if (!exists) {
        await createIndex(this.connection, index);
      }
    }
  }

  async deleteAll(): Promise<void> {
    for (const index of Object.values(this.schemas)) {
      const exists = await indexExists(this.connection, index);
      if (exists) {
        await deleteIndex(this.connection, index);
      }
    }
  }

  async refreshAll(): Promise<void> {
    for (const index of Object.values(this.schemas)) {
      await refreshIndex(this.connection, index);
    }
  }
}
