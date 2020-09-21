import * as React from "react";
import * as ReactDOM from "react-dom";

import { OutOfBoundsError } from "@luciad/ria/error/OutOfBoundsError";
import * as GeodesyFactory from "@luciad/ria/geodesy/GeodesyFactory";
import { Geodesy } from "@luciad/ria/geodesy/Geodesy";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import { Point } from "@luciad/ria/shape/Point";
import { Map } from "@luciad/ria/view/Map";
import {Handle} from "@luciad/ria/util/Evented";

// SCSS is now globally imported
// import "./CompassControl.scss";

const CompassIcon = (size: number | string) => (
    <svg aria-hidden="true" focusable="false" width={size} height={size}
         role="img" xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 576 512"><path fill="currentColor"
                                     d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
    </svg>
);

const compassIcon = CompassIcon("18px");

interface CompassOverlayProps {
  map: Map;
}

interface CompassOverlayState {
  rotation: number;
}

const toDegrees = (angle: number) => {
  return angle * (180 / Math.PI);
}

/**
 * Component that shows a compass on top of a LuciadRIA map.
 * The direction of the compass is always calculated at the center of the map.
 */
export class CompassControl extends React.Component<CompassOverlayProps, CompassOverlayState> {
  private _viewPoint1: Point;
  private _viewPoint2: Point;
  private _mapPoint1: Point;
  private _mapPoint2: Point;
  private _geodesy: Geodesy;
  // private _mapChangeListener: luciad.util.RemoveHandle;
  private _compassDOMElement: Element;
  private _lastRotateAngle: number;
  private mousedownCapture: boolean;
  private _mapChangeListener: Handle;

  constructor(props: CompassOverlayProps) {
    super(props);
    this.state = {
      rotation: 0
    };
    this._viewPoint1 = ShapeFactory.createPoint(null, [0, 0]);
    this._viewPoint2 = ShapeFactory.createPoint(null, [0, 20]);
    this.mousedownCapture = false;
  }

  componentDidMount() {
   if (this.props.map) {
      this.mapInitialized(this.props);
   }
   this.mousedownCapture = false;
  }

  componentDidUpdate(prevProps: CompassOverlayProps) {
    if (this.props.map !== prevProps.map) {
      this.mapDestroyed();
      this.mapInitialized(this.props);
    }
  }

  componentWillUnmount() {
    this.mapDestroyed();
  }

  mapInitialized(props: CompassOverlayProps) {
    const {map} = props;
    this._mapPoint1 = ShapeFactory.createPoint(map.reference, [0, 0]);
    this._mapPoint2 = ShapeFactory.createPoint(map.reference, [0, 20]);
    this._geodesy = GeodesyFactory.createEllipsoidalGeodesy(map.reference);
    this._mapChangeListener = map.on("MapChange", () => {
      const mapAzimuth = this.getCurrentMapAzimuth();
      this.setState({rotation: mapAzimuth});
    });
    window.addEventListener("resize", this.updateViewPoints);
    this.updateViewPoints();
  }

  mapDestroyed() {
    if (this._mapChangeListener) {
      this._mapChangeListener.remove();
    }
    window.removeEventListener("resize", this.updateViewPoints);
  }

  updateViewPoints = () => {
    const {map} = this.props;
    const centerX = map.viewSize[0] / 2;
    const centerY = map.viewSize[1] / 2;
    this._viewPoint1.move2D(centerX, centerY);
    this._viewPoint2.move2D(centerX, centerY - 20);
    this._compassDOMElement = ReactDOM.findDOMNode(this) as Element;
  }

  getCurrentMapAzimuth = () => {
    const {map} = this.props;
    try {
      map.viewToMapTransformation.transform(this._viewPoint1, this._mapPoint1);
      map.viewToMapTransformation.transform(this._viewPoint2, this._mapPoint2);
      return -this._geodesy.forwardAzimuth(this._mapPoint1, this._mapPoint2);
    } catch (error) {
      if (error instanceof OutOfBoundsError) {
        return 0;
      }
      throw error;
    }

  }

