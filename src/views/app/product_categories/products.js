import React, { Component } from "react";

import { Row, Modal, ModalHeader, ModalBody, Button, Table } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

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
      product_category_title: "",
      deleteConfirmationModal: false,
      cityToDelete: "",

      areaAction: "areaModalOpen",
      areaModalOpen: false,
      targetCity: "",
      product_category_id: props.match.params.id,
    };
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;
    const { product_category_id } = this.state;
    let url;
    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/cities.json?default_role=admin&search_data=" +
        this.state.search;
    } else {
      // url = apiUrl + "?product_category_id=" + product_category_id;
      url =
        servicePath +
        "/api/inventory/product_categories/" +
        product_category_id +
        "/products.json";
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
      if (response.data.products.length > 0) {
        self.setState({
          product_category_title: response.data.category_title,
          selectedItems: response.data.products,
          totalItemCount: response.data.products.length,
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

  activate_product = async (event, product_id, is_deleted) => {
    event.preventDefault();
    const { product_category_id } = this.state;
    let formData = { product: { is_deleted: is_deleted } };

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/inventory/product_categories/" +
          product_category_id +
          "/products/" +
          product_id +
          ".json",
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
            "Product Updated Successfully",
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
    const { product_category_id } = this.state;
    let setting_html = [];
    let self = this;
    selectedItems.forEach(function (single_product, index) {
      setting_html.push(
        <Row className="mt-2">
          <Colxx md="2">{single_product.product_sku}</Colxx>
          <Colxx md="3">{single_product.product_title}</Colxx>
          <Colxx md="4">{single_product.unit_of_measure}</Colxx>
          <Colxx md="2" style={{ display: "flex" }}>
            <Link
              // to={`edit/${single_setting.id}`
              onClick={() =>
                check_permission(
                  "products/update",
                  `/app/product_categories/${product_category_id}/products/${single_product.id}/edit_product`
                )
              }
            >
              <Button className="btn-success mr-2"> Edit </Button>
            </Link>
            {single_product.is_deleted ? (
              <>
                <Link
                  // to={`edit/${single_setting.id}`
                  onClick={(event) =>
                    self.activate_product(event, single_product.id, false)
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
                    self.activate_product(event, single_product.id, true)
                  }
                >
                  <Button className="btn-success mr-2"> Deactivate </Button>
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
    const { product_category_title, product_category_id } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Products ({product_category_title})</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "products/create",
                    `/app/product_categories/${product_category_id}/new_product`
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Product
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
        {this.deleteConfirmation()}
        {this.settings_heading()}
        <Row>
          <Colxx md="12">
            <Table>
              <thead>
                <Row>
                  <Colxx md="2">
                    <th>SKU</th>
                  </Colxx>
                  <Colxx md="3">
                    <th>Title</th>
                  </Colxx>
                  <Colxx md="4">
                    <th>Unit of Measure</th>
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
