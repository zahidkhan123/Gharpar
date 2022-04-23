import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
const DataList = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./list")
);

const ServiceCategoryShow = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./show")
);

const ServicesListPage = React.lazy(() =>
  import(/* webpackChunkName: "service_categories-data-list" */ "./services")
);

const NewServiceCategory = React.lazy(() =>
  import(
    /* webpackChunkName: "service_categories-data-list" */ "./new_service_category"
  )
);

const NewService = React.lazy(() =>
  import(
    /* webpackChunkName: "service_categories-data-list" */ "./new_service_v2"
  )
);

const EditServiceCategory = React.lazy(() =>
  import(
    /* webpackChunkName: "service_categories-data-list" */ "./edit_service_category"
  )
);

const EditService = React.lazy(() =>
  import(
    /* webpackChunkName: "service_categories-data-list" */ "./edit_service"
  )
);

const PagesCity = ({ match }) => {
  console.log("match.url: " + match.url);
  return (
    <Suspense fallback={<div />}>
      <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
        <Route
          path={`${match.url}/list`}
          render={(props) => <DataList {...props} />}
        />
        <Route
          path={`${match.url}/new_service_category`}
          render={(props) => <NewServiceCategory {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:id/edit_service_category`}
          render={(props) => <EditServiceCategory {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:id/new_service_v2`}
          render={(props) => <NewService {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:id/services/:service_id/edit_service`}
          render={(props) => <EditService {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:id/new_sub_category`}
          render={(props) => <NewServiceCategory {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:id`}
          render={(props) => <ServiceCategoryShow {...props} />}
        />
        <Route
          exact
          path={`${match.url}/:id/services`}
          render={(props) => <ServicesListPage {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesCity;
