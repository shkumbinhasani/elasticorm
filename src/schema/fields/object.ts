import { ESField } from './base.ts';
import type { ObjectFieldOptions, InferDocument } from '../types.ts';

export class ESObjectField<
  Fields extends Record<string, ESField<any, any, any, any, any>>,
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<InferDocument<Fields>, 'object', Required, HasDefault, IsArray> {
  protected _objectOptions: ObjectFieldOptions;
  protected _fields: Fields;

  constructor(fields: Fields, options: ObjectFieldOptions = {}) {
    super('object', {});
    this._objectOptions = options;
    this._fields = fields;
  }

  protected _clone(): ESObjectField<Fields, Required, HasDefault, IsArray> {
    const clone = new ESObjectField<Fields, Required, HasDefault, IsArray>(this._fields, this._objectOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESObjectField<Fields, true, HasDefault, IsArray> {
    return super.notNull() as ESObjectField<Fields, true, HasDefault, IsArray>;
  }

  override default(value: InferDocument<Fields>): ESObjectField<Fields, Required, true, IsArray> {
    return super.default(value) as ESObjectField<Fields, Required, true, IsArray>;
  }

  override array(): ESObjectField<Fields, Required, HasDefault, true> {
    return super.array() as ESObjectField<Fields, Required, HasDefault, true>;
  }

  _getFields(): Fields {
    return this._fields;
  }

  _toMapping(): Record<string, unknown> {
    const properties: Record<string, unknown> = {};

    for (const [fieldName, field] of Object.entries(this._fields)) {
      field._setFieldName(fieldName);
      field._setParent(this._getFullPath());
      properties[fieldName] = field._toMapping();
    }

    const mapping: Record<string, unknown> = {
      type: 'object',
      properties,
    };

    if (this._objectOptions.dynamic !== undefined) mapping.dynamic = this._objectOptions.dynamic;
    if (this._objectOptions.enabled !== undefined) mapping.enabled = this._objectOptions.enabled;

    return mapping;
  }
}

export function esObject<Fields extends Record<string, ESField<any, any, any, any, any>>>(
  fields: Fields,
  options: ObjectFieldOptions = {}
): ESObjectField<Fields> {
  return new ESObjectField(fields, options);
}
