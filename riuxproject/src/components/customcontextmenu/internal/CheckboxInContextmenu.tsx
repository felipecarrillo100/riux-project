import * as React from 'react';
import InlineSVG from "../../inlinesvg/InlineSVG";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface CBProps {
  checkbox: {
    active?: boolean;
    enabled: boolean;
    value: boolean;
  };
}

class CheckboxInContextmenu extends React.Component<CBProps> {
  public render():
    | React.ReactElement<any>
    | string
    | number
    // eslint-disable-next-line @typescript-eslint/ban-types
    | {}
    | (React.ReactChild | any[] | boolean)[]
    | React.ReactPortal
    | boolean
    | null
    | undefined {
    const active =
      typeof this.props.checkbox.active !== 'undefined'
        ? this.props.checkbox.active
        : true;
    const enabled = this.props.checkbox.enabled;
    const clasName = enabled
      ? 'CheckboxInContextmenu'
      : 'CheckboxInContextmenu disabled';
    return (
      <React.Fragment>
        {!(this.props.checkbox.value && active) && (
            <div className="CheckboxInContextmenu">
                {InlineSVG.CheckBoxSVG()}
            </div>
        )}
        {this.props.checkbox.value && active && (
            <div className="CheckboxInContextmenu">
                {InlineSVG.CheckBoxCheckedSVG()}
            </div>
        )}
      </React.Fragment>
    );
  }
}

export default CheckboxInContextmenu;
