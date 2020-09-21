import * as GeodesyFactory from "@luciad/ria/geodesy/GeodesyFactory";
import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import { Controller } from "@luciad/ria/view/controller/Controller";
import { HandleEventResult } from "@luciad/ria/view/controller/HandleEventResult";
import { GestureEventType } from "@luciad/ria/view/input/GestureEventType";
import { Map } from "@luciad/ria/view/Map";
import { GeoCanvas } from "@luciad/ria/view/style/GeoCanvas";
import { LabelCanvas } from "@luciad/ria/view/style/LabelCanvas";
import { GestureEvent } from "@luciad/ria/view/input/GestureEvent";
import {LocationMode} from "@luciad/ria/transformation/LocationMode";

import * as TransformationFactory from "@luciad/ria/transformation/TransformationFactory";

import FormatUtil from "../common/FormatUtil";
import Measurement from "./Measurement";
import Ruler3DPresentation from "./Ruler3DPresentation";
import {EventedSupport} from "@luciad/ria/util/EventedSupport";

const SQUARED_SLACK = 100; //some slack when clicking.

export interface Ruler3DUpdateValues {
    area: number;
    distance: number;
    areaText: string;
    distanceText: string;
    mode: string;
}

export enum Ruler3DControllerTypes {
    MEASURE_TYPE_AREA = "area",
    MEASURE_TYPE_DISTANCE = "distance",
    MEASURE_TYPE_ORTHO = "orthogonal",
    MEASURE_TYPE_HEIGHT = "height",
}
enum MEASURE_TYPE {
    MEASURE_TYPE_PARAM = "measureType",
}

export interface Ruler3DConstructorOptions {
    mode?: Ruler3DControllerTypes;
    fill?: string;
    stroke?: string;
    helperColor?: string
    onUpdate?: (newValues: Ruler3DUpdateValues) => void;
    formatUtil: FormatUtil | undefined;
}

/**
 * Creates the Ruler Controller instance.
 * @constructor
 */
class Ruler3DController extends Controller {
    // RESULTS PRESENTATION
    public static MEASUREMENT_CHANGED = "MEASUREMENT_CHANGED";
    public static MEASUREMENT_DEACTIVATED = "MEASUREMENT_DEACTIVATED";
   // public static MEASURE_TYPE_PARAM = "measureType";

 //   private _measureResult: null;
    private _measureOptions: {};
    private _wait: boolean;
    private _dx: number | null | undefined;
    private _dy: number | null | undefined;
    private _suspended: boolean;
    private _measurement: Measurement;
    private _presentation: Ruler3DPresentation;
    private _eventSupport: EventedSupport;
    private stroke: string;
    private fill: string;
    private helperColor: string;
    private onUpdate: (newValues: Ruler3DUpdateValues) => void;
    private geoContext: any;

    constructor(someOptions?: Ruler3DConstructorOptions) {
      super();
      this._measureOptions = {};

      this._wait = false;
      this._dx = null;
      this._dy = null;
      this._eventSupport = new EventedSupport([Ruler3DController.MEASUREMENT_CHANGED], true);

      const options = someOptions ? {...someOptions} : {} as Ruler3DConstructorOptions;
      options.mode = options.mode ? options.mode : Ruler3DControllerTypes.MEASURE_TYPE_DISTANCE;
      this.stroke = options.stroke;
      this.fill = options.fill;
      this.helperColor = options.helperColor;

      this.setMode(options.mode);
      this._suspended = false;

      this.onUpdate = options.onUpdate;

      this.onMeasurementChange(() => {
            const totals = this.getMeasurements().totals;
            const distance = this.formatUtil.distanceText(totals.length);
            const area = this.formatUtil.areaText(totals.area);
            const ruler3DValues:Ruler3DUpdateValues = {
                area: totals.area,
                distance: totals.length,
                areaText: area,
                distanceText: distance,
                mode: this.getMode(),
            }
            if (typeof this.onUpdate === "function") {
                this.onUpdate(ruler3DValues)
            }
    });
  }

