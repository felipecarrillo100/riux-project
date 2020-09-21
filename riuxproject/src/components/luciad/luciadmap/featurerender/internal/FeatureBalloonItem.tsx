import * as React from 'react';

import BooleanBalloonItem from './BooleanBalloonItem';
import StringBalloonItem from './StringBalloonItem';

interface Props {
  property: any;
  propertyName: string;
}

class FeatureBalloonItem extends React.Component<Props> {
  public render() {
    switch (typeof this.props.property) {
      case 'boolean':
        return (
          <BooleanBalloonItem
            propertyName={this.props.propertyName}
            property={this.props.property}
          />
        );
        break;
      case 'string':
        return (
          <StringBalloonItem
            propertyName={this.props.propertyName}
            property={this.props.property}
          />
        );
        break;
      case 'object':
        let objectType = '';
        let objectLength = 0;
        if (Array.isArray(this.props.property)) {
          objectType = 'Array';
          objectLength = this.props.property.length;
        } else {
          objectType = 'Object';
          objectLength = Object.keys(this.props.property).length;
        }
        return (
          <div>
            <span className="balloon-property-name">
              {this.props.propertyName}:{' '}
            </span>
            <span className="balloon-property-content">
              {objectType + '(' + objectLength + ')'}
            </span>
          </div>
        );
      default:
        return (
          <div>
            <span className="balloon-property-name">
              {this.props.propertyName}:{' '}
            </span>
            <span className="balloon-property-content">
              {this.props.property}
            </span>
          </div>
        );
        break;
    }
  }
}

export default FeatureBalloonItem;
