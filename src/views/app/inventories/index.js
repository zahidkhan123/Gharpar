import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);
const EditInventory = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_inventory")
);
const NewInventory = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./create_inventory")
);
const ShowInventory = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./show_inventory")
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
          path={`${match.url}/edit/:id`}
          render={(props) => <EditInventory {...props} />}
        />
        <Route
          path={`${match.url}/create_inventory`}
          render={(props) => <NewInventory {...props} />}
        />
        <Route
          path={`${match.url}/show/:id`}
          render={(props) => <ShowInventory {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
