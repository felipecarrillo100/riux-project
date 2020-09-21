import * as React from 'react';

// SCSS is now globally imported
// import './LayerItem.scss';

import GlobalContextMenu, {
    ContextMenuContent,
    ShowCustomContextMenuOptions
} from "../../../../../customcontextmenu/GlobalContextMenu";
import { RasterDataType } from "@luciad/ria/model/tileset/RasterDataType";
import { Map } from "@luciad/ria/view/Map";
import LayerItem from "./LayerItem";
import TreeNodeInterface from "../interfaces/TreeNodeInterface";
import LayerControlIcon from "./LayerControlIcon";
import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {LayerTreeNodeType} from "@luciad/ria/view/LayerTreeNodeType";
import ScreenMessage from "../../../../../screenmessage/ScreenMessage";
import LayerContextMenuProvider, {GenerateLayerContextMenuOptions} from "../layercontextmenu/LayerContextMenuProvider";
import NavigateLayerTools from "../../../layerutils/navigate/NavigateLayerTools";
import set = Reflect.set;
import {LayerTypes} from "../../../../interfaces/LayerTypes";
import LayerFactory from "../../../factories/LayerFactory";

function renderLCDIcon(iconName: string, title: string) {
    const iconClass = "lcdIcon " + iconName;
    return <span className={iconClass} title={title}/>
}

const LayerIconTypeRaster = renderLCDIcon("lcdIconRaster", "Raster layer");
const LayerIconTypeVector = renderLCDIcon("lcdIconShapes", "Vector layer");
const LayerIconTypeUnknown = renderLCDIcon("lcdIconUnknown", "Unknown layer type");
const LayerIconTypeElevation = renderLCDIcon("lcdIconHeight", "Elevation layer");
const LayerIconTypeGrid = renderLCDIcon("lcdIconGrid", "Grid layer");

const LayerIconType3DTiles = (<LayerControlIcon icon="tiles-3d" size="16px" /> );

interface LayerNodeItemProps {
    layer: TreeNodeInterface;
    currentLayer: string | undefined | null;
    map: Map;
    contextMenu: GlobalContextMenu;
    setCurrentLayer?: (layerID: string | undefined | null) => void;
    layertree: TreeNodeInterface | undefined | null;
    level: number;
}

