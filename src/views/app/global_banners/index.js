import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);
const CREATE_GLOBAL_BANNER = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./create_global_banner")
);
const EDIT_GLOBAL_BANNER = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./edit_global_banner")
);

const PagesSetting = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <DataList {...props} />}
        />
        <Route
          path={`${match.url}/edit_banner/:id`}
          render={(props) => <EDIT_GLOBAL_BANNER {...props} />}
        />
        <Route
          path={`${match.url}/create_banner`}
          render={(props) => <CREATE_GLOBAL_BANNER {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
