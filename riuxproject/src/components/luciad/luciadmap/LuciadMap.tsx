import React from "react";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {Map} from "@luciad/ria/view/Map";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

import "./LuciadMap.scss";
import GetFeatureInfoController from "./controllers/getfeatureinfocontroller/GetFeatureInfoController";
import {Command, genereteUniqueID} from "../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerGroup} from "@luciad/ria/view/LayerGroup";
import {Layer} from "@luciad/ria/view/Layer";
import NavigateLayerTools from "./layerutils/navigate/NavigateLayerTools";
import ScreenMessage from "../../screenmessage/ScreenMessage";
import LayerBuilder from "./layerbuilder/LayerBuilder";
import {LayerTreeVisitor} from "@luciad/ria/view/LayerTreeVisitor";
import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {LayerTree} from "@luciad/ria/view/LayerTree";
import GlobalContextMenu from "../../customcontextmenu/GlobalContextMenu";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {LayerEditActions} from "../interfaces/LayerEditActions";
import ClipboardLayerTools from "./layerutils/clipboard/ClipboardLayerTools";
import EditSelectLayerTools from "./layerutils/editselect/EditSelectLayerTools";
import {LayerSelectActions} from "../interfaces/LayerSelectActions";
import {LayerMeasureActions} from "../interfaces/LayerMeasureActions";
import {MapPreferences} from "../interfaces/MapPreferences";
import RulerController, {Ruler2DUpdateValues, RulerMode} from "./controllers/measurementcontrollers/Ruler2DController/RulerController";
import Ruler3DController, {
    Ruler3DControllerTypes,
    Ruler3DUpdateValues
} from "./controllers/measurementcontrollers/Ruler3DController/Ruler3DController";
import FormatUtil from "./controllers/measurementcontrollers/common/FormatUtil";
import {LayerCountActions} from "../interfaces/LayerCountActions";
import CountFeaturesLayerTools from "./layerutils/count/CountFeaturesLayerTools";
import {ReservedLayerID} from "../interfaces/ReservedLayerID";
import AnnotationsPainter from "./painters/AnnotationsPainter";
import {LayerTypes} from "../interfaces/LayerTypes";
import ScreenModal from "../../screenmodals/ScreenModal";


export interface MapState {
    state: any;
    layerTree: any;
}

export interface LuciadMapProps {
    mapProjection?: string;
    contextMenu?: GlobalContextMenu;
    onMapUpdate?: (map: Map) => void;
    currentLayer?: string;
    setCurrentLayer?: (currentLayer: string) => void;
    mapPreferences: MapPreferences;

    onRuler2dUpdate?: (newValues: Ruler2DUpdateValues) => void;
    onRuler3dUpdate?: (newValues: Ruler3DUpdateValues) => void;
}

class LuciadMap < T extends LuciadMapProps, S extends any > extends React.Component<T, S>{
    protected mapRef: HTMLDivElement;
    protected map: WebGLMap;

    constructor(props:T) {
        super(props);
        this.onShowContextMenu = this.onShowContextMenu.bind(this);
    }

    componentDidMount() {
        this.createMap();
    }

    componentDidUpdate(prevProps: Readonly<T>, prevState: Readonly<S>, snapshot?: any) {
        if (prevProps.mapProjection !== this.props.mapProjection) {
            const map = this.getMap();
            console.log("Map Projection: " + this.props.mapProjection);
            if (this.props.mapProjection) {
                const mapState = this.retrieveMapState();
                this.destroyMap();
                this.createMap();
                this.restoreMapState(mapState);
            }
        }
    }

    componentWillUnmount() {
        this.destroyMap();
    }

    getMap() {
        return this.map;
    }

    protected onShowContextMenu(position: any, contextMenu: any) {
        const options = { x: position[0], y: position[1], contextMenu };
        if (this) {
            if (this.props) {
                if (this.props.contextMenu) {
                    this.props.contextMenu.show(options);
                } else {
                    ScreenMessage.warning("Context menu is not defined");
                }
            }
        }
    }

    render() {
        return (
            <div className="LuciadMap" ref = {(ref) => {this.mapRef = ref}}/>
        );
    }

    protected createMap() {
        this.destroyMap();
        const mapProjection = this.props.mapProjection ? this.props.mapProjection : this.getDefaultProjection();
        this.map = new WebGLMap(this.mapRef, {reference: getReference(mapProjection)});
        (this.map as any).defaultController = this.createDefaultController();
        this.map.controller = (this.map as any).defaultController;
        this.map.onShowContextMenu = this.onShowContextMenu;
        if (typeof this.props.onMapUpdate === "function")
            this.props.onMapUpdate(this.map);
    }

    protected createDefaultController() {
        return new GetFeatureInfoController();
    }

    protected getDefaultProjection() {
        return "EPSG:4978";
    }

    private removeALLChildren() {
        const layerTreeVisitor = {
            visitLayer: (layer: any) => {
                return LayerTreeVisitor.ReturnValue.CONTINUE;
            },
            visitLayerGroup: (layerGroup: any) => {
                layerGroup.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
                layerGroup.removeAllChildren();
                return LayerTreeVisitor.ReturnValue.CONTINUE;
            }
        };
        this.map.layerTree.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
    }

