import React from "react";

import "./QuickTest.scss";
import ScreenMessage from "../../screenmessage/ScreenMessage";
import {Command, genereteUniqueID} from "../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../interfaces/LayerTypes";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";
import {RasterSamplingMode} from "@luciad/ria/model/tileset/RasterSamplingMode";
import {IAppState} from "../../../reduxboilerplate/store";
import {Actions} from "../../../reduxboilerplate/actions";
import {SendCommand} from "../../../reduxboilerplate/command/actions";
import {connect} from "react-redux";
import {LayerEditActions} from "../interfaces/LayerEditActions";
import {LayerSelectActions, setLayerSelectParameters} from "../interfaces/LayerSelectActions";
import {LayerMeasureActions, setLayerMeasureParameters} from "../interfaces/LayerMeasureActions";
import {BasicFormRecords} from "../../forms/BasicForms";
import {setWINDOWMANAGERParameters, WindowManagerActions} from "../../desktop/interfaces/WindowManagerActions";
import {setWorkspaceParameters, WorkspaceActions} from "../interfaces/WorkspaceActions";
import {BingMapsImagerySet} from "../luciadmap/factories/ModelFactory";
import {ReservedLayerID} from "../interfaces/ReservedLayerID";
import ScreenModal from "../../screenmodals/ScreenModal";

interface DispatchProps {
    sendCommand: (command: Command) => void;
}

interface StateProps{
    mapProjection: string | undefined;
    favorite2dProjection: string | undefined;
}

type Props = StateProps & DispatchProps;

class QuickTestInternal extends React.Component<Props>{
    render() {
        return (
            <div className="Quick-Test-Bar">
                <button className="test-button" onClick={this.toggle2D3D}>{this.props.mapProjection === "EPSG:4978"? "2D" : "3D"}</button>
                <button className="test-button" onClick={this.createWMSLayer}>Test WMS</button>
                <button className="test-button" onClick={this.createWMSLayerInfo}>WMS Info</button>
                <button className="test-button" onClick={this.createElevation}>Test LTS</button>
                <button className="test-button" onClick={this.createEditableLayer}>Editable</button>
                <button className="test-button" onClick={this.createTestWFSLayer}>Test WFS</button>
                <button className="test-button" onClick={this.createGroup}>Group</button>
                <button className="test-button" onClick={this.createTestGrid}>Grid</button>
                <button className="test-button" onClick={this.connectBingMaps(BingMapsImagerySet.AERIAL, "Bingmaps Aerial")}>Bingmaps A</button>
                <button className="test-button" onClick={this.connectBingMaps(BingMapsImagerySet.ROAD, "Bingmaps Road")}>Bingmaps R</button>
                <button className="test-button" onClick={this.createToast}>Toast</button>
                <button className="test-button" onClick={this.createConfirmation}>Confirmation</button>
                { /*
                    <button className="test-button" onClick={this.paste}>Paste</button>
                    <button className="test-button" onClick={this.polygon}>Polygon</button>
                    <button className="test-button" onClick={this.circle}>Circle</button>
                    <button className="test-button" onClick={this.selectTool}>Select</button>
                    <button className="test-button" onClick={this.selectAll}>Select All</button>
                    <button className="test-button" onClick={this.ruler}>Ruler</button>
                    <button className="test-button" onClick={this.defaultController}>Default</button>
                    <button className="test-button" onClick={this.ruler3D}>Ruler3D</button>
                    */
                }
                <button className="test-button" onClick={this.createForm}>Create Form1</button>
                <button className="test-button" onClick={this.createForm2}>Create Form2</button>
                <button className="test-button" onClick={this.layerManager}>Layer Manager</button>
                <button className="test-button" onClick={this.tools}>Tools</button>
            </div>
        );
    }

    private createConfirmation = () => {
        const promise = ScreenModal.Confirmation("Are you sure?",   {
            subTitle: "This shows a  confirmation form!",
            okButtonText: 'Yes',
            cancelButtonText: 'No'
        }, {
            size: "small"
        });
        promise.then((values: any) => {
            console.log(values);
            ScreenMessage.info("User response: " + (values.success ? "true" : "false") );
        })
    }

