import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { configureStore } from "./redux/store";
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn:
    "https://88515b751e72466da939631c1820c088@o399955.ingest.sentry.io/5257825",
});
const App = React.lazy(() => import(/* webpackChunkName: "App" */ "./App"));

ReactDOM.render(
  <Provider store={configureStore()}>
    {/* <Suspense fallback={<div className="loading" />}> */}
    <Suspense fallback={<div />}>
      <App />
    </Suspense>
  </Provider>,
  document.getElementById("root")
);
/*
 * If you want your app to work offline and load faster, you can change
 * unregister() to register() below. Note this comes with some pitfalls.
 * Learn more about service workers: https://bit.ly/CRA-PWA
 */
serviceWorker.unregister();
