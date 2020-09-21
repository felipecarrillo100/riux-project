import React from "react";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import LuciadMap from "../luciadmap/LuciadMap";
import {Map} from "@luciad/ria/view/Map";

import "./Workspace.scss";

import {Actions} from "../../../reduxboilerplate/actions";
import {
    SetCurrentLayer,
    SetLuciadMap,
    SetMapProjection,
    SetRuler2D,
    SetRuler3D
} from "../../../reduxboilerplate/luciadmap/actions";
import {connect} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import {Command, genereteUniqueID, onCommandReceived} from "../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {CompleteCommand, SendCommand} from "../../../reduxboilerplate/command/actions";
import {
    COORDINATES_FORMAT,
    MouseLocationOverlay
} from "../luciadmap/overlaycontrols/MouseLocation/MouseLocationOverlay";
import {ENUM_DISTANCE_UNIT} from "../utils/units/DistanceUnit";
import {MapPreferences} from "./../interfaces/MapPreferences";
import ScaleIndicatorOverlayRedux from "../luciadmap/overlaycontrols/ScaleIndicator/ScaleIndicatorOverlayRedux";
import ZoomButtonsOverlay from "../luciadmap/overlaycontrols/ZoomButtons/ZoomButtonsOverlay";
import CompassControl from "../luciadmap/controls/compass/CompassControl";
import GlobalContextMenu from "../../../components/customcontextmenu/GlobalContextMenu";
import MobileCheck from "../../../utils/ismobile/MobileCheck";
import {setWINDOWMANAGERParameters, WindowManagerActions,} from "../../desktop/interfaces/WindowManagerActions";
import {BasicFormRecords} from "../../forms/BasicForms";
import {WorkspaceActions} from "../interfaces/WorkspaceActions";
import {Ruler2DUpdateValues} from "../luciadmap/controllers/measurementcontrollers/Ruler2DController/RulerController";
import {Ruler3DUpdateValues} from "../luciadmap/controllers/measurementcontrollers/Ruler3DController/Ruler3DController";
import BingMapsAtribution from "../luciadmap/overlaycontrols/BingMapsAtribution/BingMapsAtribution";

interface StateProps {
    command: Command | null;
    mapProjection: string;
    map: WebGLMap | null;
    currentLayer: string | undefined | null;
    contextMenu: GlobalContextMenu | null;
}

interface DispatchProps {
    handleCommand: () => void;
    setLuciadMap: (map: Map) => void;
    sendCommand: (command: Command) => void;
    setMapProjection: (projection: string) => void;
    set2dRuler: (newValues: Ruler2DUpdateValues) => void;
    set3dRuler: (newValues: Ruler3DUpdateValues) => void;
    setCurrentLayer: (layerID: string | undefined | null) => void;
}

type Props = StateProps & DispatchProps;


class WorkspaceInternal extends React.Component<Props>{
    private preferences: MapPreferences;
    private luciadMapRef: LuciadMap<any, any>;
    private initialMapProjection: string;

    constructor(props: Props) {
        super(props);
        this.preferences = {units: ENUM_DISTANCE_UNIT.METRE, coordinates: COORDINATES_FORMAT.DMS};
        // this.initialMapProjection = "EPSG:3857";
        this.initialMapProjection = "EPSG:4978";
    }

    componentDidMount() {
        const map = this.luciadMapRef.getMap();
        if (map) {
            this.props.setLuciadMap(this.luciadMapRef.getMap());
            this.showLayerManager();
        }
    }

    showLayerManager() {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.WINDOWMANAGER,
            parameters: setWINDOWMANAGERParameters({
                actionType: WindowManagerActions.CREATEWINDOW,
                id: BasicFormRecords.LayerManager,
                toggle: true,
                formName: BasicFormRecords.LayerManager,
                top: 0,
                right: 0,
            }),
        }
        this.props.sendCommand(command);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>) {
        onCommandReceived(
            prevProps,
            this.props,
            [
                ApplicationCommands.CREATEANYLAYER,
                ApplicationCommands.ADDLOCATION,
                ApplicationCommands.EDITLAYER,
                ApplicationCommands.SELECTFEATURES,
                ApplicationCommands.MEASURE,
                ApplicationCommands.DEFAULTCONTROLLER,
                ApplicationCommands.COUNTFEATURES
            ],
            true
        ).then((command) => {
            this.luciadMapRef.applyCommand(command);
        });
        onCommandReceived(
            prevProps,
            this.props,
            [
                ApplicationCommands.CHANGEWORKSPACEPROPS,
            ]
        ).then((command) => {
            this.applyCommand(command);
        });
    }

    onMapUpdate = (map: Map) => {
        this.props.setLuciadMap(map);
        if (map) {
            const x = map.reference.identifier;
            if (map) this.props.setMapProjection(map.reference.identifier);
        }
    }

    render() {
        return (
            <div className="Workspace">
                <LuciadMap mapProjection={this.props.mapProjection ? this.props.mapProjection : this.initialMapProjection}
                           mapPreferences={this.preferences}
                           contextMenu={this.props.contextMenu}
                           onMapUpdate={this.onMapUpdate}
                           currentLayer={this.props.currentLayer}
                           setCurrentLayer={this.setCurrentLayer}
                           onRuler2dUpdate={this.props.set2dRuler}
                           onRuler3dUpdate={this.props.set3dRuler}
                           ref = {(ref) => {this.luciadMapRef = ref}} />
                <div className="navigation-overlay-controls">
                    <CompassControl map={this.props.map}/>
                </div>
                {   !MobileCheck.isMobile() &&
                    <MouseLocationOverlay map={this.props.map} displayHeight={true} format={this.preferences.coordinates} distanceUnit={this.preferences.units} />
                }
                <ScaleIndicatorOverlayRedux map={this.props.map} preferences={this.preferences} />
                <ZoomButtonsOverlay map={this.props.map} />
                <BingMapsAtribution map={this.props.map} />
            </div>
        );
    }

    setCurrentLayer = (layerID: string) => {
        this.props.setCurrentLayer(layerID);
    }

    applyCommand = (command: Command) => {
        console.log(
            'Command received at LuciadMap: ' +  command.action + ' ',
            command.parameters
        );
        switch (command.action) {
            case ApplicationCommands.CHANGEWORKSPACEPROPS:
                this.changeWorkSpaceProps(command);
                break;
        }
    }

    private changeWorkSpaceProps(command: Command) {
        const map = this.props.map;
        if (map) {
            switch (command.parameters.workspaceAction) {
                case WorkspaceActions.CHANGEMAPPROJECTION:
                    this.props.setMapProjection(command.parameters.mapProjection);
                    break;
            }
        }
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
        setLuciadMap: (map: Map) => {
            dispatch(SetLuciadMap(map as Map));
        },
        sendCommand: (command: Command) => {
            dispatch(SendCommand(command))
        },
        setMapProjection: (projection: string) => {
            dispatch(SetMapProjection(projection))
        },
        set2dRuler: (values) => {
            dispatch(SetRuler2D(values))
        },
        set3dRuler: (values) => {
            dispatch(SetRuler3D(values))
        },
        setCurrentLayer: (layeId: string | undefined | null) => {
            dispatch(SetCurrentLayer(layeId));
        },
    };
}

const Workspace = connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps
)(WorkspaceInternal);

export default Workspace;
