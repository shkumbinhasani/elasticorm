export interface QueryCondition {
  _toQuery(): Record<string, unknown>;
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  mode?: 'min' | 'max' | 'sum' | 'avg' | 'median';
  missing?: '_last' | '_first' | unknown;
  unmapped_type?: string;
  nested?: {
    path: string;
    filter?: Record<string, unknown>;
  };
}

export interface GeoDistanceSortOption {
  field: string;
  location: { lat: number; lon: number } | [number, number] | string;
  order: 'asc' | 'desc';
  unit?: 'km' | 'm' | 'mi' | 'yd' | 'ft' | 'nmi';
  mode?: 'min' | 'max' | 'avg' | 'median';
  distance_type?: 'arc' | 'plane';
  ignore_unmapped?: boolean;
}

export interface RawSortOption {
  raw: Record<string, unknown>;
}

export interface SearchHit<T> {
  _index: string;
  _id: string;
  _score: number | null;
  _source: T;
  sort?: unknown[];
  highlight?: Record<string, string[]>;
  fields?: Record<string, unknown[]>;
}

export interface SearchResponse<T, Aggs = Record<string, unknown>> {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: 'eq' | 'gte';
    };
    max_score: number | null;
    hits: SearchHit<T>[];
  };
  aggregations?: Aggs;
}

export interface HighlightOptions {
  fields: Record<string, {
    type?: 'unified' | 'plain' | 'fvh';
    fragment_size?: number;
    number_of_fragments?: number;
    no_match_size?: number;
    pre_tags?: string[];
    post_tags?: string[];
  }>;
  pre_tags?: string[];
  post_tags?: string[];
  encoder?: 'default' | 'html';
  require_field_match?: boolean;
}

export interface SourceFilter {
  includes?: string[];
  excludes?: string[];
}
