import React from "react";
import {Map} from "@luciad/ria/view/Map";

// This is now called globally
// import "./BingMapsAtribution.scss";

import {ScaleIndicatorProps} from "../ScaleIndicator/ScaleIndicatorOverlay";
import {TileSetAttributionProvider} from "@luciad/ria/view/tileset/TileSetAttributionProvider";
import {Handle} from "@luciad/ria/util/Evented";


export interface AttributionObject {
    names: string[];
    logos: string[];
}

interface Props {
    map: Map;
}

interface State {
    attribution: AttributionObject | null;
}

class BingMapsAtribution extends React.Component<Props, State>{
    private attributionProvider: TileSetAttributionProvider;
    private logoListener: Handle;
    private stringListener: Handle;

    constructor(props: Props) {
        super(props);
        this.state = {
            attribution: null
        }
        this.attributionProvider = null;
    }

    private removeDuplicates(attribution: AttributionObject) {
        const newSet = [...new Set(attribution.names)];

        const attributions = newSet.map((name, index)=>{
            const fixName = name.split('©').join('© ');
            return (<span key={index}>{fixName}</span>)
        });
        return attributions;
    }

    private attributionUpdate = () => {
        if (!this.attributionProvider) return;
        const strings = this.attributionProvider.getAttributionStrings();
        const urls = this.attributionProvider.getAttributionLogos();
        if (typeof this.onAttributionChange === "function") {
            const urlsSecured = urls.map((urli) => urli.replace("http://", "https://"));
            const result: AttributionObject = {
                names: strings,
                logos: urlsSecured,
            }
            this.onAttributionChange(result);
        }
    }

    private onAttributionChange = (attribution: AttributionObject) => {
        this.setState({
            attribution
        })
    }

    private updateMapChangeListener(map: Map) {
        if (map) {
            this.attributionProvider = new TileSetAttributionProvider(this.props.map);
            this.logoListener = this.attributionProvider.on("AttributionLogosChanged", this.attributionUpdate);
            this.stringListener = this.attributionProvider.on("AttributionStringsChanged", this.attributionUpdate);
        }
    }


    private removeListener() {
        if (this.logoListener) this.logoListener.remove();
        if (this.stringListener) this.stringListener.remove();
        if (this.attributionProvider) this.attributionProvider.dispose();

        this.logoListener =  null;
        this.stringListener = null;
        this.attributionProvider = null;
    }

    componentDidMount() {
        if (this.props.map) {
            this.updateMapChangeListener(this.props.map);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }

    componentDidUpdate(prevProps: ScaleIndicatorProps) {
        if (prevProps.map !== this.props.map) {
            this.removeListener();
            this.updateMapChangeListener(this.props.map);
        }
    }

    render() {
        let showLogo = null;
        const mapAvailable = !!this.props.map;
        let attributionNames = [] as any;
        if (this.state.attribution) {
            attributionNames = this.removeDuplicates(this.state.attribution);
            showLogo = this.state.attribution.logos.length>0;
        } else {
            []
        }
        return (
            <React.Fragment>
                {  (mapAvailable) &&
                <div className="BingMapsAtribution riux-no-select">
                    {showLogo && <img src={this.state.attribution.logos[0]}/>}
                    {attributionNames}
                </div>
                }

            </React.Fragment>
        );
    }

}

export default BingMapsAtribution;
