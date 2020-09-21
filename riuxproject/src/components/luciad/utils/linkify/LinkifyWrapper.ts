import * as linkifyStr from 'linkifyjs/string';

const untypedLinkifyStr = linkifyStr as any;

export function isImageURL(url: string) {
  const isURL = isStringURL(url);
  if (!isURL) {
    return false;
  }
  return (
    url.match(/\.(jpeg|jpg|jpe|jif|jfif|jfi|gif|png|gif|svg|bmp|webp)$/) != null
  );
}

export function isStringURL(url: string) {
  const options = {};
  const tmp = typeLinkifyStr(url, options);
  return tmp !== url;
}

export function ImageTransform(url: string) {
  if (url && typeof url === 'string') {
    if (isImageURL(url)) {
      return (
        '<img width="284" height="160" src="' +
        url +
        '"onclick="toggleFullscreen(this)" onerror="this.onerror=null;this.src=\'img/NoImageFound.png\'"/>'
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export function YouTubeTransform(url: string) {
  if (url && typeof url === 'string') {
    // eslint-disable-next-line no-useless-escape
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      const myId = match[2];
      return (
        '<iframe width="284" height="160" src="//www.youtube.com/embed/' +
        myId +
        '" frameborder="0" allowfullscreen></iframe>'
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function typeLinkifyStr(url: string, options?: any) {
  return untypedLinkifyStr(url, options);
}

export default typeLinkifyStr;
