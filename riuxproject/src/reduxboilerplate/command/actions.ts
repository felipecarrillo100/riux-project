import { makeAction } from '../makeAction';
import { AppEvents } from '../events';
import { Command } from './reducer';

export const SendCommand = makeAction<AppEvents.COMMAND_SEND, Command>(
  AppEvents.COMMAND_SEND
);

export const CompleteCommand = makeAction<AppEvents.COMMAND_COMPLETE, void>(
  AppEvents.COMMAND_COMPLETE
);

export const CancelCommand = makeAction<AppEvents.COMMAND_CANCEL, void>(
  AppEvents.COMMAND_CANCEL
);

export const commandActions = {
  SendCommand,
  CompleteCommand,
  CancelCommand,
};
