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
} from "reactstrap";
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
      product_category_id: props.match.params.id,
    };
  }

  // get_all_cities = async () => {
  //   let all_cities = [];

  //   await axios({
  //     method: "get",
  //     url: servicePath + "/api/v2/cities.json?is_setting_added=false",
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //       "AUTH-TOKEN": localStorage.getItem("auth_token"),
  //       "IS-ACCESSIBLE": true,
  //     },
  //   })
  //     .then((response) => {
  //       if (response.status === 200) {
  //         all_cities = response.data.sort(
  //           (a, b) => parseInt(a.id) - parseInt(b.id)
  //         );
  //       } else {
  //         console.log(response);
  //       }
  //     })
  //     .catch((error) => {
  //       NotificationManager.error(
  //         error.response.data.message,
  //         "",
  //         5000,
  //         () => {
  //           alert("callback");
  //         },
  //         null,
  //         "filled"
  //       );
  //       console.log("error", error);
  //     });

  //   return all_cities;
  // };

  // cities_json = (all_cities) => {
  //   let cities_dropdown_data = [];

  //   all_cities.forEach(function (currentValue) {
  //     cities_dropdown_data.push({
  //       label: currentValue.city_name,
  //       value: currentValue.id,
  //       key: currentValue.id,
  //     });
  //   });
  //   return cities_dropdown_data;
  // };

  create_product = async (event) => {
    const { product_category_id } = this.state;
    event.preventDefault();
    let formData = new FormData(event.target);
    await trackPromise(
      axios({
        method: "post",
        url:
          servicePath +
          "/api/inventory/product_categories/" +
          product_category_id +
          "/products.json",
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
            `/app/product_categories/${product_category_id}/products`
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

  render() {
    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.create_product}>
              <ModalHeader>Add Product Category</ModalHeader>

              <ModalBody>
                <Label className="mt-4">SKU*</Label>
                <Input
                  className="form-control"
                  name="product[product_sku]"
                  type="text"
                  defaultValue=""
                  required
                />
                <Label className="mt-4">Title*</Label>
                <Input
                  className="form-control"
                  name="product[product_title]"
                  type="text"
                  defaultValue=""
                  required
                />
                {/* <input
                  type="hidden"
                  name="product[product_category_id]"
                  value={product_category_id}
                /> */}
                <Label className="mt-4">Unit of Measure*</Label>
                <Input
                  className="form-control"
                  name="product[unit_of_measure]"
                  type="text"
                  defaultValue=""
                  required
                />
                {/* <CustomInput
                  className="mt-2"
                  type="checkbox"
                  label="Toolkit"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="product_category[is_toolkit]"
                  defaultValue="false"
                /> */}
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
