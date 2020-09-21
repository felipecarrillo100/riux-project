import { makeAction } from '../makeAction';
import { AppEvents } from '../events';
import { WindowElement } from './reducer';

export const setWindows = makeAction<AppEvents.SET_WINDOWS, WindowElement[]>(
  AppEvents.SET_WINDOWS
);

export const setTopWindow = makeAction<AppEvents.SET_TOP_WINDOW, string | null>(
    AppEvents.SET_TOP_WINDOW
);

export const windowsActions = {
  setWindows,
  setTopWindow
};
