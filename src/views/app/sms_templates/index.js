import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
  import(/* webpackChunkName: "cities-data-list" */ "./list")
);
const EditSMSTemplate = React.lazy(() =>
  import(/* webpackChunkName: "clients-data-list" */ "./edit_sms_template")
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
          render={(props) => <EditSMSTemplate {...props} />}
        />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
};
export default PagesSetting;
