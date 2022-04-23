import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./list")
);

const NewDeal = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./new_deal")
);

const EditDeal = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./edit_deal")
);

const ShowDeal = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./show")
);

const PagesDeal = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <DataList {...props} />}
        />
        <Route
          path={`${match.url}/new_deal`}
          render={(props) => <NewDeal {...props} />}
        />
        <Route
          path={`${match.url}/edit_deal/:id`}
          render={(props) => <EditDeal {...props} />}
        />
        <Route
          path={`${match.url}/show/:id`}
          render={(props) => <ShowDeal {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesDeal;
