export interface Aggregation {
  _toAggregation(): Record<string, unknown>;
}

export type AggregationResult<Aggs extends Record<string, Aggregation>> = {
  [K in keyof Aggs]: InferAggregationResult<Aggs[K]>;
};

export type InferAggregationResult<A> =
  A extends TermsAggregation<any> ? TermsAggregationResult :
  A extends HistogramAggregation<any> ? HistogramAggregationResult :
  A extends DateHistogramAggregation<any> ? DateHistogramAggregationResult :
  A extends RangeAggregation<any> ? RangeAggregationResult :
  A extends FilterAggregation ? FilterAggregationResult :
  A extends FiltersAggregation ? FiltersAggregationResult :
  A extends NestedAggregation ? NestedAggregationResult :
  A extends AvgAggregation ? MetricAggregationResult :
  A extends SumAggregation ? MetricAggregationResult :
  A extends MinAggregation ? MetricAggregationResult :
  A extends MaxAggregation ? MetricAggregationResult :
  A extends ValueCountAggregation ? MetricAggregationResult :
  A extends CardinalityAggregation ? MetricAggregationResult :
  A extends StatsAggregation ? StatsAggregationResult :
  A extends ExtendedStatsAggregation ? ExtendedStatsAggregationResult :
  A extends PercentilesAggregation ? PercentilesAggregationResult :
  A extends PercentileRanksAggregation ? PercentileRanksAggregationResult :
  A extends TopHitsAggregation ? TopHitsAggregationResult :
  Record<string, unknown>;

import type { TermsAggregation } from './bucket/terms';
import type { HistogramAggregation, DateHistogramAggregation } from './bucket/histogram';
import type { RangeAggregation } from './bucket/range';
import type { FilterAggregation, FiltersAggregation } from './bucket/filter';
import type { NestedAggregation } from './bucket/nested';
import type { AvgAggregation, SumAggregation, MinAggregation, MaxAggregation, ValueCountAggregation, CardinalityAggregation } from './metric/basic';
import type { StatsAggregation, ExtendedStatsAggregation } from './metric/stats';
import type { PercentilesAggregation, PercentileRanksAggregation } from './metric/percentiles';
import type { TopHitsAggregation } from './metric/top-hits';

export interface TermsBucket {
  key: string | number;
  key_as_string?: string;
  doc_count: number;
  [key: string]: unknown;
}

export interface TermsAggregationResult {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: TermsBucket[];
}

export interface HistogramBucket {
  key: number;
  key_as_string?: string;
  doc_count: number;
  [key: string]: unknown;
}

export interface HistogramAggregationResult {
  buckets: HistogramBucket[];
}

export interface DateHistogramBucket {
  key: number;
  key_as_string: string;
  doc_count: number;
  [key: string]: unknown;
}

export interface DateHistogramAggregationResult {
  buckets: DateHistogramBucket[];
}

export interface RangeBucket {
  key: string;
  from?: number;
  from_as_string?: string;
  to?: number;
  to_as_string?: string;
  doc_count: number;
  [key: string]: unknown;
}

export interface RangeAggregationResult {
  buckets: RangeBucket[];
}

export interface FilterAggregationResult {
  doc_count: number;
  [key: string]: unknown;
}

export interface FiltersBucket {
  doc_count: number;
  [key: string]: unknown;
}

export interface FiltersAggregationResult {
  buckets: Record<string, FiltersBucket>;
}

export interface NestedAggregationResult {
  doc_count: number;
  [key: string]: unknown;
}

export interface MetricAggregationResult {
  value: number | null;
  value_as_string?: string;
}

export interface StatsAggregationResult {
  count: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  sum: number;
}

export interface ExtendedStatsAggregationResult extends StatsAggregationResult {
  sum_of_squares: number | null;
  variance: number | null;
  variance_population: number | null;
  variance_sampling: number | null;
  std_deviation: number | null;
  std_deviation_population: number | null;
  std_deviation_sampling: number | null;
  std_deviation_bounds: {
    upper: number | null;
    lower: number | null;
    upper_population: number | null;
    lower_population: number | null;
    upper_sampling: number | null;
    lower_sampling: number | null;
  };
}

export interface PercentilesAggregationResult {
  values: Record<string, number | null>;
}

export interface PercentileRanksAggregationResult {
  values: Record<string, number>;
}

export interface TopHitsAggregationResult {
  hits: {
    total: {
      value: number;
      relation: 'eq' | 'gte';
    };
    max_score: number | null;
    hits: Array<{
      _index: string;
      _id: string;
      _score: number | null;
      _source: Record<string, unknown>;
      sort?: unknown[];
    }>;
  };
}
