import { LineType } from "@luciad/ria/geodesy/LineType";
import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import { Shape } from "@luciad/ria/shape/Shape";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import { ShapeType } from "@luciad/ria/shape/ShapeType";
import * as TransformationFactory from "@luciad/ria/transformation/TransformationFactory";
import { Controller } from "@luciad/ria/view/controller/Controller";
import { HandleEventResult } from "@luciad/ria/view/controller/HandleEventResult";
import { GestureEventType } from "@luciad/ria/view/input/GestureEventType";
import { GeoCanvas } from "@luciad/ria/view/style/GeoCanvas";
import { WebGLMap } from "@luciad/ria/view/WebGLMap";
import { Map } from "@luciad/ria/view/Map";


/**
 * Base class for rectangle-based controllers (select-by-rectangle, zoom-by-rectangle,...)
 */

class RectangleSelectController extends Controller {
    public myRectangleStyle: any;
    public myIsDragging : boolean;
    public myFromPointModel : any;
    public myFromPointView : any;
    public myToPointModel :  any;
    public myToPointView : any;
    public myMapToModel : any;

    private callbackOnCompleted: any;
    private inverted: boolean;
    private prevCursorValue: string;

    constructor(callbackOnCompleted?: any) {
        super();
        this.callbackOnCompleted = callbackOnCompleted ? callbackOnCompleted : null;
        this.myRectangleStyle = {
            fill: {color: "rgba(96, 134, 238, 0.2)"},
            lineType: LineType.CONSTANT_BEARING,
            stroke: {color: "rgb(96, 134, 238)", width: 3, dash: [8, 2]}
        };

        this.myIsDragging = false;
        this.myFromPointModel = null;
        this.myFromPointView = null;
        this.myToPointModel = null;
        this.myToPointView = null;
        this.myMapToModel = null;

    }

    public onActivate(map: Map) {
        super.onActivate(map);
        this.prevCursorValue = this.map.domNode.style.cursor;
        this.map.domNode.style.cursor = "crosshair";

        this.myMapToModel = TransformationFactory.createTransformation(map.reference, ReferenceProvider.getReference("CRS:84"));
    }

    public onDeactivate(map: Map) {
        this.map.domNode.style.cursor =  this.prevCursorValue;
        super.onDeactivate(map);
        this.myMapToModel = null;
    }

    public onDraw(geoCanvas: GeoCanvas) {
        if (this.myFromPointModel && this.myToPointModel) {
            const bounds = this.privateCalculateDrawnRectangleBounds(this.myFromPointModel, this.myToPointModel);
            if (bounds) {
                geoCanvas.drawShape(bounds, this.myRectangleStyle);
            }
        }
    }

    public onGestureEvent(event: any) {
        switch (event.type) {
            case GestureEventType.DRAG:
                return this.privateOnDrag(event);
            case GestureEventType.DRAG_END:
                return this.privateOnDragEnd(event);
            default:
                return HandleEventResult.EVENT_IGNORED;
        }
    }

    public rectangleDragged(modelBounds: any, viewBounds: Shape) {
        if (this.callbackOnCompleted) {
            if (modelBounds.type === ShapeType.BOUNDS) {
                const points = [];
                points.push(ShapeFactory.createPoint(modelBounds.reference, [modelBounds.x, modelBounds.y]));
                points.push(ShapeFactory.createPoint(modelBounds.reference, [modelBounds.x+modelBounds.width, modelBounds.y]));
                points.push(ShapeFactory.createPoint(modelBounds.reference, [modelBounds.x+modelBounds.width, modelBounds.y+modelBounds.height]));
                points.push(ShapeFactory.createPoint(modelBounds.reference, [modelBounds.x, modelBounds.y+modelBounds.height]));
                const newShape = ShapeFactory.createPolygon(modelBounds.reference, points);
                this.callbackOnCompleted(newShape, this.inverted);
            }
        }
    }


    public reset() {
        this.myIsDragging = false;
        this.myFromPointModel = null;
        this.myToPointModel = null;
        this.invalidate();
    }


    private privateOnDrag(event: any) {
        if (!this.myIsDragging) {
            this.myFromPointView = event.viewPoint;
            this.myFromPointModel = this.privateModelPointUnderMouse(event);
            this.myIsDragging = true;
        }
        this.myToPointView = event.viewPoint;
        this.myToPointModel = this.privateModelPointUnderMouse(event);
        this.invalidate(); // trigger re-draw
        return HandleEventResult.EVENT_HANDLED;
    }

    private privateOnDragEnd(event: any) {
        this.myToPointModel = this.privateModelPointUnderMouse(event);
        const modelBounds = this.privateCalculateDrawnRectangleBounds(this.myFromPointModel, this.myToPointModel);
        const viewBounds = this.privateCalculateDrawnRectangleBounds(this.myFromPointView, this.myToPointView);
        this.rectangleDragged(modelBounds as any, viewBounds as any);
        this.myIsDragging = false;
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    }


    private privateModelPointUnderMouse(event: any) {
        const mapPoint = this.map.viewToMapTransformation.transform(event.viewPoint);
        return this.myMapToModel.transform(mapPoint);
    }

    private privateCalculateDrawnRectangleBounds(p1: any, p2: any) {
        if (p1 && p2) {
            let width = p2.x - p1.x;
            const height = p2.y - p1.y;
            this.inverted = (p2.x<p1.x) ? true : false;
            let left = p1.x;
            if (this.inverted) {
                width *=-1;
                left = p2.x
            }
            return ShapeFactory.createBounds(p1.reference, [left, width, p1.y, height]);
        }
        return null;
    }

}

export default RectangleSelectController;


