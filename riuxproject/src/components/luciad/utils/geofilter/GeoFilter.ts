import * as GeodesyFactory from "@luciad/ria/geodesy/GeodesyFactory";
import * as ConstructiveGeometryFactory from "@luciad/ria-geometry/geometry/constructive/ConstructiveGeometryFactory";
import { GeoJsonCodec } from "@luciad/ria/model/codec/GeoJsonCodec";
import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import { Point } from "@luciad/ria/shape/Point";
import { Shape } from "@luciad/ria/shape/Shape";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import { ShapeType } from "@luciad/ria/shape/ShapeType";

export enum GEOFILTER_OPERATOR {
    CONTAINS = 1,
    EXCLUDES = 2,
    INTERSECTS = 3,
    NEAR = 4
}

const reference = ReferenceProvider.getReference("CRS:84");
const geometry = ConstructiveGeometryFactory.createEllipsoidal(reference);
const GEODESY = GeodesyFactory.createSphericalGeodesy(reference);

const geoJSONCodec = new GeoJsonCodec({generateIDs: true}) as any;

interface GeoFilterOptions {
    enforce2D?: boolean;
    boundsToPolygon?: boolean
}

class GeoFilter {
    public static enforce2D(shape: Shape) {
        const json = geoJSONCodec.encodeShape(shape);
        return geoJSONCodec.decodeGeometryObject(json, reference)
    }

    public operator: GEOFILTER_OPERATOR;
    public min: number;
    private shape2: Shape;
    private options: GeoFilterOptions;

    constructor(shape: Shape, operator: GEOFILTER_OPERATOR, options?: GeoFilterOptions ) {
        this.options = options ? options : {
            enforce2D: true,
            boundsToPolygon: false
        };
        this.shape2 = this.options.enforce2D ? GeoFilter.enforce2D(shape) : shape;
        this.operator =  operator;
        this.min = 0;
    }

    public evaluate(shape1: Shape) {
        const testShape = this.options.boundsToPolygon && shape1.type === ShapeType.BOUNDS ? this.convertBoundsToPolygon(shape1) : shape1
        const shape = this.options.enforce2D ? GeoFilter.enforce2D(testShape) : testShape;
        switch(this.operator){
            case GEOFILTER_OPERATOR.EXCLUDES:
                return this.Excludes(shape);
                break;
            case GEOFILTER_OPERATOR.CONTAINS:
                return this.Contains(shape);
                break;
            case GEOFILTER_OPERATOR.INTERSECTS:
                return this.Intersects(shape);
                break;
            case GEOFILTER_OPERATOR.NEAR:
                const radius = (this.shape2 as any).radius;
                return this.Near(shape, this.min, radius);
                break;
        }
        return false;
    }

    private Contains (shape1:Shape) {
        if (shape1.type===ShapeType.POINT){
            return this.shape2.contains2DPoint(shape1 as Point);
        } else {
            const shapeX = geometry.intersection([shape1, this.shape2]);
            return shape1.equals(shapeX);
        }
    }

    private Excludes(shape1: Shape) {
        if (shape1.type===ShapeType.POINT){
            return !this.shape2.contains2DPoint(shape1 as Point);
        } else {
            const shapeX = geometry.intersection([shape1, this.shape2]);
            if (shapeX.type===(ShapeType as any).SHAPELIST&& (shapeX as any).geometries.length===0) {
                return true;
            }
            return false;
        }
    }

    private Intersects (shape1: Shape) {
        if (shape1.type===ShapeType.POINT){
            return this.shape2.contains2DPoint(shape1 as Point);
        } else {
            const shapeX = geometry.intersection([shape1, this.shape2]);
            if (shapeX.type===(ShapeType as any).SHAPELIST && (shapeX as any).geometries.length===0) {
                return false;
            }
            return true;
        }
    }

    private Near(shape1: Shape, min: number, max: number) {
        if (typeof min ==="undefined") {
            min = 0;
        }
        if (typeof max ==="undefined") {
            max = 1000;
        }
        const distance = GEODESY.distance(shape1.focusPoint, this.shape2.focusPoint);
        return min < distance && distance < max;
    }

    private convertBoundsToPolygon(shape: any) {
        if (shape.type === ShapeType.BOUNDS) {
            const points = [];
            points.push(ShapeFactory.createPoint(shape.reference, [shape.x, shape.y]));
            points.push(ShapeFactory.createPoint(shape.reference, [shape.x+shape.width, shape.y]));
            points.push(ShapeFactory.createPoint(shape.reference, [shape.x+shape.width, shape.y+shape.height]));
            points.push(ShapeFactory.createPoint(shape.reference, [shape.x, shape.y+shape.height]));
            const newShape = ShapeFactory.createPolygon(shape.reference, points);
            return newShape;
        } else {
            return shape;
        }
    }

}

export default GeoFilter;
