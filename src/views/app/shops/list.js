import React, { Component } from "react";

import { Row, Button, Table } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/inventory/shops.json";

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
      if (response.data.shops.length > 0) {
        self.setState({
          selectedItems: response.data.shops,
          totalItemCount: response.data.shops.length,
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
    selectedItems.forEach(function (single_shop, index) {
      setting_html.push(
        <Row className="mt-2">
          <Colxx md="2">{index + 1}</Colxx>
          <Colxx md="2">{single_shop.shop_name}</Colxx>
          <Colxx md="2">{single_shop.comm_percentage}</Colxx>
          <Colxx md="2">{single_shop.shop_address}</Colxx>
          <Colxx md="2">{single_shop.city_name}</Colxx>
          <Colxx md="2" style={{ display: "flex" }}>
            <Link
              // to={`edit/${single_setting.id}`
              onClick={() =>
                check_permission("toolkits/update", `edit/${single_shop.id}`)
              }
            >
              <Button className="btn-success mr-2"> Edit </Button>
            </Link>
            <Link to={`${single_shop.id}/shop_inventories`}>
              {/* onClick={() =>
                check_permission("toolkits/update", `edit/${single_shop.id}`)
              }> */}
              <Button className="btn-success mr-2"> Inventory </Button>
            </Link>
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
              <h1>Shops</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission("shops/create", `/app/shops/create_shop`)
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Shop
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
                  <Colxx md="2">
                    <th>Name</th>
                  </Colxx>
                  <Colxx md="2">
                    <th>Percentage</th>
                  </Colxx>
                  <Colxx md="2">
                    <th>Address</th>
                  </Colxx>
                  <Colxx md="2">
                    <th>City</th>
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
