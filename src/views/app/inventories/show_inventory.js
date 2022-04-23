import React, { Component } from "react";

import { Row, Modal, ModalHeader, ModalBody, Button, Table } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/inventory/inventory_stocks.json";

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
      po_reference: props.match.params.id,
    };
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;
    const { po_reference } = this.state;
    let url;
    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/cities.json?default_role=admin&search_data=" +
        this.state.search;
    } else {
      url = apiUrl + "?po_reference=" + po_reference;
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
      if (response.data.inventory_stocks.length > 0) {
        self.setState({
          selectedItems: response.data.inventory_stocks,
          totalItemCount: response.data.inventory_stocks.length,
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

  toggleDeleteConfirmationModal = (event, city) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        cityToDelete: city.id,
      });
    } else {
      // if delete confirmed then, first call delete function for city
      if (event.target.classList.contains("delete-confirmed")) {
        this.deleteCity();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        cityToDelete: "",
      });
    }
  };

  deleteConfirmation = (event, city) => {
    return (
      <Modal
        isOpen={this.state.deleteConfirmationModal}
        size="sm"
        toggle={this.toggleDeleteConfirmationModal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to deactivate this city ?
        </ModalHeader>
        <ModalBody>
          <Button
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

  render_single_row = (selectedItems) => {
    let setting_html = [];
    let self = this;
    selectedItems.forEach(function (single_inventory, index) {
      setting_html.push(
        <tr>
          <td>{index + 1}</td>
          <td>{single_inventory.po_reference}</td>
          <td>{single_inventory.product_title}</td>
          <td>{single_inventory.purchase_date}</td>
          <td>{single_inventory.expiry_date}</td>
          <td>{single_inventory.quantity}</td>
          <td>{single_inventory.cost_price}</td>
          <td style={{ display: "flex" }}>
            {single_inventory.is_added_to_shop ? (
              <></>
            ) : (
              <>
                <Link
                  // to={
                  // `/app/product_categories/${single_product_category.id}/products`
                  onClick={() => self.add_to_shop(single_inventory.id)}
                >
                  <Button
                    className="btn-success mr-2"
                    color="success"
                    size="sm"
                  >
                    Add to Shop
                  </Button>
                </Link>
                <Link
                  // to={
                  // `/app/product_categories/${single_product_category.id}/products`
                  onClick={() => self.remove_inventory(single_inventory.id)}
                >
                  <Button className="btn-success mr-2" size="sm">
                    {" "}
                    Remove{" "}
                  </Button>
                </Link>
              </>
            )}
          </td>
        </tr>
      );
    });
    return setting_html;
  };

  remove_inventory = async (inventory_id) => {
    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/inventory/inventory_stocks/cancel_inventory_stock.json?inventory_stock_id=" +
          inventory_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            selectedItems: response.data.inventory_stocks,
          });
          NotificationManager.success(
            "Inventory Removed Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          // this.props.history.push("/app/settings/list");
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

  add_to_shop = async (inventory_id) => {
    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/inventory/inventory_stocks/add_inventory_stock_to_shop.json?inventory_stock_id=" +
          inventory_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            selectedItems: response.data.inventory_stocks,
          });
          NotificationManager.success(
            "Inventory Added to Shop Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          // this.props.history.push("/app/settings/list");
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

  settings_heading = () => {
    const { po_reference } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>PO Reference({po_reference})</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "inventory_stocks/create",
                    `/app/inventories/create_inventory`
                  )
                }
              >
                {/* <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}>
                  New Inventory
                </Button> */}
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
        {this.deleteConfirmation()}
        {this.settings_heading()}
        <Row>
          <Colxx md="12">
            <Table striped>
              <thead>
                <th>No.</th>
                <th>PO No.</th>
                <th>Product</th>
                <th>Purchase</th>
                <th>Expiry</th>
                <th>Quantity</th>
                <th>Cost Price</th>
                <th>Actions</th>
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
