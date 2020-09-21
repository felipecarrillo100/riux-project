import {
  FeaturePainter,
  PaintState,
} from '@luciad/ria/view/feature/FeaturePainter';
import { GeoCanvas } from '@luciad/ria/view/style/GeoCanvas';
import { Feature } from '@luciad/ria/model/feature/Feature';
import { Shape } from '@luciad/ria/shape/Shape';
import { Layer } from '@luciad/ria/view/Layer';
import { LabelCanvas } from '@luciad/ria/view/style/LabelCanvas';
import { Map } from '@luciad/ria/view/Map';
import { ShapeType } from '@luciad/ria/shape/ShapeType';
import { PointLabelStyle } from '@luciad/ria/view/style/PointLabelStyle';
import { OnPathLabelStyle } from '@luciad/ria/view/style/OnPathLabelStyle';
import { InPathLabelStyle } from '@luciad/ria/view/style/InPathLabelStyle';
import { ShapeProvider } from '@luciad/ria/view/feature/ShapeProvider';
import { FeatureLayer } from '@luciad/ria/view/feature/FeatureLayer';
import IconProvider, {IconProviderShapes} from "../../utils/iconimagefactory/IconProvider";
import JSONTools from "../../utils/jsontools/JSONTools";

export const LineGeometries = [
  ShapeType.ARC,
  ShapeType.CIRCULAR_ARC,
  ShapeType.CIRCULAR_ARC_BY_3_POINTS,
  ShapeType.CIRCULAR_ARC_BY_BULGE,
  ShapeType.CIRCULAR_ARC_BY_CENTER_POINT,
  ShapeType.POLYLINE,
];

const VALID_LINESTYLES = [
  'solid',
  'dotted',
  'dash',
  'dash_small',
  'dash_large',
];

interface CustomizePointStyleOptions {
  url?: string;
  image?: any;
  width?: number;
  height?: number;
}

class SimpleFeaturePainter extends FeaturePainter {
  public painterSettings: any;
  public style = {} as any;
  public static validLineStyles = VALID_LINESTYLES;
  protected shapeProvider: ShapeProvider | undefined;

  public static defaultSettings(): any {
    const defaults = {
      commons: {
        balloon: false,
        heatmap: {
          enabled: false,
          maximum: 20,
        },
      },
      default: {
        labelStyle: {
          background: {
            fill: {
              color: 'rgba(138, 200, 255, 0)',
            },
            stroke: {
              color: 'rgba(138, 200, 255, 0)',
            },
          },
          case: 'none',
          font: {
            bold: true,
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '14px',
            italic: false,
            underline: false,
          },
          labelProperty: '',
          stroke: {
            color: 'rgba(0,255,255,1)',
          },
        },
        lineStyle: {
          draped: true,
          stroke: {
            color: 'rgb(138, 200, 255)',
            dashIndex: 'solid',
            width: 2,
          },
        },
        pointStyle: {
          draped: false,
          fill: {
            color: 'rgba(255,251,251,0.8)',
          },
          heading: {
            default: '',
            property: '',
            scale: 1,
          },
          shape: IconProviderShapes.GRADIENTCIRCLE,
          size: {
            height: 24,
            width: 24,
          },
          anchorX: '50%',
          anchorY: '50%',
          stroke: {
            color: 'rgb(29,74,118)',
            width: 1,
          },
          url: '',
        },
        shapeStyle: {
          fill: {
            color: 'rgba(255, 0, 0, 0.6)',
          },
          stroke: {
            color: 'rgb(255, 255, 0)',
            dashIndex: 'solid',
            width: 2,
          },
        },
      },
      painterType: 'AbstractPainter',
      selected: {
        labelStyle: {
          background: {
            fill: {
              color: 'rgba(138, 200, 255, 0.8)',
            },
            stroke: {
              color: 'rgba(138, 200, 255, 0.8)',
            },
          },
          case: 'none',
          color: 'rgba(0,0,255,1)',
          font: {
            bold: true,
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '14px',
            italic: false,
            underline: false,
          },
          labelProperty: '',
          stroke: {
            color: 'rgba(0,255,255,1)',
          },
        },
        lineStyle: {
          draped: true,
          stroke: {
            color: 'rgb(0, 128, 256)',
            dashIndex: 'solid',
            width: 2,
          },
        },
        pointStyle: {
          draped: false,
          fill: {
            color: 'rgba(245,240,241,0.8)',
          },
          heading: {
            default: '',
            property: '',
            scale: 1,
          },
          shape: IconProviderShapes.GRADIENTCIRCLE,
          size: {
            height: 24,
            width: 24,
          },
          anchorX: '50%',
          anchorY: '50%',
          stroke: {
            color: 'rgb(167,27,23)',
            width: 1,
          },
          url: '',
        },
        shapeStyle: {
          fill: {
            color: 'rgba(0, 255, 0, 0.6)',
          },
          stroke: {
            color: 'rgb(255, 255, 255)',
            dashIndex: 'solid',
            width: 2,
          },
        },
      },
    };
    return defaults;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options?: any) {
    super();
    this.changePainterSettings(
      options ? options : SimpleFeaturePainter.defaultSettings()
    );
  }

