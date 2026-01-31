import type { ElasticConnection } from '../connection';
import type { ESIndex } from '../../schema/index-builder';
import type { InferInsertDocument } from '../../schema/types';
import type { ESField } from '../../schema/fields/base';

export interface IndexResponse {
  _index: string;
  _id: string;
  _version: number;
  result: 'created' | 'updated';
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface IndexOptions {
  id?: string;
  routing?: string;
  refresh?: boolean | 'wait_for';
  timeout?: string;
  pipeline?: string;
  require_alias?: boolean;
}

export class IndexOperation<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
> {
  private _document?: InferInsertDocument<Fields>;

  constructor(
    private readonly connection: ElasticConnection,
    private readonly index: ESIndex<Name, Fields>
  ) {}

  values(document: InferInsertDocument<Fields>): this {
    this._document = document;
    return this;
  }

  async execute(options: IndexOptions = {}): Promise<IndexResponse> {
    if (!this._document) {
      throw new Error('No document provided. Call .values() before .execute()');
    }

    const path = options.id
      ? `/${this.index.$name}/_doc/${encodeURIComponent(options.id)}`
      : `/${this.index.$name}/_doc`;

    const queryParams: Record<string, string | number | boolean> = {};
    if (options.routing) queryParams.routing = options.routing;
    if (options.refresh !== undefined) queryParams.refresh = options.refresh;
    if (options.timeout) queryParams.timeout = options.timeout;
    if (options.pipeline) queryParams.pipeline = options.pipeline;
    if (options.require_alias !== undefined) queryParams.require_alias = options.require_alias;

    const method = options.id ? 'PUT' : 'POST';
    return this.connection.request<IndexResponse>(method, path, this._document, queryParams);
  }
}
