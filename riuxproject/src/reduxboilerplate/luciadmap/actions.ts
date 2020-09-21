import { makeAction } from '../makeAction';
import { AppEvents } from '../events';
import { Map } from '@luciad/ria/view/Map';
import {Ruler2DUpdateValues} from "../../components/luciad/luciadmap/controllers/measurementcontrollers/Ruler2DController/RulerController";
import {Ruler3DUpdateValues} from "../../components/luciad/luciadmap/controllers/measurementcontrollers/Ruler3DController/Ruler3DController";

export const SetLuciadMap = makeAction<AppEvents.SET_LUCIADMAP, Map | null>(
  AppEvents.SET_LUCIADMAP
);

export const SetMapProjection = makeAction<AppEvents.SET_MAP_PROJECTION, string | null>(
    AppEvents.SET_MAP_PROJECTION
);

export const SetFavorite2dProjection = makeAction<AppEvents.SET_MAP_FAVORITE_2D_PROJECTION, string | null>(
    AppEvents.SET_MAP_FAVORITE_2D_PROJECTION
);

export const SetCurrentLayer = makeAction<AppEvents.SET_CURRENT_LAYER, string | undefined | null>(
  AppEvents.SET_CURRENT_LAYER
);

export const SetRuler2D = makeAction<AppEvents.SET_RULER_2D, Ruler2DUpdateValues | undefined>(
    AppEvents.SET_RULER_2D
);

export const SetRuler3D = makeAction<AppEvents.SET_RULER_3D, Ruler3DUpdateValues | undefined>(
    AppEvents.SET_RULER_3D
);

export const luciadmapActions = {
  SetLuciadMap,
  SetMapProjection,
  SetFavorite2dProjection,
  SetCurrentLayer,
  SetRuler2D,
  SetRuler3D
};
