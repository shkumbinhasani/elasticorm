import type { Aggregation } from '../types.ts';
import type { ESNestedField } from '../../schema/fields/nested.ts';
import type { ESField } from '../../schema/fields/base.ts';

export class NestedAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(private readonly path: string) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      nested: {
        path: this.path,
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

export function nestedAgg<Fields extends Record<string, ESField<any, any, any, any, any>>>(
  field: ESNestedField<Fields, any, any, any>
): NestedAggregation {
  return new NestedAggregation(field._getFullPath());
}

export class ReverseNestedAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(private readonly path?: string) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const reverseNestedConfig: Record<string, unknown> = {};
    if (this.path) {
      reverseNestedConfig.path = this.path;
    }

    const agg: Record<string, unknown> = {
      reverse_nested: reverseNestedConfig,
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

export function reverseNested(path?: string): ReverseNestedAggregation {
  return new ReverseNestedAggregation(path);
}
