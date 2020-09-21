import { InterfaceActionUnion } from './makeAction';
import { luciadmapActions } from './luciadmap/actions';
import {commandActions} from "./command/actions";
import { contextMenuActions } from './contextMenu/actions';
import {windowsActions} from "./windowManager/actions";

export const CombinedActions = {
  ...luciadmapActions,
  ...commandActions,
  ...contextMenuActions,
  ...windowsActions,
};

export type Actions = InterfaceActionUnion<typeof CombinedActions>;
