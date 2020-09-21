import { Feature } from "@luciad/ria/model/feature/Feature";
import { ShapeType } from "@luciad/ria/shape/ShapeType";
import { BasicCreateController } from "@luciad/ria/view/controller/BasicCreateController";
import { Controller } from "@luciad/ria/view/controller/Controller";
import { Layer } from "@luciad/ria/view/Layer";
import { Map } from "@luciad/ria/view/Map";
import { GeoCanvas } from "@luciad/ria/view/style/GeoCanvas";
import ScreenMessage from "../../../../screenmessage/ScreenMessage";
import GeoTools from "../../../utils/geotools/GeoTools";


type CreateFeatureInLayerOnComplete = (feature: Feature, layer?: Layer) => any;

class CreateFeatureInLayerController extends BasicCreateController {
    private layer:Layer;
    private fallbackController:Controller;
    private callOnCompletion: CreateFeatureInLayerOnComplete | null;
    private promiseResolve: (value?: (PromiseLike<Feature> | Feature)) => void;
    private promiseReject: (reason?: any) => void;
    private forceID: any;

    constructor(shapeType:ShapeType, defaultProperties:any, layer: Layer, controller: Controller, options?: any){
        super(shapeType, defaultProperties, {finishOnSingleClick: true});
        options = options ? options: {};

        this.layer =  layer;
        this.fallbackController =  controller;
        this.callOnCompletion = typeof options.callOnCompletion === "function" ? options.callOnCompletion : null;
        this.forceID = typeof options.forceID !== "undefined" ? options.forceID : null;
        this.promiseResolve = null;
        this.promiseReject = null;
    }

    public getPromiseOnFeatureCompletion() {
        return new Promise<Feature>(((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
        }));
    }
    public onChooseLayer = (aMapView: Map) => {
        return this.layer;
    };
    public onDeactivate(map: Map){
        super.onDeactivate(map);
        map.controller = this.fallbackController;
        if (this.promiseReject) {
            this.promiseReject();
        }
    }
    public onCreateNewObject(aMapView: Map, aLayer: Layer) {
        const feature =  super.onCreateNewObject(aMapView, aLayer);
        return feature;
    }
    public onDraw(geoCanvas: GeoCanvas) {
        super.onDraw(geoCanvas);
    }
    public onObjectCreated(aMapView: Map, aLayer: Layer, feature: any): boolean {
        const layer = aLayer;
        let newFeature = feature;
        // If Shape === Bounds it will be converted to a Polygon
        const targetID = this.forceID !== null ? this.forceID : feature.id;
        if (feature.shape.type === ShapeType.BOUNDS) {
            const newShape = GeoTools.createGeoJSONShapeFromBounds(feature.shape);
            newFeature = new Feature(newShape, feature.properties, targetID);
        } else
        // tslint:disable-next-line:no-bitwise
        if (ShapeType.CIRCLE_BY_CENTER_POINT  & feature.shape.type) {
            const newShape = GeoTools.createDiscreteCircle_SHORTEST_DISTANCE(feature.shape.center, feature.shape.radius, 60);
            newFeature = new Feature(newShape, feature.properties, targetID);
        } else if (this.forceID!==null){
            newFeature = new Feature(feature.shape, feature.properties, targetID);
        }
        const model = layer.model as any;
        if (model.add) {
            super.onObjectCreated(aMapView, layer, newFeature);
            if (this.callOnCompletion) {
                this.callOnCompletion(newFeature, layer)
            }
            if (this.promiseResolve){
                this.promiseResolve(newFeature);
                this.promiseReject = null;
            }
        }
        else {
            ScreenMessage.error("Layer can not be edited:" + layer.label);
        }
        return true;
    }
}

export default CreateFeatureInLayerController;
