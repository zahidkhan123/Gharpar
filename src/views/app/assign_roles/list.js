import React, { Component } from "react";

import {
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Table,
  Label,
  Input,
  CustomInput,
} from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      data: [],
      user_roles: [],
      rolemodalOpen: false,
      modalOpen: false,
    };
    this.updateUser = this.updateUser.bind(this);
  }

  async componentDidMount() {}

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Users</h1>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  search_client = async (event) => {
    event.preventDefault();
    let self = this;

    let phone = event.target.elements["phone"].value;

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/user_roles/search_user.json?" +
          "&phone=" +
          phone,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            data: response.data,
            user_roles: response.data.roles,
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
  };
  toggleModal = async (event, order) => {
    event.preventDefault();

    if (this.state.rolemodalOpen === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        rolemodalOpen: !this.state.rolemodalOpen,
      });
    } else {
      this.setState({
        rolemodalOpen: !this.state.rolemodalOpen,
      });
    }
  };
  updateUserModal = async (event, order) => {
    event.preventDefault();

    if (this.state.modalOpen === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        modalOpen: !this.state.modalOpen,
      });
    } else {
      this.setState({
        modalOpen: !this.state.modalOpen,
      });
    }
  };

  updateUser = async (event) => {
    event.preventDefault();

    let user_id = event.target.elements["user[id]"].value;
    let email = event.target.elements["user[email]"].value;
    let self = this;

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/user_roles/update_user.json",
        data: {
          id: user_id,
          email: email,
        },
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            data: response.data,
            user_roles: response.data.roles,
            modalOpen: !self.state.modalOpen,
          });
          NotificationManager.success(
            "User Details Updated",
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
          );
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

  handleCheckChange = async (event, value1, id) => {
    // let target = event.target;
    const { data } = this.state;
    let self = this;
    // if (target.checked) {
    //   value = true;
    // } else {
    //   value = false;
    // }
    let form_data = {
      user_id: data.id,
      role_id: id,
    };

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/user_roles.json",
        data: form_data,
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
            "Roles Updated Successfully",
            "",
            5000,
            () => {},
            null,
            "filled"
          );
          self.setState({
            user_roles: response.data.roles,
          });
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });
  };

  render_all_roles = (all_roles) => {
    let self = this;
    let single_role_html = [];
    all_roles.forEach((single_role) => {
      single_role_html.push(
        <td>
          {/* <label>{}</label> */}
          <CustomInput
            className="mt-2 ml-2"
            label={single_role.role_name}
            type="checkbox"
            checked={single_role.is_assigned}
            onChange={(event) =>
              self.handleCheckChange(
                event,
                single_role.is_assigned,
                single_role.id
              )
            }
          />
          {/* <Input hidden name="" defaultValue={permission.is_enabled} /> */}
        </td>
      );
    });
    return single_role_html;
  };

  render() {
    const {
      data,
      loader,
      modalOpen,
      rolemodalOpen,
      toggleModal,
      updateUserModal,
      user_roles,
    } = this.state;
    let self = this;
    // if (Object.keys(order_jobs).length === 0) {
    //   return <>{/* <div className="loading" /> */}</>;
    // } else {

    return (
      <div>
        {loader ? <>{/* <div className="loading" /> */}</> : <></>}
        {this.settings_heading()}
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.search_client} id="order-filter">
              <Row>
                <Colxx xxs="1">
                  <Label className="mt-2">
                    <strong>Search</strong>
                  </Label>
                </Colxx>
                <Colxx xxs="2">
                  <Input className="form-control" value="+92" disabled />
                </Colxx>
                <Colxx xxs="2">
                  <Input className="form-control" name="phone" required />
                </Colxx>
                <Colxx xxs="1">
                  <Input color="primary" size="sm" type="submit">
                    Submit
                  </Input>
                </Colxx>
              </Row>
            </form>
          </Colxx>
        </Row>
        <Colxx xxs="12">
          <Card className="mb-4">
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <th> Name </th>
                    <th> Phone </th>
                    <th> Email </th>
                    <th> User Roles </th>
                    <th> Action </th>
                  </tr>
                </thead>
                {data.length === 0 ? (
                  <></>
                ) : (
                  <>
                    <tbody>
                      <tr>
                        <td>
                          {data.first_name} {data.last_name}
                        </td>
                        <td>{data.phone} </td>
                        <td>{data.email} </td>
                        <td>{data.default_role} </td>
                        <td>
                          {data.email ? (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                onClick={(event) => self.toggleModal(event)}
                                className="btn-success mr-2"
                              >
                                {" "}
                                Assign Role{" "}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                onClick={(event) => self.updateUserModal(event)}
                                className="mr-2"
                              >
                                {" "}
                                Complete Profile{" "}
                              </Button>
                              <Button
                                size="sm"
                                color="success"
                                disabled
                                onClick={(event) => self.toggleModal(event)}
                                className="btn-success mr-2"
                              >
                                {" "}
                                Assign Role
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </>
                )}
              </Table>
            </CardBody>
          </Card>
        </Colxx>
        {data.length === 0 ? (
          <> </>
        ) : (
          <>
            <Modal
              isOpen={rolemodalOpen}
              toggle={toggleModal}
              wrapClassName="modal-right"
              backdrop="static"
            >
              <ModalBody>{this.render_all_roles(user_roles)}</ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  outline
                  onClick={this.toggleModal}
                  type="button"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
            <Modal
              isOpen={modalOpen}
              toggle={updateUserModal}
              wrapClassName="modal-right"
              backdrop="static"
            >
              <form onSubmit={this.updateUser}>
                <ModalBody>
                  <Label>Email *</Label>
                  <Input type="email" name="user[email]" required />
                  <Input
                    type="email"
                    name="user[id]"
                    value={data.id}
                    hidden
                    readOnly
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="secondary"
                    outline
                    // onClick={this.updateUserModal}
                    type="submit"
                  >
                    Submit
                  </Button>
                  <Button
                    color="secondary"
                    outline
                    onClick={(e) => this.updateUserModal(e)}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </form>
            </Modal>
          </>
        )}
      </div>
    );
  }
}
export default DataListPages;