  public changePainterSettings(painterSettings: any) {
    this.painterSettings = painterSettings;

    this.style = {
      default: {},
      selected: {},
    };

    this.style.default.labelStyle = {
      ...this.painterSettings.default.labelStyle,
    };
    this.style.selected.labelStyle = {
      ...this.painterSettings.selected.labelStyle,
    };
    this.style.default.pointStyle = {
      ...this.painterSettings.default.pointStyle,
    };
    this.style.selected.pointStyle = {
      ...this.painterSettings.selected.pointStyle,
    };

    const IconShapeWhenDefault = IconProvider.getPainterByName(
      painterSettings.default.pointStyle.shape
    );
    const IconShapeWhenSelected = IconProvider.getPainterByName(
      painterSettings.selected.pointStyle.shape
    );

    this.style.default.pinImage = IconShapeWhenDefault({
      fill: painterSettings.default.pointStyle.fill.color,
      height: painterSettings.default.pointStyle.size.height,
      stroke: painterSettings.default.pointStyle.stroke.color,
      strokeWidth: 2,
      width: painterSettings.default.pointStyle.size.width,
    });

    this.style.selected.pinImage = IconShapeWhenSelected({
      fill: painterSettings.selected.pointStyle.fill.color,
      height: painterSettings.selected.pointStyle.size.height,
      stroke: painterSettings.selected.pointStyle.stroke.color,
      strokeWidth: 2,
      width: painterSettings.selected.pointStyle.size.width,
    });

    this.style.default.shapeStyle = {
      ...painterSettings.default.shapeStyle,
    };
    this.style.default.shapeStyle.stroke.dash = this.produceDash(
      this.style.default.shapeStyle.stroke.dashIndex
    );
    if (Number(painterSettings.default.shapeStyle.stroke.width) === 0) {
      this.style.default.shapeStyle.stroke = null;
    }

    this.style.selected.shapeStyle = {
      ...painterSettings.selected.shapeStyle,
    };
    this.style.selected.shapeStyle.stroke.dash = this.produceDash(
      this.style.selected.shapeStyle.stroke.dashIndex
    );
    if (Number(painterSettings.selected.shapeStyle.stroke.width) === 0) {
      this.style.selected.shapeStyle.stroke = null;
    }

    this.style.default.lineStyle = {
      ...painterSettings.default.lineStyle,
    };
    this.style.default.lineStyle.stroke.dash = this.produceDash(
      this.style.default.lineStyle.stroke.dashIndex
    );
    if (Number(painterSettings.default.lineStyle.stroke.width) === 0) {
      this.style.default.lineStyle.stroke = null;
    }

    this.style.selected.lineStyle = {
      ...painterSettings.selected.lineStyle,
    };
    this.style.selected.lineStyle.stroke.dash = this.produceDash(
      this.style.selected.lineStyle.stroke.dashIndex
    );
    if (Number(painterSettings.selected.lineStyle.stroke.width) === 0) {
      this.style.selected.lineStyle.stroke = null;
    }
  }

  public produceDash(dashName: string) {
    let dash;
    switch (dashName) {
      case 'solid':
        dash = undefined;
        break;
      case 'dotted':
        dash = [1, 2];
        break;
      case 'dash':
        dash = [8, 2];
        break;
      case 'dash_small':
        dash = [5, 2];
        break;
      case 'dash_large':
        dash = [15];
        break;
    }
    return dash;
  }

