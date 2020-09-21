import LuciadMap from "../LuciadMap";
import {Command} from "../../../../reduxboilerplate/command/reducer";
import {ApplicationCommands} from "../../../../commands/ApplicationCommands";
import {LayerTypes} from "../../interfaces/LayerTypes";
import {Layer} from "@luciad/ria/view/Layer";
import ModelFactory from "../factories/ModelFactory";
import LayerFactory from "../factories/LayerFactory";
import FeatureContextMenuProvider, {GenerateFeatureContextMenuOptions} from "../featurecontextmenu/FeatureContextMenuProvider";
import {Map} from "@luciad/ria/view/Map";
import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {GridLayer} from "@luciad/ria/view/grid/GridLayer";
import {RasterLayer} from "@luciad/ria/view/RasterLayer";
import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {LayerGroup} from "@luciad/ria/view/LayerGroup";
import {LonLatGrid} from "@luciad/ria/view/grid/LonLatGrid";
import {FusionTileSetModel} from "@luciad/ria/model/tileset/FusionTileSetModel";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {LayerTree} from "@luciad/ria/view/LayerTree";
import {PaintRepresentation} from "@luciad/ria/view/PaintRepresentation";
import {LayerTreeNodeType} from "@luciad/ria/view/LayerTreeNodeType";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {ReservedLayerID} from "../../interfaces/ReservedLayerID";

function PromiseToModel<mytype>(model:any) {
    return new Promise<mytype>((resolve)=>resolve(model));
}

interface GetLayerTreeCommandOptions {
    removeCredentials?: boolean;
    withModels?: boolean
}

class LayerBuilder {

    private static findNodeById(layerTree: LayerTreeNode, id: string): LayerTreeNode {
        const layer = layerTree.findLayerById(id);
        if (layer) return layer;
        const layerGroup = layerTree.findLayerGroupById(id);
        return layerGroup;
    }

    public static createLayerOnCommand(aCommand: Command, targetLayerGroup?: LayerGroup): Promise<Layer | LayerGroup> {
        let command: Command;
        if (typeof aCommand.action !== "undefined") {
            command = aCommand;
        } else {
            command = {
                action: ApplicationCommands.CREATEANYLAYER,
                parameters: aCommand,
            } as Command
        }
        if (command.action === ApplicationCommands.CREATEANYLAYER) {
            switch(command.parameters.layerType) {
                case LayerTypes.EditableFeatureLayer:
                    return this.createEditableLayer(command, targetLayerGroup);
                case LayerTypes.GridLayer:
                    return this.createGridLayer(command, targetLayerGroup);
                case LayerTypes.LTSLayer:
                    return this.createLTSLayer(command, targetLayerGroup);
                case LayerTypes.WMSLayer:
                    return this.createWMSLayer(command, targetLayerGroup);
                case LayerTypes.TMSLayer:
                    return this.createTMSLayer(command, targetLayerGroup);
                case LayerTypes.BingMapsLayer:
                    return this.createBingMapsLayer(command, targetLayerGroup);
                case LayerTypes.WFSLayer:
                    return this.createWFSLayer(command, targetLayerGroup);
                case LayerTypes.LayerGroup:
                    return this.createLayerGroup(command, targetLayerGroup);
                case LayerTypes.Root:
                    return this.createRoot(command, targetLayerGroup);
                default:
                    return new Promise((resolve, reject) => {reject()});
            }
        }
    }

    private static cloneRestoreCommand(command: Command) {
        return { ...command.parameters };
    }

    private static assignRestoreCommand(layer: Layer | LayerGroup, restoreCommand: any) {
        delete restoreCommand.autozoom;
        delete restoreCommand.reusableModel;
        (layer as any).restoreCommand = restoreCommand;
    }

    private static createRoot(command: Command, root?: LayerGroup) {
        return new Promise<LayerTree>((resolve, reject) => {
            if (root && typeof command.parameters.nodes !== "undefined"){
                const promises = [];
                for (const node of command.parameters.nodes) {
                    promises.push(LayerBuilder.createLayerOnCommand(node, undefined));
                }
                Promise.all(promises). then(layers=>{
                    for(const layer of layers){
                        root.addChild(layer);
                    }
                    resolve(root);
                });
            }
        })
    }

