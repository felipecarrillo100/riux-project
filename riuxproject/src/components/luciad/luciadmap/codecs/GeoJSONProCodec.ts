import { GeoJsonCodec } from "@luciad/ria/model/codec/GeoJsonCodec";
import { ShapeType } from "@luciad/ria/shape/ShapeType";

class GeoJSONProCodec extends GeoJsonCodec{
    private as2DCodec: GeoJsonCodec;
    constructor(options: any) {
        let auto3D = false;
        options = options? options : {};
        if (typeof options.auto3D!== "undefined") {
            auto3D = options.auto3D;
        }
        if (auto3D) {
            options.mode3D =  true;
        }
        super(options);
        if (auto3D) {
            const options2d = JSON.parse(JSON.stringify(options));
            options2d.mode3D = false;
            this.as2DCodec = new GeoJsonCodec(options2d);
        }
    }

    public encode(featureCursor: any){
        if (this.as2DCodec) {
            const json = { "type": "FeatureCollection", "features": [] as any};
            while (featureCursor.hasNext()) {
                const feature = featureCursor.next();
                const geometry = this.encodeShape(feature.shape);
                const jsonFeature = { type:"Feature", id: feature.id, properties: feature.properties, geometry};
                json.features.push(jsonFeature);
            }
            return {
                content : JSON.stringify(json),
                contentType : "application/json"
            }
        } else {
            return super.encode(featureCursor)
        }
    }

    public encodeShape(shape: any){
        const supera = GeoJsonCodec.prototype as any;
        const args = [shape];
        if (this.as2DCodec) {
            const as2DCodec  = this.as2DCodec as any;
            if (shape.type === ShapeType.POINT) {
                if (shape.coordinates.length === 2) {
                    return as2DCodec .encodeShape(shape);
                }
            }
            return supera.encodeShape.apply(this, args);
        } else {

            return supera.encodeShape.apply(this, args);
        }
    }

}

export default GeoJSONProCodec;
