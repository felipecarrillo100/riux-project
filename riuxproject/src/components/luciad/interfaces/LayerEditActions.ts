export enum LayerEditActions {
  PASTE = 'paste-to-layer',
  POINT = 'create-point',
  LINE = 'create-line',
  POLYGON = 'create-polygon',
  BOUNDS = 'create-bounds',
  CIRCLE = 'create-circle',
}

interface LayerEditOptions {
  editType: LayerEditActions | string ;
}

export const setLayerEditParameters = (options: LayerEditOptions) => {
  return options;
}
