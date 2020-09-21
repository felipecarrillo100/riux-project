import React from "react";
import {Map} from "@luciad/ria/view/Map";
import EMButton from "../buttons/EMButton";
import {Command, genereteUniqueID} from "../../../../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../../../../commands/ApplicationCommands";
import {LayerSelectActions, setLayerSelectParameters} from "../../../../interfaces/LayerSelectActions";

interface Props {
    mode: string;
    map: Map;
    iconProvider?: (s: string) => any;
    sendCommand: (command: Command) => void;
}

class SelectToolsModePanel extends React.Component<Props, any>{
    render() {
        return (
            <div className="edit-measure-panels">
                <EMButton name={LayerSelectActions.ALL} title="Select all"
                          onClick={this.onButtonEditClick}>
                    {this.iconProvider("all")}
                </EMButton>
                <EMButton name={LayerSelectActions.SELECTTOOL} title="Select tool"
                          onClick={this.onButtonEditClick}>
                    {this.iconProvider("select")}
                </EMButton>
                <EMButton name={LayerSelectActions.NONE} title="Select none"
                          onClick={this.onButtonEditClick}>
                    {this.iconProvider("none")}
                </EMButton>
            </div>
        );
    }

    onButtonEditClick = (event: any) => {
        const {name} = event.target;
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.SELECTFEATURES,
            parameters: setLayerSelectParameters({
                selectType: name,
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

}

export default SelectToolsModePanel;
