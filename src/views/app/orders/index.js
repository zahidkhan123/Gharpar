import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./list")
);
const EditOrder = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./edit_order")
);
const ChangeAddress = React.lazy(() =>
  import(
    /* webpackChunkName: "service_categories-data-list" */ "./change_address"
  )
);
// const ShowOrder = React.lazy(() =>
//   import(/* webpackChunkName: "service_categories-data-list" */ "./show")
// );
// const OrderSummary = React.lazy(() =>
//   import(
//     /* webpackChunkName: "service_categories-data-list" */ "./order_summary"
//   )
// );
const NewOrder = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./new_order")
);

const ShowOrder = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./show")
);

const PagesOrder = ({ match }) => {
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <DataList {...props} />}
        />
        <Route
          exact
          path={`${match.url}/new_order`}
          render={(props) => <NewOrder {...props} />}
        />
        <Route
          exact
          path={`${match.url}/edit_order/:id`}
          render={(props) => <EditOrder {...props} />}
        />
        <Route
          exact
          path={`${match.url}/change_address/:id/client/:client_id`}
          render={(props) => <ChangeAddress {...props} />}
        />
        {/* <Route
          path={`${match.url}/order_summary`}
          render={(props) => <OrderSummary {...props} />}
        /> */}
        {/* <Route
          exact
          path={`${match.url}/show/:id`}
          render={(props) => <ShowOrder {...props} />}
        /> */}
        <Route
          exact
          path={`${match.url}/show/:id`}
          render={(props) => <ShowOrder {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesOrder;
