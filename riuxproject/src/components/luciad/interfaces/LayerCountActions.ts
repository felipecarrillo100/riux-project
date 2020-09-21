
export enum LayerCountActions {
  ALL = 'count-all',
  SELECTED = 'count-selected',
}

interface LayerCountOptions {
  countType: LayerCountActions | string ;
}

export const setLayerCountParameters = (options: LayerCountOptions) => {
  return options;
}
