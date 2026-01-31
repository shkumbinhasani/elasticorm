import { ESField } from './base.ts';
import type { FieldMappingOptions } from '../types.ts';

export class ESIpField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<string, 'ip', Required, HasDefault, IsArray> {
  protected _ipOptions: FieldMappingOptions;

  constructor(options: FieldMappingOptions = {}) {
    super('ip', options);
    this._ipOptions = options;
  }

  protected _clone(): ESIpField<Required, HasDefault, IsArray> {
    const clone = new ESIpField<Required, HasDefault, IsArray>(this._ipOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESIpField<true, HasDefault, IsArray> {
    return super.notNull() as ESIpField<true, HasDefault, IsArray>;
  }

  override default(value: string): ESIpField<Required, true, IsArray> {
    return super.default(value) as ESIpField<Required, true, IsArray>;
  }

  override array(): ESIpField<Required, HasDefault, true> {
    return super.array() as ESIpField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'ip',
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

export function esIp(options: FieldMappingOptions = {}): ESIpField {
  return new ESIpField(options);
}
