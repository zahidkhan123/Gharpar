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
  CustomInput,
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
      product_categories: [],
      city_areas_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
    };
  }

  async componentDidMount() {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    this.setState({
      all_cities: all_cities,
      cities_dropdown_data: cities_dropdown_data,
    });
  }

  cities_dropdown_json = (all_cities) => {
    let cities_dropdown_data = [];
    if (all_cities !== undefined && all_cities.length) {
      all_cities.forEach(function (currentValue) {
        cities_dropdown_data.push({
          label: currentValue.city_name,
          value: currentValue.id,
          key: currentValue.id,
        });
      });
    }
    return cities_dropdown_data;
  };

  create_shop = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/inventory/shops.json",
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
            "Shop Created Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/shops/list");
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
    let self = this;
    const { cities_dropdown_data } = this.state;
    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.create_shop}>
              <ModalHeader>Add Shop</ModalHeader>

              <ModalBody>
                <Label className="mt-4">Name *</Label>
                <Input
                  className="form-control"
                  name="shop[shop_name]"
                  type="text"
                  defaultValue=""
                  required
                />
                <CustomInput
                  className="mt-2"
                  type="checkbox"
                  label="Warehouse"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input hidden name="shop[is_warehouse]" defaultValue="false" />
                <Label className="mt-4">Common Percentage *</Label>
                <Input
                  className="form-control"
                  name="shop[comm_percentage]"
                  type="number"
                  defaultValue=""
                  required
                />
                <Label className="mt-4">Phone *</Label>
                <Input
                  className="form-control"
                  name="shop[phone]"
                  type="text"
                  defaultValue=""
                  required
                />
                <Label className="mt-4">Address *</Label>
                <Input
                  className="form-control"
                  name="shop[shop_address]"
                  type="text"
                  defaultValue=""
                  required
                />
                <Label className="mt-2">Select City</Label>
                <Row>
                  <Colxx xxs="12" md="12">
                    <Select
                      components={{ Input: CustomSelectInput }}
                      name="shop[city_id]"
                      className="react-select"
                      classNamePrefix="react-select"
                      // onChange={self.handle_product_category_change}
                      options={cities_dropdown_data}
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
