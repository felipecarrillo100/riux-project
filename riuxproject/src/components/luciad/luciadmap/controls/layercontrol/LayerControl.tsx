import * as React from "react";
import {Map} from "@luciad/ria/view/Map";

import "./LayerControl.scss";
import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {Handle} from "@luciad/ria/util/Evented";
import {PaintRepresentation} from "@luciad/ria/view/PaintRepresentation";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import ScreenMessage from "../../../../screenmessage/ScreenMessage";
import {LayerTreeVisitor} from "@luciad/ria/view/LayerTreeVisitor";
import LayerTreeTools from "./tools/LayerTreeTools";
import TreeNodeInterface from "./interfaces/TreeNodeInterface";
import LayerItem from "./layeritem/LayerItem";
import GlobalContextMenu from "../../../../customcontextmenu/GlobalContextMenu";
import {EventedSupport} from "@luciad/ria/util/EventedSupport";

export interface LayerControlProps {
    map: Map;
    contextMenu?: GlobalContextMenu;
    setCurrentLayer?: (layerID: string | undefined | null) => void;
    currentLayer?: string;
}

export interface LayerControlState {
    layers: TreeNodeInterface | undefined;
}

interface LayerListeners {
    PaintRepresentationVisibilityChanged: Handle | null;
    visibilityChange: Handle | null;
    triggerNodeUpdate: Handle | null;
}

interface LayerTreeListeners {
    NodeAdded: Handle | null;
    NodeMoved: Handle | null;
    NodeRemoved: Handle | null;
}

interface LayerTreeNodeChange { index: number; node: LayerTreeNode; path: LayerTreeNode[] }

class LayerControl < T extends LayerControlProps, S extends LayerControlState> extends React.Component<T, S> {
    private listenersSet: boolean;
    private layerTreeListeners: LayerTreeListeners;

    constructor(props: T) {
        super(props);
        this.listenersSet = false;

        this.layerTreeListeners = {
            NodeAdded: null,
            NodeMoved: null,
            NodeRemoved: null,
        }
        this.state = this.getInitialState();
    }

    protected getInitialState(): S {
        const initState = {
            layers: undefined
        } as LayerControlState as S;
        return initState;
    }

    componentDidMount() {
        if (this.props.map) {
            this.addLayerTreeListeners();
            this.triggerLayerChange();
        }
    }

    componentDidUpdate(prevProps: LayerControlProps) {
        if (prevProps.map !== this.props.map) {
            this.removeLayerTreeListeners();
            this.addLayerTreeListeners();
            this.triggerLayerChange();
        }
    }

    componentWillUnmount() {
        this.removeLayerTreeListeners();
    }

    render() {
        return <div className="LayerControl">
            <LayerItem map={this.props.map} layertree={this.state.layers} currentLayer={this.props.currentLayer} level={0}
                       contextMenu={this.props.contextMenu} setCurrentLayer={this.props.setCurrentLayer} />
        </div>;
    }

    private triggerLayerChange() {
        if (this.props.map) {
            const layerTree = this.props.map.layerTree;
            const retrievedLayes = LayerTreeTools.getLayerTreeObject(layerTree);
            this.setState({
                layers: retrievedLayes
            });
        }
    }

