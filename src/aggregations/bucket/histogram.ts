import type { ESField } from '../../schema/fields/base.ts';
import type { Aggregation } from '../types.ts';

export interface HistogramAggregationOptions {
  interval: number;
  offset?: number;
  min_doc_count?: number;
  extended_bounds?: { min: number; max: number };
  hard_bounds?: { min: number; max: number };
  order?: Record<string, 'asc' | 'desc'>;
  keyed?: boolean;
  missing?: number;
}

export class HistogramAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: HistogramAggregationOptions
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      histogram: {
        field: this.field._getFullPath(),
        ...this.options,
      },
    };

    if (this._subAggregations) {
      agg.aggs = {};
      for (const [name, subAgg] of Object.entries(this._subAggregations)) {
        (agg.aggs as Record<string, unknown>)[name] = subAgg._toAggregation();
      }
    }

    return agg;
  }
}

export function histogram<F extends ESField<number, any, any, any, any>>(
  field: F,
  options: HistogramAggregationOptions
): HistogramAggregation<F> {
  return new HistogramAggregation(field, options);
}

export type CalendarInterval =
  | 'minute' | '1m'
  | 'hour' | '1h'
  | 'day' | '1d'
  | 'week' | '1w'
  | 'month' | '1M'
  | 'quarter' | '1q'
  | 'year' | '1y';

export interface DateHistogramAggregationOptions {
  calendar_interval?: CalendarInterval;
  fixed_interval?: string;
  format?: string;
  time_zone?: string;
  offset?: string;
  min_doc_count?: number;
  extended_bounds?: { min: string | number; max: string | number };
  hard_bounds?: { min: string | number; max: string | number };
  order?: Record<string, 'asc' | 'desc'>;
  keyed?: boolean;
  missing?: string | number;
}

export class DateHistogramAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: DateHistogramAggregationOptions
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      date_histogram: {
        field: this.field._getFullPath(),
        ...this.options,
      },
    };

    if (this._subAggregations) {
      agg.aggs = {};
      for (const [name, subAgg] of Object.entries(this._subAggregations)) {
        (agg.aggs as Record<string, unknown>)[name] = subAgg._toAggregation();
      }
    }

    return agg;
  }
}

export function dateHistogram<F extends ESField<Date | string | number, 'date', any, any, any>>(
  field: F,
  options: DateHistogramAggregationOptions
): DateHistogramAggregation<F> {
  return new DateHistogramAggregation(field, options);
}

export interface AutoDateHistogramAggregationOptions {
  buckets?: number;
  format?: string;
  time_zone?: string;
  minimum_interval?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
  missing?: string | number;
}

export class AutoDateHistogramAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: AutoDateHistogramAggregationOptions = {}
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      auto_date_histogram: {
        field: this.field._getFullPath(),
        ...this.options,
      },
    };

    if (this._subAggregations) {
      agg.aggs = {};
      for (const [name, subAgg] of Object.entries(this._subAggregations)) {
        (agg.aggs as Record<string, unknown>)[name] = subAgg._toAggregation();
      }
    }

    return agg;
  }
}

export function autoDateHistogram<F extends ESField<Date | string | number, 'date', any, any, any>>(
  field: F,
  options?: AutoDateHistogramAggregationOptions
): AutoDateHistogramAggregation<F> {
  return new AutoDateHistogramAggregation(field, options);
}
