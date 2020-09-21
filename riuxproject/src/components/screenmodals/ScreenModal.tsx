import React from "react";
import {createPortal} from "react-dom";
import ScreenMessage from "../screenmessage/ScreenMessage";
import {ConfirmationFormOptions} from "../forms/interfaces/ConfirmationFormOptions";
import FormProvider from "../forms/FormProvider";
import {BasicFormRecords} from "../forms/BasicForms";
import {ModalFormOptions, ModalFormResponse} from "../forms/interfaces/ModalFormResponse";

// This is now included globally
// import "./ModalContainer.scss";

interface Props {
    animation?: string;
}

interface State {
    title: string;
    open: boolean;
    size: "small" | "medium" | "large";
    content: JSX.Element[];
}


export class ModalContainer extends React.Component<Props, State> {
    public static self: ModalContainer;
    public ref: any;
    public static promise: any;
    private promiseHandlers: { resolve: (value?: unknown) => void; reject: (reason?: any) => void };
    private modalSubmitValues: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            title: "My Modal",
            open: false,
            content: [],
            size: "medium"
        }
    }

    componentDidMount() {
        if (ModalContainer.self) {
            const errorMessage = "You can mount ModalContainer only once!";
            ScreenMessage.error(errorMessage)
            console.error(errorMessage)
        }
        ModalContainer.self = this;
    }

    public setContent(child: JSX.Element, dataInit: any) {
        const renderContent = React.cloneElement(child, {
            key: "modal-content",
            parent: this,
            dataInit,
            ref: (ref: any) => this.ref = ref,
        });
        this.setState({
            content: [renderContent]
        })
    }

    private clearContent() {
        this.setState({
            content: []
        })
    }

    render() {
        const content = this.state.content.map( (item) => item);

        const classNameSize =  " " + this.state.size;
        return (
            <div className="ModalContainer" >
                {this.state.open && createPortal(<div className={ "ModalWindowContainer" + classNameSize }>
                    <div className="ModalWindow">
                            <div className="header" >
                                <div className="header-title">{this.state.title}</div>
                                <a className="close-button" onClick={this.clickCloseButton} />
                            </div>
                        <div className="body-content">
                            {content}
                        </div>
                    </div>
                </div>, document.body)}
            </div>
        );
    }

    // Definition required by child
    public setTitle = (title: string) => {
        this.setState({
            title,
        });
    };

    // Definition required by child
    public close = () => {
        this.canClose().then((canClose) => {
            if (canClose) {
                this.clearContent();
                this.hide();
            } else {
                console.log('Cancel close!!!');
            }
        });
    };

    // Definition required by child
    public setModalSubmitValues = (values: any) => {
       this.modalSubmitValues = values;
    }

    private canClose = () => {
        return new Promise((resolve) => {
            const promises = [this.ref].map((child: any) => {
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

    private clickCloseButton = () => {
        if (this.ref) this.ref.onCancel();
    }

    protected hide = () => {
        this.setState({
            open: false
        });
        this.ref = undefined;
        this.promiseHandlers.resolve(typeof this.modalSubmitValues !== "undefined" ? this.modalSubmitValues : {success: false});
    }

    public show = (size?: "small" | "medium" | "large") => {
        size = size ? size : "medium";
        this.setState({
            open: true,
            size
        });
        this.modalSubmitValues = undefined;
        return new Promise<any>((resolve, reject) => this.promiseHandlers = {resolve, reject});
    }

}

class ScreenModal {
    public static isReady() {
        return !!ModalContainer.self;
    }

    private static show(size: "small" | "medium" | "large") {
        return ModalContainer.self.show(size);
    }

    public static createModal(content: JSX.Element, formData: any, modalOptions?: ModalFormOptions): Promise<ModalFormResponse> {
        if (ScreenModal.isReady() && content) {
            ModalContainer.self.setContent(content, formData);
            const size = modalOptions && modalOptions && modalOptions.size ? modalOptions.size : undefined;
            return ScreenModal.show(size);
        } else {
            console.error("ScreenModal component is missing. Have your forgotten adding the  <ScreenModal/> component to your application?")
            return new Promise((resolve, reject) => reject());
        }
    }

    public static createModalByName(name: string, formData: any, modalOptions?: ModalFormOptions): Promise<ModalFormResponse> {
        const form = FormProvider.retrieveForm(name);
        return ScreenModal.createModal(form, formData, modalOptions);
    }

    public static Confirmation(message: string, corfirmationOptions?: ConfirmationFormOptions, modalOptions?: ModalFormOptions): Promise<ModalFormResponse> {
        const dataInit = {
            message,
            options: corfirmationOptions
        }
        return ScreenModal.createModalByName(BasicFormRecords.ModalConfirm, dataInit, modalOptions)
    }
}


export default ScreenModal;
