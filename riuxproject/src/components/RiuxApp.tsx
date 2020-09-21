import React from 'react';

import "./RiuxApp.scss"

import GlobalContextMenu, {
    ContextMenuAnimation,
    ContextMenuTheme
} from "../components/customcontextmenu/GlobalContextMenu";
import {Actions} from "../reduxboilerplate/actions";
import {connect} from "react-redux";
import {IAppState} from "../reduxboilerplate/store";
import {setContextMenu} from "../reduxboilerplate/contextMenu/actions";
import {ScreenMessageContainer} from "./screenmessage/ScreenMessage";
import Workspace from "./luciad/workspace/Workspace";
import Desktop from "./desktop/Desktop";
import QuickTest from "./luciad/testbar/QuickTest";
import ScreenModal, {ModalContainer} from "./screenmodals/ScreenModal";

interface StatePros {
    contextMenu: GlobalContextMenu;
}

interface DispatchProps {
    setContextMenu: (contextMenu: GlobalContextMenu) => void;
}

type Props = StatePros & DispatchProps;


class AppInternal extends React.Component<Props> {
    private contextMenuRef: GlobalContextMenu;

    componentDidMount() {
        if (this.contextMenuRef) {
            this.props.setContextMenu(this.contextMenuRef);
        }
    }

    render() {
        // <MainMap />
        //                 <Workspace />
        return (
            <div className="App">
                <Desktop>
                    <Workspace />
                </Desktop>
                <QuickTest />
                <GlobalContextMenu ref={(ref) => (this.contextMenuRef = ref)} theme={ContextMenuTheme.dark} />
                <ScreenMessageContainer />
                <ModalContainer />
            </div>
        );
    }

}

function mapStateToProps(state: IAppState): StatePros {
    return {
        contextMenu: state.contextMenu.contextMenu,
    };
}

function mapDispatchToProps(dispatch: React.Dispatch<Actions>): DispatchProps {
    return {
        setContextMenu: (contextMenu) => dispatch(setContextMenu(contextMenu))
    };
}

const RiuxApp = connect<StatePros, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps
)(AppInternal);

export default RiuxApp;
