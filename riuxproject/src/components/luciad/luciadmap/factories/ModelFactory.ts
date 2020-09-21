import { LonLatPointFormat } from '@luciad/ria/shape/format/LonLatPointFormat';
import { LonLatGrid } from '@luciad/ria/view/grid/LonLatGrid';
import { UrlStore } from '@luciad/ria/model/store/UrlStore';
import { GeoJsonCodec } from '@luciad/ria/model/codec/GeoJsonCodec';
import { FeatureModel } from '@luciad/ria/model/feature/FeatureModel';
import { Codec } from '@luciad/ria/model/codec/Codec';
import { CoordinateReference } from '@luciad/ria/reference/CoordinateReference';
import { getReference } from '@luciad/ria/reference/ReferenceProvider';
import { MemoryStore } from '@luciad/ria/model/store/MemoryStore';
import { BingMapsTileSetModel } from '@luciad/ria/model/tileset/BingMapsTileSetModel';
import { Cursor } from '@luciad/ria/model/Cursor';
import { WFSFeatureStore } from '@luciad/ria/model/store/WFSFeatureStore';
import {CodecProvider, CodecProviderContenTypes} from '../codecs/CodecProvider';
import { WMSTileSetModel } from '@luciad/ria/model/tileset/WMSTileSetModel';
import { UrlTileSetModel } from '@luciad/ria/model/tileset/UrlTileSetModel';
import { createBounds } from '@luciad/ria/shape/ShapeFactory';
import { FusionTileSetModel } from '@luciad/ria/model/tileset/FusionTileSetModel';
import { GMLCodec } from '@luciad/ria/model/codec/GMLCodec';

const ProjectionsToSwapList = ['EPSG:4269', 'EPSG:4326'];
const HEROKU_PROXY = 'https://cors-anywhere.herokuapp.com/';

function needtoSwap(reference: CoordinateReference) {
  if (
    reference.identifier.endsWith(':CRS84') ||
    reference.identifier.endsWith('CRS:84')
  ) {
    return false;
  }
  for (const projection of ProjectionsToSwapList) {
    const reference_i = getReference(projection);
    if (reference.equals(reference_i)) {
      return true;
    }
  }
  return false;
}

function getAPIBingMapsService() {
  return '';
}

const DefaultGridSettings = {
  settings: [
    { scale: 40000.0e-9, deltaLon: 1 / 60, deltaLat: 1 / 60 },
    { scale: 20000.0e-9, deltaLon: 1 / 30, deltaLat: 1 / 30 },
    { scale: 10000.0e-9, deltaLon: 1 / 10, deltaLat: 1 / 10 },
    { scale: 5000.0e-9, deltaLon: 1 / 2, deltaLat: 1 / 2 },
    { scale: 1000.0e-9, deltaLon: 1, deltaLat: 1 },
    { scale: 200.0e-9, deltaLon: 5, deltaLat: 5 },
    { scale: 20.0e-9, deltaLon: 10, deltaLat: 10 },
    { scale: 9.0e-9, deltaLon: 20, deltaLat: 20 },
    { scale: 5.0e-9, deltaLon: 30, deltaLat: 30 },
    { scale: 0, deltaLon: 45, deltaLat: 45 },
  ],
  options: undefined as any,
  fallbackStyle: {
    labelFormat: new LonLatPointFormat({ pattern: 'lat(+DM),lon(+DM)' }),
    labelStyle: {
      fill: 'rgb(220,220,220)',
      font: '12px sans-serif',
      halo: 'rgb(102,102,102)',
      haloWidth: 3,
    },
    lineStyle: {
      color: 'rgba(210,210,210,0.6)',
      width: 1,
    },
    originLabelFormat: new LonLatPointFormat({ pattern: 'lat(+D),lon(+D)' }),
    originLabelStyle: {
      fill: 'rgba(210,210,210,0.8)',
      font: '12px sans-serif',
      halo: 'rgba(230, 20, 20, 0.8)',
      haloWidth: 3,
    },
    originLineStyle: {
      color: 'rgba(230, 20, 20, 0.6)',
      width: 2,
    },
  },
};

