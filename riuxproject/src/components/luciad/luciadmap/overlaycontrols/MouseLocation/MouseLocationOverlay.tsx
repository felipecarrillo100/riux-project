import { OutOfBoundsError } from "@luciad/ria/error/OutOfBoundsError";
import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import { LonLatPointFormat } from "@luciad/ria/shape/format/LonLatPointFormat";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import * as TransformationFactory from "@luciad/ria/transformation/TransformationFactory";
import { CoordinateReference } from "@luciad/ria/reference/CoordinateReference";
import { Transformation } from "@luciad/ria/transformation/Transformation";
import { Point } from "@luciad/ria/shape/Point";
import { Map } from "@luciad/ria/view/Map";

import * as React from "react";
import {ENUM_DISTANCE_UNIT} from "../../../utils/units/DistanceUnit";

// This is now called globally
// import "./MouseLocationOverlay.scss";

// RIA-2048: Add a base "Formatter" class to the typescript definition (no base 'Formatter' in the API)
declare interface Formatter {
    format(point: Point): string;

    format(longitude: number, latitude: number): string;
}

interface Props {
    map: Map;
    reference?: CoordinateReference;
    formatter?: Formatter;
    format?: COORDINATES_FORMAT;
    heightProvider?: any;
    displayHeight?: boolean;
    distanceUnit?: ENUM_DISTANCE_UNIT;
}

interface State {
    coordinates: string;
    height: string;
    formatter: Formatter;
    displayHeight: boolean;
}

export enum COORDINATES_FORMAT {
    DMS = "DMS",
    DDS = "DDS",
    DMSH = "DMSH",
}

const AvailableCoordinatesFormats = {
    "DDS": new LonLatPointFormat({pattern: "lat(+D5), lon(+D5)"}),
    "DMS": new LonLatPointFormat({pattern: "lat(+DMS), lon(+DMS)"}),
    "DMSH": new LonLatPointFormat({pattern: "lat(DMSa), lon(DMSa)"})
}

export class MouseLocationOverlay extends React.Component<Props, State> {

    public static defaultProps: Partial<Props> = {
        reference: ReferenceProvider.getReference("EPSG:4326"),
        format: COORDINATES_FORMAT.DMSH,
        distanceUnit: ENUM_DISTANCE_UNIT.FT,
    };

    _tempViewPoint: Point;
    _tempMapPoint: Point;
    _tempModelPoint: Point;
    _mapToModel: Transformation;
    _heightProviderRequestResolved = true;

    constructor(props: Props) {
        super(props);
        this.state = {
            coordinates: "",
            height: "0",
            formatter: props.formatter ? props.formatter : AvailableCoordinatesFormats[props.format],
            displayHeight: props.displayHeight ? props.displayHeight : !!(props.heightProvider)
        };
    }

    componentDidMount() {
        if (this.props.map) {
            this.createListenersWithModels(this.props.map, this.props.reference);
        }
    }

    createListenersWithModels(map: Map, reference: CoordinateReference) {
        map.domNode.addEventListener("mousemove", this.mouseMoved, false);
        map.domNode.addEventListener("mousedrag", this.mouseMoved, false);
        this._tempViewPoint = ShapeFactory.createPoint(null, [
            map.viewSize[0],
            map.viewSize[1]
        ]);
        this._tempMapPoint = ShapeFactory.createPoint(map.reference, [0, 0]);
        this._tempModelPoint = ShapeFactory.createPoint(reference, [0, 0]);
        this._mapToModel = TransformationFactory.createTransformation(
            map.reference,
            reference
        );
        this.updateValue();
    }

    componentWillUnmount() {
        const {map} = this.props;
        map.domNode.removeEventListener("mousemove", this.mouseMoved);
        map.domNode.removeEventListener("mousedrag", this.mouseMoved);
    }

    clearValue = () => {
        this.setState({
            coordinates: "---°--'--\",----°--'--\"",
            height: "--"
        });
    };

    componentDidUpdate(prevProps: Readonly<Props>): void {
        if (this.props.map !== prevProps.map) {
            this.createListenersWithModels(this.props.map, this.props.reference);
        }
        if (this.props.format !== prevProps.format) {
            this.setState({
                formatter: AvailableCoordinatesFormats[this.props.format]
            }, this.updateValue);
        }
    }

    mouseMoved = (event: MouseEvent) => {
        const {map} = this.props;
        try {
            const mapNodePosition = map.domNode.getBoundingClientRect();
            this._tempViewPoint.move2D(
                event.clientX - mapNodePosition.left,
                event.clientY - mapNodePosition.top
            );
            this.updateValue();
        } catch (e) {
            if (!(e instanceof OutOfBoundsError)) {
                throw e;
            } else {
                this.clearValue();
            }
        }
    };

    updateValue = () => {
        const {map} = this.props;
        const {formatter} = this.state;
        try {
            map.viewToMapTransformation.transform(
                this._tempViewPoint,
                this._tempMapPoint
            );
            this._mapToModel.transform(this._tempMapPoint, this._tempModelPoint);
            const coordinates = formatter.format(this._tempModelPoint);
            if (this.props.heightProvider) {
                this.setValueWithHeightProvider(this._tempModelPoint);
            } else {
                this.setState({
                    height: this.heightString(this._tempModelPoint.z)
                });
            }
            this.setState({coordinates});
        } catch (e) {
            this.clearValue();
        }
    };

    render() {
        const mapAvailable = !!this.props.map;
        return (
            <React.Fragment>
                { mapAvailable &&
                    <div className="mouseLocation riux-no-select">
                        <span className="coordinates">
                            {this.state.coordinates}
                        </span>
                            <span className="height">
                            {this.state.height}
                        </span>
                    </div>
                }
            </React.Fragment>
        );
    }

    private setValueWithHeightProvider(point: Point) {
        const self = this;
        const modelPoint = ShapeFactory.createPoint(this.props.reference, [point.x, point.y, point.z]);
        if (this._heightProviderRequestResolved) {
            this._heightProviderRequestResolved = false;
            this.props.heightProvider.getHeight(modelPoint).then((height: number) => {
                self._heightProviderRequestResolved = true;
                if (!modelPoint.equals(self._tempModelPoint)) {
                    self.setValueWithHeightProvider(self._tempModelPoint);
                } else {
                    if (!isNaN(height)) {
                        modelPoint.z = height;
                    }
                    self.setState({
                        height: self.heightString(modelPoint.z)
                    });
                }
            }).catch(() => {
                modelPoint.z = parseFloat(self.state.height);
                self.setState({
                    height: self.heightString(modelPoint.z)
                });
            });
        } else {
            modelPoint.z = parseFloat(self.state.height);
            self.setState({
                height: self.heightString(modelPoint.z)
            });
        }
    }

    private heightString(value: number) {
        let scale = 1;
        let unit = "m";
        switch (this.props.distanceUnit) {
            case ENUM_DISTANCE_UNIT.FT:
            case ENUM_DISTANCE_UNIT.MILE_US:
            case ENUM_DISTANCE_UNIT.NM:
                scale = 3.28084;
                unit = "ft";
                break;
            case ENUM_DISTANCE_UNIT.KM:
            case ENUM_DISTANCE_UNIT.METRE:
                break;
        }

        return Math.round(value * scale) + " " + unit;
    }
}
