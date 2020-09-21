import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";

interface TreeNodeAttributeStatus {
    value: boolean;
    enabled: boolean;
}
interface WMSQueryableStatus extends  TreeNodeAttributeStatus {
    active: boolean;
}
interface TreeNodeInterface {
    realNode: LayerTreeNode;
    label: string;
    id: string;
    title: string;
    parent_id?: string;
    visible: TreeNodeAttributeStatus;
    editable: TreeNodeAttributeStatus;
    labeled: TreeNodeAttributeStatus;
    selectable: TreeNodeAttributeStatus;
    onTop: TreeNodeAttributeStatus;
    treeNodeType: string;
    queryable: WMSQueryableStatus;
    collapsed: boolean;
    nodes: TreeNodeInterface[];
}



export default TreeNodeInterface;
