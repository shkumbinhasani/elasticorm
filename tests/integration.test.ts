import { test, expect, describe, beforeAll, afterAll } from 'bun:test';
import {
  ElasticORM,
  esIndex,
  esText,
  esKeyword,
  esInteger,
  esDate,
  esBoolean,
  esNested,
  eq,
  match,
  range,
  bool,
  must,
  filter,
  should,
  terms,
  avg,
  sum,
  dateHistogram,
  matchAll,
} from '../src/index';

const ES_URL = process.env.ES_URL || 'http://localhost:9201';

// Define test schemas
const users = esIndex('test_users', {
  id: esKeyword().notNull(),
  name: esText({ analyzer: 'standard' }),
  email: esKeyword().notNull(),
  age: esInteger(),
  salary: esInteger(),
  isActive: esBoolean().default(true),
  createdAt: esDate().default('now'),
  tags: esKeyword().array(),
  address: esNested({
    city: esKeyword(),
    country: esKeyword(),
  }),
});

type User = typeof users.$infer;

const orm = new ElasticORM({ node: ES_URL });
const db = orm.connect({ users });

async function waitForES(maxRetries = 30): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${ES_URL}/_cluster/health`);
      if (response.ok) {
        const health = await response.json() as { status: string };
        if (health.status === 'green' || health.status === 'yellow') {
          return true;
        }
      }
    } catch {
      // ES not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

describe('Integration Tests', () => {
  beforeAll(async () => {
    const esReady = await waitForES();
    if (!esReady) {
      throw new Error('Elasticsearch not available. Run: docker-compose up -d');
    }

    // Clean up and create fresh index
    try {
      await db.deleteIndex(users);
    } catch {
      // Index might not exist
    }

    await db.createIndex(users);

    // Wait for index to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    try {
      await db.deleteIndex(users);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('CRUD Operations', () => {
    test('index and get document', async () => {
      await db.index(users).values({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        salary: 50000,
        isActive: true,
        tags: ['developer', 'admin'],
        address: {
          city: 'New York',
          country: 'USA',
        },
      }).execute({ id: 'user-1', refresh: true });

      const user = await db.get(users, 'user-1');

      expect(user).not.toBeNull();
      expect(user!.id).toBe('user-1');
      expect(user!.name).toBe('John Doe');
      expect(user!.email).toBe('john@example.com');
      expect(user!.age).toBe(30);
      expect(user!.tags).toEqual(['developer', 'admin']);
    });

    test('update document', async () => {
      await db.update(users, 'user-1').set({
        age: 31,
        isActive: false,
      }).execute({ refresh: true });

      const user = await db.get(users, 'user-1');

      expect(user!.age).toBe(31);
      expect(user!.isActive).toBe(false);
    });

    test('get non-existent document returns null', async () => {
      const user = await db.get(users, 'non-existent-id');
      expect(user).toBeNull();
    });

    test('bulk index documents', async () => {
      await db.bulk(users).index([
        { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', age: 25, salary: 60000 },
        { id: 'user-3', name: 'Bob Wilson', email: 'bob@example.com', age: 35, salary: 70000 },
        { id: 'user-4', name: 'Alice Brown', email: 'alice@example.com', age: 28, salary: 55000 },
        { id: 'user-5', name: 'Charlie Davis', email: 'charlie@example.com', age: 40, salary: 80000 },
      ]).execute({ refresh: true });

      const results = await db.mget(users, ['user-2', 'user-3', 'user-4', 'user-5']);

      expect(results.filter((r) => r !== null)).toHaveLength(4);
      expect(results[0]!.name).toBe('Jane Smith');
      expect(results[1]!.name).toBe('Bob Wilson');
    });

    test('delete document', async () => {
      await db.index(users).values({
        id: 'to-delete',
        email: 'delete@example.com',
      }).execute({ id: 'to-delete', refresh: true });

      const beforeDelete = await db.get(users, 'to-delete');
      expect(beforeDelete).not.toBeNull();

      await db.delete(users, 'to-delete', { refresh: true });

      const afterDelete = await db.get(users, 'to-delete');
      expect(afterDelete).toBeNull();
    });
  });

  describe('Search Queries', () => {
    test('match all query', async () => {
      const results = await db
        .search(users)
        .where(matchAll())
        .execute();

      expect(results.hits.total.value).toBeGreaterThanOrEqual(4);
    });

    test('term query (eq)', async () => {
      const results = await db
        .search(users)
        .where(eq(users.email, 'jane@example.com'))
        .execute();

      expect(results.hits.hits).toHaveLength(1);
      expect(results.hits.hits[0]?._source.email).toBe('jane@example.com');
    });

    test('match query (full-text)', async () => {
      const results = await db
        .search(users)
        .where(match(users.name, 'john'))
        .execute();

      expect(results.hits.hits.length).toBeGreaterThanOrEqual(1);
      expect(results.hits.hits[0]?._source.name?.toLowerCase()).toContain('john');
    });

    test('range query', async () => {
      const results = await db
        .search(users)
        .where(range(users.age, { gte: 30, lte: 40 }))
        .execute();

      expect(results.hits.hits.length).toBeGreaterThanOrEqual(1);
      for (const hit of results.hits.hits) {
        expect(hit._source.age).toBeGreaterThanOrEqual(30);
        expect(hit._source.age).toBeLessThanOrEqual(40);
      }
    });

    test('bool query with must and filter', async () => {
      const results = await db
        .search(users)
        .where(
          bool(
            must(match(users.name, 'john')),
            filter(range(users.age, { gte: 25 }))
          )
        )
        .execute();

      expect(results.hits.hits.length).toBeGreaterThanOrEqual(1);
    });

    test('pagination with size and from', async () => {
      const page1 = await db
        .search(users)
        .where(matchAll())
        .size(2)
        .from(0)
        .sort(users.age, 'asc')
        .execute();

      const page2 = await db
        .search(users)
        .where(matchAll())
        .size(2)
        .from(2)
        .sort(users.age, 'asc')
        .execute();

      expect(page1.hits.hits).toHaveLength(2);
      expect(page2.hits.hits.length).toBeGreaterThanOrEqual(1);

      // Ensure different results
      const page1Ids = page1.hits.hits.map((h) => h._id);
      const page2Ids = page2.hits.hits.map((h) => h._id);
      expect(page1Ids.some((id) => page2Ids.includes(id))).toBe(false);
    });

    test('sorting', async () => {
      const results = await db
        .search(users)
        .where(matchAll())
        .sort(users.age, 'desc')
        .execute();

      const ages = results.hits.hits.map((h) => h._source.age).filter((a) => a !== undefined);
      for (let i = 1; i < ages.length; i++) {
        expect(ages[i]!).toBeLessThanOrEqual(ages[i - 1]!);
      }
    });

    test('source filtering', async () => {
      const results = await db
        .search(users)
        .where(eq(users.email, 'jane@example.com'))
        .source(['name', 'email'])
        .execute();

      expect(results.hits.hits[0]?._source.name).toBeDefined();
      expect(results.hits.hits[0]?._source.email).toBeDefined();
      // age should not be in source
      expect((results.hits.hits[0]?._source as any).age).toBeUndefined();
    });

    test('count query', async () => {
      const count = await db
        .search(users)
        .where(matchAll())
        .count();

      expect(count).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Aggregations', () => {
    test('avg aggregation', async () => {
      const results = await db
        .search(users)
        .aggregate({
          avgAge: avg(users.age),
        })
        .size(0)
        .execute();

      expect(results.aggregations).toBeDefined();
      expect(results.aggregations!.avgAge.value).toBeGreaterThan(0);
    });

    test('sum aggregation', async () => {
      const results = await db
        .search(users)
        .aggregate({
          totalSalary: sum(users.salary),
        })
        .size(0)
        .execute();

      expect(results.aggregations!.totalSalary.value).toBeGreaterThan(0);
    });

    test('terms aggregation', async () => {
      // Add some users with different emails for grouping
      await db.bulk(users).index([
        { id: 'agg-1', email: 'group1@test.com', age: 20 },
        { id: 'agg-2', email: 'group1@test.com', age: 25 },
        { id: 'agg-3', email: 'group2@test.com', age: 30 },
      ]).execute({ refresh: true });

      const results = await db
        .search(users)
        .aggregate({
          byEmail: terms(users.email, { size: 10 }),
        })
        .size(0)
        .execute();

      expect(results.aggregations!.byEmail.buckets.length).toBeGreaterThanOrEqual(1);
    });

    test('multiple aggregations', async () => {
      const results = await db
        .search(users)
        .aggregate({
          avgAge: avg(users.age),
          avgSalary: avg(users.salary),
          totalSalary: sum(users.salary),
        })
        .size(0)
        .execute();

      expect(results.aggregations!.avgAge.value).toBeDefined();
      expect(results.aggregations!.avgSalary.value).toBeDefined();
      expect(results.aggregations!.totalSalary.value).toBeDefined();
    });
  });

  describe('Index Management', () => {
    test('index exists', async () => {
      const exists = await db.indexExists(users);
      expect(exists).toBe(true);
    });

    test('create and delete index', async () => {
      const tempIndex = esIndex('temp_test_index', {
        id: esKeyword().notNull(),
        value: esInteger(),
      });

      const tempDb = orm.connect({ tempIndex });

      // Create
      await tempDb.createIndex(tempIndex);
      let exists = await tempDb.indexExists(tempIndex);
      expect(exists).toBe(true);

      // Delete
      await tempDb.deleteIndex(tempIndex);
      exists = await tempDb.indexExists(tempIndex);
      expect(exists).toBe(false);
    });
  });
});