    protected destroyMap() {
        if (this.map) {
            this.removeALLChildren();
            this.map.destroy();
        }
        this.map = null;
        if (typeof this.props.onMapUpdate === "function")
            this.props.onMapUpdate(this.map);
    }

    protected getLayerTreeRestoreCommand() {
        const map = this.getMap();
        const layerTree = LayerBuilder.getRestoreCommand(map.layerTree, {withModels: true});
        return  layerTree;
    }

    public applyCommand(command: Command) {
        console.log(
            'Command received at LuciadMap: ' +  command.action + ' ',
            command.parameters
        );
        switch (command.action) {
            case ApplicationCommands.CREATEANYLAYER:
                this.createAnyLayer(command);
                break;
            case ApplicationCommands.DEFAULTCONTROLLER:
                this.restoreDefaultController();
                break;
            case ApplicationCommands.EDITLAYER:
                this.editLayerCommand(command);
            break;
            case ApplicationCommands.MEASURE:
                this.measureMap(command)
                break;
            case ApplicationCommands.SELECTFEATURES:
                this.selectLayerCommand(command);
                break;
            case ApplicationCommands.COUNTFEATURES:
                this.countFeatureLayerCommand(command);
                break;
        }
    }

    private retrieveMapState(): MapState {
        const map = this.getMap();
        const state = map.saveState();
        const layerTree = this.getLayerTreeRestoreCommand();

        const mapState = {
            state,
            layerTree: layerTree,
        }
        return mapState;
    }

    private restoreMapState(mapState: MapState) {
        const map = this.getMap();
        map.restoreState(mapState.state);
        this.restoreLayerTree(mapState.layerTree, map.layerTree);
    }

    private countFeatureLayerCommand(command: Command) {
        if (this.props.currentLayer && this.props.currentLayer.length > 0) {
            const map = this.getMap();
            const layer = map.layerTree.findLayerById(this.props.currentLayer);
            if (layer && layer instanceof FeatureLayer) {
                switch (command.parameters.countType) {
                    case LayerCountActions.ALL:
                        CountFeaturesLayerTools.countAll(map, layer);
                        break;
                    case LayerCountActions.SELECTED:
                        CountFeaturesLayerTools.countSelected(map, layer);
                        break;
                }
            }
        }
    }

    private restoreLayerTree(layerTreeCommand: any, layerTree: LayerTree) {
        return LayerBuilder.createLayerOnCommand(layerTreeCommand, layerTree);
    }

    public getSelectableLayer(options?: any) {
        options = options ? options : {};
        options.create = typeof options.create !== "undefined" ? options.create : false;
        options.ask = typeof options.ask !== "undefined" ? options.ask : true;

        return new Promise((resolve, reject) => {
            const layer = this.getLayerTreeNodeByID(this.props.currentLayer);
            if (layer && EditSelectLayerTools.isSelectable(layer)) {
                resolve(layer as FeatureLayer);
            } else {
                const annotationsLayerPromise = this.createAnnotationsLayer(options);
                annotationsLayerPromise.then(annotationLayer=>resolve(annotationLayer), reason => reject(reason));
            }
        });
    }

    private selectLayerCommand(command: Command) {
        const map = this.getMap();
        if (!map) return;
        const promiseToLayer = this.getSelectableLayer();
        promiseToLayer.then((layer: FeatureLayer)=> {
            if (this.props.currentLayer && this.props.currentLayer.length > 0) {
                switch (command.parameters.selectType) {
                    case LayerSelectActions.ALL:
                        EditSelectLayerTools.selectAll(map, layer);
                        break;
                    case LayerSelectActions.SELECTTOOL:
                        EditSelectLayerTools.selectTool(map, layer);
                        break;
                    case LayerSelectActions.NONE:
                        EditSelectLayerTools.selectNone(map, layer);
                        break;
                }
            }
        }, () => {
            ScreenMessage.warning("No layer to select from");
        })
    }

    public getLayerTreeNodeByID(layerID: any) : LayerTreeNode {
        const map = this.getMap();
        if (!map) return null;
        let node = map.layerTree.findLayerById(layerID) as LayerTreeNode;
        if (typeof node==="undefined") {
            node = map.layerTree.findLayerGroupById(layerID) as LayerTreeNode;
        }
        return node ? node : null;
    }

    public retrieveAnnotationsLayer() {
        return this.getLayerTreeNodeByID( ReservedLayerID.ANNOTATIONS ) as FeatureLayer;
    }

