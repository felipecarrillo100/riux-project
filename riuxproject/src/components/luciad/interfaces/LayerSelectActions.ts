
export enum LayerSelectActions {
  ALL = 'select-all',
  SELECTTOOL = 'select-tool',
  NONE = 'select-none'
}


interface LayerSelectOptions {
  selectType: LayerSelectActions | string ;
}

export const setLayerSelectParameters = (options: LayerSelectOptions) => {
  return options;
}
