import type { QueryCondition } from '../types.ts';
import type { ESNestedField } from '../../schema/fields/nested.ts';
import type { ESField } from '../../schema/fields/base.ts';

export class NestedQueryCondition implements QueryCondition {
  constructor(
    private readonly path: string,
    private readonly queryCondition: QueryCondition,
    private readonly options: {
      score_mode?: 'avg' | 'max' | 'min' | 'none' | 'sum';
      ignore_unmapped?: boolean;
      inner_hits?: {
        name?: string;
        size?: number;
        from?: number;
        sort?: unknown[];
        _source?: boolean | string[] | { includes?: string[]; excludes?: string[] };
        highlight?: unknown;
      };
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const nestedQuery: Record<string, unknown> = {
      path: this.path,
      query: this.queryCondition._toQuery(),
    };

    if (this.options.score_mode) nestedQuery.score_mode = this.options.score_mode;
    if (this.options.ignore_unmapped !== undefined) nestedQuery.ignore_unmapped = this.options.ignore_unmapped;
    if (this.options.inner_hits) nestedQuery.inner_hits = this.options.inner_hits;

    return { nested: nestedQuery };
  }
}

export function nested<Fields extends Record<string, ESField<any, any, any, any, any>>>(
  field: ESNestedField<Fields, any, any, any>,
  queryCondition: QueryCondition,
  options?: {
    score_mode?: 'avg' | 'max' | 'min' | 'none' | 'sum';
    ignore_unmapped?: boolean;
    inner_hits?: {
      name?: string;
      size?: number;
      from?: number;
      sort?: unknown[];
      _source?: boolean | string[] | { includes?: string[]; excludes?: string[] };
      highlight?: unknown;
    };
  }
): NestedQueryCondition {
  return new NestedQueryCondition(field._getFullPath(), queryCondition, options);
}

export class HasChildCondition implements QueryCondition {
  constructor(
    private readonly type: string,
    private readonly queryCondition: QueryCondition,
    private readonly options: {
      score_mode?: 'avg' | 'max' | 'min' | 'none' | 'sum';
      min_children?: number;
      max_children?: number;
      ignore_unmapped?: boolean;
      inner_hits?: unknown;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {
      type: this.type,
      query: this.queryCondition._toQuery(),
    };

    if (this.options.score_mode) query.score_mode = this.options.score_mode;
    if (this.options.min_children !== undefined) query.min_children = this.options.min_children;
    if (this.options.max_children !== undefined) query.max_children = this.options.max_children;
    if (this.options.ignore_unmapped !== undefined) query.ignore_unmapped = this.options.ignore_unmapped;
    if (this.options.inner_hits) query.inner_hits = this.options.inner_hits;

    return { has_child: query };
  }
}

export function hasChild(
  type: string,
  queryCondition: QueryCondition,
  options?: {
    score_mode?: 'avg' | 'max' | 'min' | 'none' | 'sum';
    min_children?: number;
    max_children?: number;
    ignore_unmapped?: boolean;
    inner_hits?: unknown;
  }
): HasChildCondition {
  return new HasChildCondition(type, queryCondition, options);
}

export class HasParentCondition implements QueryCondition {
  constructor(
    private readonly parentType: string,
    private readonly queryCondition: QueryCondition,
    private readonly options: {
      score?: boolean;
      ignore_unmapped?: boolean;
      inner_hits?: unknown;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {
      parent_type: this.parentType,
      query: this.queryCondition._toQuery(),
    };

    if (this.options.score !== undefined) query.score = this.options.score;
    if (this.options.ignore_unmapped !== undefined) query.ignore_unmapped = this.options.ignore_unmapped;
    if (this.options.inner_hits) query.inner_hits = this.options.inner_hits;

    return { has_parent: query };
  }
}

export function hasParent(
  parentType: string,
  queryCondition: QueryCondition,
  options?: {
    score?: boolean;
    ignore_unmapped?: boolean;
    inner_hits?: unknown;
  }
): HasParentCondition {
  return new HasParentCondition(parentType, queryCondition, options);
}
