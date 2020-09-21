import IconImageFactory, { IconImageFactoryOptions } from './IconImageFactory';

export interface IconProviderOptions {
  width?: number;
  height?: number;
  strokeWidth?: number;
  fill?: string;
  stroke?: string;
}

export enum IconProviderShapes {
  CIRCLE = 'circle',
  TARGET = 'target',
  TRIANGLE = 'triangle',
  RECTANGLE = 'rectangle',
  SHIP = 'ship',
  PLANE = 'plane',
  HEART = 'heart',
  CROSS = 'cross',
  POI = 'poi',
  GRADIENTCIRCLE = 'gradient-circle',
}

type CanvasProviderFunction = (
  options: IconImageFactoryOptions
) => HTMLCanvasElement;

class IconProvider {
  public icons: any;

  constructor() {
    this.icons = {};
    this.registerIcon(
      IconProviderShapes.CIRCLE,
      'Circle',
      IconImageFactory.ellipse,
      { width: 12, height: 12 }
    );
    this.registerIcon(
      IconProviderShapes.TARGET,
      'Target',
      IconImageFactory.target,
      { width: 64, height: 64 }
    );
    this.registerIcon(
      IconProviderShapes.TRIANGLE,
      'Triangle',
      IconImageFactory.triangle,
      { width: 24, height: 24 }
    );
    this.registerIcon(
      IconProviderShapes.RECTANGLE,
      'Rectangle',
      IconImageFactory.rectangle,
      { width: 24, height: 24 }
    );
    this.registerIcon(IconProviderShapes.SHIP, 'Ship', IconImageFactory.ship, {
      width: 12,
      height: 24,
    });
    this.registerIcon(
      IconProviderShapes.PLANE,
      'Plane',
      IconImageFactory.plane,
      { width: 32, height: 32 }
    );
    this.registerIcon(
      IconProviderShapes.HEART,
      'Heart',
      IconImageFactory.heart,
      { width: 24, height: 24 }
    );
    this.registerIcon(
      IconProviderShapes.CROSS,
      'Cross',
      IconImageFactory.cross,
      { width: 24, height: 24 }
    );
    this.registerIcon(IconProviderShapes.POI, 'POI', IconImageFactory.poi, {
      width: 20,
      height: 32,
    });
    this.registerIcon(
      IconProviderShapes.GRADIENTCIRCLE,
      'Gradient Circle',
      IconImageFactory.gradientCircle,
      { width: 20, height: 20 }
    );
  }

  public listIcons() {
    const list = [];
    for (const key in this.icons) {
      if (this.icons.hasOwnProperty(key)) {
        list.push(this.icons[key]);
      }
    }
    return list;
  }

  public listNames() {
    return this.listIcons().map((icon) => {
      return icon.name;
    });
  }

  public listLabels() {
    return this.listIcons().map((icon) => {
      return icon.label;
    });
  }

  public listOptions() {
    return this.listIcons().map((icon) => {
      return { label: icon.label, value: icon.name };
    });
  }

  public getIcons() {
    return this.icons;
  }

  public iconExists(name: string) {
    const icon = this.icons[name];
    if (typeof icon !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  public getPainterByName(name: string) {
    if (this.iconExists(name)) {
      return this.icons[name].canvasProvider;
    } else {
      const i = 'circle';
      return this.icons[i].canvasProvider;
    }
  }

  public getOptionsByName(name: string) {
    if (this.iconExists(name)) {
      return this.icons[name].options;
    } else {
      const i = 'circle';
      return this.icons[i].options;
    }
  }

  public paintIconByName(
    name: string,
    options: IconProviderOptions
  ): HTMLCanvasElement {
    const iconPainter = this.getPainterByName(name);
    return iconPainter(options);
  }

  public getIconByindex(index: number) {
    const list = this.listIcons();
    if (index < list.length) {
      return list[index];
    } else {
      return list[0];
    }
  }

  private registerIcon(
    name: IconProviderShapes,
    label: string,
    canvasProvider: CanvasProviderFunction,
    options: any
  ) {
    const newIcon = {
      label,
      name,
      options,
      canvasProvider,
    };
    this.icons[name] = newIcon;
  }
}

export default new IconProvider();
