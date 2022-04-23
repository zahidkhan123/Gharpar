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
import { Colxx } from "../../../components/common/CustomBootstrap";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class EditService extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      service: {},
      service_cities_json: [],
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
      all_addons: [],
      all_addons_dropdown_json: [],
      service_addons_dropdown_json: [],
      existing_service_addons_json: [],
    };

    this.cities_dropdown_json = this.cities_dropdown_json.bind(this);
    this.get_all_cities = this.get_all_cities.bind(this);
    this.handle_city_change = this.handle_city_change.bind(this);
    this.render_service_city_data = this.render_service_city_data.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.update_service = this.update_service.bind(this);
  }

  componentDidMount = async () => {
    let service = await this.get_service(this.props.match.params.service_id);

    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    let service_cities_json = this.service_cities_json(service.service_cities);

    let all_addons = await this.fetch_all_addons();
    let all_addons_dropdown_json = this.addons_dropdown_json(all_addons);
    let service_addons_dropdown_json = this.service_addons_dropdown_json(
      service.service_addons
    );

    this.setState({
      service: service,
      service_cities_json: service_cities_json,
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
      all_addons: all_addons,
      all_addons_dropdown_json: all_addons_dropdown_json,
      service_addons_dropdown_json: service_addons_dropdown_json,
      cities_data_rendered_info: service_cities_json,
    });
  };

  service_cities_json = (service_cities) => {
    // This function is written for already attached cities to service category
    let cities_dropdown_data = [];
    if (service_cities !== undefined && service_cities.length) {
      service_cities.forEach(function (service_city) {
        cities_dropdown_data.push({
          label: service_city.city_name,
          value: service_city.city_id,
          key: service_city.city_id,
          is_active: service_city.is_active,
          is_male_allowed: service_city.is_male_allowed,
          is_female_allowed: service_city.is_female_allowed,
          is_featured: service_city.is_featured,
          price: service_city.price,
          service_city_id: service_city.id,
        });
      });
      return cities_dropdown_data;
    }
  };

  service_addons_dropdown_json = (addons) => {
    let addons_dropdown_data = [];

    addons.forEach(function (current_addon) {
      addons_dropdown_data.push({
        label: current_addon.addon_title,
        value: current_addon.service_addon_id,
        key: current_addon.service_addon_id,
        service_addon_table_id: current_addon.id,
      });
    });

    return addons_dropdown_data;
  };

  get_service = async (service_id) => {
    let service = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/services/" + service_id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
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

  delete_service_city = (service_city_id) => {
    trackPromise(
      axios({
        method: "delete",
        url:
          servicePath +
          "/api/v2/services/service_cities.json?service_city_id=" +
          service_city_id,
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

  remove_item = (cities) => {
    // It checks if item is removed from multi select.
    // If yes, send api request to delete that city data. Otherwise, fine.

    const { service_cities_json } = this.state;

    if (cities.length < service_cities_json.length) {
      // Item has been removed from Multi Select. Find it and delete it
      let removed_city = service_cities_json.filter(
        (single_city_data) => !cities.includes(single_city_data)
      ); // calculates diff
      this.delete_service_city(removed_city[0].service_city_id);
    }
  };

  handle_city_change = (cities) => {
    this.remove_item(cities);

    // this.setState({
    //   cities_data_rendered_info: cities,
    //   service_cities_json: cities
    // });

    this.setState({
      cities_data_rendered_info: cities,
      service_cities_json: cities,
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
          "IS-ACCESSIBLE": true,
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

    cities_data_rendered_info.forEach(function (service_city) {
      city_data_html.push(
        <>
          <Colxx
            xxs="4"
            className="mt-4"
            key={`icon_card_${service_city.value}`}
          >
            <Card>
              <CardBody>
                <h3 className="text-center"> {service_city.label} </h3>

                <CustomInput
                  className="mb-2 mt-2"
                  type="checkbox"
                  label="Active"
                  defaultChecked={service_city.is_active}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[service_cities_attributes][][is_active]"
                  defaultValue={service_city.is_active}
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Male"
                  defaultChecked={service_city.is_male_allowed || false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[service_cities_attributes][][is_male_allowed]"
                  defaultValue={service_city.is_male_allowed || "false"}
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Female"
                  defaultChecked={service_city.is_female_allowed || false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[service_cities_attributes][][is_female_allowed]"
                  defaultValue={service_city.is_female_allowed || "false"}
                />

                <CustomInput
                  className="mb-2"
                  type="checkbox"
                  label="Featured"
                  defaultChecked={service_city.is_featured || false}
                  onChange={(event) => self.handleCheckChange(event)}
                />
                <Input
                  hidden
                  name="service[service_cities_attributes][][is_featured]"
                  defaultValue={service_city.is_featured || "false"}
                />

                <Input
                  className="form-control mt-4"
                  name="service[service_cities_attributes][][price]"
                  type="number"
                  defaultValue={service_city.price || 0}
                  placeholder="Price"
                  min="0"
                />

                <Input
                  hidden
                  name="service[service_cities_attributes][][city_id]"
                  defaultValue={service_city.value}
                />

                {service_city.service_city_id === undefined ? (
                  ""
                ) : (
                  <Input
                    className="d-none"
                    name="service[service_cities_attributes][][id]"
                    defaultValue={service_city.service_city_id}
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

  filter_services_addons = (formData) => {
    const { service_addons_dropdown_json } = this.state;
    let service_addons =
      formData.elements[
        "service[service_addons_attributes][][service_addon_id]"
      ];

    if (service_addons.constructor.name === "HTMLInputElement") {
      if (service_addons.value === "") {
        formData.elements[
          "service[service_addons_attributes][][service_addon_id]"
        ].name = "";
      }
      service_addons_dropdown_json.forEach((already_service_addon) => {
        if (
          parseInt(service_addons.value) ===
          parseInt(already_service_addon.value)
        ) {
          // This service already belongs to technician. Prevent it from submitting
          // Add class to it for marking it.
          formData.elements[
            "service[service_addons_attributes][][service_addon_id]"
          ].classList.add("to_be_removed");
        }
      });
    } else if (service_addons.constructor.name === "RadioNodeList") {
      service_addons.forEach((tech_service, index) => {
        // find this tech service in already those services which user already has
        // and if found, remove the name attribute to prevent it from submitting
        // so that duplication issue is resolved

        service_addons_dropdown_json.forEach((already_service_addon) => {
          if (
            parseInt(tech_service.value) ===
            parseInt(already_service_addon.value)
          ) {
            // This service already belongs to technician. Prevent it from submitting
            // Add class to it for marking it.
            formData.elements[
              "service[service_addons_attributes][][service_addon_id]"
            ][index].classList.add("to_be_removed");
          }
        });
      });
    }

    this.removeElementsByClass("to_be_removed");

    return formData;
  };

  removeElementsByClass = (className) => {
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  };

  update_service = async (event) => {
    event.preventDefault();

    const { service } = this.state;
    let formData = this.filter_services_addons(event.target);
    formData = new FormData(formData);

    // let addons_elements =
    //   event.target.elements[
    //     "service[service_addons_attributes][][service_addon_id]"
    //   ];

    // if (addons_elements.length === undefined) {
    // This is 1 in total and empty. So, delete it
    // formData.delete("service[service_addons_attributes][][service_addon_id]");
    // }
    if (event.target.elements["service[featured_picture]"].files.length > 0)
      formData.append(
        "service[featured_picture]",
        event.target.elements["service[featured_picture]"].files[0],
        event.target.elements["service[featured_picture]"].files[0].name
      );

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/services/" + service.id + ".json",
        data: formData,
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
            "Service updated successfully",
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

  delete_service_addon = (service_addon_id) => {
    trackPromise(
      axios({
        method: "delete",
        url:
          servicePath +
          "/api/v2/services/service_addons_destroy.json?service_addon_id=" +
          service_addon_id,
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
            "Addon removed successfully",
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

  remove_addon_item = (addons) => {
    // It checks if item is removed from multi select.
    // If yes, send api request to delete that addon data. Otherwise, fine.

    const { service_addons_dropdown_json } = this.state;

    let removed_addon = {};
    removed_addon = service_addons_dropdown_json.filter(
      (single_addon_data) => !addons.includes(single_addon_data)
    ); // calculates diff

    if (Object.keys(removed_addon).length) {
      // Item has been removed from Multi Select. Find it and delete it
      this.delete_service_addon(removed_addon[0].service_addon_table_id);
      this.setState({
        service_addons_dropdown_json: addons.filter(
          (addon) => addon.service_addon_table_id !== undefined
        ),
      });
    }
  };

  handle_addon_change = (addons) => {
    this.remove_addon_item(addons);
  };

  render_edit_service_form = () => {
    const {
      service,
      service_cities_json,
      all_cities_json,
      all_addons_dropdown_json,
      service_addons_dropdown_json,
    } = this.state;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.update_service}>
                <Label className="mt-3">Title</Label>
                <Input
                  className="form-control"
                  name="service[service_title]"
                  type="text"
                  defaultValue={service.service_title}
                />

                <Label className="mt-3">Duration (In Minutes)</Label>
                <Input
                  className="form-control"
                  name="service[service_duration]"
                  type="number"
                  defaultValue={service.service_duration}
                  min="0"
                  required
                />

                <Label className="mt-4">Addons</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  isMulti
                  classNamePrefix="react-select"
                  name="service[service_addons_attributes][][service_addon_id]"
                  onChange={this.handle_addon_change}
                  defaultValue={service_addons_dropdown_json}
                  options={all_addons_dropdown_json}
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
                <Input
                  hidden
                  name="service[is_active]"
                  defaultValue={service.is_active}
                />

                <Label className="mt-3">Select Cities</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  isMulti
                  className="react-select"
                  classNamePrefix="react-select"
                  onChange={this.handle_city_change}
                  defaultValue={service_cities_json}
                  options={all_cities_json}
                />

                <Row className="icon-cards-row mb-2">
                  {this.render_service_city_data()}
                </Row>

                <Input hidden name="service[id]" defaultValue={service.id} />
                <Input hidden name="service[is_addon]" defaultValue={false} />

                <Button color="primary" type="submit" className="mt-3">
                  Submit
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
    const { service, all_cities } = this.state;

    if (
      Object.keys(all_cities).length === 0 ||
      Object.keys(service).length === 0
    ) {
      return <> </>;
    } else {
      return <>{this.render_edit_service_form()}</>;
    }
  }
}

export default EditService;
