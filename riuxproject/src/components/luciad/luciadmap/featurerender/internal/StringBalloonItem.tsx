import * as React from 'react';

import ImageBalloonItem from './ImageBalloonItem';
import YouTubeBalloonItem from './YouTubeBalloonItem';

import linkifyStr, {
  isImageURL,
  isStringURL,
  YouTubeTransform,
} from '../../../utils/linkify/LinkifyWrapper';

interface Props {
  property: any;
  propertyName: string;
}

class StringBalloonItem extends React.Component<Props> {
  public render() {
    const youtube = YouTubeTransform(this.props.property);

    if (youtube) {
      return (
        <div>
          <span className="balloon-property-name">
            {this.props.propertyName}:{' '}
          </span>
          :
          <YouTubeBalloonItem youtubeframe={youtube} />
        </div>
      );
    } else if (isImageURL(this.props.property)) {
      return (
        <div>
          <span className="balloon-property-name">
            {this.props.propertyName}:{' '}
          </span>
          :
          <ImageBalloonItem src={this.props.property} />
        </div>
      );
    } else if (isStringURL(this.props.property)) {
      const urlLink = linkifyStr(this.props.property);
      const linkToURL = { __html: urlLink };
      return (
        <div>
          <span className="balloon-property-name">
            {this.props.propertyName}:{' '}
          </span>
          <span className="balloon-property-content">
            <span dangerouslySetInnerHTML={linkToURL} />
          </span>
        </div>
      );
    } else {
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
    }
  }
}

export default StringBalloonItem;
