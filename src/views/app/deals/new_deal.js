import React from "react";
import {
  CustomInput,
  Card,
  CardBody,
  Button,
  Row,
  Input,
  Label,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";

import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/deals.json";

class AddDealModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
      services_data_rendered_info: [],
      services_data_info: [
        {
          city_id: 27,
          services: [
            {
              id: 99,
              service_title: "",
              price: 100,
            },
          ],
        },
      ],
      addons: [],
      is_global: false,
      addons_dropdown_json: [],
      city_services: [],
      city_services_dropdown: [],
      servicePrice: "",
      discount_types: [
        { label: "Percentage", value: "percentage" },
        { label: "Price", value: "price" },
      ],
      services: [{ cityId: "", current_service_length: 1 }],
      current_service_length: 1,
    };

    this.cities_dropdown_json = this.cities_dropdown_json.bind(this);
    this.get_all_cities = this.get_all_cities.bind(this);
    this.handle_city_change = this.handle_city_change.bind(this);
    this.render_new_deal_form = this.render_new_deal_form.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.create_deal = this.create_deal.bind(this);
    this.get_all_services = this.get_all_services.bind(this);
  }

  componentDidMount = async () => {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    let all_service_categories = await this.get_all_service_categories();
    let service_categories_dropdown_data = this.service_categories_dropdown(
      all_service_categories
    );

    let all_services = await this.get_all_services();
    let services_dropdown_data = this.city_services_dropdown(all_services);

    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
      service_categories: all_service_categories,
      service_categories_dropdown: service_categories_dropdown_data,
      city_services: all_services,
      city_services_dropdown: services_dropdown_data,
    });
  };

  get_all_cities = async () => {
    let all_cities = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/cities.json",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
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

  cities_dropdown_json = (all_cities) => {
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

  handle_city_change = async (cities) => {
    if (cities.length > 0) {
      let city_id = cities.slice(-1).pop().value;
      let all_services = await this.get_all_services(city_id);
      let services_dropdown_data = this.city_services_dropdown(
        all_services,
        city_id
      );

      this.setState({
        city_services: all_services,
        city_services_dropdown: services_dropdown_data,
        cities_data_rendered_info: cities,
      });
    } else {
      this.setState({
        cities_data_rendered_info: cities,
      });
    }
  };

  handle_service_change = async (services) => {
    let { services_data_rendered_info } = this.state;

    if (services.length > services_data_rendered_info.length) {
      let service = services.slice(-1).pop();
      // let service_price = await this.getServicePrice(service.value);

      let updated_service_state = [...services_data_rendered_info, service];

      this.setState({
        services_data_rendered_info: updated_service_state,
        // servicePrice: service_price,
      });
    } else {
      this.setState({
        services_data_rendered_info: services,
      });
    }
  };

  get_all_services = async () => {
    let all_services = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/services/services_for_deal.json?default_role=admin",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_services = response.data.services.sort(
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

    return all_services;
  };

  city_services_dropdown = (all_services, city_id) => {
    let services_dropdown_data = [];

    all_services.forEach(function (currentValue) {
      services_dropdown_data.push({
        label: currentValue.service_title,
        value: currentValue.id,
        key: currentValue.service_price,
        cities: currentValue.service_cities,
      });
    });
    return services_dropdown_data;
  };

  get_all_service_categories = async () => {
    let all_services = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath + "/api/v2/service_categories/categories_for_deal.json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_services = response.data.service_categories.sort(
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

    return all_services;
  };

  service_categories_dropdown = (service_categories, city_id) => {
    let services_dropdown_data = [];

    service_categories.forEach(function (currentValue) {
      services_dropdown_data.push({
        label: currentValue.service_category_title,
        value: currentValue.id,
        key: currentValue.id,
        cities: currentValue.service_category_cities,
      });
    });
    return services_dropdown_data;
  };

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  handleCheckGlobal = (event) => {
    let self = this;
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
      self.setState({
        is_global: true,
      });
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
      self.setState({
        is_global: false,
      });
    }
  };

  handleChangeDateTime = (date) => {
    this.setState({
      startDateTime: date,
    });
  };

  handleChangeEndDateTime = (date) => {
    this.setState({
      endDateTime: date,
    });
  };

  getServicePrice = async (service) => {
    let service_price = 0;
    let self = this;
    await trackPromise(
      axios.get(servicePath + "/api/v2/services/" + service + ".json", {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          service_price = response.data.service_cities[0].price;
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
    return service_price;
  };

  create_deal = async (event) => {
    event.preventDefault();
    let success = true;
    const { services_data_rendered_info } = this.state;
    if (
      event.target.elements[
        "deal[deal_services_attributes][][city_id_check]"
      ] !== undefined &&
      event.target.elements["deal[deal_services_attributes][][city_id_check]"]
        .length > 0
    ) {
      event.target.elements[
        "deal[deal_services_attributes][][city_id_check]"
      ].forEach((city) => {
        if (city.value === "false") {
          city.parentElement.parentElement.remove();
        }
      });
    }
    let formData = new FormData(event.target);
    if (event.target.elements["deal[deal_banner]"].files.length > 0) {
      let deal_banner = event.target.elements["deal[deal_banner]"].files[0];
      if (deal_banner.size <= 180000) {
        formData.append("deal[deal_banner]", deal_banner, deal_banner.name);
      } else {
        success = false;
      }
    }
    if (event.target.elements["deal[deal_icon_pdf]"].files.length > 0) {
      let deal_icon_pdf = event.target.elements["deal[deal_icon_pdf]"].files[0];
      formData.append("deal[deal_icon_pdf]", deal_icon_pdf, deal_icon_pdf.name);
    }
    if (event.target.elements["deal[deal_icon_svg]"].files.length > 0) {
      let deal_icon_svg = event.target.elements["deal[deal_icon_svg]"].files[0];
      formData.append("deal[deal_icon_svg]", deal_icon_svg, deal_icon_svg.name);
    }
    if (
      event.target.elements["deal[is_global_deal]"].value === "false" &&
      services_data_rendered_info.length <= 0
    ) {
      NotificationManager.error(
        "Deal services can't be empty",
        "",
        3000,
        null,
        null,
        "filled"
      );
    } else if (
      event.target.elements["deal[is_global_deal]"].value === "true" &&
      event.target.elements["deal[deal_categories_attributes][][category_id]"]
        .length === undefined &&
      event.target.elements["deal[deal_categories_attributes][][category_id]"]
        .value === ""
    ) {
      NotificationManager.error(
        "Deal Categories can't be empty",
        "",
        3000,
        null,
        null,
        "filled"
      );
    } else if (
      event.target.elements["deal[is_global_deal]"].value === "true" &&
      event.target.elements["deal[deal_cities_attributes][][city_id]"]
        .length === undefined &&
      event.target.elements["deal[deal_cities_attributes][][city_id]"].value ===
        ""
    ) {
      NotificationManager.error(
        "Deal Cities can't be empty",
        "",
        3000,
        null,
        null,
        "filled"
      );
    } else {
      if (success) {
        await trackPromise(
          axios({
            method: "post",
            url: apiUrl,
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
              "AUTH-TOKEN": localStorage.getItem("auth_token"),
            },
          })
        )
          .then((response) => {
            if (response.status === 200) {
              NotificationManager.success(
                "Deal created successfully",
                "",
                3000,
                null,
                null,
                "filled"
              );
              this.props.history.push("/app/deals/list");
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
      } else {
        NotificationManager.error(
          "Deal banner size should be less than 100KB",
          "",
          3000,
          null,
          null,
          "filled"
        );
      }
    }
  };

  render_new_deal_form = () => {
    const {
      all_cities_json,
      city_services_dropdown,
      is_global,
      service_categories_dropdown,
    } = this.state;
    let self = this;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.create_deal} autoComplete="off">
                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Title*" />{" "}
                </Label>
                <Input
                  className="form-control"
                  name="deal[deal_title]"
                  type="text"
                  defaultValue=""
                  // pattern="/^[a-z\d]{5,12}$/"
                  required
                />
                {/* <Row>
                  <Colxx md="2">
                    <CustomInput
                      className="mt-4"
                      type="checkbox"
                      label="Active"
                      defaultChecked={false}
                      onChange={(event) => this.handleCheckChange(event)}
                    />
                    <Input hidden name="deal[is_active]" defaultValue="false" />
                  </Colxx>
                </Row> */}
                <Row className="p-3">
                  <Label>Select Banner*</Label>
                  <InputGroup className="mt-3">
                    <InputGroupAddon addonType="prepend">
                      Upload
                    </InputGroupAddon>
                    <CustomInput
                      type="file"
                      id="deal_banner"
                      name="deal[deal_banner]"
                      required
                    />
                  </InputGroup>
                </Row>
                <Row className="p-3">
                  <Label>PDF Icon*</Label>
                  <InputGroup className="mt-3">
                    <InputGroupAddon addonType="prepend">
                      Upload
                    </InputGroupAddon>
                    <CustomInput
                      type="file"
                      name="deal[deal_icon_pdf]"
                      required
                    />
                  </InputGroup>
                </Row>
                <Row className="p-3">
                  <Label>SVG Icon*</Label>
                  <InputGroup className="mt-3">
                    <InputGroupAddon addonType="prepend">
                      Upload
                    </InputGroupAddon>
                    <CustomInput
                      type="file"
                      name="deal[deal_icon_svg]"
                      required
                    />
                  </InputGroup>
                </Row>
                <Row>
                  <Colxx xxs="6" md="6" className="p-3">
                    <Label className="mt-2"> Start Date* </Label>
                    <DatePicker
                      selected={self.state.startDateTime}
                      onChange={(event) => self.handleChangeDateTime(event)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      dateFormat="LLL"
                      timeCaption="Time"
                      minDate={moment().toDate()}
                      required
                      name="deal[deal_start_datetime]"
                    />
                  </Colxx>
                  <Colxx xxs="6" md="6" className="p-3">
                    <Label className="mt-2"> End Date* </Label>
                    <DatePicker
                      selected={
                        self.state.endDateTime || self.state.endDateTime
                      }
                      onChange={self.handleChangeEndDateTime}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      dateFormat="LLL"
                      timeCaption="Time"
                      minDate={moment().toDate()}
                      required
                      name="deal[deal_end_datetime]"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx md="1">
                    <CustomInput
                      className="mt-2"
                      label="Global"
                      type="checkbox"
                      defaultChecked={false}
                      onChange={(event) => self.handleCheckGlobal(event)}
                    />
                    <Input
                      hidden
                      name="deal[is_global_deal]"
                      defaultValue="false"
                    />
                  </Colxx>
                </Row>
                {is_global ? (
                  <>
                    <Label className="mt-2">Select Service Categories</Label>
                    <Row>
                      <Colxx xxs="12" md="12">
                        <Select
                          components={{ Input: CustomSelectInput }}
                          isMulti
                          name="deal[deal_categories_attributes][][category_id]"
                          className="react-select"
                          classNamePrefix="react-select"
                          // onChange={self.handle_service_change}
                          options={service_categories_dropdown}
                          required
                        />
                        <Label className="mt-3">Select Cities *</Label>
                        <Select
                          components={{ Input: CustomSelectInput }}
                          isMulti
                          name="deal[deal_cities_attributes][][city_id]"
                          className="react-select"
                          classNamePrefix="react-select"
                          // onChange={this.handle_city_change}
                          options={all_cities_json}
                        />
                        <Row>
                          <Colxx md="4">
                            <Label className="mt-3">Discount Type*</Label>
                            <Select
                              components={{ Input: CustomSelectInput }}
                              className="react-select"
                              classNamePrefix="react-select"
                              name="deal[discount_type]"
                              // onChange={this.handle_city_change}
                              options={[
                                { label: "Price", value: "price" },
                                { label: "Percentage", value: "percentage" },
                              ]}
                            />
                          </Colxx>
                          <Colxx md="4">
                            <Label className="mt-3">Discount*</Label>
                            <Input
                              type="number"
                              placeholder={`Discount`}
                              name="deal[discount]"
                              min="0"
                              required
                              // value={service.name}
                            />
                          </Colxx>
                          <Colxx md="2">
                            <CustomInput
                              className="mt-5"
                              type="checkbox"
                              label="Female"
                              defaultChecked={true}
                              onChange={(event) =>
                                self.handleCheckChange(event)
                              }
                            />
                            <Input
                              hidden
                              name="deal[is_female_allowed]"
                              defaultValue="true"
                            />
                          </Colxx>

                          <Colxx md="2">
                            <CustomInput
                              className="mt-5"
                              type="checkbox"
                              label="Male"
                              defaultChecked={false}
                              onChange={(event) =>
                                self.handleCheckChange(event)
                              }
                            />
                            <Input
                              hidden
                              name="deal[is_male_allowed]"
                              defaultValue="false"
                            />
                          </Colxx>
                        </Row>
                      </Colxx>
                    </Row>
                  </>
                ) : (
                  <>
                    <Label className="mt-2">Select Services</Label>
                    <Row>
                      <Colxx xxs="12" md="12">
                        <Select
                          components={{ Input: CustomSelectInput }}
                          isMulti
                          // name="deal[deal_cities_attributes][][city_id]"
                          className="react-select"
                          classNamePrefix="react-select"
                          onChange={self.handle_service_change}
                          options={city_services_dropdown}
                          required
                        />
                      </Colxx>
                    </Row>
                    <Row>{self.render_service()}</Row>
                  </>
                )}

                <Button color="primary" type="submit" className="mt-3">
                  <IntlMessages id="pages.submit" />
                </Button>
              </form>
            </CardBody>
          </Card>
        </Colxx>
      </>
    );
  };

  render_service_cities = (service) => {
    const { discount_types } = this.state;
    let service_cities_html = [];
    let self = this;
    let service_id = service.value;
    service.cities.forEach(function (service_city) {
      service_cities_html.push(
        <>
          <Row className="mt-2">
            <Input
              hidden
              name="deal[deal_services_attributes][][service_id]"
              defaultValue={service_id}
            />
            <Colxx md="1">
              <CustomInput
                className="mt-2"
                type="checkbox"
                defaultChecked={true}
                onChange={(event) => self.handleCheckChange(event)}
              />
              <Input
                hidden
                name="deal[deal_services_attributes][][city_id_check]"
                defaultValue="true"
              />
              <Input
                hidden
                name="deal[deal_services_attributes][][city_id]"
                defaultValue={service_city.city_id}
              />
            </Colxx>
            <Colxx md="1">
              <Label className="pt-2">{service_city.city_name}</Label>
            </Colxx>
            {service_city.is_male_allowed === true ? (
              <>
                <Colxx md="2">
                  <CustomInput
                    className="mt-2"
                    type="checkbox"
                    label="Male"
                    defaultChecked={true}
                    onChange={(event) => self.handleCheckChange(event)}
                  />
                  <Input
                    hidden
                    name="deal[deal_services_attributes][][is_male_allowed]"
                    defaultValue="true"
                  />
                </Colxx>
              </>
            ) : (
              <></>
            )}
            {service_city.is_female_allowed === true ? (
              <>
                <Colxx md="2">
                  <CustomInput
                    className="mt-2"
                    type="checkbox"
                    label="Female"
                    defaultChecked={true}
                    onChange={(event) => self.handleCheckChange(event)}
                  />
                  <Input
                    hidden
                    name="deal[deal_services_attributes][][is_female_allowed]"
                    defaultValue="true"
                  />
                </Colxx>
              </>
            ) : (
              <></>
            )}
            <Colxx md="3">
              <Input
                type="text"
                placeholder={`Actual Price`}
                name="deal[deal_services_attributes][][service_price]"
                value={service_city.service_price}
                defaultValue="0.0"
                readOnly
              />
            </Colxx>
            <Colxx md="2">
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                name="deal[deal_services_attributes][][discount_type]"
                defaultValue={[{ label: "Price", value: "price" }]}
                options={discount_types}
              />
            </Colxx>
            <Colxx md="3">
              <Input
                type="number"
                placeholder={`Discount`}
                name="deal[deal_services_attributes][][discount]"
                min="0"
                max={service_city.service_price}
                // value={service.name}
              />
            </Colxx>
          </Row>
        </>
      );
    });
    return service_cities_html;
  };

  render_service = (city) => {
    const { services_data_rendered_info } = this.state;
    let self = this;
    let service_data_html = [];

    services_data_rendered_info.forEach(function (service) {
      service_data_html.push(
        <>
          <Colxx
            xxs="11"
            className="mt-4 ml-3"
            key={`icon_card_${service.value}`}
          >
            <Card>
              <CardBody>
                <Input
                  hidden
                  // name="deal[deal_cities_attributes][][deal_city_services_attributes][][service_id]"
                  defaultValue={service.value}
                />
                <h3 className="text-center"> {service.label} </h3>
                {self.render_service_cities(service)}
              </CardBody>
            </Card>
          </Colxx>
        </>
      );
    });
    return service_data_html;
  };

  render() {
    const { all_cities } = this.state;

    if (Object.keys(all_cities).length === 0) {
      return <> </>;
    } else {
      return <>{this.render_new_deal_form()}</>;
    }
  }
}

export default AddDealModal;
