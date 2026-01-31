import type { Aggregation } from '../types.ts';
import type { QueryCondition } from '../../query/types.ts';

export class FilterAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(private readonly filterCondition: QueryCondition) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      filter: this.filterCondition._toQuery(),
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

export function filterAgg(filterCondition: QueryCondition): FilterAggregation {
  return new FilterAggregation(filterCondition);
}

export interface FiltersAggregationOptions {
  other_bucket?: boolean;
  other_bucket_key?: string;
}

export class FiltersAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly filters: Record<string, QueryCondition>,
    private readonly options: FiltersAggregationOptions = {}
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const filtersObj: Record<string, unknown> = {};
    for (const [name, condition] of Object.entries(this.filters)) {
      filtersObj[name] = condition._toQuery();
    }

    const agg: Record<string, unknown> = {
      filters: {
        filters: filtersObj,
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

export function filters(
  filterConditions: Record<string, QueryCondition>,
  options?: FiltersAggregationOptions
): FiltersAggregation {
  return new FiltersAggregation(filterConditions, options);
}

export class GlobalAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      global: {},
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

export function global(): GlobalAggregation {
  return new GlobalAggregation();
}

export class MissingAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(private readonly fieldPath: string) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      missing: {
        field: this.fieldPath,
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

export function missing(field: { _getFullPath(): string }): MissingAggregation {
  return new MissingAggregation(field._getFullPath());
}

export class SamplerAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(private readonly shardSize?: number) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const samplerConfig: Record<string, unknown> = {};
    if (this.shardSize !== undefined) {
      samplerConfig.shard_size = this.shardSize;
    }

    const agg: Record<string, unknown> = {
      sampler: samplerConfig,
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

export function sampler(shardSize?: number): SamplerAggregation {
  return new SamplerAggregation(shardSize);
}
