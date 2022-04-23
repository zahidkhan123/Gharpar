import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const UsersList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);

const NewUser = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./new_user")
);

const EditUser = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./edit_user")
);

const Show = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./show")
);

const User = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <UsersList {...props} />}
        />
        <Route
          path={`${match.url}/new`}
          render={(props) => <NewUser {...props} />}
        />
        <Route
          path={`${match.url}/edit/:id`}
          render={(props) => <EditUser {...props} />}
        />
        <Route
          path={`${match.url}/show/:id`}
          render={(props) => <Show {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default User;
