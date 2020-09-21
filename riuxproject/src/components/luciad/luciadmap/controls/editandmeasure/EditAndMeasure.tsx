import * as React from "react";

import {Map} from "@luciad/ria/view/Map";
import {LayerControlProps} from "../layercontrol/LayerControl";
import {Handle} from "@luciad/ria/util/Evented";

import CotrolModePanel from "./panels/CotrolModePanel";
import {Command} from "../../../../../reduxboilerplate/command/reducer";
import EditModePanel from "./panels/EditModePanel";
import EMLabel from "./labels/EMLabel";
import EMSection from "./section/EMSection";
import SelectToolsModePanel from "./panels/SelectToolsModePanel";
import CountToolsModePanel from "./panels/CountToolsModePanel";
import RulerController, {Ruler2DUpdateValues} from "../../controllers/measurementcontrollers/Ruler2DController/RulerController";
import Ruler3DController, {Ruler3DUpdateValues} from "../../controllers/measurementcontrollers/Ruler3DController/Ruler3DController";
import Ruler2DModePanel from "./panels/Ruler2DModePanel";
import Ruler3DModePanel from "./panels/Ruler3DModePanel";

export interface EditAndMeasureProps {
    map: Map;
    currentLayer?: string;
    ruler2d?: Ruler2DUpdateValues;
    ruler3d?: Ruler3DUpdateValues;
    sendCommand: (command: Command) => void;
    iconProvider?: (s: string) => any;
}

export interface EditAndMeasureState {
    mode: string;
}

class EditAndMeasure < T extends EditAndMeasureProps, S extends EditAndMeasureState> extends React.Component<T, S> {
    private controlChangeListener: Handle;

    constructor(props: T) {
        super(props);
        this.controlChangeListener = null;
        this.state = this.getInitialState();
    }

    protected getInitialState(): S {
        const initState = {
            mode: this.getControllerName()
        } as EditAndMeasureState as S;
        return initState;
    }

    componentDidMount() {
        if (this.props.map) {
            this.addMapListeners();
        }
    }

    componentDidUpdate(prevProps: LayerControlProps) {
        if (prevProps.map !== this.props.map ) {
            this.removeMapListeners();
            this.addMapListeners();
            this.triggerUpdate();
        }
    }

    render() {
        let panel = "defaultMode";
        if (this.state.mode === "RulerController") {
            panel = "2dRuler"
        }
        if (this.state.mode === "Ruler3DController") {
            panel = "3dRuler"
        }
        return (
            <div className="EditAndMeasure riux-no-select">
                <EMSection>
                    <EMLabel>Mode:</EMLabel>
                    <CotrolModePanel mode={this.state.mode} map={this.props.map} sendCommand={this.props.sendCommand} iconProvider={this.props.iconProvider}/>
                </EMSection>
                { (panel === "defaultMode") &&
                    <>
                        <EMSection>
                            <EMLabel>Add Shape:</EMLabel>
                            <EditModePanel mode={this.state.mode} map={this.props.map} sendCommand={this.props.sendCommand} iconProvider={this.props.iconProvider}/>
                        </EMSection>
                        <EMSection>
                            <EMLabel>Select:</EMLabel>
                            <SelectToolsModePanel mode={this.state.mode} map={this.props.map} sendCommand={this.props.sendCommand} iconProvider={this.props.iconProvider}/>
                        </EMSection>
                        <EMSection>
                            <EMLabel>Count:</EMLabel>
                            <CountToolsModePanel mode={this.state.mode} map={this.props.map} sendCommand={this.props.sendCommand} iconProvider={this.props.iconProvider}/>
                        </EMSection>
                    </>
                }
                { (panel === "2dRuler") &&
                <>
                    <EMSection>
                        <Ruler2DModePanel values={this.props.ruler2d} map={this.props.map}/>
                    </EMSection>
                </>
                }
                { (panel === "3dRuler") &&
                <>
                    <EMSection>
                        <Ruler3DModePanel values={this.props.ruler3d} map={this.props.map}/>
                    </EMSection>
                </>
                }
            </div>
        );
    }

    private removeMapListeners() {
        if (this.controlChangeListener) {
            this.controlChangeListener.remove();
        }
        this.controlChangeListener = null;
    }

    private addMapListeners() {
        this.removeMapListeners();
        if (this.props.map)
            this.controlChangeListener = this.props.map.on('ControllerChanged', this.controllerHasChanged);
    }

    controllerHasChanged = () => {
        this.triggerUpdate();
    }

    private getControllerName() {
        if (this.props.map) {
            let controllerName = "default";
            if (this.props.map.controller instanceof RulerController) {
                controllerName = "RulerController";
            }
            if (this.props.map.controller instanceof Ruler3DController) {
                controllerName = "Ruler3DController";
            }
            // const controllerName = this.props.map.controller.constructor.name;
            return controllerName;
        } else {
            return null;
        }
    }

    private triggerUpdate() {
        this.setState({
            mode: this.getControllerName()
        })
    }
}

export default EditAndMeasure;
