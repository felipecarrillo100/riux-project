import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {PaintRepresentation} from "@luciad/ria/view/PaintRepresentation";
import {LayerTreeNodeType} from "@luciad/ria/view/LayerTreeNodeType";
import {Layer} from "@luciad/ria/view/Layer";
import EditSelectLayerTools from "../../../layerutils/editselect/EditSelectLayerTools";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import TreeNodeInterface from "../interfaces/TreeNodeInterface";
import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";


class LayerTreeTools {
    public static getLayerTreeObject(tree:LayerTreeNode) {
        function syncTree(layer: LayerTreeNode, level: number) {
            const newNode:TreeNodeInterface = {} as TreeNodeInterface;
            newNode.realNode = layer;
            newNode.label = layer.label;
            newNode.id = layer.id;
            newNode.title = "";
            newNode.parent_id = undefined;
            if (layer.parent) {
                newNode.parent_id = layer.parent.id;
            }
            // Retrieve Visibility of Layer
            newNode.visible = {value: layer.visible, enabled: true};
            // Retrieve Editability of Layer
            // Retrieve Visibility of Layer labels
            if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
                const currentValue = layer.isPaintRepresentationVisible(PaintRepresentation.LABEL);
                newNode.labeled = {value: currentValue, enabled: true};
            } else {
                newNode.labeled = {value: false, enabled: false};
            }
            level++;

            if (layer.treeNodeType === LayerTreeNodeType.LAYER) {
                const l = layer as Layer;
                if (typeof l.editable !== "undefined") {
                    const editable = l.editable && EditSelectLayerTools.isEditable(l);
                    newNode.editable = {value: editable, enabled: EditSelectLayerTools.canEdit(l)};
                }
                else {
                    newNode.editable = {value: false, enabled: false};
                }
                if (l.model && l.model.modelDescriptor && l.model.modelDescriptor.type === "OGC3D") {
                    newNode.treeNodeType = "LAYER_OGC3D";
                }
                if (l.id === 'Grid') {
                    newNode.treeNodeType = "LAYER_GRID";
                }

                const onTop = false;
                const testLayer = l as any;
                if ( testLayer && testLayer.restoreCommand && testLayer.restoreCommand.parameters && testLayer.restoreCommand.layer.onTop) {
                    newNode.onTop = { value: !!testLayer.restoreCommand.layer.onTop, enabled: true };
                }
                if (typeof (l as FeatureLayer).shapeProvider !== 'undefined') {
                    newNode.treeNodeType = "LAYER_FEATURE";
                    // Retrieve Selectability of Layer
                    if (typeof (l as FeatureLayer).selectable !== "undefined"){
                        newNode.selectable = {value: (l as FeatureLayer).selectable, enabled: true};
                    } else {
                        newNode.selectable = {value: false, enabled: false};
                    }
                }
                if (typeof (l as RasterTileSetLayer).rasterStyle !== 'undefined') {
                    newNode.treeNodeType = "LAYER_RASTER";
                    // Retrieve Queryability of Layer (WMS only)

                    if (typeof (l as any).queryable !== "undefined") {
                        if ( l instanceof WMSTileSetLayer) {
                            const wmsLayer =  l as WMSTileSetLayer;
                            const model = wmsLayer.model as WMSTileSetModel;
                            const queryActive = !!(wmsLayer as any).queryActive;
                            newNode.queryable = {value: wmsLayer.queryable, enabled: model.queryable, active: queryActive};
                        } else {
                            newNode.queryable = {value: false, enabled: false, active: undefined};
                        }
                    } else {
                        newNode.queryable = {value: false, enabled: false, active: undefined};
                    }
                }
            } else if (layer.treeNodeType === LayerTreeNodeType.LAYER_GROUP) {
                const group = layer as any;
                newNode.treeNodeType = "LAYER_GROUP";
                newNode.collapsed = typeof group.collapsed !== "undefined" ? group.collapsed : undefined;
                newNode.nodes = [];
                for (const child of layer.children) {
                    const childnode = syncTree(child, level);
                    newNode.nodes.push(childnode)
                }
            }
            return newNode;
        }
        const newTree = syncTree(tree, 0);
        return newTree;
    }

}

export default LayerTreeTools;
