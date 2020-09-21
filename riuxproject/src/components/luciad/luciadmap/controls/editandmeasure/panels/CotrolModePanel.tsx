import React from "react";
import {Map} from "@luciad/ria/view/Map";
import EMButton from "../buttons/EMButton";
import {Command, genereteUniqueID} from "../../../../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../../../../commands/ApplicationCommands";
import {LayerMeasureActions, setLayerMeasureParameters} from "../../../../interfaces/LayerMeasureActions";
import EMSection from "../section/EMSection";

interface Props {
    mode: string;
    map: Map;
    iconProvider?: (s: string) => any;
    sendCommand: (command: Command) => void;
}

class CotrolModePanel extends React.Component<Props, any>{
    render() {
        const is3DMap = this.is3DMap(this.props.map);
        return (
            <div className="edit-measure-panels">
                <EMButton active={this.props.mode==="GetFeatureInfoController"} title="Default Controller"
                          onClick={this.onButtonDefaultClick("default")}>
                    {this.iconProvider("default")}
                </EMButton>
                <EMButton active={this.props.mode==="RulerController"}  title="Ruler 2D Controller"
                          onClick={this.onButtonMeasureClick(LayerMeasureActions.RULER2D)}>
                    {this.iconProvider("ruler2d")}
                </EMButton>
                {
                    is3DMap &&
                    <EMButton active={this.props.mode==="Ruler3DController"} title="Ruler 3D Controller"
                              onClick={this.onButtonMeasureClick(LayerMeasureActions.RULER3D)}>
                        {this.iconProvider("ruler3d")}
                    </EMButton>
                }
            </div>
        );
    }

    onButtonDefaultClick = (name: string) => (event: any) => {
        console.log("Called: " + name);
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.DEFAULTCONTROLLER,
            parameters: {}
        }
        if (typeof this.props.sendCommand === "function") {
            this.props.sendCommand(command);
        }
    }

    onButtonMeasureClick = (name: string) => (event: any) => {
        console.log("Called 2: " + name);
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.MEASURE,
            parameters: setLayerMeasureParameters({
                "measureType": name,
            }),
        }
        if (typeof this.props.sendCommand === "function") {
            this.props.sendCommand(command);
        }
    }

    protected iconProvider(name: string) {
        if (typeof this.props.iconProvider === "function") {
            return this.props.iconProvider(name);
        }
        return name;
    }

    private is3DMap(map: Map) {
        if (map) {
            const reference = map.reference;
             return  reference.identifier === "EPSG:4978";
        } else {
            return false;
        }
    }
}

export default CotrolModePanel
