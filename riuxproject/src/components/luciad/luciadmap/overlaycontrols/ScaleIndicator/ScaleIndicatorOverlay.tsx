import * as React from "react";

import { Map } from "@luciad/ria/view/Map";

import {ENUM_DISTANCE_UNIT} from "../../../utils/units/DistanceUnit";
import {DistanceUOM, DistanceUOMUnits} from "./DistanceUnit";
import {ScaleUtil} from "./ScaleUtil";
import throttle from "./throttle";
import {Handle} from "@luciad/ria/util/Evented";
import {MapPreferences} from "../../../interfaces/MapPreferences";

//  This is now called globaly
// import './ScaleIndicatorOverlay.scss';

export interface ScaleIndicatorProps {
    map: Map;
    preferences: MapPreferences;
    onScaleIndicatorClick?(): void
}

export interface ScaleIndicatorState {
    nodeWidth: number;
    nodeLeft: number;
    text: string;
    scaleText: string;
}

const MAX_WIDTH_PIXELS = 150;
const THROTTLE_MS = 40; // no need to re-render this component more than 25 times per second

class ScaleIndicatorOverlay < T extends ScaleIndicatorProps, S extends ScaleIndicatorState> extends React.Component<T, S> {
    static getUnitObject(distanceUnit: ENUM_DISTANCE_UNIT) {
        return DistanceUOMUnits[distanceUnit];
    }

    static findLower125(aNumber: number) {
        const lowestValue = Math.pow(10, Math.floor(Math.log(aNumber) / Math.log(10)));
        if (aNumber > 5 * lowestValue) {
            return 5 * lowestValue;
        }
        if (aNumber > 2 * lowestValue) {
            return 2 * lowestValue;
        }
        return lowestValue;
    }

    _lastMapScale = -1;
    _mapChangeListener: Handle;
    _scaleIndicatorNode: HTMLDivElement;

    // component doesn't need to re-render on every mapChange.
    // throttle calls to setState, to make sure UI keeps running smoothly.
    throttledSetState = throttle((newState: S) => {
        this.setState(newState);
    }, THROTTLE_MS);

    constructor(props: T) {
        super(props);
        this.state = this.getInitialState();
        this.onScaleIndicatorClick = this.onScaleIndicatorClick.bind(this);
    }

    protected getInitialState(): S {
        const state =  {
            nodeWidth: 200,
            nodeLeft: 0,
            text: "---",
            scaleText: "---"
        };
        return state as ScaleIndicatorState as S;
    }

    componentDidMount() {
        if (this.props.map) {
            this.scaleChange(this.props.map, this.props.preferences.units);
            this.updateMapChangeListener(this.props.map);
        }
    }

    componentWillUnmount() {
        this.updateMapChangeListener(null);
    }

    componentDidUpdate(prevProps: ScaleIndicatorProps) {
        if (prevProps.preferences !== this.props.preferences) {
            this.scaleChange(this.props.map, this.props.preferences.units, true);
        }
        if (prevProps.map !== this.props.map) {
            this.updateMapChangeListener(this.props.map);
            this.scaleChange(this.props.map, this.props.preferences.units, true);
        }
    }

    updateMapChangeListener(newMap: Map) {
        if (this._mapChangeListener) {
            this._mapChangeListener.remove();
            this._mapChangeListener = null;
        }
        if (newMap) {
            this._mapChangeListener = newMap.on("MapChange", () => this.scaleChange(newMap, this.props.preferences.units));
        }
    }

    scaleChange = (map: Map, unit: ENUM_DISTANCE_UNIT, forceUpdate?: boolean) => {
        if (map.mapScale[0] !== this._lastMapScale || forceUpdate) {
            const scalePixelsPerMeter = ScaleUtil.getScaleAtMapCenter(map);
            const maxWidthPixels = this._scaleIndicatorNode ? this._scaleIndicatorNode.getBoundingClientRect().width : MAX_WIDTH_PIXELS;
            const barWidthInMeter = maxWidthPixels / scalePixelsPerMeter;
            const localDistanceUnit = DistanceUOM.findBestDistanceUOM(ScaleIndicatorOverlay.getUnitObject(unit), barWidthInMeter);
            const barWidthInDistanceUnit = ScaleIndicatorOverlay.findLower125(localDistanceUnit.convertFromStandard(barWidthInMeter));
            const barWidthInPixels = scalePixelsPerMeter * localDistanceUnit.convertToStandard(barWidthInDistanceUnit);
            const newState: Partial<ScaleIndicatorState> = {
                nodeWidth: barWidthInPixels,
                nodeLeft: (maxWidthPixels - barWidthInPixels) / 2,
                text: barWidthInDistanceUnit + ' ' + localDistanceUnit.symbol,
                scaleText: '1:' + (1/map.mapScale[0]).toFixed(0)
            };
            this.throttledSetState(newState);
            this._lastMapScale = map.mapScale[0];
        }
    }

    protected onScaleIndicatorClick() {
        if (typeof this.props.onScaleIndicatorClick === "function") {
            this.props.onScaleIndicatorClick();
        }
    }

    render() {
        const {text, nodeWidth, nodeLeft, scaleText} = this.state;
        const mapAvailable = !!this.props.map;
        return (
            <React.Fragment>
                { mapAvailable &&
                    <div className="scaleIndicator riux-no-select" ref={ref => this._scaleIndicatorNode = ref} onClick={this.onScaleIndicatorClick}>
                        <div className="scaleIndicatorText no-text-select">{text}</div>
                        <div className="scaleIndicatorBackground" style={{width: `${nodeWidth}px`, left: `${nodeLeft}px`}}>
                            <div className="scaleIndicatorForeground" style={{left: "0px", width: "25%"}}/>
                            <div className="scaleIndicatorForeground" style={{left: "50%", width: "25%"}}/>
                        </div>
                        <div className="scaleRatioText no-text-select">{scaleText}</div>
                    </div>
                }
            </React.Fragment>
        );
    }
}

export default ScaleIndicatorOverlay;
