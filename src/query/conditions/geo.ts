import type { ESField } from '../../schema/fields/base';
import type { QueryCondition } from '../types';
import type { GeoPoint } from '../../schema/types';

export class GeoBoundingBoxCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly boundingBox: {
      top_left: GeoPoint;
      bottom_right: GeoPoint;
    } | {
      top_right: GeoPoint;
      bottom_left: GeoPoint;
    } | {
      wkt: string;
    },
    private readonly options: {
      validation_method?: 'STRICT' | 'IGNORE_MALFORMED' | 'COERCE';
      type?: 'memory' | 'indexed';
      ignore_unmapped?: boolean;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {
      [this.field]: this.boundingBox,
    };

    if (this.options.validation_method) query.validation_method = this.options.validation_method;
    if (this.options.type) query.type = this.options.type;
    if (this.options.ignore_unmapped !== undefined) query.ignore_unmapped = this.options.ignore_unmapped;

    return { geo_bounding_box: query };
  }
}

export class GeoDistanceCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly point: GeoPoint,
    private readonly distance: string,
    private readonly options: {
      distance_type?: 'arc' | 'plane';
      validation_method?: 'STRICT' | 'IGNORE_MALFORMED' | 'COERCE';
      ignore_unmapped?: boolean;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {
      distance: this.distance,
      [this.field]: this.point,
    };

    if (this.options.distance_type) query.distance_type = this.options.distance_type;
    if (this.options.validation_method) query.validation_method = this.options.validation_method;
    if (this.options.ignore_unmapped !== undefined) query.ignore_unmapped = this.options.ignore_unmapped;

    return { geo_distance: query };
  }
}

export class GeoPolygonCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly points: GeoPoint[],
    private readonly options: {
      validation_method?: 'STRICT' | 'IGNORE_MALFORMED' | 'COERCE';
      ignore_unmapped?: boolean;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = {
      [this.field]: {
        points: this.points,
      },
    };

    if (this.options.validation_method) query.validation_method = this.options.validation_method;
    if (this.options.ignore_unmapped !== undefined) query.ignore_unmapped = this.options.ignore_unmapped;

    return { geo_polygon: query };
  }
}

export class GeoShapeCondition implements QueryCondition {
  constructor(
    private readonly field: string,
    private readonly shape: {
      type: string;
      coordinates: unknown;
    } | {
      indexed_shape: {
        index: string;
        id: string;
        path?: string;
        routing?: string;
      };
    },
    private readonly options: {
      relation?: 'INTERSECTS' | 'DISJOINT' | 'WITHIN' | 'CONTAINS';
      ignore_unmapped?: boolean;
    } = {}
  ) {}

  _toQuery(): Record<string, unknown> {
    const fieldQuery: Record<string, unknown> = {
      shape: this.shape,
    };

    if (this.options.relation) fieldQuery.relation = this.options.relation;

    const query: Record<string, unknown> = {
      [this.field]: fieldQuery,
    };

    if (this.options.ignore_unmapped !== undefined) query.ignore_unmapped = this.options.ignore_unmapped;

    return { geo_shape: query };
  }
}

export function geoBoundingBox<F extends ESField<GeoPoint, 'geo_point', any, any, any>>(
  field: F,
  boundingBox: {
    top_left: GeoPoint;
    bottom_right: GeoPoint;
  } | {
    top_right: GeoPoint;
    bottom_left: GeoPoint;
  } | {
    wkt: string;
  },
  options?: {
    validation_method?: 'STRICT' | 'IGNORE_MALFORMED' | 'COERCE';
    type?: 'memory' | 'indexed';
    ignore_unmapped?: boolean;
  }
): GeoBoundingBoxCondition {
  return new GeoBoundingBoxCondition(field._getFullPath(), boundingBox, options);
}

export function geoDistance<F extends ESField<GeoPoint, 'geo_point', any, any, any>>(
  field: F,
  point: GeoPoint,
  distance: string,
  options?: {
    distance_type?: 'arc' | 'plane';
    validation_method?: 'STRICT' | 'IGNORE_MALFORMED' | 'COERCE';
    ignore_unmapped?: boolean;
  }
): GeoDistanceCondition {
  return new GeoDistanceCondition(field._getFullPath(), point, distance, options);
}

export function geoPolygon<F extends ESField<GeoPoint, 'geo_point', any, any, any>>(
  field: F,
  points: GeoPoint[],
  options?: {
    validation_method?: 'STRICT' | 'IGNORE_MALFORMED' | 'COERCE';
    ignore_unmapped?: boolean;
  }
): GeoPolygonCondition {
  return new GeoPolygonCondition(field._getFullPath(), points, options);
}

export function geoShape<F extends ESField<any, 'geo_shape', any, any, any>>(
  field: F,
  shape: {
    type: string;
    coordinates: unknown;
  } | {
    indexed_shape: {
      index: string;
      id: string;
      path?: string;
      routing?: string;
    };
  },
  options?: {
    relation?: 'INTERSECTS' | 'DISJOINT' | 'WITHIN' | 'CONTAINS';
    ignore_unmapped?: boolean;
  }
): GeoShapeCondition {
  return new GeoShapeCondition(field._getFullPath(), shape, options);
}
