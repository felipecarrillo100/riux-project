import React from "react";

import TreeNodeInterface from "../interfaces/TreeNodeInterface";
import {ContextMenuContent, ContextMenuItems} from "../../../../../customcontextmenu/GlobalContextMenu";
import LayerControlIcon from "../layeritem/LayerControlIcon";
import {Map} from "@luciad/ria/view/Map";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {PaintRepresentation} from "@luciad/ria/view/PaintRepresentation";
import {RasterLayer} from "@luciad/ria/view/RasterLayer";
import {Layer} from "@luciad/ria/view/Layer";
import {LayerGroup} from "@luciad/ria/view/LayerGroup";
import NavigateLayerTools from "../../../layerutils/navigate/NavigateLayerTools";

export interface GenerateLayerContextMenuOptions {
    layerObject: TreeNodeInterface;
    map: Map;
}

class LayerContextMenuProvider {

    static generateMenu(contextMenuParameters: GenerateLayerContextMenuOptions):ContextMenuContent {
        const contectMenuContent: ContextMenuContent = {
            items: [] as ContextMenuItems
        }
        const items = LayerContextMenuProvider.allLayers(contextMenuParameters);
        contectMenuContent.items = items;
        contectMenuContent.items = [...items];
        if (contextMenuParameters.layerObject.treeNodeType === "LAYER_RASTER" ) {
            const menu = LayerContextMenuProvider.RasterLayers(contextMenuParameters);
            contectMenuContent.items = [...contectMenuContent.items, ...menu];
        }
        if (contextMenuParameters.layerObject.treeNodeType === "LAYER_GRID" ) {
            const menu = LayerContextMenuProvider.GridLayer(contextMenuParameters);
            contectMenuContent.items = [...contectMenuContent.items, ...menu];
        }
        if (contextMenuParameters.layerObject.treeNodeType === "LAYER_FEATURE" ) {
            const menu = LayerContextMenuProvider.FeatureLayers(contextMenuParameters);
            contectMenuContent.items = [...contectMenuContent.items, ...menu];
        }
        return  contectMenuContent;
    }

    private static allLayers(contextMenuParameters: GenerateLayerContextMenuOptions): ContextMenuItems {
        const items = [
            {
                label: "Remove Layer",
                icon: (<LayerControlIcon icon="delete" />),
                title: "Remove layer from map",
                action: () => {
                    const node = contextMenuParameters.layerObject.realNode;
                    const group = node.parent;
                    if (group) {
                        group.removeChild(node);
                    }
                },
            },
            {
                label: "Fit to Layer",
                icon: (<LayerControlIcon icon="fit" />),
                title: "Fit to layer bounds",
                action: () => {
                    NavigateLayerTools.fitToLayer(contextMenuParameters.map, contextMenuParameters.layerObject.realNode);
                },
            }
        ]
        return items;
    }

    private static triggerLayerUpdate(node: Layer | LayerGroup) {
        const layer = node as any;
        if (layer && layer._eventSupport) {
            layer._eventSupport.emit("TriggerNodeUpdate", {});
        }
    }

    private static FeatureLayers(contextMenuParameters: GenerateLayerContextMenuOptions) {
        const layer = contextMenuParameters.layerObject.realNode as FeatureLayer;
        const layerObject = contextMenuParameters.layerObject;
        const items = [
            { separator: true },
            {
                label: "Editable",
                icon: (<LayerControlIcon icon="edit" />),
                title: "Remove layer from map",
                checkbox: { active: true, enabled: layerObject.editable.enabled, value: layerObject.editable.value },
                action: () => {
                    if (layerObject.editable.enabled) layer.editable = !layer.editable;
                    LayerContextMenuProvider.triggerLayerUpdate(layer);
                },
            },
            {
                label: "Selectable",
                icon: (<LayerControlIcon icon="select" />),
                title: "Fit to layer bounds",
                checkbox: { active: true, enabled: layerObject.selectable.enabled, value: layerObject.selectable.value },
                action: () => {
                    if (layerObject.selectable.enabled) layer.selectable = !layer.selectable;
                    LayerContextMenuProvider.triggerLayerUpdate(layer);
                },
            },
            {
                label: "Show Labels",
                icon: (<LayerControlIcon icon="labels" />),
                title: "Fit to layer bounds",
                checkbox: { active: true, enabled: layerObject.labeled.enabled, value: layerObject.labeled.value },
                action: () => {
                    if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
                        layer.setPaintRepresentationVisible(PaintRepresentation.LABEL, !layerObject.labeled.value);
                    }
                },
            }
        ]
        return items;
    }

    private static RasterLayers(contextMenuParameters: GenerateLayerContextMenuOptions) {
        const layer = contextMenuParameters.layerObject.realNode as RasterLayer;
        const layerObject = contextMenuParameters.layerObject;
        const items = [
            { separator: true },
            {
                label: "Queryable",
                icon: (<LayerControlIcon icon="query" />),
                title: "Query for feature info",
                checkbox: { active: layerObject.queryable.active, enabled: layerObject.queryable.enabled, value: layerObject.queryable.value },
                action: () => {
                    const wmsLayer = layer as any;
                    if (layerObject.queryable.enabled  ) {
                        const queryActive = !!wmsLayer.queryActive;
                        wmsLayer.queryActive = !queryActive;
                        LayerContextMenuProvider.triggerLayerUpdate(wmsLayer);
                    }
                },
            },
        ]
        return items;
    }

    private static GridLayer(contextMenuParameters: GenerateLayerContextMenuOptions) {
        const layer = contextMenuParameters.layerObject.realNode as FeatureLayer;
        const layerObject = contextMenuParameters.layerObject;
        const items = [
            { separator: true },
            {
                label: "Show Labels",
                title: "Show/hide layer labels",
                checkbox: { active: true, enabled: layerObject.labeled.enabled, value: layerObject.labeled.value },
                action: () => {
                    if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
                        layer.setPaintRepresentationVisible(PaintRepresentation.LABEL, !layerObject.labeled.value);
                    }
                },
            }
        ]
        return items;
    }
}

export default LayerContextMenuProvider;
