import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
const AddOnsList = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./list")
);

const PagesCity = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <AddOnsList {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesCity;