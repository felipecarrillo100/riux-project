import React from "react";

import {Map} from "@luciad/ria/view/Map";
import RulerController, {
    Ruler2DUpdateValues,
    RulerMode
} from "../../../controllers/measurementcontrollers/Ruler2DController/RulerController";
import EMLabel from "../labels/EMLabel";

interface Props {
    values?: Ruler2DUpdateValues;
    map: Map;
}

const emptyValues: Ruler2DUpdateValues  = {
    perimeter: 0,
    area: 0,
    distance: 0,
    perimeterText: "",
    areaText: "",
    distanceText: "",
    mode: RulerMode.DISTANCE
}

const availableModes = [
    { value: RulerMode.DISTANCE, label: "Distance", title: "Measure distance" },
    { value: RulerMode.AREA, label: "Area", title: "Measure area and perimeter" },
]

class Ruler2DModePanel extends React.Component<Props, any> {
    render() {
       // const values = this.props.values ? this.props.values : emptyValues;
        const values = this.props.values;
        const renderOptions = availableModes.map((option) => (
            <option key={option.value} value={option.value} title={option.title}>{option.label}</option>
        ))
        return (
            <React.Fragment>
                <EMLabel>Ruler Mode:</EMLabel>
                <select className="EMControls" value={values.mode} onChange={this.handleSelectChange}>
                    {renderOptions}
                </select>

                { (values.mode === RulerMode.DISTANCE) &&
                <React.Fragment>
                    <EMLabel>Distance:</EMLabel>
                    <input className="EMControls" type="text" readOnly={true} defaultValue={values.distanceText}/>
                </React.Fragment>
                }
                { (values.mode === RulerMode.AREA) &&
                <React.Fragment>
                    <EMLabel>Perimeter:</EMLabel>
                    <input className="EMControls" type="text" readOnly={true} defaultValue={values.perimeterText}/>
                    <EMLabel>Area:</EMLabel>
                    <input className="EMControls" type="text" readOnly={true} defaultValue={values.areaText}/>
                </React.Fragment>
                }
            </React.Fragment>
        );
    }

    handleSelectChange = (event: any) => {
        const { value } = event.target;
        if (this.props.map) {
            const controller = this.props.map.controller as RulerController;
            if ( controller instanceof (RulerController)) {
                controller.setMode(value);
            }
        }
    }
}

export default Ruler2DModePanel;
