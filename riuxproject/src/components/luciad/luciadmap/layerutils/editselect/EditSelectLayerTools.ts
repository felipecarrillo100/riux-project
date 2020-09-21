import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {Map} from "@luciad/ria/view/Map";
import ScreenMessage from "../../../../screenmessage/ScreenMessage";
import {EditController} from "@luciad/ria/view/controller/EditController";
import {Controller} from "@luciad/ria/view/controller/Controller";
import CreateFeatureInLayerController from "../../controllers/createfeaturecontroller/CreateFeatureInLayerController";
import {LayerEditActions} from "../../../interfaces/LayerEditActions";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {Shape} from "@luciad/ria/shape/Shape";
import RectangleSelectController from "../../controllers/selectioncontrollers/RectangleSelectController";
import GeoFilter, {GEOFILTER_OPERATOR} from "../../../utils/geofilter/GeoFilter";
import {Feature} from "@luciad/ria/model/feature/Feature";
import GeoTools from "../../../utils/geotools/GeoTools";
import {LayerTypes} from "../../../interfaces/LayerTypes";
import {MemoryStore} from "@luciad/ria/model/store/MemoryStore";

class EditSelectLayerTools {

    public static isEditable(node:LayerTreeNode) {
        const layer = node as any;
        let editable = false;
        if (layer.editable) {
            if (EditSelectLayerTools.canEdit(node)) {
                editable = true
            }
        }
        return editable;
    }

    public static isSelectable(node:LayerTreeNode) {
        const layer = node as any;
        let selectable = false;
        if (layer.selectable) {
            selectable = true
        }
        return selectable;
    }

    public static canEdit(node: any) {
        const layer = node;
        let editable = false;
        if (layer.model.put || layer.model.remove) {
            editable = true
        }
        return editable;
    }

    public static editFeature(layer: FeatureLayer, map: Map, contextMenuInfo: any,  fallbackController?: Controller) {
        const editController = new EditController(layer, contextMenuInfo.objects[0],{finishOnSingleClick: true});
        editController.onDeactivate = (...args) => {
            const promise =  new Promise<void>( resolve => {
                EditController.prototype.onDeactivate.apply(editController, args);
                if (typeof fallbackController !== "undefined"){
                    map.controller =  fallbackController;
                } else {
                    map.controller = null;
                }
                resolve();
            } );
            return promise;
        };
        map.controller = editController;
    }

    public static deleteFeature(
        layer: FeatureLayer,
        map: Map,
        contextMenuInfo: any
    ) {
        const id = contextMenuInfo.objects[0].id;
        if (contextMenuInfo.layer.model.remove) {
            contextMenuInfo.layer.model.remove(id);
        } else {
            ScreenMessage.error(
                'Layer can not be edited:' + contextMenuInfo.layer.label
            );
        }
    }

    public static deleteSelectedFeatures(
        layer: FeatureLayer,
        map: Map,
        contextMenuInfo: any,
        selectedObjects: any
    ) {
        for (const selectedObject of selectedObjects) {
            if (contextMenuInfo.layer.model.remove) {
                contextMenuInfo.layer.model.remove(selectedObject.id);
            }
        }
    }

    public static getLayerSelectedFeatures(aMap: Map, aLayer: FeatureLayer) {
        const index = aMap.selectedObjects.findIndex(
            (selectionItem: any) => selectionItem.layer === aLayer
        );
        return index > -1 ? aMap.selectedObjects[index].selected : [];
    }

    public static createAnyShape(map: Map, layer: any, shapeType: any) {
        let defaultProperties = {};
        map.selectObjects([]);
        if (layer.restoreCommand.model.defaultProperties) {
            defaultProperties = JSON.parse(JSON.stringify(layer.restoreCommand.model.defaultProperties));
        }
        const defaultController = (map as any).defaultController;
        const createController = new CreateFeatureInLayerController(shapeType, defaultProperties, layer, defaultController);
        map.controller = createController;
    }

    static mapEditActioToShapeType(editAction: string) {
        switch (editAction) {
            case LayerEditActions.POINT:
                return ShapeType.POINT;
            case LayerEditActions.LINE:
                return ShapeType.POLYLINE;
            case LayerEditActions.POLYGON:
                return  ShapeType.POLYGON;
            case LayerEditActions.CIRCLE:
                return ShapeType.CIRCLE_BY_CENTER_POINT;
            case LayerEditActions.BOUNDS:
                return ShapeType.BOUNDS;
            default:
                return null;
        }
    }

    static selectTool(map: Map, layer: FeatureLayer) {
        const onSelectionCompleted = (shapeinMaps: Shape, inverted: boolean) => {
            map.controller = (map as any).defaultController;
            EditSelectLayerTools.SelectOnShape(map, layer, shapeinMaps, inverted);
        }

        ScreenMessage.info("Drag-Right = Contains | Drag-Left = Intersects");
        const selectionController = new RectangleSelectController(onSelectionCompleted);
        map.controller = selectionController;
    }

    private static SelectOnShape(map: Map, layer: FeatureLayer, shape: Shape, inverted: boolean) {
        const geoFilter = inverted ? new GeoFilter(shape, GEOFILTER_OPERATOR.INTERSECTS) : new GeoFilter(shape,GEOFILTER_OPERATOR.CONTAINS);

        const SelectItems = (cursor: any) => {
            const selected = [];
            while (cursor.hasNext()) {
                const feature = cursor.next() as Feature;
                let newShape = feature.shape;
                if (!GeoTools.isNativeGeoJSONReference(newShape.reference)) {
                    newShape = GeoTools.reprojectShape(feature.shape);
                }
                const match = geoFilter.evaluate(newShape);
                if (match) {
                    selected.push(feature);
                }
            }
            map.selectObjects([{layer, objects:selected}]);
            ScreenMessage.info(selected.length + " selected feature(s).")
        }
        /// Start here
        const restoreCommand = (layer as any).restoreCommand;
        if (restoreCommand.layerType === LayerTypes.WFSLayer) {
            const memoryStore = new MemoryStore();
            for(const feature of layer.workingSet.get()){
                memoryStore.put(feature);
            }
            SelectItems(memoryStore.query());
        } else {
            const query = (layer.model as any).query();
            if (query.then) {
                query.then((cursor: any)=>{
                    SelectItems(cursor);
                })
            } else {
                SelectItems(query);
            }
        }
    }

    static selectNone(map: Map, layer: FeatureLayer) {
        const SelectNone = () => {
            const selected = [] as any;
            map.selectObjects([{layer, objects:selected}]);
            ScreenMessage.info(selected.length + " selected feature(s).")
        }
        SelectNone();
    }

    static selectAll(map: Map, layer: FeatureLayer) {
        const SelectItems= (cursor: any) => {
            const selected = [];
            while (cursor.hasNext()) {
                const feature = cursor.next();
                selected.push(feature);
            }
            map.selectObjects([{layer, objects:selected}]);
            ScreenMessage.info(selected.length + " selected feature(s).")
        }
        const restoreCommand = (layer as any).restoreCommand;
        if (restoreCommand.layerType === LayerTypes.WFSLayer) {
            const memoryStore = new MemoryStore();
            for(const feature of layer.workingSet.get()){
                memoryStore.put(feature);
            }
            SelectItems(memoryStore.query());
        } else {
            const model = layer.model as any;
            const query = model.query();
            if (query.then) {
                query.then((cursor: any)=>{
                    SelectItems(cursor);
                })
            } else {
                SelectItems(query);
            }
        }
    }
}

export default EditSelectLayerTools;
