import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

const DataList = React.lazy(() =>
    import(/* webpackChunkName: "service_categories-data-list" */ "./list")
);

const Referrals = React.lazy(() =>
    import(/* webpackChunkName: "service_categories-data-list" */ "./referrals")
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
                    path={`${match.url}/referrals`}
                    render={(props) => <Referrals {...props} />}
                />
                <Redirect to="/error" />
            </Switch>
        </Suspense>
    );
};
export default PagesOrder;
