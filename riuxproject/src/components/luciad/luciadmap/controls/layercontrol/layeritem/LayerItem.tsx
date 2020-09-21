import * as React from 'react';

// SCSS is now globally imported
// import './LayerItem.scss';

import { Map } from "@luciad/ria/view/Map";
import LayerNodeItem from "./LayerNodeItem";
import GlobalContextMenu from "../../../../../customcontextmenu/GlobalContextMenu";
import TreeNodeInterface from "../interfaces/TreeNodeInterface";

interface LayerItemProps {
    map: Map;
    contextMenu?: GlobalContextMenu;
    setCurrentLayer?: (layerID: string | undefined | null) => void;
    layertree: TreeNodeInterface | undefined | null;
    currentLayer: string | undefined | null;
    level: number;
}

class LayerItem extends React.Component<LayerItemProps> {

    constructor(props:any) {
        super(props);
    }

    public render() {
        const layertree = this.props.layertree;

        let level = 0;
        if (typeof this.props.level !== "undefined") {
            level = this.props.level;
        }
        let layers = [] as TreeNodeInterface[];
        if (typeof layertree !== "undefined") {
            if (layertree) {layers = layertree.nodes;}
        }

        return (
            <ul className="layer-manager-tree">
                {[...layers].reverse().map((layer) =>
                    <LayerNodeItem key={layer.id} map={this.props.map} layer={layer}  currentLayer={this.props.currentLayer}
                                   layertree={this.props.layertree} level={level}  contextMenu={this.props.contextMenu} setCurrentLayer={this.props.setCurrentLayer} />
                )}
            </ul>
        );
    }
}


export default LayerItem;
