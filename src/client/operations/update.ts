import type { ElasticConnection } from '../connection';
import type { ESIndex } from '../../schema/index-builder';
import type { InferDocument } from '../../schema/types';
import type { ESField } from '../../schema/fields/base';

export interface UpdateResponse {
  _index: string;
  _id: string;
  _version: number;
  result: 'updated' | 'noop' | 'deleted';
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface UpdateOptions {
  routing?: string;
  refresh?: boolean | 'wait_for';
  timeout?: string;
  retry_on_conflict?: number;
  _source?: boolean | string[];
  _source_excludes?: string[];
  _source_includes?: string[];
  require_alias?: boolean;
}

export class UpdateOperation<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
> {
  private _doc?: Partial<InferDocument<Fields>>;
  private _script?: {
    source: string;
    lang?: string;
    params?: Record<string, unknown>;
  };
  private _upsert?: Partial<InferDocument<Fields>>;
  private _doc_as_upsert?: boolean;
  private _scripted_upsert?: boolean;

  constructor(
    private readonly connection: ElasticConnection,
    private readonly index: ESIndex<Name, Fields>,
    private readonly id: string
  ) {}

  set(doc: Partial<InferDocument<Fields>>): this {
    this._doc = doc;
    return this;
  }

  script(source: string, params?: Record<string, unknown>, lang: string = 'painless'): this {
    this._script = { source, params, lang };
    return this;
  }

  upsert(doc: Partial<InferDocument<Fields>>): this {
    this._upsert = doc;
    return this;
  }

  docAsUpsert(value: boolean = true): this {
    this._doc_as_upsert = value;
    return this;
  }

  scriptedUpsert(value: boolean = true): this {
    this._scripted_upsert = value;
    return this;
  }

  async execute(options: UpdateOptions = {}): Promise<UpdateResponse> {
    if (!this._doc && !this._script) {
      throw new Error('No update provided. Call .set() or .script() before .execute()');
    }

    const path = `/${this.index.$name}/_update/${encodeURIComponent(this.id)}`;

    const body: Record<string, unknown> = {};
    if (this._doc) body.doc = this._doc;
    if (this._script) body.script = this._script;
    if (this._upsert) body.upsert = this._upsert;
    if (this._doc_as_upsert !== undefined) body.doc_as_upsert = this._doc_as_upsert;
    if (this._scripted_upsert !== undefined) body.scripted_upsert = this._scripted_upsert;

    const queryParams: Record<string, string | number | boolean> = {};
    if (options.routing) queryParams.routing = options.routing;
    if (options.refresh !== undefined) queryParams.refresh = options.refresh;
    if (options.timeout) queryParams.timeout = options.timeout;
    if (options.retry_on_conflict !== undefined) queryParams.retry_on_conflict = options.retry_on_conflict;
    if (options._source !== undefined) {
      queryParams._source = Array.isArray(options._source) ? options._source.join(',') : options._source;
    }
    if (options._source_excludes) queryParams._source_excludes = options._source_excludes.join(',');
    if (options._source_includes) queryParams._source_includes = options._source_includes.join(',');
    if (options.require_alias !== undefined) queryParams.require_alias = options.require_alias;

    return this.connection.post<UpdateResponse>(path, body, queryParams);
  }
}
