import * as React from 'react';

import svgIcon from './fullscreen_w.svg';
import FullScreen from '../../../../../utils/fullscreen/FullScreen';
import './ImageBalloonItem.scss';


interface Props {
  src: any;
}

interface State {
  src: string;
  onError: any;
  fullScreen: boolean;
}

const fallbackImage = 'img/NoImageFound.png';

class ImageBalloonItem extends React.Component<Props, State> {
  private imgRef: HTMLImageElement | null;
  private divRef: HTMLDivElement | null;
  constructor(props: any) {
    super(props);
    this.onError = this.onError.bind(this);
    this.toggleFullSreen = this.toggleFullSreen.bind(this);
    this.state = {
      src: this.props.src,
      onError: this.onError,
      fullScreen: false,
    };
  }

  public onError(e: any) {
    this.setState({ src: fallbackImage, onError: null });
  }

  public toggleFullSreen(e: any) {
    const domElement = this.divRef;
    FullScreen.requestFullscreen(domElement);
  }

  public render() {
    // <img className="ImageBalloonItem-fullScreen" src="images/fullscreen_w.svg" onClick={this.toggleFullSreen} title="Display image fullscreen"/>
    return (
      <div className="ImageBalloonItem" ref={(ref) => (this.divRef = ref)}>
        <img
          className="ImageBalloonItem-image"
          src={this.state.src}
          onError={this.state.onError}
          title={this.props.src}
          ref={(ref) => (this.imgRef = ref)}
        />
        <img
          className="ImageBalloonItem-fullScreen"
          src={svgIcon}
          onClick={this.toggleFullSreen}
          title="Display image fullscreen"
        />
      </div>
    );
  }
}

export default ImageBalloonItem;
