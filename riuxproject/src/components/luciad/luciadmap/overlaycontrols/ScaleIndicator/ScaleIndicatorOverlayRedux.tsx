import * as React from "react";

import './ScaleIndicatorOverlay.scss';
import {IAppState} from "../../../../../reduxboilerplate/store";

import {connect} from "react-redux";
import GlobalContextMenu, {
    ShowCustomContextMenuOptions
} from "../../../../../components/customcontextmenu/GlobalContextMenu";
import ScaleIndicatorOverlay, {ScaleIndicatorProps, ScaleIndicatorState} from "./ScaleIndicatorOverlay";

const availableScales = [
    100,
    250,
    500,
    1000,
    2500,
    5000,
    10000,
    25000,
    50000,
    100000,
    250000,
    500000,
    1000000,
    2500000,
    5000000,
    10000000,
    25000000,
    50000000,
];

const MAX_WIDTH_PIXELS = 150;
const THROTTLE_MS = 40; // no need to re-render this component more than 25 times per second


interface OwnProps {
    enableContextMenu?: boolean;
}

interface StatePros {
    contextMenu: GlobalContextMenu;
}


type Props = StatePros & ScaleIndicatorProps & OwnProps;

type State = ScaleIndicatorState;

class ScaleIndicatorOverlayReduxInternal extends ScaleIndicatorOverlay<Props, State> {

    constructor(props: Props) {
        super(props);
        this.onContextMenu = this.onContextMenu.bind(this);
    }

    onContextMenu(e: any) {
        e.preventDefault();
        if (typeof this.props.enableContextMenu !== "undefined" ? this.props.enableContextMenu : true) {
            const options: ShowCustomContextMenuOptions = {
                x: e.clientX,
                y: e.clientY,
                contextMenu: this.generateContextMenu(),
            };
            if (this.props.contextMenu) {
                this.props.contextMenu.show(options);
            }
        }
    }

    render() {
        const {text, nodeWidth, nodeLeft, scaleText} = this.state;
        const mapAvailable = !!this.props.map;
        return (
            <React.Fragment>
                { mapAvailable &&
                    <div className="scaleIndicator" ref={ref => this._scaleIndicatorNode = ref}
                         onClick={this.onScaleIndicatorClick} onContextMenu={this.onContextMenu}
                    >
                        <div className="scaleIndicatorText no-text-select">{text}</div>
                        <div className="scaleIndicatorBackground" style={{width: `${nodeWidth}px`, left: `${nodeLeft}px`}}>
                            <div className="scaleIndicatorForeground" style={{left: "0px", width: "25%"}}/>
                            <div className="scaleIndicatorForeground" style={{left: "50%", width: "25%"}}/>
                        </div>
                        <div className="scaleRatioText no-text-select">{scaleText}</div>
                    </div>
                }
            </React.Fragment>
        );
    }

    private generateContextMenu() {
        const itemStructure = (scale: number) => ({
                label: '1 : ' + scale,
                title: 'Change the map scale to: 1 : ' + scale,
                action: () => {
                    this.props.map.mapNavigator.zoom({targetScale: 1 / scale, snapToScaleLevels: false})
                }
            })
        const items = availableScales.map(itemStructure);
        return {
            items
        };
    }
}

function mapStateToProps(state: IAppState): StatePros {
    return {
        contextMenu: state.contextMenu.contextMenu,
    };
}

const ScaleIndicatorOverlayRedux = connect<StatePros>(
    mapStateToProps,
)(ScaleIndicatorOverlayReduxInternal);

export default ScaleIndicatorOverlayRedux;
