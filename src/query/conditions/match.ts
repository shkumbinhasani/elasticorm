import type { ESField } from '../../schema/fields/base.ts';
import type { QueryCondition } from '../types.ts';

export interface MatchOptions {
  analyzer?: string;
  auto_generate_synonyms_phrase_query?: boolean;
  fuzziness?: number | 'AUTO';
  max_expansions?: number;
  prefix_length?: number;
  fuzzy_transpositions?: boolean;
  fuzzy_rewrite?: string;
  lenient?: boolean;
  operator?: 'OR' | 'AND';
  minimum_should_match?: number | string;
  zero_terms_query?: 'none' | 'all';
  boost?: number;
}

export class MatchCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly query: string,
    private readonly options: MatchOptions = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const matchQuery: Record<string, unknown> = { query: this.query };

    if (this.options.analyzer) matchQuery.analyzer = this.options.analyzer;
    if (this.options.auto_generate_synonyms_phrase_query !== undefined) {
      matchQuery.auto_generate_synonyms_phrase_query = this.options.auto_generate_synonyms_phrase_query;
    }
    if (this.options.fuzziness !== undefined) matchQuery.fuzziness = this.options.fuzziness;
    if (this.options.max_expansions !== undefined) matchQuery.max_expansions = this.options.max_expansions;
    if (this.options.prefix_length !== undefined) matchQuery.prefix_length = this.options.prefix_length;
    if (this.options.fuzzy_transpositions !== undefined) matchQuery.fuzzy_transpositions = this.options.fuzzy_transpositions;
    if (this.options.fuzzy_rewrite) matchQuery.fuzzy_rewrite = this.options.fuzzy_rewrite;
    if (this.options.lenient !== undefined) matchQuery.lenient = this.options.lenient;
    if (this.options.operator) matchQuery.operator = this.options.operator;
    if (this.options.minimum_should_match !== undefined) matchQuery.minimum_should_match = this.options.minimum_should_match;
    if (this.options.zero_terms_query) matchQuery.zero_terms_query = this.options.zero_terms_query;
    if (this.options.boost !== undefined) matchQuery.boost = this.options.boost;

    return {
      match: {
        [this.field]: matchQuery,
      },
    };
  }
}

export interface MatchPhraseOptions {
  analyzer?: string;
  slop?: number;
  zero_terms_query?: 'none' | 'all';
  boost?: number;
}

export class MatchPhraseCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly query: string,
    private readonly options: MatchPhraseOptions = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const matchQuery: Record<string, unknown> = { query: this.query };

    if (this.options.analyzer) matchQuery.analyzer = this.options.analyzer;
    if (this.options.slop !== undefined) matchQuery.slop = this.options.slop;
    if (this.options.zero_terms_query) matchQuery.zero_terms_query = this.options.zero_terms_query;
    if (this.options.boost !== undefined) matchQuery.boost = this.options.boost;

    return {
      match_phrase: {
        [this.field]: matchQuery,
      },
    };
  }
}

export interface MatchPhrasePrefixOptions {
  analyzer?: string;
  max_expansions?: number;
  slop?: number;
  zero_terms_query?: 'none' | 'all';
  boost?: number;
}

export class MatchPhrasePrefixCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly query: string,
    private readonly options: MatchPhrasePrefixOptions = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const matchQuery: Record<string, unknown> = { query: this.query };

    if (this.options.analyzer) matchQuery.analyzer = this.options.analyzer;
    if (this.options.max_expansions !== undefined) matchQuery.max_expansions = this.options.max_expansions;
    if (this.options.slop !== undefined) matchQuery.slop = this.options.slop;
    if (this.options.zero_terms_query) matchQuery.zero_terms_query = this.options.zero_terms_query;
    if (this.options.boost !== undefined) matchQuery.boost = this.options.boost;

    return {
      match_phrase_prefix: {
        [this.field]: matchQuery,
      },
    };
  }
}

export interface MultiMatchOptions {
  type?: 'best_fields' | 'most_fields' | 'cross_fields' | 'phrase' | 'phrase_prefix' | 'bool_prefix';
  tie_breaker?: number;
  analyzer?: string;
  auto_generate_synonyms_phrase_query?: boolean;
  fuzziness?: number | 'AUTO';
  max_expansions?: number;
  prefix_length?: number;
  fuzzy_transpositions?: boolean;
  fuzzy_rewrite?: string;
  lenient?: boolean;
  operator?: 'OR' | 'AND';
  minimum_should_match?: number | string;
  zero_terms_query?: 'none' | 'all';
  boost?: number;
}

