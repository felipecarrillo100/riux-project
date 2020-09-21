import { toast, ToastContainer } from 'react-toastify';
import LoggerItemCompatible from './LoggerItemCompatible';

import "./ScreenMessage.scss";

export const ScreenMessageContainer = ToastContainer;

const maxQueueSize = 100;

export enum ScreenMessageTypes {
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
}

interface ScreenMessageMessageOptions {
  silent: boolean;
}

export interface ScreenMessageObject {
  message: string;
  type: ScreenMessageTypes;
  silent: boolean;
}

interface ScreenMessageOptions {
  type: ScreenMessageTypes;
  silent?: boolean;
}

type noparamfunct = () => void;
class ScreenMessage {
  private logger: boolean;
  private logs: LoggerItemCompatible[];
  private listener: null | noparamfunct;

  constructor() {
    this.logger = true;
    this.logs = [];
    this.listener = null;
  }

  public warning(message: string, options?: ScreenMessageMessageOptions) {
    options = options ? options : { silent: false };
    this.toast(message, {
      type: ScreenMessageTypes.WARNING,
      silent: options.silent,
    });
  }

  public error(message: string, options?: ScreenMessageMessageOptions) {
    options = options ? options : { silent: false };
    this.toast(message, {
      type: ScreenMessageTypes.ERROR,
      silent: options.silent,
    });
  }

  public info(message: string, options?: ScreenMessageMessageOptions) {
    options = options ? options : { silent: false };
    this.toast(message, {
      type: ScreenMessageTypes.INFO,
      silent: options.silent,
    });
  }

  public success(message: string, options?: ScreenMessageMessageOptions) {
    options = options ? options : { silent: false };
    this.toast(message, {
      type: ScreenMessageTypes.SUCCESS,
      silent: options.silent,
    });
  }

  public showMessage(screenMessageObject: ScreenMessageObject) {
    this.toast(screenMessageObject.message, {
      type: screenMessageObject.type,
      silent: screenMessageObject.silent,
    });
  }

  public startLogger() {
    this.logs = [];
    this.logger = true;
  }

  public restartLogger() {
    this.logger = false;
    const oldLoggs = this.logs;
    this.logs = [];
    this.logger = true;
    return oldLoggs;
  }

  public stopLogger() {
    this.logger = false;
  }

  public getLogs() {
    return this.logs;
  }

  public setListener(updateNotification: () => void) {
    this.listener = updateNotification;
  }

  public removeListener() {
    this.listener = null;
  }

  private toast(message: string, options: ScreenMessageOptions) {
    if (this.logger) {
      this.log(options.type, message);
      if (typeof this.listener === 'function') {
        this.listener();
      }
    }
    if (options.silent) {
      //  It will not be show on screen but it will be put on the log file
    } else {
      toast(message, options);
    }
  }

  private log(type: ScreenMessageTypes, message: string) {
    const loggerItem = new LoggerItemCompatible(type, message);
    this.logs.push(loggerItem);
    while (this.logs.length > maxQueueSize) {
      this.logs.shift();
    }
  }
}

export default new ScreenMessage();
