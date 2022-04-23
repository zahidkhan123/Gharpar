import React from "react";
import {
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Card,
  CardBody,
  Label,
  Row,
  Table,
} from "reactstrap";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { Link } from "react-router-dom";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import moment from "moment";
import { trackPromise } from "react-promise-tracker";

import axios from "axios";

class NewSetting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      settingObj: {},
      cities: [],
      all_cities_json: [],
      areas: [],
      city_areas_json: [],
      all_products: [],
      product_categories: [],
      product_categories_json: [],
      all_products_json: [],
      purchase_date: null,
      expiry_date: null,
      all_shops: [],
      all_shops_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
      inventory_stocks: [],
    };
  }

  async componentDidMount() {
    let product_categories = await this.get_all_product_categories();
    let all_products = await this.get_all_products();
    let all_shops = await this.get_all_shops();

    let product_categories_json = this.product_categories_json(
      product_categories
    );

    let shops_json = this.shops_json(all_shops);

    this.setState({
      product_categories: product_categories,
      all_products: all_products,
      all_shops: all_shops,
      product_categories_json: product_categories_json,
      shops_json: shops_json,
    });
  }

  get_all_product_categories = async () => {
    let product_categories = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/inventory/product_categories.json?is_paginated=false",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          product_categories = response.data.product_categories;
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

    return product_categories;
  };

  product_categories_json = (product_categories) => {
    let product_categories_dropdown_data = [];

    product_categories.forEach(function (currentValue) {
      product_categories_dropdown_data.push({
        label: currentValue.category_title,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return product_categories_dropdown_data;
  };

  get_all_shops = async () => {
    let all_shops = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/inventory/shops.json?is_warehouse=true",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_shops = response.data.shops;
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

    return all_shops;
  };

  shops_json = (all_shops) => {
    let shops_dropdown_data = [];

    all_shops.forEach(function (single_shop) {
      shops_dropdown_data.push({
        label: single_shop.shop_name,
        value: single_shop.id,
        key: single_shop.id,
      });
    });
    return shops_dropdown_data;
  };

  get_all_products = async () => {
    let all_products = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/inventory/products/all_products.json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_products = response.data.products;
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

    return all_products;
  };

  handle_product_category_change = (event) => {
    const { all_products } = this.state;
    let selected_products = [];
    let all_products_json = [];
    event.map((single_select) => {
      selected_products = all_products.filter(
        (product) => product.product_category_id === single_select.value
      );
      selected_products.map((single_product) => {
        all_products_json.push({
          label: single_product.product_title,
          value: single_product.id,
          key: single_product.id,
        });
        return single_product;
      });
      return single_select;
    });
    this.setState({
      all_products_json: all_products_json,
    });
  };

  get_all_cities = async () => {
    let all_cities = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/cities.json?is_setting_added=false",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          all_cities = response.data.sort(
            (a, b) => parseInt(a.id) - parseInt(b.id)
          );
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

    return all_cities;
  };

  cities_json = (all_cities) => {
    let cities_dropdown_data = [];

    all_cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return cities_dropdown_data;
  };

  create_inventory = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/inventory/inventory_stocks.json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            inventory_stocks: response.data.inventory_stocks,
          });
          NotificationManager.success(
            "Inventory Created Successfully",
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

  handlePurchaseDate = (date) => {
    this.setState({
      purchase_date: date,
    });
  };

  handleExpiryDate = (date) => {
    this.setState({
      expiry_date: date,
    });
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
            inventory_stocks: response.data.inventory_stocks,
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
            inventory_stocks: response.data.inventory_stocks,
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

  render_single_row = (selectedItems) => {
    let setting_html = [];
    let self = this;
    selectedItems.forEach(function (single_inventory, index) {
      setting_html.push(
        <Row className="mt-2">
          <Colxx md="1">{index + 1}</Colxx>
          <Colxx md="1">{single_inventory.po_reference}</Colxx>
          <Colxx md="2">{single_inventory.product_title}</Colxx>
          <Colxx md="2">{single_inventory.purchase_date}</Colxx>
          <Colxx md="2">{single_inventory.expiry_date}</Colxx>
          <Colxx md="1">{single_inventory.quantity}</Colxx>
          <Colxx md="1">{single_inventory.cost_price}</Colxx>
          <Colxx md="2" style={{ display: "flex" }}>
            {single_inventory.is_added_to_shop ? (
              <></>
            ) : (
              <>
                <Link
                  // to={
                  // `/app/product_categories/${single_product_category.id}/products`
                  onClick={() => self.add_to_shop(single_inventory.id)}
                >
                  <Button className="btn-success mr-2" color="success">
                    {" "}
                    Add{" "}
                  </Button>
                </Link>
                <Link
                  // to={
                  // `/app/product_categories/${single_product_category.id}/products`
                  onClick={() => self.remove_inventory(single_inventory.id)}
                >
                  <Button className="btn-success mr-2"> Remove </Button>
                </Link>
              </>
            )}
          </Colxx>
        </Row>
      );
    });
    return setting_html;
  };

  render() {
    const {
      product_categories_json,
      all_products_json,
      shops_json,
      inventory_stocks,
    } = this.state;
    let self = this;
    return (
      <>
        <Row>
          <Colxx xxs="12" lg="12" className="m-auto">
            <Card>
              <CardBody>
                <form onSubmit={this.create_inventory} id="inventory">
                  <ModalHeader>Add Inventory</ModalHeader>

                  <ModalBody>
                    <Row>
                      <Label className="mt-2">PO No *</Label>
                      <Colxx md="2">
                        <Input
                          className="form-control"
                          name="inventory_stock[po_reference]"
                          type="text"
                          defaultValue=""
                          required
                        />
                      </Colxx>
                      <Label className="mt-2">Shop</Label>
                      <Colxx xxs="2" md="2">
                        <Select
                          components={{ Input: CustomSelectInput }}
                          name="inventory_stock[shop_id]"
                          className="react-select"
                          classNamePrefix="react-select"
                          // onChange={self.handle_product_category_change}
                          options={shops_json}
                          required
                        />
                      </Colxx>
                      <Label className="mt-2">Category</Label>
                      <Colxx xxs="2" md="2">
                        <Select
                          components={{ Input: CustomSelectInput }}
                          isMulti
                          // name="deal[deal_cities_attributes][][city_id]"
                          className="react-select"
                          classNamePrefix="react-select"
                          onChange={self.handle_product_category_change}
                          options={product_categories_json}
                          required
                        />
                      </Colxx>
                      <Label className="mt-2">Product</Label>
                      <Colxx xxs="2" md="2">
                        <Select
                          components={{ Input: CustomSelectInput }}
                          name="inventory_stock[product_id]"
                          className="react-select"
                          classNamePrefix="react-select"
                          // onChange={self.handle_service_change}
                          options={all_products_json}
                          required
                        />
                      </Colxx>
                    </Row>
                    <Row className="mt-4">
                      <Label className="mt-2">Purchase</Label>
                      <Colxx xxs="2" md="2">
                        <DatePicker
                          selected={this.state.purchase_date}
                          onChange={this.handlePurchaseDate}
                          minDate={moment().toDate()}
                          name="inventory_stock[purchase_date]"
                          autoComplete="off"
                        />
                      </Colxx>
                      <Label className="mt-2">Expiry</Label>
                      <Colxx xxs="2" md="2">
                        <DatePicker
                          selected={this.state.expiry_date}
                          onChange={this.handleExpiryDate}
                          minDate={moment().toDate()}
                          name="inventory_stock[expiry_date]"
                          autoComplete="off"
                        />
                      </Colxx>
                      <Label className="mt-2">Quantity *</Label>
                      <Colxx md="2">
                        <Input
                          className="form-control"
                          name="inventory_stock[quantity]"
                          type="text"
                          defaultValue=""
                          required
                        />
                      </Colxx>
                      <Label className="mt-2">Cost Price *</Label>
                      <Colxx md="2">
                        <Input
                          className="form-control"
                          name="inventory_stock[cost_price]"
                          type="number"
                          defaultValue=""
                          required
                        />
                      </Colxx>
                    </Row>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="secondary"
                      outline
                      type="button"
                      onClick={this.props.history.goBack}
                    >
                      <IntlMessages id="pages.cancel" />
                    </Button>
                    <Button color="primary" type="submit">
                      <IntlMessages id="pages.submit" />
                    </Button>
                  </ModalFooter>
                </form>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
        {inventory_stocks.length !== undefined &&
        inventory_stocks.length > 0 ? (
          <>
            <Row>
              <Colxx md="12">
                <Card>
                  <CardBody>
                    <Table>
                      <thead>
                        <Row>
                          <Colxx md="1">
                            <th>No.</th>
                          </Colxx>
                          <Colxx md="1">
                            <th>PO No.</th>
                          </Colxx>
                          <Colxx md="2">
                            <th>Product</th>
                          </Colxx>
                          <Colxx md="2">
                            <th>Purchase</th>
                          </Colxx>
                          <Colxx md="2">
                            <th>Expiry</th>
                          </Colxx>
                          <Colxx md="1">
                            <th>Quantity</th>
                          </Colxx>
                          <Colxx md="1">
                            <th>Cost Price</th>
                          </Colxx>
                          <Colxx md="2">
                            <th>Actions</th>
                          </Colxx>
                        </Row>
                      </thead>
                      <tbody>{this.render_single_row(inventory_stocks)}</tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Row>
          </>
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default NewSetting;
