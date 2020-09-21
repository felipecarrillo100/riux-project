import React from "react";
import {Map} from "@luciad/ria/view/Map";
import EMButton from "../buttons/EMButton";
import {Command, genereteUniqueID} from "../../../../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../../../../commands/ApplicationCommands";
import {LayerCountActions, setLayerCountParameters} from "../../../../interfaces/LayerCountActions";

interface Props {
    mode: string;
    map: Map;
    iconProvider?: (s: string) => any;
    sendCommand: (command: Command) => void;
}

class CountToolsModePanel extends React.Component<Props, any>{
    render() {
        return (
            <div className="edit-measure-panels">
                <EMButton name={LayerCountActions.ALL} title="Count elements"
                          onClick={this.onButtonEditClick}>
                    {this.iconProvider("count")}
                </EMButton>
                <EMButton name={LayerCountActions.SELECTED} title="Count selected elements"
                          onClick={this.onButtonEditClick}>
                    {this.iconProvider("count-selected")}
                </EMButton>
            </div>
        );
    }

    onButtonEditClick = (event: any) => {
        const {name} = event.target;
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.COUNTFEATURES,
            parameters: setLayerCountParameters({
                countType: name,
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

export default CountToolsModePanel;
