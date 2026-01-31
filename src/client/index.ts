import { ElasticConnection, type ElasticORMConfig } from './connection';
import { ESIndex } from '../schema/index-builder';
import { IndexOperation, type IndexOptions, type IndexResponse } from './operations/index-op';
import { getDocument, getDocumentWithMeta, multiGet, type GetOptions, type GetResponse } from './operations/get';
import { UpdateOperation, type UpdateOptions } from './operations/update';
import { deleteDocument, type DeleteOptions, type DeleteResponse } from './operations/delete';
import { BulkOperation, type BulkOptions, type BulkResponse } from './operations/bulk';
import { SearchBuilder } from '../query/builder';
import type { ESField } from '../schema/fields/base';
import type { InferDocument, InferInsertDocument } from '../schema/types';

export { type ElasticORMConfig, ElasticError } from './connection';
export * from './operations/index';

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

  index<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>
  ): IndexOperation<Name, Fields> {
    return new IndexOperation(this.connection, index);
  }

  async get<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>,
    id: string,
    options?: GetOptions
  ): Promise<InferDocument<Fields> | null> {
    return getDocument(this.connection, index, id, options) as Promise<InferDocument<Fields> | null>;
  }

  async getWithMeta<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>,
    id: string,
    options?: GetOptions
  ): Promise<GetResponse<InferDocument<Fields>> | null> {
    return getDocumentWithMeta(this.connection, index, id, options) as Promise<GetResponse<InferDocument<Fields>> | null>;
  }

  async mget<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>,
    ids: string[],
    options?: GetOptions
  ): Promise<(InferDocument<Fields> | null)[]> {
    return multiGet(this.connection, index, ids, options) as Promise<(InferDocument<Fields> | null)[]>;
  }

  update<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>,
    id: string
  ): UpdateOperation<Name, Fields> {
    return new UpdateOperation(this.connection, index, id);
  }

  async delete<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>,
    id: string,
    options?: DeleteOptions
  ): Promise<DeleteResponse> {
    return deleteDocument(this.connection, index, id, options);
  }

  bulk<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>
  ): BulkOperation<Name, Fields> {
    return new BulkOperation(this.connection, index);
  }

  search<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>
  ): SearchBuilder<Name, Fields, InferDocument<Fields>> {
    return new SearchBuilder(this.connection, index);
  }

  async createIndex<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>
  ): Promise<{ acknowledged: boolean; shards_acknowledged: boolean; index: string }> {
    const path = `/${index.$name}`;
    return this.connection.put(path, index._toIndexBody());
  }

  async updateMapping<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>
  ): Promise<{ acknowledged: boolean }> {
    const path = `/${index.$name}/_mapping`;
    return this.connection.put(path, index._toMappings());
  }

  async deleteIndex<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>
  ): Promise<{ acknowledged: boolean }> {
    const path = `/${index.$name}`;
    return this.connection.delete(path);
  }

  async indexExists<
    Name extends string,
    Fields extends Record<string, ESField<any, any, any, any, any>>
  >(
    index: ESIndex<Name, Fields>
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
