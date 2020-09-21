import { AppEvents } from '../events';
import { Actions } from '../actions';

export interface Command {
  uid: string | null;
  action: string;
  parameters: any;
}

export function onCommandReceived(
  prevProps: any,
  props: any,
  acceptCommands?: string[],
  stopPropagationOnHandled?: boolean
) {
  return new Promise<Command>((resolve) => {
    const isCommand = !!props.command;
    if (!isCommand) return;
    const found = typeof acceptCommands !== "undefined" && acceptCommands.length>0 ? acceptCommands.indexOf(props.command.action) > -1 : false;
    if (prevProps.command !== props.command && props.command !== null) {
      if (typeof props.handleCommand === 'function' && found) {
        if (typeof stopPropagationOnHandled !== "undefined" ? stopPropagationOnHandled : false) props.handleCommand();
        resolve(props.command);
      }
    }
  });
}

let uid = 0;
export function genereteUniqueID() {
  return 'uid_' + uid++;
}

export interface CommandReduxState {
  command: Command | null;
  abort: boolean;
  handled: boolean;
}

const initState: CommandReduxState = {
  handled: false,
  abort: false,
  command: null,
};

export const commandReducer = (
  state: CommandReduxState = initState,
  action: Actions
): CommandReduxState => {
  switch (action.type) {
    case AppEvents.COMMAND_SEND:
      return {
        ...state,
        handled: false,
        command: action.payload,
        abort: false,
      };
    case AppEvents.COMMAND_COMPLETE:
      return { ...state, handled: true, command: null };
    case AppEvents.COMMAND_CANCEL:
      if (state.handled === true) {
        console.log('command was handled');
        return {
          ...state,
          handled: true,
          command: null,
          abort: false,
        };
      } else {
        console.log('command was NOT handled');
        return {
          ...state,
          handled: false,
          command: null,
          abort: true,
        };
      }
    default:
      return state;
  }
};
