import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {Map} from "@luciad/ria/view/Map";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {LayerTreeNodeType} from "@luciad/ria/view/LayerTreeNodeType";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";

class NavigateLayerTools {

    public static fitToLayer(map: Map, node: LayerTreeNode){

        if (node && node.treeNodeType !== LayerTreeNodeType.LAYER_GROUP){
            if (typeof (node as any).workingSet !== "undefined"){
                const featureLayer = node as FeatureLayer;
                const workingSet = featureLayer.workingSet as any;
                if (featureLayer.filter) {
                    const reducedBounds = calculateFilteredBounds(featureLayer);
                    if (reducedBounds) {
                        map.mapNavigator.fit({bounds: reducedBounds, animate: true});
                    }
                    else {
                        const layer = featureLayer as any;
                        if (workingSet.bounds !== null){
                            map.mapNavigator.fit({animate: true, bounds: workingSet.bounds});
                        } else {
                            if (layer.restoreCommand.fitBounds) {
                                const ref = getReference(layer.restoreCommand.fitBounds.reference);
                                const coordinates = layer.restoreCommand.fitBounds.coordinates;
                                const fitBounds = createBounds(ref, coordinates);
                                map.mapNavigator.fit({animate: true, bounds: fitBounds});
                            } else {
                                const expectedBound = featureLayer.bounds
                                if (expectedBound) {
                                    map.mapNavigator.fit({animate: true, bounds: expectedBound});
                                } else {
                                    const qFinishedHandle = featureLayer.workingSet.on("QueryFinished", () =>{
                                        if (featureLayer.bounds) {
                                            map.mapNavigator.fit({animate: true, bounds: featureLayer.bounds});
                                        }
                                        qFinishedHandle.remove();
                                    });
                                }
                            }
                        }
                    }
                } else {
                    const layer = featureLayer as any;
                    if (workingSet.bounds !== null){
                        map.mapNavigator.fit({animate: true, bounds: workingSet.bounds});
                    } else {
                        if (layer.restoreCommand && layer.restoreCommand.fitBounds) {
                            const ref = getReference(layer.restoreCommand.fitBounds.reference);
                            const coordinates = layer.restoreCommand.fitBounds.coordinates;
                            const fitBounds = createBounds(ref, coordinates);
                            map.mapNavigator.fit({animate: true, bounds: fitBounds});
                        } else {
                            const expectedBound = featureLayer.bounds
                            if (expectedBound) {
                                map.mapNavigator.fit({animate: true, bounds: expectedBound});
                            } else {
                                const qFinishedHandle = featureLayer.workingSet.on("QueryFinished", () =>{
                                    if (featureLayer.bounds) {
                                        map.mapNavigator.fit({animate: true, bounds: featureLayer.bounds});
                                    }
                                    qFinishedHandle.remove();
                                });
                            }
                        }
                    }
                }
            } else {
                const layer = node as any;
                if (layer.restoreCommand && layer.restoreCommand.fitBounds) {
                    const ref = getReference(layer.restoreCommand.fitBounds.reference);
                    const coordinates = layer.restoreCommand.fitBounds.coordinates;
                    const fitBounds = createBounds(ref, coordinates);
                    map.mapNavigator.fit({animate: true, bounds: fitBounds});
                } else {
                    map.mapNavigator.fit({animate: true, bounds: (layer).bounds});
                }
            }
        }
    }

}

function calculateFilteredBounds(layer:FeatureLayer) {
    const boundsArray = layer.workingSet.get()
        .filter(layer.filter)
        .map((feature: any) => feature.shape.bounds);
    if (boundsArray.length !== 0) {
        const b = boundsArray.reduce((previousValue:any, currentValue:any) => {
            previousValue.setTo2DUnion(currentValue);
            return previousValue;
        }, boundsArray[0].copy());
        return b;
    } else {
        return null;
    }
}

export default NavigateLayerTools;
