import React from "react";

import Mouse from "../../../../../resources/icons/mouse_pointer.svg"
import Ruler3D from "../../../../../resources/icons/3d-ruler.svg"
import Ruler from "../../../../../resources/icons/ruler.svg"
import Point from "../../../../../resources/icons/point.svg"
import Polygon from "../../../../../resources/icons/polygon.svg"
import Polyline from "../../../../../resources/icons/polyline.svg"
import Rectangle from "../../../../../resources/icons/rectangle.svg"
import Circle from "../../../../../resources/icons/circle.svg"
import SelectRectangle from "../../../../../resources/icons/select-rectangle.svg"
import SelectAll from "../../../../../resources/icons/select-all.svg"
import None from "../../../../../resources/icons/none.svg"
import Count from "../../../../../resources/icons/abacus.svg"
import CountSelected from "../../../../../resources/icons/abacus2.svg"
import Paste from "../../../../../resources/icons/paste.svg"

const IconSet = {
    "default": Mouse,
    "ruler2d": Ruler,
    "ruler3d": Ruler3D,
    "point": Point,
    "line": Polyline,
    "polygon": Polygon,
    "bounds": Rectangle,
    "circle": Circle,
    "paste": Paste,
    "all": SelectAll,
    "select": SelectRectangle,
    "none": None,
    "count": Count,
    "count-selected": CountSelected
}

type EditAndMeasureIcons = keyof typeof IconSet;

const styleContainer = {
    pointerEvents: "none",
    position: "relative",
    display: "inline-block",
    float: "left",
    width: "100%",
    height: "100%",
    padding: 0,
    margin: "auto",
    overflow: "hidden",
} as any;

const styleSVG = {
    pointerEvents: "none",
    backgroundColor: "transparent",
    verticalAlign: "middle",
    padding: 0,
    height: "100%",
    width: "70%",
    margin: "auto",
    lineHeight: "42px"
} as any;

export function EditAndMeasureIconProvider(iconName: EditAndMeasureIcons) {
    const icon = IconSet[iconName];
    if (icon !== "" ) {
        return (
            <div style={{ margin: "0 auto", width: "100%",padding: 0}}>
                <div style={styleContainer}>
                    <img src={icon} alt={iconName} style={styleSVG}/>
                </div>
            </div>
        )
    }
    return (
        <div style={{ margin: "0 auto", width: "100%", padding: 0}}>
            <div style={styleContainer}>
                <img src={IconSet["all"]} alt={iconName} style={styleSVG}/>
            </div>
        </div>
    )
}
