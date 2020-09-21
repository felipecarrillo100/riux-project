import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {Map} from "@luciad/ria/view/Map";
import ScreenMessage from "../../../../screenmessage/ScreenMessage";
import {LayerTypes} from "../../../interfaces/LayerTypes";
import {MemoryStore} from "@luciad/ria/model/store/MemoryStore";

class CountFeaturesLayerTools {

    static countAll(map: Map, layer: FeatureLayer) {
        const CountItems= (cursor: any) => {
            const selected = [];
            while (cursor.hasNext()) {
                const feature = cursor.next();
                selected.push(feature);
            }
            ScreenMessage.info(" Found " + selected.length + " feature(s).")
        }
        const restoreCommand = (layer as any).restoreCommand;
        if (restoreCommand.layerType === LayerTypes.WFSLayer) {
            const memoryStore = new MemoryStore();
            for(const feature of layer.workingSet.get()){
                memoryStore.put(feature);
            }
            CountItems(memoryStore.query());
        } else {
            const model = layer.model as any;
            const query = model.query();
            if (query.then) {
                query.then((cursor: any)=>{
                    CountItems(cursor);
                })
            } else {
                CountItems(query);
            }
        }
    }

    static countSelected(map: Map, layer: FeatureLayer) {
        const selectedObjects = map.selectedObjects;
        for ( const selectedObject of selectedObjects){
            const currentLayer = selectedObject.layer;
            if ( currentLayer.id === layer.id ){
                const counter = selectedObject.selected.length; //array of the selected objects for layer
                ScreenMessage.info(" Found " + counter + " selected feature(s).")
                return;
            }
        }
    }
}

export default CountFeaturesLayerTools;
