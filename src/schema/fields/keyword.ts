import { ESField } from './base.ts';
import type { KeywordFieldOptions } from '../types.ts';

export class ESKeywordField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<string, 'keyword', Required, HasDefault, IsArray> {
  protected _keywordOptions: KeywordFieldOptions;

  constructor(options: KeywordFieldOptions = {}) {
    super('keyword', options);
    this._keywordOptions = options;
  }

  protected _clone(): ESKeywordField<Required, HasDefault, IsArray> {
    const clone = new ESKeywordField<Required, HasDefault, IsArray>(this._keywordOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESKeywordField<true, HasDefault, IsArray> {
    return super.notNull() as ESKeywordField<true, HasDefault, IsArray>;
  }

  override default(value: string): ESKeywordField<Required, true, IsArray> {
    return super.default(value) as ESKeywordField<Required, true, IsArray>;
  }

  override array(): ESKeywordField<Required, HasDefault, true> {
    return super.array() as ESKeywordField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'keyword',
    };

    if (this._keywordOptions.ignore_above !== undefined) mapping.ignore_above = this._keywordOptions.ignore_above;
    if (this._keywordOptions.normalizer) mapping.normalizer = this._keywordOptions.normalizer;
    if (this._keywordOptions.eager_global_ordinals !== undefined) mapping.eager_global_ordinals = this._keywordOptions.eager_global_ordinals;
    if (this._keywordOptions.split_queries_on_whitespace !== undefined) mapping.split_queries_on_whitespace = this._keywordOptions.split_queries_on_whitespace;
    if (this._options.index !== undefined) mapping.index = this._options.index;
    if (this._options.store !== undefined) mapping.store = this._options.store;
    if (this._options.doc_values !== undefined) mapping.doc_values = this._options.doc_values;
    if (this._options.null_value !== undefined) mapping.null_value = this._options.null_value;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export function esKeyword(options: KeywordFieldOptions = {}): ESKeywordField {
  return new ESKeywordField(options);
}
