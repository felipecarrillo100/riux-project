import React, {MouseEventHandler} from "react";

interface Props {
    active?: boolean;
    name?: string;
    title?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

class EMButton extends React.Component<Props> {
    render() {
        let className = "EMButton";
        if (this.props.active) {
            className = className + " active";
        }
        return <button className={className} name={this.props.name} title={this.props.title} onClick={this.props.onClick}>
            {this.props.children}
        </button>;
    }
}

export default EMButton;
