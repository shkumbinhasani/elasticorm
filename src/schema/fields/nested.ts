import { ESField } from './base';
import type { NestedFieldOptions, InferDocument } from '../types';

export class ESNestedField<
  Fields extends Record<string, ESField<any, any, any, any, any>>,
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<InferDocument<Fields>, 'nested', Required, HasDefault, IsArray> {
  protected _nestedOptions: NestedFieldOptions;
  protected _fields: Fields;

  constructor(fields: Fields, options: NestedFieldOptions = {}) {
    super('nested', {});
    this._nestedOptions = options;
    this._fields = fields;
  }

  protected _clone(): ESNestedField<Fields, Required, HasDefault, IsArray> {
    const clone = new ESNestedField<Fields, Required, HasDefault, IsArray>(this._fields, this._nestedOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESNestedField<Fields, true, HasDefault, IsArray> {
    return super.notNull() as ESNestedField<Fields, true, HasDefault, IsArray>;
  }

  override default(value: InferDocument<Fields>): ESNestedField<Fields, Required, true, IsArray> {
    return super.default(value) as ESNestedField<Fields, Required, true, IsArray>;
  }

  override array(): ESNestedField<Fields, Required, HasDefault, true> {
    return super.array() as ESNestedField<Fields, Required, HasDefault, true>;
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
      type: 'nested',
      properties,
    };

    if (this._nestedOptions.dynamic !== undefined) mapping.dynamic = this._nestedOptions.dynamic;
    if (this._nestedOptions.include_in_parent !== undefined) mapping.include_in_parent = this._nestedOptions.include_in_parent;
    if (this._nestedOptions.include_in_root !== undefined) mapping.include_in_root = this._nestedOptions.include_in_root;

    return mapping;
  }
}

export function esNested<Fields extends Record<string, ESField<any, any, any, any, any>>>(
  fields: Fields,
  options: NestedFieldOptions = {}
): ESNestedField<Fields> {
  return new ESNestedField(fields, options);
}

type NestedFieldAccessor<Fields extends Record<string, ESField<any, any, any, any, any>>> = {
  [K in keyof Fields]: Fields[K];
};

export function createNestedAccessor<Fields extends Record<string, ESField<any, any, any, any, any>>>(
  nestedField: ESNestedField<Fields, any, any, any>,
  parentPath: string
): NestedFieldAccessor<Fields> {
  const fields = nestedField._getFields();
  const result = {} as NestedFieldAccessor<Fields>;

  for (const [fieldName, field] of Object.entries(fields)) {
    field._setFieldName(fieldName);
    field._setParent(parentPath);
    (result as any)[fieldName] = field;
  }

  return result;
}