    private static createLayerGroup(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<LayerGroup>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const group = LayerFactory.createLayerGroup(command.parameters.layer);
            setTimeout(() => {
                if (typeof command.parameters.nodes !== "undefined"){
                    const promises = [];
                    for (const node of command.parameters.nodes) {
                        promises.push(LayerBuilder.createLayerOnCommand(node, undefined));
                    }
                    Promise.all(promises). then(layers=>{
                        for(const layer of layers){
                            group.addChild(layer);
                        }
                    })
                }
            });
            if (targetLayerGroup) {
                LayerBuilder.replaceOnDuplicatedID(targetLayerGroup, group);
            }
            LayerBuilder.assignRestoreCommand(group, restoreCommand);
            resolve(group);
        })
    }

    private static isRoot(layerTree: LayerTreeNode) {
        return layerTree instanceof LayerTree;
    }

    private static ensureUniqueID(targetLayerGroup: LayerTreeNode, id: string ) {
        const isRoot = LayerBuilder.isRoot(targetLayerGroup);
        if (!isRoot) {
            return true;
        } else
        if (typeof id !== "undefined" && LayerBuilder.findNodeById(targetLayerGroup, id) === undefined) {
            return true;
        }
        return false;
    }

    private static createGridLayer(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<GridLayer>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const promiseToModel = command.parameters.reusableModel ?
                PromiseToModel<LonLatGrid>(command.parameters.reusableModel) :  ModelFactory.createGridModel(command.parameters.model);
            promiseToModel.then((model) => {
                command.parameters.layer = command.parameters.layer
                    ? command.parameters.layer
                    : {};
                const layerOptions = command.parameters.layer;
                layerOptions.visible =
                    typeof layerOptions.visible !== 'undefined'
                        ? layerOptions.visible
                        : true;
                layerOptions.label = layerOptions.label
                    ? layerOptions.label
                    : 'Grid';
                const layer = LayerFactory.createGridLayer(model, layerOptions) as any;
                if (targetLayerGroup && LayerBuilder.ensureUniqueID(targetLayerGroup, layer.id)) {
                    targetLayerGroup.addChild(layer);
                }
                LayerBuilder.assignRestoreCommand(layer, restoreCommand);
                resolve(layer)
            });
        });
    }

    private static createLTSLayer(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<RasterLayer>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const promiseToModel = command.parameters.reusableModel ?
                PromiseToModel<FusionTileSetModel>(command.parameters.reusableModel) :  ModelFactory.createLTSModel(command.parameters.model);
            promiseToModel.then((model) => {
                command.parameters.layer = command.parameters.layer
                    ? command.parameters.layer
                    : {};
                const layerOptions = command.parameters.layer;
                layerOptions.visible =
                    typeof layerOptions.visible !== 'undefined'
                        ? layerOptions.visible
                        : true;
                layerOptions.label = layerOptions.label
                    ? layerOptions.label
                    : 'LTS layer';
                const layer = LayerFactory.createRasterLayer(model, layerOptions);
                if (targetLayerGroup) {
                    LayerBuilder.replaceOnDuplicatedID(targetLayerGroup, layer);
                }
                LayerBuilder.assignRestoreCommand(layer, restoreCommand);
                resolve(layer);
            });
        })
    }

    private static replaceOnDuplicatedID(targetLayerGroup: LayerGroup, layer: LayerTreeNode) {
        if (LayerBuilder.ensureUniqueID(targetLayerGroup, layer.id)) {
            targetLayerGroup.addChild(layer);
        } else {
            if (LayerBuilder.isRoot(targetLayerGroup)) {
                const oldLayer = LayerBuilder.findNodeById(targetLayerGroup, layer.id);
                const location = LayerBuilder.saveNodeLocation(targetLayerGroup, layer);
                oldLayer.parent.removeChild(oldLayer);
                // targetLayerGroup.addChild(layer);
                LayerBuilder.restoreNodeAtLocation({...location , layer});
            }
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

    private static createBingMapsLayer(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<RasterTileSetLayer>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const promiseToModel = command.parameters.reusableModel ?
                PromiseToModel<BingMapsTileSetModel>(command.parameters.reusableModel) :  ModelFactory.createBingmapsModel(command.parameters.model);
            promiseToModel.then((model) => {
                command.parameters.layer = command.parameters.layer
                    ? command.parameters.layer
                    : {};
                const layerOptions = command.parameters.layer;
                layerOptions.visible =
                    typeof layerOptions.visible !== 'undefined'
                        ? layerOptions.visible
                        : true;
                layerOptions.label = layerOptions.label
                    ? layerOptions.label
                    : 'Bingmaps layer';
                const layer = LayerFactory.createRasterLayer(model, layerOptions);
                if (targetLayerGroup) {
                    LayerBuilder.replaceOnDuplicatedID(targetLayerGroup, layer);
                }
                LayerBuilder.assignRestoreCommand(layer, restoreCommand);
                resolve(layer);
            });
        })
    }

    private static createTMSLayer(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<RasterTileSetLayer>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const promiseToModel = command.parameters.reusableModel ?
                PromiseToModel<UrlTileSetModel>(command.parameters.reusableModel) :  ModelFactory.createTMSModel(command.parameters.model);
            promiseToModel.then((model) => {
                command.parameters.layer = command.parameters.layer
                    ? command.parameters.layer
                    : {};
                const layerOptions = command.parameters.layer;
                layerOptions.visible =
                    typeof layerOptions.visible !== 'undefined'
                        ? layerOptions.visible
                        : true;
                layerOptions.label = layerOptions.label
                    ? layerOptions.label
                    : 'TMS layer';
                const layer = LayerFactory.createRasterLayer(model, layerOptions);
                if (targetLayerGroup) {
                    LayerBuilder.replaceOnDuplicatedID(targetLayerGroup, layer);
                }
                LayerBuilder.assignRestoreCommand(layer, restoreCommand);
                resolve(layer);
            });
        })
    }

    private static createWMSLayer(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<WMSTileSetLayer>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const promiseToModel = command.parameters.reusableModel ?
                PromiseToModel<WMSTileSetModel>(command.parameters.reusableModel) :  ModelFactory.createWMSModel(command.parameters.model);
            promiseToModel.then((model) => {
                command.parameters.layer = command.parameters.layer
                    ? command.parameters.layer
                    : {};
                const layerOptions = command.parameters.layer;
                layerOptions.visible =
                    typeof layerOptions.visible !== 'undefined'
                        ? layerOptions.visible
                        : true;
                layerOptions.label = layerOptions.label
                    ? layerOptions.label
                    : 'WMS layer';
                const layer = LayerFactory.createWMSLayer(model, layerOptions);
                if (targetLayerGroup) {
                    LayerBuilder.replaceOnDuplicatedID(targetLayerGroup, layer);
                }
                LayerBuilder.assignRestoreCommand(layer, restoreCommand);
                resolve(layer);
            });
        })
    }

    private static createEditableLayer(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<FeatureLayer>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const promiseToModel = command.parameters.reusableModel ?
                PromiseToModel<FeatureModel>(command.parameters.reusableModel) :  ModelFactory.createModelFromData(command.parameters.model);
            promiseToModel.then((model) => {
                command.parameters.layer = command.parameters.layer
                    ? command.parameters.layer
                    : {};
                const layerOptions = command.parameters.layer;
                layerOptions.visible =
                    typeof layerOptions.visible !== 'undefined'
                        ? layerOptions.visible
                        : true;
                layerOptions.selectable =
                    typeof layerOptions.selectable !== 'undefined'
                        ? layerOptions.selectable
                        : true;
                layerOptions.label = layerOptions.label
                    ? layerOptions.label
                    : LayerBuilder.getFilename(command.parameters.model.url);
                const layer = LayerFactory.createWFSLayer(model, layerOptions);
                layer.onCreateContextMenu = this.createFeatureContextMenu({layer});
                if (targetLayerGroup) {
                    LayerBuilder.replaceOnDuplicatedID(targetLayerGroup, layer);
                }
                LayerBuilder.assignRestoreCommand(layer, restoreCommand);
                resolve(layer);
            });
        });
    }


    private static createWFSLayer(command: Command, targetLayerGroup?: LayerGroup) {
        return new Promise<FeatureLayer>((resolve, reject) => {
            const restoreCommand= LayerBuilder.cloneRestoreCommand(command);
            const promiseToModel = command.parameters.reusableModel ?
                PromiseToModel<FeatureModel>(command.parameters.reusableModel) :  ModelFactory.createWFSModel(command.parameters.model);
            promiseToModel.then((wfsModel) => {
                command.parameters.layer = command.parameters.layer
                    ? command.parameters.layer
                    : {};
                const layerOptions = command.parameters.layer;
                layerOptions.visible =
                    typeof layerOptions.visible !== 'undefined'
                        ? layerOptions.visible
                        : true;
                layerOptions.selectable =
                    typeof layerOptions.selectable !== 'undefined'
                        ? layerOptions.selectable
                        : true;
                layerOptions.label = layerOptions.label
                    ? layerOptions.label
                    : LayerBuilder.getFilename(command.parameters.model.url);
                const layer = LayerFactory.createWFSLayer(wfsModel, layerOptions);
                layer.onCreateContextMenu = this.createFeatureContextMenu({layer});
                if (targetLayerGroup) {
                    LayerBuilder.replaceOnDuplicatedID(targetLayerGroup, layer);
                }
                LayerBuilder.assignRestoreCommand(layer, restoreCommand);
                resolve(layer);
            });
        })
    }

    private static createFeatureContextMenu(contextMenuParameters: GenerateFeatureContextMenuOptions) {
        return FeatureContextMenuProvider.generateMenu(contextMenuParameters);
    }

    private static getFilename(url: string) {
        const baseUrl = url.split('?')[0];
        return baseUrl.substring(baseUrl.lastIndexOf('/') + 1);
    }

    public static getLayerTreeNodeByID(map: Map, layerID: any) : LayerTreeNode{
        let node = map.layerTree.findLayerById(layerID) as LayerTreeNode;
        if (typeof node==="undefined") {
            node = map.layerTree.findLayerGroupById(layerID) as LayerTreeNode;
        }
        return node;
    }

    public static getRestoreCommand(tree: LayerTree, options: GetLayerTreeCommandOptions) {
        options = options ? options : {} as GetLayerTreeCommandOptions
        const withModels = typeof options.withModels!=="undefined" ? options.withModels : false;
        const removeCredentials = typeof options.removeCredentials!=="undefined" ? options.removeCredentials : false;

        function getTreeCommand(layer: any, level: number):any {
            let command = layer.restoreCommand;
            if (typeof command === "undefined") {
                command = {
                    layerType: "root",
                    layer: {}
                }
            }
            // tslint:disable-next-line:no-console
            // console.log(command);
            const newNode:any = command;
            if (typeof newNode.layer === "undefined") {
                newNode.layer = {};
            }
            newNode.layer.label = layer.label;
            newNode.layer.id = layer.id;
            if (layer.parent) {
                newNode.layer.parent_id = layer.parent.id;
            }
            // Retrieve Visibility of Layer
            newNode.layer.visible = layer.visible;
            // Retrieve Editability of Layer
            // Retrieve Visibility of Layer labels
            if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
                const currentValue = layer.isPaintRepresentationVisible(PaintRepresentation.LABEL);
                newNode.layer.labeled = currentValue;
            }
            level++;
            if (layer.treeNodeType === LayerTreeNodeType.LAYER) {
                const l = layer as Layer;
                if (withModels) {
                    newNode.reusableModel = l.model;
                }
                if (removeCredentials && newNode.model && newNode.model.requestHeaders) {
                    newNode.model.rerequestHeaders = this.clearCredentials(newNode.model.rerequestHeaders);
                }
                if (typeof l.editable !== "undefined") {
                    newNode.layer.editable = l.editable;
                }
                if (l.model && l.model.modelDescriptor && l.model.modelDescriptor.type === "OGC3D") {
                    newNode.layer.treeNodeType = "LAYER_OGC3D";
                }
                if (l.id === ReservedLayerID.GRID) {
                    newNode.layer.treeNodeType = "LAYER_GRID";
                }

                if (typeof (l as FeatureLayer).shapeProvider !== 'undefined') {
                    newNode.layer.treeNodeType = "LAYER_FEATURE";
                    // Retrieve Selectability of Layer
                    if (typeof (l as FeatureLayer).selectable !== "undefined"){
                        newNode.layer.selectable = (l as FeatureLayer).selectable;
                    } else {
                        newNode.layer.selectable = undefined;
                    }
                }
                if (typeof (l as RasterTileSetLayer).rasterStyle !== 'undefined') {
                    newNode.layer.treeNodeType = "LAYER_RASTER";
                }
            } else if (layer.treeNodeType === LayerTreeNodeType.LAYER_GROUP) {
                newNode.layer.treeNodeType = "LAYER_GROUP";
                newNode.layer.collapsed = (layer as any).collapsed;
                newNode.nodes = [];
                for (const child of layer.children) {
                    const childnode = getTreeCommand(child, level);
                    newNode.nodes.push(childnode)
                }
            }
            return newNode;
        }
        const newTree = getTreeCommand(tree, 0);
        return newTree;
    }


}

export default LayerBuilder;
