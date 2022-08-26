# [Maritimo](https://maritimo.digital/) &middot; Frontend

Frontend is a React javascript application used primarily to plot AIS object data into a map.

It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Requirements

- Node
- Npm

## Configuration

Configuration is done via an [environment configuration file](https://create-react-app.dev/docs/adding-custom-environment-variables/#adding-development-environment-variables-in-env), containing the following variables:

| Name                                   | Description                                                  |
| -------------------------------------- | ------------------------------------------------------------ |
| REACT_APP_WEB_API_URL                  | URL for the REST API endpoint for the latest AIS information |
| REACT_APP_TRANSMITTER_HUB_URL          | URL for the transmitter hub endpoint                         |
| REACT_APP_PHOTOS_URL                   | URL for the photos endpoint                                  |
| REACT_APP_MAP_OBJECT_LIFESPAN_HOURS    | Object lifespan in hours                                     |
| REACT_APP_MAP_INITIAL_CENTER_LATITUDE  | Map's initial latitude                                       |
| REACT_APP_MAP_INITIAL_CENTER_LONGITUDE | Map's initial longitude                                      |
| REACT_APP_MAP_INITIAL_ZOOM             | Map's initial zoom level                                     |
| REACT_APP_MAP_MAX_ZOOM                 | Map's maximum zoom level                                     |

Check an example configuration file in [.env.development](.env.development).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

### `npm css-build`

Builds the src/styles.css file using sass/styles.scss instructions.

### `npm css-watch`

Watches for changes in the sass/styles.scss file and rebuilds the src/styles.css file when there are modifications available.
