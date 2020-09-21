import {Feature} from "@luciad/ria/model/feature/Feature";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {ContextMenuClassType} from "../../../customcontextmenu/GlobalContextMenu";
import {Map} from "@luciad/ria/view/Map";
import FeatureRenderer from "../featurerender/FeatureRenderer";
import EditSelectLayerTools from "../layerutils/editselect/EditSelectLayerTools";
import {Layer} from "@luciad/ria/view/Layer";
import ClipboardLayerTools from "../layerutils/clipboard/ClipboardLayerTools";

export interface GenerateFeatureContextMenuOptions {
    layer: FeatureLayer;
}

export interface FeatureContextMenuOptions {
    layer: FeatureLayer;
    contextMenu: ContextMenuClassType,
    map: Map;
    contextMenuInfo: any;
    selectedObjects: any;
    index: number;
}

class FeatureContextMenuProvider {

    static generateMenu(contextMenuParameters: GenerateFeatureContextMenuOptions) {
        const onCreateContextMenu = (
            contextMenu: ContextMenuClassType,
            map: Map,
            contextMenuInfo: any,
        ) => {
            const selectedObjects = EditSelectLayerTools.getLayerSelectedFeatures(
                map,
                contextMenuInfo.layer
            );
            const featureContextMenuOptions: FeatureContextMenuOptions = {
                layer: contextMenuParameters.layer,
                map,
                contextMenu,
                contextMenuInfo,
                selectedObjects,
                index: 0
            }
            if (featureContextMenuOptions.selectedObjects.length === 1) {
                const feature = featureContextMenuOptions.contextMenuInfo.objects[0];
                featureContextMenuOptions.map.selectObjects([{layer: featureContextMenuOptions.layer, objects: [feature]}]);
            }
            FeatureContextMenuProvider.allFeatures(featureContextMenuOptions);
            FeatureContextMenuProvider.copyFeatures(featureContextMenuOptions);
            FeatureContextMenuProvider.editableFeatures(featureContextMenuOptions);
        };

        return onCreateContextMenu;
    }

    static allFeatures(options: FeatureContextMenuOptions) {
        if (options.selectedObjects.length < 2) {
            options.contextMenu.addItem({
                label: 'Show properties',
                action: () => {
                    ShowBalloonProperties(options.map, options.layer, options.contextMenuInfo);
                },
                // icon: BalloonIcon,
                title: "Show the feature's properties (balloon)",
            }); // BalloonIcon //ShowIcon
            options.index++;
        }
    }

    static editableFeatures(options: FeatureContextMenuOptions) {
        if (options.selectedObjects.length < 2 && EditSelectLayerTools.isEditable(options.layer)) {
            options.contextMenu.addItem({
                label: 'Edit geometry',
                action: () => {
                    EditSelectLayerTools.editFeature(options.layer, options.map, options.contextMenuInfo, (options.map as any).defaultController);
                },
                title: "Edit feature geometry",
            });
            options.contextMenu.addItem({
                label: 'Delete',
                action: () => {
                    EditSelectLayerTools.deleteFeature(options.layer, options.map, options.contextMenuInfo);
                },
                title: "Edit feature geometry",
            });
            options.index++;
        }
        if (options.selectedObjects.length >= 2 && EditSelectLayerTools.isEditable(options.layer)) {
            options.contextMenu.addItem({
                label: 'Delete',
                action: () => {
                    EditSelectLayerTools.deleteSelectedFeatures(options.layer, options.map, options.contextMenuInfo, options.selectedObjects);
                },
                title: "Edit feature geometry",
            });
            options.index++;
        }
    }

    static copyFeatures(options: FeatureContextMenuOptions) {
        if (options.selectedObjects.length < 2) {
            options.contextMenu.addItem({
                label: 'Copy to clipboard',
                action: () => {
                    ClipboardLayerTools.copyFeatureToClipboard(options.layer, options.map, options.contextMenuInfo);
                },
                title: "Edit feature geometry",
            });
            options.index++;
        } else {
            options.contextMenu.addItem({
                label: 'Copy to clipboard',
                action: () => {
                    ClipboardLayerTools.copySelectedFeaturesToClipboard(options.layer, options.map, options.selectedObjects);
                },
                title: "Edit feature geometry",
            });
            options.index++;
        }
    }
}

export default FeatureContextMenuProvider;

function ShowBalloonProperties(map: Map, layer: FeatureLayer, contextMenuInfo: any) {
    const ShowFeatureProperties = (feature: Feature) => {
        if (layer && layer.painter && feature && feature.shape) {
            let shape = feature.shape;
            if (layer.shapeProvider) {
                const s = layer.shapeProvider.provideShape(feature);
                if (s) shape = s;
            }
            map.showBalloon({
                contentProvider: () => {
                    return FeatureRenderer.createFeatureHtmlNode(feature);
                },
                object: shape,
                panTo: false,
            });
            // As requested by Stan, do not zoom in to show properties.
            // map.mapNavigator.fit({bounds: feature.shape.bounds, animate:{duration:3000}});
        }
    };

    const id = contextMenuInfo.objects[0].id;
    if (contextMenuInfo.layer === layer) {
        if (typeof contextMenuInfo.layer.model.get !== 'undefined') {
            const promiseToFeature = contextMenuInfo.layer.model.get(id);
            if (typeof promiseToFeature.then !== 'undefined') {
                promiseToFeature.then(ShowFeatureProperties);
            } else {
                const feature = promiseToFeature;
                ShowFeatureProperties(feature);
            }
        } else {
            ShowFeatureProperties(contextMenuInfo.objects[0]);
        }
    }
}


