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
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class NewSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settingObj: {},
      cities: [],
      all_cities_json: [],
      areas: [],
      city_areas_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
      toolkit_id: props.match.params.id,
      all_products: [],
      product_categories: [],
      product_categories_json: [],
      all_products_json: [],
    };
  }

  async componentDidMount() {
    let product_categories = await this.get_all_product_categories();
    let all_products = await this.get_all_products();

    let product_categories_json = this.product_categories_json(
      product_categories
    );

    this.setState({
      product_categories: product_categories,
      all_products: all_products,
      product_categories_json: product_categories_json,
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

  get_all_cities = async () => {
    let all_cities = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/cities.json?is_setting_added=false",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
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

  create_toolkit_product = async (event) => {
    const { toolkit_id } = this.state;
    event.preventDefault();
    let formData = new FormData(event.target);
    await trackPromise(
      axios({
        method: "post",
        url:
          servicePath +
          "/api/inventory/toolkits/" +
          toolkit_id +
          "/toolkit_products.json",
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
            "Product Created Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push(
            `/app/toolkits/${toolkit_id}/toolkit_products`
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
  };
  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
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
    return all_products;
  };

  render() {
    const { product_categories_json, all_products_json } = this.state;
    let self = this;
    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.create_toolkit_product}>
              <ModalHeader>Add Toolkit Products</ModalHeader>

              <ModalBody>
                <Label className="mt-2">Select Product Category</Label>
                <Row>
                  <Colxx xxs="12" md="12">
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
                </Row>
                <Label className="mt-2">Select Product</Label>
                <Row>
                  <Colxx xxs="12" md="12">
                    <Select
                      components={{ Input: CustomSelectInput }}
                      name="toolkit_product[product_id]"
                      className="react-select"
                      classNamePrefix="react-select"
                      // onChange={self.handle_service_change}
                      options={all_products_json}
                      required
                    />
                    <Label className="mt-4">Quantity *</Label>
                    <Input
                      className="form-control"
                      name="toolkit_product[quantity]"
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
    );
  }
}

export default NewSetting;
