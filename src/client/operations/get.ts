import type { ElasticConnection } from '../connection.ts';
import type { ESIndex } from '../../schema/index-builder.ts';
import type { InferDocument } from '../../schema/types.ts';
import type { ESField } from '../../schema/fields/base.ts';
import { ElasticError } from '../connection.ts';

export interface GetResponse<T> {
  _index: string;
  _id: string;
  _version: number;
  _seq_no: number;
  _primary_term: number;
  found: boolean;
  _source: T;
}

export interface GetOptions {
  routing?: string;
  _source?: boolean | string[];
  _source_excludes?: string[];
  _source_includes?: string[];
  stored_fields?: string[];
  preference?: string;
  realtime?: boolean;
  refresh?: boolean;
  version?: number;
  version_type?: 'internal' | 'external' | 'external_gte';
}

export async function getDocument<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  id: string,
  options: GetOptions = {}
): Promise<InferDocument<Fields> | null> {
  const path = `/${index.$name}/_doc/${encodeURIComponent(id)}`;

  const queryParams: Record<string, string | number | boolean> = {};
  if (options.routing) queryParams.routing = options.routing;
  if (options._source !== undefined) {
    queryParams._source = Array.isArray(options._source) ? options._source.join(',') : options._source;
  }
  if (options._source_excludes) queryParams._source_excludes = options._source_excludes.join(',');
  if (options._source_includes) queryParams._source_includes = options._source_includes.join(',');
  if (options.stored_fields) queryParams.stored_fields = options.stored_fields.join(',');
  if (options.preference) queryParams.preference = options.preference;
  if (options.realtime !== undefined) queryParams.realtime = options.realtime;
  if (options.refresh !== undefined) queryParams.refresh = options.refresh;
  if (options.version !== undefined) queryParams.version = options.version;
  if (options.version_type) queryParams.version_type = options.version_type;

  try {
    const response = await connection.get<GetResponse<InferDocument<Fields>>>(path, queryParams);
    return response.found ? response._source : null;
  } catch (error) {
    if (error instanceof ElasticError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export async function getDocumentWithMeta<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  id: string,
  options: GetOptions = {}
): Promise<GetResponse<InferDocument<Fields>> | null> {
  const path = `/${index.$name}/_doc/${encodeURIComponent(id)}`;

  const queryParams: Record<string, string | number | boolean> = {};
  if (options.routing) queryParams.routing = options.routing;
  if (options._source !== undefined) {
    queryParams._source = Array.isArray(options._source) ? options._source.join(',') : options._source;
  }
  if (options._source_excludes) queryParams._source_excludes = options._source_excludes.join(',');
  if (options._source_includes) queryParams._source_includes = options._source_includes.join(',');
  if (options.stored_fields) queryParams.stored_fields = options.stored_fields.join(',');
  if (options.preference) queryParams.preference = options.preference;
  if (options.realtime !== undefined) queryParams.realtime = options.realtime;
  if (options.refresh !== undefined) queryParams.refresh = options.refresh;
  if (options.version !== undefined) queryParams.version = options.version;
  if (options.version_type) queryParams.version_type = options.version_type;

  try {
    const response = await connection.get<GetResponse<InferDocument<Fields>>>(path, queryParams);
    return response.found ? response : null;
  } catch (error) {
    if (error instanceof ElasticError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export async function multiGet<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  connection: ElasticConnection,
  index: ESIndex<Name, Fields>,
  ids: string[],
  options: GetOptions = {}
): Promise<(InferDocument<Fields> | null)[]> {
  const path = `/${index.$name}/_mget`;

  const body = {
    ids,
  };

  const queryParams: Record<string, string | number | boolean> = {};
  if (options.routing) queryParams.routing = options.routing;
  if (options._source !== undefined) {
    queryParams._source = Array.isArray(options._source) ? options._source.join(',') : options._source;
  }
  if (options._source_excludes) queryParams._source_excludes = options._source_excludes.join(',');
  if (options._source_includes) queryParams._source_includes = options._source_includes.join(',');
  if (options.stored_fields) queryParams.stored_fields = options.stored_fields.join(',');
  if (options.preference) queryParams.preference = options.preference;
  if (options.realtime !== undefined) queryParams.realtime = options.realtime;
  if (options.refresh !== undefined) queryParams.refresh = options.refresh;

  interface MGetResponse {
    docs: GetResponse<InferDocument<Fields>>[];
  }

  const response = await connection.post<MGetResponse>(path, body, queryParams);
  return response.docs.map((doc) => (doc.found ? doc._source : null));
}
