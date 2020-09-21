import React from "react";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import LuciadMap, {LuciadMapProps} from "../luciadmap/LuciadMap";
import {Map} from "@luciad/ria/view/Map";

import "./MainMap.scss";
import {Actions} from "../../../reduxboilerplate/actions";
import {SetLuciadMap} from "../../../reduxboilerplate/luciadmap/actions";
import {connect} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import {Command, onCommandReceived} from "../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {CompleteCommand, SendCommand} from "../../../reduxboilerplate/command/actions";
import {
    COORDINATES_FORMAT,
    MouseLocationOverlay
} from "../luciadmap/overlaycontrols/MouseLocation/MouseLocationOverlay";
import {ENUM_DISTANCE_UNIT} from "../utils/units/DistanceUnit";
import {MapPreferences} from "../interfaces/MapPreferences";
import ScaleIndicatorOverlayRedux from "../luciadmap/overlaycontrols/ScaleIndicator/ScaleIndicatorOverlayRedux";
import ZoomButtonsOverlay from "../luciadmap/overlaycontrols/ZoomButtons/ZoomButtonsOverlay";
import CompassControl from "../luciadmap/controls/compass/CompassControl";
import GlobalContextMenu from "../../../components/customcontextmenu/GlobalContextMenu";
import LayerControlHolder from "../luciadmap/controls/layercontrol/LayerControlHolder";
import MobileCheck from "../../../utils/ismobile/MobileCheck";
import LayerControlRedux from "../luciadmap/controls/layercontrol/LayerControlRedux";
import QuickTest from "../testbar/QuickTest";

interface StateProps {
    command: Command | null;
    mapProjection: string;
    map: WebGLMap | null;
    currentLayer: string | undefined | null;
    contextMenu: GlobalContextMenu | null;
}

interface DispatchProps {
    handleCommand: () => void;
    onMapUpdate: (map: Map) => void;
    sendCommand: (command: Command) => void;
}

type Props = StateProps & DispatchProps & LuciadMapProps;

interface State {
    layerControlRedux: any;
}

class MainMapInternal extends LuciadMap<Props, State>{
    private preferences: MapPreferences;

    constructor(props: Props) {
        super(props);
        this.preferences = {units: ENUM_DISTANCE_UNIT.METRE, coordinates: COORDINATES_FORMAT.DMS};
        this.state = {
            layerControlRedux: undefined
        }
    }

    componentDidMount() {
        super.componentDidMount();
        setTimeout(() => {
            this.setState({
                layerControlRedux: (<LayerControlRedux />)
            })
        }, 10000)
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>) {
        super.componentDidUpdate(prevProps, prevState)
        onCommandReceived(
            prevProps,
            this.props,
            [
                ApplicationCommands.CREATEANYLAYER,
                ApplicationCommands.ADDLOCATION
            ]
        ).then((command) => {
            this.applyCommand(command);
        });
    }

    render() {
        return (
            <div className="Workspace">
                <div className="LuciadMap" ref = {(ref) => {this.mapRef = ref}} />
                <QuickTest />
                <div className="navigation-overlay-controls">
                    <CompassControl map={this.props.map}/>
                </div>
                <LayerControlHolder>
                    <LayerControlRedux />
                </LayerControlHolder>

                <LayerControlHolder top={"300px"}>
                    {this.state.layerControlRedux}
                </LayerControlHolder>
                {   !MobileCheck.isMobile() &&
                    <MouseLocationOverlay map={this.props.map} displayHeight={true} format={this.preferences.coordinates} distanceUnit={this.preferences.units} />
                }
                <ScaleIndicatorOverlayRedux map={this.props.map} preferences={this.preferences} />
                <ZoomButtonsOverlay map={this.props.map} />
            </div>
        );
    }

    protected createMap() {
        super.createMap();
    }

    protected destroyMap() {
        super.destroyMap();
    }
}

function mapStateToProps(state: IAppState): StateProps {
    const props: StateProps = {
        command: state.command.command,
        map: state.map.map as WebGLMap,
        mapProjection: state.map.mapProjection,
        currentLayer: state.map.currentLayer,
        contextMenu: state.contextMenu.contextMenu,
    };
    return props;
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
    return {
        handleCommand: () => {
            dispatch(CompleteCommand());
        },
        onMapUpdate: (map: Map) => {
            dispatch(SetLuciadMap(map));
        },
        sendCommand: (command: Command) => {
            dispatch(SendCommand(command))
        }
    };
}

const MainMap = connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps
)(MainMapInternal);

export default MainMap;
