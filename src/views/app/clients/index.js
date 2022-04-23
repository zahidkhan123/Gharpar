import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
// const ClientsList = React.lazy(() =>
//   import(/* webpackChunkName: "clients-data-list" */ './list')
// );

const NewClient = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./new_client")
);

const EditClient = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_user")
);

const ShowClient = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./show")
);

const Clients = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./clients")
);

const Client = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <Clients {...props} />}
        />
        <Route
          path={`${match.url}/new_client`}
          render={(props) => <NewClient {...props} />}
        />
        <Route
          path={`${match.url}/edit/:id`}
          render={(props) => <EditClient {...props} />}
        />
        <Route
          path={`${match.url}/show/:id`}
          render={(props) => <ShowClient {...props} />}
        />
        {/* <Route
          path={`${match.url}/clients`}
          render={props => <Clients {...props} />}
        /> */}
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default Client;
