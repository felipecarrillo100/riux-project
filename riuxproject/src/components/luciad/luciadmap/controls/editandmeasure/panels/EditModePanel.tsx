import React from "react";
import {Map} from "@luciad/ria/view/Map";
import EMButton from "../buttons/EMButton";
import {Command, genereteUniqueID} from "../../../../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../../../../commands/ApplicationCommands";
import {LayerEditActions, setLayerEditParameters} from "../../../../interfaces/LayerEditActions";

interface Props {
    mode: string;
    map: Map;
    iconProvider?: (s: string) => any;
    sendCommand: (command: Command) => void;
}

class EditModePanel extends React.Component<Props, any>{
    render() {
        return (
            <div className="edit-measure-panels">
                <div>
                    <EMButton name={LayerEditActions.POINT} title="Add point"
                              onClick={this.onButtonEditClick}>
                        {this.iconProvider("point")}
                    </EMButton>
                    <EMButton name={LayerEditActions.LINE} title="Add line"
                              onClick={this.onButtonEditClick}>
                        {this.iconProvider("line")}
                    </EMButton>
                    <EMButton name={LayerEditActions.POLYGON} title="Add polygon"
                              onClick={this.onButtonEditClick}>
                        {this.iconProvider("polygon")}
                    </EMButton>
                </div>
                <div>
                    <EMButton name={LayerEditActions.BOUNDS} title="Add bounds"
                              onClick={this.onButtonEditClick}>
                        {this.iconProvider("bounds")}
                    </EMButton>
                    <EMButton name={LayerEditActions.CIRCLE} title="Add circle"
                              onClick={this.onButtonEditClick}>
                        {this.iconProvider("circle")}
                    </EMButton>
                    <EMButton name={LayerEditActions.PASTE} title="Paste from clipbpard"
                              onClick={this.onButtonEditClick}>
                        {this.iconProvider("paste")}
                    </EMButton>
                </div>
            </div>
        );
    }

    onButtonEditClick = (event: any) => {
        const {name} = event.target;
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.EDITLAYER,
            parameters: setLayerEditParameters({
                editType: name,
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

export default EditModePanel;