  paintBody(
    geoCanvas: GeoCanvas,
    feature: Feature,
    shape: Shape,
    layer: Layer,
    map: Map,
    paintState: PaintState
  ) {
    let style;
    if (paintState.selected) {
      style = this.style.selected;
    } else {
      style = this.style.default;
    }
    if (shape.type === ShapeType.SHAPE_LIST) {
      const MyShape = shape as any;
      for (const geometry of MyShape.geometries) {
        this.paintBody(geoCanvas, feature, geometry, layer, map, paintState);
      }
    } else if (shape.type === ShapeType.POINT) {
      let heading;
      let scale = 1;
      if (
        style.pointStyle.heading.property &&
        style.pointStyle.heading.property !== ''
      ) {
        heading = JSONTools.getValue(
          feature.properties,
          style.pointStyle.heading.property
        );
        scale = style.pointStyle.heading.scale;
        if (heading) {
          heading = heading * scale;
        } else {
          if (style.pointStyle.heading.default !== '') {
            heading = Number(style.pointStyle.heading.default);
          }
        }
      } else {
        if (style.pointStyle.heading.default !== '') {
          heading = Number(style.pointStyle.heading.default);
        }
      }
      const finalPointStyle =
        typeof style.pointStyle.url !== 'undefined' &&
        style.pointStyle.url.trim() !== ''
          ? this.customizePointStyle(
              style.pointStyle,
              {
                url: style.pointStyle.url,
                width: style.pointStyle.size.width,
                height: style.pointStyle.size.height,
              },
              heading
            )
          : this.customizePointStyle(
              style.pointStyle,
              { image: style.pinImage },
              heading
            );
      geoCanvas.drawIcon(shape, finalPointStyle);
    } else if (LineGeometries.includes(shape.type)) {
      geoCanvas.drawShape(shape, style.lineStyle);
    } else {
      geoCanvas.drawShape(shape, style.shapeStyle);
    }
  }

  paintLabel(
    labelCanvas: LabelCanvas,
    feature: Feature,
    shape: Shape,
    layer: Layer,
    map: Map,
    paintState: PaintState
  ) {
    if (shape === null) {
      return;
    }
    let style;
    if (paintState.selected) {
      style = this.style.selected;
    } else {
      style = this.style.default;
    }
    const fontStyle = style.labelStyle.font;
    const defaultBorder = 5;
    if (
      style.labelStyle.labelProperty &&
      style.labelStyle.labelProperty !== ''
    ) {
      const label = JSONTools.getValue(
        feature.properties,
        style.labelStyle.labelProperty
      );
      if (label) {
        let cssStyle = 'color:' + style.labelStyle.stroke.color + ';';
        cssStyle +=
          'text-transform:' +
          style.labelStyle.case +
          ';' +
          'background-color:' +
          style.labelStyle.background.fill.color +
          ';padding:' +
          defaultBorder * 0.6 +
          'px ' +
          defaultBorder +
          'px ' +
          defaultBorder * 0.6 +
          'px ' +
          defaultBorder +
          'px; border:2px solid ' +
          style.labelStyle.background.stroke.color +
          '; border-radius:' +
          defaultBorder * 3 +
          'px; white-space: nowrap;';
        cssStyle +=
          'font:' +
          (fontStyle.italic ? 'italic ' : ' ') +
          (fontStyle.bold ? 'bold ' : ' ') +
          (fontStyle.fontSize + ' ') +
          (fontStyle.fontFamily + ';') +
          (fontStyle.underline ? 'text-decoration: underline;' : ''); // +
        //  "text-shadow: black 0px 0px 10px;";
        const labelHTML = '<span style="' + cssStyle + '">' + label + '</span>';
        if (shape.type === ShapeType.POINT) {
          if (shape.focusPoint) {
            labelCanvas.drawLabel(
              labelHTML,
              shape.focusPoint,
              {} as PointLabelStyle
            );
          }
        } else if (shape.type === ShapeType.POLYLINE) {
          labelCanvas.drawLabelOnPath(labelHTML, shape, {} as OnPathLabelStyle);
        } else {
          labelCanvas.drawLabelInPath(labelHTML, shape, {} as InPathLabelStyle);
        }
      }
    }
  }

  protected customizePointStyle(
    pointStyle: any,
    options: CustomizePointStyleOptions,
    heading: number
  ) {
    const style = JSON.parse(JSON.stringify(pointStyle));
    style.heading = heading;
    if (options.image) {
      const image = options.image;
      style.image = image;
      return style;
    } else {
      const imageUrl = options.url;
      style.url = imageUrl;
      style.height = '' + (options.height ? options.height : 32) + 'px';
      style.width = '' + (options.width ? options.width : 32) + 'px';
      return style;
    }
  }

  protected createShapeProvider() {
    this.shapeProvider = undefined;
  }

  public assigPainterToLayer(layer: FeatureLayer) {
    this.createShapeProvider();
    if (this.shapeProvider) {
      layer.shapeProvider = this.shapeProvider;
    }
    layer.painter = this;
  }
}

export default SimpleFeaturePainter;
