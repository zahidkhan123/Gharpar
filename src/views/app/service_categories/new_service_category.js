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

const apiUrl = servicePath + "/api/v2/service_categories.json";

class NewServiceCategory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
    };

    this.cities_dropdown_json = this.cities_dropdown_json.bind(this);
    this.get_all_cities = this.get_all_cities.bind(this);
    this.handle_city_change = this.handle_city_change.bind(this);
    this.render_service_category_city_data = this.render_service_category_city_data.bind(
      this
    );
    this.render_new_service_category_form = this.render_new_service_category_form.bind(
      this
    );
  }

  async componentDidMount() {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
    });
  }

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

  handle_city_change = (cities) => {
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

    cities_data_rendered_info.forEach(function (city) {
      city_data_html.push(
        <>
          <Colxx xxs="4" className="mt-4" key={`icon_card_${city.value}`}>
            <Card>
              <CardBody>
                <h3 className="text-center"> {city.label} </h3>

                <CustomInput
                  className="mb-2 mt-2"
                  type="checkbox"
                  label="Active"
                  defaultChecked={true}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][is_active]"
                  defaultValue="true"
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Male Allowed"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][is_male_allowed]"
                  defaultValue="false"
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Female Allowed"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][is_female_allowed]"
                  defaultValue="false"
                />

                <Input
                  hidden
                  name="service_category[service_category_cities_attributes][][city_id]"
                  defaultValue={city.value}
                />
              </CardBody>
            </Card>
          </Colxx>
        </>
      );
    });
    return city_data_html;
  };

  createServiceCategory = async (event) => {
    event.preventDefault();
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
            "Service Category created successfully",
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

  render_new_service_category_form = () => {
    const { all_cities_json } = this.state;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.createServiceCategory}>
                <Label className="mt-3">
                  Service Category Name *
                  {/* <IntlMessages id="pages.service-category-name" /> */}
                </Label>
                <Input
                  className="form-control"
                  name="service_category[service_category_title]"
                  type="text"
                  defaultValue=""
                  required
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
                  defaultChecked={true}
                  onChange={(event) => this.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service_category[is_active]"
                  defaultValue="true"
                />

                <Label className="mt-3"> Select Cities *</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  isMulti
                  className="react-select"
                  classNamePrefix="react-select"
                  onChange={this.handle_city_change}
                  options={all_cities_json}
                />

                <Row className="icon-cards-row mb-2">
                  {this.render_service_category_city_data()}
                </Row>

                {this.render_sub_category_data()}

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
    const { all_cities } = this.state;

    if (Object.keys(all_cities).length === 0) {
      return <> </>;
    } else {
      return <>{this.render_new_service_category_form()}</>;
    }
  }
}

export default NewServiceCategory;
