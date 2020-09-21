import * as React from 'react';
import AbstractForm, {
  AbstractFormProps,
  SubmitButtonsRow,
} from '../abstract/AbstractForm';
import {IAppState} from "../../../reduxboilerplate/store";
import {Actions} from "../../../reduxboilerplate/actions";
import {Command} from "../../../reduxboilerplate/command/reducer";
import {SendCommand} from "../../../reduxboilerplate/command/actions";
import {connectForm} from "../../../reduxboilerplate/connectForm";
import {connect} from "react-redux";

interface State {
  text: string;
}

interface StateProps {
    mapProjection: string;
}

interface DispatchProps {
    sendCommand: (command: Command) => void;
}

type Props = AbstractFormProps & DispatchProps & StateProps;

class SampleForm1 extends AbstractForm<Props, State> {
  constructor(props: any) {
    super(props);
    this.setParentTitle('Sample 1');
    this.state = {
      text: "abc"
    }
  }

  render(): any {
    return (
      <form className="riux-form" onSubmit={this.onSubmit}>
        <label>Map projection {this.props.mapProjection}</label>
        <hr />
          <label>{this.state.text}</label>
          <hr />
          <input value={this.state.text} name="text" onChange={this.handleChange}/>
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

function mapStateToProps(state: IAppState): StateProps {
    return {
        mapProjection: state.map.mapProjection
    };
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
    return {
        sendCommand: (command: Command) => {
            dispatch(SendCommand(command))
        }
    };
}

export default connectForm<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps,
)(SampleForm1);
