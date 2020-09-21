export enum LayerMeasureActions {
  RULER2D = 'ruler-2d',
  RULER3D = 'ruler-3d',
}

interface LayerMeasureOptions {
  measureType: LayerMeasureActions | string ;
}

export const setLayerMeasureParameters = (options: LayerMeasureOptions) => {
  return options;
}
