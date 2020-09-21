import * as React from "react";

import "./LayerControlHolder.scss";

interface Props {
    width?: number | string;
    height?: number | string;
    top?: number | string;
    left?: number | string;
    bottom?: number | string;
    right?: number | string;
}

class LayerControlHolder extends React.Component<Props> {
    render() {
        const width = this.props.width ? this.props.width: 360;
        const height = this.props.height ? this.props.height: 240;
        return (
            <div className="LayerControlHolder" style={{width, height, top: this.props.top, left:this.props.left, right:this.props.right, bottom: this.props.bottom}}>
                <div className="container">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default LayerControlHolder;
