import React from "react";
import ReactDOM from "react-dom";
import RiuxApp from "./components/RiuxApp";
import "./index.scss";
import {Provider} from "react-redux";
import {store} from "./reduxboilerplate/store";

const renderApp = () => {
    ReactDOM.render((
        <Provider store={store}>
            <RiuxApp/>
        </Provider>
    ), document.getElementById("root"));
};

renderApp();
