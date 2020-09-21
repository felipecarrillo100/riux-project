import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import { Controller } from "@luciad/ria/view/controller/Controller";
import { HandleEventResult } from "@luciad/ria/view/controller/HandleEventResult";
import { GestureEventType } from "@luciad/ria/view/input/GestureEventType";
import { PathLabelPosition } from "@luciad/ria/view/style/PathLabelPosition";
import { CoordinateReference } from "@luciad/ria/reference/CoordinateReference";
import * as GeodesyFactory from "@luciad/ria/geodesy/GeodesyFactory";
import {Geodesy} from "@luciad/ria/geodesy/Geodesy";
import { Transformation } from "@luciad/ria/transformation/Transformation";
import { LineType } from "@luciad/ria/geodesy/LineType";
import * as TransformationFactory from "@luciad/ria/transformation/TransformationFactory";
import { PointLabelPosition } from "@luciad/ria/view/style/PointLabelPosition";
import {IconStyle, ImageIconStyle, UrlIconStyle} from "@luciad/ria/view/style/IconStyle";
import { Point } from "@luciad/ria/shape/Point";
import { Polyline } from "@luciad/ria/shape/Polyline";
import {ShapeStyle} from "@luciad/ria/view/style/ShapeStyle";
import {Polygon} from "@luciad/ria/shape/Polygon";

import { Map } from "@luciad/ria/view/Map";
import { GeoCanvas } from "@luciad/ria/view/style/GeoCanvas";
import { LabelCanvas } from "@luciad/ria/view/style/LabelCanvas";
import { GestureEvent } from "@luciad/ria/view/input/GestureEvent";

import IconProvider, {IconProviderShapes} from "../../../../utils/iconimagefactory/IconProvider";
import FormatUtil from "../common/FormatUtil";

import "./RulerController.scss";

const DEFAULT_RULER_STYLE = {
  fill: {color: "rgba(0,128,255,0.33)", width: 2},
  stroke: {color: "rgb(0,113,225)", width: 2,  dash: [8, 2]},
};

const INVISIBLE_RULER_STYLE = {
  stroke: {color: "rgba(0,0,0,0)", width: 1},
}

const DEFAULT_ICON_SIZE = {width:18, height:30};

const DEFAULT_POINT_ICON: IconStyle = {
  height: DEFAULT_ICON_SIZE.height + "px",
  image: IconProvider.paintIconByName(IconProviderShapes.POI, {
    fill: "rgba(0,128,255,0.5)",
    height: DEFAULT_ICON_SIZE.height,
    stroke: "rgb(0,113,225)",
    width: DEFAULT_ICON_SIZE.width,
    strokeWidth:2,
  }),
  draped: false,
  width: DEFAULT_ICON_SIZE.width + "px",
  anchorY: DEFAULT_ICON_SIZE.height + "px",
};

const DEFAULT_LINE_TYPE = LineType.SHORTEST_DISTANCE;

const SQUARED_SLACK = 400; // some slack when clicking.
function squaredDistance(x1:number, y1:number, x2:number, y2:number) {
  return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}

type DistanceFunctionType = (point1: Point, point2: Point) => number;

// returns a distance-function for the correct geodesy and linetype
function createDistanceFunction(geodesy: Geodesy, linetype: LineType):DistanceFunctionType {
  return (point1: Point, point2: Point) => {
    return geodesy.distance(point1, point2, linetype);
  };
}

// iterates over all segments in a polyline

function mapSegments(polyline: Polyline, distanceFunction: DistanceFunctionType): number[] {
  const segs : number[] = [];
  const last = polyline.pointCount;
  let i = 1;
  let p1: any;
  let p2: any;

  while (i < last) {
    p1 = polyline.getPoint(i);
    p2 = polyline.getPoint(i - 1);

    segs.push(distanceFunction(p1, p2));

    i += 1;
  }
  return segs;
}


export enum RulerMode {
  DISTANCE = "DISTANCE",
  AREA = "AREA"
}

