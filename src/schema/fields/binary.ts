import { ESField } from './base';
import type { FieldMappingOptions } from '../types';

export class ESBinaryField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<string, 'binary', Required, HasDefault, IsArray> {
  protected _binaryOptions: FieldMappingOptions;

  constructor(options: FieldMappingOptions = {}) {
    super('binary', options);
    this._binaryOptions = options;
  }

  protected _clone(): ESBinaryField<Required, HasDefault, IsArray> {
    const clone = new ESBinaryField<Required, HasDefault, IsArray>(this._binaryOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESBinaryField<true, HasDefault, IsArray> {
    return super.notNull() as ESBinaryField<true, HasDefault, IsArray>;
  }

  override default(value: string): ESBinaryField<Required, true, IsArray> {
    return super.default(value) as ESBinaryField<Required, true, IsArray>;
  }

  override array(): ESBinaryField<Required, HasDefault, true> {
    return super.array() as ESBinaryField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'binary',
    };

    if (this._options.store !== undefined) mapping.store = this._options.store;
    if (this._options.doc_values !== undefined) mapping.doc_values = this._options.doc_values;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export function esBinary(options: FieldMappingOptions = {}): ESBinaryField {
  return new ESBinaryField(options);
}
