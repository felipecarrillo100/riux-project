import {COORDINATES_FORMAT} from "../luciadmap/overlaycontrols/MouseLocation/MouseLocationOverlay";
import {ENUM_DISTANCE_UNIT} from "../utils/units/DistanceUnit";

export interface MapPreferences {
    units: ENUM_DISTANCE_UNIT;
    coordinates: COORDINATES_FORMAT;
}
