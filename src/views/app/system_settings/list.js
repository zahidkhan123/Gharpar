import React, { Component } from "react";

import { Row, Card, Table, CardBody } from "reactstrap";
import { Switch } from "element-react";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import axios from "axios";

import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/system_settings.json";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      displayMode: "list",

      selectedPageSize: 10,

      selectedOrderOption: { column: "title", label: "Product Name" },
      dropdownSplitOpen: false,
      modalOpen: false,
      currentPage: 1,
      totalItemCount: 0,
      totalPage: 1,
      search: "",
      selectedItems: [],
      lastChecked: null,
      isLoading: false,
      newCityName: "",

      userAction: "new",
      cityToEdit: "",

      deleteConfirmationModal: false,
      cityToDelete: "",

      areaAction: "areaModalOpen",
      areaModalOpen: false,
      targetCity: "",
    };
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;

    let url;
    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/system_settings.json?search_data=" +
        this.state.search;
    } else {
      url = apiUrl;
    }
    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.status === 200) {
        self.setState({
          selectedItems: response.data,
          totalItemCount: response.data.length,
        });
      } else {
        NotificationManager.error(
          "Record not found",
          "",
          3000,
          null,
          null,
          "filled"
        );
        // this.props.history.push("/app/cities/list");
      }
    });
  }

  activateSetting = async (event, setting, status, params) => {
    let data = {};
    if (params === "sms") {
      data = { is_sms_enabled: status };
    } else if (params === "deal") {
      data = { is_deal_enabled: status };
    } else if (params === "order") {
      data = { is_order_enabled: status };
    } else if (params === "server_under_maintenance") {
      data = { is_server_under_maintenance: status };
    }

    let self = this;
    await trackPromise(
      axios.put(
        servicePath + "/api/v2/system_settings/" + setting + ".json",
        {
          system_setting: data,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        }
      )
    )
      .then((response) => {
        if (response.status === 200) {
          self.dataListRender();
          if (status === true) {
            NotificationManager.success(
              "Activated Successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
          } else {
            NotificationManager.success(
              "Deactivated Successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
          }

          self.props.history.push("/app/system_settings/list");
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

  // render_single_row = (selectedItems) => {
  //   let setting_html = [];
  //   selectedItems.forEach(function (single_sms_template) {
  //     setting_html.push();
  //   });
  //   return setting_html;
  // };

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>System Settings</h1>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  render() {
    const { selectedItems } = this.state;

    return (
      <div>
        {this.settings_heading()}
        <Colxx xxs="12">
          <Card className="mb-4">
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>SMS</strong>
                    </td>
                    <td>
                      {/* <Link to={`edit/${single_sms_template.id}`}>
                        <Button className="btn-success mr-2"> Edit </Button>
                      </Link> */}
                      <Switch
                        value={selectedItems.is_sms_enabled}
                        onColor="#13ce66"
                        offColor="#ff4949"
                        onChange={(event) =>
                          this.activateSetting(
                            event,
                            selectedItems.id,
                            selectedItems.is_sms_enabled === true
                              ? false
                              : true,
                            "sms"
                          )
                        }
                      ></Switch>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Deal</strong>
                    </td>
                    <td>
                      {/* <Link to={`edit/${single_sms_template.id}`}>
                        <Button className="btn-success mr-2"> Edit </Button>
                      </Link> */}
                      <Switch
                        value={selectedItems.is_deal_enabled}
                        onColor="#13ce66"
                        offColor="#ff4949"
                        onChange={(event) =>
                          this.activateSetting(
                            event,
                            selectedItems.id,
                            selectedItems.is_deal_enabled === true
                              ? false
                              : true,
                            "deal"
                          )
                        }
                      ></Switch>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Order</strong>
                    </td>
                    <td>
                      {/* <Link to={`edit/${single_sms_template.id}`}>
                        <Button className="btn-success mr-2"> Edit </Button>
                      </Link> */}
                      <Switch
                        value={selectedItems.is_order_enabled}
                        onColor="#13ce66"
                        offColor="#ff4949"
                        onChange={(event) =>
                          this.activateSetting(
                            event,
                            selectedItems.id,
                            selectedItems.is_order_enabled === true
                              ? false
                              : true,
                            "order"
                          )
                        }
                      ></Switch>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Server Maintenance</strong>
                    </td>
                    <td>
                      <Switch
                        value={selectedItems.is_server_under_maintenance}
                        onColor="#13ce66"
                        offColor="#ff4949"
                        onChange={(event) =>
                          this.activateSetting(
                            event,
                            selectedItems.id,
                            selectedItems.is_server_under_maintenance === true
                              ? false
                              : true,
                            "server_under_maintenance"
                          )
                        }
                      ></Switch>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Colxx>
      </div>
    );
  }
}
export default DataListPages;
