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

class EditSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      role: [
        // { label: "Super Admin", value: "Super_admin" },
        // { label: "Admin", value: "Admin" },
        { label: "CSR", value: "CSR" },
      ],
      productObj: [],
      cities: [],
      all_cities_json: [],
      areas: [],
      city_areas_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
      product_id: props.match.params.product_id,
      product_category_id: props.match.params.id,
    };
  }

  async componentDidMount() {
    const { product_id } = this.state;
    let productObj = await this.get_product(product_id);

    this.setState({
      productObj: productObj,
    });
  }

  update_product = async (event) => {
    const { product_category_id } = this.state;
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/inventory/product_categories/ " +
          product_category_id +
          "/products/" +
          this.state.product_id +
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

  get_product = async (product_id) => {
    let productObj = null;
    const { product_category_id } = this.state;
    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/inventory/product_categories/" +
          product_category_id +
          "/products/" +
          product_id +
          ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          productObj = response.data;
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
    return productObj;
  };

  render() {
    const { productObj } = this.state;
    if (productObj !== undefined) {
      return (
        <Colxx xxs="12" lg="6" className="m-auto">
          <Card>
            <CardBody>
              <form onSubmit={this.update_product}>
                <ModalHeader>Edit Product</ModalHeader>

                <ModalBody>
                  <Label className="mt-4">SKU*</Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="product[product_sku]"
                    defaultValue={productObj.product_sku}
                    required
                  />
                  <Label className="mt-4">Title*</Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="product[product_title]"
                    defaultValue={productObj.product_title}
                    required
                  />
                  <Label className="mt-4">Unit of Measure*</Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="product[unit_of_measure]"
                    defaultValue={productObj.unit_of_measure}
                    required
                  />
                </ModalBody>

                {/* {this.render_address_details()} */}

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
    } else {
      return <></>;
    }
  }
}

export default EditSetting;
