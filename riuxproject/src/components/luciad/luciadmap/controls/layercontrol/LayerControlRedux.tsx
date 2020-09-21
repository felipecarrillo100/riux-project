import LayerControl, {LayerControlState} from "./LayerControl";
import {IAppState} from "../../../../../reduxboilerplate/store";
import {connect} from "react-redux";
import GlobalContextMenu from "../../../../customcontextmenu/GlobalContextMenu";
import {Map} from "@luciad/ria/view/Map";
import React from "react";
import {Actions} from "../../../../../reduxboilerplate/actions";
import {SetCurrentLayer} from "../../../../../reduxboilerplate/luciadmap/actions";

interface DispatchProps {
    setCurrentLayer: (layerID: string | undefined | null) => void;
}

interface StateProps {
    contextMenu: GlobalContextMenu;
    map: Map;
    currentLayer: string;
}

type Props =  StateProps & DispatchProps;

type State = LayerControlState;

class LayerControlReduxInternal extends LayerControl<Props, State> {

}

function mapStateToProps(state: IAppState): StateProps {
    return {
        contextMenu: state.contextMenu.contextMenu,
        currentLayer: state.map.currentLayer,
        map: state.map.map
    };
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
    return {
        setCurrentLayer: (layeId: string | undefined | null) => {
            dispatch(SetCurrentLayer(layeId));
        },
    };
}

const LayerControlRedux = connect<StateProps, DispatchProps>(
    mapStateToProps, mapDispatchToProps
)(LayerControlReduxInternal);

export default LayerControlRedux;