export class MultiMatchCondition implements QueryCondition {
  constructor(
    private readonly fields: string[],
    private readonly query: string,
    private readonly options: MultiMatchOptions = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const matchQuery: Record<string, unknown> = {
      query: this.query,
      fields: this.fields,
    };

    if (this.options.type) matchQuery.type = this.options.type;
    if (this.options.tie_breaker !== undefined) matchQuery.tie_breaker = this.options.tie_breaker;
    if (this.options.analyzer) matchQuery.analyzer = this.options.analyzer;
    if (this.options.auto_generate_synonyms_phrase_query !== undefined) {
      matchQuery.auto_generate_synonyms_phrase_query = this.options.auto_generate_synonyms_phrase_query;
    }
    if (this.options.fuzziness !== undefined) matchQuery.fuzziness = this.options.fuzziness;
    if (this.options.max_expansions !== undefined) matchQuery.max_expansions = this.options.max_expansions;
    if (this.options.prefix_length !== undefined) matchQuery.prefix_length = this.options.prefix_length;
    if (this.options.fuzzy_transpositions !== undefined) matchQuery.fuzzy_transpositions = this.options.fuzzy_transpositions;
    if (this.options.fuzzy_rewrite) matchQuery.fuzzy_rewrite = this.options.fuzzy_rewrite;
    if (this.options.lenient !== undefined) matchQuery.lenient = this.options.lenient;
    if (this.options.operator) matchQuery.operator = this.options.operator;
    if (this.options.minimum_should_match !== undefined) matchQuery.minimum_should_match = this.options.minimum_should_match;
    if (this.options.zero_terms_query) matchQuery.zero_terms_query = this.options.zero_terms_query;
    if (this.options.boost !== undefined) matchQuery.boost = this.options.boost;

    return {
      multi_match: matchQuery,
    };
  }
}

