import { ESField } from './base';
import type { BooleanFieldOptions } from '../types';

export class ESBooleanField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<boolean, 'boolean', Required, HasDefault, IsArray> {
  protected _booleanOptions: BooleanFieldOptions;

  constructor(options: BooleanFieldOptions = {}) {
    super('boolean', options);
    this._booleanOptions = options;
  }

  protected _clone(): ESBooleanField<Required, HasDefault, IsArray> {
    const clone = new ESBooleanField<Required, HasDefault, IsArray>(this._booleanOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESBooleanField<true, HasDefault, IsArray> {
    return super.notNull() as ESBooleanField<true, HasDefault, IsArray>;
  }

  override default(value: boolean): ESBooleanField<Required, true, IsArray> {
    return super.default(value) as ESBooleanField<Required, true, IsArray>;
  }

  override array(): ESBooleanField<Required, HasDefault, true> {
    return super.array() as ESBooleanField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'boolean',
    };

    if (this._options.index !== undefined) mapping.index = this._options.index;
    if (this._options.store !== undefined) mapping.store = this._options.store;
    if (this._options.doc_values !== undefined) mapping.doc_values = this._options.doc_values;
    if (this._options.null_value !== undefined) mapping.null_value = this._options.null_value;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export function esBoolean(options: BooleanFieldOptions = {}): ESBooleanField {
  return new ESBooleanField(options);
}
