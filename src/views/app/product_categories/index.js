import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);
const EditProductCategory = React.lazy(() =>
  import(
    /* webpackChunkName: "clients-data-list" */ "./edit_product_categories"
  )
);
const NewProductCategory = React.lazy(() =>
  import(
    /* webpackChunkName: "clients-data-list" */ "./create_product_categories"
  )
);
const Products = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./products")
);
const NewProduct = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./create_products")
);
const EditProduct = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_products")
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
          path={`${match.url}/:id/products/:product_id/edit_product`}
          render={(props) => <EditProduct {...props} />}
        />
        <Route
          path={`${match.url}/edit/:id`}
          render={(props) => <EditProductCategory {...props} />}
        />
        <Route
          path={`${match.url}/create_product_category`}
          render={(props) => <NewProductCategory {...props} />}
        />
        <Route
          path={`${match.url}/:id/products`}
          render={(props) => <Products {...props} />}
        />
        <Route
          path={`${match.url}/:id/new_product`}
          render={(props) => <NewProduct {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