    public get formatUtil(): FormatUtil {
        return this._presentation.formatUtil;
    }

    public set formatUtil(value: FormatUtil) {
        this._presentation.formatUtil = value;
        if (this.map) {
            this.invalidate();
        }
    }

    get segments(): any[] {
        return this._measurement.segments;
    }

    get totals(): any[] {
        return this._presentation.getTotals(this._measurement.segments);
    }

    public getMeasurements = function () {
        const segments = this._measurement.segments;
        return {
            segments,
            totals: this._presentation.getTotals(segments)
        };
    };

    /**
     * Called when the controller becomes active. Perform any setup here.
     */
    public onActivate (map: Map) {
        this.init(map);
        // eslint-disable-next-line prefer-rest-params
        Controller.prototype.onActivate.call(this, arguments);
    }

    /**
     * called when the controller becomes inactive
     * perform any cleanup here.
     */
    public onDeactivate  () {
        this._measurement.reset();
        // eslint-disable-next-line prefer-rest-params
        Controller.prototype.onDeactivate.call(this, arguments);
        // this.emit(Ruler3DController.MEASUREMENT_DEACTIVATED, undefined);
        // Controller implements Evented - inform listeners that measure results changed
        this._eventSupport.emit(Ruler3DController.MEASUREMENT_CHANGED);
    }

    onMeasurementChange = (callback: any) => {
        this._eventSupport.on(Ruler3DController.MEASUREMENT_CHANGED, callback);
    };

    /**
     * Handle the user input gestures. The event-object contains information about the type of user-interaction
     */
    public onGestureEvent (event: GestureEvent) {

        switch (event.type) {
            case GestureEventType.DRAG:
                return this.onDrag(event);
            case GestureEventType.DOWN:
                return this.onDown(event);
            case GestureEventType.DRAG_END:
                return this.onDragEnd(event);
            case GestureEventType.SINGLE_CLICK_UP:
                return this.onClick(event);
                break;
            case GestureEventType.MOVE:
                //when user "hovers" over the map, we measure, but do not confirm any point
                return this.onMove(event);
                break;
            case GestureEventType.DOUBLE_CLICK:
                //user confirms the polyline
                return this.onDoubleClick();
            case GestureEventType.SINGLE_CLICK_CONFIRMED:
                //user performed click and no double click can follow
                return this.onClickConfirmed(event);
            default:
                break;
        }
    }

    public setMeasureOptions  (parameter: string, state: Ruler3DControllerTypes) {
        // @ts-ignore
        this._measureOptions[parameter] = state;
        this.invalidate();
    }

    public isCurrentMeasureType (measureType: Ruler3DControllerTypes) {
        // @ts-ignore
        return this._measureOptions[Ruler3DController.MEASURE_TYPE_PARAM] === measureType;
    }

    public getMode() {
        // @ts-ignore
        const mode = this._measureOptions[Ruler3DController.MEASURE_TYPE_PARAM];
        return mode;
    }

    public setMode(name: Ruler3DControllerTypes) {
        // @ts-ignore
        this.setMeasureOptions(Ruler3DController.MEASURE_TYPE_PARAM, name);
        // this.setMeasureOptions(Ruler3DController.MEASURE_TYPE_PARAM, CONST_MODE_3D[name]);
    }

