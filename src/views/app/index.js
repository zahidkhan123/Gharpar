import React, { Component, Suspense } from "react";
import { Route, withRouter, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Loader from "react-promise-loader";
import { usePromiseTracker } from "react-promise-tracker";
import AppLayout from "../../layout/AppLayout";

const Dashboards = React.lazy(() =>
  import(/* webpackChunkName: "dashboards" */ "./dashboards")
);
const Pages = React.lazy(() =>
  import(/* webpackChunkName: "pages" */ "./pages")
);
const Applications = React.lazy(() =>
  import(/* webpackChunkName: "applications" */ "./applications")
);
const City = React.lazy(() =>
  import(/* webpackChunkName: "pages-product" */ "./cities")
);
const ServiceCategory = React.lazy(() =>
  import(/* webpackChunkName: "service_categories" */ "./service_categories")
);
const Ui = React.lazy(() => import(/* webpackChunkName: "ui" */ "./ui"));
const Menu = React.lazy(() => import(/* webpackChunkName: "menu" */ "./menu"));
const BlankPage = React.lazy(() =>
  import(/* webpackChunkName: "blank-page" */ "./blank-page")
);
const Technicians = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./users")
);
const Deal = React.lazy(() => import(/* webpackChunkName: "menu" */ "./deals"));
const Client = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./clients")
);
const CSR = React.lazy(() => import(/* webpackChunkName: "menu" */ "./csr"));
const Order = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./orders")
);
const AddOn = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./addons")
);
const Scheduler = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./scheduler.js")
);
const Settings = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./settings")
);
const SMSTEMPLATES = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./sms_templates")
);
const SYSTEMSETTINGS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./system_settings")
);
const FEEDBACKS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./feedbacks")
);
const ANALYTICS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./analytics")
);
const ROLES = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./roles")
);
const COUPONS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./coupons")
);
const PRODUCT_CATEGORIES = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./product_categories")
);
const TOOLKITS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./toolkits")
);
const SHOPS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./shops")
);
const INVENTORIES = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./inventories")
);
const ASSIGNROLES = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./assign_roles")
);
const PUSHNOTIFICATIONS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./push_notifications")
);
const GLOBALBANNER = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./global_banners")
);
const GIFTHAMPERS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./gift_hampers")
);

const REFERRAL_ANALYTICS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./referral_analytics")
);
const DAILY_REPORTS_CSR = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./daily_reports_csr")
);
const DAILY_REPORTS_FINANCE = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./daily_reports_finance")
);

const DAILY_REPORTS_SALES = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./daily_reports_sales")
);

const SERVICE_BASED_REPORT = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./service_based_report")
);

const MONTHLY_REPORTS_CLIENT = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./monthly_reports_client")
);

const ACTIVITY_LOGS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./activity_logs")
);

const SERVICE_PRICES_REPORT = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./service_prices_report")
);

const TECHNICIAN_JOBS_REPORT = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./technician_jobs_report")
);

const COMPLAINTS = React.lazy(() =>
  import(/* webpackChunkName: "menu" */ "./complaints")
);

