import React, { Component } from "react";
import {
  CardTitle,
  Modal,
  Row,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Table,
  Label,
  Input,
  Badge,
} from "reactstrap";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/lib/Async";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import { servicePath } from "../../../constants/defaultValues";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import moment from "moment";
import "./order_summary.css";
import { trackPromise } from "react-promise-tracker";

class NewOrder extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      clients: [],
      clients_dropdown_json: [],
      service_categories: [],
      service_categories_dropdown_json: [],
      services: [],
      services_dropdown_json: [],
      order_address_id: 0,
      current_client: {},
      service_category: {},
      sub_categories: [],
      data_found: "",
      cart: { services: [] },
      cities: [],
      is_coupon_applied: false,
      coupon_details: [],
      coupon_code: "",
      cities_json: [],
      order_date: null,
      order_time: null,
      order: {},
      order_billing: {},
      modalOpen: false,
      current_service: {},
      current_service_addons: [],
      toggle_addons_modal: false,
      new_address_modal: false,
      areas: [],
      deals: [],
      order_address_city_id: null,
      client_dropdown_input: "",
    };
  }

  async componentDidMount() {
    // let clients = await this.get_all_clients();
    // let clients_dropdown_json = this.prepare_clients_json(clients);

    let cities = JSON.parse(localStorage.getItem("cities"));
    let cities_json = this.prepare_cities_json(cities);

    this.setState({
      // clients: clients,
      // clients_dropdown_json: clients_dropdown_json,
      cities: cities,
      cities_json: cities_json,
    });
  }

  handleInputChange = (newValue) => {
    this.setState({
      client_dropdown_input: newValue,
    });
  };

  toggleModal = () => {
    this.setState({
      modalOpen: !this.state.modalOpen,
    });
  };

  toggleNewAddressModal = () => {
    this.setState({
      new_address_modal: !this.state.new_address_modal,
    });
  };

  prepare_areas_json = () => {
    const { areas } = this.state;
    let areas_dropdown_data = [];

    areas.forEach(function (currentValue) {
      areas_dropdown_data.push({
        label: currentValue.area,
        value: currentValue.id,
        key: currentValue.id,
      });
    });

    return areas_dropdown_data;
  };

  get_city_areas = async (city) => {
    let self = this;

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
          console.log(response);

          self.setState({
            areas: response.data,
          });
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        self.setState({
          areas: [],
        });
        console.log("error", error);
      });
  };

  get_all_cities = async () => {
    let cities = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/cities.json",
      headers: {
        "Content-Type": "application/json",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          response.data = response.data.sort(
            (a, b) => parseInt(a.id) - parseInt(b.id)
          );
          cities = response.data;
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

    return cities;
  };

  prepare_cities_json = (cities) => {
    let cities_dropdown_data = [];

    cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });

    return cities_dropdown_data;
  };

  handleChangeDate = (date) => {
    this.setState({
      order_date: date,
    });
  };

  handleOrderTime = (time) => {
    this.setState({
      order_time: time.target.value,
    });
  };

  handle_client_change = async (client_json) => {
    let client_id = client_json.value;
    let client_obj = await this.get_user(client_id);

    this.setState({
      current_client: client_obj,
    });
  };

  get_all_deals = async () => {
    let deals = [];
    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/deals.json?city_id=" +
          this.state.order_address_city_id +
          "&default_role=Client",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200 && response.data.length > 0) {
          deals = response.data;
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

    if (deals.length === 1) {
      this.setState({
        deals: deals[0],
        services: deals[0].deal_services,
        data_found: "single_deal",
      });
    } else if (deals.length > 1) {
      this.setState({
        all_deals: deals,
        data_found: "multiple_deals",
      });
    }
  };

  get_all_service_categories = async (city_id) => {
    let service_categories = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/service_categories.json?city_id=" + city_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          service_categories = response.data.service_categories;
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

    return service_categories;
  };

  fetch_category_services = async (event) => {
    event.preventDefault();
    let category_id = parseInt(event.target.dataset.serviceCategoryId);
    let service_category = {};

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/services.json?service_category_id=" +
          category_id +
          "&city_id=" +
          parseInt(this.state.order_address_city_id),
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          service_category = response.data;
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
    if (service_category.services === undefined) {
      // We have received subcategories instead of services
      this.setState({
        service_category: service_category.service_category,
        sub_categories: service_category.subcategories,
        data_found: "sub_categories",
      });
    } else if (service_category.subcategories === undefined) {
      // We have received services instead of subcategories
      this.setState({
        service_category: service_category.service_category,
        services: service_category.services,
        data_found: "services",
      });
    }
  };

  handle_city_change = async (city_json) => {
    let city_id = city_json.value;
    let service_categories = await this.get_all_service_categories(city_id);
    let service_categories_dropdown_json = this.prepare_service_categories_dropdown_json(
      service_categories
    );

    await this.get_all_deals(city_id);

    this.setState({
      service_categories: service_categories,
      service_categories_dropdown_json: service_categories_dropdown_json,
    });
  };

  prepare_service_categories_dropdown_json = (service_categories) => {
    let service_categories_dropdown_data = [];

    service_categories.forEach(function (service_category) {
      service_categories_dropdown_data.push({
        label: service_category.service_category_title,
        value: service_category.id,
        key: service_category.id,
      });
    });

    return service_categories_dropdown_data;
  };

  prepare_services_json = (services) => {
    let services_dropdown_data = [];

    services.forEach(function (service) {
      services_dropdown_data.push({
        label: service.service_title,
        value: service.id,
      });
    });

    return services_dropdown_data;
  };

  prepare_clients_json = (clients) => {
    let clients_dropdown_data = [];

    clients.forEach(function (single_client) {
      if (single_client.first_name === null) {
        single_client.first_name = "Guest";
        single_client.last_name = "User";
      }

      clients_dropdown_data.push({
        label:
          single_client.first_name +
          " " +
          single_client.last_name +
          " - (" +
          single_client.membership_code +
          ") - 0" +
          single_client.phone,
        value: single_client.id,
      });
    });

    return clients_dropdown_data;
  };

  get_all_services = async () => {
    let services = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/services.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          services = response.data.services;
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

    return services;
  };

  get_all_clients = async () => {
    const { client_dropdown_input } = this.state;

    let clients = [];
    let self = this;
    var format = /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/;

    if (format.test(client_dropdown_input)) {
      NotificationManager.error(
        "Please enter valid phone or name",
        "",
        5000,
        () => {
          alert("callback");
        },
        null,
        "filled"
      );
    } else {
      if (client_dropdown_input.length > 4) {
        await trackPromise(
          axios({
            method: "get",
            url:
              servicePath +
              "/api/v2/users/user_search.json?client_search=" +
              client_dropdown_input,
            headers: {
              "Content-Type": "application/json",
              "AUTH-TOKEN": localStorage.getItem("auth_token"),
              "IS-ACCESSIBLE": true,
            },
          })
        )
          .then((response) => {
            if (response.status === 200) {
              clients = response.data.users;
              clients = self.prepare_clients_json(clients);
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
        return clients;
      }
    }
  };

  get_user = async (user_id) => {
    let user = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/users/" + user_id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          user = response.data;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          3000,
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
        console.log("error", error);
      });

    return user;
  };

  select_address = async (event) => {
    let address_id = parseInt(event.target.dataset.addressId);
    let city_id = parseInt(event.target.dataset.addressCityId);
    let address_boxes = document.getElementsByClassName("single-address-card");

    for (let i = 0; i < address_boxes.length; i++) {
      address_boxes[i].style.background = "#fff";
    }

    event.target.closest(".single-address-card").style.background = "#bad3f4";

    let service_categories = await this.get_all_service_categories(city_id);
    let service_categories_dropdown_json = this.prepare_service_categories_dropdown_json(
      service_categories
    );
    // await this.get_all_deals(city_id);

    this.setState({
      order_address_city_id: city_id,
      order_address_id: address_id,
      service_categories: service_categories,
      service_categories_dropdown_json: service_categories_dropdown_json,
    });
  };

  render_client_addresses = () => {
    let addresses_html = [];
    let self = this;
    const { current_client } = this.state;

    if (Object.keys(current_client).length) {
      // Current client is populated at the moment

      if (current_client.addresses.length) {
        // If addresses found. Still add "Add New Address" btn

        addresses_html.push(
          <>
            <div className="mt-4">
              <Button
                size="sm"
                type="button"
                style={{ float: "right" }}
                onClick={self.toggleNewAddressModal}
              >
                {" "}
                Add New Address{" "}
              </Button>
            </div>
          </>
        );

        current_client.addresses.forEach(function (single_address) {
          addresses_html.push(
            <>
              <Colxx xxs="6" className="mt-4">
                <Card className="single-address-card">
                  <CardBody>
                    <Button
                      size="sm"
                      type="button"
                      style={{ float: "right" }}
                      onClick={self.select_address}
                      data-address-id={single_address.id}
                      data-address-city-id={single_address.city_id}
                    >
                      {" "}
                      Choose{" "}
                    </Button>
                    <Label className="mt-2">
                      {" "}
                      <b> Tilte: </b> {single_address.address_title}{" "}
                    </Label>{" "}
                    <br />
                    <Label className="mt-2">
                      {" "}
                      <b> Address 1: </b> {single_address.address_1}{" "}
                    </Label>{" "}
                    <br />
                    <Label className="mt-2">
                      {" "}
                      <b> Address 2: </b> {single_address.address_2}{" "}
                    </Label>{" "}
                    <br />
                    <Label className="mt-2">
                      {" "}
                      <b> Zip Code: </b> {single_address.zip_code}{" "}
                    </Label>{" "}
                    <br />
                    <Label className="mt-2">
                      {" "}
                      <b> Landmark: </b> {single_address.landmark}{" "}
                    </Label>{" "}
                    <br />
                    <Label className="mt-2">
                      {" "}
                      <b> Area: </b> {single_address.area_name}{" "}
                    </Label>{" "}
                    <br />
                    <Label className="mt-2">
                      {" "}
                      <b> City: </b> {single_address.city_name}{" "}
                    </Label>{" "}
                    <br />
                  </CardBody>
                </Card>
              </Colxx>
            </>
          );
        });
      } else {
        addresses_html.push(
          <>
            <div className="mt-4">
              <span> No Address Found </span>
              <Button
                size="sm"
                type="button"
                style={{ float: "right" }}
                onClick={self.toggleNewAddressModal}
              >
                {" "}
                Add New Address{" "}
              </Button>
            </div>
          </>
        );
      }
    }

    return addresses_html;
  };

  create_address = async (event) => {
    event.preventDefault();
    const { current_client } = this.state;
    let form_data = new FormData(event.target);
    let new_address = {};

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/addresses.json?default_role=admin",
        data: form_data,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Address Created Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          new_address = response.data;
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

    if (Object.keys(new_address).length) {
      current_client.addresses.push(new_address);

      this.setState({
        current_client: current_client,
        new_address_modal: false,
      });
    } else {
      this.setState({
        current_client: current_client,
        new_address_modal: false,
      });
    }
  };

  render_new_address_modal = () => {
    // current_client
    const { new_address_modal, cities_json, current_client } = this.state;
    const areas = this.prepare_areas_json();

    let new_address_modal_html = (
      <>
        <Modal
          size="lg"
          isOpen={new_address_modal}
          toggle={this.toggleNewAddressModal}
          backdrop="static"
        >
          <div className="container">
            <ModalHeader>Add New Address</ModalHeader>

            <form onSubmit={this.create_address} autoComplete="off">
              <div className="row">
                <div className="col-md-12">
                  <Label className="mt-4"> Title * </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="address[address_title]"
                    defaultValue=""
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Label className="mt-4"> Address 1 * </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="address[address_1]"
                    defaultValue=""
                    required
                  />
                </div>

                <div className="col-md-6">
                  <Label className="mt-4"> Address 2 </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="address[address_2]"
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Label className="mt-4"> Zip Code </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="address[zip_code]"
                    defaultValue=""
                  />
                </div>

                <div className="col-md-6">
                  <Label className="mt-4"> Landmark </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="address[landmark]"
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="row mb-4">
                <Colxx xs="6">
                  <Label className="mt-4"> City * </Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="address[city_id]"
                    onChange={this.get_city_areas}
                    options={cities_json}
                  />
                </Colxx>
                <Colxx xs="6">
                  <Label className="mt-4"> Area * </Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="address[area_id]"
                    options={areas}
                  />
                </Colxx>

                {Object.keys(current_client).length > 0 ? (
                  <Input
                    className="form-control"
                    name="user_id"
                    type="text"
                    defaultValue={current_client.id}
                    hidden
                  />
                ) : (
                  ""
                )}

                <Input
                  className="form-control"
                  name="address[country_name]"
                  type="text"
                  defaultValue="+92"
                  hidden
                />
              </div>

              <ModalFooter>
                <Button color="primary"> Submit </Button>
                <Button color="secondary" onClick={this.toggleNewAddressModal}>
                  {" "}
                  Cancel{" "}
                </Button>
              </ModalFooter>
            </form>
          </div>
        </Modal>
      </>
    );

    return new_address_modal_html;
  };

  render_new_order_form = () => {
    let new_order_form = (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ModalHeader> Add New Order </ModalHeader>

              <ModalBody>
                <Label className="mt-4"> Order Date </Label>
                <DatePicker
                  selected={this.state.order_date}
                  onChange={this.handleChangeDate}
                  minDate={moment().toDate()}
                  name="order[order_at]"
                  autoComplete="off"
                />

                <Label for="order_time" className="mt-4">
                  Order Time
                </Label>
                <Input
                  className="form-control"
                  name="order[order_time]"
                  type="time"
                  id="order_time"
                  onChange={this.handleOrderTime}
                  required
                />

                <Label className="mt-4"> Clients </Label>
                {/* <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="order[client_id]"
                  onChange={this.handle_client_change}
                  options={clients_dropdown_json}
                /> */}
                <AsyncSelect
                  cacheOptions
                  loadOptions={this.get_all_clients}
                  defaultOptions
                  placeHolder="Search by name, id, phone"
                  onInputChange={this.handleInputChange}
                  onChange={this.handle_client_change}
                />

                {this.render_client_addresses()}
              </ModalBody>

              {this.render_categories_nav()}
              {this.render_services_data()}
            </CardBody>
          </Card>
        </Colxx>
      </>
    );

    return new_order_form;
  };

  capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  render_sub_category_options = (sub_category) => {
    let actions_html = "";

    actions_html = (
      <>
        <div>
          {sub_category === null
            ? "Services"
            : this.capitalizeFirstLetter(sub_category.service_category_title)}
        </div>
      </>
    );

    return actions_html;
  };

  render_services = (services, category = null, iteration_index = null) => {
    let services_html = [];
    const { data_found } = this.state;
    if (data_found === "services" && services.length === 0) {
      services_html.push(<> </>);
    } else {
      services_html.push(
        <>
          <Colxx xxs="8" style={{ float: "left" }}>
            <Card className="mb-4">
              <CardBody>
                <CardTitle className="text-center">
                  {category === null && data_found === "services"
                    ? "Services"
                    : data_found === "sub_categories"
                    ? this.render_sub_category_options(category)
                    : category}
                </CardTitle>
                <Table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>{this.render_service_table_row(services)}</tbody>
                </Table>
              </CardBody>
            </Card>
          </Colxx>
        </>
      );

      if (category === null) {
        services_html.push(this.render_cart());
      } else if (category !== null && iteration_index === 0) {
        services_html.push(this.render_cart());
      } else if (
        data_found === "single_deal" ||
        data_found === "multiple_deals"
      ) {
        services_html.push(this.render_cart());
      }
    }

    return services_html;
  };

  remove_from_cart = (event) => {
    let { cart } = this.state;
    let service_id = parseInt(event.target.dataset.serviceId);

    // Find service in cart
    let service = this.find_service_in_cart(service_id);

    if (Object.keys(service).length) {
      // Service found in cart
      // Now, find its unit_count and increment by 1
      cart.services.forEach(function (single_service, index) {
        if (single_service.id === service.id) {
          // Check if service unit count is greater than 1
          // If yes decrement count by 1
          // Other wise remove service from cart completely
          if (single_service.unit_count > 1) {
            single_service.unit_count -= 1;
            return false;
          } else if (single_service.unit_count === 1) {
            cart.services.splice(index, 1);
            return false;
          }
        }
      });
    }

    this.setState({
      cart: cart,
    });
  };

  list_cart_items = () => {
    const { cart } = this.state;
    let self = this;
    let cart_html = [];

    cart.services.forEach(function (single_service) {
      cart_html.push(
        <>
          <li
            style={{
              listStyleType: "none",
              padding: "5px",
              background: "#e5e5e5",
              borderRadius: "5px",
              margin: "5px",
            }}
          >
            <Row>
              <Colxx xxs="8">
                <span style={{ fontSize: "16px" }}>
                  {" "}
                  {single_service.service_title}{" "}
                </span>
              </Colxx>
              <Colxx xxs="4">
                <span
                  style={{
                    fontSize: "16px",
                    display: "inlint-block",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="simple-icon-minus"
                    onClick={self.remove_from_cart}
                    data-service-id={single_service.id}
                  />
                </span>
                <span style={{ fontSize: "16px" }}>
                  {" "}
                  {single_service.unit_count}{" "}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    display: "inlint-block",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="simple-icon-plus"
                    onClick={self.add_to_cart}
                    data-service-id={single_service.id}
                    data-service-title={single_service.service_title}
                  />
                </span>
              </Colxx>
            </Row>
          </li>

          {self.render_service_cart_addons(single_service)}

          {/* Render is same time true/false logic here */}
          {self.render_is_same_time(single_service)}
        </>
      );
    });

    return cart_html;
  };

  onChangeRadio = (event, service) => {
    let { cart } = this.state;
    let eventElem = event;

    cart.services.forEach(function (single_service, index) {
      if (single_service.id === service.id) {
        cart.services[index].is_same_time = eventElem.target.value;
      }
    });

    this.setState({
      cart: cart,
    });
  };

  render_is_same_time = (single_service) => {
    let is_same_time_html = <> </>;

    if (single_service.unit_count > 1) {
      is_same_time_html = (
        <>
          <label style={{ padding: "5px" }}>
            <input
              style={{ margin: "5px" }}
              type="radio"
              value="true"
              checked={single_service.is_same_time === "true"}
              onChange={(event) => this.onChangeRadio(event, single_service)}
            />
            Same time
          </label>

          <label style={{ padding: "5px" }}>
            <input
              style={{ margin: "5px" }}
              type="radio"
              value="false"
              checked={single_service.is_same_time === "false"}
              onChange={(event) => this.onChangeRadio(event, single_service)}
            />
            One after another
          </label>
        </>
      );
    }

    return is_same_time_html;
  };

  render_service_cart_addons = (single_service) => {
    let cart_service_addons = [];
    let self = this;

    single_service.order_service_addons_attributes.forEach((service_addon) => {
      cart_service_addons.push(
        <>
          <li
            style={{
              listStyleType: "none",
              padding: "5px",
              background: "#e5e5e5",
              borderRadius: "5px",
              margin: "5px",
              width: "75%",
              borderTopRightRadius: "20px",
              borderBottomRightRadius: "20px",
            }}
          >
            <Row>
              <Colxx xxs="8">
                <span style={{ fontSize: "16px" }}>
                  {" "}
                  {service_addon.service_title}{" "}
                </span>
              </Colxx>
              <Colxx xxs="4">
                <span
                  style={{
                    fontSize: "14px",
                    display: "inline-block",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="simple-icon-minus"
                    style={{ cursor: "pointer" }}
                    onClick={(event) => self.add_remove_addon_to_cart(event)}
                    data-action="remove"
                    data-addon-id={service_addon.service_id}
                    data-service-id={single_service.id}
                    data-addon-title={service_addon.addon_title}
                  />
                </span>

                <span style={{ fontSize: "16px" }}>
                  {" "}
                  {service_addon.unit_count}{" "}
                </span>

                <span style={{ fontSize: "14px", display: "inline-block" }}>
                  <i
                    className="simple-icon-plus"
                    style={{ cursor: "pointer" }}
                    onClick={(event) => self.add_remove_addon_to_cart(event)}
                    data-action="add"
                    data-addon-id={service_addon.service_id}
                    data-service-id={single_service.id}
                    data-addon-title={service_addon.addon_title}
                  />
                </span>
              </Colxx>
            </Row>
          </li>
        </>
      );
    });

    return cart_service_addons;
  };

  render_cart = () => {
    let cart_html = (
      <>
        <Colxx xxs="4" style={{ float: "right" }}>
          <Card
            className="mb-4"
            style={{ height: "400px", overflow: "scroll" }}
          >
            <CardBody style={{ padding: "10px" }}>
              <CardTitle className="text-center mb-1"> My Cart </CardTitle>
              {this.list_cart_items()}
            </CardBody>
          </Card>

          <Button size="lg" onClick={this.create_order}>
            {" "}
            Checkout{" "}
          </Button>
        </Colxx>
      </>
    );

    return cart_html;
  };

  prepare_order_json = () => {
    const {
      cart,
      order_date,
      order_time,
      special_notes,
      current_client,
      order_address_id,
    } = this.state;

    let order_json = {};
    order_json.order = {};
    order_json.order.order_date = order_date.format("YYYY-MM-DD");
    order_json.order.order_time = order_time;
    order_json.order.address_id = order_address_id;
    order_json.order.phone = current_client.phone;
    order_json.order.special_notes = special_notes;
    order_json.order.client_id = current_client.id;

    order_json.order.order_services_attributes = [];

    cart.services.forEach(function (single_service) {
      order_json.order.order_services_attributes.push({
        unit_count: single_service.unit_count,
        is_same_time: single_service.is_same_time,
        service_id: single_service.id,
        order_service_addons_attributes:
          single_service.order_service_addons_attributes,
      });
    });

    return order_json;
  };

  create_order = async () => {
    let order_json = [];
    let self = this;
    const { order_date } = this.state;
    let success = false;
    if (order_date === null) {
      NotificationManager.error(
        "Please Enter the Date of Order",
        "",
        5000,
        () => {
          alert("callback");
        },
        null,
        "filled"
      );
    } else {
      order_json = self.prepare_order_json();
      await trackPromise(
        axios({
          method: "post",
          url: servicePath + "/api/v2/orders.json?default_role=admin",
          data: order_json,
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
            "DEVICE-TYPE": "admin",
            "IS-ACCESSIBLE": true,
          },
        })
      )
        .then((response) => {
          if (response.status === 200) {
            if (response.data.order.order_billing.coupon_discount > 0) {
              success = true;
            } else {
              success = false;
            }
            this.setState({
              order: response.data,
              is_coupon_applied: success,
              order_billing: response.data.order.order_billing,
              coupon_details: response.data.order.coupon_details,
              modalOpen: !this.state.modalOpen,
            });
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
    }
  };

  update_order = async () => {
    let order_json = this.prepare_order_json();
    const { order, coupon_code, is_coupon_applied } = this.state;
    let cc = "";
    if (is_coupon_applied && coupon_code !== undefined) {
      cc = coupon_code;
    }
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/orders.json?default_role=admin",
        data: {
          order_id: order.order.id,
          order: order_json.order,
          coupon_code: cc,
        },
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "DEVICE-TYPE": "admin",
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Order created successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          this.props.history.push("/app/orders/show/" + response.data.order.id);
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

  render_services_titles_from_summary = (services) => {
    let summary_services_html = [];
    let self = this;

    // First find all services with same name.

    services.forEach((single_service_data) => {
      summary_services_html.push(
        <>
          <li style={{ "margin-bottom": "10px", "padding-bottom": "5px" }}>
            <span>
              {" "}
              {single_service_data.is_deal === true ? (
                <>
                  {single_service_data.service_title}{" "}
                  <Badge color="success">Deal</Badge>
                </>
              ) : (
                <>{single_service_data.service_title}</>
              )}{" "}
            </span>{" "}
            <br />
            {self.render_service_addons_titles_from_summary(
              single_service_data
            )}
          </li>
        </>
      );
    });

    return summary_services_html;
  };

  render_service_addons_titles_from_summary = (single_service_data) => {
    let addons_title_html = [];
    if (single_service_data.order_service_addons.length) {
      single_service_data.order_service_addons.forEach(
        (single_service_addon) => {
          addons_title_html.push(
            <>
              <span style={{ marginLeft: "15px", color: "grey" }}>
                - {single_service_addon.service_title} <br />
              </span>
            </>
          );
        }
      );
    }

    return addons_title_html;
  };

  render_services_quantities_from_summary = (services) => {
    let summary_services_html = [];
    let self = this;

    services.forEach((single_service_data) => {
      summary_services_html.push(
        <>
          <li style={{ marginBottom: "10px", paddingBottom: "5px" }}>
            <span> {single_service_data.unit_count} </span> <br />
            {self.render_service_addons_quantities_from_summary(
              single_service_data
            )}
          </li>
        </>
      );
    });

    return summary_services_html;
  };

  render_service_addons_quantities_from_summary = (single_service_data) => {
    let addons_quantities_html = [];
    if (single_service_data.order_service_addons.length) {
      single_service_data.order_service_addons.forEach(
        (single_service_addon) => {
          addons_quantities_html.push(
            <>
              <span style={{ color: "grey" }}>
                {single_service_addon.unit_count} <br />
              </span>
            </>
          );
        }
      );
    }

    return addons_quantities_html;
  };

  render_services_prices_from_summary = (services) => {
    let summary_services_html = [];
    let self = this;
    services.forEach((single_service_data) => {
      summary_services_html.push(
        <>
          <li style={{ "margin-bottom": "10px", "padding-bottom": "5px" }}>
            <span>
              {" "}
              {single_service_data.is_deal === true ? (
                <>
                  <del>{single_service_data.total_price}</del>{" "}
                  {single_service_data.discounted_price}
                </>
              ) : (
                <>{single_service_data.total_price}</>
              )}
            </span>{" "}
            <br />
            {self.render_service_addons_prices_from_summary(
              single_service_data
            )}
          </li>
        </>
      );
    });

    return summary_services_html;
  };

  render_service_addons_prices_from_summary = (single_service_data) => {
    let addons_prices_html = [];
    if (single_service_data.order_service_addons.length) {
      single_service_data.order_service_addons.forEach(
        (single_service_addon) => {
          addons_prices_html.push(
            <>
              <span style={{ color: "grey" }}>
                {single_service_addon.total_price} <br />
              </span>
            </>
          );
        }
      );
    }

    return addons_prices_html;
  };

  render_services_summary_in_new_order = () => {
    const { order } = this.state;
    let self = this;
    const services_summary = order.order.services_summary;
    let services_summary_html = [];

    services_summary.forEach((single_summary) => {
      services_summary_html.push(
        <>
          <tr>
            <td>
              {" "}
              <small>{single_summary.service_category_title}</small>{" "}
            </td>
            <td>
              <ul style={{ "list-style-type": "none", "padding-left": "0px" }}>
                {self.render_services_titles_from_summary(
                  single_summary.services
                )}
              </ul>
            </td>
            <td>
              <ul style={{ "list-style-type": "none", "padding-left": "0px" }}>
                {self.render_services_quantities_from_summary(
                  single_summary.services
                )}
              </ul>
            </td>
            <td>
              <ul style={{ "list-style-type": "none", "padding-left": "0px" }}>
                {self.render_services_prices_from_summary(
                  single_summary.services
                )}
              </ul>
            </td>
          </tr>
        </>
      );
    });

    return services_summary_html;
  };

  apply_coupon = async (event) => {
    event.preventDefault();
    const { order } = this.state;
    let coupon_code = event.target.elements["coupon_code"].value;
    let self = this;
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/coupons/check_coupon_validity.json",
        data: {
          order_id: order.order.id,
          coupon_code: coupon_code,
        },
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            order_billing: response.data.order_billing,
            coupon_code: coupon_code,
            is_coupon_applied: true,
            coupon_details: response.data.coupon_details,
          });
          NotificationManager.success(
            "Coupon Applied Sucessfully",
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
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
        self.setState({
          is_coupon_applied: false,
        });
        console.log("error", error);
      });
  };

  cancel_coupon = async (event) => {
    event.preventDefault();
    event.target.parentNode.previousElementSibling.children.coupon_code.value =
      "";
    const { order, coupon_code } = this.state;
    let self = this;
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/coupons/cancel_coupon.json",
        data: {
          order_id: order.order.id,
          coupon_code: coupon_code,
        },
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            order_billing: response.data.order_billing,
            coupon_code: coupon_code,
            is_coupon_applied: false,
            coupon_details: [],
          });
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

  render_order_summary_modal = () => {
    const {
      modalOpen,
      order,
      current_client,
      order_billing,
      is_coupon_applied,
      coupon_details,
    } = this.state;

    const address = order.order.address;
    let self = this;
    let order_summary_html = (
      <>
        <Modal
          isOpen={modalOpen}
          toggle={this.toggleModal}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <section className="cutomer-recep">
            <div className="customer-dtl">
              <div className="date-time">
                <label>
                  {moment(order.order.order_date).format("MMM DD, YYYY")}
                </label>
                <label>{order.order.order_time}</label>
              </div>
              <div className="personal-dtl">
                <label>
                  {current_client.first_name + " " + current_client.last_name}
                  <small>( {current_client.membership_code} )</small>
                </label>
                <address>
                  {address.address_1 === null ? "" : address.address_1 + ", "}
                  {address.area.area + ", " + address.city.city_name}
                </address>
                <label>{order.order.phone}</label>
              </div>
            </div>
            <div className="order-summary">
              <table class="table table-borderless">
                <thead>
                  <tr>
                    <th scope="col"> Categories </th>
                    <th scope="col"> Services </th>
                    <th scope="col"> Qty </th>
                    <th scope="col"> Price </th>
                  </tr>
                </thead>
                <tbody>{this.render_services_summary_in_new_order()}</tbody>
              </table>
              <div className="d-flex justify-content-between flex-md-row flex-sm-column-reverse">
                <div className="summary-inst">
                  {/* <label>Special Instructions</label>
                <div className="form-group">
                  <textarea
                    className="instr"
                    rows="4"
                    id="comment"
                    placeholder="special instructions"
                  >
                    Proin ex ipsum, facilisis id tincidunt sed, vulputate in
                    lacus. Donec pharetra faucibus leo, vitae vestibulum leo
                    scelerisque eu. Nam enim dolor...
                  </textarea>
                </div> */}
                </div>
                <div className="total-bill">
                  <table>
                    <tr>
                      <td></td>
                      <td>Services Charges</td>
                      <td>Rs. {order_billing.actual_price}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>Travel Charges</td>
                      <td>Rs. {order_billing.travel_charges}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>Discount</td>
                      <td>Rs. {order_billing.discount}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>Deals Discount</td>
                      <td>Rs. {order_billing.deal_discount}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>Coupon Discount</td>
                      <td>Rs. {order_billing.coupon_discount}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>Grand Total</td>
                      <td> Rs. {order_billing.net_total}</td>
                    </tr>
                  </table>
                  <form onSubmit={self.apply_coupon} autoComplete="off">
                    <Row>
                      <Colxx md="4">
                        <Label>Enter Coupon Code(if any)</Label>
                      </Colxx>
                      {is_coupon_applied && coupon_details !== undefined ? (
                        <>
                          <Colxx md="4">
                            <Input
                              type="text"
                              name="coupon_code"
                              readOnly
                              value={coupon_details.coupon_code}
                            />
                          </Colxx>
                          <Colxx md="4">
                            <Button
                              className="ml-2"
                              onClick={(event) => self.cancel_coupon(event)}
                            >
                              Cancel
                            </Button>
                          </Colxx>
                        </>
                      ) : (
                        <>
                          <Colxx md="4">
                            <Input
                              type="text"
                              name="coupon_code"
                              defaultValue=""
                              required
                            />
                          </Colxx>
                          <Colxx md="4">
                            <Button type="submit">Apply</Button>
                          </Colxx>
                        </>
                      )}
                      {/* <Colxx md="3">
                        <Input type="text" name="coupon_code" required />
                      </Colxx>
                      <Colxx md="5">
                        <Button type="submit">Apply</Button>
                        {is_coupon_applied ? (
                          <>
                            <Button
                              className="ml-2"
                              onClick={(event) => self.cancel_coupon(event)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <></>
                        )}
                      </Colxx> */}
                    </Row>
                  </form>
                </div>
              </div>
              {is_coupon_applied && coupon_details !== undefined ? (
                <>
                  <table class="table table-borderless">
                    <thead>
                      <tr>
                        <th scope="col"> Title </th>
                        <th scope="col"> Code </th>
                        <th scope="col"> Discount </th>
                        <th scope="col"> Redeem </th>
                        <th scope="col"> Expiry Date </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{coupon_details.coupon_title}</td>
                        <td>{coupon_details.coupon_code}</td>
                        <td>
                          {coupon_details.discount_type === "percentage" ? (
                            <>
                              {coupon_details.discount} {"%"}
                            </>
                          ) : (
                            <>{coupon_details.discount}</>
                          )}
                        </td>
                        <td>
                          {coupon_details.self_redeemed}/
                          {coupon_details.usage_user_limit}
                        </td>
                        <td>{coupon_details.end_datetime}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <></>
              )}
            </div>
            <div
              className="text-right mt-5"
              style={{ "padding-right": "62px" }}
            >
              <a href="" className="cancel-btn" onClick={this.toggleModal}>
                Cancel Order
              </a>
              <a className="done-btn" onClick={this.update_order}>
                Submit Order
              </a>
            </div>
          </section>
        </Modal>
      </>
    );

    return order_summary_html;
  };

  render_service_table_row = (services) => {
    const { data_found } = this.state;
    let services_rows = [];
    let self = this;
    services.forEach(function (single_service, index) {
      services_rows.push(
        <>
          <tr>
            <td> {index + 1} </td>
            <td>
              {single_service.discount_price > 0 ? (
                <>
                  {single_service.service_title}
                  <Badge color="success">Deal</Badge>
                </>
              ) : (
                <>{single_service.service_title}</>
              )}

              {single_service.service_addons !== undefined &&
              single_service.service_addons.length > 0 ? (
                <>
                  {data_found === "single_deal" ||
                  data_found === "multiple_deals" ? (
                    <>
                      <span
                        className="ads-on"
                        onClick={(event) =>
                          self.render_addons(event, single_service.service_id)
                        }
                        style={{
                          fontSize: "12px",
                          color: "#2fb5f6",
                          paddingLeft: "20px",
                          cursor: "pointer",
                        }}
                      >
                        Add-ons
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="ads-on"
                        onClick={(event) =>
                          self.render_addons(event, single_service.id)
                        }
                        style={{
                          fontSize: "12px",
                          color: "#2fb5f6",
                          paddingLeft: "20px",
                          cursor: "pointer",
                        }}
                      >
                        Add-ons
                      </span>
                    </>
                  )}
                </>
              ) : (
                <></>
              )}
            </td>
            <td> {self.time_convert(single_service.service_duration)} </td>
            <td>
              {" "}
              {single_service.discount_price > 0 ? (
                <>
                  <strike>Rs. {single_service.service_price}</strike>
                  {" Rs. "}
                  {single_service.discount_price}
                </>
              ) : (
                <>{single_service.service_price}</>
              )}{" "}
            </td>
            <td className="text-right">
              {data_found === "single_deal" ||
              data_found === "multiple_deals" ? (
                <>
                  <Button
                    size="sm mr-2"
                    data-service-id={single_service.service_id}
                    data-service-title={single_service.service_title}
                    onClick={self.add_to_cart}
                  >
                    Add
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm mr-2"
                    data-service-id={single_service.id}
                    data-service-title={single_service.service_title}
                    onClick={self.add_to_cart}
                  >
                    Add
                  </Button>
                </>
              )}
            </td>
          </tr>
        </>
      );
    });

    return services_rows;
  };

  get_service = async (service_id) => {
    let service = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/services/" + service_id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          service = response.data;
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

    return service;
  };

  render_addons = async (event, service_id) => {
    let service = await this.get_service(service_id);

    this.setState({
      current_service: service,
      current_service_addons: service.service_addons,
      toggle_addons_modal: !this.state.toggle_addons_modal,
    });
  };

  render_addon_table_row = (service_addons) => {
    let services_addons_rows = [];
    let self = this;

    service_addons.forEach(function (single_addon, index) {
      services_addons_rows.push(
        <>
          <tr>
            <td> {index + 1} </td>
            <td> {single_addon.addon_title} </td>
            <td> {self.time_convert(single_addon.addon_duration)} </td>
            <td> {single_addon.service_addon_price} </td>
            <td className="text-right">
              <span
                style={{
                  fontSize: "14px",
                  display: "inline-block",
                  cursor: "pointer",
                }}
              >
                <i
                  className="simple-icon-minus"
                  style={{ cursor: "pointer" }}
                  onClick={(event) => self.add_remove_addon_to_cart(event)}
                  data-action="remove"
                  data-addon-id={single_addon.service_addon_id}
                  data-service-id={single_addon.service_id}
                  data-addon-title={single_addon.addon_title}
                />
              </span>

              <span style={{ fontSize: "18px", margin: "0 5px" }}>
                {" "}
                {self.fetch_service_addon_count_in_cart(
                  single_addon.service_addon_id,
                  single_addon.service_id
                )}{" "}
              </span>

              <span style={{ fontSize: "14px", display: "inline-block" }}>
                <i
                  className="simple-icon-plus"
                  style={{ cursor: "pointer" }}
                  onClick={(event) => self.add_remove_addon_to_cart(event)}
                  data-action="add"
                  data-addon-id={single_addon.service_addon_id}
                  data-service-id={single_addon.service_id}
                  data-addon-title={single_addon.addon_title}
                />
              </span>
            </td>
          </tr>
        </>
      );
    });

    return services_addons_rows;
  };

  fetch_service_addon_count_in_cart = (addon_id, service_id) => {
    let { cart } = this.state;
    let addon_count = 0;

    // Find service in cart
    let service = this.find_service_in_cart(service_id);

    if (Object.keys(service).length) {
      // Service found in cart
      // Now, find its unit_count and increment by 1
      cart.services.forEach(function (single_service, index) {
        if (single_service.id === parseInt(service_id)) {
          // Service found in cart. Now, find its respective addon

          single_service.order_service_addons_attributes.forEach(function (
            single_addon,
            innerIndex
          ) {
            if (single_addon.service_id === parseInt(addon_id)) {
              // Addon found in cart
              addon_count = single_addon.unit_count;
              return false;
            }
          });
        }
      });
    }

    return addon_count;
  };

  add_remove_addon_to_cart = (event) => {
    let service_id = parseInt(event.target.dataset.serviceId);
    let addon_id = parseInt(event.target.dataset.addonId);
    let addon_title = event.target.dataset.addonTitle;
    let { cart } = this.state;
    let service_obj = {};

    if (event.target.dataset.action === "remove") {
      // first find service from state

      cart.services.forEach((single_obj) => {
        if (single_obj.id === service_id) {
          service_obj = single_obj;
          return false;
        }
      });

      if (Object.keys(service_obj).length) {
        // Service is present in state. So, find it's addon now

        cart.services.forEach((single_service, index) => {
          if (single_service.id === service_id) {
            let addon_obj = {};

            single_service.order_service_addons_attributes.forEach(
              (single_obj) => {
                if (single_obj.service_id === addon_id) {
                  addon_obj = single_obj;
                }
              }
            );

            if (Object.keys(addon_obj).length) {
              // Addon is found in service

              if (addon_obj.unit_count === 1) {
                cart.services[index].order_service_addons_attributes.filter(
                  (single_service_addon, innerIndex) => {
                    if (single_service_addon.service_id === addon_id) {
                      cart.services[
                        index
                      ].order_service_addons_attributes.splice(innerIndex, 1);
                    }
                    return single_service_addon;
                  }
                );
              } else if (addon_obj.unit_count > 1) {
                // Addon is present in cart for this service. Hence, decrease count

                // Work pending for new addon in old service. In that case, we will remove instead of setting count to 0

                cart.services[index].order_service_addons_attributes.filter(
                  (single_service_addon, innerIndex) => {
                    if (single_service_addon.service_id === addon_id) {
                      cart.services[index].order_service_addons_attributes[
                        innerIndex
                      ].unit_count -= 1;
                    }
                    return single_service_addon;
                  }
                );
              }
            }
          }
        });
      }
    } else if (event.target.dataset.action === "add") {
      // first find service from state

      cart.services.forEach((single_service) => {
        if (single_service.id === service_id) {
          service_obj = single_service;
        }
      });

      if (Object.keys(service_obj).length) {
        // Service is present in state. So, find it's addon now

        cart.services.forEach((single_service, index) => {
          if (single_service.id === service_id) {
            let addon_obj = {};
            single_service.order_service_addons_attributes.forEach(
              (single_obj) => {
                if (single_obj.service_id === addon_id) {
                  addon_obj = single_obj;
                }
              }
            );

            if (Object.keys(addon_obj).length) {
              // Addon is present in cart for this service. Hence, increase count
              cart.services[index].order_service_addons_attributes.forEach(
                (single_service_addon, innerIndex) => {
                  if (single_service_addon.service_id === addon_id) {
                    cart.services[index].order_service_addons_attributes[
                      innerIndex
                    ].unit_count += 1;
                  }
                }
              );
            } else {
              // Addon is not present in cart for that service. Hence, add it first time
              cart.services[index].order_service_addons_attributes.push({
                service_id: addon_id,
                service_title: addon_title,
                unit_count: 1,
              });
            }
          }
        });
      } else {
        // This service is not added in cart, hence, cannot add it's addon
      }
    }

    this.setState({
      cart: cart,
    });
  };

  time_convert = (time_in_minutes) => {
    let hours = Math.floor(time_in_minutes / 60);
    let minutes = time_in_minutes % 60;
    let return_time = "";

    if (hours === 0) {
      if (minutes > 0) return_time = minutes + " Minutes";
    } else if (hours > 1) {
      hours = hours + " hrs";
      if (minutes === 0) return_time = hours;
      else if (minutes > 0) return_time = hours + " " + minutes + " Minutes";
    } else if (hours === 1) {
      hours = hours + " hr";
      if (minutes === 0) return_time = hours;
      else if (minutes > 0) return_time = hours + " " + minutes + " Minutes";
    }

    return return_time;
  };

  render_addons_list = (service_addons) => {
    let addons_table_html = [];

    addons_table_html.push(
      <>
        <Table>
          <thead>
            <tr>
              <th> # </th>
              <th> Title </th>
              <th> Duration </th>
              <th> Price </th>
              <th> </th>
            </tr>
          </thead>
          <tbody>{this.render_addon_table_row(service_addons)}</tbody>
        </Table>
      </>
    );
    return addons_table_html;
  };

  toggle_addons_modal = () => {
    this.setState({
      toggle_addons_modal: !this.state.toggle_addons_modal,
    });
  };

  render_addons_modal = () => {
    const { current_service_addons } = this.state;

    let addons_modal_html = (
      <>
        <Modal
          size="lg"
          isOpen={this.state.toggle_addons_modal}
          toggle={this.toggle_addons_modal}
        >
          <ModalHeader toggle={this.toggle_addons_modal}>Add Ons</ModalHeader>
          <ModalBody>
            {current_service_addons.length === 0
              ? ""
              : this.render_addons_list(current_service_addons)}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle_addons_modal}>
              {" "}
              Submit{" "}
            </Button>
            <Button color="secondary" onClick={this.toggle_addons_modal}>
              {" "}
              Cancel{" "}
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );

    return addons_modal_html;
  };

  find_service_from_categories = (service_id) => {
    const { services } = this.state;

    let service = services.filter(
      (single_service) => single_service.id === service_id
    )[0];
    if (service === undefined) {
      service = {};
    }
    return service;
  };

  find_service_in_cart = (service_id) => {
    const { cart } = this.state;
    let service = cart.services.filter(
      (single_service) => single_service.id === service_id
    )[0];
    if (service === undefined) {
      service = {};
    }
    return service;
  };

  add_to_cart = (event) => {
    let { cart } = this.state;
    let service_id = parseInt(event.target.dataset.serviceId);
    let service_title = event.target.dataset.serviceTitle;
    // let service = this.find_service_from_categories(service_id);

    // Check if service is already present in cart
    let service_in_cart = this.find_service_in_cart(service_id);

    if (Object.keys(service_in_cart).length) {
      // Service is already present in cart
      // Now, find its unit_count and increment by 1
      cart.services.forEach(function (single_service) {
        if (single_service.id === service_in_cart.id) {
          single_service.unit_count += 1;
        }
      });
    } else {
      // Service not found in cart
      cart.services.push({
        id: service_id,
        service_title: service_title,
        unit_count: 1,
        is_same_time: "true",
        order_service_addons_attributes: [],
      });
    }

    this.setState({
      cart: cart,
    });
  };

  render_services_data = () => {
    const {
      services,
      sub_categories,
      data_found,
      deals,
      all_deals,
    } = this.state;

    let self = this;
    let sub_category_services_html = [];

    if (data_found === "services") {
      return <>{this.render_services(services)}</>;
    } else if (data_found === "single_deal") {
      return <>{this.render_services(services, deals.deal_title)}</>;
    } else if (data_found === "multiple_deal") {
      all_deals.forEach((single_deal, index) => {
        sub_category_services_html.push(
          self.render_services(
            single_deal.deal_services,
            single_deal.deal_title,
            index
          )
        );
      });
      return sub_category_services_html;
    } else if (data_found === "sub_categories") {
      sub_categories.forEach((single_category, index) => {
        sub_category_services_html.push(
          self.render_services(single_category.services, single_category, index)
        );
      });
      return sub_category_services_html;
    }
  };

  render_categories_nav_list_item = () => {
    const { service_categories } = this.state;
    let self = this;
    let category_list_item = [];

    service_categories.forEach(function (category) {
      category_list_item.push(
        <>
          <li className="nav-item">
            <a
              className="nav-link"
              href="#"
              data-service-category-id={category.id}
              onClick={async (event) => {
                self.fetch_category_services(event);
              }}
            >
              {" "}
              {category.service_category_title}{" "}
            </a>
          </li>
        </>
      );
    });

    return category_list_item;
  };

  render_categories_nav = () => {
    let categories_nav = (
      <>
        <section className="service">
          <div className="services-tabs">
            <div className="container">
              <ul
                className="nav nav-pills d-flex justify-content-lg-center"
                id="pills-tab"
                role="tablist"
              >
                {this.render_categories_nav_list_item()}
                {/* {this.state.order_address_city_id !== null ? (
                  <>
                    <li calssName="nav-item" style={{ marginTop: "9px" }}>
                      <a calssName="nav-link" 
                          href="#" 
                          // data-service-category-id={category.id}
                          onClick={async (event) => {
                            this.get_all_deals(event);
                        }}>
                        Deals
                      </a>
                    </li>
                  </>
                ) : (
                  <></>
                )} */}
              </ul>
            </div>
          </div>
        </section>
      </>
    );

    return categories_nav;
  };

  render_top_nav = () => {
    let top_nav_html = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1> New Order </h1>
            </div>
            <Separator className="mb-5" />
          </Colxx>
        </Row>
      </>
    );

    return top_nav_html;
  };

  render() {
    const { order, cities } = this.state;

    if (Object.keys(cities).length === 0) {
      return <>{this.render_top_nav()}</>;
    } else {
      return (
        <>
          {this.render_top_nav()}
          {this.render_new_order_form()}
          {this.render_addons_modal()}
          {this.render_new_address_modal()}
          {Object.keys(order).length > 0
            ? this.render_order_summary_modal()
            : ""}
        </>
      );
    }
  }
}
export default NewOrder;
