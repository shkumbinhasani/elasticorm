import type { ElasticConnection } from '../connection';
import type { ESIndex } from '../../schema/index-builder';
import type { InferInsertDocument, InferDocument } from '../../schema/types';
import type { ESField } from '../../schema/fields/base';

export interface BulkResponseItem {
  index?: BulkItemResult;
  create?: BulkItemResult;
  update?: BulkItemResult;
  delete?: BulkItemResult;
}

export interface BulkItemResult {
  _index: string;
  _id: string;
  _version?: number;
  result?: string;
  _shards?: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no?: number;
  _primary_term?: number;
  status: number;
  error?: {
    type: string;
    reason: string;
    index_uuid?: string;
    shard?: string;
    index?: string;
  };
}

export interface BulkResponse {
  took: number;
  errors: boolean;
  items: BulkResponseItem[];
}

export interface BulkOptions {
  refresh?: boolean | 'wait_for';
  routing?: string;
  timeout?: string;
  pipeline?: string;
  require_alias?: boolean;
}

interface BulkIndexItem<T> {
  id?: string;
  document: T;
  routing?: string;
}

interface BulkCreateItem<T> {
  id: string;
  document: T;
  routing?: string;
}

interface BulkUpdateItem<T> {
  id: string;
  doc?: Partial<T>;
  script?: {
    source: string;
    lang?: string;
    params?: Record<string, unknown>;
  };
  doc_as_upsert?: boolean;
  upsert?: Partial<T>;
  routing?: string;
}

interface BulkDeleteItem {
  id: string;
  routing?: string;
}

export class BulkOperation<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
> {
  private operations: string[] = [];

  constructor(
    private readonly connection: ElasticConnection,
    private readonly esIndex: ESIndex<Name, Fields>
  ) {}

  index(items: BulkIndexItem<InferInsertDocument<Fields>>[]): this;
  index(documents: InferInsertDocument<Fields>[]): this;
  index(arg: BulkIndexItem<InferInsertDocument<Fields>>[] | InferInsertDocument<Fields>[]): this {
    for (const item of arg) {
      if ('document' in item && typeof (item as any).document === 'object') {
        // BulkIndexItem format: { id?, document, routing? }
        const bulkItem = item as BulkIndexItem<InferInsertDocument<Fields>>;
        const action: Record<string, unknown> = { _index: this.esIndex.$name };
        if (bulkItem.id) action._id = bulkItem.id;
        if (bulkItem.routing) action.routing = bulkItem.routing;
        this.operations.push(JSON.stringify({ index: action }));
        this.operations.push(JSON.stringify(bulkItem.document));
      } else {
        // Plain document format - check if it has an 'id' field to use as _id
        const doc = item as Record<string, unknown>;
        const action: Record<string, unknown> = { _index: this.esIndex.$name };
        if (doc.id && typeof doc.id === 'string') {
          action._id = doc.id;
        }
        this.operations.push(JSON.stringify({ index: action }));
        this.operations.push(JSON.stringify(item));
      }
    }
    return this;
  }

  create(items: BulkCreateItem<InferInsertDocument<Fields>>[]): this {
    for (const item of items) {
      const action: Record<string, unknown> = {
        _index: this.esIndex.$name,
        _id: item.id,
      };
      if (item.routing) action.routing = item.routing;
      this.operations.push(JSON.stringify({ create: action }));
      this.operations.push(JSON.stringify(item.document));
    }
    return this;
  }

  update(items: BulkUpdateItem<InferDocument<Fields>>[]): this {
    for (const item of items) {
      const action: Record<string, unknown> = {
        _index: this.esIndex.$name,
        _id: item.id,
      };
      if (item.routing) action.routing = item.routing;
      this.operations.push(JSON.stringify({ update: action }));

      const updateBody: Record<string, unknown> = {};
      if (item.doc) updateBody.doc = item.doc;
      if (item.script) updateBody.script = item.script;
      if (item.doc_as_upsert !== undefined) updateBody.doc_as_upsert = item.doc_as_upsert;
      if (item.upsert) updateBody.upsert = item.upsert;
      this.operations.push(JSON.stringify(updateBody));
    }
    return this;
  }

  delete(items: BulkDeleteItem[]): this;
  delete(ids: string[]): this;
  delete(arg: BulkDeleteItem[] | string[]): this {
    for (const item of arg) {
      if (typeof item === 'string') {
        this.operations.push(JSON.stringify({ delete: { _index: this.esIndex.$name, _id: item } }));
      } else {
        const action: Record<string, unknown> = {
          _index: this.esIndex.$name,
          _id: item.id,
        };
        if (item.routing) action.routing = item.routing;
        this.operations.push(JSON.stringify({ delete: action }));
      }
    }
    return this;
  }

  async execute(options: BulkOptions = {}): Promise<BulkResponse> {
    if (this.operations.length === 0) {
      throw new Error('No operations provided for bulk request');
    }

    const path = '/_bulk';
    const body = this.operations.join('\n') + '\n';

    const queryParams: Record<string, string | number | boolean> = {};
    if (options.refresh !== undefined) queryParams.refresh = options.refresh;
    if (options.routing) queryParams.routing = options.routing;
    if (options.timeout) queryParams.timeout = options.timeout;
    if (options.pipeline) queryParams.pipeline = options.pipeline;
    if (options.require_alias !== undefined) queryParams.require_alias = options.require_alias;

    return this.connection.requestNdjson<BulkResponse>('POST', path, body, queryParams);
  }
}
