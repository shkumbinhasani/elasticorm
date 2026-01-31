import type { ESField } from '../../schema/fields/base.ts';
import type { Aggregation } from '../types.ts';

export interface StatsAggregationOptions {
  missing?: number;
  script?: { source: string; lang?: string; params?: Record<string, unknown> };
}

export class StatsAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: StatsAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      stats: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function stats<F extends ESField<number, any, any, any, any>>(
  field: F,
  options?: StatsAggregationOptions
): StatsAggregation {
  return new StatsAggregation(field._getFullPath(), options);
}

export interface ExtendedStatsAggregationOptions extends StatsAggregationOptions {
  sigma?: number;
}

export class ExtendedStatsAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: ExtendedStatsAggregationOptions = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      extended_stats: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function extendedStats<F extends ESField<number, any, any, any, any>>(
  field: F,
  options?: ExtendedStatsAggregationOptions
): ExtendedStatsAggregation {
  return new ExtendedStatsAggregation(field._getFullPath(), options);
}

export class StringStatsAggregation implements Aggregation {
  constructor(
    private readonly fieldPath: string,
    private readonly options: { show_distribution?: boolean; missing?: string } = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      string_stats: {
        field: this.fieldPath,
        ...this.options,
      },
    };
  }
}

export function stringStats<F extends ESField<string, 'keyword' | 'text', any, any, any>>(
  field: F,
  options?: { show_distribution?: boolean; missing?: string }
): StringStatsAggregation {
  return new StringStatsAggregation(field._getFullPath(), options);
}

export class MatrixStatsAggregation implements Aggregation {
  constructor(
    private readonly fieldPaths: string[],
    private readonly options: { mode?: 'avg' | 'min' | 'max' | 'sum' | 'median'; missing?: Record<string, number> } = {}
  ) {}

  _toAggregation(): Record<string, unknown> {
    return {
      matrix_stats: {
        fields: this.fieldPaths,
        ...this.options,
      },
    };
  }
}

export function matrixStats<F extends ESField<number, any, any, any, any>>(
  fields: F[],
  options?: { mode?: 'avg' | 'min' | 'max' | 'sum' | 'median'; missing?: Record<string, number> }
): MatrixStatsAggregation {
  return new MatrixStatsAggregation(fields.map((f) => f._getFullPath()), options);
}
