import React, { Component } from "react";
import {
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardTitle,
  Table,
  Input,
  Label,
  CustomInput,
} from "reactstrap";

import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import IntlMessages from "../../../helpers/IntlMessages";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";
const apiUrl = servicePath + "/api/v2/services.json";

class AddOnsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addons: [],
      addon_to_edit: {},
      modalOpen: false,
      edit_modal_open: false,
    };

    this.fetch_all_addons = this.fetch_all_addons.bind(this);
    this.render_addon_table_row = this.render_addon_table_row.bind(this);
    this.render_addons = this.render_addons.bind(this);
    this.render_top_nav = this.render_top_nav.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.create_addon = this.create_addon.bind(this);
    this.render_addon_create_modal = this.render_addon_create_modal.bind(this);
  }

  async componentDidMount() {
    let addons = await this.fetch_all_addons();

    this.setState({
      addons: addons,
    });
  }

  fetch_all_addons = async () => {
    let addons = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/services.json?is_addon=true",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          addons = response.data.addons;
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

    return addons;
  };

  render_addon_table_row = (addons) => {
    let addons_rows = [];
    addons.forEach((single_addon, index) => {
      addons_rows.push(
        <>
          <tr>
            <td>{index + 1}</td>
            <td>{single_addon.addon_title}</td>
            <td>{single_addon.addon_price}</td>
            <td>{single_addon.addon_duration + " Minutes"}</td>
            <td>
              <Button
                color="info"
                data-id={single_addon.id}
                onClick={async (event) => {
                  this.edit_addon(event, single_addon.id);
                }}
              >
                {" "}
                Edit{" "}
              </Button>
            </td>
            <td>
              <Button
                color="danger"
                data-id={single_addon.id}
                onClick={async (event) => {
                  this.delete_addon(event);
                }}
              >
                {" "}
                Remove{" "}
              </Button>
            </td>
          </tr>
        </>
      );
    });

    return addons_rows;
  };

  edit_addon = async (event, id) => {
    let response = await check_permission("services/update", "");
    if (response) {
      // let addon_id = event.target.dataset["id"];
      let addon_to_edit = await this.get_addon(id);
      this.setState({
        addon_to_edit: addon_to_edit,
        edit_modal_open: !this.state.edit_modal_open,
      });
    }
  };

  get_addon = async (addon_id) => {
    let addon = "";

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/services/" + addon_id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          addon = response.data;
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

    return addon;
  };

  delete_addon = async (event) => {
    event.preventDefault();
    let addon_elem = event.target;
    let addon_id = addon_elem.dataset["id"];

    await trackPromise(
      axios({
        method: "delete",
        url: servicePath + "/api/v2/services/" + addon_id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "AddOn deleted successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          let updated_addons_array = this.state.addons.filter(
            (single_addon) => single_addon.id !== parseInt(addon_id)
          );

          this.setState({
            addons: updated_addons_array,
          });
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

  render_addons = () => {
    const { addons } = this.state;

    let addons_html = [];

    addons_html.push(
      <>
        <Colxx xxs="12">
          <Card className="mb-4">
            <CardBody>
              <CardTitle>
                <IntlMessages id="AddOns" />
              </CardTitle>
              <Table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>{this.render_addon_table_row(addons)}</tbody>
              </Table>
            </CardBody>
          </Card>
        </Colxx>
      </>
    );

    return addons_html;
  };

  render_top_nav = () => {
    return (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1> Add Ons </h1>

              <div className="text-zero top-right-button-container">
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  onClick={this.toggleModal}
                >
                  <IntlMessages id="pages.add-new" />
                </Button>
              </div>
            </div>
            <Separator className="mb-5" />
          </Colxx>
        </Row>
      </>
    );
  };

  toggleModal = async () => {
    let response = await check_permission("services/create", "");
    if (response) {
      this.setState({
        modalOpen: !this.state.modalOpen,
      });
    }
  };

  toggle_edit_modal = () => {
    this.setState({
      edit_modal_open: !this.state.edit_modal_open,
    });
  };

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  create_addon = async (event) => {
    event.preventDefault();

    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url: apiUrl,
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "AddOn created successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.setState({
            addons: [response.data, ...this.state.addons],
            modalOpen: !this.state.modalOpen,
          });
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

  update_addon = async (event) => {
    event.preventDefault();
    const { addon_to_edit } = this.state;

    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/services/" + addon_to_edit.id + ".json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "AddOn updated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          let previous_addons = this.state.addons;
          let foundIndex = previous_addons.findIndex(
            (single_addon) => single_addon.id === response.data.id
          );
          previous_addons[foundIndex] = response.data;

          this.setState({
            addons: previous_addons,
            edit_modal_open: !this.state.edit_modal_open,
          });
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

  render_addon_create_modal = () => {
    const { modalOpen } = this.state;

    return (
      <>
        <Modal
          isOpen={modalOpen}
          toggle={this.toggleModal}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <form onSubmit={this.create_addon}>
            <ModalHeader>
              <IntlMessages id="Add New Add On" />
            </ModalHeader>

            <ModalBody>
              <Label className="mt-3">
                {" "}
                <IntlMessages id="Title*" />{" "}
              </Label>
              <Input
                className="form-control"
                name="service[service_title]"
                type="text"
                defaultValue=""
                required
              />

              <Label className="mt-3">
                {" "}
                <IntlMessages id="Duration*" />{" "}
              </Label>
              <Input
                className="form-control"
                name="service[service_duration]"
                type="number"
                defaultValue=""
                min="0"
                required
              />

              <CustomInput
                className="mt-4"
                type="checkbox"
                label="Active"
                defaultChecked={true}
                onChange={(event) => this.handleCheckChange(event)}
              />
              <Input hidden name="service[is_active]" defaultValue="true" />

              <Label className="mt-3">
                {" "}
                <IntlMessages id="Price*" />{" "}
              </Label>
              <Input
                className="form-control"
                name="service[addon_price]"
                type="number"
                defaultValue=""
                required
                min="0"
              />

              <Input hidden name="service[is_addon]" defaultValue="true" />
            </ModalBody>

            <ModalFooter>
              <Button
                color="secondary"
                outline
                onClick={this.toggleModal}
                type="button"
              >
                <IntlMessages id="pages.cancel" />
              </Button>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
  };

  render_addon_edit_modal = () => {
    const { edit_modal_open, addon_to_edit } = this.state;

    if (Object.keys(addon_to_edit).length === 0) {
      return <> </>;
    } else {
      return (
        <>
          <Modal
            isOpen={edit_modal_open}
            toggle={this.toggle_edit_modal}
            wrapClassName="modal-right"
            backdrop="static"
          >
            <form onSubmit={this.update_addon}>
              <ModalHeader>
                <IntlMessages id="Edit Add On" />
              </ModalHeader>

              <ModalBody>
                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Title*" />{" "}
                </Label>
                <Input
                  className="form-control"
                  name="service[service_title]"
                  type="text"
                  defaultValue={addon_to_edit.addon_title}
                />

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Duration*" />{" "}
                </Label>
                <Input
                  className="form-control"
                  name="service[service_duration]"
                  type="number"
                  defaultValue={addon_to_edit.addon_duration}
                  min="0"
                />

                <CustomInput
                  className="mt-4"
                  type="checkbox"
                  label="Active"
                  defaultChecked={addon_to_edit.is_active}
                  onChange={(event) => this.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[is_active]"
                  defaultValue={addon_to_edit.is_active}
                />

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Price*" />{" "}
                </Label>
                <Input
                  className="form-control"
                  name="service[addon_price]"
                  type="number"
                  defaultValue={addon_to_edit.addon_price}
                  min="0"
                />

                <Input hidden name="service[is_addon]" defaultValue="true" />
                {/* <Input hidden name="service[id]" defaultValue={addon_to_edit.id} /> */}
              </ModalBody>

              <ModalFooter>
                <Button
                  color="secondary"
                  outline
                  onClick={this.toggle_edit_modal}
                  type="button"
                >
                  <IntlMessages id="pages.cancel" />
                </Button>
                <Button color="primary" type="submit">
                  <IntlMessages id="pages.submit" />
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        </>
      );
    }
  };

  render() {
    const { addons } = this.state;

    if (Object.keys(addons).length === 0) {
      return (
        <>
          {this.render_top_nav()}
          {this.render_addon_create_modal()}
        </>
      );
    } else {
      return (
        <>
          {this.render_top_nav()}
          {this.render_addon_create_modal()}
          {this.render_addon_edit_modal()}
          {this.render_addons()}
        </>
      );
    }
  }
}
export default AddOnsList;
