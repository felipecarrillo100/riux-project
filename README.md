# The RIUX project

## Description
The RIUX project provides the RIUX-core.  This is a set of React Components that facilitate the creation of a Map Centric Geospatial Application based on LuciadRIA 2020 or higher

The Main React Components are:

* LuciadMap:  a 2D/3D Capable map based on WebGL  
* Workspace: a space to holde your Map and other components such as Scale Indicator, MousePosition Indicator, Zoom controls.
* Desktop: A component capable to host a workspace and draggable windows.


To facilitate the development It also provide a Redux Boilerplate

## To build
Install apache ant version 10 or higher. Then run the task "build" 
```
ant build
```
Ant wilt create an npm package "riux-x.x.x.tgz" file that you can install directly in your project or deploy it in an npm repository

## To use

To use the library in a new project simply import the library as you import any another NPM library.
The main requirements of your project is ES6 and loaders  for CSS/SCSS and images PNG/SVG and fonts.


```
npm install riux
``` 

Before you start you need to configure the stlying.  Create a style.scss file and import the riux styling dependenciens.

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

If you prefer a more modular approach you can directly import the modyles from the full path:
```
import Desktop from "riux/lib/components/desktop/Desktop";
```



Now you are ready to use the RIUX components in your library.

### Redux 
Redux is optional but you will require to use Redux to take the full advantage of RIUX.
The architechture based on commands depends on Redux to pass the command from one UI element to another in an efficient way.
If for some reason you prefer not to use Redux you could still pass the commands as PROPS.


RIUX provides an easy to use and easy to extend REDUX boiler plate.
 

