import { AppEvents } from '../events';
import { Actions } from '../actions';
import GlobalContextMenu from "../../components/customcontextmenu/GlobalContextMenu";

export interface ContextMenuReduxState {
  contextMenu: GlobalContextMenu | null;
}

const initState: ContextMenuReduxState = {
  contextMenu: null,
};

export const contextMenuReducer = (
  state: ContextMenuReduxState = initState,
  action: Actions
): ContextMenuReduxState => {
  switch (action.type) {
    case AppEvents.SET_CONTEXTMENU:
      return {
        ...state,
        contextMenu: action.payload,
      };
    default:
      return state;
  }
};
