import { OutOfBoundsError } from "@luciad/ria/error/OutOfBoundsError";
import { Point } from "@luciad/ria/shape/Point";
import { Polyline } from "@luciad/ria/shape/Polyline";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import { CoordinateReference } from "@luciad/ria/reference/CoordinateReference";
import { Geodesy } from "@luciad/ria/geodesy/Geodesy";
import { Transformation } from "@luciad/ria/transformation/Transformation";
import ScreenMessage from "../../../../../screenmessage/ScreenMessage";

interface MeasurePoint {
    modelPoint: Point;
    worldPoint: Point;
}

interface SegmentType {
    distance: number;
    line: Polyline;
    p1: MeasurePoint;
    p2: MeasurePoint;
    isFinal?: boolean;
}


class Measurement {
    set segments(value: any[]) {
        this._segments = value;
    }

    get segments(): any[] {
        return this._segments;
    }

    private _shapeReference: CoordinateReference;
    private _geodesy: Geodesy;
    private _worldToModelTx: Transformation;
    private _viewToWorldTx: Transformation;
    private _segments: SegmentType[];
    private _finish: boolean;

    constructor(context: any) {
        this._shapeReference = context.shapeReference;
        this._geodesy = context.geodesy;
        this._worldToModelTx = context.worldToModelTx;
        this._viewToWorldTx = context.viewToWorldTx;
        this._segments = [];
        this._finish = false;
    }

    public reset() {
        this._segments = [];
    }

    public isStarted() {
        return this._segments.length && !this._finish;
    }

    public updateLastPosition(viewPosition: number[]) {

        const measurePoint = this.getMeasurePoint(viewPosition);
        if (!measurePoint) {
            return false;
        }

        this.updateLastSegment(measurePoint);
        return true;
    }

    public startMeasures(viewPosition: number[]) {
        let measurePoint;
        if (!this.isStarted()) {
            this._finish = false;
            this.reset();
            measurePoint = this.getMeasurePoint(viewPosition);

            if (!measurePoint) {
                return false;
            }
            this.createSegment(measurePoint, measurePoint);
        }
        return true;
    }

    public addNewPosition(viewPosition: number[]) {

        if (this._finish === true) {
            this.reset();
            return true;
        }

        const measurePoint = this.getMeasurePoint(viewPosition);
        if (!measurePoint) {
            return false;
        }

        if (this._segments.length) {
            this.updateLastSegment(measurePoint, true);
        }
        this.createSegment(measurePoint, measurePoint);
        return true;
    }

    public stopMeasures() {

        //if already finished, just cleanup.
        if (this._finish) {
            this._finish = false;
            this.reset();
            return true;
        }

        if (this._segments.length > 1 && this._segments[this._segments.length - 1].distance === 0) {
            this._segments.pop();
        }

        this._finish = true;
        return true;
    }

    private createSegment(p1: MeasurePoint, p2: MeasurePoint) {
        const segment = {
            distance: 0,
            line: ShapeFactory.createPolyline(this._shapeReference, [p1.modelPoint, p2.modelPoint]),
            p1,
            p2
        };
        this._segments.push(segment);
    }

    private updateLastSegment(p2: MeasurePoint, isFinal?: boolean) {
        const lastIdx = this._segments.length - 1;
        const segment = this._segments[lastIdx];

        // replace last point by p2
        segment.line.removePoint(1);
        segment.line.insertPoint(1, p2.modelPoint);
        segment.p2 = p2;

        // update distance
        segment.distance = this._geodesy.distance3D(segment.p1.worldPoint, p2.worldPoint);
        segment.isFinal = !!isFinal;
    }

    /**
     * Converts the view position to world and model positions ()
     * @param viewPosition
     * @returns {modelPoint, worldPoint}
     * @private
     */
    private getMeasurePoint(viewPosition: number[]) {
        try {
            const viewPoint = ShapeFactory.createPoint(null, viewPosition);
            const worldPoint = this._viewToWorldTx.transform(viewPoint);
            const modelPoint = this._worldToModelTx.transform(worldPoint);
            return {
                modelPoint,
                worldPoint,
            }
        } catch (e) {
            if (!(e instanceof OutOfBoundsError)) {
                ScreenMessage.error("Error occurred: " + e);
            }
        }
    }
}

export default Measurement;


