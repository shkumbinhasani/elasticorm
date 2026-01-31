import type { ESField } from '../../schema/fields/base';
import type { Aggregation } from '../types';

export interface RangeBucketDefinition {
  key?: string;
  from?: number;
  to?: number;
}

export interface RangeAggregationOptions {
  ranges: RangeBucketDefinition[];
  keyed?: boolean;
  script?: { source: string; lang?: string; params?: Record<string, unknown> };
  missing?: number;
}

export class RangeAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: RangeAggregationOptions
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      range: {
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

export function range<F extends ESField<number, any, any, any, any>>(
  field: F,
  ranges: RangeBucketDefinition[],
  options?: Omit<RangeAggregationOptions, 'ranges'>
): RangeAggregation<F> {
  return new RangeAggregation(field, { ranges, ...options });
}

export interface DateRangeBucketDefinition {
  key?: string;
  from?: string | number;
  to?: string | number;
}

export interface DateRangeAggregationOptions {
  ranges: DateRangeBucketDefinition[];
  format?: string;
  time_zone?: string;
  keyed?: boolean;
  missing?: string | number;
}

export class DateRangeAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: DateRangeAggregationOptions
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      date_range: {
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

export function dateRange<F extends ESField<Date | string | number, 'date', any, any, any>>(
  field: F,
  ranges: DateRangeBucketDefinition[],
  options?: Omit<DateRangeAggregationOptions, 'ranges'>
): DateRangeAggregation<F> {
  return new DateRangeAggregation(field, { ranges, ...options });
}

export interface IpRangeBucketDefinition {
  key?: string;
  from?: string;
  to?: string;
  mask?: string;
}

export interface IpRangeAggregationOptions {
  ranges: IpRangeBucketDefinition[];
  keyed?: boolean;
}

export class IpRangeAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: IpRangeAggregationOptions
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      ip_range: {
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

export function ipRange<F extends ESField<string, 'ip', any, any, any>>(
  field: F,
  ranges: IpRangeBucketDefinition[],
  options?: Omit<IpRangeAggregationOptions, 'ranges'>
): IpRangeAggregation<F> {
  return new IpRangeAggregation(field, { ranges, ...options });
}
