/* A polyfill for browsers that don't support ligatures. */
/* The script tag referring to this file must be placed before the ending body tag. */

/* To provide support for elements dynamically added, this script adds
   method 'icomoonLiga' to the window object. You can pass element references to this method.
*/
(function () {
    'use strict';
    function supportsProperty(p) {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            i,
            div = document.createElement('div'),
            ret = p in div.style;
        if (!ret) {
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (i = 0; i < prefixes.length; i += 1) {
                ret = prefixes[i] + p in div.style;
                if (ret) {
                    break;
                }
            }
        }
        return ret;
    }
    var icons;
    if (!supportsProperty('fontFeatureSettings')) {
        icons = {
            'undo': '&#xe965;',
            'ccw': '&#xe965;',
            'redo': '&#xe966;',
            'cw': '&#xe966;',
            'Redo': '&#xe900;',
            'Undo': '&#xe901;',
            'CaretLeft': '&#xe902;',
            'CaretUp': '&#xe903;',
            'CaretRight': '&#xe904;',
            'CaretDown': '&#xe905;',
            'ArrowLeft': '&#xe906;',
            'ArrowUp': '&#xe907;',
            'ArrowRight': '&#xe908;',
            'ArrowDown': '&#xe909;',
            'MoveLeft': '&#xe90a;',
            'MoveUp': '&#xe90b;',
            'MoveRight': '&#xe90c;',
            'MoveDown': '&#xe90d;',
            'ToLeft': '&#xe90e;',
            'ToTop': '&#xe90f;',
            'ToRight': '&#xe910;',
            'ToBottom': '&#xe911;',
            'Stop': '&#xe912;',
            'Pause': '&#xe913;',
            'Play': '&#xe914;',
            'DoubleCaretV': '&#xe915;',
            'DoubleCaretVI': '&#xe916;',
            'DoubleCaretH': '&#xe917;',
            'DoubleCaretHI': '&#xe918;',
            'Close': '&#xe919;',
            'Check': '&#xe91a;',
            'Plus': '&#xe91b;',
            'Minus': '&#xe91c;',
            'DrawPoint': '&#xe91d;',
            'Forbidden': '&#xe91e;',
            'OK': '&#xe91f;',
            'Info': '&#xe920;',
            'Error': '&#xe921;',
            'Unknown': '&#xe922;',
            'Warning': '&#xe923;',
            'Text': '&#xe924;',
            'DrawText': '&#xe925;',
            'Select': '&#xe926;',
            'Fit': '&#xe927;',
            'Selectable': '&#xe928;',
            'Cursor': '&#xe929;',
            'Hand': '&#xe92a;',
            'Lines': '&#xe92b;',
            'LineStyles': '&#xe92c;',
            'LineStroke': '&#xe92d;',
            'LineWidth': '&#xe92e;',
            'Upload': '&#xe92f;',
            'Download': '&#xe930;',
            'Grid': '&#xe931;',
            'BarChart': '&#xe932;',
            'LineChart': '&#xe933;',
            'Height': '&#xe934;',
            'HeightUp': '&#xe935;',
            'HeightDown': '&#xe936;',
            'Sun': '&#xe937;',
            'Search': '&#xe938;',
            'Edit': '&#xe939;',
            'FolderClosed': '&#xe95b;',
            'Folder': '&#xe93a;',
            'Copy': '&#xe93b;',
            'Delete': '&#xe93c;',
            'Locked': '&#xe93d;',
            'Unlocked': '&#xe93e;',
            'Label': '&#xe93f;',
            'Compare': '&#xe940;',
            'Visible': '&#xe941;',
            'FillColor': '&#xe942;',
            'Layer': '&#xe943;',
            'LayerProperties': '&#xe944;',
            'LineColor': '&#xe945;',
            'Location': '&#xe946;',
            'Center': '&#xe947;',
            'Longitude': '&#xe948;',
            'Latitude': '&#xe949;',
            'LongLat': '&#xe94a;',
            'World': '&#xe94b;',
            'Picture': '&#xe94c;',
            'Raster': '&#xe94d;',
            'Measure': '&#xe94e;',
            'Defense': '&#xe94f;',
            'Shapes': '&#xe950;',
            'Route': '&#xe951;',
            'Rectangle': '&#xe952;',
            'Hexagon': '&#xe953;',
            'RoutePim': '&#xe954;',
            'Save': '&#xe955;',
            'Table': '&#xe956;',
            'Dots': '&#xe957;',
            'LogoLuciad': '&#xe958;',
            'LogoHexagon': '&#xe959;',
          '0': 0
        };
        delete icons['0'];
        window.icomoonLiga = function (els) {
            var classes,
                el,
                i,
                innerHTML,
                key;
            els = els || document.getElementsByTagName('*');
            if (!els.length) {
                els = [els];
            }
            for (i = 0; ; i += 1) {
                el = els[i];
                if (!el) {
                    break;
                }
                classes = el.className;
                if (/lcdIcon/.test(classes)) {
                    innerHTML = el.innerHTML;
                    if (innerHTML && innerHTML.length > 1) {
                        for (key in icons) {
                            if (icons.hasOwnProperty(key)) {
                                innerHTML = innerHTML.replace(new RegExp(key, 'g'), icons[key]);
                            }
                        }
                        el.innerHTML = innerHTML;
                    }
                }
            }
        };
        window.icomoonLiga();
    }
}());