export class QueryStringCondition implements QueryCondition {
  constructor(
    private readonly query: string,
    private readonly options: {
      default_field?: string;
      fields?: string[];
      default_operator?: 'OR' | 'AND';
      analyzer?: string;
      allow_leading_wildcard?: boolean;
      enable_position_increments?: boolean;
      fuzziness?: number | 'AUTO';
      fuzzy_max_expansions?: number;
      fuzzy_prefix_length?: number;
      fuzzy_transpositions?: boolean;
      phrase_slop?: number;
      boost?: number;
      auto_generate_synonyms_phrase_query?: boolean;
      minimum_should_match?: number | string;
      lenient?: boolean;
      time_zone?: string;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const queryObj: Record<string, unknown> = { query: this.query };

    if (this.options.default_field) queryObj.default_field = this.options.default_field;
    if (this.options.fields) queryObj.fields = this.options.fields;
    if (this.options.default_operator) queryObj.default_operator = this.options.default_operator;
    if (this.options.analyzer) queryObj.analyzer = this.options.analyzer;
    if (this.options.allow_leading_wildcard !== undefined) queryObj.allow_leading_wildcard = this.options.allow_leading_wildcard;
    if (this.options.enable_position_increments !== undefined) queryObj.enable_position_increments = this.options.enable_position_increments;
    if (this.options.fuzziness !== undefined) queryObj.fuzziness = this.options.fuzziness;
    if (this.options.fuzzy_max_expansions !== undefined) queryObj.fuzzy_max_expansions = this.options.fuzzy_max_expansions;
    if (this.options.fuzzy_prefix_length !== undefined) queryObj.fuzzy_prefix_length = this.options.fuzzy_prefix_length;
    if (this.options.fuzzy_transpositions !== undefined) queryObj.fuzzy_transpositions = this.options.fuzzy_transpositions;
    if (this.options.phrase_slop !== undefined) queryObj.phrase_slop = this.options.phrase_slop;
    if (this.options.boost !== undefined) queryObj.boost = this.options.boost;
    if (this.options.auto_generate_synonyms_phrase_query !== undefined) {
      queryObj.auto_generate_synonyms_phrase_query = this.options.auto_generate_synonyms_phrase_query;
    }
    if (this.options.minimum_should_match !== undefined) queryObj.minimum_should_match = this.options.minimum_should_match;
    if (this.options.lenient !== undefined) queryObj.lenient = this.options.lenient;
    if (this.options.time_zone) queryObj.time_zone = this.options.time_zone;

    return {
      query_string: queryObj,
    };
  }
}

export class SimpleQueryStringCondition implements QueryCondition {
  constructor(
    private readonly query: string,
    private readonly options: {
      fields?: string[];
      default_operator?: 'OR' | 'AND';
      analyzer?: string;
      flags?: string;
      analyze_wildcard?: boolean;
      lenient?: boolean;
      minimum_should_match?: number | string;
      quote_field_suffix?: string;
      auto_generate_synonyms_phrase_query?: boolean;
      fuzzy_prefix_length?: number;
      fuzzy_max_expansions?: number;
      fuzzy_transpositions?: boolean;
      boost?: number;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const queryObj: Record<string, unknown> = { query: this.query };

    if (this.options.fields) queryObj.fields = this.options.fields;
    if (this.options.default_operator) queryObj.default_operator = this.options.default_operator;
    if (this.options.analyzer) queryObj.analyzer = this.options.analyzer;
    if (this.options.flags) queryObj.flags = this.options.flags;
    if (this.options.analyze_wildcard !== undefined) queryObj.analyze_wildcard = this.options.analyze_wildcard;
    if (this.options.lenient !== undefined) queryObj.lenient = this.options.lenient;
    if (this.options.minimum_should_match !== undefined) queryObj.minimum_should_match = this.options.minimum_should_match;
    if (this.options.quote_field_suffix) queryObj.quote_field_suffix = this.options.quote_field_suffix;
    if (this.options.auto_generate_synonyms_phrase_query !== undefined) {
      queryObj.auto_generate_synonyms_phrase_query = this.options.auto_generate_synonyms_phrase_query;
    }
    if (this.options.fuzzy_prefix_length !== undefined) queryObj.fuzzy_prefix_length = this.options.fuzzy_prefix_length;
    if (this.options.fuzzy_max_expansions !== undefined) queryObj.fuzzy_max_expansions = this.options.fuzzy_max_expansions;
    if (this.options.fuzzy_transpositions !== undefined) queryObj.fuzzy_transpositions = this.options.fuzzy_transpositions;
    if (this.options.boost !== undefined) queryObj.boost = this.options.boost;

    return {
      simple_query_string: queryObj,
    };
  }
}

export function match<F extends ESField<string, 'text', any, any, any>>(
  field: F,
  query: string,
  options?: MatchOptions
): MatchCondition {
  return new MatchCondition(field._getFullPath(), query, options);
}

export function matchPhrase<F extends ESField<string, 'text', any, any, any>>(
  field: F,
  query: string,
  options?: MatchPhraseOptions
): MatchPhraseCondition {
  return new MatchPhraseCondition(field._getFullPath(), query, options);
}

export function matchPhrasePrefix<F extends ESField<string, 'text', any, any, any>>(
  field: F,
  query: string,
  options?: MatchPhrasePrefixOptions
): MatchPhrasePrefixCondition {
  return new MatchPhrasePrefixCondition(field._getFullPath(), query, options);
}

export function multiMatch<F extends ESField<string, any, any, any, any>>(
  fields: F[],
  query: string,
  options?: MultiMatchOptions
): MultiMatchCondition {
  return new MultiMatchCondition(
    fields.map((f) => f._getFullPath()),
    query,
    options
  );
}

export function queryString(
  query: string,
  options?: {
    default_field?: string;
    fields?: string[];
    default_operator?: 'OR' | 'AND';
    analyzer?: string;
    allow_leading_wildcard?: boolean;
    enable_position_increments?: boolean;
    fuzziness?: number | 'AUTO';
    fuzzy_max_expansions?: number;
    fuzzy_prefix_length?: number;
    fuzzy_transpositions?: boolean;
    phrase_slop?: number;
    boost?: number;
    auto_generate_synonyms_phrase_query?: boolean;
    minimum_should_match?: number | string;
    lenient?: boolean;
    time_zone?: string;
  }
): QueryStringCondition {
  return new QueryStringCondition(query, options);
}

export function simpleQueryString(
  query: string,
  options?: {
    fields?: string[];
    default_operator?: 'OR' | 'AND';
    analyzer?: string;
    flags?: string;
    analyze_wildcard?: boolean;
    lenient?: boolean;
    minimum_should_match?: number | string;
    quote_field_suffix?: string;
    auto_generate_synonyms_phrase_query?: boolean;
    fuzzy_prefix_length?: number;
    fuzzy_max_expansions?: number;
    fuzzy_transpositions?: boolean;
    boost?: number;
  }
): SimpleQueryStringCondition {
  return new SimpleQueryStringCondition(query, options);
}
