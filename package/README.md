# The RIUX project

## Description
The RIUX project provides the RIUX-core.  This is a set of React Components that facilitate the creation of a Map Centric Geospatial Application with LuciadRIA. RIUX is customizable and easy to extend and can be integrated to your favorite frameworks such as React-Bootstrap and Material-UI.

The Main React Components are:

* LuciadMap a 2D/3D Capable map based on LuciadRIA WebGL Map  
* Workspace a space to hold your Map and other components such as Scale Indicator, MousePosition Indicator, Zoom controls.
* Desktop: A component capable to host a workspace and any sort of draggable windows.

To facilitate the development RIUX also provides a Redux Boilerplate


## To use

To use RIUX in a react project simply import it in your project as just any another NPM library. 
RIUX requires LuciadRIA, therefore your project must include a compatible version of LuciadRIA (v2020.0 or higher). 
Your webpak configuration will require loaders for ES6, CSS/SCSS, images PNG/SVG and fonts.


```
npm install riux
``` 

Before you start you need to configure the styling.  Create a style.scss file and import the riux styling dependenciens.

```
/* Import the Luciad FONTS, provides icons required byt the Layer Control */
@import '~riux/lib/fonts/luciad/font/style.css';

/* Import the variabled for the theme */
@import "~riux/lib/styles/variables";
/* Modify the theme variables to match your prefered colors */
@import "./theme/variables";  
/* Import the RIUX styling */
@import "~riux/lib/styles/riux";
``` 

In your react code import the desired components. Example:
```
import {Desktop, QuickTest, Workspace} from "riux";
```

If you prefer a more modular approach you can directly import the modules using the full path:
```
import Desktop from "riux/lib/components/desktop/Desktop";
```

Now you are ready to use the RIUX components in your library.

### Redux 
Redux is optional, but you will require using Redux to take the full advantage of RIUX.
The architecture based on command relay on Redux to pass the command from one UI element to another.
If for some reason you prefer not to use Redux you could still pass the commands as PROPS.


RIUX provides an easy to use and easy to extend REDUX boilerplate.


## Technical requirements.
* LuciadRIA 2020.0 or higher.
* RIUX is a full ES6 library.  You will require a ES6 capable transpiler such Babel or Typescrit.
* RIUX provides React Components, so it requires React installed.
* RIUX uses SCSS for flexible stlying, so you require a SCSS loader.
* A file loader for fonts and images.
* Optional but highly recommended: Redux.


