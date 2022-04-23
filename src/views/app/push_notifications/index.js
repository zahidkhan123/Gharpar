import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);
const CREATE_PUSH_NOTIFICATION = React.lazy(() =>
  import(
    /* webpackChunkName: "cities-data-list" */ "./create_push_notification"
  )
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
        {/* <Route
          path={`${match.url}/edit/:id`}
          render={(props) => <EditSetting {...props} />}
        /> */}
        <Route
          path={`${match.url}/create_push_notification`}
          render={(props) => <CREATE_PUSH_NOTIFICATION {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
