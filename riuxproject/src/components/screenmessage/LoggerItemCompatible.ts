import { ScreenMessageTypes } from './ScreenMessage';

class LoggerItemCompatible {
  private timestamp: number;
  private message: string;
  private type: ScreenMessageTypes;

  constructor(type: ScreenMessageTypes, message: string) {
    const now = new Date().getTime();
    this.message = message;
    this.type = type;
    this.timestamp = now;
  }

  public getDate() {
    return new Date(this.timestamp);
  }

  public getTimestamp() {
    return this.timestamp;
  }

  public getMessage() {
    return this.message;
  }

  public getType() {
    return this.type;
  }

  public get() {
    return {
      time: this.timestamp,
      message: this.message,
      type: this.type,
    };
  }
}

export default LoggerItemCompatible;