export const BingMapsImagerySet = {
  AERIAL: 'Aerial',
  ROAD: 'Road',
  HYBRID: 'AerialWithLabels',
  LIGHT: 'CanvasLight',
  DARK: 'CanvasDark',
  GRAY: 'CanvasGray',
};

class ModelFactory {

  public static createGridModel(options?: any) {
    return new Promise<LonLatGrid>((resolve, reject) => {
      let modelOptions;
      if (typeof options === "undefined") {
        modelOptions = {
          settings: DefaultGridSettings.settings,
          options: DefaultGridSettings.options,
          fallbackStyle: DefaultGridSettings.fallbackStyle,
        };
      } else {
        modelOptions  = {
          ...options,
        };
      }
      const model = new LonLatGrid(modelOptions.settings, modelOptions.options);
      if (model) {
        model.fallbackStyle = modelOptions.fallbackStyle;
        resolve(model);
      } else {
        reject();
      }
    });
  }

  public static createWFSModel(options: any) {
    return new Promise<FeatureModel>((resolve) => {
      const newOptions = {
        ...options,
      };
      const Codec = CodecProvider.getCodecByContentType(options.outputFormat);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      newOptions.codec = new Codec({});
      newOptions.reference = getReference(options.tmp_reference);
      const store = new WFSFeatureStore(newOptions);
      const model = new FeatureModel(store, {
        reference: newOptions.reference,
      });
      resolve(model);
    });
  }

  public static createJsonUrlModel(url: string) {
    const store = new UrlStore({
      target: url,
      codec: new GeoJsonCodec({}),
    });
    const model = new FeatureModel(store);
    return model;
  }

  static createJsonModelFromString(content: string) {
    return ModelFactory.createModelFromData({content, contentType: CodecProviderContenTypes.GeoJSON});
  }

  static createGMLModelFromString(content: string) {
    return ModelFactory.createModelFromData({content, contentType: CodecProviderContenTypes.GML});
  }

  static createModelFromData( options: any) {
    return new Promise<FeatureModel>(resolve => {
      options = options ? options : {};
      const features = options.features ? {data: options.features } : undefined;
      const store = new MemoryStore(features);
      options.contentType = options.contentType ? options.contentType :  CodecProviderContenTypes.GeoJSON;
      if (options.contentType && options.content) {
        const Codec = CodecProvider.getCodecByContentType(options.contentType) as any;
        if (Codec && options.content) {
          const codec = new Codec({});
          const cursor = codec.decode({ content: options.content, contentType: options.contentType });
          while (cursor.hasNext()) {
            const feature = cursor.next();
            if (feature.shape) store.add(feature);
          }
        }
      }
      const model = new FeatureModel(store);
      resolve(model);
    })
  }

  private static AnaliseFeatures(cursor: Cursor) {
    const referencesList = {} as any;
    const featureTypesList = {} as any;
    let featureCounter = 0;
    while (cursor.hasNext()) {
      featureCounter++;
      const feature = cursor.next();
      const featureProperties = feature.properties as any;
      if (typeof featureProperties[0] !== 'undefined') {
        const featureType = featureProperties[0]._aixmType as string;
        if (typeof featureTypesList[featureType] !== 'undefined')
          featureTypesList[featureType]++;
        else featureTypesList[featureType] = 1;
      }
      if (feature.shape && feature.shape.reference) {
        const referenceName = feature.shape.reference.identifier;
        if (typeof referencesList[referenceName] !== 'undefined')
          referencesList[referenceName]++;
        else referencesList[referenceName] = 1;
      }
    }
    const keys = Object.keys(referencesList);
    console.log('****************************** Analysing file ***********');
    console.log('Features found: ' + featureCounter);
    console.log('References found: ' + keys.length);
    for (const key of keys) {
      console.log(
        'Reference ' +
          key +
          ' was found in ' +
          referencesList[key] +
          ' features'
      );
    }
    const featureTypes = Object.keys(featureTypesList);
    for (const featureType of featureTypes) {
      console.log(
        'Feature type: ' +
          featureType +
          ' was found in ' +
          featureTypesList[featureType] +
          ' features'
      );
    }
    return keys;
  }

