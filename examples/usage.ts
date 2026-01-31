import {
  ElasticORM,
  esIndex,
  esText,
  esKeyword,
  esInteger,
  esDate,
  esBoolean,
  esNested,
  esGeoPoint,
  eq,
  match,
  range,
  bool,
  must,
  filter,
  should,
  terms,
  avg,
  dateHistogram,
} from '../src/index';

// 1. Define index schemas (similar to Drizzle tables)
export const users = esIndex('users', {
  id: esKeyword().notNull(),
  name: esText({ analyzer: 'standard' }),
  email: esKeyword().notNull(),
  age: esInteger(),
  isActive: esBoolean().default(true),
  createdAt: esDate().default('now'),
  tags: esKeyword().array(),
  address: esNested({
    street: esText(),
    city: esKeyword(),
    zip: esKeyword(),
  }),
});

export const products = esIndex('products', {
  id: esKeyword().notNull(),
  name: esText({ analyzer: 'standard' }),
  description: esText(),
  price: esInteger().notNull(),
  category: esKeyword().notNull(),
  location: esGeoPoint(),
  createdAt: esDate().default('now'),
});

// 2. Infer types from schema
type User = typeof users.$infer;
type InsertUser = typeof users.$insert;
type Product = typeof products.$infer;

// 3. Setup client
const orm = new ElasticORM({
  node: 'http://localhost:9200',
  // Optional auth:
  // auth: { username: 'elastic', password: 'password' }
  // Or API key:
  // auth: { apiKey: 'your-api-key' }
});

// 4. Connect with schemas
const db = orm.connect({ users, products });

async function main() {
  // Sync schemas to Elasticsearch (create indexes if not exist, update mappings)
  await db.sync();

  // Index a document (type-safe)
  await db.index(users).values({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    tags: ['admin', 'developer'],
    address: {
      street: '123 Main St',
      city: 'New York',
      zip: '10001',
    },
  }).execute();

  // Get by ID
  const user = await db.get(users, '1');
  console.log('User:', user);

  // Update document
  await db.update(users, '1').set({
    age: 31,
    isActive: false,
  }).execute();

  // Bulk operations
  await db.bulk(users).index([
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
  ]).execute();

  // Simple queries
  const results = await db
    .search(users)
    .where(eq(users.email, 'john@example.com'))
    .execute();

  console.log('Search results:', results.hits.hits);

  // Complex bool queries
  const complexResults = await db
    .search(users)
    .where(
      bool(
        must(match(users.name, 'john')),
        filter(range(users.age, { gte: 18, lte: 65 })),
        should(eq(users.isActive, true))
      )
    )
    .size(10)
    .from(0)
    .sort(users.createdAt, 'desc')
    .execute();

  console.log('Complex search results:', complexResults.hits.total);

  // Select specific fields using source filter
  const partialResults = await db
    .search(users)
    .where(eq(users.isActive, true))
    .source(['name', 'email'])
    .execute();

  console.log('Partial results:', partialResults.hits.hits);

  // Aggregations
  const aggResults = await db
    .search(users)
    .aggregate({
      avgAge: avg(users.age),
      byMonth: dateHistogram(users.createdAt, { calendar_interval: 'month' }),
    })
    .size(0) // No hits needed, just aggregations
    .execute();

  console.log('Aggregations:', aggResults.aggregations);

  // Count documents
  const count = await db
    .search(users)
    .where(eq(users.isActive, true))
    .count();

  console.log('Active users count:', count);

  // Delete document
  await db.delete(users, '1');

  // Check if index exists
  const exists = await db.indexExists(users);
  console.log('Users index exists:', exists);
}

main().catch(console.error);
