import { test, expect, describe } from 'bun:test';
import {
  esIndex,
  esText,
  esKeyword,
  esInteger,
  esDate,
  esBoolean,
  eq,
  inValues,
  exists,
  range,
  gt,
  gte,
  lt,
  lte,
  match,
  matchPhrase,
  multiMatch,
  bool,
  must,
  filter,
  should,
  mustNot,
  matchAll,
  matchNone,
} from '../src/index';

const users = esIndex('users', {
  id: esKeyword().notNull(),
  name: esText({ analyzer: 'standard' }),
  email: esKeyword().notNull(),
  age: esInteger(),
  isActive: esBoolean().default(true),
  createdAt: esDate().default('now'),
});

describe('Term Queries', () => {
  test('eq() creates term query', () => {
    const condition = eq(users.email, 'john@example.com');
    expect(condition._toQuery()).toEqual({
      term: { email: 'john@example.com' },
    });
  });

  test('inValues() creates terms query', () => {
    const condition = inValues(users.email, ['john@example.com', 'jane@example.com']);
    expect(condition._toQuery()).toEqual({
      terms: { email: ['john@example.com', 'jane@example.com'] },
    });
  });

  test('exists() creates exists query', () => {
    const condition = exists(users.age);
    expect(condition._toQuery()).toEqual({
      exists: { field: 'age' },
    });
  });
});

describe('Range Queries', () => {
  test('range() creates range query with multiple bounds', () => {
    const condition = range(users.age, { gte: 18, lte: 65 });
    expect(condition._toQuery()).toEqual({
      range: { age: { gte: 18, lte: 65 } },
    });
  });

  test('gt() creates greater than query', () => {
    const condition = gt(users.age, 18);
    expect(condition._toQuery()).toEqual({
      range: { age: { gt: 18 } },
    });
  });

  test('gte() creates greater than or equal query', () => {
    const condition = gte(users.age, 18);
    expect(condition._toQuery()).toEqual({
      range: { age: { gte: 18 } },
    });
  });

  test('lt() creates less than query', () => {
    const condition = lt(users.age, 65);
    expect(condition._toQuery()).toEqual({
      range: { age: { lt: 65 } },
    });
  });

  test('lte() creates less than or equal query', () => {
    const condition = lte(users.age, 65);
    expect(condition._toQuery()).toEqual({
      range: { age: { lte: 65 } },
    });
  });
});

describe('Full-text Queries', () => {
  test('match() creates match query', () => {
    const condition = match(users.name, 'john doe');
    expect(condition._toQuery()).toEqual({
      match: { name: { query: 'john doe' } },
    });
  });

  test('match() with options', () => {
    const condition = match(users.name, 'john doe', { operator: 'AND', fuzziness: 'AUTO' });
    expect(condition._toQuery()).toEqual({
      match: { name: { query: 'john doe', operator: 'AND', fuzziness: 'AUTO' } },
    });
  });

  test('matchPhrase() creates match_phrase query', () => {
    const condition = matchPhrase(users.name, 'john doe');
    expect(condition._toQuery()).toEqual({
      match_phrase: { name: { query: 'john doe' } },
    });
  });

  test('multiMatch() creates multi_match query', () => {
    const condition = multiMatch([users.name], 'john', { type: 'best_fields' });
    expect(condition._toQuery()).toEqual({
      multi_match: {
        query: 'john',
        fields: ['name'],
        type: 'best_fields',
      },
    });
  });
});

describe('Bool Queries', () => {
  test('bool with must clauses', () => {
    const condition = bool(must(eq(users.isActive, true), gt(users.age, 18)));
    expect(condition._toQuery()).toEqual({
      bool: {
        must: [
          { term: { isActive: true } },
          { range: { age: { gt: 18 } } },
        ],
      },
    });
  });

  test('bool with filter clauses', () => {
    const condition = bool(filter(eq(users.isActive, true)));
    expect(condition._toQuery()).toEqual({
      bool: {
        filter: [{ term: { isActive: true } }],
      },
    });
  });

  test('bool with should clauses', () => {
    const condition = bool(should(eq(users.isActive, true), eq(users.isActive, false)));
    expect(condition._toQuery()).toEqual({
      bool: {
        should: [
          { term: { isActive: true } },
          { term: { isActive: false } },
        ],
      },
    });
  });

  test('bool with mustNot clauses', () => {
    const condition = bool(mustNot(eq(users.isActive, false)));
    expect(condition._toQuery()).toEqual({
      bool: {
        must_not: [{ term: { isActive: false } }],
      },
    });
  });

  test('complex bool query', () => {
    const condition = bool(
      must(match(users.name, 'john')),
      filter(range(users.age, { gte: 18, lte: 65 })),
      should(eq(users.isActive, true)),
      mustNot(eq(users.email, 'banned@example.com'))
    );

    expect(condition._toQuery()).toEqual({
      bool: {
        must: [{ match: { name: { query: 'john' } } }],
        filter: [{ range: { age: { gte: 18, lte: 65 } } }],
        should: [{ term: { isActive: true } }],
        must_not: [{ term: { email: 'banned@example.com' } }],
      },
    });
  });
});

describe('Match All/None', () => {
  test('matchAll() creates match_all query', () => {
    const condition = matchAll();
    expect(condition._toQuery()).toEqual({ match_all: {} });
  });

  test('matchAll() with boost', () => {
    const condition = matchAll(1.5);
    expect(condition._toQuery()).toEqual({ match_all: { boost: 1.5 } });
  });

  test('matchNone() creates match_none query', () => {
    const condition = matchNone();
    expect(condition._toQuery()).toEqual({ match_none: {} });
  });
});