  rotateMapToAzimuth = (targetAzimuth: number) => {
    const {map} = this.props;
    const currentMapAzimuth = this.getCurrentMapAzimuth();
    const deltaRotation = targetAzimuth + currentMapAzimuth;
    if (deltaRotation !== 0 && !isNaN(deltaRotation)) {
      if (map.reference.identifier === "EPSG:4978") {
        map.mapNavigator.rotate({
          deltaYaw: deltaRotation ,
          animate: true
        });
      } else if(
          map.reference.identifier === "EPSG:32662" ||
          map.reference.identifier === "EPSG:4326" ||
          map.reference.identifier === "EPSG:3857" ||
          map.reference.identifier === "EPSG:4087" ||
          map.reference.identifier === "EPSG:3395" ) {
        map.mapNavigator.rotate({
          animate: true,
          targetRotation : 0
        });
      }
        else {
        map.mapNavigator.rotate({
          deltaRotation,
          animate: true
        });
      }
    }
  }

  getAngle = (evt: MouseEvent) => {
    const rect = this._compassDOMElement.getBoundingClientRect();
    const compassCenterX = rect.left + (rect.width / 2);
    const compassCenterY = rect.top + (rect.height / 2);
    const mouseX = evt.clientX - compassCenterX;
    const mouseY = evt.clientY - compassCenterY;
    return toDegrees(Math.atan2(mouseY, mouseX));
  }

  // listening to mouse move events is a lot easier than listening to drag events
  // drag events in the browser are a mess
  mouseDown = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (evt.buttons === 1) {
      this._lastRotateAngle = this.getAngle(evt.nativeEvent);
      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
      this.mousedownCapture = true;
    }
  }

  mouseMove = (evt: MouseEvent) => {
    if (evt.buttons !== 1 || this.mousedownCapture===false) {
      return;
    }
    const {map} = this.props;
    const currentAngle = this.getAngle(evt);
    const diffAngle = this._lastRotateAngle - currentAngle;
    if (diffAngle !== 0 && !isNaN(diffAngle)) {
      if (map.reference.identifier === "EPSG:4978") {
        map.mapNavigator.rotate({deltaYaw: diffAngle, animate: false});
      } else {
        map.mapNavigator.rotate({deltaRotation: diffAngle, animate: false});
      }
    }
    this._lastRotateAngle = currentAngle;
  }

  mouseUp = (evt: MouseEvent) => {
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('mouseup', this.mouseUp);
    this.mousedownCapture = false;
  }


  render() {
    const {rotation} = this.state;
    const mapAvailable = !!this.props.map;
    return (
        <React.Fragment>
          { mapAvailable &&
            <div className="overlay-container-compass riux-no-select">
              <div className="compass">
                <div className="compassIconContainer" >
                  <span className="compassIcon" >
                    {compassIcon}
                  </span>
                </div>
                <div className="compassBorder" />
                <div className="compassDisplay" style={{
                  transform: `rotate(${rotation}deg)`,
                }}>
                  <div className="ring"
                       onMouseDown={this.mouseDown}
                       onMouseMove={(evt) => {this.mouseMove(evt.nativeEvent);}}
                       onMouseUp={(evt) => {this.mouseUp(evt.nativeEvent);}}
                  />
                  <div className="north nodrag" onClick={(event) => this.rotateMapToAzimuth(0)} onDragStart={this.preventDefault} />
                  <div className="east nodrag"  onClick={(event) => this.rotateMapToAzimuth(90)} onDragStart={this.preventDefault} />
                  <div className="south nodrag" onClick={(event) => this.rotateMapToAzimuth(180)} onDragStart={this.preventDefault} />
                  <div className="west nodrag" onClick={(event) => this.rotateMapToAzimuth(270)} onDragStart={this.preventDefault} />
                </div>
              </div>
            </div>
          }
        </React.Fragment>
    );
  }

  private preventDefault = (event:any) =>{
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}

export default CompassControl;
