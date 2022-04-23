import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list_new")
);
const TechnicianRevenue = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./technician_revenue")
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
          path={`${match.url}/technician_revenue/:id`}
          render={(props) => <TechnicianRevenue {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
