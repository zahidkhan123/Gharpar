import React, { Component, Suspense } from "react";
import { connect } from "react-redux";
import Dashboard from "./views/dashboard";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { IntlProvider } from "react-intl";
import "./helpers/Firebase";
import AppLocale from "./lang";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import NotificationContainer from "./components/common/react-notifications/NotificationContainer";
import { getDirection } from "./helpers/Utils";
const ViewMain = React.lazy(() =>
  import(/* webpackChunkName: "views" */ "./views")
);

const ViewApp = React.lazy(() =>
  import(/* webpackChunkName: "views-app" */ "./views/app")
);

const ViewUser = React.lazy(() =>
  import(/* webpackChunkName: "views-user" */ "./views/user")
);

const ViewError = React.lazy(() =>
  import(/* webpackChunkName: "views-error" */ "./views/error")
);

const Download = React.lazy(() =>
  import(/* webpackChunkName: "views-error" */ "./download")
);

const LoyaltyProgram = React.lazy(() =>
  import(/* webpackChunkName: "views-error" */ "./loyalty_program")
);

const AuthRoute = ({ component: Component, authUser, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        localStorage.getItem("auth_token") !== null &&
        localStorage.getItem("auth_token") !== "undefined" &&
        localStorage.getItem("auth_token").length > 0 ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/user/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      user: {},
    };
    const direction = getDirection();
    if (direction.isRtl) {
      document.body.classList.add("rtl");
      document.body.classList.remove("ltr");
    } else {
      document.body.classList.add("ltr");
      document.body.classList.remove("rtl");
    }
  }

  render() {
    const { locale, loginUser } = this.props;
    const currentAppLocale = AppLocale[locale];

    return (
      <div className="h-100">
        <IntlProvider
          locale={currentAppLocale.locale}
          messages={currentAppLocale.messages}
        >
          <React.Fragment>
            <NotificationContainer />
            {/* {isMultiColorActive && <ColorSwitcher />} */}
            <Suspense
              fallback={
                <div
                //
                />
              }
            >
              <Router>
                <Switch>
                  <AuthRoute
                    path="/app"
                    authUser={loginUser}
                    component={ViewApp}
                  />
                  <Route
                    path="/user"
                    render={(props) => <ViewUser {...props} />}
                  />
                  <Route
                    path="/error"
                    exact
                    render={(props) => <ViewError {...props} />}
                  />
                  <Route
                    path="/"
                    exact
                    render={(props) => <ViewMain {...props} />}
                  />
                  <Route
                    path="/download"
                    exact
                    render={(props) => <Download {...props} />}
                  />
                  <Route
                    path="/loyalty_program"
                    exact
                    render={(props) => <LoyaltyProgram {...props} />}
                  />
                  <Redirect to="/error" />
                </Switch>
                <Route path="/dashboard" component={Dashboard} />
              </Router>
            </Suspense>
          </React.Fragment>
        </IntlProvider>
      </div>
    );
  }
}

const mapStateToProps = ({ authUser, settings }) => {
  const { user: loginUser } = authUser;
  const { locale } = settings;
  return { loginUser, locale };
};
const mapActionsToProps = {};

export default connect(mapStateToProps, mapActionsToProps)(App);
