import { AppEvents } from '../events';
import { Actions } from '../actions';
import { Map } from '@luciad/ria/view/Map';
import {Ruler2DUpdateValues} from "../../components/luciad/luciadmap/controllers/measurementcontrollers/Ruler2DController/RulerController";
import {Ruler3DUpdateValues} from "../../components/luciad/luciadmap/controllers/measurementcontrollers/Ruler3DController/Ruler3DController";

export interface MapReduxState {
  map: Map | null;
  mapProjection: string | undefined;
  favorite2dProjection: string | undefined;
  ruler2d: Ruler2DUpdateValues | undefined;
  ruler3d: Ruler3DUpdateValues | undefined;
  currentLayer: string | undefined | null;
}

const initState: MapReduxState = {
  map: null,
  mapProjection: undefined,
  favorite2dProjection: "EPSG:3857",
  currentLayer: undefined,
  ruler2d: undefined,
  ruler3d: undefined
};

export const mapReducer = (
  state: MapReduxState = initState,
  action: Actions
): MapReduxState => {
  switch (action.type) {
    case AppEvents.SET_LUCIADMAP:
      return { ...state, map: action.payload };
    case AppEvents.SET_MAP_PROJECTION:
      return { ...state, mapProjection: action.payload };
    case AppEvents.SET_MAP_FAVORITE_2D_PROJECTION:
      return { ...state, favorite2dProjection: action.payload };
    case AppEvents.SET_CURRENT_LAYER:
      return { ...state, currentLayer: action.payload };
    case AppEvents.SET_RULER_2D:
      return { ...state, ruler2d: action.payload };
    case AppEvents.SET_RULER_3D:
      return { ...state, ruler3d: action.payload };
    default:
      return state;
  }
};
