import React from 'react';
// This is now imported globally
// import './Desktop.scss';

import DraggableWindow from './draggablewindow/DraggableWindow';
import { IAppState } from '../../reduxboilerplate/store';
import { Actions } from '../../reduxboilerplate/actions';
import { connect } from 'react-redux';
import { CompleteCommand } from '../../reduxboilerplate/command/actions';
import {
  Command,
  onCommandReceived,
} from '../../reduxboilerplate/command/reducer';
import FormProvider from '../forms/FormProvider';
import { WindowElement } from '../../reduxboilerplate/windowManager/reducer';
import {setTopWindow, setWindows} from '../../reduxboilerplate/windowManager/actions';
import BasicForms from "../forms/BasicForms";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {WindowManagerActions} from "./interfaces/WindowManagerActions";

interface OwnProps {
  children?: React.ReactNode;
}

interface StateProps {
  command: Command | null;
  windows: WindowElement[];
  topWindow: string | null;
}

interface DispatchProps {
  handleCommand: () => void;
  setWindows: (windows: WindowElement[]) => void;
  setTopWindow: (windowId: string | null) => void;
}

type Props = StateProps & DispatchProps & OwnProps;

class DesktopInternal extends React.Component<Props> {
  private id: number;
  private posX: number;
  private posY: number;
  private position: number;

  constructor(props: any) {
    super(props);
    this.id = 0;
    this.position = 0;
    this.posX = 0;
    this.posY = 0;

    BasicForms.RegisterForms();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    onCommandReceived(
      prevProps,
      this.props,
      [
        ApplicationCommands.WINDOWMANAGER,
      ],
        true
    ).then((command) => {
      console.log(
        'Command received at Desktop: ' +  command.action + ' ',
          command.parameters
      );
      this.applyCommand(command)
    });
  }

  protected applyCommand(command: Command) {
    switch (command.action) {
      case ApplicationCommands.WINDOWMANAGER:
        this.manageWindowsCommand(command);
        break;
    }
  }

  protected manageWindowsCommand(command: Command) {
    switch (command.parameters.actionType) {
      case WindowManagerActions.CREATEWINDOW:
        this.createWindowOnCommand(command);
        break;
      case WindowManagerActions.DESTROYWINDOWBYID:
        this.destroyWindowOnCommand(command);
        break;
      case WindowManagerActions.WINDOWTOTOPBYID:
        this.WindowToTopOnCommand(command);
        break;
    }
  }

  render() {
    const windows = this.props.windows.map(
      (windowElement) => windowElement.window
    );
    return (
      <div className="Desktop-class">
        {this.props.children}
        {windows}
      </div>
    );
  }

  private createWindowOnCommand(command: Command) {
    const parameters = command.parameters;
    const content = parameters.content
      ? parameters.content
      : parameters.form
      ? parameters.form
      : parameters.formName
      ? FormProvider.retrieveForm(parameters.formName)
      : null;
    const toggle =
      typeof parameters.toggle !== 'undefined' ? parameters.toggle : false;
    const windowIndex = this.findWindowIndexById(parameters.id);

    if (
      typeof parameters.id !== 'undefined' &&
      toggle && windowIndex > -1
    ) {
      this.destroyWindowOnCommand(command);
    } else if (content) {
      if (windowIndex > -1) {
        console.log("Exist");
      }
      let autoPos = false;
      this.id++;
      const id = parameters.id ? parameters.id : 'auto_' + this.id;

      if (typeof parameters.left === 'undefined')
        this.posX = (this.position % 10) * 20 + 5;
      if (typeof parameters.top === 'undefined')
        this.posY = (this.position % 10) * 30 + 10;

      if (
        typeof parameters.left === 'undefined' &&
        typeof parameters.top === 'undefined'
      ) {
        this.position++;
        autoPos = true;
      }

      const props = {
        id,
        title: parameters.title,

        right: typeof parameters.right !== "undefined" ? parameters.right : "auto",
        bottom: typeof parameters.bottom !== "undefined" ? parameters.bottom : "auto",
        left: typeof parameters.left === "undefined" && typeof parameters.right === "undefined" ?
            this.posX : typeof parameters.left !== "undefined" ?  parameters.left : "auto",
        top: typeof parameters.top === "undefined" && typeof parameters.bottom === "undefined" ?
            this.posY : typeof parameters.top !== "undefined" ? parameters.top : "auto",
        // For old react redux forwardedRef was used
        /*
        forwardedRef: (ref: any) => {
          console.log("FORWARD REFERENCE CALLED");
          const i = this.findWindowIndexById(id);
          if (i > -1) {
            const w = this.props.windows[i];
            w.ref = ref;
          }
        }, */
        ref: (ref: any) => {
          // console.log("REFERENCE CALLED");
          const i = this.findWindowIndexById(id);
          if (i > -1) {
            const w = this.props.windows[i];
            w.ref = ref;
          }
        },
      };
      const windows = [...this.props.windows];
      const index = this.findWindowIndexById(id);
      const windowElement: WindowElement = {
        id,
        window: null,
        autoPos,
        ref: null,
      };
      const window = (
          <DraggableWindow {...props} key={id}>
            {content}
          </DraggableWindow>
      );
      windowElement.window = window;

      if (index > -1) {
        if (windows[index].ref) {
          const parent = windows[index].ref;
          if (typeof parent.canClose === 'function') {
            parent.canClose().then((canClose: boolean) => {
              if (canClose) {
                windows.splice(index, 1);
                windows.push(windowElement);
                this.updateWindowsSet(windows);
              }
            });
          }
        }
      } else {
        windows.push(windowElement);
        this.updateWindowsSet(windows);
      }
    }
  }

  updateWindowsSet(windowsArray: WindowElement[]) {
    this.props.setWindows(windowsArray);
    let windowID = null
    if (windowsArray.length > 0) {
      windowID = windowsArray[windowsArray.length-1].id;
    }
    if (this.props.topWindow !== windowID) this.props.setTopWindow(windowID);
  }

  public findWindowIndexById(id: string) {
    return this.props.windows.findIndex(
      (windowElement) => windowElement.id === id
    );
  }

  private destroyWindowOnCommand(command: Command) {
    return new Promise((resolve => {
      const parameters = command.parameters;
      const windows = [...this.props.windows];
      const index = this.findWindowIndexById(parameters.id);
      if (index > -1) {
        const window = windows[index];
        windows.splice(index, 1);
        if (window.ref) {
          const parent = window.ref;
          if (typeof parent.canClose === 'function') {
            parent.canClose().then((canClose: boolean) => {
              if (canClose) {
                this.updateWindowsSet(windows);
                return;
              }
            });
          }
        }
        this.updateWindowsSet(windows);
      }
    }));
  }

  private WindowToTopOnCommand(command: Command) {
    const parameters = command.parameters;
    const windows = [...this.props.windows];
    const index = this.findWindowIndexById(parameters.id);
    if (index > -1) {
      const window = windows[index];
      windows.splice(index, 1);
      windows.push(window);
      this.updateWindowsSet(windows);
    }
  }
}

function mapStateToProps(state: IAppState): StateProps {
  const props: StateProps = {
    command: state.command.command,
    windows: state.windowsManager.windows,
    topWindow: state.windowsManager.topWindow
  };
  return props;
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
  return {
    handleCommand: () => {
      dispatch(CompleteCommand());
    },
    setWindows: (windows: WindowElement[]) => {
      dispatch(setWindows(windows));
    },
    setTopWindow: (windowId: string | null) => {
      dispatch(setTopWindow(windowId));
    },
  };
}

const Desktop = connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(DesktopInternal);

export default Desktop;
