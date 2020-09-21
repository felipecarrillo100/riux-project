import * as React from 'react';
import AbstractForm, {
  AbstractFormProps,
  SubmitButtonsRow,
} from '../abstract/AbstractForm';
import {Command} from "../../../reduxboilerplate/command/reducer";
import {IAppState} from "../../../reduxboilerplate/store";
import {Actions} from "../../../reduxboilerplate/actions";
import {SendCommand} from "../../../reduxboilerplate/command/actions";
import {connectForm} from "../../../reduxboilerplate/connectForm";

interface DispatchProps {
  sendCommand: (command: Command) => void;
}

type Props = AbstractFormProps & DispatchProps;

class SampleForm2 extends AbstractForm<Props, any> {
  constructor(props: any) {
    super(props);
    this.setParentTitle('Sample 2');
  }

  render(): any {
    return (
        <form className="riux-form" onSubmit={this.onSubmit}>
          <label>This is a sample form</label>
          <SubmitButtonsRow>
            <button onClick={this.onCancel} >
              Close
            </button>
            <button
                type="submit"
                disabled={!this.isReadyToSubmit()}
            >
              Commit
            </button>
          </SubmitButtonsRow>
        </form>
    );
  }
}

function mapStateToProps(state: IAppState): unknown {
  return {};
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
  return {
    sendCommand: (command: Command) => {
      dispatch(SendCommand(command))
    }
  };
}

export default connectForm<unknown, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps,
)(SampleForm2);

