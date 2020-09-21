import React from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

// import './DraggableWindow.scss';

import {IAppState} from '../../../reduxboilerplate/store';
import { Actions } from '../../../reduxboilerplate/actions';
import {
  CancelCommand,
  SendCommand,
} from '../../../reduxboilerplate/command/actions';
import {connect, useStore} from 'react-redux';
import {
  Command,
  genereteUniqueID,
} from '../../../reduxboilerplate/command/reducer';
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {WindowManagerActions} from "../interfaces/WindowManagerActions";
import {WindowElement} from "../../../reduxboilerplate/windowManager/reducer";

interface OwnProps {
  id: string;
  top?: number;
  left?: number;
  bottom?: number;
  right?: number
  title?: string;
  children: JSX.Element;
}

interface State {
  title: string;
  dataInit: any;
  x: number;
  y: number;
}

interface StateProps {
  topWindow: string | null;
}

interface DispatchProps {
  sendCommand: (command: Command) => void;
}

type Props = StateProps & DispatchProps & OwnProps;

class DraggableWindowInternal extends React.Component<Props, State> {
  private childrenArray: JSX.Element[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      title: this.props.title ? this.props.title : '',
      dataInit: {},
      x: 0,
      y: 0,
    };
  }

  private static isEquivalent(a: any, b: any, ignore: string[]) {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
      return false;
    }
    for (let i = 0; i < aProps.length; i++) {
      const propName = aProps[i];
      if (ignore.indexOf(propName)===-1) {
        if (a[propName] !== b[propName]) {
          return false;
        }
      }
    }
    return true;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (!DraggableWindowInternal.isEquivalent(this.props, prevProps, ['topWindow', 'ref']) ) {
      this.setState({
        x: 0,
        y: 0,
      });
    }
  }

  render() {
    this.childrenArray = [];
    const child = this.props.children;
    let renderContent = null;
    if (!child.type || child.type === React.Fragment) {
      renderContent = child;
    } else if (typeof child.type === 'string') {
      renderContent = child;
    } else if( DraggableWindowInternal.isReduxWrappedComponent(child.type) ) {
      renderContent = React.cloneElement(child, {
        parent: this,
        dataInit: this.state.dataInit,
        ref: (ref: JSX.Element) =>
            ref ? this.childrenArray.push(ref) : undefined,
      });
    } else
      if (
        DraggableWindowInternal.iSFunctionalComponent(child.type)
    ) {
      renderContent = React.cloneElement(child, {
        parent: this,
        dataInit: this.state.dataInit,
        forwardRef: (ref: JSX.Element) =>
          ref ? this.childrenArray.push(ref) : undefined,
      });
    } else {
      renderContent = React.cloneElement(child, {
        parent: this,
        dataInit: this.state.dataInit,
        ref: (ref: JSX.Element) =>
          ref ? this.childrenArray.push(ref) : undefined,
      });
    }
    return (
      <Draggable
        handle=".header-title"
        onStart={this.onStart}
        onStop={this.onStop}
        position={{ x: this.state.x, y: this.state.y }}
      >
        <div
          className="box-window no-cursor"
          style={{ top: this.props.top, left: this.props.left, right: this.props.right, bottom: this.props.bottom }}
        >
          <div className="cursor">
            <div className="header" onClick={this.clickOnHeader}>
              <div className="header-title">{this.state.title}</div>
              <a className="close-button" onClick={this.clickCloseButton} />
            </div>
          </div>
          <div className="body-content" onClick={this.clickOnBody} >{renderContent}</div>
        </div>
      </Draggable>
    );
  }

  // field required by child
  public setTitle = (title: string) => {
    this.setState({
      title,
    });
  };

  private isWindowOnTop() {
    return this.props.topWindow === this.props.id;
  }

  private clickOnHeader = () => {
    if (!this.isWindowOnTop()) {
      this.sendMoveToTopCommand();
    }
  };

  private clickOnBody = () => {
    if (!this.isWindowOnTop()) {
      setTimeout(()=>{
        this.sendMoveToTopCommand();
      },150);
    }
  };

  private clickCloseButton = () => {
    this.close();
  };

  public close = () => {
    this.canClose().then((canClose) => {
      if (canClose) {
        this.sendCloseCommand();
      } else {
        console.log('Cancel close!!!');
      }
    });
  };

  public canClose = () => {
    return new Promise((resolve) => {
      const promises = this.childrenArray.map((child: any) => {
        if (child && typeof child.canClose === 'function') {
          return child.canClose();
        } else {
          return new Promise<boolean>((resolve) => resolve(true));
        }
      });
      Promise.all(promises).then((closeArray: any) => {
        let canClose = true;
        closeArray.forEach((value: boolean) => {
          canClose = canClose && value;
        });
        resolve(canClose);
      });
    });
  };

  private sendCloseCommand = () => {
    const cmd: Command = {
      uid: genereteUniqueID(),
      action: ApplicationCommands.WINDOWMANAGER,
      parameters: {
        actionType: WindowManagerActions.DESTROYWINDOWBYID,
        id: this.props.id,
      },
    };
    this.props.sendCommand(cmd);
  };

  private sendMoveToTopCommand = () => {
    const cmd: Command = {
      uid: genereteUniqueID(),
      action: ApplicationCommands.WINDOWMANAGER,
      parameters: {
        actionType: WindowManagerActions.WINDOWTOTOPBYID,
        id: this.props.id,
      },
    };
    this.props.sendCommand(cmd);
  };

  private onStart = () => {
    console.log('Start dragging');
    if (!this.isWindowOnTop()) {
      this.sendMoveToTopCommand();
    }
  };

  private onStop = (e: DraggableEvent, data: DraggableData) => {
    this.setState({
      x: data.x,
      y: data.y,
    });
  };

  private static iSFunctionalComponent(component: any) {
    return (
      component &&
      component.prototype &&
      component.prototype.render === undefined
    );
  }

  private static isReduxWrappedComponent(component: any) {
    return (
      component.type &&
      component.type.name === 'ConnectFunction' &&
      component.displayName &&
      component.displayName.startsWith('Connect(')
    );
  }
}

function mapStateToProps(state: IAppState): StateProps {
  return {
    topWindow: state.windowsManager.topWindow
  };
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
  return {
    sendCommand: (command: Command) => {
      dispatch(SendCommand(command));
      setTimeout(() => {
        dispatch(CancelCommand());
      });
    },
  };
}

const DraggableWindow =  connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
    null,
    { forwardRef : true }
)(DraggableWindowInternal);

export default DraggableWindow;
