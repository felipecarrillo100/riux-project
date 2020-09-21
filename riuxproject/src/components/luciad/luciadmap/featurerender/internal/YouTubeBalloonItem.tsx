import * as React from 'react';

interface Props {
  youtubeframe: string;
}

class YouTubeBalloonItem extends React.Component<Props> {
  public render() {
    return (
      <div dangerouslySetInnerHTML={{ __html: this.props.youtubeframe }} />
    );
  }
}

export default YouTubeBalloonItem;
