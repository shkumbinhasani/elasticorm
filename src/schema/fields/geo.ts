import { ESField } from './base';
import type { GeoPointFieldOptions, GeoShapeFieldOptions, GeoPoint, GeoShape } from '../types';

export class ESGeoPointField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<GeoPoint, 'geo_point', Required, HasDefault, IsArray> {
  protected _geoOptions: GeoPointFieldOptions;

  constructor(options: GeoPointFieldOptions = {}) {
    super('geo_point', options);
    this._geoOptions = options;
  }

  protected _clone(): ESGeoPointField<Required, HasDefault, IsArray> {
    const clone = new ESGeoPointField<Required, HasDefault, IsArray>(this._geoOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESGeoPointField<true, HasDefault, IsArray> {
    return super.notNull() as ESGeoPointField<true, HasDefault, IsArray>;
  }

  override default(value: GeoPoint): ESGeoPointField<Required, true, IsArray> {
    return super.default(value) as ESGeoPointField<Required, true, IsArray>;
  }

  override array(): ESGeoPointField<Required, HasDefault, true> {
    return super.array() as ESGeoPointField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'geo_point',
    };

    if (this._geoOptions.ignore_malformed !== undefined) mapping.ignore_malformed = this._geoOptions.ignore_malformed;
    if (this._geoOptions.ignore_z_value !== undefined) mapping.ignore_z_value = this._geoOptions.ignore_z_value;
    if (this._options.index !== undefined) mapping.index = this._options.index;
    if (this._options.store !== undefined) mapping.store = this._options.store;
    if (this._options.doc_values !== undefined) mapping.doc_values = this._options.doc_values;
    if (this._options.null_value !== undefined) mapping.null_value = this._options.null_value;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export class ESGeoShapeField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<GeoShape, 'geo_shape', Required, HasDefault, IsArray> {
  protected _geoOptions: GeoShapeFieldOptions;

  constructor(options: GeoShapeFieldOptions = {}) {
    super('geo_shape', options);
    this._geoOptions = options;
  }

  protected _clone(): ESGeoShapeField<Required, HasDefault, IsArray> {
    const clone = new ESGeoShapeField<Required, HasDefault, IsArray>(this._geoOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESGeoShapeField<true, HasDefault, IsArray> {
    return super.notNull() as ESGeoShapeField<true, HasDefault, IsArray>;
  }

  override default(value: GeoShape): ESGeoShapeField<Required, true, IsArray> {
    return super.default(value) as ESGeoShapeField<Required, true, IsArray>;
  }

  override array(): ESGeoShapeField<Required, HasDefault, true> {
    return super.array() as ESGeoShapeField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'geo_shape',
    };

    if (this._geoOptions.orientation !== undefined) mapping.orientation = this._geoOptions.orientation;
    if (this._geoOptions.ignore_malformed !== undefined) mapping.ignore_malformed = this._geoOptions.ignore_malformed;
    if (this._geoOptions.ignore_z_value !== undefined) mapping.ignore_z_value = this._geoOptions.ignore_z_value;
    if (this._geoOptions.coerce !== undefined) mapping.coerce = this._geoOptions.coerce;
    if (this._options.index !== undefined) mapping.index = this._options.index;
    if (this._options.doc_values !== undefined) mapping.doc_values = this._options.doc_values;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export function esGeoPoint(options: GeoPointFieldOptions = {}): ESGeoPointField {
  return new ESGeoPointField(options);
}

export function esGeoShape(options: GeoShapeFieldOptions = {}): ESGeoShapeField {
  return new ESGeoShapeField(options);
}
