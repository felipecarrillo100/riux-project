import * as UnitOfMeasureRegistry from "@luciad/ria/uom/UnitOfMeasureRegistry";
import {UnitOfMeasure} from "@luciad/ria/uom/UnitOfMeasure";

export const DistanceUOMUnits = {
  METRE: UnitOfMeasureRegistry.getUnitOfMeasure("Meter"),
  KM: UnitOfMeasureRegistry.getUnitOfMeasure("Kilometer"),
  FT: UnitOfMeasureRegistry.getUnitOfMeasure("Foot"),
  MILE_US: UnitOfMeasureRegistry.getUnitOfMeasure("Mile"),
  NM: UnitOfMeasureRegistry.getUnitOfMeasure("NauticalMile"),
};

export class DistanceUOM {
  static METER = UnitOfMeasureRegistry.getUnitOfMeasure("Meter");
  static KM = UnitOfMeasureRegistry.getUnitOfMeasure("Kilometer");
  static NM = UnitOfMeasureRegistry.getUnitOfMeasure("NauticalMile");
  static MILE = UnitOfMeasureRegistry.getUnitOfMeasure("Mile");
  static FT = UnitOfMeasureRegistry.getUnitOfMeasure("Foot");

  static findBestDistanceUOM(aCurrentDistanceUnit: UnitOfMeasure, aLengthInMeter: number): UnitOfMeasure {
    const aLengthInDistanceUnit = aCurrentDistanceUnit.convertFromStandard(aLengthInMeter);
    if (DistanceUOM.METER === aCurrentDistanceUnit && aLengthInDistanceUnit > 1000) {
      return DistanceUOM.KM;
    }
    if (DistanceUOM.KM === aCurrentDistanceUnit && aLengthInDistanceUnit < 1) {
      return DistanceUOM.METER;
    }
    if (DistanceUOM.FT === aCurrentDistanceUnit && DistanceUOM.MILE.convertFromStandard(aLengthInMeter) > 1) {
      return DistanceUOM.MILE;
    }
    if (DistanceUOM.MILE === aCurrentDistanceUnit && aLengthInDistanceUnit < 1) {
      return DistanceUOM.FT;
    }
    return aCurrentDistanceUnit;
  }
}
