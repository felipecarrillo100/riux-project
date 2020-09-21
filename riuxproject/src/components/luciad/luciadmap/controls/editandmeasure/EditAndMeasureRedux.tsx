import * as React from "react";

import {Map} from "@luciad/ria/view/Map";

import {Command} from "../../../../../reduxboilerplate/command/reducer";
import {IAppState} from "../../../../../reduxboilerplate/store";
import {Actions} from "../../../../../reduxboilerplate/actions";
import {connect} from "react-redux";
import EditAndMeasure, {EditAndMeasureProps} from "./EditAndMeasure";
import {SendCommand} from "../../../../../reduxboilerplate/command/actions";
import {Ruler2DUpdateValues} from "../../controllers/measurementcontrollers/Ruler2DController/RulerController";
import {Ruler3DUpdateValues} from "../../controllers/measurementcontrollers/Ruler3DController/Ruler3DController";

interface StateProps {
    map: Map;
    ruler2d: Ruler2DUpdateValues;
    ruler3d: Ruler3DUpdateValues;
}

interface DispatchProps {
    sendCommand: (command: Command) => void;
}

export interface EditAndMeasureState {
    mode: string;
}

type Props =  EditAndMeasureProps & StateProps & DispatchProps;

type State = EditAndMeasureState;

class EditAndMeasureReduxInternal extends EditAndMeasure<Props, State> {
    // Nothing to implement just wire the REDUX
}

function mapStateToProps(state: IAppState): StateProps {
    return {
        map: state.map.map,
        ruler2d: state.map.ruler2d,
        ruler3d: state.map.ruler3d
    };
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
    return {
        sendCommand: (command: Command) => {
            dispatch(SendCommand(command));
        },
    };
}

const EditAndMeasureRedux =  connect<StateProps, DispatchProps>(
    mapStateToProps, mapDispatchToProps
)(EditAndMeasureReduxInternal);

export default EditAndMeasureRedux;

