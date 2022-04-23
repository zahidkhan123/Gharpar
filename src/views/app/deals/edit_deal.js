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

class EditDeal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deal: {},
      service_cities_json: [],
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
      services_data_rendered_info: [],
      all_addons: [],
      all_addons_dropdown_json: [],
      service_addons_dropdown_json: [],
      services_json: [],
      service_categories: [],
      service_categories_dropdown: [],
      cities_dropdown_data: [],
      discount_types: [
        { label: "Percentage", value: "percentage" },
        { label: "Price", value: "price" },
      ],
    };

    this.cities_dropdown_json = this.cities_dropdown_json.bind(this);
    this.services_json = this.services_json.bind(this);
    this.get_all_cities = this.get_all_cities.bind(this);
    this.handle_city_change = this.handle_city_change.bind(this);
    // this.render_service_city_data = this.render_service_city_data.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.update_deal = this.update_deal.bind(this);
  }

  componentDidMount = async () => {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    let deal = await this.get_deal(this.props.match.params.id);
    let deal_categories = [];
    if (deal.deal_categories !== undefined && deal.deal_categories.length > 0) {
      deal_categories = this.deal_categories_json(deal.deal_categories);
    }
    let deal_cities = [];
    if (deal.deal_cities !== undefined && deal.deal_cities.length > 0) {
      deal_cities = this.deal_cities_json(deal.deal_cities);
    }
    let all_services = await this.get_all_services();
    let services_dropdown_data = this.city_services_dropdown(all_services);

    let all_service_categories = await this.get_all_service_categories();
    let service_categories_dropdown_data = this.service_categories_dropdown(
      all_service_categories
    );

    // let all_cities = await this.get_all_cities();
    // let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    // let deal_cities_json = this.deal_cities_json(deal.deal_cities);
    let services_json = this.services_json(deal.deal_services);
    let start_date = moment(deal.deal_start_datetime);
    let end_date = moment(deal.deal_end_datetime);
    this.setState({
      deal: deal,
      all_cities: all_cities,
      deal_categories: deal_categories,
      deal_cities: deal_cities,
      cities_dropdown_data: cities_dropdown_data,
      services_data_rendered_info: deal.deal_services,
      city_services_dropdown: services_dropdown_data,
      service_categories: all_service_categories,
      service_categories_dropdown: service_categories_dropdown_data,
      services_json: services_json,
      startDateTime: start_date,
      endDateTime: end_date,
    });
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

  deal_cities_json = (all_cities) => {
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

  // deal_cities_json = (deal_cities) => {
  //   // This function is written for already attached cities to deal
  //   let cities_dropdown_data = [];
  //   deal_cities.forEach(function (deal_city) {
  //     cities_dropdown_data.push({
  //       label: deal_city.city_name,
  //       value: deal_city.city_id,
  //       key: deal_city.city_id,
  //       deal_city_id: deal_city.id,
  //     });
  //   });
  //   return cities_dropdown_data;
  // };

  services_json = (deal_services) => {
    // This function is written for already attached services to service category
    let services_dropdown_data = [];
    if (deal_services !== undefined && deal_services.length) {
      deal_services.forEach(function (deal_service) {
        services_dropdown_data.push({
          label: deal_service.service_title,
          value: deal_service.service_id,
          key: deal_service.service_price,
          service_cities: deal_service.service_cities,
        });
      });
    }

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

  deal_categories_json = (service_categories) => {
    let services_dropdown_data = [];

    service_categories.forEach(function (currentValue) {
      services_dropdown_data.push({
        label: currentValue.service_category_title,
        value: currentValue.id,
      });
    });
    return services_dropdown_data;
  };

  get_deal = async (deal_id) => {
    let deal = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/deals/" + deal_id + "/edit.json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          deal = response.data;
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

    return deal;
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
        service_cities: currentValue.service_cities,
      });
    });
    return services_dropdown_data;
  };

  get_all_cities = async () => {
    let all_cities = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/cities.json",
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

  delete_service = (service_ids) => {
    const { deal } = this.state;
    let self = this;
    let deal_response = [];
    trackPromise(
      axios({
        method: "delete",
        url:
          servicePath +
          "/api/v2/deals/" +
          deal.id +
          "/delete_deal_service.json?service_ids=" +
          service_ids,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          deal_response = response.data;
          let services_json = self.services_json(deal_response.deal_services);
          self.setState({
            deal: deal_response,
            services_json: services_json,
            services_data_rendered_info: deal_response.deal_services,
          });
          NotificationManager.success(
            "Service removed successfully",
            "",
            3000,
            null,
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
        console.log("error", error);
      });
  };

  // remove_item = (cities) => {
  //   // It checks if item is removed from multi select.
  //   // If yes, send api request to delete that city data. Otherwise, fine.

  //   const { deal_cities_json } = this.state;

  //   if (cities.length < deal_cities_json.length) {
  //     // Item has been removed from Multi Select. Find it and delete it
  //     let removed_city = deal_cities_json.filter(
  //       (single_city_data) => !cities.includes(single_city_data)
  //     ); // calculates diff
  //     this.delete_service_city(removed_city[0].deal_city_id);
  //   }
  // };

  handle_city_change = (cities) => {
    this.remove_item(cities);

    this.setState({
      cities_data_rendered_info: cities,
    });
  };

  remove_service = (services) => {
    const { services_json } = this.state;
    if (services.length < services_json.length) {
      if (services.length === 0) {
        let service_ids = [];
        services_json.map((service) => {
          service_ids.push(service.value);
          return service;
        });
        this.delete_service(service_ids);
      } else {
        // Item has been removed from Multi Select. Find it and delete it
        let removed_service = services_json.filter(
          (single_service) => !services.includes(single_service)
        ); // calculates diff
        this.delete_service(removed_service[0].value);
      }
    } else {
      this.setState({
        services_data_rendered_info: services,
      });
    }
  };

  handle_service_change = async (services) => {
    await this.remove_service(services);
    // if (services.length > 0) {
    //   let service = services.slice(-1).pop().value;
    //   // let service_price = await this.getServicePrice(service);
    //   this.setState({
    //     services_data_rendered_info: services,
    //     // servicePrice: service_price,
    //   });
    // } else {
    //   this.setState({
    //     services_data_rendered_info: services,
    //   });
    // }
  };

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  getServicePrice = async (service) => {
    let self = this;
    await trackPromise(
      axios.get(servicePath + "/api/v2/services/" + service.value + ".json", {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            servicePrice: response.data.service_cities[0].price,
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

  update_deal = async (event) => {
    event.preventDefault();
    const { services_data_rendered_info, deal } = this.state;
    let success = true;
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
      services_data_rendered_info !== undefined &&
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
      deal.is_global_deal &&
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
      deal.is_global_deal &&
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
            method: "put",
            url:
              servicePath +
              "/api/v2/deals/" +
              this.props.match.params.id +
              ".json",
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
                "Deal updated successfully",
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
          5000,
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
      }
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

  render_global_deal = () => {
    const {
      deal,
      deal_categories,
      deal_cities,
      service_categories_dropdown,
      cities_dropdown_data,
    } = this.state;
    let self = this;
    return (
      <>
        <Label className="mt-3">
          {" "}
          <IntlMessages id="Title" />{" "}
        </Label>
        <Input
          className="form-control"
          name="deal[deal_title]"
          type="text"
          defaultValue={deal.deal_title}
        />

        <Row>
          <Colxx xxs="12" md="6">
            <Label className="mt-2">Start Date</Label>
            {deal.is_active === true ? (
              <>
                <DatePicker
                  className="mt-2"
                  selected={this.state.startDateTime}
                  onChange={(event) => this.handleChangeDateTime(event)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="LLL"
                  timeCaption="Time"
                  defaultValue={deal.deal_start_datetime}
                  name="deal[deal_start_datetime]"
                  disabled
                />
              </>
            ) : (
              <>
                <DatePicker
                  className="mt-2"
                  selected={this.state.startDateTime}
                  onChange={(event) => this.handleChangeDateTime(event)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={1}
                  dateFormat="LLL"
                  timeCaption="Time"
                  defaultValue={deal.deal_start_datetime}
                  name="deal[deal_start_datetime]"
                />
              </>
            )}
          </Colxx>
          <Colxx xxs="12" md="6">
            <Label className="mt-2"> End Date </Label>
            <DatePicker
              className="mt-2"
              selected={this.state.endDateTime || this.state.endDateTime}
              onChange={this.handleChangeEndDateTime}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={1}
              dateFormat="LLL"
              timeCaption="Time"
              defaultValue={deal.deal_start_datetime}
              name="deal[deal_end_datetime]"
            />
          </Colxx>
        </Row>
        <Label className="mt-3">Select Banner</Label>
        <InputGroup className="mt-3">
          <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
          <CustomInput type="file" id="deal_banner" name="deal[deal_banner]" />
        </InputGroup>
        <Label className="mt-3">SVG Icon</Label>
        <InputGroup className="mt-3">
          <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
          <CustomInput type="file" name="deal[deal_icon_svg]" />
        </InputGroup>
        <Label className="mt-3">PDF Icon</Label>
        <InputGroup className="mt-3">
          <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
          <CustomInput
            type="file"
            id="deal_banner"
            name="deal[deal_icon_pdf]"
          />
        </InputGroup>
        {deal.is_active === true ? (
          <></>
        ) : (
          <>
            <Label className="mt-2">Select Service Categories *</Label>
            <Row>
              <Colxx xxs="12" md="12">
                <Select
                  components={{ Input: CustomSelectInput }}
                  isMulti
                  name="deal[deal_categories_attributes][][category_id]"
                  className="react-select"
                  classNamePrefix="react-select"
                  defaultValue={deal_categories}
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
                  defaultValue={deal_cities}
                  // onChange={this.handle_city_change}
                  options={cities_dropdown_data}
                />
                <Row>
                  <Colxx md="4">
                    <Label className="mt-3">Discount Type*</Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="deal[discount_type]"
                      defaultValue={[
                        {
                          label: deal.discount_type,
                          value: deal.discount_type,
                        },
                      ]}
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
                      defaultValue={deal.discount}
                      // value={service.name}
                    />
                  </Colxx>
                  <Colxx md="2">
                    <CustomInput
                      className="mt-5"
                      type="checkbox"
                      label="Female"
                      defaultChecked={deal.is_female_allowed}
                      onChange={(event) => self.handleCheckChange(event)}
                    />
                    <Input
                      hidden
                      name="deal[is_female_allowed]"
                      defaultValue={deal.is_female_allowed}
                    />
                  </Colxx>

                  <Colxx md="2">
                    <CustomInput
                      className="mt-5"
                      type="checkbox"
                      label="Male"
                      defaultChecked={deal.is_male_allowed}
                      onChange={(event) => self.handleCheckChange(event)}
                    />
                    <Input
                      hidden
                      name="deal[is_male_allowed]"
                      defaultValue={deal.is_male_allowed}
                    />
                  </Colxx>
                </Row>
              </Colxx>
            </Row>
          </>
        )}
      </>
    );
  };

  render_edit_deal_form = () => {
    const { deal, city_services_dropdown, services_json } = this.state;
    let self = this;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.update_deal} autoComplete="off">
                {deal.is_global_deal ? (
                  <>{self.render_global_deal()}</>
                ) : (
                  <>
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Title" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="deal[deal_title]"
                      type="text"
                      defaultValue={deal.deal_title}
                    />

                    <Row>
                      <Colxx xxs="12" md="6">
                        <Label className="mt-2">Start Date</Label>
                        {deal.is_active === true ? (
                          <>
                            <DatePicker
                              className="mt-2"
                              selected={this.state.startDateTime}
                              onChange={(event) =>
                                this.handleChangeDateTime(event)
                              }
                              showTimeSelect
                              timeFormat="HH:mm"
                              timeIntervals={30}
                              dateFormat="LLL"
                              timeCaption="Time"
                              // defaultValue={deal.deal_start_datetime}
                              name="deal[deal_start_datetime]"
                              disabled
                            />
                          </>
                        ) : (
                          <>
                            <DatePicker
                              className="mt-2"
                              selected={this.state.startDateTime}
                              onChange={(event) =>
                                this.handleChangeDateTime(event)
                              }
                              showTimeSelect
                              timeFormat="HH:mm"
                              timeIntervals={1}
                              dateFormat="LLL"
                              timeCaption="Time"
                              // defaultValue={deal.deal_start_datetime}
                              name="deal[deal_start_datetime]"
                            />
                          </>
                        )}
                      </Colxx>
                      <Colxx xxs="12" md="6">
                        <Label className="mt-2"> End Date </Label>
                        <DatePicker
                          selected={
                            this.state.endDateTime || this.state.endDateTime
                          }
                          onChange={this.handleChangeEndDateTime}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={1}
                          dateFormat="LLL"
                          timeCaption="Time"
                          // defaultValue={deal.deal_start_datetime}
                          name="deal[deal_end_datetime]"
                        />
                      </Colxx>
                    </Row>
                    <Label className="mt-3">Select Banner</Label>
                    <InputGroup className="mt-3">
                      <InputGroupAddon addonType="prepend">
                        Upload
                      </InputGroupAddon>
                      <CustomInput
                        type="file"
                        id="deal_banner"
                        name="deal[deal_banner]"
                      />
                    </InputGroup>
                    <Label className="mt-3">SVG Icon</Label>
                    <InputGroup className="mt-3">
                      <InputGroupAddon addonType="prepend">
                        Upload
                      </InputGroupAddon>
                      <CustomInput type="file" name="deal[deal_icon_svg]" />
                    </InputGroup>
                    <Label className="mt-3">PDF Icon</Label>
                    <InputGroup className="mt-3">
                      <InputGroupAddon addonType="prepend">
                        Upload
                      </InputGroupAddon>
                      <CustomInput
                        type="file"
                        id="deal_banner"
                        name="deal[deal_icon_pdf]"
                      />
                    </InputGroup>
                    {deal.is_active === true ? (
                      <></>
                    ) : (
                      <>
                        <Label className="mt-3">
                          {" "}
                          <IntlMessages id="Select Services*" />{" "}
                        </Label>
                        <Select
                          components={{ Input: CustomSelectInput }}
                          isMulti
                          className="react-select"
                          classNamePrefix="react-select"
                          onChange={self.handle_service_change}
                          options={city_services_dropdown}
                          defaultValue={services_json}
                        />

                        <Row className="icon-cards-row mb-2">
                          {this.render_service()}
                        </Row>
                      </>
                    )}
                  </>
                )}

                {/* <Input hidden name="service[service_category_id]" defaultValue={match.params.id} /> */}
                {/* <Input hidden name="service[is_addon]" defaultValue={false} /> */}

                <Button color="primary" type="submit" className="mt-3">
                  Update
                </Button>
                <Button
                  color="secondary"
                  outline
                  type="button"
                  className="mt-3 ml-3"
                  onClick={this.props.history.goBack}
                >
                  Cancel
                </Button>
              </form>
            </CardBody>
          </Card>
        </Colxx>
      </>
    );
  };

  // render_deal_city_data = () => {
  //   const {
  //     cities_data_rendered_info,
  //     city_services_dropdown,
  //     services_json,
  //   } = this.state;

  //   let self = this;

  //   let city_data_html = [];

  //   cities_data_rendered_info.forEach(function (city) {
  //     city_data_html.push(
  //       <>
  //         <Colxx xxs="6" className="mt-4" key={`icon_card_${city.value}`}>
  //           <Card>
  //             <CardBody>
  //               <Input
  //                 hidden
  //                 name="deal[deal_cities_attributes][][city_id]"
  //                 defaultValue={city.value}
  //               />
  //               <h3 className="text-center"> {city.label} </h3>
  //               <Row>
  //                 <Colxx xxs="11" md="11" className="ml-3">
  //                   <Select
  //                     components={{ Input: CustomSelectInput }}
  //                     isMulti
  //                     className="react-select"
  //                     classNamePrefix="react-select"
  //                     onChange={self.handle_service_change}
  //                     options={city_services_dropdown}
  //                     defaultValue={services_json}
  //                   />
  //                 </Colxx>
  //               </Row>
  //               <Row>{self.render_service()}</Row>
  //             </CardBody>
  //           </Card>
  //         </Colxx>
  //       </>
  //     );
  //   });
  //   return city_data_html;
  // };
  render_service = () => {
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
                <h3 className="text-center">
                  {service.service_title !== undefined ? (
                    <>{service.service_title}</>
                  ) : (
                    <>{service.label}</>
                  )}
                </h3>
                {self.render_service_cities(service)}
              </CardBody>
            </Card>
          </Colxx>
        </>
      );
    });
    return service_data_html;
  };

  render_service_cities = (service) => {
    const { discount_types } = this.state;
    let service_cities_html = [];
    let self = this;
    let service_id = 0;

    if (service.service_id === undefined) {
      service_id = service.value;
    } else {
      service_id = service.service_id;
    }

    service.service_cities.forEach(function (service_city) {
      service_cities_html.push(
        <>
          <Row className="mt-2 ml-2">
            <Input
              hidden
              name="deal[deal_services_attributes][][service_id]"
              defaultValue={service_id}
            />
            {service_city.is_added === true ? (
              <>
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
              </>
            ) : (
              <>
                <Colxx md="1">
                  <CustomInput
                    className="mt-2"
                    type="checkbox"
                    defaultChecked={false}
                    onChange={(event) => self.handleCheckChange(event)}
                  />
                  <Input
                    hidden
                    name="deal[deal_services_attributes][][city_id_check]"
                    defaultValue="false"
                  />
                  <Input
                    hidden
                    name="deal[deal_services_attributes][][city_id]"
                    defaultValue={service_city.city_id}
                  />
                </Colxx>
              </>
            )}

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
                defaultValue={service_city.service_price}
                readOnly
              />
            </Colxx>
            {service_city.is_added === true ? (
              <>
                <Colxx md="2">
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="deal[deal_services_attributes][][discount_type]"
                    options={discount_types}
                    defaultValue={[
                      {
                        label: service_city.discount_type,
                        value: service_city.discount_type,
                      },
                    ]}
                  />
                </Colxx>
                <Colxx md="3">
                  <Input
                    type="text"
                    placeholder={`Discount`}
                    name="deal[deal_services_attributes][][discount]"
                    defaultValue={service_city.discount}
                    min="0"
                    max={service_city.service_price}
                  />
                </Colxx>
              </>
            ) : (
              <>
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
                    type="text"
                    placeholder={`Discount`}
                    name="deal[deal_services_attributes][][discount]"
                    // value={service.name}
                  />
                </Colxx>
              </>
            )}
          </Row>
        </>
      );
    });
    return service_cities_html;
  };

  render() {
    const { deal } = this.state;
    if (Object.keys(deal).length === 0) {
      return <></>;
    } else {
      return <>{this.render_edit_deal_form()}</>;
    }
  }
}

export default EditDeal;
