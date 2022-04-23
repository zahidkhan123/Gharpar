import React, { Component } from "react";
import { Row, Card, CardTitle, Label, FormGroup, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { servicePath } from "../../constants/defaultValues";
import { loginUser } from "../../redux/actions";
import { NotificationManager } from "../../components/common/react-notifications";
import { Formik, Form, Field } from "formik";
import axios from "axios";
import { Colxx } from "../../components/common/CustomBootstrap";
import IntlMessages from "../../helpers/IntlMessages";
import { trackPromise } from "react-promise-tracker";
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      errors: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    if (
      localStorage.getItem("auth_token") !== null &&
      localStorage.getItem("auth_token") !== "undefined" &&
      localStorage.getItem("auth_token").length > 0
    ) {
      this.props.history.push("/app");
    }
  }

  onUserLogin = (values) => {
    if (!this.props.loading) {
      if (values.email !== "" && values.password !== "") {
        this.props.loginUser(values, this.props.history);
      }
    }
    return values;
  };

  validateEmail = (value) => {
    let error;
    if (!value) {
      error = "Please enter your email address";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = "Invalid email address";
    }
    return error;
  };

  validatePassword = (value) => {
    let error;
    if (!value) {
      error = "Please enter your password";
    } else if (value.length < 4) {
      error = "Value must be longer than 3 characters";
    }
    return error;
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
    return name;
  };

  handleSubmit(event) {
    event.preventDefault();
    const { email, password } = this.state;
    let device_token = "admin" + Date.now();
    trackPromise(
      axios.post(
        servicePath + "/api/v2/user_sessions.json",
        {
          user: {
            email: email,
            password: password,
          },
          user_session: {
            device_uuid: "xxxscsdvsdvsdv",
            device_type: "web",
            device_token: device_token,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    )
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("auth_token", response.data.user.auth_token);
          localStorage.setItem("user_id", response.data.user.id);
          localStorage.setItem(
            "user_default_role",
            response.data.user.default_role
          );
          localStorage.setItem(
            "user_first_name",
            response.data.user.first_name
          );
          localStorage.setItem("cities", JSON.stringify(response.data.cities));
          localStorage.setItem("user_last_name", response.data.user.last_name);
          if (response.data.role_permissions) {
            response.data.role_permissions.map((role_permission) => {
              var controller_name =
                role_permission[0].controller_name + "_permissions";
              localStorage.setItem(
                controller_name,
                JSON.stringify(role_permission)
              );
              return role_permission;
            });
          }
          this.props.history.push("/app");
          NotificationManager.success(
            "Login Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
        } else {
          this.setState({
            errors: [response.data.resp_message],
          });
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
        console.log("error", error);
      });
  }

  render() {
    const { password, email } = this.state;

    return (
      <Row className="h-100">
        <Colxx xxs="12" md="10" className="mx-auto my-auto">
          <Card className="auth-card">
            <div className="position-relative image-side ">
              <p className="text-white h2">GharPar Admin Panel</p>
              <p className="white mb-0">
                Please use your credentials to login.
                <br />
                If you are not a member, please{" "}
                <NavLink to={`/register`} className="white">
                  register
                </NavLink>
                .
              </p>
            </div>
            <div className="form-side">
              <NavLink to={`/`} className="white">
                <span className="logo-single" />
              </NavLink>
              <CardTitle className="mb-4">
                <IntlMessages id="user.login-title" />
              </CardTitle>

              <Formik>
                {({ errors, touched }) => (
                  <Form
                    className="av-tooltip tooltip-label-bottom"
                    onSubmit={this.handleSubmit}
                  >
                    <FormGroup className="form-group has-float-label">
                      <Label>
                        <IntlMessages id="user.email" />
                      </Label>
                      <Field
                        className="form-control"
                        name="email"
                        value={email}
                        onChange={this.handleChange}
                      />
                      {errors.email && touched.email && (
                        <div className="invalid-feedback d-block">
                          {errors.email}
                        </div>
                      )}
                    </FormGroup>
                    <FormGroup className="form-group has-float-label">
                      <Label>
                        <IntlMessages id="user.password" />
                      </Label>
                      <Field
                        className="form-control"
                        type="password"
                        name="password"
                        value={password}
                        onChange={this.handleChange}
                      />
                      {errors.password && touched.password && (
                        <div className="invalid-feedback d-block">
                          {errors.password}
                        </div>
                      )}
                    </FormGroup>
                    <div className="d-flex justify-content-between align-items-center">
                      {/* <NavLink to={`/user/forgot-password`}>
                        <IntlMessages id="user.forgot-password-question" />
                      </NavLink> */}
                      <Button
                        color="primary"
                        className={`btn-shadow btn-multiple-state ${
                          this.props.loading ? "show-spinner" : ""
                        }`}
                        size="lg"
                        type="submit"
                      >
                        <span className="spinner d-inline-block">
                          <span className="bounce1" />
                          <span className="bounce2" />
                          <span className="bounce3" />
                        </span>
                        <span className="label">
                          <IntlMessages id="user.login-button" />
                        </span>
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Card>
        </Colxx>
      </Row>
    );
  }
}
const mapStateToProps = ({ authUser }) => {
  const { user, loading, error } = authUser;
  return { user, loading, error };
};

export default connect(mapStateToProps, {
  loginUser,
})(Login);
