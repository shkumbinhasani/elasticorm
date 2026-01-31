import type { ESFieldType, FieldMappingOptions } from '../types';

export interface ESFieldConfig<T, ESType extends ESFieldType = ESFieldType> {
  $type: T;
  $esType: ESType;
  $fieldName: string;
  $required: boolean;
  $hasDefault: boolean;
  $defaultValue: T | undefined;
  $isArray: boolean;
  $options: FieldMappingOptions;
  $parent?: string;
}

export abstract class ESField<
  T,
  ESType extends ESFieldType = ESFieldType,
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> {
  declare $type: IsArray extends true ? T[] : Required extends true ? T : T | undefined;
  readonly $esType: ESType;
  $fieldName: string = '';
  $required: boolean = false;
  $hasDefault: boolean = false;
  $isArray: boolean = false;

  protected _defaultValue: T | undefined = undefined;
  protected _options: FieldMappingOptions = {};
  protected _parent?: string;

  constructor(esType: ESType, options: FieldMappingOptions = {}) {
    this.$esType = esType;
    this._options = options;
  }

  notNull(): ESField<T, ESType, true, HasDefault, IsArray> {
    const clone = this._clone() as ESField<T, ESType, true, HasDefault, IsArray>;
    clone.$required = true;
    return clone;
  }

  default(value: T | 'now'): ESField<T, ESType, Required, true, IsArray> {
    const clone = this._clone() as ESField<T, ESType, Required, true, IsArray>;
    clone.$hasDefault = true;
    clone._defaultValue = value as T;
    return clone;
  }

  array(): ESField<T, ESType, Required, HasDefault, true> {
    const clone = this._clone() as ESField<T, ESType, Required, HasDefault, true>;
    clone.$isArray = true;
    return clone;
  }

  protected abstract _clone(): ESField<T, ESType, Required, HasDefault, IsArray>;

  _setFieldName(name: string): void {
    this.$fieldName = name;
  }

  _setParent(parent: string): void {
    this._parent = parent;
  }

  _getFullPath(): string {
    return this._parent ? `${this._parent}.${this.$fieldName}` : this.$fieldName;
  }

  _getConfig(): ESFieldConfig<T, ESType> {
    return {
      $type: undefined as unknown as T,
      $esType: this.$esType,
      $fieldName: this.$fieldName,
      $required: this.$required,
      $hasDefault: this.$hasDefault,
      $defaultValue: this._defaultValue,
      $isArray: this.$isArray,
      $options: this._options,
      $parent: this._parent,
    };
  }

  abstract _toMapping(): Record<string, unknown>;
}
