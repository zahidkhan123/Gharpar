import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
const DataList = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./list")
);

const NewCoupon = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./new_coupon")
);

const EditCoupon = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./edit_coupon")
);

const ShowCoupon = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./show")
);

const PagesCoupon = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <DataList {...props} />}
        />
        <Route
          path={`${match.url}/new_coupon`}
          render={(props) => <NewCoupon {...props} />}
        />
        <Route
          path={`${match.url}/edit_coupon/:id`}
          render={(props) => <EditCoupon {...props} />}
        />
        <Route
          path={`${match.url}/show/:id`}
          render={(props) => <ShowCoupon {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesCoupon;