class LayerNodeItem extends React.Component<LayerNodeItemProps> {
    private _isMounted: boolean;
    private static position: "top" | "below" | "above" | "bottom" | undefined;

    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        this._isMounted = true;
    }

    public componentWillUnmount() {
        this._isMounted = false;
    }

    public dragStart(layer: TreeNodeInterface, e: any) {
        if (e.dataTransfer) {
            e.dataTransfer.setData('text', layer.id);
        }
        e.currentTarget.classList.add("drag-start");
    }

    public OverDrop(layer: TreeNodeInterface, e: any) {
        function InvertPosition(position: any) {
            return position;
        }

        e.preventDefault();

        if (e.type !== "drop") {
            return;
        }
        // Stores dragged elements ID in var draggedId

        let draggedId;
        if (e.dataTransfer) {
            draggedId = e.dataTransfer.getData("text");
        }
        else if (e.originalEvent.dataTransfer) {
            draggedId = e.originalEvent.dataTransfer.getData("text");
        }

        e.currentTarget.classList.remove("drag-enter", "drag-above", "drag-below");

        if (draggedId === layer.id) {
            return;
        }

        const targetNode = LayerNodeItem.getLayerTreeNodeByID(this.props.map, draggedId);
        const referenceNode = LayerNodeItem.getLayerTreeNodeByID(this.props.map, layer.id);
        LayerNodeItem.moveLayers(this.props.map, targetNode, referenceNode,  LayerNodeItem.position);
    }

    public Drag(e: any) {
        // tslint:disable-next-line:no-empty
    }

    public DragOver(e: any) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        const item = e.currentTarget;
        const boundingRect = item.getBoundingClientRect();
        const middleOfDiv = boundingRect.top + (boundingRect.height / 2);
        if (e.clientY < middleOfDiv) {
            item.classList.remove("drag-below");
            item.classList.add("drag-above");
            LayerNodeItem.position = "above";
        } else {
            item.classList.remove("drag-above");
            item.classList.add("drag-below");
            LayerNodeItem.position = "below";
        }
    }

    public DragEnd(e: any) {
        e.currentTarget.classList.remove("drag-start");
    }

    public DragEnterLeave(e: any) {
        if (e.type === "dragenter") {
            e.currentTarget.classList.add("drag-enter");
        } else {
            e.currentTarget.classList.remove("drag-enter", "drag-above", "drag-below");
        }
    }

    public render() {
        const layerNodeItem = this as LayerNodeItem;
        const layer = this.props.layer;

        let active = false;
        if (layer.id === layerNodeItem.props.currentLayer) {
            active = true;
        }

        const dragableSpan = (content: JSX.Element) => {
            const handleDragStart = (e: any) => {
                layerNodeItem.dragStart(layer, e);
            };
            const handleDrag = (e: any) => {
                layerNodeItem.Drag(e);
            };
            const handleDragEnd = (e: any) => {
                layerNodeItem.DragEnd(e);
            };
            const handleDragOver = (e: any) => {
                layerNodeItem.DragOver(e);
            };
            const handleDragEnterLeave = (e: any) => {
                layerNodeItem.DragEnterLeave(e);
            };
            const handleOverDrop = (e: any) => {
                layerNodeItem.OverDrop(layer, e);
            };

            return (
                <span className={`layer-manager-span ${active ? 'active' : ''}`}
                      draggable={true}
                      onDragStart={handleDragStart}
                      onDrag={handleDrag}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnterLeave}
                      onDragLeave={handleDragEnterLeave}
                      onDrop={handleOverDrop}>
                    {content}
                </span>
            );
        };

        const ContextMenuLayer = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            const contextMenuParameters = {
                layerObject: this.props.layer,
                map: this.props.map,
            };
            const options: ShowCustomContextMenuOptions = {
                x: e.clientX,
                y: e.clientY,
                contextMenu: this.createLayerContextMenu(contextMenuParameters),
            }
            if (this.props.contextMenu) {
                this.props.contextMenu.show(options);
            } else {
                ScreenMessage.warning("Context menu is not defined");
            }
        }
        const FitToLayer = (e: any) => {
            const map = this.props.map;
            const node = this.props.layer.realNode as any;
            NavigateLayerTools.fitToLayer(map, node);
        }
        const newVisibleToggle = () => {
            const node = this.props.layer.realNode;
            node.visible = !node.visible;
        }
        const SelectLayer = () => {
            const layerID = this.props.layer.id;
            if (this.props.setCurrentLayer) this.props.setCurrentLayer(layerID);
        }

        const nodeRender = () => {
            const visibleTitle = layer.visible.value ? "Hide layer" : "Show layer";
            return (
                <span className="layer-manager-span-tools" onDoubleClick={this.preventDefault}>
                    <button title="More options" className="layer-manager-button" onClick={ContextMenuLayer}
                            onFocus={this.nonFocusable} style={{marginRight: "5px", marginLeft: "0px"}}>
                        <LayerControlIcon icon="contextmenu"/>
                    </button>
                    <button title="Fit to layer" className="layer-manager-button" onClick={FitToLayer} onFocus={this.nonFocusable}>
                        <LayerControlIcon icon="fit"/>
                    </button>
                    <button title={visibleTitle} className="layer-manager-button" onClick={newVisibleToggle} onFocus={this.nonFocusable}>
                        {!layer.visible.value ?
                            <LayerControlIcon icon="eye-slash" style={{color: "gray"}}/> : <LayerControlIcon icon="eye"/>
                        }
                    </button>
                </span>
            );
        };

        let folderOpen = false;
        let folderClose = false;
        let fileIcon = false;
        let handleCollapseLayerGroup;

        if (layer.treeNodeType === "LAYER_GROUP") {
            if (!layer.collapsed) {
                folderOpen = true;
            } else {
                folderClose = true;
            }
            handleCollapseLayerGroup = (e: any) => {
                e.preventDefault();
                e.stopPropagation();
                const node = this.props.layer.realNode as any;
                node.collapsed = !node.collapsed;
                if (typeof node._eventSupport !== "undefined")
                    node._eventSupport.emit("TriggerNodeUpdate", {});
            }
        } else {
            fileIcon = true;
            folderClose = false;
            folderOpen = false;
        }

        let iconbyFormat = LayerIconTypeUnknown;
        if (layer.treeNodeType === "LAYER_GRID") {
            iconbyFormat = LayerIconTypeGrid;
        } else if (layer.treeNodeType === "LAYER_RASTER") {
            const realLayer = layer.realNode as any;
            iconbyFormat = LayerIconTypeRaster;
            const isElevation = (realLayer.model.dataType && realLayer.model.dataType === RasterDataType.ELEVATION);
            if (isElevation) {
                iconbyFormat = LayerIconTypeElevation;
            }
        } else if (layer.treeNodeType === "LAYER_FEATURE") {
            iconbyFormat = LayerIconTypeVector;
        } else if (layer.treeNodeType === "LAYER_OGC3D") {
            iconbyFormat = LayerIconType3DTiles;
        }

        return (
            <li>
                {dragableSpan(<React.Fragment>
                    <a onDoubleClick={FitToLayer} onClick={SelectLayer} onContextMenu={ContextMenuLayer}>
                        {folderClose &&
                        <button className="layer-manager-button-folder" onClick={handleCollapseLayerGroup} onFocus={this.nonFocusable}>
                            <LayerControlIcon icon="folder" size="16px"/>
                        </button>}
                        {folderOpen &&
                        <button className="layer-manager-button-folder" onClick={handleCollapseLayerGroup} onFocus={this.nonFocusable}>
                            <LayerControlIcon icon="folder-open" size="16px"/>
                        </button>}
                        {fileIcon && <button className="layer-manager-button-folder" onDoubleClick={FitToLayer}
                                             onFocus={this.nonFocusable}>{iconbyFormat}</button>}
                        <span className="layer-manager-label" title={layer.label}>
                            {layer.label}
                        </span>
                        {nodeRender()}
                    </a>
                </React.Fragment>)}
                {folderOpen &&
                <LayerItem map={this.props.map} layertree={layer} currentLayer={this.props.currentLayer} level={this.props.level + 1}
                           contextMenu={this.props.contextMenu} setCurrentLayer={this.props.setCurrentLayer} />}
            </li>
        )
    }

    private nonFocusable = (event: React.FocusEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
     //   event.relatedTarget && (event.relatedTarget as any).focus && (event.relatedTarget as any).focus();
    };

    private preventDefault = (event:  any) => {
        event.preventDefault();
        event.stopPropagation();
    };


    public static getLayerTreeNodeByID(map: Map, layerID: any) : LayerTreeNode{
        let node = map.layerTree.findLayerById(layerID) as LayerTreeNode;
        if (typeof node==="undefined") {
            node = map.layerTree.findLayerGroupById(layerID) as LayerTreeNode;
        }
        return node;
    }


    private static moveLayers(map: Map, node: LayerTreeNode, referenceNode: LayerTreeNode, position: "top" | "below" | "above" | "bottom" | undefined) {
        let groupLayer: any;
        let location: any;
        if (node.parent === referenceNode.parent) {
            console.log("--- Same parent!")

            if (referenceNode.treeNodeType === LayerTreeNodeType.LAYER_GROUP && position === "below" && !(referenceNode as any).collapsed) {
                if (node.id === 'Grid') {
                    ScreenMessage.warning("Grid Layer must be in root");
                    return;
                }
                console.log("--- Other parent!")
                groupLayer = node.parent as any;
                const myreference = referenceNode as any;
                location = this.saveNodeLocation(groupLayer, node);
                try {
                    groupLayer.removeChild(node);
                    console.log("--- remove:" + node.id);
                    myreference.addChild(LayerNodeItem.wmsLayerWorkAround(node), "top");
                    console.log("--- add:" + node.id);
                } catch (err) {
                    let message = "Moving layer to this location is not allowed.";
                    if ((node as any).type && (node as any).type === "BASE") {
                        message += " Base layers must be at the bottom."
                    }
                    ScreenMessage.warning(message);

                    (referenceNode as any).removeChild(node);
                    this.restoreNodeAtLocation(location)
                }
            } else {
                groupLayer = node.parent as any;
                const canMove = groupLayer.canMoveChild(node, position, referenceNode);
                if (canMove) {
                    groupLayer.moveChild(node, position, referenceNode, false);
                } else {
                    ScreenMessage.warning("Moving layer to this location is not allowed.");
                }
            }
        } else {
            console.log("--- Other parent!")

            if (node.id === "Grid") {
                return;
            }

            groupLayer = node.parent as any;
            const newGroupLayer = referenceNode.parent;
            location = LayerNodeItem.saveNodeLocation(groupLayer, node);
            try {
                groupLayer.removeChild(node);
                newGroupLayer.addChild(LayerNodeItem.wmsLayerWorkAround(node), position, referenceNode, false);
            } catch (err) {
                let message = "Moving layer to this location is not allowed.";
                if ((node as any).type && (node as any).type === "BASE") {
                    message += " Base layers must be at the bottom."
                }
                ScreenMessage.warning(message);
                newGroupLayer.removeChild(node);
                LayerNodeItem.restoreNodeAtLocation(location)
            }
        }
    }

    private static wmsLayerWorkAround(layer: any) {
        if (layer.restoreCommand.layerType === LayerTypes.WMSLayer) {
            const restoreCommand = layer.restoreCommand;
            restoreCommand.layer.visible = layer.visible;
            restoreCommand.layer.queryActive = layer.queryActive;
            const model = layer.model;
            const l = LayerFactory.createWMSLayer(model, {...restoreCommand.layer}) as any;
            l.restoreCommand = restoreCommand;
            return l;
        } else {
            return layer;
        }
    }

    private static saveNodeLocation(tree: any, layer: LayerTreeNode) {
        let loc: any;
        if (tree.children.length === 1) {
            loc = {position: "top", parent: tree, layer}
        } else {
            let index = 0;
            for (let i = 0; i < tree.children.length; ++i) {
                if (layer.id === tree.children[i].id) {
                    index = i;
                }
            }
            if (index === 0) {
                loc = {position: "below", parent: tree, layer, reference: tree.children[index + 1]};
            } else {
                loc = {position: "above", parent: tree, layer, reference: tree.children[index - 1]};
            }
        }
        return loc;
    }

    private static restoreNodeAtLocation(loc: any) {
        if (loc.position === "top") {
            loc.parent.addChild(loc.layer, "top");
        } else {
            loc.parent.addChild(loc.layer, loc.position, loc.reference);
        }
    }

    protected createLayerContextMenu(contextMenuParameters: GenerateLayerContextMenuOptions):ContextMenuContent {
        return LayerContextMenuProvider.generateMenu(contextMenuParameters);
    }

}

export default LayerNodeItem;
