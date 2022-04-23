import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);
const EditShop = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_shops")
);
const CreateShop = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./create_shops")
);
const ShopInventories = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./shop_inventories")
);
const CreateToolkitProduct = React.lazy(() =>
  import(
    /* webpackChunkName: "clients-data-list" */ "./create_toolkit_products"
  )
);
const EditToolkitProduct = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_toolkit_products")
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
          path={`${match.url}/:id/toolkit_products/:toolkit_id/edit_toolkit_product`}
          render={(props) => <EditToolkitProduct {...props} />}
        />
        <Route
          path={`${match.url}/edit/:id`}
          render={(props) => <EditShop {...props} />}
        />
        <Route
          path={`${match.url}/create_shop`}
          render={(props) => <CreateShop {...props} />}
        />
        <Route
          path={`${match.url}/:id/shop_inventories`}
          render={(props) => <ShopInventories {...props} />}
        />
        <Route
          path={`${match.url}/:id/new_toolkit_product`}
          render={(props) => <CreateToolkitProduct {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
