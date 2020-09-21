import {BasicFormRecords} from "../../forms/BasicForms";

export enum WindowManagerActions {
  CREATEWINDOW = 'add-new-window',
  DESTROYWINDOWBYID = 'destroy-window-by-id',
  WINDOWTOTOPBYID = 'window-to-top-by-id',
}

interface WINDOWMANAGEROptions {
  actionType: WindowManagerActions | string ;
  id: string;
  toggle?:  boolean;
  formName?: string;
  form?: any;
  top?: number | string;
  left?: number | string;
  bottom?: number | string;
  right?: number | string;
}

export const setWINDOWMANAGERParameters = (options: WINDOWMANAGEROptions) => {
  return options;
}
