import { GeoJsonCodec } from "@luciad/ria/model/codec/GeoJsonCodec";
import { GMLCodec } from "@luciad/ria/model/codec/GMLCodec";
import { Feature } from "@luciad/ria/model/feature/Feature";
import { MemoryStore } from "@luciad/ria/model/store/MemoryStore";
import * as ShapeFactory from "@luciad/ria/shape/ShapeFactory";
import { ShapeType } from "@luciad/ria/shape/ShapeType";
import { Controller } from "@luciad/ria/view/controller/Controller";
import { HandleEventResult } from "@luciad/ria/view/controller/HandleEventResult";
import { GestureEvent } from "@luciad/ria/view/input/GestureEvent";
import { GestureEventType } from "@luciad/ria/view/input/GestureEventType";
import { LayerTreeNode } from "@luciad/ria/view/LayerTreeNode";
import { LayerTreeVisitor } from "@luciad/ria/view/LayerTreeVisitor";

import { Map } from "@luciad/ria/view/Map";
import { GeoCanvas } from "@luciad/ria/view/style/GeoCanvas";
import IconProvider, {IconProviderOptions} from "../../../utils/iconimagefactory/IconProvider";

import throttle from "./throttle";
import ScreenMessage from "../../../../screenmessage/ScreenMessage";
import FeatureRenderer from "../../featurerender/FeatureRenderer";
import GeoTools from "../../../utils/geotools/GeoTools";
import ClipboardUtils from "../../../../../utils/clipboard/ClipboardUtils";

// Define reusable codecs
const geoJsonCodec = new GeoJsonCodec({generateIDs: true});
const gmlCodec = new GMLCodec();

const defaultColor = "rgba(255,0,0,1)";

const targetIconOptionsDefault: IconProviderOptions = {
    width: 24,
    height: 24,
    fill: "rgba(0,0,0,0)",
    stroke: defaultColor,
    strokeWidth: 2
}

const featureIconDefault = {
    draped: true,
    height: "24px",
    // url: "resources/icons/target_blue.png",
    image: null as any,
    width: "24px"
};

function SingleFeatureCopy(feature: Feature) {
    //   console.log("Copy");
    const memoryStore = new MemoryStore();
    const newShape = GeoTools.reprojectShape(feature.shape);
    const newFeature = new Feature(newShape, feature.properties, feature.id)
    memoryStore.put(newFeature);
    const cursor = memoryStore.query();
    const result = geoJsonCodec.encode(cursor);

    // tslint:disable-next-line:no-console
    console.log(result);
    ClipboardUtils.copyTextToClipboard(result.content);
    ScreenMessage.info("Feature has been copied to the Clipboard");
}


class GetFeatureInfoController extends Controller {
    private myOnClickOnly: any;
    private myFeature: any;
    private myFeatureLayer: any;
    private myCallbacksToRemove: any;
    private myBalloonContentProvider: any;
    private myMouseMoved: any;
    private myBalloonShowing: any;
    private myInfoPromise: any;
    private color: string;
    private targetIconOptions: { strokeWidth?: number; width?: number; fill?: string; stroke?: string; height?: number };
    private featureIcon: { image: any; draped: boolean; width: string; height: string };

    constructor(options?: any) {
        super();
        options = options || {};
        this.myOnClickOnly = typeof options.requestOnlyOnClick !== "undefined" ? options.requestOnlyOnClick : true;
        this.myFeature = null;
        this.myFeatureLayer = null;
        this.myCallbacksToRemove = [];
        this.color = options.color ? options.color : defaultColor;
        this.targetIconOptions = {...targetIconOptionsDefault};
        this.featureIcon =  {...featureIconDefault};
        this.targetIconOptions.stroke = this.color;
        this.featureIcon.image = IconProvider.paintIconByName("target", this.targetIconOptions);

        this.myBalloonContentProvider = (feature: Feature) => {
            function onCopy() {
                SingleFeatureCopy(feature);
            }

            const html = document.createElement("div");
            const node = FeatureRenderer.createFeatureHtmlNode(feature);
            html.appendChild(node);
            const node2 = document.createElement("button");
            html.appendChild(node2);
            node2.id = "COPY-TO-CLIP"
            node2.innerHTML = "Copy Feature";
            node2.classList.add("riux-btn");
            node2.onclick = onCopy;
            return html;
        };

        const that = this;
        this.myMouseMoved = throttle((event: any) => {
            if (that.myBalloonShowing) {
                // don't request other feature info if the user clicked on a feature to show its properties
                // otherwise the balloon he is looking at will disappear.
                return;
            }
            that._requestFeatureInfo({
                ignoreResponseIfBalloonShowing: true,
                showBalloon: false,
                x: event.viewPosition[0],
                y: event.viewPosition[1],
            });
        }, 30);
    }

