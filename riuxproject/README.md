## How to install:
Clone it from Github

### Pre-Install (LuciadRIA from private npm repository) 
Make sure you have recent LuciadRIA packages available in a private npm repository. If you already have a private repository just make sure the LuciadRIA packages are available. Make sure your private npm, repository is reachavle from this npm project, you can achieve this by modifying your local or glabal .npmrc

If you currently don't have a private npm repository, you could deploy Verdaccio [https://www.npmjs.com/package/verdaccio](https://www.npmjs.com/package/verdaccio), a zero configuation and easy to use option. Then deploy your LuciadRIA packages in there. Check the verdaccio website for more info.

### Install dependencies
Intall all the project dependencies with npm
```
npm install
```

## To use
### Start development
```
npm start
```
Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### Build for production
```
npm run build
```
Builds the app for production to the `dist` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance. Minimize, uglyfy to a js file and splits all stlying to a separate css file.
