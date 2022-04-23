import React, { Component } from "react";

import {
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Label,
  Input,
} from "reactstrap";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import Select from "react-select";
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
      deleteConfirmationModal: false,
      users: [
        { label: "ALL_USERS", value: "all_users" },
        { label: "LAHORE_USERS", value: "lahore_users" },
        { label: "RAWALPINDI_USERS", value: "rawalpindi_users" },
        { label: "ISLAMABAD_USERS", value: "islamabad_users" },
        { label: "NO_ORDER_SINCE_1_MONTHS", value: "no_order_since_1_months" },
        { label: "NO_ORDER_SINCE_2_MONTHS", value: "no_order_since_2_months" },
        { label: "NO_ORDER_SINCE_3_MONTHS", value: "no_order_since_3_months" },
      ],
      areas_json: [],
    };
    this.push_notification = this.push_notification.bind(this);
  }

  async componentDidMount() {}

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Push Notification</h1>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  push_notification = async (event) => {
    event.preventDefault();
    let area_ids = [];
    if (
      event.target.elements["push_notification[area_ids]"] !== undefined &&
      event.target.elements["push_notification[area_ids]"].length
    ) {
      event.target.elements["push_notification[area_ids]"].forEach((area) => {
        area_ids.push(area.value);
      });
    }
    let form_data = {
      push_notification: {
        subject: event.target.elements["push_notification[subject]"].value,
        content: event.target.elements["push_notification[content]"].value,
        send_to: event.target.elements["push_notification[send_to]"].value,
        area_ids: area_ids,
      },
    };
    this.setState({
      data: form_data,
    });
    await this.toggleDeleteConfirmationModal(event);
  };

  submit_form = async () => {
    const { data } = this.state;
    let self = this;

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/push_notifications.json",
        data: data,
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
            "Push Notification sent successfully",
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
          );
          self.props.history.push("/app/push_notification/list");
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

  toggleDeleteConfirmationModal = async (event) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
      });
    } else {
      // if delete confirmed then, first call delete function for city
      if (event.target.classList.contains("delete-confirmed")) {
        this.submit_form();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
      });
    }
  };

  change_users = async (event) => {
    let value = event.value.split("_")[0];
    value = value.charAt(0).toUpperCase() + value.slice(1);
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let all_areas = [];
    let areas_json = [];
    let city_id = "";
    let success = false;
    let self = this;
    all_cities.map((single_city) => {
      if (value === single_city.city_name) {
        city_id = single_city.id;
        success = true;
      }
      return single_city;
    });
    if (success) {
      all_areas = await self.get_areas_by_city(city_id);
      areas_json = self.prepare_areas_json(all_areas);
      self.setState({
        areas_json: areas_json,
      });
    }
  };

  get_areas_by_city = async (city_id) => {
    let areas = [];
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/areas.json?city_id=" + city_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          areas = response.data;
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

    return areas;
  };

  prepare_areas_json = (all_areas) => {
    let areas_dropdown_data = [];
    if (all_areas !== undefined && all_areas.length) {
      all_areas.forEach(function (currentValue) {
        areas_dropdown_data.push({
          label: currentValue.area,
          value: currentValue.id,
          key: currentValue.id,
        });
      });
    }
    return areas_dropdown_data;
  };

  deleteConfirmation = (event) => {
    return (
      <Modal
        isOpen={this.state.deleteConfirmationModal}
        size="sm"
        toggle={this.toggleDeleteConfirmationModal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to send push notification to these users ?
        </ModalHeader>
        <ModalBody>
          <Button
            color="success"
            size="sm"
            onClick={(event) => this.toggleDeleteConfirmationModal(event)}
            className="btn-success mr-2 delete-confirmed"
          >
            {" "}
            Yes{" "}
          </Button>
          <Button
            size="sm"
            onClick={(event) => this.toggleDeleteConfirmationModal(event)}
            className="btn-success"
          >
            {" "}
            Cancel{" "}
          </Button>
        </ModalBody>
      </Modal>
    );
  };

  render() {
    const { users, areas_json } = this.state;
    let self = this;

    return (
      <div>
        {this.settings_heading()}
        {this.deleteConfirmation()}
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.push_notification} id="order-filter">
              <Row>
                <Colxx md="3"></Colxx>
                <Colxx md="6">
                  <Label className="mt-2">Subject*</Label>
                  <Input
                    className="form-control"
                    name="push_notification[subject]"
                    required
                  />
                  <Label className="mt-2">Content</Label>
                  <textarea
                    className="form-control"
                    name="push_notification[content]"
                    required
                  />
                  <Label className="mt-2"> Select Users</Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    onChange={(event) => self.change_users(event)}
                    name="push_notification[send_to]"
                    options={users}
                  />
                  {areas_json.length > 0 ? (
                    <>
                      <Label className="mt-2"> Select Areas</Label>
                      <Select
                        components={{ Input: CustomSelectInput }}
                        className="react-select"
                        isMulti
                        classNamePrefix="react-select"
                        name="push_notification[area_ids]"
                        options={areas_json}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                  {/* <Button
                    size="sm"
                    onClick={(event) =>
                      self.toggleDeleteConfirmationModal(event)
                    }
                    className="btn-success">
                    {" "}
                    Submit{" "}
                  </Button> */}
                  <Input
                    color="primary"
                    size="sm"
                    type="submit"
                    className="mt-4"
                  >
                    Submit
                  </Input>
                </Colxx>
              </Row>
            </form>
          </Colxx>
        </Row>
      </div>
    );
  }
}
export default DataListPages;