    public onActivate(map: Map) {
        this.myCallbacksToRemove.push(map.on("ShowBalloon", () => {
            this.myBalloonShowing = true;
        }, this));
        this.myCallbacksToRemove.push(map.on("HideBalloon", () => {
            this.myBalloonShowing = false;
        }, this));
        const self = this;
        this.myCallbacksToRemove.push(map.layerTree.on("NodeRemoved", (event) => {
            const removedLayer = event.node;
            if (self.myFeatureLayer === removedLayer) {
                self.myFeature = null;
                self.myFeatureLayer = null;
                if (typeof self.map.hideBalloon === "function") {
                    self.map.hideBalloon();
                }
                self.invalidate();
            }
        }));
        // eslint-disable-next-line prefer-rest-params
        Controller.prototype.onActivate.apply(this, arguments);
    }

    public onDeactivatefunction(map: Map) {
        for (const callback of this.myCallbacksToRemove.length) {
            callback.remove();
        }
        this.myCallbacksToRemove.length = 0;
        // eslint-disable-next-line prefer-rest-params
        Controller.prototype.onDeactivate.apply(this, arguments);
    }

    public onDraw(geoCanvas: GeoCanvas) {
        if (this.myFeature) {
            if (this.myFeature.shape.type === ShapeType.POINT) {
                geoCanvas.drawIcon(this.myFeature.shape, this.featureIcon);
            } else {
                geoCanvas.drawShape(this.myFeature.shape, {
                    stroke: {
                        // color: "rgb(255,0,0)",
                        // color: "#98DDDE",
                        color: this.color,
                        width: 2
                    }
                });
            }
        }
    }

    public onGestureEvent(gestureEvent: GestureEvent) {
        if (this.map) {
            if (gestureEvent.type === GestureEventType.SINGLE_CLICK_CONFIRMED) {
                this._mouseClicked(gestureEvent);
                /*
                const pickInfos = this.map.pickAt(gestureEvent.viewPoint.x, gestureEvent.viewPoint.y, 1, [PaintRepresentation.BODY]);
                if (pickInfos) {
                    this.map.selectObjects(pickInfos);
                    return HandleEventResult.EVENT_HANDLED
                }
                 */
            } else if (gestureEvent.type === GestureEventType.MOVE && !this.myOnClickOnly) {
                // On hover GetFeatureInfo request disabled by default for better performance. Perhaps make it optional in a future implementation via the UI.
                this.myMouseMoved(gestureEvent);
            }
        }
        return HandleEventResult.EVENT_IGNORED;
    }

    private _mouseClicked(event: GestureEvent) {
        // this.map.domNode.focus();
        this.map.hideBalloon();
        this._requestFeatureInfo({
            ignoreResponseIfBalloonShowing: false,
            showBalloon: true,
            x: event.viewPosition[0],
            y: event.viewPosition[1]
        });
        return true;
    }

