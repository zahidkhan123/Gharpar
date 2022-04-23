import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);
const EditGift = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_gift")
);
const NewGift = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./create_gift")
);

const UsageList = React.lazy(() =>
    import(/* webpackChunkName: "clients-data-list" */ "./usage_list")
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
          render={(props) => <EditGift {...props} />}
        />
        <Route
          path={`${match.url}/create_gift`}
          render={(props) => <NewGift {...props} />}
        />
        <Route
            path={`${match.url}/usage_list/:id`}
            render={(props) => <UsageList {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
