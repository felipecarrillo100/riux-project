import { applyMiddleware, combineReducers, createStore } from 'redux';

import thunk from 'redux-thunk';
import { mapReducer } from "./luciadmap/reducer";
import {commandReducer} from "./command/reducer";
import {contextMenuReducer} from "./contextMenu/reducer";
import {windowsManagerReducer} from "./windowManager/reducer";

export const CombinedReducers = {
    map: mapReducer,
    command: commandReducer,
    contextMenu: contextMenuReducer,
    windowsManager: windowsManagerReducer,
};

const reducers = combineReducers(CombinedReducers);

export type IAppState = ReturnType<typeof reducers>;
export const store = createStore(reducers, applyMiddleware(thunk));