    private createToast = () => {
        ScreenMessage.info("Hello");
    }

    private createEditableLayer = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                "layerType": LayerTypes.EditableFeatureLayer,
                "model": {
                    "content": "{\n" +
                        "    \"type\": \"FeatureCollection\",\n" +
                        "    \"features\": [{\n" +
                        "        \"type\": \"Feature\",\n" +
                        "        \"properties\": {\n" +
                        "            \"shape\": \"Polygon\",\n" +
                        "            \"name\": \"Unnamed polygon 1\",\n" +
                        "            \"category\": \"default\"\n" +
                        "        },\n" +
                        "        \"geometry\": {\n" +
                        "            \"type\": \"Polygon\",\n" +
                        "            \"coordinates\": [\n" +
                        "                [\n" +
                        "                    [-74.007074, 40.719],\n" +
                        "                    [-74.007014, 40.717989],\n" +
                        "                    [-74.006473, 40.7162],\n" +
                        "                    [-73.998617, 40.714639],\n" +
                        "                    [-73.99441, 40.717794],\n" +
                        "                    [-74.002695, 40.721307],\n" +
                        "                    [-74.007074, 40.71942]\n" +
                        "                ]\n" +
                        "            ]\n" +
                        "        },\n" +
                        "        \"id\": \"c9422327-1ef7-4db8-8aa2-a02ef5432bd6\"\n" +
                        "    }," +
                        "{\n" +
                        "        \"type\": \"Feature\",\n" +
                        "        \"properties\": {\n" +
                        "            \"shape\": \"Polygon\",\n" +
                        "            \"name\": \"Unnamed polygon 2\",\n" +
                        "            \"category\": \"default\"\n" +
                        "        },\n" +
                        "        \"geometry\": {\n" +
                        "            \"type\": \"Polygon\",\n" +
                        "            \"coordinates\": [[\n" +
                        "            [  -74.03063895715685, 40.70653412167643 ],\n" +
                        "            [ -74.03057895715685, 40.70552312167643 ],\n" +
                        "            [ -74.03019080111396, 40.70222324420192 ],\n" +
                        "            [ -74.02218195715685, 40.702173121676424 ],\n" +
                        "            [ -74.02255862568148, 40.705487591986 ],\n" +
                        "            [ -74.02625995715685, 40.70884112167643 ],\n" +
                        "            [ -74.03063895715685, 40.706954121676425 ],\n" +
                        "            [ -74.03063895715685, 40.70653412167643 ]\n" +
                        "          ]]\n" +
                        "        },\n" +
                        "        \"id\": \"c9422327-XXXX-4db8-8aa2-a02ef5432bd6\"\n" +
                        "    }" +
                        "]\n" +
                        "}",
                },
                "layer": {
                    "label": "Editable",
                    "visible": true,
                },
                "autozoom": true
            },

        }
        this.props.sendCommand(command);
    }

    private createTestWFSLayer = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                "layerType": LayerTypes.WFSLayer,
                "fitBounds" : {
                    "coordinates": [-178.21502796792052, 111.24518044755983, 18.924781274497757, 52.481865978836524],
                    "reference": "CRS:84",
                },
                "model": {
                    "generateIDs": false,
                    "outputFormat": "application/json",
                    "serviceURL": "https://sampleservices.luciad.com/wfs",
                    "postServiceURL": "https://sampleservices.luciad.com/wfs",
                    "tmp_reference": "urn:ogc:def:crs:OGC:1.3:CRS84",
                    "typeName": "states",
                    "versions": [
                        "2.0.0"
                    ],
                    "methods": [
                        "POST"
                    ],
                    "requestHeaders": {},
                    "useProxy": false
                },
                "layer": {
                    "label": "States",
                    "visible": true,
                    "loadingStrategy": "LoadSpatially",
                    "maxFeatures": 10000
                },
                "autozoom": true
            },

        }
        this.props.sendCommand(command);
    }

    private createGroup = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                "layerType": LayerTypes.LayerGroup,
                "layer": {
                    "label": "A group",
                    "visible": true
                },
                "autozoom": true
            },

        }
        this.props.sendCommand(command);
    }

    private createElevation = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                layerType: LayerTypes.LTSLayer,
                model: {
                    url: 'https://sampleservices.luciad.com/lts',
                    coverageId: 'world_elevation_6714a770-860b-4878-90c9-ab386a4bae0f',
                    reference: 'EPSG:4326',
                    bounds: {
                        reference: 'EPSG:4326',
                        coordinates: [-180, 360, -90, 180],
                    },
                    levelCount: 24,
                    level0Columns: 4,
                    level0Rows: 2,
                    tileWidth: 81,
                    tileHeight: 81,
                    dataType: RasterDataType.ELEVATION,
                    samplingMode: RasterSamplingMode.POINT,
                },
                layer: { label: 'Elevation', visible: true },
                autozooom: false,
            },

        }
        this.props.sendCommand(command);
    }

    private createWMSLayerInfo = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                "layerType": LayerTypes.WMSLayer,
                "fitBounds": {
                    "reference": "CRS:84",
                    "coordinates": [ -164.76339818651567,96.97187999119541, 25.845197231963635, 44.56486791095067 ]
                },
                "model": {
                    "imageFormat":"image/png",
                    "getMapRoot":"https://sampleservices.luciad.com:443/ogc/wms/sampleswms",
                    "getFeatureInfoRoot":"https://sampleservices.luciad.com:443/ogc/wms/sampleswms",
                    "layers":["rivers"],
                  /*  "bounds": {
                        "reference": "CRS:84",
                        "coordinates": [ -164.76339818651567,96.97187999119541, 25.845197231963635, 44.56486791095067 ]
                    }, */
                    "styles":[],
                    "queryable":true,
                    "getFeatureInfoFormat":"application/json",
                    "reference":"CRS:84",
                    "reverseAxis":false,
                    "transparent":true,
                    "useDefaultProjection":false,
                    "version":"1.3.0",
                    "useProxy":false,
                    "credentials":false,
                    "requestHeaders":{},
                    "requestParameters":{},
                },
                "layer": {
                    "label": "Rivers",
                    "visible": true
                },
                "autozoom": true
            },

        }
        this.props.sendCommand(command);
    }

    private toggle2D3D = () => {
        let newMapProjection = this.props.favorite2dProjection;
        if (this.props.mapProjection === "EPSG:4978" ) {
            newMapProjection = this.props.favorite2dProjection
        } else {
            newMapProjection = "EPSG:4978";
        }
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CHANGEWORKSPACEPROPS,
            parameters: setWorkspaceParameters({
                workspaceAction: WorkspaceActions.CHANGEMAPPROJECTION,
                mapProjection: newMapProjection,
            }),
        }
        this.props.sendCommand(command);
    }

    private paste = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.EDITLAYER,
            parameters: {
                "editType": LayerEditActions.PASTE,
            },
        }
        this.props.sendCommand(command);
    }

    private polygon= () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.EDITLAYER,
            parameters: {
                "editType": LayerEditActions.POLYGON,
            },
        }
        this.props.sendCommand(command);
    }

    private circle = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.EDITLAYER,
            parameters: {
                "editType": LayerEditActions.CIRCLE,
            },
        }
        this.props.sendCommand(command);
    }

    private selectTool = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.SELECTFEATURES,
            parameters: setLayerSelectParameters({
                "selectType": LayerSelectActions.SELECTTOOL,
            }),
        }
        this.props.sendCommand(command);
    }

    selectAll  = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.SELECTFEATURES,
            parameters: setLayerSelectParameters({
                "selectType": LayerSelectActions.ALL,
            }),
        }
        this.props.sendCommand(command);
    }

    ruler = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.MEASURE,
            parameters: setLayerMeasureParameters({
                "measureType": LayerMeasureActions.RULER2D,
            }),
        }
        this.props.sendCommand(command);
    }

    ruler3D = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.MEASURE,
            parameters: setLayerMeasureParameters({
                "measureType": LayerMeasureActions.RULER3D,
            }),
        }
        this.props.sendCommand(command);
    }

    createForm = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.WINDOWMANAGER,
            parameters: setWINDOWMANAGERParameters({
                actionType: WindowManagerActions.CREATEWINDOW,
                id: BasicFormRecords.SampleForm1,
                formName: BasicFormRecords.SampleForm1,
                top: 0,
                left: 0,
            }),
        }
        this.props.sendCommand(command);
    }

    createForm2 = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.WINDOWMANAGER,
            parameters: setWINDOWMANAGERParameters({
                actionType: WindowManagerActions.CREATEWINDOW,
                id: BasicFormRecords.SampleForm1,
                formName: BasicFormRecords.SampleForm2,
                top: 0,
                left: 0,
            }),
        }
        this.props.sendCommand(command);
    }

    tools = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.WINDOWMANAGER,
            parameters: setWINDOWMANAGERParameters({
                actionType: WindowManagerActions.CREATEWINDOW,
                id: BasicFormRecords.EditAndMeasureTools,
                toggle: true,
                formName: BasicFormRecords.EditAndMeasureTools,
                top: 20,
                right: 0,
            }),
        }
        this.props.sendCommand(command);
    }

    layerManager = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.WINDOWMANAGER,
            parameters: setWINDOWMANAGERParameters({
                actionType: WindowManagerActions.CREATEWINDOW,
                id: BasicFormRecords.LayerManager,
                toggle: true,
                formName: BasicFormRecords.LayerManager,
                top: 5,
                right: 5,
            }),
        }
        this.props.sendCommand(command);
    }

    defaultController = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.DEFAULTCONTROLLER,
            parameters: {}
        }
        this.props.sendCommand(command);
    }

    private createWMSLayer = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                "layerType": LayerTypes.WMSLayer,
                "fitBounds": {
                    "reference": "CRS:84",
                    "coordinates": [ -180, 360, -90, 180 ]
                },
                "model": {
                    "layers": [
                        "4ceea49c-3e7c-4e2d-973d-c608fb2fb07e"
                    ],
                  /*  "bounds": {
                        "reference": "CRS:84",
                        "coordinates": [ -180, 360, -90, 180 ]
                    },*/
                    "imageFormat": "image/png",
                    "getMapRoot": "https://sampleservices.luciad.com:443/ogc/wms/sampleswms",
                    "getFeatureInfoFormat": "application/json",
                    "getFeatureInfoRoot": "https://sampleservices.luciad.com:443/ogc/wms/sampleswms",
                    "reference": "CRS:84",
                    "transparent": true,
                    "useDefaultProjection": false,
                    "version": "1.3.0",
                    "useProxy": false,
                    "requestHeaders": {},
                    "requestParameters": {}
                },
                "layer": {
                    "label": "Los Angeles Imagery",
                    "visible": true
                },
                "autozoom": true
            },

        }
        this.props.sendCommand(command);
    }

    public static BingmapsKey = () => {
        return 'AugjqbGwtwHP0n0fUtpZqptdgkixBt5NXpfSzxb7q-6ATmbk-Vs4QnqiW6fhaV-i';
    }

    private connectBingMaps = (mapId: string, label: string) => (event:any) => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                "layerType": LayerTypes.BingMapsLayer,
                "model": {
                    imagerySet: mapId,
                    token: QuickTest.BingmapsKey(),
                },
                "layer": {
                    "label": label,
                    "visible": true,
                    id: ReservedLayerID.BASE_MAP
                },
                "autozoom": false
            },
        }
        this.props.sendCommand(command);
    }

    private createTestGrid = () => {
        const command: Command = {
            uid: genereteUniqueID(),
            action: ApplicationCommands.CREATEANYLAYER,
            parameters: {
                "layerType": LayerTypes.GridLayer,
                "autozoom": false
            },

        }
        this.props.sendCommand(command);
    }
}

function mapStateToProps(state: IAppState): StateProps {
    const props: StateProps = {
        mapProjection: state.map.mapProjection,
        favorite2dProjection: state.map.favorite2dProjection
    };
    return props;
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
    return {
        sendCommand: (command: Command) => {
            dispatch(SendCommand(command))
        }
    };
}

const QuickTest = connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps
)(QuickTestInternal);

export default QuickTest;

