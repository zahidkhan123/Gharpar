import React, { Component } from "react";

import { Row, Button, Table } from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/inventory/toolkits.json";

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
        "/api/v2/cities.json?default_role=admin&search_data=" +
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
      if (response.data.toolkits.length > 0) {
        self.setState({
          selectedItems: response.data.toolkits,
          totalItemCount: response.data.toolkits.length,
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

  activate_toolkit = async (event, toolkit_id, is_deleted) => {
    event.preventDefault();
    let formData = { toolkit: { is_deleted: is_deleted } };

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/inventory/toolkits/" + toolkit_id + ".json",
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
            "Toolkit Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.dataListRender();
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

  render_single_row = (selectedItems) => {
    let setting_html = [];
    let self = this;
    selectedItems.forEach(function (single_toolkit, index) {
      setting_html.push(
        <Row className="mt-2">
          <Colxx md="2">{index + 1}</Colxx>
          <Colxx md="6">{single_toolkit.toolkit_name}</Colxx>
          <Colxx md="2" style={{ display: "flex" }}>
            <Link
              // to={`edit/${single_setting.id}`
              onClick={() =>
                check_permission("toolkits/update", `edit/${single_toolkit.id}`)
              }
            >
              <Button className="btn-success mr-2"> Edit </Button>
            </Link>
            {single_toolkit.is_deleted ? (
              <>
                <Link
                  // to={`edit/${single_setting.id}`
                  onClick={(event) =>
                    self.activate_toolkit(event, single_toolkit.id, false)
                  }
                >
                  <Button className="btn-success mr-2" color="success">
                    {" "}
                    Activate{" "}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  // to={`edit/${single_setting.id}`
                  onClick={(event) =>
                    self.activate_toolkit(event, single_toolkit.id, true)
                  }
                >
                  <Button className="btn-success mr-2"> Deactivate </Button>
                </Link>
              </>
            )}
            {single_toolkit.is_deleted ? (
              <></>
            ) : (
              <>
                <Link
                  // to={
                  // `/app/product_categories/${single_product_category.id}/products`
                  onClick={() =>
                    check_permission(
                      "toolkit_products/index",
                      `/app/toolkits/${single_toolkit.id}/toolkit_products`
                    )
                  }
                >
                  <Button className="btn-success mr-2"> Products </Button>
                </Link>
              </>
            )}
          </Colxx>
        </Row>
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
              <h1>Toolkits</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "toolkits/create",
                    `/app/toolkits/create_toolkit`
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Toolkit
                </Button>
              </Link>
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
        <Row>
          <Colxx md="12">
            <Table>
              <thead>
                <Row>
                  <Colxx md="2">
                    <th>No.</th>
                  </Colxx>
                  <Colxx md="6">
                    <th>Title</th>
                  </Colxx>
                  <Colxx md="2">
                    <th>Actions</th>
                  </Colxx>
                </Row>
              </thead>
              <tbody>{this.render_single_row(selectedItems)}</tbody>
            </Table>
          </Colxx>
        </Row>
      </div>
    );
  }
}
export default DataListPages;
