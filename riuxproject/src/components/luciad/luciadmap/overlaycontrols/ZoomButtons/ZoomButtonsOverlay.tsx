import React from "react";
import {Map} from "@luciad/ria/view/Map";

// This is now called globally
//import "./ZoomButtonsOverlay.scss";

interface Props {
    map: Map;
}

class ZoomButtonsOverlay extends React.Component<any, any>{
    private timerZoomIn: number;
    private timerZoomOut: number;
    private firstClickTime: number = 100;

    render() {
        const mapAvailable = !!this.props.map;
        return (
            <React.Fragment>
                {  mapAvailable &&
                    <div className="ZoomButtonsOverlay riux-no-select">
                        <button className="zoomButton" onMouseUp={this.onMouseUpZoomIn} onMouseDown={this.onMouseDownZoomIn} onMouseLeave={this.onMouseLeaveZoomIn}>&#43;</button>
                        <button className="zoomButton" onMouseUp={this.onMouseUpZoomOut} onMouseDown={this.onMouseDownZoomOut} onMouseLeave={this.onMouseLeaveZoomOut}>&#8722;</button>
                    </div>
                }

            </React.Fragment>
        );
    }

    repeatZoomIn = () => {
        this.zoomIn();
        this.timerZoomIn = window.setTimeout(this.repeatZoomIn, this.firstClickTime);
        if (this.firstClickTime >= 100) this.firstClickTime /= 2;
    }

    private onMouseLeaveZoomIn = () => {
        this.onMouseUpZoomIn();
    }

    private onMouseLeaveZoomOut = () => {
        this.onMouseUpZoomOut();
    }

    private repeatZoomOut = () => {
        this.zoomOut();
        this.timerZoomOut = window.setTimeout(this.repeatZoomOut, this.firstClickTime);
        if (this.firstClickTime >= 100) this.firstClickTime /= 2;
    }

    private onMouseDownZoomIn = () => {
        this.repeatZoomIn()
    }
    private onMouseUpZoomIn = () => {
        clearTimeout(this.timerZoomIn);
        this.firstClickTime = 400;
    }

    private onMouseDownZoomOut = () => {
        this.repeatZoomOut();
    }
    private onMouseUpZoomOut = () => {
        clearTimeout(this.timerZoomOut);
        this.firstClickTime = 400;
    }

    private zoomIn() {
        const scaleFactor = 2;
        if (this.props.map) {
            this.props.map.mapNavigator.zoom({
                targetScale: this.props.map.mapScale[0] * scaleFactor,
                animate: {
                    duration: this.firstClickTime
                }
            });
        }
    }

    private zoomOut() {
        const scaleFactor = 0.5;
        if (this.props.map) {
            this.props.map.mapNavigator.zoom({
                targetScale: this.props.map.mapScale[0] * scaleFactor,
                animate: {
                    duration: this.firstClickTime
                }
            });
        }
    }

}

export default ZoomButtonsOverlay;
