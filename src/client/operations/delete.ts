import type { ElasticConnection } from '../connection.ts';
import type { ESIndex } from '../../schema/index-builder.ts';
import type { ESField } from '../../schema/fields/base.ts';

export interface DeleteResponse {
  _index: string;
  _id: string;
  _version: number;
  result: 'deleted' | 'not_found';
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface DeleteOptions {
  routing?: string;
  refresh?: boolean | 'wait_for';
  timeout?: string;
  version?: number;
  version_type?: 'internal' | 'external' | 'external_gte';
  require_alias?: boolean;
}

export async function deleteDocument<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  id: string,
  options: DeleteOptions = {}
): Promise<DeleteResponse> {
  const path = `/${index.$name}/_doc/${encodeURIComponent(id)}`;

  const queryParams: Record<string, string | number | boolean> = {};
  if (options.routing) queryParams.routing = options.routing;
  if (options.refresh !== undefined) queryParams.refresh = options.refresh;
  if (options.timeout) queryParams.timeout = options.timeout;
  if (options.version !== undefined) queryParams.version = options.version;
  if (options.version_type) queryParams.version_type = options.version_type;
  if (options.require_alias !== undefined) queryParams.require_alias = options.require_alias;

  return connection.delete<DeleteResponse>(path, queryParams);
}
