import React, { Component } from "react";
import {
  Card,
  Button,
  Input,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  CardBody,
} from "reactstrap";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class EditOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order_data: {},
      order: {},
      technicians_json: {},
      order_service_to_delete: "",
      startDateRange: null,
      order_time: null,
      deleteConfirmationModal: false,
      address_type: "",
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    let all_addresses = await this.fetch_all_addresses(match.params.client_id);
    let all_cities = JSON.parse(localStorage.getItem("cities"));

    let cities_dropdown = this.cities_dropdown(all_cities);
    // let order = await this.fetch_order();

    // let order_date = order.order_date;
    // let order_city = order.address.city;
    // let order_area = order.address.area;

    this.setState({
      all_addresses: all_addresses,
      all_cities: all_cities,
      cities_dropdown: cities_dropdown,
      // startDateRange: order_date,
      // order_city: order_city,
      // order_area: order_area,
      // areas_dropdown: area_dropdown_json,
    });
  }

  cities_dropdown = (all_cities) => {
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

  fetch_all_addresses = async (user_id) => {
    let all_addresses = [];
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/addresses.json?user_id=" + user_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_addresses = response.data;
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

    return all_addresses;
  };

  fetch_all_areas = async (city_id) => {
    let areas = [];
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/areas.json?city_id=" + city_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          areas = response.data;
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

    return areas;
  };

  create_address = async (event) => {
    event.preventDefault();

    const { match } = this.props;
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url:
          servicePath +
          "/api/v2/orders/" +
          match.params.id +
          "/change_order_address.json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          // self.setState({
          //   order: response.data,
          // });

          NotificationManager.success(
            "Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          this.props.history.push("/app/orders/show/" + match.params.id);
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

  change_city = async (city) => {
    let all_areas = await this.get_city_areas(city);
    let areas_dropdown = this.area_dropdown_json(all_areas);

    this.setState({
      all_areas: all_areas,
      areas_dropdown: areas_dropdown,
    });
  };

  get_city_areas = async (city) => {
    let areas = [];
    await trackPromise(
      axios.get(servicePath + "/api/v2/areas.json?city_id=" + city.value, {
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          areas = response.data;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
    return areas;
  };

  area_dropdown_json = (all_areas) => {
    let areas_dropdown_data = [];
    if (all_areas !== undefined && all_areas.length) {
      all_areas.forEach(function (currentValue) {
        areas_dropdown_data.push({
          label: currentValue.area,
          value: currentValue.id,
          key: currentValue.id,
        });
      });
    }
    return areas_dropdown_data;
  };

  handleChange = (value) => {
    this.setState({
      address_type: value,
    });
  };
  render_all_addresses = () => {
    const { all_addresses } = this.state;
    let all_addresses_html = [];
    all_addresses.forEach((single_Address) => {
      all_addresses_html.push(
        <>
          <Card className="mt-2">
            <CardBody>
              <form onSubmit={this.create_address}>
                <input
                  type="hidden"
                  name="address[id]"
                  value={single_Address.id}
                />
                <Button color="primary" type="submit">
                  {" "}
                  Choose{" "}
                </Button>
              </form>
              <Label className="mt-3">
                <strong>Address:</strong>
              </Label>
              <p>
                {single_Address.address_1}, {single_Address.area.area},{" "}
                {single_Address.city.city_name}
              </p>
            </CardBody>
          </Card>
        </>
      );
    });
    return all_addresses_html;
  };

  render_new_address_form = () => {
    const { cities_dropdown, areas_dropdown } = this.state;
    let new_address_html = [];
    new_address_html = (
      <>
        <form onSubmit={this.create_address} autoComplete="off">
          <div className="row">
            <div className="col-md-12">
              <Label className="mt-4"> Address 1 * </Label>
              <Input
                className="form-control"
                type="text"
                name="address[address_1]"
                defaultValue=""
                required
              />
            </div>
          </div>

          <div className="row mb-4">
            <Colxx xs="12">
              <Label className="mt-4"> City * </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                name="address[city_id]"
                onChange={this.change_city}
                options={cities_dropdown}
              />
            </Colxx>
            <Colxx xs="12">
              <Label className="mt-4"> Area * </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                name="address[area_id]"
                options={areas_dropdown}
              />
            </Colxx>
          </div>

          <ModalFooter>
            <Button color="primary" type="submit">
              {" "}
              Submit{" "}
            </Button>
          </ModalFooter>
        </form>
      </>
    );

    return new_address_html;
  };

  render() {
    const { all_addresses, address_type } = this.state;

    if (all_addresses === undefined || all_addresses.length === 0) {
      return <> </>;
    } else {
      return (
        <>
          <Colxx xxs="12" lg="6" className="m-auto">
            <Card>
              <CardBody>
                <ModalHeader>Change Address</ModalHeader>

                <ModalBody>
                  <Button
                    className="ml-5"
                    color="secondary"
                    outline
                    type="button"
                    onClick={() => this.handleChange("existing")}
                  >
                    Choose Existing
                  </Button>
                  <Button
                    className="ml-5"
                    color="secondary"
                    outline
                    type="button"
                    onClick={() => this.handleChange("new")}
                  >
                    Create New
                  </Button>
                  {address_type === "existing" ? (
                    <>{this.render_all_addresses()}</>
                  ) : address_type === "new" ? (
                    <>{this.render_new_address_form()}</>
                  ) : (
                    <></>
                  )}
                </ModalBody>

                <ModalFooter>
                  <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={this.props.history.goBack}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </CardBody>
            </Card>
          </Colxx>
        </>
      );
    }
  }
}

export default React.memo(EditOrder);
