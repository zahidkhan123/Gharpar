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
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/services.json";

class AddServiceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
      addons: [],
      addons_dropdown_json: [],
    };

    this.cities_dropdown_json = this.cities_dropdown_json.bind(this);
    this.get_all_cities = this.get_all_cities.bind(this);
    this.handle_city_change = this.handle_city_change.bind(this);
    this.render_service_city_data = this.render_service_city_data.bind(this);
    this.render_new_service_form = this.render_new_service_form.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.create_service = this.create_service.bind(this);
  }

  componentDidMount = async () => {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    let addons = await this.fetch_all_addons();
    let addons_dropdown_json = this.addons_dropdown_json(addons);

    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
      addons: addons,
      addons_dropdown_json: addons_dropdown_json,
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

  handle_city_change = (cities) => {
    this.setState({
      cities_data_rendered_info: cities,
    });
  };

  fetch_all_addons = async () => {
    let addons = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/services.json?is_addon=true",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          addons = response.data.addons;
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

    return addons;
  };

  addons_dropdown_json = (addons) => {
    let addons_dropdown_data = [];

    addons.forEach(function (current_addon) {
      addons_dropdown_data.push({
        label: current_addon.addon_title,
        value: current_addon.id,
        key: current_addon.id,
      });
    });
    return addons_dropdown_data;
  };

  isActiveChange = () => {
    this.setState({
      isActive: !this.state.isActive,
    });
  };

  isFeaturedChange = () => {
    this.setState({
      isFeatured: !this.state.isFeatured,
    });
  };

  isAddonsChange = () => {
    this.setState({
      isAddons: !this.state.isAddons,
    });
  };

  isMaleChange = () => {
    this.setState({
      isMale: !this.state.isMale,
    });
  };

  isFemaleChange = () => {
    this.setState({
      isFemale: !this.state.isFemale,
    });
  };

  handleShareholderNameChange = (idx) => (evt) => {
    const newShareholders = this.state.services.map((service, sidx) => {
      if (idx !== sidx) return service;
      return { ...service, name: evt.target.value };
    });

    this.setState({ services: newShareholders });
  };

  handleSubmit = (evt) => {
    const { name, services } = this.state;
    alert(`Incorporated: ${name} with ${services.length} shareholders`);
  };

  handleAddShareholder = () => {
    this.setState({
      services: this.state.services.concat([{ name: "" }]),
    });
  };

  handleRemoveShareholder = (idx) => () => {
    this.setState({
      services: this.state.services.filter((s, sidx) => idx !== sidx),
    });
  };

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  render_service_city_data = () => {
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
                  name="service[service_cities_attributes][][is_active]"
                  defaultValue="true"
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Male"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[service_cities_attributes][][is_male_allowed]"
                  defaultValue="false"
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Female"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[service_cities_attributes][][is_female_allowed]"
                  defaultValue="false"
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Featured"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[service_cities_attributes][][is_featured]"
                  defaultValue="false"
                />

                <Input
                  className="form-control mt-4"
                  name="service[service_cities_attributes][][price]"
                  type="number"
                  defaultValue=""
                  placeholder="Price"
                  min="0"
                />

                <Input
                  hidden
                  name="service[service_cities_attributes][][city_id]"
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

  create_service = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    // if (event.target.elements["service[service_addons_attributes][][service_addon_id]"].value.length < 1) {
    //   formData.delete("service[service_addons_attributes][][service_addon_id]")
    // }

    let addons_elements =
      event.target.elements[
        "service[service_addons_attributes][][service_addon_id]"
      ];

    if (addons_elements.length === undefined) {
      // This is 1 in total and empty. So, delete it
      formData.delete("service[service_addons_attributes][][service_addon_id]");
    }

    if (event.target.elements["service[featured_picture]"].files.length > 0)
      formData.append(
        "service[featured_picture]",
        event.target.elements["service[featured_picture]"].files[0],
        event.target.elements["service[featured_picture]"].files[0].name
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
            "Service created successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push(
            `/app/service_categories/${this.props.match.params.id}/services`
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

  render_new_service_form = () => {
    const { all_cities_json, addons_dropdown_json } = this.state;
    const { match } = this.props;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.create_service}>
                <Label className="mt-3">Title *</Label>
                <Input
                  className="form-control"
                  name="service[service_title]"
                  type="text"
                  defaultValue=""
                  required
                />

                <Label className="mt-3">Duration (In minutes) *</Label>
                <Input
                  className="form-control"
                  name="service[service_duration]"
                  type="number"
                  defaultValue={0}
                  min="0"
                  required
                />

                <Label className="mt-4">
                  {" "}
                  <IntlMessages id="Addons" />{" "}
                </Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  isMulti
                  classNamePrefix="react-select"
                  name="service[service_addons_attributes][][service_addon_id]"
                  options={addons_dropdown_json}
                />

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Featured Image" />{" "}
                </Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
                  <CustomInput
                    type="file"
                    id="featured_image"
                    name="service[featured_picture]"
                  />
                </InputGroup>

                <CustomInput
                  className="mt-4"
                  type="checkbox"
                  label="Active"
                  defaultChecked={true}
                  onChange={(event) => this.handleCheckChange(event)}
                />
                <Input hidden name="service[is_active]" defaultValue="true" />

                <Label className="mt-3">
                  {" "}
                  <IntlMessages id="Select Cities*" />{" "}
                </Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  isMulti
                  className="react-select"
                  classNamePrefix="react-select"
                  onChange={this.handle_city_change}
                  options={all_cities_json}
                />

                <Row className="icon-cards-row mb-2">
                  {this.render_service_city_data()}
                </Row>

                <Input
                  hidden
                  name="service[service_category_id]"
                  defaultValue={match.params.id}
                />
                <Input hidden name="service[is_addon]" defaultValue={false} />

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
      return <>{this.render_new_service_form()}</>;
    }
  }
}

export default AddServiceModal;
