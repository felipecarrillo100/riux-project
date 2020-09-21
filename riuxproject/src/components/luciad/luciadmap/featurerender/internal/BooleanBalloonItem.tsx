import * as React from 'react';

interface Props {
  property: any;
  propertyName: string;
}

class BooleanBalloonItem extends React.Component<Props> {
  public render() {
    const booleanString = this.props.property ? 'TRUE' : 'FALSE';
    return (
      <div>
        <span className="balloon-property-name">
          {this.props.propertyName}:{' '}
        </span>
        <span className="balloon-property-content">{booleanString}</span>
      </div>
    );
  }
}

export default BooleanBalloonItem;