    public createAnnotationsLayer(options:any) {
        options = options ? options : {create:true, ask: true };
        return new Promise<FeatureLayer>(((resolve, reject) => {
            // Helper function
            const localCreateAnnotationLayer = () => {
                const layerCreationCommand:Command = {
                    action: ApplicationCommands.CREATEANYLAYER,
                    uid: genereteUniqueID(),
                    parameters: {
                        layerType: LayerTypes.EditableFeatureLayer,
                        autozoom: false,
                        layer: {
                            id: ReservedLayerID.ANNOTATIONS,
                            label: "Annotations",
                            selectable: true,
                            editable: true,
                            painterSettings: AnnotationsPainter.defaultSettings()
                        },
                        model: {
                            defaultProperties: {
                                name: "",
                                picture: "",
                                description:"",
                                video: "",
                                url: "",
                                meta:"",
                                icon: ""
                            }
                        }
                    }
                }
                LayerBuilder.createLayerOnCommand(layerCreationCommand, this.getMap().layerTree).then(
                    (newAnnotationsLayer: any) => {
                        this.props.setCurrentLayer(newAnnotationsLayer.id);
                        resolve(newAnnotationsLayer as FeatureLayer)
                    },
                    () => {
                        reject()
                    }
                );
            }
            // Start here
            const annotationsLayer = this.retrieveAnnotationsLayer();
            // If Annotations layer Exist reuse
            if (annotationsLayer) {
                // If Annotations layer editable then Success!
                if (EditSelectLayerTools.isEditable(annotationsLayer)) {
                    this.props.setCurrentLayer(annotationsLayer.id);
                    resolve(annotationsLayer);
                } else {
                    // Reject Layer
                    ScreenMessage.info("The Annotations layer is not editable.");
                    reject();
                }
            } else {
                if (options.create) {
                    if (options.ask) {
                        ScreenModal.Confirmation("There is no Annotations layer. Do you want to create it?",
                            { title: "Create annotation layer" }).
                        then((result) => {
                            if (result.success)
                                localCreateAnnotationLayer();
                            else
                                reject();
                        });
                    } else {
                        localCreateAnnotationLayer();
                    }
                } else {
                    reject();
                }
            }
        }))
    }

    public getDrawLayer(options?: any) {
        options = options ? options : {};
        options.create = typeof options.create !== "undefined" ? options.create : true;
        options.ask = typeof options.ask !== "undefined" ? options.ask : true;

        return new Promise((resolve, reject) => {
            const layer = this.getLayerTreeNodeByID(this.props.currentLayer);
            if (layer && EditSelectLayerTools.isEditable(layer)) {
                resolve(layer as FeatureLayer);
            } else {
                const annotationsLayerPromise = this.createAnnotationsLayer(options);
                annotationsLayerPromise.then(annotationLayer=>resolve(annotationLayer), reason => reject(reason));
            }
        });
    }

    private editLayerCommand(command: Command) {
        const map = this.getMap();
        if (!map) return;
        const promiseToLayer = this.getDrawLayer();
        promiseToLayer.then((layer: FeatureLayer)=>{
            if (layer && layer instanceof FeatureLayer) {
                switch (command.parameters.editType) {
                    case LayerEditActions.PASTE:
                        ClipboardLayerTools.pasteToFeatureLayer(layer);
                        break;
                    case LayerEditActions.POINT:
                    case LayerEditActions.LINE:
                    case LayerEditActions.POLYGON:
                    case LayerEditActions.CIRCLE:
                    case LayerEditActions.BOUNDS:
                        const shapeType = EditSelectLayerTools.mapEditActioToShapeType(command.parameters.editType);
                        EditSelectLayerTools.createAnyShape(map, layer, shapeType);
                        break;
                }
            }
        });
    }

    private measureMap(command: Command) {
        const map = this.getMap();
        switch (command.parameters.measureType) {
            case LayerMeasureActions.RULER2D:
                map.controller = this.creteRuler2dController();
                break;
            case LayerMeasureActions.RULER3D:
                map.controller = this.creteRuler3dController();
                break;
        }
    }

    protected creteRuler3dController() {
        ScreenMessage.info("Click to start measuring, double click to end measurement");
        return new Ruler3DController({
            mode: Ruler3DControllerTypes.MEASURE_TYPE_DISTANCE,
            formatUtil:new FormatUtil({units: this.props.mapPreferences.units}),
            onUpdate: this.props.onRuler3dUpdate
        });
    }

    protected creteRuler2dController() {
        ScreenMessage.info("Click to start measuring, double click to end measurement");
        return new RulerController({
            mode:RulerMode.DISTANCE,
            onUpdate: this.props.onRuler2dUpdate,
            formatUtil: new FormatUtil({units: this.props.mapPreferences.units}),
        });
    }

    protected restoreDefaultController() {
        const map = this.getMap();
        map.controller = (map as any).defaultController;
    }

    private createAnyLayer(command: Command) {
        const autoZoom = command.parameters.autozoom;
        delete command.parameters.autozoom;
        const layerPromise = LayerBuilder.createLayerOnCommand(command, this.getMap().layerTree);
        layerPromise.then(layerOrGroup => {
            if (typeof this.props.setCurrentLayer === "function") {
                this.props.setCurrentLayer(layerOrGroup.id);
            }
            if (!(layerOrGroup instanceof LayerGroup) && autoZoom) {
                const layer = layerOrGroup as Layer as any;
                const map = this.getMap();
                if (map) {
                    NavigateLayerTools.fitToLayer(map, layer);
                }
            }
        }, () => {
            ScreenMessage.error("Failed to create layer")
        })
    }
}

export default LuciadMap;
