import type { ESField } from '../../schema/fields/base.ts';
import type { Aggregation } from '../types.ts';

export interface PercentilesAggregationOptions {
  percents?: number[];
  keyed?: boolean;
  tdigest?: { compression?: number; execution_hint?: 'high_accuracy' | 'default' };
  hdr?: { number_of_significant_value_digits?: number };
  missing?: number;
  script?: { source: string; lang?: string; params?: Record<string, unknown> };
}

export class PercentilesAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: PercentilesAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      percentiles: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function percentiles<F extends ESField<number, any, any, any, any>>(
  field: F,
  options?: PercentilesAggregationOptions
): PercentilesAggregation {
  return new PercentilesAggregation(field._getFullPath(), options);
}

export interface PercentileRanksAggregationOptions {
  values: number[];
  keyed?: boolean;
  tdigest?: { compression?: number };
  hdr?: { number_of_significant_value_digits?: number };
  missing?: number;
  script?: { source: string; lang?: string; params?: Record<string, unknown> };
}

export class PercentileRanksAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: PercentileRanksAggregationOptions
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      percentile_ranks: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function percentileRanks<F extends ESField<number, any, any, any, any>>(
  field: F,
  values: number[],
  options?: Omit<PercentileRanksAggregationOptions, 'values'>
): PercentileRanksAggregation {
  return new PercentileRanksAggregation(field._getFullPath(), { values, ...options });
}

export interface BoxplotAggregationOptions {
  compression?: number;
  missing?: number;
}

export class BoxplotAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: BoxplotAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      boxplot: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function boxplot<F extends ESField<number, any, any, any, any>>(
  field: F,
  options?: BoxplotAggregationOptions
): BoxplotAggregation {
  return new BoxplotAggregation(field._getFullPath(), options);
}
