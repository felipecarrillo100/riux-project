import { AppEvents } from '../events';
import { Actions } from '../actions';

export interface WindowElement {
  id: string;
  window: JSX.Element | null | undefined;
  autoPos: boolean;
  ref: any;
}

export function findWindowIndexByID(windows: WindowElement[], id: string) {
  return windows.findIndex((window) => window.id === id);
}

export function isWindowPresent(windows: WindowElement[], id: string) {
  const index = findWindowIndexByID(windows, id);
  return index > -1;
}

export interface WindowsReduxState {
  windows: WindowElement[];
  topWindow: string | null;
}

const initState: WindowsReduxState = {
  windows: [],
  topWindow: null
};

export const windowsManagerReducer = (
  state: WindowsReduxState = initState,
  action: Actions
): WindowsReduxState => {
  switch (action.type) {
    case AppEvents.SET_WINDOWS:
      return {
        ...state,
        windows: action.payload,
      };
    case AppEvents.SET_TOP_WINDOW:
      return {
        ...state,
        topWindow: action.payload,
      };
    default:
      return state;
  }
};
