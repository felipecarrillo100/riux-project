class FullScreen {
  public static requestFullscreen(elem: any) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  public static cancelFullscreen() {
    const document: any = window.document; // Magic
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  public static toggleFullScreen(elem: any) {
    if (this.isFullscreen()) {
      this.cancelFullscreen();
    } else {
      this.requestFullscreen(elem);
    }
  }

  public static isFullscreen() {
    const document: any = window.document; // Magic
    return !!(
      document.fullscreenElement || // alternative standard method
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    ); // current working methods
  }
}

export default FullScreen;
