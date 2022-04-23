import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
const CSRList = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./list")
);

const NewCSR = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./new_user")
);

const EditCSR = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_user")
);

const ChangePassword = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./change_password")
);

const CSR = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <CSRList {...props} />}
        />
        <Route
          path={`${match.url}/new`}
          render={(props) => <NewCSR {...props} />}
        />
        <Route
          path={`${match.url}/edit/:id`}
          render={(props) => <EditCSR {...props} />}
        />
        <Route
          path={`${match.url}/change_password`}
          render={(props) => <ChangePassword {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default CSR;
