import DistanceUnit, {ENUM_DISTANCE_UNIT} from "../../../../utils/units/DistanceUnit";


interface FormatUtilOptions {
    units: ENUM_DISTANCE_UNIT;
}

class FormatUtil{
    private _units: ENUM_DISTANCE_UNIT;

    constructor(options?:FormatUtilOptions) {
        options = options ? options : {units : ENUM_DISTANCE_UNIT.KM};
        this._units = options.units;
    }

    get units(): ENUM_DISTANCE_UNIT {
        return this._units;
    }

    set units(value: ENUM_DISTANCE_UNIT) {
        this._units = value;
    }

    public angleText(angle:number, min?:number, max?:number) {
        min = min || 10;
        max = max || 80;
        if (!angle || angle < min || angle > max) {
            return "";
        }
        return angle.toFixed(1) + " deg";
    }

    public distanceText(distance:number, min?:number) {
        min = min || 0;
        if (!distance || distance < min) {
            return "";
        }
        const unit = DistanceUnit[this.units];
        return unit.getDistanceText(distance);
        /*

        min = min || 1;
        if (!distance || distance < min) {
            return "";
        }
        if (distance > 1000) {
            distance /= 1000;
            return distance.toFixed(2) + " km";
        }
        return distance.toFixed(2) + " m";
         */
    }

    public heightText(h:number) {
        if (this.units === ENUM_DISTANCE_UNIT.FT ||  this.units === ENUM_DISTANCE_UNIT.MILE_US || this.units === ENUM_DISTANCE_UNIT.NM ) {
            const feet = DistanceUnit[ENUM_DISTANCE_UNIT.FT];
            const feets = h / feet.toMetreFactor;
            return feets.toFixed(1) + " " + feet.uomSymbol;
        } else {
            const metre = DistanceUnit[ENUM_DISTANCE_UNIT.METRE];
            return h.toFixed(1) + " " + metre.uomSymbol;
        }
    }

    public areaText(area:number, min?:number) {
        min = min || 0;
        if (!area || area < min) {
            return "";
        }
        const unit = DistanceUnit[this.units];
        return unit.getAreaText(area);
        /*
        const m2Tokm2 = 1000 * 1000;
        min = min || 1;
        if (!area || area < min) {
            return "";
        }
        if (area > m2Tokm2) {
            area /= m2Tokm2;
            return area.toFixed(2) + " km²";
        }
        return area.toFixed(2) + " m²";

         */
    }

}

export default FormatUtil;
