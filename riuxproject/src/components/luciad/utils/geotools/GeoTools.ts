import * as GeodesyFactory from "@luciad/ria/geodesy/GeodesyFactory";
import { LineType } from "@luciad/ria/geodesy/LineType";
import { GeoJsonCodec } from "@luciad/ria/model/codec/GeoJsonCodec";
import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import { Bounds } from "@luciad/ria/shape/Bounds";
import { Point } from "@luciad/ria/shape/Point";
import { Shape } from "@luciad/ria/shape/Shape";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import * as TransformationFactory from "@luciad/ria/transformation/TransformationFactory";
import { CoordinateReference } from "@luciad/ria/reference/CoordinateReference";
import { Transformation } from "@luciad/ria/transformation/Transformation";

const reference = ReferenceProvider.getReference("CRS:84");
const GEODESY = GeodesyFactory.createSphericalGeodesy(reference);
const geoJSONCodec = new GeoJsonCodec({generateIDs: true});

interface GeoJSONGeometry {
    type: string;
    coordinates?: any;
    geometries?: GeoJSONGeometry[];
}

export enum GeoToolsUnitsEnum {
    METERS="m",
    FEET="ft",
    KILOMETERS="km",
    MILES="mi",
    NAUTICALMILES="nm",
    YARDS="yd",
}

const GeoToolsUnitsMappingFactor = {} as any;
GeoToolsUnitsMappingFactor[GeoToolsUnitsEnum.METERS] = 1;
GeoToolsUnitsMappingFactor[GeoToolsUnitsEnum.KILOMETERS] = 1000;
GeoToolsUnitsMappingFactor[GeoToolsUnitsEnum.FEET] = 0.30478512648;
GeoToolsUnitsMappingFactor[GeoToolsUnitsEnum.MILES] = 1609.344;
GeoToolsUnitsMappingFactor[GeoToolsUnitsEnum.NAUTICALMILES] = 1852;
GeoToolsUnitsMappingFactor[GeoToolsUnitsEnum.YARDS] = 0.91440000028; // 0.91407678245;

class GeoTools {
    constructor() {}

    public createDiscreteCircle_SHORTEST_DISTANCE(point: Point, radius: number, slices: number) {
        const delta = 360 / slices;
        // const newPoint  = GEODESY.interpolate(point, radius, 0, LineType.SHORTEST_DISTANCE);

        let angle = 0;
        const points = [];
        for (let i=0; i<slices; ++i) {
            const newPoint  = GEODESY.interpolate(point, radius, angle, LineType.SHORTEST_DISTANCE);
            angle += delta;
            points.push(newPoint);
        }
        return  ShapeFactory.createPolygon(point.reference, points);
    }

    public createGeoJSONShapeFromBounds(bounds: Bounds) {
        const points = [];
        points.push(ShapeFactory.createPoint(bounds.reference, [bounds.x, bounds.y]));
        points.push(ShapeFactory.createPoint(bounds.reference, [bounds.x+bounds.width, bounds.y]));
        points.push(ShapeFactory.createPoint(bounds.reference, [bounds.x+bounds.width, bounds.y+bounds.height]));
        points.push(ShapeFactory.createPoint(bounds.reference, [bounds.x, bounds.y+bounds.height]));
        const newShape = ShapeFactory.createPolygon(bounds.reference, points);
        return newShape;
    }

    public createBuffer(point: Point, width: number, height: number) {
        const points = [];
        const newPoint1  = GEODESY.interpolate(point, width, -90, LineType.SHORTEST_DISTANCE);
        const newPoint2  = GEODESY.interpolate(point, width, +90, LineType.SHORTEST_DISTANCE);
        const newPoint3  = GEODESY.interpolate(point, height, 0, LineType.SHORTEST_DISTANCE);
        const newPoint4  = GEODESY.interpolate(point, height, 180, LineType.SHORTEST_DISTANCE);

        points.push(ShapeFactory.createPoint( point.reference, [newPoint1.x, newPoint3.y]));
        points.push(ShapeFactory.createPoint( point.reference, [newPoint2.x, newPoint3.y]));
        points.push(ShapeFactory.createPoint( point.reference, [newPoint2.x, newPoint4.y]));
        points.push(ShapeFactory.createPoint( point.reference, [newPoint1.x, newPoint4.y]));
       // points.push(ShapeFactory.createPoint( point.reference, [newPoint1.x, newPoint3.y]));
        return  ShapeFactory.createPolygon(point.reference, points);
    }

    public isNativeGeoJSONReference(testReference: CoordinateReference): boolean {
        if (testReference.name === "WGS_1984" && (testReference.identifier.includes("CRS84") || testReference.identifier.includes("CRS:84")))  { return true; }
        if (testReference.identifier.includes("EPSG:4326")) { return true; }
        return false;
    }