export interface Ruler2DUpdateValues {
  perimeter: number;
  area: number;
  distance: number;
  perimeterText: string;
  areaText: string;
  distanceText: string;
  mode: string;
}

export interface Ruler2DConstructorOptions {
  mode: RulerMode;
  onUpdate?: (newValues: Ruler2DUpdateValues) => void;
  fill?: string;
  stroke?: string;
  lineType?: LineType;
  lineStyle?: any;
  shapeStyle?: any;
  cartesian?: any;
  formatUtil: FormatUtil;
}


class RulerController extends Controller {
  private pvCartesian: any;
  private pvOptions: any;
  private pvShapeStyle: ShapeStyle;
  private pvLineInvisibleStyle: ShapeStyle;
  private pvMap: Map | null;
  private pvPolygon: Polygon;
  private pvPolyLine: Polyline;
  private pvPointIcon: IconStyle; // { image: any; width: string; height: string };
  private pvText: string;
  private pvShapeReference: CoordinateReference;
  private pvGeodesy: Geodesy;
  private pvWorldModelTransformation: Transformation;
  private pvWait: boolean;
  private pvFinish: boolean;
  private pvDx: any;
  private pvDy: any;
  private rulerMode: RulerMode;
  private onMeasurementUpdate: any;
  private updatedValues: Ruler2DUpdateValues;
  private _formatUtil: FormatUtil;
  private lineType: LineType;
  private intermediateLabels: string[];
  private defaultIcon: UrlIconStyle | ImageIconStyle;

  constructor(someOptions?: Ruler2DConstructorOptions){
    super();
    const options = typeof someOptions !== "undefined" ? {...someOptions} : {} as Ruler2DConstructorOptions;
    options.mode = options.mode ? options.mode : RulerMode.DISTANCE;
    options.onUpdate = options.onUpdate ? options.onUpdate : null;
    options.fill = options.fill ? options.fill : "rgba(0,128,255,0.4)";
    options.stroke = options.stroke ? options.stroke : "rgb(0,113,225)";

    this.defaultIcon = {...DEFAULT_POINT_ICON};
    (this.defaultIcon as any).image = IconProvider.paintIconByName(IconProviderShapes.POI, {
      fill: options.fill,
      height: DEFAULT_ICON_SIZE.height,
      stroke: options.stroke,
      width: DEFAULT_ICON_SIZE.width,
      strokeWidth:2,
    });

    this.rulerMode = options.mode;
    this.onMeasurementUpdate = options.onUpdate;

    const userLineType = (options.lineStyle) ? options.lineType : undefined;
    if (!([LineType.SHORTEST_DISTANCE, LineType.CONSTANT_BEARING, undefined].some((allowedLineType) => {
      return allowedLineType === userLineType;
    }))) {
      throw new Error("AreaRulerController:: supplied lineType of the lineStyle is not allowed - " + options.lineType);
    }

    this.pvCartesian = options.cartesian;
    this.pvOptions = options;
    this.pvShapeStyle = options.shapeStyle || {...DEFAULT_RULER_STYLE};
    if (options.fill) this.pvShapeStyle.fill.color =  options.fill;
    if (options.stroke) (this.pvShapeStyle.stroke as any).color = options.stroke;
    this.pvLineInvisibleStyle = INVISIBLE_RULER_STYLE;
    this.lineType = options.lineType || DEFAULT_LINE_TYPE;

    this.updatedValues = {
      perimeter: 0,
      distance: 0,
      area: 0,
      perimeterText: "",
      distanceText: "",
      areaText: "",
      mode: this.getMode()
    }
    this._formatUtil = options.formatUtil ? options.formatUtil : new FormatUtil();
    this.intermediateLabels = [];
  }

  public get formatUtil(): FormatUtil {
    return this._formatUtil;
  }

  public set formatUtil(value: FormatUtil) {
    this._formatUtil = value;
    if (this.map) {
      this.updateMeasurement();
      this.invalidate();
    }
  }

  public setMode(mode: RulerMode) {
    this.rulerMode = mode;
    this.updateMeasurement();
    this.invalidate();
  }

