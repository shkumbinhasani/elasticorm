import type { ESField } from '../../schema/fields/base.ts';
import type { QueryCondition } from '../types.ts';

export class TermCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly value: unknown
  ) {}

  _toQuery(): Record<string, unknown> {
    return {
      term: {
        [this.field]: this.value,
      },
    };
  }
}

export class TermsCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly values: unknown[]
  ) {}

  _toQuery(): Record<string, unknown> {
    return {
      terms: {
        [this.field]: this.values,
      },
    };
  }
}

export class ExistsCondition implements QueryCondition {
  constructor(private readonly field: string) {}

  _toQuery(): Record<string, unknown> {
    return {
      exists: {
        field: this.field,
      },
    };
  }
}

export class IdsCondition implements QueryCondition {
  constructor(private readonly values: string[]) {}

  _toQuery(): Record<string, unknown> {
    return {
      ids: {
        values: this.values,
      },
    };
  }
}

export class PrefixCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly value: string,
    private readonly options: { case_insensitive?: boolean; rewrite?: string } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = { value: this.value };
    if (this.options.case_insensitive !== undefined) query.case_insensitive = this.options.case_insensitive;
    if (this.options.rewrite) query.rewrite = this.options.rewrite;

    return {
      prefix: {
        [this.field]: query,
      },
    };
  }
}

export class WildcardCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly value: string,
    private readonly options: { case_insensitive?: boolean; rewrite?: string; boost?: number } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = { value: this.value };
    if (this.options.case_insensitive !== undefined) query.case_insensitive = this.options.case_insensitive;
    if (this.options.rewrite) query.rewrite = this.options.rewrite;
    if (this.options.boost !== undefined) query.boost = this.options.boost;

    return {
      wildcard: {
        [this.field]: query,
      },
    };
  }
}

export class RegexpCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly value: string,
    private readonly options: {
      flags?: string;
      case_insensitive?: boolean;
      max_determinized_states?: number;
      rewrite?: string;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = { value: this.value };
    if (this.options.flags) query.flags = this.options.flags;
    if (this.options.case_insensitive !== undefined) query.case_insensitive = this.options.case_insensitive;
    if (this.options.max_determinized_states !== undefined) query.max_determinized_states = this.options.max_determinized_states;
    if (this.options.rewrite) query.rewrite = this.options.rewrite;

    return {
      regexp: {
        [this.field]: query,
      },
    };
  }
}

export class FuzzyCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly value: string,
    private readonly options: {
      fuzziness?: number | 'AUTO';
      max_expansions?: number;
      prefix_length?: number;
      transpositions?: boolean;
      rewrite?: string;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = { value: this.value };
    if (this.options.fuzziness !== undefined) query.fuzziness = this.options.fuzziness;
    if (this.options.max_expansions !== undefined) query.max_expansions = this.options.max_expansions;
    if (this.options.prefix_length !== undefined) query.prefix_length = this.options.prefix_length;
    if (this.options.transpositions !== undefined) query.transpositions = this.options.transpositions;
    if (this.options.rewrite) query.rewrite = this.options.rewrite;

    return {
      fuzzy: {
        [this.field]: query,
      },
    };
  }
}

type FieldValue<F> = F extends ESField<infer T, any, any, any, any> ? T : never;

export function eq<F extends ESField<any, any, any, any, any>>(
  field: F,
  value: NonNullable<FieldValue<F>>
): TermCondition {
  return new TermCondition(field._getFullPath(), value);
}

export function inValues<F extends ESField<any, any, any, any, any>>(
  field: F,
  values: NonNullable<FieldValue<F>>[]
): TermsCondition {
  return new TermsCondition(field._getFullPath(), values);
}

export function exists<F extends ESField<any, any, any, any, any>>(field: F): ExistsCondition {
  return new ExistsCondition(field._getFullPath());
}

export function ids(values: string[]): IdsCondition {
  return new IdsCondition(values);
}

export function prefix<F extends ESField<string, any, any, any, any>>(
  field: F,
  value: string,
  options?: { case_insensitive?: boolean; rewrite?: string }
): PrefixCondition {
  return new PrefixCondition(field._getFullPath(), value, options);
}

export function wildcard<F extends ESField<string, any, any, any, any>>(
  field: F,
  value: string,
  options?: { case_insensitive?: boolean; rewrite?: string; boost?: number }
): WildcardCondition {
  return new WildcardCondition(field._getFullPath(), value, options);
}

export function regexp<F extends ESField<string, any, any, any, any>>(
  field: F,
  value: string,
  options?: {
    flags?: string;
    case_insensitive?: boolean;
    max_determinized_states?: number;
    rewrite?: string;
  }
): RegexpCondition {
  return new RegexpCondition(field._getFullPath(), value, options);
}

export function fuzzy<F extends ESField<string, any, any, any, any>>(
  field: F,
  value: string,
  options?: {
    fuzziness?: number | 'AUTO';
    max_expansions?: number;
    prefix_length?: number;
    transpositions?: boolean;
    rewrite?: string;
  }
): FuzzyCondition {
  return new FuzzyCondition(field._getFullPath(), value, options);
}
