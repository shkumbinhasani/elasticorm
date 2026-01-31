import type { ESField } from './fields/base.ts';
import type { InferDocument, InferInsertDocument, Prettify } from './types.ts';

export interface IndexSettings {
  number_of_shards?: number;
  number_of_replicas?: number;
  refresh_interval?: string;
  analysis?: {
    analyzer?: Record<string, unknown>;
    tokenizer?: Record<string, unknown>;
    filter?: Record<string, unknown>;
    char_filter?: Record<string, unknown>;
    normalizer?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

export interface ESIndexConfig<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
> {
  $name: Name;
  $fields: Fields;
  $settings: IndexSettings;
  $infer: Prettify<InferDocument<Fields>>;
  $insert: Prettify<InferInsertDocument<Fields>>;
}

export class ESIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
> {
  declare $infer: Prettify<InferDocument<Fields>>;
  declare $insert: Prettify<InferInsertDocument<Fields>>;

  readonly $name: Name;
  readonly $fields: Fields;
  readonly $settings: IndexSettings;

  constructor(name: Name, fields: Fields, settings: IndexSettings = {}) {
    this.$name = name;
    this.$fields = fields;
    this.$settings = settings;

    for (const [fieldName, field] of Object.entries(fields)) {
      field._setFieldName(fieldName);
      (this as any)[fieldName] = field;
    }
  }

  _toMappings(): { properties: Record<string, unknown> } {
    const properties: Record<string, unknown> = {};

    for (const [fieldName, field] of Object.entries(this.$fields)) {
      properties[fieldName] = field._toMapping();
    }

    return { properties };
  }

  _toIndexBody(): { settings?: IndexSettings; mappings: { properties: Record<string, unknown> } } {
    const body: { settings?: IndexSettings; mappings: { properties: Record<string, unknown> } } = {
      mappings: this._toMappings(),
    };

    if (Object.keys(this.$settings).length > 0) {
      body.settings = this.$settings;
    }

    return body;
  }
}

type ESIndexWithFields<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
> = ESIndex<Name, Fields> & Fields;

export function esIndex<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
>(
  name: Name,
  fields: Fields,
  settings: IndexSettings = {}
): ESIndexWithFields<Name, Fields> {
  return new ESIndex(name, fields, settings) as ESIndexWithFields<Name, Fields>;
}
