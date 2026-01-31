import type { ESField } from '../../schema/fields/base';
import type { Aggregation } from '../types';

export interface TermsAggregationOptions {
  size?: number;
  shard_size?: number;
  show_term_doc_count_error?: boolean;
  order?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  min_doc_count?: number;
  shard_min_doc_count?: number;
  include?: string | string[] | { partition: number; num_partitions: number };
  exclude?: string | string[];
  missing?: unknown;
  script?: { source: string; lang?: string; params?: Record<string, unknown> };
}

export class TermsAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: TermsAggregationOptions = {}
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      terms: {
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

export function terms<F extends ESField<string | number, 'keyword' | 'integer' | 'long' | 'short' | 'byte' | 'ip', any, any, any>>(
  field: F,
  options?: TermsAggregationOptions
): TermsAggregation<F> {
  return new TermsAggregation(field, options);
}

export interface MultiTermsAggregationOptions {
  size?: number;
  shard_size?: number;
  show_term_doc_count_error?: boolean;
  order?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  min_doc_count?: number;
  shard_min_doc_count?: number;
}

export class MultiTermsAggregation implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly terms: Array<{ field: string; missing?: unknown }>,
    private readonly options: MultiTermsAggregationOptions = {}
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      multi_terms: {
        terms: this.terms,
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

export function multiTerms(
  fields: ESField<any, any, any, any, any>[],
  options?: MultiTermsAggregationOptions & { missing?: Record<string, unknown> }
): MultiTermsAggregation {
  const terms = fields.map((f) => ({
    field: f._getFullPath(),
    missing: options?.missing?.[f._getFullPath()],
  }));
  return new MultiTermsAggregation(terms, options);
}

export interface SignificantTermsAggregationOptions {
  size?: number;
  shard_size?: number;
  min_doc_count?: number;
  shard_min_doc_count?: number;
  include?: string | string[];
  exclude?: string | string[];
  background_filter?: Record<string, unknown>;
  mutual_information?: { include_negatives?: boolean; background_is_superset?: boolean };
  chi_square?: { include_negatives?: boolean; background_is_superset?: boolean };
  gnd?: { background_is_superset?: boolean };
  jlh?: {};
  percentage?: {};
}

export class SignificantTermsAggregation<Field extends ESField<any, any, any, any, any>> implements Aggregation {
  private _subAggregations?: Record<string, Aggregation>;

  constructor(
    private readonly field: Field,
    private readonly options: SignificantTermsAggregationOptions = {}
  ) {}

  aggs(subAggregations: Record<string, Aggregation>): this {
    this._subAggregations = subAggregations;
    return this;
  }

  _toAggregation(): Record<string, unknown> {
    const agg: Record<string, unknown> = {
      significant_terms: {
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

export function significantTerms<F extends ESField<string, 'keyword' | 'text', any, any, any>>(
  field: F,
  options?: SignificantTermsAggregationOptions
): SignificantTermsAggregation<F> {
  return new SignificantTermsAggregation(field, options);
}
