import * as React from 'react';

import {
  animation as internalAnimation,
  Item,
  Separator,
  Submenu,
  theme as internalTheme,
} from 'react-contexify';

export const ContextMenuAnimation = internalAnimation;
export const ContextMenuTheme = internalTheme;

// Style is now called globally
// import './GlobalContextMenu.scss';

import CheckboxInContextmenu from './internal/CheckboxInContextmenu';
import MenuCustom from './internal/menucustom/MenuCustom';

const ItemAny = Item as any;
const SubmenuAny = Submenu as any;

type FunctionActionType = (o: any) => void;

export declare class ContextMenuClassType {
  public addItem(o: ContextMenuItem): void;
  public addSeparator(): void;
}

export type ContextMenuItem =
  | ContextMenuSimpleItem
  | ContextMenuSeparator
  | ContextMenuSubMenu;
export type ContextMenuItems = ContextMenuItem[];

export interface ContextMenuSimpleItem {
  label: string;
  icon?: JSX.Element;
  title?: string;
  checkbox?: { active?: boolean; enabled: boolean; value: boolean };
  action?: FunctionActionType;
}

export interface ContextMenuSubMenu {
  label: string;
  title?: string;
  items?: ContextMenuItems;
}

export interface ContextMenuSeparator {
  separator: boolean;
}

export interface ContextMenuContent {
  items: ContextMenuItems;
}

export interface ShowCustomContextMenuOptions {
  x?: number;
  y?: number;
  event?: any;
  contextMenu: ContextMenuContent;
}

interface Props {
  menuID?: string;
  theme?: string;
  animation?: string;
}

interface State {
  contextMenu: ContextMenuContent;
}

class GlobalContextMenu extends React.Component<Props, State> {
  private contextMenuRef: MenuCustom | null;

  constructor(props: any) {
    super(props);
    this.state = { contextMenu: {} as any };
    this.executeAction = this.executeAction.bind(this);
  }

  public executeAction(action: any) {
    return (options: any) => {
      if (typeof action === 'function') {
        action(options.event);
      }
    };
  }

  public show(options: ShowCustomContextMenuOptions) {
    const domElement = this.contextMenuRef as MenuCustom;
    domElement.showProgramatically(options, {
      contextMenu: options.contextMenu,
    });
    this.setState({ contextMenu: options.contextMenu });
  }

  public render() {
    const renderItems = (items: any) => {
      return items.map((item: any, index: number) => {
        if (item.separator) {
          return <Separator key={index} />;
        } else {
          if (item.items) {
            const suItems = renderItems(item.items);
            if (suItems) {
              const label = item.label
                ? (item.label as string)
                : 'Missing label';
              return (
                <SubmenuAny key={index} label={label} >
                  {suItems}
                </SubmenuAny>
              );
            } else {
              return <React.Fragment key={index} />;
            }
          } else {
            if (item.checkbox) {
              const active =
                typeof item.checkbox.active !== 'undefined'
                  ? item.checkbox.active
                  : true;
             // const enabled = item.checkbox.enabled;
              const enabled = item.checkbox.enabled;
              return (
                <ItemAny
                  key={index + item.label + Date.now()}
                  onClick={this.executeAction(item.action)}
                  disabled={!enabled}
                >
                  <div className="item-row">
                      <span className="icon-span" title={item.title}>{item.icon}</span>
                      <span className="title-span" title={item.title}>{item.label}</span>
                      <CheckboxInContextmenu checkbox={item.checkbox} />
                  </div>
                </ItemAny>
              );
            } else {
              return (
                <ItemAny key={index} onClick={this.executeAction(item.action)} >
                  <div className="item-row">
                    <span className="icon-span"  title={item.title}>{item.icon}</span>
                    <span title={item.title} data-cy-action={item.cyAction}>
                    {item.label}
                  </span>
                  </div>
                </ItemAny>
              );
            }
          }
        }
      });
    }
    let menu = <div />;
    if (this.state.contextMenu.items) {
      const items = this.state.contextMenu.items;
      menu = renderItems(items) as any;
    }
    return (
      <MenuCustom
        id={this.props.menuID ? this.props.menuID : 'GLOBAL-CONTEXT-MENU' }
        ref={(ref) => (this.contextMenuRef = ref)}
        theme={this.props.theme ? this.props.theme : ContextMenuTheme.dark}
        animation={this.props.animation ? this.props.animation : ContextMenuAnimation.pop}
        className="cy-context-menu"
      >
        {menu}
      </MenuCustom>
    );
  }

  private preventDefault = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  }
}

export default GlobalContextMenu;
