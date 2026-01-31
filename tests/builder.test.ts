import { test, expect, describe, mock } from 'bun:test';
import {
  esIndex,
  esText,
  esKeyword,
  esInteger,
  esDate,
  esBoolean,
  esGeoPoint,
  ElasticORM,
  eq,
  bool,
  must,
  filter,
  range,
  match,
  avg,
  terms,
} from '../src/index';

const users = esIndex('users', {
  id: esKeyword().notNull(),
  name: esText({ analyzer: 'standard' }),
  email: esKeyword().notNull(),
  age: esInteger(),
  isActive: esBoolean().default(true),
  createdAt: esDate().default('now'),
});

const locations = esIndex('locations', {
  id: esKeyword().notNull(),
  name: esText(),
  location: esGeoPoint(),
});

const profiles = esIndex('profiles', {
  id: esKeyword().notNull(),
  bio: esText(),
  website: esKeyword(),
});

describe('SearchBuilder', () => {
  test('builds simple query', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db.search(users).where(eq(users.email, 'john@example.com'));
    const query = builder._buildQuery();

    expect(query).toEqual({
      query: {
        term: { email: 'john@example.com' },
      },
    });
  });

  test('builds query with size and from', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db
      .search(users)
      .where(eq(users.isActive, true))
      .size(10)
      .from(20);

    const query = builder._buildQuery();

    expect(query).toEqual({
      query: { term: { isActive: true } },
      size: 10,
      from: 20,
    });
  });

  test('builds query with sorting', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db
      .search(users)
      .sort(users.createdAt, 'desc')
      .sort(users.name, 'asc');

    const query = builder._buildQuery();

    expect(query).toEqual({
      sort: [
        { createdAt: { order: 'desc' } },
        { name: { order: 'asc' } },
      ],
    });
  });

  test('builds query with source filtering', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db
      .search(users)
      .source(['name', 'email']);

    const query = builder._buildQuery();

    expect(query).toEqual({
      _source: ['name', 'email'],
    });
  });

  test('builds complex bool query', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db
      .search(users)
      .where(
        bool(
          must(match(users.name, 'john')),
          filter(range(users.age, { gte: 18, lte: 65 }))
        )
      )
      .size(10)
      .from(0);

    const query = builder._buildQuery();

    expect(query).toEqual({
      query: {
        bool: {
          must: [{ match: { name: { query: 'john' } } }],
          filter: [{ range: { age: { gte: 18, lte: 65 } } }],
        },
      },
      size: 10,
      from: 0,
    });
  });

  test('builds query with aggregations', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db
      .search(users)
      .aggregate({
        avgAge: avg(users.age),
      });

    const query = builder._buildQuery();

    expect(query).toEqual({
      aggs: {
        avgAge: { avg: { field: 'age' } },
      },
    });
  });

  test('builds query with highlight', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db
      .search(users)
      .where(match(users.name, 'john'))
      .highlight({
        fields: {
          name: { fragment_size: 150, number_of_fragments: 3 },
        },
      });

    const query = builder._buildQuery();

    expect(query).toEqual({
      query: { match: { name: { query: 'john' } } },
      highlight: {
        fields: {
          name: { fragment_size: 150, number_of_fragments: 3 },
        },
      },
    });
  });

  test('builds query with trackTotalHits', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db.search(users).trackTotalHits(true);
    const query = builder._buildQuery();

    expect(query).toEqual({
      track_total_hits: true,
    });
  });

  test('builds query with minScore', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const builder = db.search(users).minScore(0.5);
    const query = builder._buildQuery();

    expect(query).toEqual({
      min_score: 0.5,
    });
  });

  test('builds query with geo distance sort', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ locations });

    const builder = db
      .search(locations)
      .sortGeoDistance(locations.location, { lat: 40.7128, lon: -74.0060 }, {
        order: 'asc',
        unit: 'km',
      });

    const query = builder._buildQuery();

    expect(query).toEqual({
      sort: [
        {
          _geo_distance: {
            location: { lat: 40.7128, lon: -74.0060 },
            order: 'asc',
            unit: 'km',
          },
        },
      ],
    });
  });

  test('builds query with raw sort', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ locations });

    const builder = db
      .search(locations)
      .sortRaw({
        _geo_distance: {
          location: { lat: 40.7, lon: -74 },
          order: 'asc',
          unit: 'mi',
          distance_type: 'arc',
        },
      });

    const query = builder._buildQuery();

    expect(query).toEqual({
      sort: [
        {
          _geo_distance: {
            location: { lat: 40.7, lon: -74 },
            order: 'asc',
            unit: 'mi',
            distance_type: 'arc',
          },
        },
      ],
    });
  });

  test('match() works on keyword fields', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    // This should compile without error - match on keyword field
    const builder = db
      .search(users)
      .where(match(users.email, 'john@example'));

    const query = builder._buildQuery();

    expect(query).toEqual({
      query: {
        match: { email: { query: 'john@example' } },
      },
    });
  });

  test('search returns narrowed type for specific index (issue #5)', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    // Connect with multiple indices
    const db = orm.connect({ users, profiles });

    // When searching users, the builder should be typed for users only
    const userBuilder = db.search(users);
    const userQuery = userBuilder._buildQuery();

    // When searching profiles, the builder should be typed for profiles only
    const profileBuilder = db.search(profiles);
    const profileQuery = profileBuilder._buildQuery();

    // This is mainly a compile-time check - if types weren't narrowed,
    // we'd get union types. The test verifies the code compiles correctly.
    expect(userQuery).toBeDefined();
    expect(profileQuery).toBeDefined();
  });
});

describe('IndexOperation', () => {
  test('creates index operation with values', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const indexOp = db.index(users).values({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    });

    expect(indexOp).toBeDefined();
  });
});

describe('UpdateOperation', () => {
  test('creates update operation with set', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const updateOp = db.update(users, '1').set({ age: 31 });

    expect(updateOp).toBeDefined();
  });

  test('creates update operation with script', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const updateOp = db
      .update(users, '1')
      .script('ctx._source.age += params.inc', { inc: 1 });

    expect(updateOp).toBeDefined();
  });
});

describe('BulkOperation', () => {
  test('creates bulk operation with index', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const bulkOp = db.bulk(users).index([
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' },
    ]);

    expect(bulkOp).toBeDefined();
  });

  test('creates bulk operation with delete', () => {
    const orm = new ElasticORM({ node: 'http://localhost:9200' });
    const db = orm.connect({ users });

    const bulkOp = db.bulk(users).delete(['1', '2', '3']);

    expect(bulkOp).toBeDefined();
  });
});
