import * as React from 'react';
import './AbstractForm.scss';
import AbstractWindowContent, {AbstractWindowContentProps} from "./AbstractWindowContent";

export interface AbstractFormProps extends AbstractWindowContentProps{}

export const SubmitButtonsRow: React.FunctionComponent<any> = (props) => {
  return (
        <div className="submit-buttons">
          <div>{props.children}</div>
        </div>
  );
};

class AbstractForm<
  T extends AbstractFormProps,
  S extends any
> extends AbstractWindowContent<T, S> {

  constructor(props: any) {
    super(props);
    this.closeParent = this.closeParent.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const realValue =
      event.target.type === 'checkbox' ? event.target.checked : value;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.setState({ [name]: realValue });
  }

  protected onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.closeParent();
  }

  protected modalSubmitValues(values: any) {
    const myParent = this.props.parent as any;
    if (myParent && typeof myParent.setModalSubmitValues === 'function') {
      myParent.setModalSubmitValues(values);
    }
  }

  protected isReadyToSubmit(): boolean {
    return true;
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <label>This is an empty form</label>
      </form>
    );
  }
}

export default AbstractForm;
