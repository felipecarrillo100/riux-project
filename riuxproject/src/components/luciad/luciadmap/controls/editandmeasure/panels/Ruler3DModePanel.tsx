import React from "react";

import {Map} from "@luciad/ria/view/Map";
import Ruler3DController, {
    Ruler3DControllerTypes,
    Ruler3DUpdateValues
} from "../../../controllers/measurementcontrollers/Ruler3DController/Ruler3DController";
import EMLabel from "../labels/EMLabel";

interface Props {
    values?: Ruler3DUpdateValues;
    map: Map;
}

const emptyValues: Ruler3DUpdateValues  = {
    area: 0,
    areaText: "",
    distance: 0,
    distanceText: "",
    mode: ""
}

const availableModes = [
    { value: Ruler3DControllerTypes.MEASURE_TYPE_DISTANCE, label: "Distance", title: "Distance" },
    { value: Ruler3DControllerTypes.MEASURE_TYPE_AREA, label: "Area", title: "Area" },
    { value: Ruler3DControllerTypes.MEASURE_TYPE_ORTHO,  label: "Ortho", title: "Orthogoal measurement" },
    { value: Ruler3DControllerTypes.MEASURE_TYPE_HEIGHT, label: "Height", title: "Measure height of each point" },
]

class Ruler3DModePanel extends React.Component<Props, any> {
    render() {
    //    const values = this.props.values ? this.props.values : emptyValues;
        const values = this.props.values;
        const renderOptions = availableModes.map((option) => (
            <option key={option.value} value={option.value} title={option.title}>{option.label}</option>
        ))
        return (
            <React.Fragment>
                <EMLabel>Ruler Mode:</EMLabel>
                <select className="EMControls" value={values.mode} onChange={this.handleSelectChange} >
                    {renderOptions}
                </select>

                <EMLabel>Distance:</EMLabel>
                <input className="EMControls" type="text" readOnly={true} defaultValue={values.distanceText}/>
                { (values.mode === Ruler3DControllerTypes.MEASURE_TYPE_AREA) &&
                    <React.Fragment>
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
            const controller = this.props.map.controller as Ruler3DController;
            if ( controller instanceof (Ruler3DController)) {
                controller.setMode(value);
            }
        }
    }
}

export default Ruler3DModePanel;