    private _requestFeatureInfo(options: any) {
        const queryLayer = this._findFirstVisibleAndQueryableWMSLayer();
        if (queryLayer === null) {
            this.myFeature = null;
            // Prevents the feature to remain visible;
            this.invalidate();
            return;
        }
        const getFeatureInfoFormat = typeof queryLayer.model._getFeatureInfoFormat !== "undefined" ? queryLayer.model._getFeatureInfoFormat : "application/json";

        // At this moment only LuciadFusion application/json with GeoJSOn feature is supported for on hover feature paint
        if ((options.showBalloon === false && !(getFeatureInfoFormat === "application/json" || getFeatureInfoFormat === "text/xml"))) {
            this.myFeature = null;
            // Prevents the feature to remain visible;
            this.invalidate();
            return;
        }
        const x = options.x;
        const y = options.y;
        const showBalloon = options.showBalloon;
        const ignoreResponseIfBalloonShowing = options.ignoreResponseIfBalloonShowing;
        const self = this;
        if (this.myInfoPromise) {
            return; // skip: a previous request is still busy
        }
        // this.myInfoPromise = queryLayer.getFeatureInfo(x, y, {infoFormat:"text/xml"});
        this.myInfoPromise = queryLayer.getFeatureInfo(x, y, {infoFormat: getFeatureInfoFormat});
        if (this.myInfoPromise === null) {
            return;
        }
        let prevCursorValue: any;
        if (showBalloon) {
            prevCursorValue = this.map.domNode.style.cursor;
            this.map.domNode.style.cursor = "wait";
        }
        this.myInfoPromise.then((response: any) => {
            self.myInfoPromise = null;
            const contentType = response.getHeader("Content-Type");
            if (!contentType) {
                // if no content type then return.
                return;
            }
            if (ignoreResponseIfBalloonShowing && self.myBalloonShowing) {
                // if a user is already looking at the properties of a feature, keep his balloon on-screen
                return;
            }
            if (contentType.indexOf("application/json") > -1 || contentType.indexOf("text/xml") > -1) {
                // Handle GeoJson & GML responses.
                let decodedFeatures = null;
                const someShape = ShapeFactory.createPoint(null as any, [x, y]);
                const getfeatureInfoPosition = self.map.viewToMapTransformation.transform(someShape);
                try {
                    decodedFeatures = (contentType.indexOf("application/json") > -1) ? geoJsonCodec.decode({content: response.text}) : gmlCodec.decode({content: response.text});
                    self.myFeature = null;
                    if (decodedFeatures.hasNext()) {
                        const decodedFeature = decodedFeatures.next();
                        self.myFeature = decodedFeature;
                        self.myFeatureLayer = queryLayer;
                        if (showBalloon) {
                            // show balloon at the location of the GetFeatureInfo request
                            self.map.showBalloon({
                                contentProvider: () => {
                                    return self.myBalloonContentProvider(decodedFeature)
                                },
                                object: getfeatureInfoPosition,
                                panTo: false
                            });
                        }
                    } else {
                        if (showBalloon) {
                            if (response.text.indexOf("<RasterLayerInfoResponse")>-1) {
                            self.map.showBalloon({
                                contentProvider: () => {
                                    return "<p>== GetFeatureInfo: Invalid \"text/xml\" response ==</p><p>To overcome compatibility issues use format: \"text/plain\"</p>"
                                },
                                object: self.map.viewToMapTransformation.transform(someShape),
                                panTo: false
                            });
                            }
                        }
                    }
                } catch (e) {
                    if (showBalloon) {
                        self.map.showBalloon({
                            contentProvider: () => {
                                return "Failed to decode GetFeatureInfo response"
                            },
                            object: self.map.viewToMapTransformation.transform(someShape),
                            panTo: false
                        });
                    }
                }
                if (showBalloon) {
                    self.map.domNode.style.cursor = prevCursorValue;
                }
                self.invalidate();
                return;
            }
            if (contentType.indexOf("text/plain") > -1 || contentType.indexOf("application/vnd.google-earth.kml+xml") > -1) {
                // Handle text.
                if (showBalloon) {
                    // show balloon at the location of the GetFeatureInfo request
                    const someShape = ShapeFactory.createPoint(null as any, [x, y]);
                    const getfeatureInfoPosition = self.map.viewToMapTransformation.transform(someShape);
                    self.map.showBalloon({
                        contentProvider: () => {
                            const lines = response.text.split("\n").map((line: string) => "<p>" + line + "</p>");
                            const body = lines.join("");
                            const html = "<div class=\"balloon-text\">" + body + "</div>";
                            return html;
                        },
                        object: getfeatureInfoPosition,
                        panTo: false
                    });
                }
                if (showBalloon) {
                    self.map.domNode.style.cursor = prevCursorValue;
                }
                self.invalidate();
                return;
            }
        }, (error: any) => {
            if (showBalloon) {
                self.map.domNode.style.cursor = prevCursorValue;
            }
            const wmsModel = queryLayer.model;
            const queryLayers = "" + wmsModel.queryLayers;

            // tslint:disable-next-line:no-console
            console.log("GetFeatureInfo" + queryLayers,
                "Error while requesting feature information for layer '" + wmsModel.queryLayers + "'<br/>" +
                "Make sure:" +
                "<ul>" +
                "  <li>These WMS layers are queryable. You can look in the WMS capabilities to determine this.</li>" +
                "  <li>The WMS server supports the \"application/json\" format for feature information.</li>" +
                "  <li>the WMS server support Cross-Origin Resource Sharing (CORS)</li>" +
                "</ul>");
        });
    }

    private _findFirstVisibleAndQueryableWMSLayer() {
        const findQueryableLayerVisitor = {
            foundLayer: null as any,
            visitLayer: (layer: any) => {
                if (!layer.visible) {
                    return LayerTreeVisitor.ReturnValue.CONTINUE;
                }
                if (typeof layer.queryable !== "undefined" && layer.queryable && layer.queryActive) {
                    findQueryableLayerVisitor.foundLayer = layer;
                    return LayerTreeVisitor.ReturnValue.ABORT;
                }
                return LayerTreeVisitor.ReturnValue.CONTINUE;
            },
            visitLayerGroup: (layerGroup: any) => {
                layerGroup.visitChildren(findQueryableLayerVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
                if (findQueryableLayerVisitor.foundLayer !== null) {
                    return LayerTreeVisitor.ReturnValue.ABORT;
                } else {
                    return LayerTreeVisitor.ReturnValue.CONTINUE;
                }
            }
        };
        this.map.layerTree.visitChildren(findQueryableLayerVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
        return findQueryableLayerVisitor.foundLayer;
    }

}


export default GetFeatureInfoController;