    private addNewLayerListener = (layerObject: LayerTreeNodeChange) => {
        const layer = layerObject.node as any;
        // console.log(' * Layer Added: ' + layer.label + ":" + layer.id);

        layer.layerListeners = {
            PaintRepresentationVisibilityChanged: null,
            visibilityChange: null,
            triggerNodeUpdate: null,
        } as LayerListeners;
        const setVisibilityListener = (node: LayerTreeNode) => {
            const visibilityChange = (/*visible: boolean*/) => {
                this.triggerLayerChange();
            };
           (node as any).layerListeners.visibilityChange =  node.on("VisibilityChanged", visibilityChange);
        }
        const setTriggerRenderListener = (node: LayerTreeNode) => {
            const triggerChange = (/*visible: boolean*/) => {
                this.triggerLayerChange();
            };
            if (typeof (node as any)._eventSupport ===  "undefined") {
                (node as any)._eventSupport = new EventedSupport(["TriggerNodeUpdate"], true);
                // console.log("EventHandler added: " + node.id);
            }
            if ((node as any)._eventSupport) {
                // console.log("Listener added: " + node.id + ": " + node.label);
                (node as any).layerListeners.triggerNodeUpdate =  (node as any)._eventSupport.on("TriggerNodeUpdate", triggerChange);
            }
        }
        const setLabelVisibilityListener = (node: LayerTreeNode) => {
            const visibilityChange = (value: boolean, paintRepresentation: PaintRepresentation) => {
                if (paintRepresentation === PaintRepresentation.LABEL) {
                    this.triggerLayerChange();
                }
            };
            (node as any).layerListeners.PaintRepresentationVisibilityChanged = node.on("PaintRepresentationVisibilityChanged", visibilityChange);
        }
        if (layer.restoreCommand && layer.restoreCommand.parameters && layer.restoreCommand.parameters.maxFeatures) {
            const setQueryListener = (featuerLayer: FeatureLayer) => {
                const QueryFinished = featuerLayer.workingSet.on("QueryFinished", () => {
                    const length = featuerLayer.workingSet.get().length;
                    if (length>=(featuerLayer as any).restoreCommand.parameters.layer.maxFeatures) {
                        ScreenMessage.warning("WFS Layer " + featuerLayer.label + " maxFeatures exceeds " + (featuerLayer as any).restoreCommand.layer.maxFeatures);
                    }
                    QueryFinished.remove();
                });
            }
        }
        setVisibilityListener(layer);
        setLabelVisibilityListener(layer);
        setTriggerRenderListener(layer);
        const restoreCommand = layer.restoreCommand;
        this.listenersSet = true;
        this.triggerLayerChange();
    }

    private layerMovedListener = () => {
        this.triggerLayerChange();
    }

    private layerRemovedListener = (layerObject: LayerTreeNodeChange) => {
        // console.log("Remove: " + layerObject.node.label + " " + layerObject.node.id)
        const layer = layerObject.node as any;
        const model = layer.model;
        if (this.isDestroyableModel(model)) {
            this.WhenIsParentLessModel(model).then((parentLessModel)=>{
                this.destroyModel(parentLessModel);
            });
        }
        if (layer.layerListeners) {
            // console.log("Listeners removed: " + layer.id + ": " + layer.label);
            if (layer.layerListeners.visibilityChange) layer.layerListeners.visibilityChange.remove();
            if (layer.layerListeners.PaintRepresentationVisibilityChanged) layer.layerListeners.PaintRepresentationVisibilityChanged.remove();
            if (layer.layerListeners.triggerNodeUpdate) layer.layerListeners.triggerNodeUpdate.remove();
            layer._eventSupport = undefined;
            layer.layerListeners = undefined;
        }
        this.triggerLayerChange();
    }

    private addLayerTreeListeners() {
        this.layerTreeListeners.NodeAdded =  this.props.map.layerTree.on('NodeAdded', this.addNewLayerListener);
        this.layerTreeListeners.NodeMoved = this.props.map.layerTree.on('NodeMoved', this.layerMovedListener);
        this.layerTreeListeners.NodeRemoved = this.props.map.layerTree.on('NodeRemoved', this.layerRemovedListener);
        this.listenersSet = true;
    }

    private removeLayerTreeListeners() {
        if (this.listenersSet) {
            this.layerTreeListeners.NodeAdded.remove();
            this.layerTreeListeners.NodeMoved.remove();
            this.layerTreeListeners.NodeRemoved.remove();
            this.layerTreeListeners = {
                NodeAdded: null,
                NodeMoved: null,
                NodeRemoved: null,
            };
        }
        this.listenersSet = false;
    }

    /*********** Destroyable mdoels ******/
    /************* Layer with destroyable models to be handled specially ****************/
    private isDestroyableModel(model: any) {
        if (model && typeof model.destroy === "function") {
            return true
        } else {
            return false;
        }
    }

    private destroyModel(model: any) {
        if (model && typeof model.destroy === "function") {
            model.destroy();
        } else {
            return false;
        }
    }

    private WhenIsParentLessModel(model: any) {
        return new Promise((resolve)=>{
            setTimeout(()=>{
                if (this.isParentLessModel(model)) {
                    resolve(model);
                }
            }, 1000);
        })
    }

    private isParentLessModel(model: any) {
        let parentless = true;
        const layerTreeVisitor = {
            visitLayer: (layer: any) => {
                if (layer.model && layer.model === model) {
                    parentless = false;
                }
                return LayerTreeVisitor.ReturnValue.CONTINUE;
            },
            visitLayerGroup: (layerGroup: any) => {
                layerGroup.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
                return LayerTreeVisitor.ReturnValue.CONTINUE;
            }
        };
        this.props.map.layerTree.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
        return parentless;
    }
}

export default LayerControl;
