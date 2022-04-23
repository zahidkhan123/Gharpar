import React, { Component } from "react";

import { Row, Table } from "reactstrap";

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
      displayMode: "list",
      toolkit_name: "",

      shop_id: props.match.params.id,
    };
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;
    const { shop_id } = this.state;
    let url =
      servicePath +
      "/api/inventory/shops/" +
      shop_id +
      "/shop_inventories.json";
    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    ).then((response) => {
      if (response.data.shop_inventories.length > 0) {
        self.setState({
          shop_details: response.data,
          selectedItems: response.data.shop_inventories,
          totalItemCount: response.data.shop_inventories.length,
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
    let setting_html = [];
    selectedItems.forEach(function (single_shop_inventory, index) {
      setting_html.push(
        <tr>
          <td>{single_shop_inventory.category_title}</td>
          <td>{single_shop_inventory.product_title}</td>
          <td>{single_shop_inventory.purchase_date}</td>
          <td>{single_shop_inventory.expiry_date}</td>
          <td>{single_shop_inventory.unit_of_measure}</td>
          <td>{single_shop_inventory.current_stock}</td>
          <td>{single_shop_inventory.cost_price}</td>
          <td>{single_shop_inventory.sale_price}</td>
        </tr>
      );
    });
    return setting_html;
  };

  settings_heading = () => {
    const { shop_details } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1> Inventory ({shop_details.shop_name})</h1>
              {/* <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "toolkit_products/create",
                    `/app/toolkits/${toolkit_id}/new_toolkit_product`
                  )
                }>
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}>
                  New Product
                </Button>
              </Link> */}
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
        {selectedItems !== undefined ? <>{this.settings_heading()}</> : <></>}

        <Row>
          <Colxx md="12">
            <Table striped>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Product</th>
                  <th>Purchase</th>
                  <th>Expiry</th>
                  <th>Unit of Measure</th>
                  <th>Stock</th>
                  <th>Cost Price</th>
                  <th>Sale Price</th>
                </tr>
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
