import { GridLayer } from '@luciad/ria/view/grid/GridLayer';
import { FeatureLayer } from '@luciad/ria/view/feature/FeatureLayer';
import { FeatureModel } from '@luciad/ria/model/feature/FeatureModel';
import { UrlTileSetModel } from '@luciad/ria/model/tileset/UrlTileSetModel';
import { RasterTileSetLayer } from '@luciad/ria/view/tileset/RasterTileSetLayer';
import { LayerType } from '@luciad/ria/view/LayerType';
import { LoadSpatially } from '@luciad/ria/view/feature/loadingstrategy/LoadSpatially';
import WFSQueryProvider from './queryproviders/WFSQueryProvider';
import WFS3QueryProvider from './queryproviders/WFS3QueryProvider';
import { WMSTileSetModel } from '@luciad/ria/model/tileset/WMSTileSetModel';
import { WMSTileSetLayer } from '@luciad/ria/view/tileset/WMSTileSetLayer';
import { LayerGroup } from '@luciad/ria/view/LayerGroup';
import SimpleFeaturePainter from "../painters/SimpleFeaturePainter";
import {LonLatGrid} from "@luciad/ria/view/grid/LonLatGrid";
import {ReservedLayerID} from "../../interfaces/ReservedLayerID";

export enum LoadinStategiesEnum {
  SPATIALLY = 'LoadSpatially',
  ALL = 'LoadEverything',
}

class LayerFactory {
  public static createGridLayer(model: LonLatGrid, options: any) {
    const layerOptions = {...options};
    layerOptions.id = layerOptions.id ? layerOptions.id : ReservedLayerID.GRID;
    const layer = new GridLayer(model, layerOptions);
    return layer;
  }

  public static createLayerGroup(options: any) {
    const layerGroup = new LayerGroup(options);
    (layerGroup as any).collapsed = options.collapsed
    return layerGroup;
  }

  public static createFeatureLayer(model: FeatureModel, options: any) {
    const layer = new FeatureLayer(model, options);
    if (typeof options.painter === 'undefined') {
      const painter = new SimpleFeaturePainter();
      // const painter = new TrajectoryAsTrackPainter();
      painter.assigPainterToLayer(layer);
    }
    return layer;
  }

  public static createWFSLayer(model: FeatureModel, options: any) {
    options.layerType = options.layerType
      ? options.layerType
      : LayerType.DYNAMIC;
    const wfsQueryProvider = new WFSQueryProvider({
      maxFeatures: options.maxFeatures,
    });
    options.loadingStrategy =
      options.loadingStrategy === LoadinStategiesEnum.SPATIALLY
        ? new LoadSpatially({ queryProvider: wfsQueryProvider })
        : undefined;

    const layer = new FeatureLayer(model, options);
    if (typeof options.painter === 'undefined') {
      const store = model.store as any;
      const painter = new SimpleFeaturePainter();
      painter.assigPainterToLayer(layer);
    }
    return layer;
  }

  public static createRasterLayer(model: UrlTileSetModel, options: any) {
    return new RasterTileSetLayer(model, options);
  }

  public static createWMSLayer(model: WMSTileSetModel, options: any) {
    const layer = new WMSTileSetLayer(model, options);
    const queryActive = model.queryable;
    (layer as any).queryActive = queryActive && (typeof options.queryActive !== "undefined" ? options.queryActive : true);
    return layer;
  }
}

export default LayerFactory;