class App extends Component {
  render() {
    const { match } = this.props;
    let default_role = localStorage.getItem("user_default_role");
    return (
      <AppLayout>
        <div className="dashboard-wrapper">
          {/* <Suspense fallback={<div className="loading" />}> */}
          <Suspense
            fallback={
              <div
                style={{
                  position: "fixed",
                  top: "50%",
                  zIndex: "1",
                  left: "50%",
                }}
              >
                <Loader
                  promiseTracker={usePromiseTracker}
                  background="rgba(0, 0, 0, 0.5)"
                />
              </div>
            }
          >
            <Switch>
              {default_role === "CSR" ? (
                <Redirect
                  exact
                  from={`${match.url}/`}
                  to={`${match.url}/orders`}
                />
              ) : default_role === "TAM" ? (
                <Redirect
                  exact
                  from={`${match.url}/`}
                  to={`${match.url}/complaints`}
                />
              ) : (
                <Redirect
                  exact
                  from={`${match.url}/`}
                  to={`${match.url}/daily_reports_sales`}
                />
              )}

              <Route
                path={`${match.url}/dashboards`}
                render={(props) => <Dashboards {...props} />}
              />
              <Route
                path={`${match.url}/applications`}
                render={(props) => <Applications {...props} />}
              />
              <Route
                path={`${match.url}/pages`}
                render={(props) => <Pages {...props} />}
              />
              <Route
                path={`${match.url}/ui`}
                render={(props) => <Ui {...props} />}
              />
              <Route
                path={`${match.url}/menu`}
                render={(props) => <Menu {...props} />}
              />
              <Route
                path={`${match.url}/blank-page`}
                render={(props) => <BlankPage {...props} />}
              />
              <Route
                path={`${match.url}/cities`}
                render={(props) => <City {...props} />}
              />
              <Route
                path={`${match.url}/service_categories`}
                render={(props) => <ServiceCategory {...props} />}
              />
              <Route
                path={`${match.url}/technicians`}
                render={(props) => <Technicians {...props} />}
              />
              <Route
                path={`${match.url}/deals`}
                render={(props) => <Deal {...props} />}
              />
              <Route
                path={`${match.url}/clients`}
                render={(props) => <Client {...props} />}
              />
              <Route
                path={`${match.url}/csr`}
                render={(props) => <CSR {...props} />}
              />
              <Route
                path={`${match.url}/orders`}
                render={(props) => <Order {...props} />}
              />
              <Route
                path={`${match.url}/addons`}
                render={(props) => <AddOn {...props} />}
              />
              <Route
                path={`${match.url}/scheduler`}
                render={(props) => <Scheduler {...props} />}
              />
              <Route
                path={`${match.url}/settings`}
                render={(props) => <Settings {...props} />}
              />
              <Route
                path={`${match.url}/sms_templates`}
                render={(props) => <SMSTEMPLATES {...props} />}
              />
              <Route
                path={`${match.url}/system_settings`}
                render={(props) => <SYSTEMSETTINGS {...props} />}
              />
              <Route
                path={`${match.url}/feedbacks`}
                render={(props) => <FEEDBACKS {...props} />}
              />
              <Route
                path={`${match.url}/analytics`}
                render={(props) => <ANALYTICS {...props} />}
              />
              <Route
                path={`${match.url}/roles`}
                render={(props) => <ROLES {...props} />}
              />
              <Route
                path={`${match.url}/coupons`}
                render={(props) => <COUPONS {...props} />}
              />
              <Route
                path={`${match.url}/product_categories`}
                render={(props) => <PRODUCT_CATEGORIES {...props} />}
              />
              <Route
                path={`${match.url}/toolkits`}
                render={(props) => <TOOLKITS {...props} />}
              />
              <Route
                path={`${match.url}/shops`}
                render={(props) => <SHOPS {...props} />}
              />
              <Route
                path={`${match.url}/inventories`}
                render={(props) => <INVENTORIES {...props} />}
              />
              <Route
                path={`${match.url}/assign_role`}
                render={(props) => <ASSIGNROLES {...props} />}
              />
              <Route
                path={`${match.url}/push_notification`}
                render={(props) => <PUSHNOTIFICATIONS {...props} />}
              />
              <Route
                path={`${match.url}/global_banner`}
                render={(props) => <GLOBALBANNER {...props} />}
              />
              <Route
                path={`${match.url}/referral_analytics`}
                render={(props) => <REFERRAL_ANALYTICS {...props} />}
              />

              <Route
                path={`${match.url}/gift_hampers`}
                render={(props) => <GIFTHAMPERS {...props} />}
              />
              <Route
                path={`${match.url}/daily_reports_csr`}
                render={(props) => <DAILY_REPORTS_CSR {...props} />}
              />
              <Route
                path={`${match.url}/daily_reports_finance`}
                render={(props) => <DAILY_REPORTS_FINANCE {...props} />}
              />
              <Route
                path={`${match.url}/daily_reports_sales`}
                render={(props) => <DAILY_REPORTS_SALES {...props} />}
              />
              <Route
                path={`${match.url}/service_based_report`}
                render={(props) => <SERVICE_BASED_REPORT {...props} />}
              />
              <Route
                path={`${match.url}/activity_logs`}
                render={(props) => <ACTIVITY_LOGS {...props} />}
              />
              <Route
                path={`${match.url}/monthly_reports_client`}
                render={(props) => <MONTHLY_REPORTS_CLIENT {...props} />}
              />
              <Route
                path={`${match.url}/service_prices_report`}
                render={(props) => <SERVICE_PRICES_REPORT {...props} />}
              />
              <Route
                path={`${match.url}/technician_jobs_report`}
                render={(props) => <TECHNICIAN_JOBS_REPORT {...props} />}
              />
              <Route
                path={`${match.url}/complaints`}
                render={(props) => <COMPLAINTS {...props} />}
              />
              <Redirect to="/error" />
            </Switch>
          </Suspense>
        </div>
      </AppLayout>
    );
  }
}
const mapStateToProps = ({ menu }) => {
  const { containerClassnames } = menu;
  return { containerClassnames };
};

export default withRouter(connect(mapStateToProps, {})(App));
