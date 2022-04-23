import React, { Component } from "react";
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

import { Colxx } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { trackPromise } from "react-promise-tracker";

class NewServiceCategory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      service_category: {},
      service_category_cities_json: [],
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
    };

    this.cities_dropdown_json = this.cities_dropdown_json.bind(this);
    this.get_all_cities = this.get_all_cities.bind(this);
    this.render_service_category_city_data = this.render_service_category_city_data.bind(
      this
    );
    this.render_edit_service_category_form = this.render_edit_service_category_form.bind(
      this
    );
  }

  async componentDidMount() {
    const { match } = this.props;
    let service_category = await this.get_service_category(match.params.id);
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    let service_category_cities_json = this.service_category_cities_json(
      service_category.service_category_cities
    );

    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
      service_category: service_category,
      service_category_cities_json: service_category_cities_json,
      cities_data_rendered_info: service_category_cities_json,
    });
  }

  get_service_category = async (service_category_id) => {
    let service_category = {};

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/service_categories/" +
          service_category_id +
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

    return service_category;
  };

  service_category_cities_json = (service_category_cities) => {
    // This function is written for already attached cities to service category
    let cities_dropdown_data = [];
    if (
      service_category_cities !== undefined &&
      service_category_cities.length
    ) {
      service_category_cities.forEach(function (service_category_city) {
        cities_dropdown_data.push({
          label: service_category_city.city_name,
          value: service_category_city.city_id,
          key: service_category_city.city_id,
          is_active: service_category_city.is_active,
          is_male_allowed: service_category_city.is_male_allowed,
          is_female_allowed: service_category_city.is_female_allowed,
          service_category_city_id: service_category_city.id,
        });
      });
    }
    return cities_dropdown_data;
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

  get_all_cities = async () => {
    let all_cities = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/cities.json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_cities = response.data;
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

  remote_item = (cities) => {
    // It checks if item is removed from multi select.
    // If yes, send api request to delete that city data. Otherwise, fine.

    const { service_category_cities_json } = this.state;

    if (cities.length < service_category_cities_json.length) {
      // Item has been removed from Multi Select. Find it and delete it
      let removed_city = service_category_cities_json.filter(
        (single_city_data) => !cities.includes(single_city_data)
      ); // calculates diff
      this.delete_service_category_city(
        removed_city[0].service_category_city_id
      );
    }
  };

  delete_service_category_city = (service_category_city_id) => {
    trackPromise(
      axios({
        method: "delete",
        url:
          servicePath +
          "/api/v2/service_categories/service_category_cities.json?service_category_city_id=" +
          service_category_city_id,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "City removed successfully",
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

  handle_city_change = (cities) => {
    this.remote_item(cities);

    this.setState({
      cities_data_rendered_info: cities,
    });
  };

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  render_service_category_city_data = () => {
    const { cities_data_rendered_info } = this.state;
    let self = this;

    let city_data_html = [];

    cities_data_rendered_info.forEach(function (service_category_city) {
      city_data_html.push(
        <>
          <Colxx
            xxs="4"
            className="mt-4"
            key={`icon_card_${service_category_city.value}`}
          >
            <Card>
              <CardBody>
                <h3 className="text-center"> {service_category_city.label} </h3>

                <CustomInput
                  className="mb-2 mt-2"
                  type="checkbox"
                  label="Active"
                  defaultChecked={service_category_city.is_active || false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][is_active]"
                  defaultValue={service_category_city.is_active || "false"}
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Male Allowed"
                  defaultChecked={
                    service_category_city.is_male_allowed || false
                  }
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][is_male_allowed]"
                  defaultValue={
                    service_category_city.is_male_allowed || "false"
                  }
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Female Allowed"
                  defaultChecked={
                    service_category_city.is_female_allowed || false
                  }
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][is_female_allowed]"
                  defaultValue={
                    service_category_city.is_female_allowed || "false"
                  }
                />

                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][city_id]"
                  defaultValue={service_category_city.value}
                />

                {service_category_city.service_category_city_id ===
                undefined ? (
                  ""
                ) : (
                  <Input
                    className="d-none"
                    name="service_category[service_category_cities_attributes][][id]"
                    defaultValue={
                      service_category_city.service_category_city_id
                    }
                    type="number"
                  />
                )}
              </CardBody>
            </Card>
          </Colxx>
        </>
      );
    });
    return city_data_html;
  };

  update_service_category = async (event) => {
    event.preventDefault();
    const { match } = this.props;
    let service_category_id = match.params.id;

    let formData = new FormData(event.target);

    if (
      event.target.elements["service_category[category_svg_icon]"].files
        .length > 0
    )
      formData.append(
        "service_category[category_svg_icon]",
        event.target.elements["service_category[category_svg_icon]"].files[0],
        event.target.elements["service_category[category_svg_icon]"].files[0]
          .name
      );

    if (
      event.target.elements["service_category[category_pdf_icon]"].files
        .length > 0
    )
      formData.append(
        "service_category[category_pdf_icon]",
        event.target.elements["service_category[category_pdf_icon]"].files[0],
        event.target.elements["service_category[category_pdf_icon]"].files[0]
          .name
      );

    if (
      event.target.elements["service_category[category_picture]"].files.length >
      0
    )
      formData.append(
        "service_category[category_picture]",
        event.target.elements["service_category[category_picture]"].files[0],
        event.target.elements["service_category[category_picture]"].files[0]
          .name
      );

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/v2/service_categories/" +
          service_category_id +
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
            "Service Category updated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/service_categories/list");
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

  render_sub_category_data = () => {
    const { match } = this.props;

    if (Object.keys(match.params).length === 0) {
      return <> </>;
    } else {
      return (
        <>
          <Input
            hidden
            name="service_category[parent_id]"
            defaultValue={match.params.id}
          />
        </>
      );
    }
  };

  render_edit_service_category_form = () => {
    const {
      all_cities_json,
      service_category,
      service_category_cities_json,
    } = this.state;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.update_service_category}>
                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="pages.service-category-name" />{" "}
                </Label>
                <Input
                  className="form-control"
                  name="service_category[service_category_title]"
                  type="text"
                  defaultValue={service_category.service_category_title}
                />

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Upload SVG Icon" />{" "}
                </Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
                  <CustomInput
                    type="file"
                    id="category_svg_icon"
                    name="service_category[category_svg_icon]"
                  />
                </InputGroup>

                {service_category.category_svg_icon === null ? (
                  ""
                ) : (
                  <Row>
                    <Colxx xxs="12">
                      <div className="mt-4">
                        <img
                          alt="category svg"
                          src={service_category.category_svg_icon}
                          className="img-fluid category_svg_icon"
                        />
                      </div>
                    </Colxx>
                  </Row>
                )}

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Upload PDF Icon" />{" "}
                </Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
                  <CustomInput
                    type="file"
                    id="category_pdf_icon"
                    name="service_category[category_pdf_icon]"
                  />
                </InputGroup>

                {service_category.category_pdf_icon === null ? (
                  ""
                ) : (
                  <Row>
                    <Colxx xxs="12">
                      <div className="mt-4">
                        <embed
                          src={service_category.category_pdf_icon}
                          width="150px"
                          height="150px"
                        />
                      </div>
                    </Colxx>
                  </Row>
                )}

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Upload Picture" />{" "}
                </Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
                  <CustomInput
                    type="file"
                    id="category_picture"
                    name="service_category[category_picture]"
                  />
                </InputGroup>

                <CustomInput
                  className="mt-3"
                  type="checkbox"
                  label="Active"
                  defaultChecked={service_category.is_active || false}
                  onChange={(event) => this.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[is_active]"
                  defaultValue={service_category.is_active || "false"}
                />

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Select Cities" />{" "}
                </Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  isMulti
                  className="react-select"
                  classNamePrefix="react-select"
                  onChange={this.handle_city_change}
                  defaultValue={service_category_cities_json}
                  options={all_cities_json}
                />

                <Row className="icon-cards-row mb-2">
                  {this.render_service_category_city_data()}
                </Row>

                {/* { this.render_sub_category_data() } */}

                <Input
                  hidden
                  name="service_category[id]"
                  defaultValue={service_category.id}
                />

                <Button color="primary" type="submit" className="mt-3">
                  <IntlMessages id="pages.submit" />
                </Button>

                <Button
                  color="primary"
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

  render() {
    const { all_cities, service_category } = this.state;

    if (
      Object.keys(all_cities).length === 0 ||
      Object.keys(service_category).length === 0
    ) {
      return <> </>;
    } else {
      return <>{this.render_edit_service_category_form()}</>;
    }
  }
}

export default NewServiceCategory;