    /**
     * This method is invoked whenever the controller is invalidated.
     */
    public onDraw (geoCanvas: GeoCanvas) {
        // Array of {line, distance, p1, p2} where p1, p2 {modelPoint, worldPoint}
        const segments = this._measurement.segments;

        const isTypeOrtho = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_ORTHO);
        const isTypeHeight = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_HEIGHT);
        const isTypeArea = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_AREA);


        if (isTypeArea) {
            this._presentation.drawArea(geoCanvas, segments);
        }

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            this._presentation.drawSegmentPoints(geoCanvas, segment, i);

            if (!isTypeHeight) {
                this._presentation.drawSegment(geoCanvas, segment);
            }

            if (isTypeOrtho) {
                this._presentation.drawOrtho(geoCanvas, segment);
            }

            if (isTypeHeight) {
                this._presentation.drawHeight(geoCanvas, segment, i);
            }
        }
        // Controller implements Evented - inform listeners that measure results changed
        // this.emit(Ruler3DController.MEASUREMENT_CHANGED, undefined);
        this._eventSupport.emit(Ruler3DController.MEASUREMENT_CHANGED);
    }

    public onDrawLabel (labelCanvas: LabelCanvas) {
        // Array of {line, distance, p1, p2} where p1, p2 {modelPoint, worldPoint}
        const segments = this._measurement.segments;

        const isTypeOrtho = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_ORTHO);
        const isTypeHeight = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_HEIGHT);
        const isTypeArea = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_AREA);


        if (isTypeArea) {
            this._presentation.drawAreaLabel(labelCanvas, segments);
        }

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (!isTypeHeight) {
                this._presentation.drawSegmentLabel(labelCanvas, segment);
            }

            if (isTypeOrtho) {
                this._presentation.drawOrthoLabel(labelCanvas, segment);
            }

            if (isTypeHeight) {
                this._presentation.drawHeightLabel(labelCanvas, segment, i);
            }
        }
    }


    private letGo = function () {
        this._wait = false;
        this._dx = undefined;
        this._dy = undefined;
    };

    private withinSlack  (event: GestureEvent) {
        if (!this._wait) {
            return false;
        }

        const x = event.viewPosition[0];
        const y = event.viewPosition[1];
        const dist = squaredDistance(this._dx, this._dy, x, y);
        return (dist < SQUARED_SLACK);

        function squaredDistance(x1: number, y1: number, x2: number, y2: number) {
            return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        }
    }

    private onDrag  (event: GestureEvent) {

        if (this._wait) {
            if (this.withinSlack(event)) {
                return HandleEventResult.EVENT_HANDLED;
            }
        } else {
            this.letGo();
        }
    }

    private onDragEnd (event: GestureEvent) {

        if (this.withinSlack(event)) {
            return this.onClick(event);
        }

        this.letGo();
    }

    private onMove  (event: GestureEvent) {
        if (!this._measurement.isStarted()) {
            return;
        }
        this.letGo();

        this._measurement.updateLastPosition(event.viewPosition);
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    }

    private onClickConfirmed (event: GestureEvent) {

        this._measurement.startMeasures(event.viewPosition);
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    }

    private onDown (event: GestureEvent) {
        //by holding on to the down coordinates, we can introduce a little slack
        const loc = event.viewPosition;
        this._dx = loc[0];
        this._dy = loc[1];
        this._wait = true;
        return HandleEventResult.EVENT_HANDLED;
    }

    private onClick  (event: GestureEvent) {
        this._measurement.addNewPosition(event.viewPosition);
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    }

    private onDoubleClick = function (event?: GestureEvent) {
        this._measurement.stopMeasures();
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    };

    private init  (map: Map) {
        const mapReference = map.reference; // "EPSG:4978"
        const shapeReference = ReferenceProvider.getReference("EPSG:4326"); // 3D WGS:84

        const geoContext = {
            geodesy: GeodesyFactory.createCartesianGeodesy(mapReference),
            mapReference,
            modelToWorldTx: TransformationFactory.createTransformation(shapeReference, mapReference),
            shapeReference,
            viewToWorldTx: map.getViewToMapTransformation(LocationMode.CLOSEST_SURFACE),
            worldToModelTx: TransformationFactory.createTransformation(mapReference, shapeReference),
            fill: this.fill,
            stroke: this.stroke,
            helperColor: this.helperColor,
        };
        this.geoContext = geoContext;

        this._measurement = new Measurement(geoContext);
        this._presentation = Ruler3DPresentation.createPresentation(geoContext);

        const ruler3DValues = {
            area: 0,
            distance: 0,
            areaText: "",
            distanceText: "",
            mode: this.getMode(),
        }
        this.onUpdate(ruler3DValues)
    }
}

export default Ruler3DController;
