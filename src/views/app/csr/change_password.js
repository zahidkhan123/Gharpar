import React from "react";
import {
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Card,
  CardBody,
  Label,
} from "reactstrap";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class EditUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      role: [
        // { label: "Super Admin", value: "Super_admin" },
        // { label: "Admin", value: "Admin" },
        { label: "CSR", value: "CSR" },
      ],
      userObj: {},
      cities: [],
      all_cities_json: [],
      areas: [],
      city_areas_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
    };
  }

  // async componentDidMount() {
  //   let user_id = localStorage.getItem("user_id");
  //   // let user = await this.get_user(user_id);

  //   // localStorage.setItem("user_default_role", user.default_role);

  //   // this.setState({
  //   //   user: user,
  //   // });
  // }

  update_user = async (event) => {
    event.preventDefault();
    // let user_id = localStorage.getItem("user_id");
    let formData = new FormData(event.target);
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/users/change_password.json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Password Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/orders/list");
        } else {
          console.log(response);
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
  };

  get_user = async (user_id) => {
    let userObj = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/csrs/" + user_id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          userObj = response.data;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        if (
          error.response.data.message ===
          "Your session expired. Please login again."
        ) {
          localStorage.clear();
          this.props.history.push("/user/login");
        } else {
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
        }
      });
    return userObj;
  };

  render() {
    // const { userObj, role } = this.state;

    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.update_user}>
              <ModalHeader>Change Password</ModalHeader>

              <ModalBody>
                <Label className="mt-4">Current Password *</Label>
                <Input
                  className="form-control"
                  name="user[old_password]"
                  type="password"
                  defaultValue=""
                />

                <Label className="mt-4">New Password *</Label>
                <Input
                  className="form-control"
                  name="user[password]"
                  type="password"
                  defaultValue=""
                />
                <Label className="mt-4">Confirm Password *</Label>
                <Input
                  className="form-control"
                  name="user[password_confirmation]"
                  type="password"
                  defaultValue=""
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  color="secondary"
                  outline
                  type="button"
                  onClick={this.props.history.goBack}
                >
                  <IntlMessages id="pages.cancel" />
                </Button>
                <Button color="primary" type="submit">
                  <IntlMessages id="pages.submit" />
                </Button>
              </ModalFooter>
            </form>
          </CardBody>
        </Card>
      </Colxx>
    );
  }
}

export default EditUser;
