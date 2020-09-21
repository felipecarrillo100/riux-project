import React from "react";

class EMLabel extends React.Component {
    render() {
        return (
            <label className="EMLabel">{this.props.children}</label>
        );
    }

}

export default EMLabel;
