# ElasticORM

A type-safe Elasticsearch ORM for TypeScript, inspired by [Drizzle ORM](https://orm.drizzle.team/).

```typescript
import { ElasticORM, esIndex, esText, esKeyword, esInteger, eq, match, bool, must, filter, range } from 'elasticorm';

// Define your schema
const users = esIndex('users', {
  id: esKeyword().notNull(),
  name: esText({ analyzer: 'standard' }),
  email: esKeyword().notNull(),
  age: esInteger(),
});

// Types are inferred automatically
type User = typeof users.$infer;

// Query with full type safety
const results = await db
  .search(users)
  .where(bool(
    must(match(users.name, 'john')),
    filter(range(users.age, { gte: 18 }))
  ))
  .execute();
```

## Features

- **Schema-first design** - Define your Elasticsearch mappings with TypeScript
- **Full type inference** - `$infer` and `$insert` types generated from schema
- **Type-safe queries** - Catch errors at compile time, not runtime
- **Drizzle-like API** - Familiar functional patterns
- **Zero dependencies** - Uses native `fetch`, no bloat
- **ES 8.x support** - Built for modern Elasticsearch

## Installation

```bash
bun add elasticorm
# or
npm install elasticorm
```

## Quick Start

### 1. Define Your Schema

```typescript
import {
  esIndex,
  esText,
  esKeyword,
  esInteger,
  esDate,
  esBoolean,
  esNested
} from 'elasticorm';

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
    country: esKeyword(),
  }),
});

// Infer types from schema
type User = typeof users.$infer;
type InsertUser = typeof users.$insert;
```

### 2. Connect to Elasticsearch

```typescript
import { ElasticORM } from 'elasticorm';

const orm = new ElasticORM({
  node: 'http://localhost:9200',
  // Optional auth:
  // auth: { username: 'elastic', password: 'password' }
  // Or API key:
  // auth: { apiKey: 'your-api-key' }
});

const db = orm.connect({ users });

// Sync schema to Elasticsearch
await db.sync();
```

### 3. CRUD Operations

```typescript
// Create
await db.index(users).values({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
}).execute({ id: '1' });

// Read
const user = await db.get(users, '1');

// Update
await db.update(users, '1').set({
  age: 31,
}).execute();

// Delete
await db.delete(users, '1');

// Bulk operations
await db.bulk(users).index([
  { id: '2', name: 'Jane', email: 'jane@example.com' },
  { id: '3', name: 'Bob', email: 'bob@example.com' },
]).execute();
```

### 4. Type-Safe Queries

```typescript
import { eq, match, range, bool, must, filter, should } from 'elasticorm';

// Simple term query
const results = await db
  .search(users)
  .where(eq(users.email, 'john@example.com'))
  .execute();

// Full-text search
const results = await db
  .search(users)
  .where(match(users.name, 'john doe'))
  .execute();

// Complex bool query
const results = await db
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

// Count
const count = await db
  .search(users)
  .where(eq(users.isActive, true))
  .count();
```

### 5. Aggregations

```typescript
import { terms, avg, sum, dateHistogram } from 'elasticorm';

const results = await db
  .search(users)
  .aggregate({
    avgAge: avg(users.age),
    byCountry: terms(users.address.country, { size: 10 }),
    signupsByMonth: dateHistogram(users.createdAt, {
      calendar_interval: 'month'
    }),
  })
  .size(0)
  .execute();

// Results are fully typed
console.log(results.aggregations.avgAge.value);
console.log(results.aggregations.byCountry.buckets);
```

## API Reference

### Schema Fields

| Function | Elasticsearch Type | TypeScript Type |
|----------|-------------------|-----------------|
| `esText()` | `text` | `string` |
| `esKeyword()` | `keyword` | `string` |
| `esInteger()` | `integer` | `number` |
| `esLong()` | `long` | `number` |
| `esFloat()` | `float` | `number` |
| `esDouble()` | `double` | `number` |
| `esDate()` | `date` | `Date \| string \| number` |
| `esBoolean()` | `boolean` | `boolean` |
| `esNested()` | `nested` | `object` |
| `esObject()` | `object` | `object` |
| `esGeoPoint()` | `geo_point` | `GeoPoint` |
| `esIp()` | `ip` | `string` |
| `esBinary()` | `binary` | `string` |

### Field Modifiers

```typescript
esKeyword()           // Optional field
esKeyword().notNull() // Required field
esKeyword().array()   // Array field
esBoolean().default(true)  // Default value
```

### Query Functions

**Term-level queries:**
- `eq(field, value)` - Exact match
- `inValues(field, values)` - Match any of values
- `exists(field)` - Field exists
- `prefix(field, value)` - Prefix match
- `wildcard(field, pattern)` - Wildcard match
- `regexp(field, pattern)` - Regex match
- `fuzzy(field, value)` - Fuzzy match

**Range queries:**
- `range(field, { gte, lte, gt, lt })` - Range query
- `gt(field, value)` - Greater than
- `gte(field, value)` - Greater than or equal
- `lt(field, value)` - Less than
- `lte(field, value)` - Less than or equal

**Full-text queries:**
- `match(field, query)` - Full-text match
- `matchPhrase(field, query)` - Phrase match
- `multiMatch(fields, query)` - Multi-field match
- `queryString(query)` - Query string syntax

**Compound queries:**
- `bool(clauses...)` - Boolean query
- `must(conditions...)` - Must match (AND)
- `filter(conditions...)` - Filter (no scoring)
- `should(conditions...)` - Should match (OR)
- `mustNot(conditions...)` - Must not match

**Other:**
- `matchAll()` - Match all documents
- `nested(field, query)` - Nested query
- `geoDistance(field, point, distance)` - Geo distance

### Aggregations

**Bucket aggregations:**
- `terms(field)` - Terms aggregation
- `histogram(field, { interval })` - Histogram
- `dateHistogram(field, { calendar_interval })` - Date histogram
- `range(field, ranges)` - Range buckets
- `filterAgg(condition)` - Filter aggregation

**Metric aggregations:**
- `avg(field)` - Average
- `sum(field)` - Sum
- `min(field)` - Minimum
- `max(field)` - Maximum
- `stats(field)` - Statistics
- `cardinality(field)` - Unique count
- `percentiles(field)` - Percentiles
- `topHits()` - Top documents

## Index Management

```typescript
// Create index with mappings
await db.createIndex(users);

// Update mappings
await db.updateMapping(users);

// Check if index exists
const exists = await db.indexExists(users);

// Delete index
await db.deleteIndex(users);

// Sync all schemas (create if not exists, update mappings)
await db.sync();
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run only unit tests
bun run test:unit

# Run integration tests (requires Elasticsearch)
bun run docker:up
bun run test:integration
bun run docker:down

# Type check
bun run typecheck
```

## License

MIT
