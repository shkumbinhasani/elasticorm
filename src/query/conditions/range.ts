import type { ESField } from '../../schema/fields/base';
import type { QueryCondition } from '../types';

type RangeValue = number | Date | string;

export interface RangeOptions<T extends RangeValue> {
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  format?: string;
  time_zone?: string;
  relation?: 'INTERSECTS' | 'CONTAINS' | 'WITHIN';
  boost?: number;
}

export class RangeCondition<T extends RangeValue> implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly options: RangeOptions<T>
  ) {}

  _toQuery(): Record<string, unknown> {
    const rangeQuery: Record<string, unknown> = {};

    if (this.options.gt !== undefined) rangeQuery.gt = this.serializeValue(this.options.gt);
    if (this.options.gte !== undefined) rangeQuery.gte = this.serializeValue(this.options.gte);
    if (this.options.lt !== undefined) rangeQuery.lt = this.serializeValue(this.options.lt);
    if (this.options.lte !== undefined) rangeQuery.lte = this.serializeValue(this.options.lte);
    if (this.options.format) rangeQuery.format = this.options.format;
    if (this.options.time_zone) rangeQuery.time_zone = this.options.time_zone;
    if (this.options.relation) rangeQuery.relation = this.options.relation;
    if (this.options.boost !== undefined) rangeQuery.boost = this.options.boost;

    return {
      range: {
        [this.field]: rangeQuery,
      },
    };
  }

  private serializeValue(value: T): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
}

type FieldRangeValue<F> = F extends ESField<infer T, any, any, any, any>
  ? T extends number | Date | string
    ? T
    : never
  : never;

export function range<F extends ESField<number | Date | string, any, any, any, any>>(
  field: F,
  options: RangeOptions<NonNullable<FieldRangeValue<F>>>
): RangeCondition<NonNullable<FieldRangeValue<F>>> {
  return new RangeCondition(field._getFullPath(), options);
}

export function gt<F extends ESField<number | Date | string, any, any, any, any>>(
  field: F,
  value: NonNullable<FieldRangeValue<F>>
): RangeCondition<NonNullable<FieldRangeValue<F>>> {
  return new RangeCondition(field._getFullPath(), { gt: value });
}

export function gte<F extends ESField<number | Date | string, any, any, any, any>>(
  field: F,
  value: NonNullable<FieldRangeValue<F>>
): RangeCondition<NonNullable<FieldRangeValue<F>>> {
  return new RangeCondition(field._getFullPath(), { gte: value });
}

export function lt<F extends ESField<number | Date | string, any, any, any, any>>(
  field: F,
  value: NonNullable<FieldRangeValue<F>>
): RangeCondition<NonNullable<FieldRangeValue<F>>> {
  return new RangeCondition(field._getFullPath(), { lt: value });
}

export function lte<F extends ESField<number | Date | string, any, any, any, any>>(
  field: F,
  value: NonNullable<FieldRangeValue<F>>
): RangeCondition<NonNullable<FieldRangeValue<F>>> {
  return new RangeCondition(field._getFullPath(), { lte: value });
}
