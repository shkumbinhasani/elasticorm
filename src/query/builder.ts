import type { ElasticConnection } from '../client/connection';
import type { ESIndex } from '../schema/index-builder';
import type { ESField } from '../schema/fields/base';
import type { QueryCondition, SearchResponse, SortOption, GeoDistanceSortOption, RawSortOption, HighlightOptions, SourceFilter } from './types';
import type { Aggregation, AggregationResult } from '../aggregations/types';

export class SearchBuilder<
  Name extends string,
  Fields extends Record<string, ESField<any, any, any, any, any>>,
  ResultType,
  AggregationsType extends Record<string, Aggregation> = {},
> {
  private _query?: QueryCondition;
  private _size?: number;
  private _from?: number;
  private _sort: (SortOption | GeoDistanceSortOption | RawSortOption)[] = [];
  private _source?: boolean | string[] | SourceFilter;
  private _highlight?: HighlightOptions;
  private _trackTotalHits?: boolean | number;
  private _minScore?: number;
  private _searchAfter?: unknown[];
  private _timeout?: string;
  private _aggregations?: AggregationsType;
  private _scriptFields?: Record<string, { script: { source: string; lang?: string; params?: Record<string, unknown> } }>;
  private _storedFields?: string[];
  private _explain?: boolean;
  private _version?: boolean;
  private _seqNoPrimaryTerm?: boolean;
  private _collapse?: { field: string; inner_hits?: unknown; max_concurrent_group_searches?: number };

  constructor(
    private readonly connection: ElasticConnection,
    private readonly index: ESIndex<Name, Fields>
  ) {}

  where(condition: QueryCondition): this {
    this._query = condition;
    return this;
  }

  size(value: number): this {
    this._size = value;
    return this;
  }

  from(value: number): this {
    this._from = value;
    return this;
  }

  limit(value: number): this {
    this._size = value;
    return this;
  }

  offset(value: number): this {
    this._from = value;
    return this;
  }

  sort<F extends ESField<any, any, any, any, any>>(
    field: F,
    order: 'asc' | 'desc' = 'asc',
    options?: {
      mode?: 'min' | 'max' | 'sum' | 'avg' | 'median';
      missing?: '_last' | '_first' | unknown;
      unmapped_type?: string;
      nested?: {
        path: string;
        filter?: Record<string, unknown>;
      };
    }
  ): this {
    this._sort.push({
      field: field._getFullPath(),
      order,
      ...options,
    });
    return this;
  }

  sortByScore(order: 'asc' | 'desc' = 'desc'): this {
    this._sort.push({ field: '_score', order });
    return this;
  }

  sortByDoc(order: 'asc' | 'desc' = 'asc'): this {
    this._sort.push({ field: '_doc', order });
    return this;
  }

  sortGeoDistance<F extends ESField<any, 'geo_point', any, any, any>>(
    field: F,
    location: { lat: number; lon: number } | [number, number] | string,
    options?: {
      order?: 'asc' | 'desc';
      unit?: 'km' | 'm' | 'mi' | 'yd' | 'ft' | 'nmi';
      mode?: 'min' | 'max' | 'avg' | 'median';
      distance_type?: 'arc' | 'plane';
      ignore_unmapped?: boolean;
    }
  ): this {
    this._sort.push({
      field: field._getFullPath(),
      location,
      order: options?.order ?? 'asc',
      unit: options?.unit,
      mode: options?.mode,
      distance_type: options?.distance_type,
      ignore_unmapped: options?.ignore_unmapped,
    } as GeoDistanceSortOption);
    return this;
  }

  sortRaw(sortConfig: Record<string, unknown>): this {
    this._sort.push({ raw: sortConfig } as RawSortOption);
    return this;
  }

  select<K extends keyof Fields>(
    ...fieldNames: K[]
  ): SearchBuilder<Name, Fields, Pick<ResultType, K & keyof ResultType>, AggregationsType> {
    const fields = fieldNames.map((name) => {
      const field = this.index.$fields[name as string];
      return field ? field._getFullPath() : String(name);
    });
    this._source = fields;
    return this as unknown as SearchBuilder<Name, Fields, Pick<ResultType, K & keyof ResultType>, AggregationsType>;
  }

  source(value: boolean | string[] | SourceFilter): this {
    this._source = value;
    return this;
  }

  highlight(options: HighlightOptions): this {
    this._highlight = options;
    return this;
  }

  trackTotalHits(value: boolean | number = true): this {
    this._trackTotalHits = value;
    return this;
  }

  minScore(value: number): this {
    this._minScore = value;
    return this;
  }

  searchAfter(values: unknown[]): this {
    this._searchAfter = values;
    return this;
  }

  timeout(value: string): this {
    this._timeout = value;
    return this;
  }

  aggregate<Aggs extends Record<string, Aggregation>>(
    aggregations: Aggs
  ): SearchBuilder<Name, Fields, ResultType, Aggs> {
    this._aggregations = aggregations as unknown as AggregationsType;
    return this as unknown as SearchBuilder<Name, Fields, ResultType, Aggs>;
  }

  scriptField(
    name: string,
    script: { source: string; lang?: string; params?: Record<string, unknown> }
  ): this {
    if (!this._scriptFields) {
      this._scriptFields = {};
    }
    this._scriptFields[name] = { script };
    return this;
  }

  storedFields(fields: string[]): this {
    this._storedFields = fields;
    return this;
  }

  explain(value: boolean = true): this {
    this._explain = value;
    return this;
  }

  version(value: boolean = true): this {
    this._version = value;
    return this;
  }

  seqNoPrimaryTerm(value: boolean = true): this {
    this._seqNoPrimaryTerm = value;
    return this;
  }

  collapse(field: ESField<any, any, any, any, any>, options?: {
    inner_hits?: unknown;
    max_concurrent_group_searches?: number;
  }): this {
    this._collapse = {
      field: field._getFullPath(),
      ...options,
    };
    return this;
  }

  _buildQuery(): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (this._query) {
      body.query = this._query._toQuery();
    }

    if (this._size !== undefined) {
      body.size = this._size;
    }

    if (this._from !== undefined) {
      body.from = this._from;
    }

    if (this._sort.length > 0) {
      body.sort = this._sort.map((s) => {
        // Raw sort - pass through as-is
        if ('raw' in s) {
          return (s as RawSortOption).raw;
        }

        // Geo distance sort
        if ('location' in s) {
          const geoSort = s as GeoDistanceSortOption;
          const geoDistanceSort: Record<string, unknown> = {
            [geoSort.field]: geoSort.location,
            order: geoSort.order,
          };
          if (geoSort.unit) geoDistanceSort.unit = geoSort.unit;
          if (geoSort.mode) geoDistanceSort.mode = geoSort.mode;
          if (geoSort.distance_type) geoDistanceSort.distance_type = geoSort.distance_type;
          if (geoSort.ignore_unmapped !== undefined) geoDistanceSort.ignore_unmapped = geoSort.ignore_unmapped;
          return { _geo_distance: geoDistanceSort };
        }

        // Regular field sort
        const sortObj: Record<string, unknown> = {};
        if (s.field === '_score' || s.field === '_doc') {
          sortObj[s.field] = { order: s.order };
        } else {
          const fieldSort: Record<string, unknown> = { order: s.order };
          if (s.mode) fieldSort.mode = s.mode;
          if (s.missing !== undefined) fieldSort.missing = s.missing;
          if (s.unmapped_type) fieldSort.unmapped_type = s.unmapped_type;
          if (s.nested) fieldSort.nested = s.nested;
          sortObj[s.field] = fieldSort;
        }
        return sortObj;
      });
    }

    if (this._source !== undefined) {
      body._source = this._source;
    }

    if (this._highlight) {
      body.highlight = this._highlight;
    }

    if (this._trackTotalHits !== undefined) {
      body.track_total_hits = this._trackTotalHits;
    }

    if (this._minScore !== undefined) {
      body.min_score = this._minScore;
    }

    if (this._searchAfter) {
      body.search_after = this._searchAfter;
    }

    if (this._timeout) {
      body.timeout = this._timeout;
    }

    if (this._aggregations) {
      body.aggs = {};
      for (const [name, agg] of Object.entries(this._aggregations)) {
        (body.aggs as Record<string, unknown>)[name] = agg._toAggregation();
      }
    }

    if (this._scriptFields) {
      body.script_fields = this._scriptFields;
    }

    if (this._storedFields) {
      body.stored_fields = this._storedFields;
    }

    if (this._explain !== undefined) {
      body.explain = this._explain;
    }

    if (this._version !== undefined) {
      body.version = this._version;
    }

    if (this._seqNoPrimaryTerm !== undefined) {
      body.seq_no_primary_term = this._seqNoPrimaryTerm;
    }

    if (this._collapse) {
      body.collapse = this._collapse;
    }

    return body;
  }

  async execute(): Promise<SearchResponse<ResultType, AggregationResult<AggregationsType>>> {
    const path = `/${this.index.$name}/_search`;
    const body = this._buildQuery();
    return this.connection.post<SearchResponse<ResultType, AggregationResult<AggregationsType>>>(path, body);
  }

  async count(): Promise<number> {
    const path = `/${this.index.$name}/_count`;
    const body: Record<string, unknown> = {};
    if (this._query) {
      body.query = this._query._toQuery();
    }
    const response = await this.connection.post<{ count: number }>(path, body);
    return response.count;
  }

  async *scroll(
    scrollTime: string = '1m',
    batchSize: number = 1000
  ): AsyncGenerator<ResultType[], void, unknown> {
    this._size = batchSize;
    const body = this._buildQuery();

    const initialResponse = await this.connection.post<SearchResponse<ResultType> & { _scroll_id: string }>(
      `/${this.index.$name}/_search?scroll=${scrollTime}`,
      body
    );

    let scrollId = initialResponse._scroll_id;
    let hits = initialResponse.hits.hits;

    while (hits.length > 0) {
      yield hits.map((h) => h._source);

      const scrollResponse = await this.connection.post<SearchResponse<ResultType> & { _scroll_id: string }>(
        '/_search/scroll',
        {
          scroll: scrollTime,
          scroll_id: scrollId,
        }
      );

      scrollId = scrollResponse._scroll_id;
      hits = scrollResponse.hits.hits;
    }

    await this.connection.delete('/_search/scroll', { scroll_id: scrollId } as any);
  }
}
