class UnitObject {
    private uomName: any;
    private _uomSymbol: any;
    private _toMetreFactor: any;
    private smallerUnit: ENUM_DISTANCE_UNIT;
    private minimumMeter: number;

    constructor(uomName: any, uomSymbol: any, toMetreFactor: any, minimumMeter: number, smallerUnit: ENUM_DISTANCE_UNIT) {
        this.uomName = uomName;
        this._uomSymbol = uomSymbol;
        this._toMetreFactor = toMetreFactor;

        this.minimumMeter = minimumMeter;
        this.smallerUnit = smallerUnit
    }


    get uomSymbol(): any {
        return this._uomSymbol;
    }

    get toMetreFactor(): any {
        return this._toMetreFactor;
    }

    public convertToStandard(aValue: any) {
        return aValue * this._toMetreFactor;
    }

    public convertFromStandard(aValue: any) {
        return aValue / this._toMetreFactor;
    }

    public getDistanceText(meters:number): string {
        const minimum = this.minimumMeter;
        if (meters<minimum) {
            const smaller = DistanceUnit[this.smallerUnit];
            return smaller.getDistanceText(meters);
        } else {
            const value = meters / this._toMetreFactor;
            return "" + value.toFixed(3) + " " +this._uomSymbol;
        }
    }

    public getAreaText(squareMeters:number): string {
        const minimum = this.minimumMeter * this.minimumMeter;
        if (squareMeters<minimum) {
            const smaller = DistanceUnit[this.smallerUnit];
            return smaller.getAreaText(squareMeters);
        } else {
            const value = squareMeters / (this._toMetreFactor*this._toMetreFactor);
            return "" + value.toFixed(3) + " " +this._uomSymbol+"²";
        }
    }
}

export enum ENUM_DISTANCE_UNIT {
    METRE = "METRE",
    KM = "KM",
    FT = "FT",
    MILE_US = "MILE_US",
    NM = "NM",
}

const DistanceUnit = {
    FT: new UnitObject("Feet", "ft", 0.30480060960121924, 0, ENUM_DISTANCE_UNIT.FT),
    KM: new UnitObject("Kilometre", "km", 1000, 1000, ENUM_DISTANCE_UNIT.METRE),
    METRE: new UnitObject("Metre", "m", 1, 0, ENUM_DISTANCE_UNIT.METRE),
    MILE_US: new UnitObject("MileUS", "mi", 1609.3472186944375, 305, ENUM_DISTANCE_UNIT.FT),
    NM: new UnitObject("NauticalMile", "NM", 1852.0, 305, ENUM_DISTANCE_UNIT.FT),
};

export default DistanceUnit;
