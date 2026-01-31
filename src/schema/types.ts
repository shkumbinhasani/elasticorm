export type ESFieldType =
  | 'text'
  | 'keyword'
  | 'long'
  | 'integer'
  | 'short'
  | 'byte'
  | 'double'
  | 'float'
  | 'half_float'
  | 'scaled_float'
  | 'date'
  | 'boolean'
  | 'binary'
  | 'integer_range'
  | 'float_range'
  | 'long_range'
  | 'double_range'
  | 'date_range'
  | 'ip_range'
  | 'object'
  | 'nested'
  | 'geo_point'
  | 'geo_shape'
  | 'ip'
  | 'completion'
  | 'token_count';

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type InferFieldType<F> = F extends { $type: infer T } ? T : never;

export type InferDocument<Fields extends Record<string, any>> = Prettify<{
  [K in keyof Fields]: InferFieldType<Fields[K]>;
}>;

export type InferInsertDocument<Fields extends Record<string, any>> = Prettify<
  {
    [K in keyof Fields as Fields[K]['$required'] extends true
      ? Fields[K]['$hasDefault'] extends true
        ? never
        : K
      : never]: InferFieldType<Fields[K]>;
  } & {
    [K in keyof Fields as Fields[K]['$required'] extends true
      ? Fields[K]['$hasDefault'] extends true
        ? K
        : never
      : K]?: InferFieldType<Fields[K]> | null;
  }
>;

export interface FieldMappingOptions {
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  null_value?: unknown;
  copy_to?: string | string[];
  meta?: Record<string, string>;
}

export interface TextFieldOptions extends FieldMappingOptions {
  analyzer?: string;
  search_analyzer?: string;
  search_quote_analyzer?: string;
  index_options?: 'docs' | 'freqs' | 'positions' | 'offsets';
  norms?: boolean;
  term_vector?: 'no' | 'yes' | 'with_positions' | 'with_offsets' | 'with_positions_offsets' | 'with_positions_payloads' | 'with_positions_offsets_payloads';
  fielddata?: boolean;
  eager_global_ordinals?: boolean;
  index_phrases?: boolean;
  index_prefixes?: { min_chars?: number; max_chars?: number };
  similarity?: string;
}

export interface KeywordFieldOptions extends FieldMappingOptions {
  ignore_above?: number;
  normalizer?: string;
  eager_global_ordinals?: boolean;
  split_queries_on_whitespace?: boolean;
}

export interface NumericFieldOptions extends FieldMappingOptions {
  coerce?: boolean;
  ignore_malformed?: boolean;
  scaling_factor?: number;
}

export interface DateFieldOptions extends FieldMappingOptions {
  format?: string;
  locale?: string;
  ignore_malformed?: boolean;
}

export interface BooleanFieldOptions extends FieldMappingOptions {}

export interface GeoPointFieldOptions extends FieldMappingOptions {
  ignore_malformed?: boolean;
  ignore_z_value?: boolean;
}

export interface GeoShapeFieldOptions extends FieldMappingOptions {
  orientation?: 'right' | 'left' | 'counterclockwise' | 'clockwise';
  ignore_malformed?: boolean;
  ignore_z_value?: boolean;
  coerce?: boolean;
}

export interface NestedFieldOptions {
  dynamic?: boolean | 'strict' | 'runtime';
  include_in_parent?: boolean;
  include_in_root?: boolean;
}

export interface ObjectFieldOptions {
  dynamic?: boolean | 'strict' | 'runtime';
  enabled?: boolean;
}

export type GeoPoint =
  | { lat: number; lon: number }
  | [number, number]
  | string;

export type GeoShape = {
  type: 'point' | 'linestring' | 'polygon' | 'multipoint' | 'multilinestring' | 'multipolygon' | 'geometrycollection' | 'envelope' | 'circle';
  coordinates: unknown;
  radius?: string;
};
