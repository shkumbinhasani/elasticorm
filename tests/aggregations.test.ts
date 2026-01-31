import { test, expect, describe } from 'bun:test';
import {
  esIndex,
  esKeyword,
  esInteger,
  esDate,
  esBoolean,
  terms,
  histogram,
  dateHistogram,
  avg,
  sum,
  min,
  max,
  stats,
  filterAgg,
  eq,
} from '../src/index.ts';

const products = esIndex('products', {
  id: esKeyword().notNull(),
  name: esKeyword(),
  category: esKeyword(),
  price: esInteger(),
  stock: esInteger(),
  createdAt: esDate(),
  isActive: esBoolean(),
});

describe('Bucket Aggregations', () => {
  test('terms aggregation', () => {
    const agg = terms(products.category, { size: 10 });
    expect(agg._toAggregation()).toEqual({
      terms: {
        field: 'category',
        size: 10,
      },
    });
  });

  test('terms aggregation with sub-aggregations', () => {
    const agg = terms(products.category, { size: 10 }).aggs({
      avgPrice: avg(products.price),
    });
    expect(agg._toAggregation()).toEqual({
      terms: {
        field: 'category',
        size: 10,
      },
      aggs: {
        avgPrice: {
          avg: { field: 'price' },
        },
      },
    });
  });

  test('histogram aggregation', () => {
    const agg = histogram(products.price, { interval: 100 });
    expect(agg._toAggregation()).toEqual({
      histogram: {
        field: 'price',
        interval: 100,
      },
    });
  });

  test('date histogram aggregation', () => {
    const agg = dateHistogram(products.createdAt, {
      calendar_interval: 'month',
      format: 'yyyy-MM',
    });
    expect(agg._toAggregation()).toEqual({
      date_histogram: {
        field: 'createdAt',
        calendar_interval: 'month',
        format: 'yyyy-MM',
      },
    });
  });

  test('filter aggregation', () => {
    const agg = filterAgg(eq(products.isActive, true)).aggs({
      avgPrice: avg(products.price),
    });
    expect(agg._toAggregation()).toEqual({
      filter: { term: { isActive: true } },
      aggs: {
        avgPrice: { avg: { field: 'price' } },
      },
    });
  });
});

describe('Metric Aggregations', () => {
  test('avg aggregation', () => {
    const agg = avg(products.price);
    expect(agg._toAggregation()).toEqual({
      avg: { field: 'price' },
    });
  });

  test('sum aggregation', () => {
    const agg = sum(products.stock);
    expect(agg._toAggregation()).toEqual({
      sum: { field: 'stock' },
    });
  });

  test('min aggregation', () => {
    const agg = min(products.price);
    expect(agg._toAggregation()).toEqual({
      min: { field: 'price' },
    });
  });

  test('max aggregation', () => {
    const agg = max(products.price);
    expect(agg._toAggregation()).toEqual({
      max: { field: 'price' },
    });
  });

  test('stats aggregation', () => {
    const agg = stats(products.price);
    expect(agg._toAggregation()).toEqual({
      stats: { field: 'price' },
    });
  });
});

describe('Nested Aggregations', () => {
  test('multi-level nested aggregations', () => {
    const agg = terms(products.category, { size: 5 }).aggs({
      priceStats: stats(products.price),
      byMonth: dateHistogram(products.createdAt, { calendar_interval: 'month' }).aggs({
        avgPrice: avg(products.price),
      }),
    });

    expect(agg._toAggregation()).toEqual({
      terms: {
        field: 'category',
        size: 5,
      },
      aggs: {
        priceStats: { stats: { field: 'price' } },
        byMonth: {
          date_histogram: {
            field: 'createdAt',
            calendar_interval: 'month',
          },
          aggs: {
            avgPrice: { avg: { field: 'price' } },
          },
        },
      },
    });
  });
});