  public getMode() {
    return this.rulerMode;
  }

  // -------------------------------------------------------------------
  // controller API (cf. luciad/view/controller/Controller contract)
  // -------------------------------------------------------------------
  /**
   * handle the user input. The event-object contains information about the type of user-interaction
   */
  // #snippet gesture
  // #description responding to gesture events in the onGestureEvent controller instance method
  public onGestureEvent(event: GestureEvent): any {
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
        // when user "hovers" over the map,
        // we measure, but do not confirm any point
        return this.onMove(event);
        break;
      case GestureEventType.DOUBLE_CLICK:
        // user confirms the polyline
        return this.onDoubleClick(event);
      case GestureEventType.SINGLE_CLICK_CONFIRMED:
        // user performed click and no double click can follow
        return this.onClickConfirmed(event);
      default:
        break;
    }

  }
  // #endsnippet gesture

  /**
   * draw anything what needs to be drawn.
   * this method is invoked at each map refresh when the controller is active.
   * the AreaRulerController draws the line which has been drawn by the user so far.
   */
  // #snippet geocanvas
  // #description a controller can draw to the map in the onDraw instance method.
  public onDraw(geoCanvas: GeoCanvas) {
    if (this.rulerMode===RulerMode.DISTANCE) {
      geoCanvas.drawShape(this.pvPolyLine, this.pvShapeStyle);
    }  else if (this.rulerMode===RulerMode.AREA) {
      geoCanvas.drawShape(this.pvPolygon, this.pvShapeStyle);
    }
  //  let pc = this.pvPolygon.pointCount;
  //  while (pc--) {geoCanvas.drawIcon(this.pvPolygon.getPoint(pc),this.pvPointIcon);}

    for (let i=0; i<this.pvPolygon.pointCount;  ++i) {
      geoCanvas.drawIcon(this.pvPolygon.getPoint(i),this.pvPointIcon)
      if (i>0) {
        const line = ShapeFactory.createPolyline(this.pvPolyLine.reference, [this.pvPolyLine.getPoint(i - 1), this.pvPolyLine.getPoint(i)]);
        geoCanvas.drawShape(line, this.pvLineInvisibleStyle);
      }
    }

    if ( this.rulerMode===RulerMode.AREA && this.pvPolyLine.pointCount>2){
      const lastLine = ShapeFactory.createPolyline(this.pvPolyLine.reference, [this.pvPolyLine.getPoint(this.pvPolyLine.pointCount-1), this.pvPolyLine.getPoint(0)]);
      geoCanvas.drawShape(lastLine, this.pvLineInvisibleStyle);
    }
  }
  // #endsnippet geocanvas

  // #snippet labelcanvas
  // #description a controller can draw labels on the map in onDrawLabel instance method.
  public onDrawLabel(labelCanvas: LabelCanvas) {
    if (this.pvPolygon.pointCount>1) {
      const labelLineStyle = {positions: [PathLabelPosition.CENTER, PathLabelPosition.ABOVE]};
      const labelPointStyle = {positions: [ PointLabelPosition.CENTER]};
      const labelTotalDistanceStyle = {positions: [ PointLabelPosition.EAST]};
      if (this.rulerMode===RulerMode.DISTANCE) {
        const html = this.htmlLabel(this.pvText, "rulerLabel");
        labelCanvas.drawLabel( html, this.pvPolyLine.getPoint(this.pvPolyLine.pointCount - 1), labelTotalDistanceStyle);
        if ( this.pvPolyLine.pointCount>2){
          for (let i= 1; i< this.pvPolyLine.pointCount; ++i) {
             const line = ShapeFactory.createPolyline(this.pvPolyLine.reference, [this.pvPolyLine.getPoint(i-1), this.pvPolyLine.getPoint(i)]);
             const pointHTML: string = this.htmlLabel(this.intermediateLabels[i-1], "rulerPointLabel");
             labelCanvas.drawLabelOnPath( pointHTML, line, labelLineStyle);
             //labelCanvas.drawLabel(pointHTML, this.midPoint(this.pvPolyLine.getPoint(i-1), this.pvPolyLine.getPoint(i)), labelPointStyle)
          }
        }
      } else if (this.rulerMode===RulerMode.AREA) {
        const labelTotalAreaStyle = {positions: [ PointLabelPosition.CENTER]};
        if (this.pvPolyLine.pointCount===2) {
          const tmpHtml = this.htmlLabel(this.intermediateLabels[0], "rulerLabel");
          labelCanvas.drawLabel( tmpHtml, this.pvPolyLine.getPoint(this.pvPolyLine.pointCount - 1), labelTotalDistanceStyle);
        }
        if ( this.pvPolyLine.pointCount>2){
          const html = this.htmlLabel(this.pvText, "rulerLabel");
          labelCanvas.drawLabelInPath( html, this.pvPolygon.focusPoint, {restrictToBounds: false, inView: true } as any);
          for (let i= 1; i< this.pvPolyLine.pointCount; ++i) {
            const line = ShapeFactory.createPolyline(this.pvPolyLine.reference, [this.pvPolyLine.getPoint(i-1), this.pvPolyLine.getPoint(i)]);
            const pointHTML: string = this.htmlLabel(this.intermediateLabels[i-1], "rulerPointLabel");
            labelCanvas.drawLabelOnPath( pointHTML, line, {});
            // labelCanvas.drawLabel(pointHTML, this.midPoint(this.pvPolyLine.getPoint(i-1), this.pvPolyLine.getPoint(i)), labelPointStyle)
          }
          const lastLine = ShapeFactory.createPolyline(this.pvPolyLine.reference, [this.pvPolyLine.getPoint(this.pvPolyLine.pointCount-1), this.pvPolyLine.getPoint(0)]);
          const lastPointHTML: string = this.htmlLabel( this.intermediateLabels[this.intermediateLabels.length-1], "rulerPointLabel");
          labelCanvas.drawLabelOnPath( lastPointHTML, lastLine, {});
          // labelCanvas.drawLabel(lastPointHTML, this.midPoint(this.pvPolyLine.getPoint(this.pvPolyLine.pointCount-1), this.pvPolyLine.getPoint(0)), labelPointStyle)
        }
      }
    }
  }


  // #endsnippet labelcanvas

  /**
   * called when the controller becomes active
   * perform any setup here.
   */
  public onActivate(map: Map) {
    if (this.pvMap && this.pvMap !== map) {
      throw new Error("A single instance of a AreaRulerController may not be active on multiple maps at the same time. Create new instances of AreaRulerController with 'new AreaRulerController(myOptions)'-syntax");
    }
    this.init(map);
    // eslint-disable-next-line prefer-rest-params
    Controller.prototype.onActivate.call(this, arguments);
  }

  /**
   * called when the controller becomes inactive
   * perform any cleanup here.
   */
  public onDeactivate() {
    this.cleanupLine();
    this.pvText = "";
    this.pvMap = null;
    // eslint-disable-next-line prefer-rest-params
    Controller.prototype.onDeactivate.call(this, arguments);
  }

  private init(map: Map) {
    this.pvMap = map;

    this.pvPointIcon = this.pvOptions.pointIcon || this.defaultIcon;

    if (this.pvCartesian) {
      this.pvShapeReference = map.reference;
      this.pvGeodesy = GeodesyFactory.createCartesianGeodesy(this.pvShapeReference);
    } else {
      this.pvShapeReference = ReferenceProvider.getReference("CRS:84");
      this.pvGeodesy = GeodesyFactory.createEllipsoidalGeodesy(this.pvShapeReference);
    }
    this.pvPolyLine = ShapeFactory.createPolyline(this.pvShapeReference, []);
    this.pvPolygon = ShapeFactory.createPolygon(this.pvShapeReference, []);
    this.pvWorldModelTransformation = TransformationFactory.createTransformation(map.reference, this.pvShapeReference);
    if (typeof this.onMeasurementUpdate === "function") {
      this.onMeasurementUpdate(this.updatedValues);
    }
  }

  private createModelPoint(viewPosition: any) {
    let vwTrans;
    let worldPoint;
    let viewPoint;
    let modelPoint;

    try {
      if(this.pvMap) {
        vwTrans = this.pvMap.viewToMapTransformation;
        viewPoint = ShapeFactory.createPoint(null as any, viewPosition);
        worldPoint = vwTrans.transform(viewPoint);
        modelPoint = this.pvWorldModelTransformation.transform(worldPoint);
        modelPoint.z = 0.0;
        return modelPoint;
      } else {
        return null
      }
    } catch (e) {
      return null;
    }

  }

  private cleanupLine() {
    let p = this.pvPolygon.pointCount;
    while (p--) {
      this.pvPolygon.removePoint(p);
    }
    p = this.pvPolyLine.pointCount;
    while (p--) {
      this.pvPolyLine.removePoint(p);
    }
  }

  private calculateTotalArea() {
    return this.pvGeodesy.area(this.pvPolygon);
  }

  private midPoint(p1:Point, p2:Point) {
    return this.pvGeodesy.interpolate(p1,p2,0.5, this.lineType);
  }


  private calculateTotalDistance() {
    // map all the segments to their distance
    const segments = mapSegments(this.pvPolyLine, createDistanceFunction(this.pvGeodesy, this.lineType));

    // reduce the segments by adding all distances.
    return segments.reduce((a: number, b: number) => a + b, 0);
  }

  private calculatePerimeter() {
    this.intermediateLabels = [];
    // map all the segments to their distance
    const polyline = this.pvPolyLine.copy();
    if (this.pvPolyLine.pointCount>2) {
      polyline.insertPoint(this.pvPolyLine.pointCount, this.pvPolyLine.getPoint(0));
    }
    const segments = mapSegments(polyline, createDistanceFunction(this.pvGeodesy, this.lineType));
    for (const segment of segments) {
      this.intermediateLabels.push(this.formatDistance(segment));
    }

    // reduce the segments by adding all distances.
    return segments.reduce((a: number, b: number) => a + b, 0);
  }


  private formatArea(a: number) {
    return this.formatUtil.areaText(a);
  }

    private updateMeasurement() {
    const d = this.calculateTotalDistance();
    const a = this.calculateTotalArea();
    const p = this.calculatePerimeter();
    const distanceText = this.formatDistance(d);
    const perimeterText = this.formatDistance(p);
    const areaText = this.formatArea(a);
    this.updatedValues = {
      perimeter: p,
      distance: d,
      area: a,
      perimeterText,
      distanceText,
      areaText,
      mode: this.getMode()
    }
    this.pvText = this.rulerMode === RulerMode.DISTANCE ? distanceText : areaText;
    if (typeof this.onMeasurementUpdate === "function") {
      this.onMeasurementUpdate(this.updatedValues);
    }
  }

  private letGo() {
    this.pvWait = false;
    this.pvDx = undefined;
    this.pvDy = undefined;
  }

  private withinSlack(event: any) {
    if (!this.pvWait) {
      return false;
    }
    const x = event.viewPosition[0];
    const y = event.viewPosition[1];
    const dist = squaredDistance(this.pvDx, this.pvDy, x, y);
    return (dist < SQUARED_SLACK);
  }

  private onDrag(event: any) {
    if (this.pvWait) {
      if (this.withinSlack(event)) {
        return HandleEventResult.EVENT_HANDLED;
      }
    } else {
      this.letGo();
    }
    return ;
  }

  private onDragEnd(event: any) {
    if (this.withinSlack(event)) {
      return this.onClick(event);
    }
    this.letGo();
    return;
  }

  // --------------------------------------------------------
  // specific event handlers (cf. this.onGestureEvent delegates to these)
  private onMove(event: any) {
    if (this.pvPolygon.pointCount < 1 || this.pvFinish) {
      return;
    }
    this.letGo();
    return this.updateHover(event);
  }

  private updateHover(event: any) {
    const mp = this.createModelPoint(event.viewPosition);
    if (!mp) {// if no point can be created (e.g. because outside bounds), just ignore the input
      return HandleEventResult.EVENT_HANDLED;
    }

    const removeIndex = this.pvPolygon.pointCount - 1;
    this.pvPolygon.removePoint(removeIndex);// replace last point
    this.pvPolygon.insertPoint(this.pvPolygon.pointCount, mp);

    this.pvPolyLine.removePoint(removeIndex);// replace last point
    this.pvPolyLine.insertPoint(this.pvPolyLine.pointCount, mp);

    this.updateMeasurement();
    this.invalidate();

    return HandleEventResult.EVENT_HANDLED;
  }

  private onClickConfirmed(event: any) {
    let mp;
    if (this.pvFinish || this.pvPolygon.pointCount === 0) {
      this.pvFinish = false;
      this.cleanupLine();
      mp = this.createModelPoint(event.viewPosition);
      if (!mp) {// if no point can be created (e.g. because outside bounds), just ignore the input
        return HandleEventResult.EVENT_HANDLED;
      }
      this.pvPolygon.insertPoint(this.pvPolygon.pointCount, mp); // add the point to the polyline.
      this.pvPolygon.insertPoint(this.pvPolygon.pointCount, mp); // add the "hover" point

      this.pvPolyLine.insertPoint(this.pvPolyLine.pointCount, mp); // add the point to the polyline.
      this.pvPolyLine.insertPoint(this.pvPolyLine.pointCount, mp); // add the "hover" point

      this.updateMeasurement();
      this.invalidate();
    }
    return HandleEventResult.EVENT_HANDLED;
  }

  private onDown(event: any) {
    // by holding on to the down coordinates, we can introduce a little slack
    const loc = event.viewPosition;
    this.pvDx = loc[0];
    this.pvDy = loc[1];
    this.pvWait = true;
    return HandleEventResult.EVENT_HANDLED;
  }

  private onClick(event: any) {
    if (this.pvFinish === true) {
      // this means a restart
      this.cleanupLine();
      this.invalidate();
      return HandleEventResult.EVENT_HANDLED;
    }

    const mp = this.createModelPoint(event.viewPosition);
    if (!mp) { // if no point can be created (e.g. because outside bounds), just ignore the input
      return HandleEventResult.EVENT_HANDLED;
    }

    const pc = this.pvPolygon.pointCount;
    let removeIndex;
    if (pc >= 2) {
      removeIndex = pc - 1;
      this.pvPolygon.removePoint(removeIndex);
      this.pvPolygon.insertPoint(this.pvPolygon.pointCount, mp);
      this.pvPolygon.insertPoint(this.pvPolygon.pointCount, mp);

      this.pvPolyLine.removePoint(removeIndex);
      this.pvPolyLine.insertPoint(this.pvPolyLine.pointCount, mp);
      this.pvPolyLine.insertPoint(this.pvPolyLine.pointCount, mp);

      this.updateMeasurement();
      this.invalidate();
    }
    return HandleEventResult.EVENT_HANDLED;
  }

  private onDoubleClick(event: any) {
    // if already finished, just cleanup.
    if (this.pvFinish) {
      this.pvFinish = false;
      this.cleanupLine();
      this.invalidate();
      return HandleEventResult.EVENT_HANDLED;
    }

    // remove the last "hover" point
    const pc = this.pvPolygon.pointCount;
    if (pc > 2 && this.pvPolygon.getPoint(pc - 1).equals(this.pvPolygon.getPoint(pc - 2))) {
      this.pvPolygon.removePoint(pc - 1);
    }

    this.pvFinish = true;
    this.invalidate();
    return HandleEventResult.EVENT_HANDLED;
  }

  private formatDistance(d: number) {
    return this.formatUtil.distanceText(d);
  }

  private htmlLabel(label: string, className:string, tag?: string) {
    tag = tag ? tag : "span";
    const html = '<'+ tag + ' class="'+className+'">' + label + '</'+tag+'>';
    return html;
  }

}
export default RulerController;

