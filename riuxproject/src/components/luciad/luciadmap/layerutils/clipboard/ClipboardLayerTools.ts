import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {Map} from "@luciad/ria/view/Map";
import ScreenMessage, {ScreenMessageTypes} from "../../../../screenmessage/ScreenMessage";
import GeoTools from "../../../utils/geotools/GeoTools";
import {MemoryStore} from "@luciad/ria/model/store/MemoryStore";
import ClipboardUtils from "../../../../../utils/clipboard/ClipboardUtils";
import GeoJSONProCodec from "../../codecs/GeoJSONProCodec";
import { GeoJsonCodec } from "@luciad/ria/model/codec/GeoJsonCodec";
import {Feature} from "@luciad/ria/model/feature/Feature";
import EditSelectLayerTools from "../editselect/EditSelectLayerTools";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";

const geojsoncodec4export = new GeoJSONProCodec({generateIDs:true, auto3D : true});

class ClipboardLayerTools {

    public static copyFeatureToClipboard(layer: FeatureLayer, map: Map, contextMenuInfo: any) {
        const feature = contextMenuInfo.objects[0];
        const memoryStore = new MemoryStore();
        let newFeature = feature;
        if (!GeoTools.isNativeGeoJSONReference(feature.shape.reference)) {
            const newShape = GeoTools.reprojectShape(feature.shape);
            newFeature = new Feature(newShape, feature.properties, feature.id);
        }
        memoryStore.put(newFeature);
        const cursor = memoryStore.query();
        const result = geojsoncodec4export.encode(cursor);
        ClipboardUtils.copyTextToClipboard(result.content,
            (m:any)=>{ScreenMessage.info("The feature has been copied to the Clipboard");},
            (m:any)=>{ScreenMessage.error("Unable to copy to clipboard");});
    }

    public static copySelectedFeaturesToClipboard(layer: FeatureLayer, map: Map, selectedObjects: any) {
        const memoryStore = new MemoryStore();
        for(const selectedObject of selectedObjects){
            const feature = selectedObject;
            let newFeature = feature;
            if (!GeoTools.isNativeGeoJSONReference(feature.shape.reference)) {
                const newShape = GeoTools.reprojectShape(feature.shape);
                newFeature = new Feature(newShape, feature.properties, feature.id);
            }
            memoryStore.put(newFeature);
        }
        const cursor = memoryStore.query();
        const result = geojsoncodec4export.encode(cursor);
        ClipboardUtils.copyTextToClipboard(result.content,
            (m:any)=>{ScreenMessage.info("The selected shapes have been copied to the Clipboard");},
            (m:any)=>{ScreenMessage.error("Unable to copy to clipboard");});
    }

    public static pasteToFeatureLayer(layer: FeatureLayer) {
        const geojsoncodec = new GeoJsonCodec({generateIDs: true});
        if (EditSelectLayerTools.isEditable(layer)) {
            const model = layer.model as FeatureModel;
            const promiseToText = ClipboardUtils.getTextFromClipboard();
            promiseToText.then(clipboardData => {
                ClipboardLayerTools.updateStoreUsingCodec(model, {
                    data: clipboardData,
                    codec: geojsoncodec,
                    messageOnError: "Error parsing Pasted feature(s)"
                });
            });
        }
    }

    private static updateStoreUsingCodec(aModel: FeatureModel, parameters: any) {
        return new Promise((resolve, reject) => {
            try {
                const featureList = [];
                const featureCursor = parameters.codec.decode({content: parameters.data});
                while (featureCursor.hasNext()) {
                    const feature = featureCursor.next();
                    aModel.put(feature);
                    featureList.push(feature);
                }
                resolve({featureList});
            } catch (e) {
                if (parameters.messageOnError) {
                    const reason = {type: ScreenMessageTypes.ERROR, message:parameters.messageOnError}
                    reject(reason)
                } else {
                    reject(null);
                }
            }
        })
    }

}

export default ClipboardLayerTools;
