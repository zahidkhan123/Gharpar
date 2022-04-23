import React, { Component } from "react";

import { Row, Button, Table } from "reactstrap";

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
      toolkit_name: "",

      toolkit_id: props.match.params.id,
    };
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;
    const { toolkit_id } = this.state;
    let url =
      servicePath +
      "/api/inventory/toolkits/" +
      toolkit_id +
      "/toolkit_products.json";
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
      if (response.data.toolkit_products.length > 0) {
        self.setState({
          toolkit_name: response.data.toolkit_name,
          selectedItems: response.data.toolkit_products,
          totalItemCount: response.data.toolkit_products.length,
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

  activate_product = async (event, toolkit_product_id, is_deleted) => {
    event.preventDefault();
    const { toolkit_id } = this.state;
    let formData = { product: { is_deleted: is_deleted } };

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/inventory/toolkits/" +
          toolkit_id +
          "/toolkit_products/" +
          toolkit_product_id +
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

  render_single_row = (selectedItems) => {
    const { toolkit_id } = this.state;
    let setting_html = [];
    let self = this;
    selectedItems.forEach(function (single_toolkit_product, index) {
      setting_html.push(
        <Row className="mt-2">
          <Colxx md="2">{single_toolkit_product.product_sku}</Colxx>
          <Colxx md="3">{single_toolkit_product.product_title}</Colxx>
          <Colxx md="4">{single_toolkit_product.unit_of_measure}</Colxx>
          <Colxx md="2" style={{ display: "flex" }}>
            <Link
              // to={`edit/${single_setting.id}`
              onClick={() =>
                check_permission(
                  "toolkit_products/update",
                  `/app/toolkits/${toolkit_id}/toolkit_products/${single_toolkit_product.id}/edit_toolkit_product`
                )
              }
            >
              <Button className="btn-success mr-2"> Edit </Button>
            </Link>
            {single_toolkit_product.is_deleted ? (
              <>
                <Link
                  // to={`edit/${single_setting.id}`
                  onClick={(event) =>
                    self.activate_product(
                      event,
                      single_toolkit_product.id,
                      false
                    )
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
                    self.activate_product(
                      event,
                      single_toolkit_product.id,
                      true
                    )
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
    const { toolkit_name, toolkit_id } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Products ({toolkit_name})</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "toolkit_products/create",
                    `/app/toolkits/${toolkit_id}/new_toolkit_product`
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
              {selectedItems !== undefined ? (
                <>
                  <tbody>{this.render_single_row(selectedItems)}</tbody>
                </>
              ) : (
                <></>
              )}
            </Table>
          </Colxx>
        </Row>
      </div>
    );
  }
}
export default DataListPages;
