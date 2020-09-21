import { makeAction } from '../makeAction';
import { AppEvents } from '../events';
import GlobalContextMenu from "../../components/customcontextmenu/GlobalContextMenu";

export const setContextMenu = makeAction<
  AppEvents.SET_CONTEXTMENU,
    GlobalContextMenu
>(AppEvents.SET_CONTEXTMENU);

export const contextMenuActions = {
  setContextMenu,
};
