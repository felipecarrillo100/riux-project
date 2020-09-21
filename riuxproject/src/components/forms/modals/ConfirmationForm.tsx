import React from "react";
import AbstractForm, {AbstractFormProps} from "../abstract/AbstractForm";
import {ConfirmationFormOptions} from "../interfaces/ConfirmationFormOptions";

type Props = AbstractFormProps;

interface State {
    message: string
    value: string;
}

const defaultValues: ConfirmationFormOptions = {
    okButtonText: 'Ok',
    cancelButtonText: 'Cancel',
    title: "Confirmation",
    subTitle: undefined,
    input: undefined,
    icon: undefined
}

class ConfirmationForm extends AbstractForm<Props, State> {
    private options: ConfirmationFormOptions;
    constructor(props: Props) {
        super(props);
        this.options = this.props.dataInit && this.props.dataInit.options ? this.props.dataInit.options : defaultValues;
        this.options = { ... defaultValues, ...this.options};
        this.state = {
            message: this.props.dataInit && this.props.dataInit.message ? this.props.dataInit.message : "Confirmation message",
            value: this.options.input ? this.options.input : ''
        }
        this.setParentTitle(this.options.title);
    }

    protected onSubmit(event: React.SyntheticEvent) {
        console.log("Form was submitted")
        if (this.options.input) {
            this.modalSubmitValues({
                success: true,
                values: this.state.value
            });
        } else  {
            this.modalSubmitValues({success: true});
        }
        super.onSubmit(event);
    }

    render() {
        return (
            <form className="riux-form" onSubmit={this.onSubmit}>
                {
                    this.options.subTitle &&
                    <React.Fragment>
                        <h1>{this.options.subTitle}</h1>
                        <hr />
                    </React.Fragment>
                }
                <label>{this.state.message}</label>
                { this.options.input &&
                    <input value={this.state.value} name="value" onChange={this.handleChange} />
                }
                <div className="submit-buttons">
                    <button type="button" onClick={this.onCancel} >{this.options.cancelButtonText}</button>
                    <button type="submit" >{this.options.okButtonText}</button>
                </div>
            </form>
        );
    }

}

export default ConfirmationForm;
