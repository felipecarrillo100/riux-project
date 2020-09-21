const DEFAULT_WIDTH = 64,
  DEFAULT_HEIGHT = 64,
  DEFAULT_STROKESTYLE = 'rgba(155,167,23,1)',
  DEFAULT_FILLSTYLE = 'rgba(155,167,23,1)',
  DEFAULT_FADINGSTYLE = 'rgba(155,167,23,0.1)',
  DEFAULT_STROKEWIDTH = 1;

export interface IconImageFactoryOptions {
  stroke: string;
  fill: string;
  strokeWidth: number;
  width: number;
  height: number;
  fading?: string;
  type?: string;
  invert?: boolean;
  border?: boolean;
  offsetX?: number;
  offsetY?: number;
  fontSize?: string;
  font?: string;
  textColor?: string;
  textAlign?: CanvasTextAlign;
  speed?: number;
}

const IndexFlag = 0,
  IndexFull = 1,
  IndexHalf = 2;

class IconImageFactory {
  private static makeContext(
    stroke: string,
    fill: string,
    strokeWidth: number,
    width: number,
    height: number
  ): any {
    const canvas = document.createElement('canvas'),
      context = canvas.getContext('2d') as any;

    canvas.width = width || DEFAULT_WIDTH;
    canvas.height = height || DEFAULT_HEIGHT;

    context.strokeStyle = stroke || DEFAULT_STROKESTYLE;
    context.fillStyle = fill || DEFAULT_FILLSTYLE;

    /** Improvement? */
    //     const grd = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    //     grd.addColorStop(0, fill);
    //     grd.addColorStop(0.6, fill);
    //     grd.addColorStop(1, stroke);
    //     context.fillStyle = grd;
    /** Improvement? */

    context.lineWidth = strokeWidth || DEFAULT_STROKEWIDTH;

    return { canvas, context };
  }

  private static tallyBarbs(speed: number) {
    // round to nearest 5
    let remainder = 5 * Math.round(speed / 5);
    let pennant = 0;
    let full = 0;
    let half = 0;
    // tslint:disable:no-bitwise
    if (remainder >= 50) {
      pennant = ~~(remainder / 50);
      remainder -= pennant * 50;
    }
    if (remainder >= 10) {
      full = ~~(remainder / 10);
      remainder -= full * 10;
    }
    if (remainder >= 5) {
      half = ~~(remainder / 5);
    }
    // tslint:enable:no-bitwise
    return [pennant, full, half];
  }

  /**
   * Creates a circle icon that can be used as an image in .
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.circle({width:30, height:30, stroke:"#FF0000"})
   *              }
   *          );
   * @param options Icon options: width, height, stroke, fill, strokeWidth
   * @return Object
   */
  public static circle(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      center = canvas.width / 2;

    // offset = 0;  // No stroke

    let radius = center - offset;
    if (radius <= 0) {
      radius = 1;
    }
    context.arc(center, center, radius, 0, Math.PI * 2, false);
    context.fill();
    context.stroke();

    return canvas;
  }

