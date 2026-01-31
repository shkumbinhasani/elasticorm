import { ESField } from './base.ts';
import type { ESFieldType, NumericFieldOptions } from '../types.ts';

type NumericESType = 'integer' | 'long' | 'short' | 'byte' | 'double' | 'float' | 'half_float' | 'scaled_float';

export class ESNumericField<
  ESType extends NumericESType = 'integer',
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<number, ESType, Required, HasDefault, IsArray> {
  protected _numericOptions: NumericFieldOptions;

  constructor(esType: ESType, options: NumericFieldOptions = {}) {
    super(esType, options);
    this._numericOptions = options;
  }

  protected _clone(): ESNumericField<ESType, Required, HasDefault, IsArray> {
    const clone = new ESNumericField<ESType, Required, HasDefault, IsArray>(this.$esType, this._numericOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESNumericField<ESType, true, HasDefault, IsArray> {
    return super.notNull() as ESNumericField<ESType, true, HasDefault, IsArray>;
  }

  override default(value: number): ESNumericField<ESType, Required, true, IsArray> {
    return super.default(value) as ESNumericField<ESType, Required, true, IsArray>;
  }

  override array(): ESNumericField<ESType, Required, HasDefault, true> {
    return super.array() as ESNumericField<ESType, Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: this.$esType,
    };

    if (this._numericOptions.coerce !== undefined) mapping.coerce = this._numericOptions.coerce;
    if (this._numericOptions.ignore_malformed !== undefined) mapping.ignore_malformed = this._numericOptions.ignore_malformed;
    if (this.$esType === 'scaled_float' && this._numericOptions.scaling_factor !== undefined) {
      mapping.scaling_factor = this._numericOptions.scaling_factor;
    }
    if (this._options.index !== undefined) mapping.index = this._options.index;
    if (this._options.store !== undefined) mapping.store = this._options.store;
    if (this._options.doc_values !== undefined) mapping.doc_values = this._options.doc_values;
    if (this._options.null_value !== undefined) mapping.null_value = this._options.null_value;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export function esInteger(options: NumericFieldOptions = {}): ESNumericField<'integer'> {
  return new ESNumericField('integer', options);
}

export function esLong(options: NumericFieldOptions = {}): ESNumericField<'long'> {
  return new ESNumericField('long', options);
}

export function esShort(options: NumericFieldOptions = {}): ESNumericField<'short'> {
  return new ESNumericField('short', options);
}

export function esByte(options: NumericFieldOptions = {}): ESNumericField<'byte'> {
  return new ESNumericField('byte', options);
}

export function esDouble(options: NumericFieldOptions = {}): ESNumericField<'double'> {
  return new ESNumericField('double', options);
}

export function esFloat(options: NumericFieldOptions = {}): ESNumericField<'float'> {
  return new ESNumericField('float', options);
}

export function esHalfFloat(options: NumericFieldOptions = {}): ESNumericField<'half_float'> {
  return new ESNumericField('half_float', options);
}

export function esScaledFloat(options: NumericFieldOptions & { scaling_factor: number }): ESNumericField<'scaled_float'> {
  return new ESNumericField('scaled_float', options);
}
