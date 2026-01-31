import type { ESField } from '../../schema/fields/base.ts';
import type { Aggregation } from '../types.ts';

export interface MetricAggregationOptions {
  missing?: number;
  script?: { source: string; lang?: string; params?: Record<string, unknown> };
}

export class AvgAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: MetricAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      avg: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function avg<F extends ESField<number, any, any, any, any>>(
  field: F,
  options?: MetricAggregationOptions
): AvgAggregation {
  return new AvgAggregation(field._getFullPath(), options);
}

export class SumAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: MetricAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      sum: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function sum<F extends ESField<number, any, any, any, any>>(
  field: F,
  options?: MetricAggregationOptions
): SumAggregation {
  return new SumAggregation(field._getFullPath(), options);
}

export class MinAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: MetricAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      min: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function min<F extends ESField<number | Date | string, any, any, any, any>>(
  field: F,
  options?: MetricAggregationOptions
): MinAggregation {
  return new MinAggregation(field._getFullPath(), options);
}

export class MaxAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: MetricAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      max: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function max<F extends ESField<number | Date | string, any, any, any, any>>(
  field: F,
  options?: MetricAggregationOptions
): MaxAggregation {
  return new MaxAggregation(field._getFullPath(), options);
}

export class ValueCountAggregation implements Aggregation {
  constructor(private readonly fieldPath: string) {}

  _toAggregation(): Record<string, unknown> {
    return {
      value_count: {
        field: this.fieldPath,
      },
    };
  }
}

export function valueCount<F extends ESField<any, any, any, any, any>>(
  field: F
): ValueCountAggregation {
  return new ValueCountAggregation(field._getFullPath());
}

export interface CardinalityAggregationOptions {
  precision_threshold?: number;
  missing?: unknown;
}

export class CardinalityAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: CardinalityAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      cardinality: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function cardinality<F extends ESField<any, any, any, any, any>>(
  field: F,
  options?: CardinalityAggregationOptions
): CardinalityAggregation {
  return new CardinalityAggregation(field._getFullPath(), options);
}

export class WeightedAvgAggregation implements Aggregation {
  constructor(
    private readonly valuePath: string,
    private readonly weightPath: string,
    private readonly options: { value_missing?: number; weight_missing?: number } = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    const config: Record<string, unknown> = {
      value: { field: this.valuePath },
      weight: { field: this.weightPath },
    };

    if (this.options.value_missing !== undefined) {
      (config.value as Record<string, unknown>).missing = this.options.value_missing;
    }
    if (this.options.weight_missing !== undefined) {
      (config.weight as Record<string, unknown>).missing = this.options.weight_missing;
    }

    return {
      weighted_avg: config,
    };
  }
}

export function weightedAvg<
  V extends ESField<number, any, any, any, any>,
  W extends ESField<number, any, any, any, any>,
>(
  valueField: V,
  weightField: W,
  options?: { value_missing?: number; weight_missing?: number }
): WeightedAvgAggregation {
  return new WeightedAvgAggregation(valueField._getFullPath(), weightField._getFullPath(), options);
}

export class MedianAbsoluteDeviationAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: { compression?: number; missing?: number } = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      median_absolute_deviation: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function medianAbsoluteDeviation<F extends ESField<number, any, any, any, any>>(
  field: F,
  options?: { compression?: number; missing?: number }
): MedianAbsoluteDeviationAggregation {
  return new MedianAbsoluteDeviationAggregation(field._getFullPath(), options);
}
