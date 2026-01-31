import { test, expect, describe } from 'bun:test';
import {
  esIndex,
  esText,
  esKeyword,
  esInteger,
  esLong,
  esDate,
  esBoolean,
  esNested,
  esObject,
  esGeoPoint,
  esIp,
} from '../src/index.ts';

describe('Schema Definition', () => {
  test('creates basic index with fields', () => {
    const users = esIndex('users', {
      id: esKeyword().notNull(),
      name: esText({ analyzer: 'standard' }),
      email: esKeyword().notNull(),
      age: esInteger(),
      isActive: esBoolean().default(true),
      createdAt: esDate().default('now'),
    });

    expect(users.$name).toBe('users');
    expect(users.id.$esType).toBe('keyword');
    expect(users.name.$esType).toBe('text');
    expect(users.email.$esType).toBe('keyword');
    expect(users.age.$esType).toBe('integer');
    expect(users.isActive.$esType).toBe('boolean');
    expect(users.createdAt.$esType).toBe('date');
  });

  test('generates correct mappings', () => {
    const users = esIndex('users', {
      id: esKeyword().notNull(),
      name: esText({ analyzer: 'standard' }),
      age: esInteger(),
    });

    const mappings = users._toMappings();
    expect(mappings.properties).toEqual({
      id: { type: 'keyword' },
      name: { type: 'text', analyzer: 'standard' },
      age: { type: 'integer' },
    });
  });

  test('supports nested fields', () => {
    const users = esIndex('users', {
      id: esKeyword().notNull(),
      address: esNested({
        street: esText(),
        city: esKeyword(),
        zip: esKeyword(),
      }),
    });

    const mappings = users._toMappings();
    expect(mappings.properties.address).toEqual({
      type: 'nested',
      properties: {
        street: { type: 'text' },
        city: { type: 'keyword' },
        zip: { type: 'keyword' },
      },
    });
  });

  test('supports object fields', () => {
    const users = esIndex('users', {
      id: esKeyword().notNull(),
      metadata: esObject({
        createdBy: esKeyword(),
        updatedBy: esKeyword(),
      }),
    });

    const mappings = users._toMappings();
    expect(mappings.properties.metadata).toEqual({
      type: 'object',
      properties: {
        createdBy: { type: 'keyword' },
        updatedBy: { type: 'keyword' },
      },
    });
  });

  test('supports array fields', () => {
    const users = esIndex('users', {
      id: esKeyword().notNull(),
      tags: esKeyword().array(),
    });

    expect(users.tags.$isArray).toBe(true);
  });

  test('supports geo fields', () => {
    const locations = esIndex('locations', {
      id: esKeyword().notNull(),
      location: esGeoPoint(),
    });

    const mappings = locations._toMappings();
    expect(mappings.properties.location).toEqual({ type: 'geo_point' });
  });

  test('supports IP fields', () => {
    const logs = esIndex('logs', {
      id: esKeyword().notNull(),
      clientIp: esIp(),
    });

    const mappings = logs._toMappings();
    expect(mappings.properties.clientIp).toEqual({ type: 'ip' });
  });

  test('generates complete index body with settings', () => {
    const users = esIndex(
      'users',
      {
        id: esKeyword().notNull(),
        name: esText(),
      },
      {
        number_of_shards: 3,
        number_of_replicas: 2,
      }
    );

    const body = users._toIndexBody();
    expect(body.settings).toEqual({
      number_of_shards: 3,
      number_of_replicas: 2,
    });
    expect(body.mappings.properties).toEqual({
      id: { type: 'keyword' },
      name: { type: 'text' },
    });
  });
});

describe('Type Inference', () => {
  test('infers document type correctly', () => {
    const users = esIndex('users', {
      id: esKeyword().notNull(),
      name: esText(),
      age: esInteger(),
      isActive: esBoolean().default(true),
      tags: esKeyword().array(),
    });

    type User = typeof users.$infer;

    const user: User = {
      id: '1',
      name: 'John',
      age: 30,
      isActive: true,
      tags: ['admin', 'user'],
    };

    expect(user.id).toBe('1');
  });

  test('infers insert type correctly with optional fields', () => {
    const users = esIndex('users', {
      id: esKeyword().notNull(),
      name: esText(),
      createdAt: esDate().default('now'),
    });

    type InsertUser = typeof users.$insert;

    const insertUser: InsertUser = {
      id: '1',
    };

    expect(insertUser.id).toBe('1');
  });
});
