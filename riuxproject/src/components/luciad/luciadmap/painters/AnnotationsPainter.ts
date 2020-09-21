import SimpleFeaturePainter from "./SimpleFeaturePainter";
import {IconProviderShapes} from "../../utils/iconimagefactory/IconProvider";
import {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {PaintState} from "@luciad/ria/view/feature/FeaturePainter";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {Shape} from "@luciad/ria/shape/Shape";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {Map} from "@luciad/ria/view/Map";

import JSONTools from "../../utils/jsontools/JSONTools";

interface JSONLike {
    [key: string]: any
}

class AnnotationsPainter extends SimpleFeaturePainter {
    public static defaultSettings() {
        const defaults = SimpleFeaturePainter.defaultSettings();
        defaults.painterType = "AnnotationsPainter";

        const strokeNormal = "rgba(70,150,255, 1)";
        const strokeSelected = "rgb(113,212,255)";

        const fillNormal = "rgba(44,168,234,0.75)";
        const fillSelected = "rgba(46,183,255,0.75)";

        /*
            const strokeNormal = variables.brand_primary_light;
            const strokeSelected = variables.brand_primary_light;

            const fillNormal = variables.brand_primary_dark_transparent;
            const fillSelected = variables.brand_primary_light_transparent;
        */
        // Polygons
        defaults.default.shapeStyle.fill.color = fillNormal;
        defaults.default.shapeStyle.stroke.color = strokeNormal;
        defaults.default.shapeStyle.stroke.dashIndex = "solid";
        defaults.default.shapeStyle.stroke.width = 2;
        defaults.selected.shapeStyle.fill.color = fillSelected;
        defaults.selected.shapeStyle.stroke.color = strokeSelected
        defaults.selected.shapeStyle.stroke.dashIndex = "solid";
        defaults.selected.shapeStyle.stroke.width = 3;

        // Lines
        defaults.default.lineStyle.stroke.color = strokeNormal;
        defaults.default.lineStyle.stroke.dashIndex = "solid";
        defaults.default.lineStyle.stroke.width = 2;
        defaults.selected.lineStyle.stroke.color = strokeSelected;
        defaults.selected.lineStyle.stroke.dashIndex = "solid";
        defaults.selected.lineStyle.stroke.width = 3;

        // Points
        defaults.default.pointStyle.fill.color = fillNormal;
        defaults.default.pointStyle.stroke.color = strokeNormal;
        defaults.default.pointStyle.shape = IconProviderShapes.POI;
        defaults.default.pointStyle.draped = false;
        defaults.default.pointStyle.size = {height: 25,width: 15};
        defaults.default.pointStyle.anchorY = "100%"; // defaults.default.pointStyle.size.height;

        defaults.selected.pointStyle.fill.color = fillSelected;
        defaults.selected.pointStyle.stroke.color = strokeSelected;
        defaults.selected.pointStyle.shape = IconProviderShapes.POI;
        defaults.selected.pointStyle.draped = false;
        defaults.selected.pointStyle.size = {height: 30, width: 18};
        defaults.selected.pointStyle.anchorY ="100%"; // defaults.selected.pointStyle.size.height;

        defaults.default.labelStyle.stroke.color = "rgb(5,100,255)";
        defaults.selected.labelStyle.stroke.color = "rgb(69,156,255)";

        defaults.default.labelStyle.labelProperty = "name";
        defaults.selected.labelStyle.labelProperty = "name";

        return defaults;
    }

    paintBody(geocanvas: GeoCanvas, feature: Feature, shape: Shape, layer: FeatureLayer, map: Map, paintState: PaintState) {
        const properties: JSONLike = feature.properties as JSONLike;
        if (typeof properties.icon !== "undefined" && properties.icon.length>0) {
            let style;
            if (paintState.selected) {
                style = this.style.selected
            } else {
                style = this.style.default
            }
            if (shape.type === ShapeType.POINT) {
                let heading;
                let scale = 1;
                if (style.pointStyle.heading.property && style.pointStyle.heading.property !== "" ) {
                    heading = JSONTools.getValue(feature.properties, style.pointStyle.heading.property);
                    scale = style.pointStyle.heading.scale;
                    if (heading) {
                        heading = heading * scale;
                    } else {
                        if (style.pointStyle.heading.default!=="") {
                            heading = Number(style.pointStyle.heading.default);
                        }
                    }
                } else {
                    if (style.pointStyle.heading.default!=="") {
                        heading = Number(style.pointStyle.heading.default);
                    }
                }
                geocanvas.drawIcon(shape, this.customizePointStyle(style.pointStyle, { url: properties.icon, width: style.pointStyle.size.width, height:style.pointStyle.size.height}, heading));
                return;
            }
        }
        super.paintBody(geocanvas, feature, shape, layer, map, paintState);
    }

}

export default AnnotationsPainter;
