import { OutOfBoundsError } from "@luciad/ria/error/OutOfBoundsError";
import * as GeodesyFactory from "@luciad/ria/geodesy/GeodesyFactory";
import { LineType } from "@luciad/ria/geodesy/LineType";
import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import * as TransformationFactory from "@luciad/ria/transformation/TransformationFactory";
import { Map } from "@luciad/ria/view/Map";

const WGS84 = ReferenceProvider.getReference("CRS:84");
const geodesy = GeodesyFactory.createEllipsoidalGeodesy(WGS84);
const INCH_TO_CM = 2.54;
const CM_TO_METER = 100;

function truncate(aNumber: number) {
  const value = 100000000;
  return Math.round(aNumber * value) / value;
}

function _calculateMapUnitPerMeterRatio(map: Map) {
  const viewSize = map.viewSize;
  const viewPoint = [viewSize[0] / 2, viewSize[1] / 2];
  const mapReference = map.reference;
  const mapToModelTransformation = TransformationFactory.createTransformation(mapReference, WGS84);

  try {
    // The points on the world reference
    const mapLeftPoint = map.viewToMapTransformation.transform(
        ShapeFactory.createPoint(null, [viewPoint[0] - 50, viewPoint[1]]));
    const mapRightPoint = map.viewToMapTransformation.transform(
        ShapeFactory.createPoint(null, [viewPoint[0] + 50, viewPoint[1]]));

    // The points on the model reference
    const modelLeftPoint = mapToModelTransformation.transform(mapLeftPoint);
    const modelRightPoint = mapToModelTransformation.transform(mapRightPoint);

    // The distance between the points
    const distanceInMeters = geodesy.distance(modelLeftPoint, modelRightPoint, LineType.SHORTEST_DISTANCE);

    if (distanceInMeters === 0.0) {
      //This happens when we are zoomed in a lot
      return 1;
    } else {
      const mapDistance = Math.sqrt(Math.pow(mapLeftPoint.x - mapRightPoint.x, 2) +
                                    Math.pow(mapLeftPoint.y - mapRightPoint.y, 2));
      const mapUnitPerMeterRatio = mapDistance / distanceInMeters;

      // Now we discretize the results of the calculations.  This makes sure getting the map scale
      // after is was just set yields the same result.
      return truncate(mapUnitPerMeterRatio);
    }
  } catch (e) {
    if (e instanceof OutOfBoundsError) {
      return 1;
    }
    else {
      throw e;
    }
  }
}

export const ScaleUtil = {
  getScaleAtMapCenter(map: Map, dpi = 96) {
    const mapUnitPerMeter = _calculateMapUnitPerMeterRatio(map);
    // scale is mapscale -> how many real world cm are displayed in 1cm.
    // recalculate to pixels per meter, assume a 96dpi screen
    return map.mapScale[0] * (dpi / INCH_TO_CM) * CM_TO_METER * mapUnitPerMeter;
  }
};