  /**
   * Creates a circle icon will a radial gradient of 2 colors that can be used as an image
   * in . The 2 colors are specified by the options.fill & option.fading
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.gradientCircle({fill: "rgba(255, 255, 225, 1.0)",
   *                                                  fading: "rgba(225, 225, 225,0.2)",
   *                                                  width: 30,
   *                                                  height: 30})
   *              }
   *            );
   *
   *
   * @param options Icon options: width, height, fill, fading
   * @returns Object
   */
  public static gradientCircle(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      centerX = canvas.width / 2,
      centerY = canvas.height / 2;

    let radiusX = centerX - offset;
    let radiusY = centerY - offset;

    if (radiusX <= 0) {
      radiusX = 1;
    }
    if (radiusY <= 0) {
      radiusY = 1;
    }

    const grd = context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radiusX > radiusY ? radiusX : radiusY
    );
    grd.addColorStop(0, options.fill);
    grd.addColorStop(1, options.stroke);
    context.fillStyle = grd;
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    return canvas;
  }

  /**
   * Creates a circle icon will a radial gradient of 2 colors that can be used as an image
   * in . The 2 colors are specified by the options.fill & option.fading
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.gradientCircle({fill: "rgba(255, 255, 225, 1.0)",
   *                                                  fading: "rgba(225, 225, 225,0.2)",
   *                                                  width: 30,
   *                                                  height: 30})
   *              }
   *            );
   *
   *
   * @param options Icon options: width, height, fill, fading
   * @returns Object
   */
  public static gradientCircleOld(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = 1,
      center = canvas.width / 2;

    let radius = center - offset;
    if (radius <= 4) {
      radius = 4;
    }

    const smallestRadius = radius * 0.25;
    const smallerRadius = radius * 0.75;

    const grd = context.createRadialGradient(
      center,
      center,
      smallestRadius,
      center,
      center,
      smallerRadius
    );
    grd.addColorStop(0, options.fill || DEFAULT_FILLSTYLE);
    grd.addColorStop(1, options.fading || DEFAULT_FADINGSTYLE);

    context.fillStyle = grd;

    context.arc(center, center, radius, 0, Math.PI * 2, false);
    context.fill();

    return canvas;
  }
  /**
   * Creates a rectangle icon with Text inside that can be used as an image in .
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.rectangleText({width:30, height:30, stroke:"#FF0000", textColor: "white", textAlign: "left"})
   *              }
   *          );
   * @param options Icon options: width, height, stroke, fill, strokeWidth, textColor, textAlign
   * @return Object
   */
  public static rectangleText(text: string, options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offsetX =
      typeof options.offsetX !== 'undefined' ? options.offsetX : 0;
    const offsetY =
      typeof options.offsetY !== 'undefined' ? options.offsetY : 0;
    const offset = (options.strokeWidth || DEFAULT_STROKEWIDTH) / 2.0;

    if (options.fill) {
      context.fillRect(
        offset + offsetX,
        offset + offsetY,
        canvas.width - 2 * offset,
        canvas.height - 2 * offset
      );
    }
    const fontSize =
      typeof options.fontSize !== 'undefined' ? options.fontSize : '14px';
    const font =
      typeof options.font !== 'undefined' ? options.font : 'Sans-Serif';

    context.font = fontSize + ' ' + font;
    context.fillStyle = options.textColor;
    context.textAlign = options.textAlign;
    const fontPixels = Number(fontSize.replace('px', ''));
    const fontPixelsX = context.measureText(text).width;
    let x = canvas.width / 2;
    let y = canvas.height / 2 + fontPixels / 2;
    if (options.textAlign === 'left') x = 0;
    if (options.textAlign === 'right') x = canvas.width;
    if (options.textAlign === 'center') {
      context.textAlign = 'left';
      x = canvas.width / 2 - fontPixelsX / 2;
    }
    x += offsetX / 2;
    y += offsetY / 2;

    context.strokeText(text, x, y);
    context.fillText(text, x, y);

    return canvas;
  }

  /**
   * Creates a rectangle icon that can be used as an image in .
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.rectangle({width:30, height:30, stroke:"#FF0000"})
   *              }
   *          );
   * @param options Icon options: width, height, stroke, fill, strokeWidth
   * @return Object
   */
  public static rectangle(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = (options.strokeWidth || DEFAULT_STROKEWIDTH) / 2.0;
    if (options.fill) {
      context.fillRect(
        offset,
        offset,
        canvas.width - 2 * offset,
        canvas.height - 2 * offset
      );
    }
    context.strokeRect(
      offset,
      offset,
      canvas.width - 2 * offset,
      canvas.height - 2 * offset
    );

    return canvas;
  }

  /**
   * Creates a ellipse icon that can be used as an image in .
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.ellipse({width:30, height:30, stroke:"#FF0000"})
   *              }
   *          );
   * @param options Icon options: width, height, stroke, fill, strokeWidth
   * @return Object
   */
  public static ellipse(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      centerX = canvas.width / 2,
      centerY = canvas.height / 2;

    let radiusX = centerX - offset;
    let radiusY = centerY - offset;

    if (radiusX <= 0) {
      radiusX = 1;
    }
    if (radiusY <= 0) {
      radiusY = 1;
    }

    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    if (options.fill) {
      context.fill();
    }
    context.stroke();

    return canvas;
  }

  /**
   * Creates a TARGET icon that can be used as an image in .
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.target({width:30, height:30, stroke:"#FF0000"})
   *              }
   *          );
   * @param options Icon options: width, height, stroke, fill, strokeWidth
   * @return Object
   */
  public static target(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      centerX = canvas.width / 2,
      centerY = canvas.height / 2;

    // Internal Circle
    let radiusX = (centerX / 6) * 2 - offset;
    let radiusY = (centerY / 6) * 2 - offset;
    radiusX = radiusX <= 0 ? 1 : radiusX;
    radiusY = radiusY <= 0 ? 1 : radiusY;
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.stroke();
    // External Circle
    context.beginPath();
    radiusX = (centerX / 6) * 4 - offset;
    radiusY = (centerY / 6) * 4 - offset;
    radiusX = radiusX <= 0 ? 1 : radiusX;
    radiusY = radiusY <= 0 ? 1 : radiusY;
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    if (options.fill) {
      context.fill();
    }
    context.stroke();
    const radiusX1 = radiusX;
    const radiusY1 = radiusY;
    radiusX = centerX - offset;
    radiusY = centerY - offset;
    context.beginPath();
    context.moveTo(centerX + radiusX1, centerY);
    context.lineTo(centerX + radiusX, centerY);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX - radiusX1, centerY);
    context.lineTo(centerX - radiusX, centerY);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX, centerY + radiusY1);
    context.lineTo(centerX, centerY + radiusY);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX, centerY - radiusY1);
    context.lineTo(centerX, centerY - radiusY);
    context.stroke();

    return canvas;
  }

  /**
   * Creates a ship icon that can be used as an image in .
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.rectangle({width:30, height:30, stroke:"#FF0000"})
   *              }
   *          );
   * @param options Icon options: width, height, stroke, fill, strokeWidth
   * @return Object
   */
  public static ship(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    const widthT = cX - offset;
    let width = widthT;
    let height = (cY - offset) / 4;
    if (width <= 0) {
      width = 1;
    }
    if (height <= 0) {
      height = 1;
    }
    // body
    context.fillStyle = options.fill;

    context.beginPath();
    context.moveTo(cX - widthT, cY - height);
    context.lineTo(cX, cY - height * 4);
    context.lineTo(cX + widthT, cY - height);
    context.lineTo(cX + width, cY - height);
    context.lineTo(cX + width, cY + height * 4);
    context.lineTo(cX - width, cY + height * 4);
    context.lineTo(cX - width, cY - height);
    context.lineTo(cX - widthT, cY - height);
    context.closePath();
    context.fill();
    context.stroke();

    return canvas;
  }

  public static windBarbs(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    let width = cX - offset;
    let height = cY - offset;
    const poleHeight = height * 0.89;
    const markStep = height * 0.15;
    if (width <= 0) {
      width = 1;
    }
    if (height <= 0) {
      height = 1;
    }

    /********************/
    function drawflags(current: any, value: number): any {
      if (value === 0) return current;
      context.beginPath();
      const currentHeight = cY - current * markStep;
      context.moveTo(cX, currentHeight - poleHeight);
      context.lineTo(cX + markStep * 3, currentHeight - poleHeight);
      context.lineTo(cX, currentHeight - poleHeight + markStep * 0.75);
      context.closePath();
      context.fill();
      context.stroke();
      return drawflags(current - 0.85, value - 1);
    }

    function drawfull(current: any, value: number): any {
      if (value === 0) return current;
      context.beginPath();
      const currentHeight = cY - current * markStep;
      context.moveTo(cX, currentHeight - poleHeight);
      context.lineTo(
        cX + markStep * 3,
        currentHeight - (poleHeight + markStep * 0.75)
      );
      context.closePath();
      context.stroke();
      return drawfull(current - 0.82, value - 1);
    }

    function drawhalf(current: any, value: number): any {
      if (value === 0) return current;
      context.beginPath();
      const currentHeight = cY - current * markStep;
      context.moveTo(cX, currentHeight - poleHeight);
      context.lineTo(
        cX + markStep * 1.5,
        currentHeight - (poleHeight + markStep * 0.375)
      );
      context.closePath();
      context.stroke();
      return drawfull(current - 0.82, value - 1);
    }

    function drawBarbs(tally: any): any {
      let current = 0;
      let ph = poleHeight;

      tally.forEach((value: number, index: number) => {
        switch (index) {
          case IndexFlag:
            if (value > 0) {
              current += 0.75;
              ph = height;
            }
            current = drawflags(current, value);
            break;
          case IndexFull:
            if (current < 0) current -= 0.6;
            current = drawfull(current, value);
            break;
          case IndexHalf:
            if (current === 0) current -= 1;
            current = drawhalf(current, value);
            break;
        }
      });
      return ph;
    }

    /***************************/

    // body
    context.fillStyle = options.stroke;

    if (options.speed) {
      if (options.speed < 2) {
        // Calm  speed < 2 knots
        const radius = height * 0.08;
        const radius2 = height * 0.24;
        context.beginPath();
        context.arc(cX, cY, radius, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        context.closePath();
        context.beginPath();
        context.arc(cX, cY, radius2, 0, 2 * Math.PI, false);
        context.stroke();
        context.closePath();
      } else {
        // Arrow  speed > 3 knots
        const barbTally = IconImageFactory.tallyBarbs(options.speed);
        const ph = drawBarbs(barbTally);

        const radius = height * 0.09;
        context.beginPath();
        context.lineWidth = options.strokeWidth * 2;
        context.arc(cX, cY, radius, 0, 2 * Math.PI, false);
        context.fill();
        context.moveTo(cX, cY);
        context.lineTo(cX, cY - ph);
        context.closePath();
        context.stroke();
      }
    }
    return canvas;
  }

  public static arrow(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    const widthT = cX - offset;
    let width = 0.4 * widthT;
    let height = (cY - offset) / 4;
    if (width <= 0) {
      width = 1;
    }
    if (height <= 0) {
      height = 1;
    }
    // body
    context.fillStyle = options.fill;

    context.beginPath();
    context.moveTo(cX - widthT, cY - height);
    context.lineTo(cX, cY - height * 4);
    context.lineTo(cX + widthT, cY - height);
    context.lineTo(cX + width, cY - height);
    context.lineTo(cX + width, cY + height * 4);
    context.lineTo(cX - width, cY + height * 4);
    context.lineTo(cX - width, cY - height);
    context.lineTo(cX - widthT, cY - height);
    context.closePath();
    context.fill();
    context.stroke();

    return canvas;
  }

  /*  Triangle */
  public static triangle(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    const width = cX - offset;
    const height = cY - offset;

    let invert = -1;
    if (typeof options.type === 'undefined') options.type = 'full';
    if (typeof options.invert === 'undefined') options.invert = false;
    if (typeof options.border === 'undefined') options.border = true;
    if (options.invert) invert = 1;

    options.type = options.type.toLowerCase();
    if (options.type !== 'left' && options.type !== 'right')
      options.type = 'full';

    if (options.type === 'full') {
      context.beginPath();
      context.moveTo(cX - width, cY - height * invert);
      context.lineTo(cX + width, cY - height * invert);
      context.lineTo(cX, cY + height * invert);
      context.lineTo(cX - width, cY - height * invert);
      context.closePath();
      context.fill();
    } else if (options.type === 'left') {
      context.beginPath();
      context.moveTo(cX - width, cY - height * invert);
      context.lineTo(cX, cY - height * invert);
      context.lineTo(cX, cY + height * invert);
      context.lineTo(cX - width, cY - height * invert);
      context.closePath();
      context.fill();
    } else if (options.type === 'right') {
      context.beginPath();
      context.moveTo(cX, cY - height * invert);
      context.lineTo(cX + width, cY - height * invert);
      context.lineTo(cX, cY + height * invert);
      context.lineTo(cX, cY - height * invert);
      context.closePath();
      context.fill();
    }
    if (options.border) context.stroke();

    return canvas;
  }

  public static heart(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    const width = cX - offset;
    const height = cY - offset;

    if (typeof options.border === 'undefined') options.border = true;

    context.beginPath();
    context.moveTo(cX, +cY - 0.7 * height);
    context.bezierCurveTo(
      cX,
      cY - 0.76 * height,
      cX - (5 / 55) * width,
      cY - height,
      cX - (25 / 55) * width,
      cY - height
    );
    context.bezierCurveTo(
      cX - width,
      cY - height,
      cX - width,
      cY - 0.25 * height,
      cX - width,
      cY - 0.25 * height
    );
    context.bezierCurveTo(
      cX - width,
      cY + 0.1 * height,
      cX - (35 / 55) * width,
      cY + 0.54 * height,
      cX,
      cY + height
    );
    context.bezierCurveTo(
      cX + (35 / 55) * width,
      cY + 0.54 * height,
      cX + width,
      cY + 0.1 * height,
      cX + width,
      cY - 0.25 * height
    );
    context.bezierCurveTo(
      cX + width,
      cY - 0.25 * height,
      cX + width,
      cY - height,
      cX + (25 / 55) * width,
      cY - height
    );
    context.bezierCurveTo(
      cX + (10 / 55) * width,
      cY - height,
      cX,
      cY - 0.76 * height,
      cX,
      cY - 0.7 * height
    );
    context.fill();
    if (options.border) context.stroke();
    return canvas;
  }

  public static poi(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    const width = cX - offset;
    const height = cY - offset;

    context.beginPath();
    context.arc(
      width + offset,
      width + offset,
      width,
      Math.PI * 0.9,
      Math.PI * 2.1,
      false
    );
    context.lineTo(width + offset, height * 2);
    context.closePath();
    context.fill();
    context.stroke();

    return canvas;
  }

  public static plane(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    const width = cX - offset;
    const height = cY - offset;

    context.beginPath();
    context.arc(
      width + offset,
      width / 6 + offset,
      width / 6,
      Math.PI,
      Math.PI * 2,
      false
    );
    context.lineTo(width + width / 6 + offset, height * 0.666);
    context.lineTo(width + width + offset, height);
    context.lineTo(width + width + offset, height * 1.2);
    context.lineTo(width + width / 6 + offset, height * 1.05);

    context.lineTo(width + width / 6 + offset, height * 1.666);
    context.lineTo(width + width / 2 + offset, height * 1.8);
    context.lineTo(width + width / 2 + offset, height * 2.0);

    context.lineTo(width + offset, height * 1.9);

    context.lineTo(width - width / 2 + offset, height * 2.0);
    context.lineTo(width - width / 2 + offset, height * 1.8);
    context.lineTo(width - width / 6 + offset, height * 1.666);

    context.lineTo(width - width / 6 + offset, height * 1.05);
    context.lineTo(offset, height * 1.2);
    context.lineTo(offset, height);
    context.lineTo(width - width / 6 + offset, height * 0.666);

    context.closePath();
    context.fill();
    context.stroke();

    //     context.stroke();
    //     context.strokeRect(offset, offset, canvas.width - 2 * offset, canvas.height - 2 * offset);

    return canvas;
  }

  public static cross(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    const width = cX * 2 - offset;
    const height = cY * 2 - offset;

    context.beginPath();
    context.lineTo(width * 0.333 + offset, offset);
    context.lineTo(width * 0.666, offset);
    context.lineTo(width * 0.666, height * 0.333 + offset);
    context.lineTo(width, height * 0.333 + offset);
    context.lineTo(width, height * 0.666);
    context.lineTo(width * 0.666, height * 0.666);
    context.lineTo(width * 0.666, height);
    context.lineTo(width * 0.333 + offset, height);
    context.lineTo(width * 0.333 + offset, height * 0.666);
    context.lineTo(offset, height * 0.666);
    context.lineTo(offset, height * 0.333 + offset);
    context.lineTo(width * 0.333 + offset, height * 0.333 + offset);
    context.closePath();
    context.fill();
    context.stroke();

    return canvas;
  }

  public static clouds(options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    const offset = options.strokeWidth || DEFAULT_STROKEWIDTH,
      cX = canvas.width / 2,
      cY = canvas.height / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    const width = cX - offset;
    const height = cY - offset;

    if (typeof options.border === 'undefined') options.border = true;

    let radius = cX - offset;
    if (radius <= 0) {
      radius = 1;
    }

    const MAP = {
      CLR: 0,
      FEW: 0.5 * Math.PI,
      SCT: Math.PI,
      BKN: 1.5 * Math.PI,
      OVC: 2 * Math.PI,
      VV: 2 * Math.PI,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const angle = MAP[options.clouds];

    if (angle > 0) {
      context.fillStyle = 'cyan';
      context.beginPath();
      context.arc(cX, cY, radius, 0, Math.PI * 2, false);
      context.fill();
      context.stroke();
      radius = radius * 0.6;
      context.fillStyle = '#ffffff';
      context.beginPath();
      context.arc(cX, cY, radius, 0, Math.PI * 2, false);
      context.fill();
      context.stroke();
      context.fillStyle = '#000000';
      context.beginPath();
      context.moveTo(cX, cY);
      context.arc(cX, cY, radius, -0.5 * Math.PI, -0.5 * Math.PI + angle);
      context.fill();
    }

    if (typeof angle === 'undefined') {
      context.fillStyle = '#ffffff';
      context.beginPath();
      context.arc(cX, cY, radius, 0, Math.PI * 2, false);
      context.fill();
      context.stroke();
      context.strokeStyle = '#FF0000';
      context.beginPath();
      context.moveTo(cX - width * 0.5, cY + height * 0.6);
      context.lineTo(cX - width * 0.5, cY - height * 0.6);
      context.lineTo(cX, cY - height * 0.1);
      context.lineTo(cX + width * 0.5, cY - height * 0.6);
      context.lineTo(cX + width * 0.5, cY + height * 0.6);
      context.stroke();
    }
    return canvas;
  }

  /**
   * Creates a text icon that can be used as an image in . The text
   * is centered inside the icon.
   * @example
   *  geoCanvas.drawIcon(
   *              shape,
   *              {
   *                width:"30px",
   *                height:"30px",
   *                image:IconFactory.text("text", {width:30, height:30, fill:"#FF0000", font:"10pt Arial"})
   *              }
   *          );
   * @param text    the text string
   * @param options Icon options: width, height, fill
   * @return Object
   */
  public static text(text: string, options: IconImageFactoryOptions) {
    const ct = IconImageFactory.makeContext(
        options.stroke,
        options.fill,
        options.strokeWidth,
        options.width,
        options.height
      ),
      canvas = ct.canvas,
      context = ct.context;

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = options.font || '10pt Arial';
    context.fillText(text, options.width / 2, options.height / 2);

    return canvas;
  }
}

export default IconImageFactory;
