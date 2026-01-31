import type { QueryCondition } from '../types';

export class BoolCondition implements QueryCondition {
  private _must: QueryCondition[] = [];
  private _filter: QueryCondition[] = [];
  private _should: QueryCondition[] = [];
  private _mustNot: QueryCondition[] = [];
  private _minimumShouldMatch?: number | string;
  private _boost?: number;

  constructor(
    must?: QueryCondition[],
    filter?: QueryCondition[],
    should?: QueryCondition[],
    mustNot?: QueryCondition[],
    minimumShouldMatch?: number | string,
    boost?: number
  ) {
    if (must) this._must = must;
    if (filter) this._filter = filter;
    if (should) this._should = should;
    if (mustNot) this._mustNot = mustNot;
    this._minimumShouldMatch = minimumShouldMatch;
    this._boost = boost;
  }

  _toQuery(): Record<string, unknown> {
    const boolQuery: Record<string, unknown> = {};

    if (this._must.length > 0) {
      boolQuery.must = this._must.map((c) => c._toQuery());
    }
    if (this._filter.length > 0) {
      boolQuery.filter = this._filter.map((c) => c._toQuery());
    }
    if (this._should.length > 0) {
      boolQuery.should = this._should.map((c) => c._toQuery());
    }
    if (this._mustNot.length > 0) {
      boolQuery.must_not = this._mustNot.map((c) => c._toQuery());
    }
    if (this._minimumShouldMatch !== undefined) {
      boolQuery.minimum_should_match = this._minimumShouldMatch;
    }
    if (this._boost !== undefined) {
      boolQuery.boost = this._boost;
    }

    return { bool: boolQuery };
  }
}

export class MustClause {
  constructor(public readonly conditions: QueryCondition[]) {}
}

export class FilterClause {
  constructor(public readonly conditions: QueryCondition[]) {}
}

export class ShouldClause {
  constructor(
    public readonly conditions: QueryCondition[],
    public readonly minimumShouldMatch?: number | string
  ) {}
}

export class MustNotClause {
  constructor(public readonly conditions: QueryCondition[]) {}
}

export function bool(
  ...clauses: (MustClause | FilterClause | ShouldClause | MustNotClause | QueryCondition)[]
): BoolCondition {
  let must: QueryCondition[] = [];
  let filter: QueryCondition[] = [];
  let should: QueryCondition[] = [];
  let mustNot: QueryCondition[] = [];
  let minimumShouldMatch: number | string | undefined;

  for (const clause of clauses) {
    if (clause instanceof MustClause) {
      must = must.concat(clause.conditions);
    } else if (clause instanceof FilterClause) {
      filter = filter.concat(clause.conditions);
    } else if (clause instanceof ShouldClause) {
      should = should.concat(clause.conditions);
      if (clause.minimumShouldMatch !== undefined) {
        minimumShouldMatch = clause.minimumShouldMatch;
      }
    } else if (clause instanceof MustNotClause) {
      mustNot = mustNot.concat(clause.conditions);
    } else {
      must.push(clause);
    }
  }

  return new BoolCondition(must, filter, should, mustNot, minimumShouldMatch);
}

export function must(...conditions: QueryCondition[]): MustClause {
  return new MustClause(conditions);
}

export function filter(...conditions: QueryCondition[]): FilterClause {
  return new FilterClause(conditions);
}

export function should(
  conditions: QueryCondition[],
  minimumShouldMatch?: number | string
): ShouldClause;
export function should(...conditions: QueryCondition[]): ShouldClause;
export function should(
  ...args: QueryCondition[] | [QueryCondition[], (number | string)?]
): ShouldClause {
  if (args.length === 1 && Array.isArray(args[0]) && !('_toQuery' in args[0])) {
    return new ShouldClause(args[0] as QueryCondition[], args[1] as number | string | undefined);
  }
  return new ShouldClause(args as QueryCondition[]);
}

export function mustNot(...conditions: QueryCondition[]): MustNotClause {
  return new MustNotClause(conditions);
}

export class MatchAllCondition implements QueryCondition {
  constructor(private readonly boost?: number) {}

  _toQuery(): Record<string, unknown> {
    if (this.boost !== undefined) {
      return { match_all: { boost: this.boost } };
    }
    return { match_all: {} };
  }
}

export class MatchNoneCondition implements QueryCondition {
  _toQuery(): Record<string, unknown> {
    return { match_none: {} };
  }
}

export function matchAll(boost?: number): MatchAllCondition {
  return new MatchAllCondition(boost);
}

export function matchNone(): MatchNoneCondition {
  return new MatchNoneCondition();
}

export class BoostingCondition implements QueryCondition {
  constructor(
    private readonly positive: QueryCondition,
    private readonly negative: QueryCondition,
    private readonly negativeBoost: number
  ) {}

  _toQuery(): Record<string, unknown> {
    return {
      boosting: {
        positive: this.positive._toQuery(),
        negative: this.negative._toQuery(),
        negative_boost: this.negativeBoost,
      },
    };
  }
}

export function boosting(
  positive: QueryCondition,
  negative: QueryCondition,
  negativeBoost: number
): BoostingCondition {
  return new BoostingCondition(positive, negative, negativeBoost);
}

export class ConstantScoreCondition implements QueryCondition {
  constructor(
    private readonly filterCondition: QueryCondition,
    private readonly boost?: number
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {
      filter: this.filterCondition._toQuery(),
    };
    if (this.boost !== undefined) {
      query.boost = this.boost;
    }
    return { constant_score: query };
  }
}

export function constantScore(filterCondition: QueryCondition, boost?: number): ConstantScoreCondition {
  return new ConstantScoreCondition(filterCondition, boost);
}

export class DisMaxCondition implements QueryCondition {
  constructor(
    private readonly queries: QueryCondition[],
    private readonly tieBreaker?: number,
    private readonly boost?: number
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {
      queries: this.queries.map((q) => q._toQuery()),
    };
    if (this.tieBreaker !== undefined) {
      query.tie_breaker = this.tieBreaker;
    }
    if (this.boost !== undefined) {
      query.boost = this.boost;
    }
    return { dis_max: query };
  }
}

export function disMax(
  queries: QueryCondition[],
  options?: { tieBreaker?: number; boost?: number }
): DisMaxCondition {
  return new DisMaxCondition(queries, options?.tieBreaker, options?.boost);
}
