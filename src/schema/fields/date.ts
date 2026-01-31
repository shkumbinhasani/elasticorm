import { ESField } from './base';
import type { DateFieldOptions } from '../types';

export class ESDateField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<Date | string | number, 'date', Required, HasDefault, IsArray> {
  protected _dateOptions: DateFieldOptions;

  constructor(options: DateFieldOptions = {}) {
    super('date', options);
    this._dateOptions = options;
  }

  protected _clone(): ESDateField<Required, HasDefault, IsArray> {
    const clone = new ESDateField<Required, HasDefault, IsArray>(this._dateOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESDateField<true, HasDefault, IsArray> {
    return super.notNull() as ESDateField<true, HasDefault, IsArray>;
  }

  override default(value: Date | string | number | 'now'): ESDateField<Required, true, IsArray> {
    return super.default(value) as ESDateField<Required, true, IsArray>;
  }

  override array(): ESDateField<Required, HasDefault, true> {
    return super.array() as ESDateField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'date',
    };

    if (this._dateOptions.format) mapping.format = this._dateOptions.format;
    if (this._dateOptions.locale) mapping.locale = this._dateOptions.locale;
    if (this._dateOptions.ignore_malformed !== undefined) mapping.ignore_malformed = this._dateOptions.ignore_malformed;
    if (this._options.index !== undefined) mapping.index = this._options.index;
    if (this._options.store !== undefined) mapping.store = this._options.store;
    if (this._options.doc_values !== undefined) mapping.doc_values = this._options.doc_values;
    if (this._options.null_value !== undefined) mapping.null_value = this._options.null_value;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export function esDate(options: DateFieldOptions = {}): ESDateField {
  return new ESDateField(options);
}
