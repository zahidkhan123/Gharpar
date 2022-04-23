import React, { Component } from "react";

import { Row, Button, Card, Table, CardBody } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Switch } from "element-react";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/sms_templates.json";

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

  activateSmsTemplate = async (event, sms_template_id, status) => {
    let data = {};
    let self = this;
    data = { is_active: status };

    await trackPromise(
      axios.put(
        servicePath + "/api/v2/sms_templates/" + sms_template_id + ".json",
        {
          sms_template: data,
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

  dataListRender() {
    let self = this;
    let url;
    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/sms_templates.json?search_data=" +
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
      if (response.data.length > 0) {
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

  render_single_row = (selectedItems) => {
    let setting_html = [];
    let self = this;
    selectedItems.forEach(function (single_sms_template) {
      setting_html.push(
        <tr>
          <td>
            <strong>{single_sms_template.sms_type}</strong>
          </td>
          <td>{single_sms_template.content}</td>
          <td style={{ display: "flex" }}>
            <Switch
              value={single_sms_template.is_active}
              onColor="#13ce66"
              offColor="#ff4949"
              onChange={(event) =>
                self.activateSmsTemplate(
                  event,
                  single_sms_template.id,
                  single_sms_template.is_active === true ? false : true
                )
              }
            />
            <Link
              // to={`edit/${single_sms_template.id}`}
              onClick={() =>
                check_permission(
                  "sms_templates/update",
                  `edit/${single_sms_template.id}`
                )
              }
            >
              <Button className="btn-success mr-2 ml-2" size="xs">
                {" "}
                Edit{" "}
              </Button>
            </Link>
          </td>
        </tr>
      );
    });
    return setting_html;
  };

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>SMS Template</h1>
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
        {/*{this.renderCityModal()}*/}
        {/*{this.deleteConfirmation()}*/}
        {this.settings_heading()}
        <Colxx xxs="12">
          <Card className="mb-4">
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Content</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>{this.render_single_row(selectedItems)}</tbody>
              </Table>
            </CardBody>
          </Card>
        </Colxx>
      </div>
    );
  }
}

export default DataListPages;