  public static createWMSModel(options: any) {
    return new Promise<WMSTileSetModel>((resolve) => {
      const bounds = options.bounds;
      const newOptions = {
        ...options,
      };
      if (newOptions.queryable) {
        newOptions.queryLayers = newOptions.layers;
      }
      const reference = getReference(newOptions.reference);
      if (bounds) {
        const boundsRef = getReference(bounds.reference);
        newOptions.bounds = createBounds(boundsRef, bounds.coordinates);
      }
      newOptions.reference = reference;
      const model = new WMSTileSetModel(newOptions);
      (model as any)._getFeatureInfoFormat = newOptions.getFeatureInfoFormat;
      resolve(model);
    });
  }

  public static createLTSModel(options: any) {
    return new Promise<FusionTileSetModel>((resolve) => {
      const bounds = options.bounds;
      const newOptions = {
        ...options,
      };
      const reference = getReference(bounds.reference);
      newOptions.bounds = createBounds(reference, bounds.coordinates);
      newOptions.reference = reference;
      const model = new FusionTileSetModel(newOptions);
      resolve(model);
    });
  }

  public static createTMSModel(options: any) {
    return new Promise<UrlTileSetModel>((resolve) => {
      const REF_WEBMERCATOR = getReference('EPSG:3857');
      options.reference = options.reference
        ? options.reference
        : REF_WEBMERCATOR;
      options.bounds = options.bounds
        ? options.bounds
        : createBounds(REF_WEBMERCATOR, [
            -20037508.34278924,
            40075016.68557848,
            -20037508.352,
            40075016.704,
          ]);
      const model = new UrlTileSetModel(options);
      resolve(model);
    });
  }

  public static createBingmapsModel(options?: {
    imagerySet: string;
    token: string;
    useproxy?: boolean;
  }) {
    return new Promise<BingMapsTileSetModel>((resolve, reject) => {
      if (typeof options === 'undefined') {
        options = {
          imagerySet: '',
          token: '',
        };
      }
      let template =
        'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/%MAPID%?key=%TOKEN%&include=ImageryProviders';
      if (options.useproxy) {
        const proxyURL = getAPIBingMapsService();
        template = proxyURL + '/%MAPID%';
      }
      let requestStr = template.replace('%MAPID%', options.imagerySet);
      requestStr = requestStr.replace('%TOKEN%', options.token);

      ModelFactory.GET_JSON(requestStr, options.useproxy).then(
        (response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              let resource;
              if (data.resourceSets[0] && data.resourceSets[0].resources[0]) {
                resource = data.resourceSets[0].resources[0];
                // Serve tiles over https://
                if (resource.imageUrl.indexOf('http://ecn.') > -1) {
                  resource.imageUrl = resource.imageUrl.replace(
                    'http:',
                    'https:'
                  );
                }
                if (resource.imageUrl.indexOf('http://ak.dynamic.') > -1) {
                  resource.imageUrl = resource.imageUrl.replace(
                    '{subdomain}.',
                    ''
                  );
                  resource.imageUrl = resource.imageUrl.replace(
                    'http://',
                    'https://{subdomain}.ssl.'
                  );
                }
                resource.brandLogoUri = data.brandLogoUri;
              } else {
                resource = data;
              }
              const model = new BingMapsTileSetModel(resource);
              resolve(model);
            });
          } else {
            reject();
          }
        },
        () => {
          reject();
        }
      );
    });
  }

  public static fetchBingParameters = {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
  } as any;

  private static GET_JSON(url: string, useproxy?: boolean) {
    if (useproxy) {
      return fetch(url, ModelFactory.fetchBingParameters);
    } else {
      return fetch(url);
    }
  }
}

export default ModelFactory;