    public reprojectShape(shape: Shape, targetProjection?: string) {
        // When no targetProjection Specified then default to CRS:84 (EPSG:4326);
        targetProjection =  targetProjection ?  targetProjection : "EPSG:4326";
        targetProjection = targetProjection==="CRS:84" ? "EPSG:4326" : targetProjection;
        const sourceProjection = shape.reference.name === "WGS_1984" && shape.reference.identifier.includes("CRS84") ? "EPSG:4326" : shape.reference.identifier;
        const targetReference = ReferenceProvider.getReference(targetProjection);
        if ( sourceProjection === targetProjection) {
            const geometry = (geoJSONCodec as any).encodeShape(shape);
            const newShape = (geoJSONCodec as any).decodeGeometryObject(geometry, targetReference);
            return shape;
        } else {
            const transformer = TransformationFactory.createTransformation(shape.reference, targetReference);

            const geometry = (geoJSONCodec as any).encodeShape(shape);
            const newGeometry = this.recursiveTransformation(geometry, shape.reference, transformer);
            const newShape = (geoJSONCodec as any).decodeGeometryObject(newGeometry, targetReference);
            return newShape;
        }
    }

    public MetersToUnits(meters: number, units: GeoToolsUnitsEnum) {
        const factor = GeoToolsUnitsMappingFactor[units];
        if (factor) {
            return meters / factor
        } else {
            return NaN;
        }
    }

    public UnitsToMeters(value: number, units: GeoToolsUnitsEnum) {
        const factor = GeoToolsUnitsMappingFactor[units];
        if (factor) {
            return value * factor;
        } else {
            return NaN;
        }
    }

    public createBoundsFromAWGS84Bounds(west: number, east: number, south: number, noth: number) {
        const bounds = [west, east-west, south, noth-south];
        const WGS84 = ReferenceProvider.getReference("CRS:84");
        return ShapeFactory.createBounds(WGS84, bounds);
    }

    public getCRS84BoundingBox(shape: Shape) {
        const WGS84 = ReferenceProvider.getReference("CRS:84");
        const bounds = shape.bounds;
        const toWgs84 = TransformationFactory.createTransformation(bounds.reference, WGS84);
        const newbounds = toWgs84.transformBounds(bounds);
        return {
            north: newbounds.y + newbounds.height,
            south: newbounds.y,
            west: newbounds.x,
            east: newbounds.x + newbounds.width,
        }
    }

    private recursiveTransformation(geometry: any, sourceReference: CoordinateReference, transformer: Transformation) {
        const newGeometry:GeoJSONGeometry = {
            type: geometry.type,
            geometries: geometry.geometries,
            coordinates: geometry.coordinates
        };
        switch (geometry.type) {
            case "Point":
                newGeometry.coordinates = this.reprojectedCoordinates(geometry.coordinates, sourceReference, transformer);
                return newGeometry;
                break;
            case "LineString":
            case "MultiPoint":
                newGeometry.coordinates = [];
                for (const coordinate of geometry.coordinates) {
                    const newCoordinate = this.reprojectedCoordinates(coordinate, sourceReference, transformer);
                    newGeometry.coordinates.push(newCoordinate);
                }
                return newGeometry
                break;
            case "Polygon":
            case "MultiLineString":
                newGeometry.coordinates = [];
                for (const polygon of geometry.coordinates) {
                    const polygonArray = [] as any;
                    for (const coordinate of polygon) {
                        const newCoordinate = this.reprojectedCoordinates(coordinate, sourceReference, transformer);
                        polygonArray.push(newCoordinate);
                    }
                    newGeometry.coordinates.push(polygonArray);
                }
                return newGeometry
                break;
            case "MultiPolygon":
                newGeometry.coordinates = [];
                for (const polygons of geometry.coordinates) {
                    const polygonsArray = [] as any;
                    for (const polygon of polygons) {
                        const polygonArray = [] as any;
                        for (const coordinate of polygon) {
                            const newCoordinate = this.reprojectedCoordinates(coordinate, sourceReference, transformer);
                            polygonArray.push(newCoordinate);
                        }
                        polygonsArray.push(polygonArray);
                    }
                    newGeometry.coordinates.push(polygonsArray);
                }
                return newGeometry
                break;
            case "GeometryCollection":
                newGeometry.geometries = [];
                for (const geo of geometry.geometries) {
                    const newGeo = this.recursiveTransformation(geo, sourceReference, transformer);
                    newGeometry.geometries.push(newGeo);
                }
                return newGeometry;
                break;
            default:
                return null;
        }
    }

    private reprojectedCoordinates(coordinates: number[], sourceReference: CoordinateReference, transformer: Transformation ) {
        const p1 = ShapeFactory.createPoint(sourceReference, coordinates);
        const p2 = this.reprojectPoint(p1, transformer);
        const point2 = (geoJSONCodec as any).encodeShape(p2);
        const newCoordinates = point2.coordinates;
        return newCoordinates;
    }

    private reprojectPoint(point1: Point, transformer: Transformation) {
        return transformer.transform(point1);
    }

}

export default new GeoTools();
