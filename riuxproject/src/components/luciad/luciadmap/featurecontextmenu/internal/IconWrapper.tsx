import * as React from 'react';

import './IconWrapper.scss';

interface FontAwesomeWrapperProps {
  color?: string;
  backgroundColor?: string;
}

class IconWrapper extends React.Component<FontAwesomeWrapperProps> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <div
        className="faImg FontAwesomeWrapper"
        style={{
          color: this.props.color,
          backgroundColor: this.props.backgroundColor,
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default IconWrapper;
