import { ElasticConnection, type ElasticORMConfig } from './connection.ts';
import { ESIndex } from '../schema/index-builder.ts';
import { IndexOperation, type IndexOptions, type IndexResponse } from './operations/index-op.ts';
import { getDocument, getDocumentWithMeta, multiGet, type GetOptions, type GetResponse } from './operations/get.ts';
import { UpdateOperation, type UpdateOptions } from './operations/update.ts';
import { deleteDocument, type DeleteOptions, type DeleteResponse } from './operations/delete.ts';
import { BulkOperation, type BulkOptions, type BulkResponse } from './operations/bulk.ts';
import { SearchBuilder } from '../query/builder.ts';
import type { ESField } from '../schema/fields/base.ts';
import type { InferDocument, InferInsertDocument } from '../schema/types.ts';

export { type ElasticORMConfig, ElasticError } from './connection.ts';
export * from './operations/index.ts';

export type SchemaMap = Record<string, ESIndex<any, any>>;

export class ElasticORM {
  private connection: ElasticConnection;

  constructor(config: ElasticORMConfig) {
    this.connection = new ElasticConnection(config);
  }

  connect<T extends SchemaMap>(schemas: T): Database<T> {
    return new Database(this.connection, schemas);
  }

  getConnection(): ElasticConnection {
    return this.connection;
  }
}

export class Database<Schemas extends SchemaMap> {
  constructor(
    private readonly connection: ElasticConnection,
    private readonly schemas: Schemas
  ) {}

  index<K extends keyof Schemas>(
    index: Schemas[K]
  ): IndexOperation<
    Schemas[K]['$name'],
    Schemas[K]['$fields']
  > {
    return new IndexOperation(this.connection, index);
  }

  async get<K extends keyof Schemas>(
    index: Schemas[K],
    id: string,
    options?: GetOptions
  ): Promise<InferDocument<Schemas[K]['$fields']> | null> {
    return getDocument(this.connection, index, id, options) as Promise<InferDocument<Schemas[K]['$fields']> | null>;
  }

  async getWithMeta<K extends keyof Schemas>(
    index: Schemas[K],
    id: string,
    options?: GetOptions
  ): Promise<GetResponse<InferDocument<Schemas[K]['$fields']>> | null> {
    return getDocumentWithMeta(this.connection, index, id, options) as Promise<GetResponse<InferDocument<Schemas[K]['$fields']>> | null>;
  }

  async mget<K extends keyof Schemas>(
    index: Schemas[K],
    ids: string[],
    options?: GetOptions
  ): Promise<(InferDocument<Schemas[K]['$fields']> | null)[]> {
    return multiGet(this.connection, index, ids, options) as Promise<(InferDocument<Schemas[K]['$fields']> | null)[]>;
  }

  update<K extends keyof Schemas>(
    index: Schemas[K],
    id: string
  ): UpdateOperation<
    Schemas[K]['$name'],
    Schemas[K]['$fields']
  > {
    return new UpdateOperation(this.connection, index, id);
  }

  async delete<K extends keyof Schemas>(
    index: Schemas[K],
    id: string,
    options?: DeleteOptions
  ): Promise<DeleteResponse> {
    return deleteDocument(this.connection, index, id, options);
  }

  bulk<K extends keyof Schemas>(
    index: Schemas[K]
  ): BulkOperation<
    Schemas[K]['$name'],
    Schemas[K]['$fields']
  > {
    return new BulkOperation(this.connection, index);
  }

  search<K extends keyof Schemas>(
    index: Schemas[K]
  ): SearchBuilder<
    Schemas[K]['$name'],
    Schemas[K]['$fields'],
    InferDocument<Schemas[K]['$fields']>
  > {
    return new SearchBuilder(this.connection, index);
  }

  async createIndex<K extends keyof Schemas>(
    index: Schemas[K]
  ): Promise<{ acknowledged: boolean; shards_acknowledged: boolean; index: string }> {
    const path = `/${index.$name}`;
    return this.connection.put(path, index._toIndexBody());
  }

  async updateMapping<K extends keyof Schemas>(
    index: Schemas[K]
  ): Promise<{ acknowledged: boolean }> {
    const path = `/${index.$name}/_mapping`;
    return this.connection.put(path, index._toMappings());
  }

  async deleteIndex<K extends keyof Schemas>(
    index: Schemas[K]
  ): Promise<{ acknowledged: boolean }> {
    const path = `/${index.$name}`;
    return this.connection.delete(path);
  }

  async indexExists<K extends keyof Schemas>(
    index: Schemas[K]
  ): Promise<boolean> {
    return this.connection.head(`/${index.$name}`);
  }

  async sync(): Promise<void> {
    for (const index of Object.values(this.schemas) as ESIndex<any, any>[]) {
      const exists = await this.connection.head(`/${index.$name}`);
      if (!exists) {
        await this.connection.put(`/${index.$name}`, index._toIndexBody());
      } else {
        await this.connection.put(`/${index.$name}/_mapping`, index._toMappings());
      }
    }
  }

  getConnection(): ElasticConnection {
    return this.connection;
  }
}
