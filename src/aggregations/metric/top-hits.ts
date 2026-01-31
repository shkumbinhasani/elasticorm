import type { Aggregation } from '../types';

export interface TopHitsAggregationOptions {
  size?: number;
  from?: number;
  sort?: Array<Record<string, unknown> | string>;
  _source?: boolean | string[] | { includes?: string[]; excludes?: string[] };
  highlight?: Record<string, unknown>;
  explain?: boolean;
  stored_fields?: string[];
  docvalue_fields?: Array<string | { field: string; format?: string }>;
  script_fields?: Record<string, { script: { source: string; lang?: string; params?: Record<string, unknown> } }>;
  version?: boolean;
  seq_no_primary_term?: boolean;
}

export class TopHitsAggregation implements Aggregation {
  constructor(private readonly options: TopHitsAggregationOptions = {}) {}

  _toAggregation(): Record<string, unknown> {
    return {
      top_hits: this.options,
    };
  }
}

export function topHits(options?: TopHitsAggregationOptions): TopHitsAggregation {
  return new TopHitsAggregation(options);
}

export interface TopMetricsAggregationOptions {
  metrics: Array<{ field: string } | { script: { source: string; lang?: string; params?: Record<string, unknown> } }>;
  sort: Array<Record<string, unknown> | string>;
  size?: number;
}

export class TopMetricsAggregation implements Aggregation {
  constructor(private readonly options: TopMetricsAggregationOptions) {}

  _toAggregation(): Record<string, unknown> {
    return {
      top_metrics: this.options,
    };
  }
}

export function topMetrics(options: TopMetricsAggregationOptions): TopMetricsAggregation {
  return new TopMetricsAggregation(options);
}
