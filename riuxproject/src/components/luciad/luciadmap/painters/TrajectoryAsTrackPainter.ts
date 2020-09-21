import {
  PaintState,
} from '@luciad/ria/view/feature/FeaturePainter';
import { GeoCanvas } from '@luciad/ria/view/style/GeoCanvas';
import { Feature } from '@luciad/ria/model/feature/Feature';
import { Shape } from '@luciad/ria/shape/Shape';
import { Layer } from '@luciad/ria/view/Layer';
import { Map } from '@luciad/ria/view/Map';
import { ShapeType } from '@luciad/ria/shape/ShapeType';
import JSONTools from '../../utils/jsontools/JSONTools';
import SimpleFeaturePainter, { LineGeometries } from './SimpleFeaturePainter';
import { ShapeProvider } from '@luciad/ria/view/feature/ShapeProvider';
import { createSphericalGeodesy } from '@luciad/ria/geodesy/GeodesyFactory';
import { Geodesy } from '@luciad/ria/geodesy/Geodesy';


class TrajectoryAsTrackPainter extends SimpleFeaturePainter {
  private time: number;
  private GEODESY: Geodesy | null = null;
  private timeOffset: number;
  constructor(options?: any) {
    super();
    this.timeOffset = options && options.timeOffset ? options.timeOffset : 0;
    this.time = options && options.time ? options.time : 0;
    this.changePainterSettings(
      options ? options : SimpleFeaturePainter.defaultSettings()
    );
  }

  static searchClosestIndex(value: number, a: number[]) {
    if (value <= a[0]) {
      return 0;
    }
    if (value >= a[a.length - 1]) {
      return a.length - 1;
    }

    let lo = 0;
    let hi = a.length - 1;

    while (lo <= hi) {
      const mid = Math.floor((hi + lo) / 2);
      if (value < a[mid]) {
        hi = mid - 1;
      } else if (value > a[mid]) {
        lo = mid + 1;
      } else {
        return mid;
      }
    }
    return hi;
  }

  public setTime(t: number) {
    this.time = t;
    if (this.shapeProvider) {
      this.shapeProvider.invalidateAll();
    }
  }

  public setTimeOffset(t: number) {
    this.timeOffset = t;
  }

  public getTimeOffset() {
    return this.timeOffset;
  }

  createShapeProvider() {
    this.shapeProvider = new ShapeProvider();
    this.shapeProvider.provideShape = (feature) => {
      if (
        feature.shape !== null &&
        feature.shape.reference !== null &&
        feature.shape.type === ShapeType.POLYLINE
      ) {
        if (this.GEODESY == null) {
          this.GEODESY = createSphericalGeodesy(feature.shape.reference);
        }

        const shape = feature.shape as any;
        const properties = feature.properties as any;
        const timestamps = properties.timestamps;
        const maxTime = timestamps[timestamps.length - 1];
        const minTime = timestamps[0];
        const time = this.time - this.timeOffset;
        const restrictedTime =
          time > maxTime ? maxTime : time < minTime ? minTime : time;
        const index = TrajectoryAsTrackPainter.searchClosestIndex(
          restrictedTime,
          timestamps
        );

        let leftIndex = index;
        let rightIndex = index + 1;
        let finalPoint = false;

        if (rightIndex >= timestamps.length) {
          leftIndex = index - 1;
          rightIndex = index;
          finalPoint = true;
        }
        const leftTimeStamp = timestamps[leftIndex];
        const rightTimeStamp = timestamps[rightIndex];

        const fraction =
          rightTimeStamp - leftTimeStamp === 0
            ? 1
            : (1.0 * (restrictedTime - leftTimeStamp)) /
              (rightTimeStamp - leftTimeStamp);

        const p1 = shape.getPoint(leftIndex);
        const p2 = shape.getPoint(rightIndex);

        let point;
        if (finalPoint) {
          point = p2;
        } else {
          point = this.GEODESY.interpolate(p1, p2, fraction);
        }
        const azimuth = this.GEODESY.forwardAzimuth(p1, p2);
        (feature.properties as any)._calculated_heading = azimuth;
        return point;
      } else {
        return null;
      }
    };
  }

  paintBody(
    geoCanvas: GeoCanvas,
    feature: Feature,
    shape: Shape,
    layer: Layer,
    map: Map,
    paintState: PaintState
  ) {
    let style;
    if (paintState.selected) {
      style = this.style.selected;
    } else {
      style = this.style.default;
    }
    if (shape.type === ShapeType.SHAPE_LIST) {
      const MyShape = shape as any;
      for (const geometry of MyShape.geometries) {
        this.paintBody(geoCanvas, feature, geometry, layer, map, paintState);
      }
    } else if (shape.type === ShapeType.POINT) {
      let heading;
      let scale = 1;
      if (
        style.pointStyle.heading.property &&
        style.pointStyle.heading.property !== ''
      ) {
        heading = JSONTools.getValue(
          feature.properties,
          style.pointStyle.heading.property
        );
        scale = style.pointStyle.heading.scale;
        if (heading) {
          heading = heading * scale;
        } else {
          if (style.pointStyle.heading.default !== '') {
            heading = Number(style.pointStyle.heading.default);
          }
        }
      } else {
        if (style.pointStyle.heading.default !== '') {
          heading = Number(style.pointStyle.heading.default);
        }
      }
      const finalPointStyle =
        typeof style.pointStyle.url !== 'undefined' &&
        style.pointStyle.url.trim() !== ''
          ? this.customizePointStyle(
              style.pointStyle,
              {
                url: style.pointStyle.url,
                width: style.pointStyle.size.width,
                height: style.pointStyle.size.height,
              },
              heading
            )
          : this.customizePointStyle(
              style.pointStyle,
              { image: style.pinImage },
              heading
            );
      geoCanvas.drawIcon(shape, finalPointStyle);
    } else if (LineGeometries.includes(shape.type)) {
      geoCanvas.drawShape(shape, style.lineStyle);
    } else {
      geoCanvas.drawShape(shape, style.shapeStyle);
    }
  }
}

export default TrajectoryAsTrackPainter;
