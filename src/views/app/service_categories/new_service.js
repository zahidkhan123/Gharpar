import React from "react";
import {
  CustomInput,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Row,
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath, authHeaders } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";
import { usePromiseTracker } from "react-promise-tracker";
import axios from "axios";

class AddServiceModal extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.userAction == "new") {
      this.state = {
        isActive: false,
        isAddons: false,
        isFeatured: false,
        isMaleAllowed: false,
        isFemaleAllowed: false,
        cities: [],
        cities_dropdown_json: [],
        services: [{ name: "" }],
      };
    } else if (this.props.userAction == "edit") {
      this.state = {
        isActive: this.props.serviceToEdit.is_active,
        isAddons: this.props.serviceToEdit.is_addon,
        isFeatured: this.props.serviceToEdit.is_featured,
        isMaleAllowed: this.props.serviceToEdit.is_male_allowed,
        isFemaleAllowed: this.props.serviceToEdit.is_female_allowed,
        cities: [],
        cities_dropdown_json: [],
      };
    }
    this.getAllCities = this.getAllCities.bind(this);
    this.prepareCitiesJson = this.prepareCitiesJson.bind(this);
    // this.getAllAddons = this.getAllAddons.bind(this);
    // this.prepareAddonsJson = this.prepareAddonsJson.bind(this);
  }

  async componentDidMount() {
    let fetch_cities = [];
    fetch_cities = await this.getAllCities(fetch_cities);

    // let fetch_addons = []
    // fetch_addons = await this.getAllAddons(fetch_addons);

    if (fetch_cities.length > 0) {
      this.prepareCitiesJson(fetch_cities);
    }
    // if (fetch_addons.length > 0) {
    //   this.prepareAddonsJson(fetch_addons);
    // }
  }

  getAllCities = async (fetch_cities) => {
    let self = this;
    await trackPromise(
      axios.get(servicePath + "/api/v2/cities.json", {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        fetch_cities = response.data.sort(
          (a, b) => parseInt(a.id) - parseInt(b.id)
        );
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
        console.log("Error: ", error.response.data.message);
      });
    return fetch_cities;
  };

  prepareCitiesJson = (fetch_cities) => {
    let cities_dropdown_data = [];

    fetch_cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });

    this.setState({
      cities_dropdown_json: cities_dropdown_data,
    });
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

  render() {
    const {
      modalOpen,
      toggleModal,
      createService,
      updateService,
      userAction,
      serviceToEdit,
    } = this.props;
    const { cities_dropdown_json } = this.state;
    let serviceEditData = null;
    if (serviceToEdit != undefined) {
      serviceEditData = {
        id: serviceToEdit.id,
        service_title: serviceToEdit.service_title,
        service_duration: serviceToEdit.service_duration,
        is_active: serviceToEdit.is_active,
        is_addon: serviceToEdit.is_addon,
        is_featured: serviceToEdit.is_featured,
      };
    }

    if (cities_dropdown_json.length > 0) {
      let selected_dropdown_values = [];
      if (userAction == "edit") {
        let city_ids = serviceToEdit.service_cities.map(
          (service_city) => service_city.city_id
        );

        cities_dropdown_json.forEach(function (single_city, index) {
          if (city_ids.includes(single_city.value)) {
            selected_dropdown_values.push(single_city);
          }
        });
      }

      return (
        <Modal
          isOpen={modalOpen}
          toggle={toggleModal}
          wrapClassName="modal-right"
          backdrop="static">
          <form onSubmit={userAction === "new" ? createService : updateService}>
            <ModalHeader toggle={toggleModal}>
              {userAction === "new" ? (
                <IntlMessages id="pages.add-new-service" />
              ) : (
                <IntlMessages id="pages.edit-service" />
              )}
            </ModalHeader>
            <ModalBody>
              <Label>
                <IntlMessages id="pages.service-name" />
              </Label>
              {userAction === "new" ? (
                <Input
                  className="form-control"
                  name="newServiceTitle"
                  type="text"
                  defaultValue=""
                />
              ) : (
                <Input
                  className="form-control"
                  name="service[title]"
                  type="text"
                  defaultValue={serviceEditData.service_title}
                  data-id={serviceEditData.id}
                />
              )}
              <Label className="mt-2"> Duration (In minutes) </Label>
              {userAction === "new" ? (
                <Input
                  className="form-control"
                  name="newServiceDuration"
                  type="number"
                  defaultValue={0}
                  min="0"
                />
              ) : (
                <Input
                  className="form-control"
                  name="service_duration"
                  type="number"
                  defaultValue={serviceEditData.service_duration}
                  data-id={serviceEditData.id}
                />
              )}
              <Row>
                <Colxx xxs="12" md="2">
                  {userAction === "new" ? (
                    <CustomInput
                      className="mt-2"
                      type="checkbox"
                      checked={this.state.isActive}
                      onChange={this.isActiveChange}
                      id="is_active"
                      label="is active"
                      value={this.state.isActive}
                    />
                  ) : (
                    <CustomInput
                      className="mt-2"
                      type="checkbox"
                      // checked={serviceEditData.is_active}
                      checked={this.state.isActive}
                      onChange={this.isActiveChange}
                      id="is_active"
                      label="is active"
                      value={this.state.isActive}
                    />
                  )}
                </Colxx>
                <Colxx xxs="12" md="2">
                  {userAction === "new" ? (
                    <CustomInput
                      className="mt-2"
                      type="checkbox"
                      checked={this.state.isAddons}
                      onChange={this.isAddonsChange}
                      id="is_addons"
                      label="is addons"
                      value={this.state.isAddons}
                    />
                  ) : (
                    <CustomInput
                      className="mt-2"
                      type="checkbox"
                      checked={this.state.isAddons}
                      onChange={this.isAddonsChange}
                      id="is_addons"
                      label="is addons"
                      value={this.state.isActive}
                    />
                  )}
                </Colxx>
                <Colxx xxs="12" md="2">
                  {userAction === "new" ? (
                    <CustomInput
                      className="mt-2"
                      type="checkbox"
                      checked={this.state.isFeatured}
                      onChange={this.isFeaturedChange}
                      id="is_featured"
                      label="is featured"
                      value={this.state.isFeatured}
                    />
                  ) : (
                    <CustomInput
                      className="mt-2"
                      type="checkbox"
                      checked={this.state.isFeatured}
                      onChange={this.isFeaturedChange}
                      id="is_featured"
                      label="is featured"
                      value={this.state.isFeatured}
                    />
                  )}
                </Colxx>
              </Row>
              <Label className="mt-3">Cities</Label>
              {this.state.services.map((service, idx) => (
                <div className="shareholder mt-2">
                  <Row>
                    <Colxx xxs="12" md="4">
                      {userAction === "new" ? (
                        <Select
                          components={{ Input: CustomSelectInput }}
                          className="react-select"
                          classNamePrefix="react-select"
                          isMulti
                          name="service[service_cities_attributes][][city_id]"
                          // onChange={(city) => this.getCityServices(city)}
                          options={cities_dropdown_json}
                        />
                      ) : (
                        <Select
                          components={{ Input: CustomSelectInput }}
                          className="react-select"
                          classNamePrefix="react-select"
                          // name="deal[deal_services_attributes][][service_id]"
                          // onChange={(service) => this.getServicePrice(service)}
                          // options={selected_service_values}
                        />
                      )}
                    </Colxx>
                    <Colxx xxs="12" md="4">
                      <Input
                        type="text"
                        placeholder={`Price`}
                        name="service[service_cities_attributes][][price]"
                        defaultValue=""
                        min="0"
                        // onChange={this.handleShareholderNameChange(idx)}
                      />
                    </Colxx>
                    <Colxx xxs="12" md="1">
                      {userAction === "new" ? (
                        <CustomInput
                          className="mt-2"
                          type="checkbox"
                          checked={this.state.isMaleAllowed}
                          onChange={this.isMaleChange}
                          name="service[service_cities_attributes][][is_male_allowed]"
                          label="Male"
                          value={this.state.isMaleAllowed}
                        />
                      ) : (
                        <CustomInput
                          className="mt-2"
                          type="checkbox"
                          checked={this.state.isMaleAllowed}
                          name="service[service_cities_attributes][][is_male_allowed]"
                          onChange={this.isMaleChange}
                          label="Male"
                          value={this.state.isMaleAllowed}
                        />
                      )}
                    </Colxx>
                    <Colxx xxs="12" md="2">
                      {userAction === "new" ? (
                        <CustomInput
                          className="mt-2"
                          type="checkbox"
                          checked={this.state.isFemaleAllowed}
                          onChange={this.isFemaleChange}
                          name="service[service_cities_attributes][][is_female_allowed]"
                          label="Female"
                          value={this.state.isFemaleAllowed}
                        />
                      ) : (
                        <CustomInput
                          className="mt-2"
                          type="checkbox"
                          checked={this.state.isFemaleAllowed}
                          onChange={this.isFemaleChange}
                          name="service[service_cities_attributes][][is_female_allowed]"
                          label="Female"
                          value={this.state.isFemaleAllowed}
                        />
                      )}
                    </Colxx>
                    <Colxx xxs="12" md="1">
                      <Button
                        type="button"
                        onClick={this.handleRemoveShareholder(idx)}
                        className="small">
                        -
                      </Button>
                    </Colxx>
                  </Row>
                </div>
              ))}
              <Row>
                <Colxx>
                  <Button
                    type="button"
                    onClick={this.handleAddShareholder}
                    className="small mt-2">
                    +
                  </Button>
                </Colxx>
              </Row>

              <Label className="mt-3">Addons</Label>
              {this.state.services.map((service, idx) => (
                <div className="shareholder mt-2">
                  <Row>
                    <Colxx xxs="12" md="4">
                      {userAction === "new" ? (
                        <Select
                          components={{ Input: CustomSelectInput }}
                          className="react-select"
                          classNamePrefix="react-select"
                          isMulti
                          name="service[service_addons_attributes][][service_addon_id]"
                          // onChange={(city) => this.getCityServices(city)}
                          options={cities_dropdown_json}
                        />
                      ) : (
                        <Select
                          components={{ Input: CustomSelectInput }}
                          className="react-select"
                          classNamePrefix="react-select"
                          // name="deal[deal_services_attributes][][service_id]"
                          // onChange={(service) => this.getServicePrice(service)}
                          // options={selected_service_values}
                        />
                      )}
                    </Colxx>
                    <Colxx xxs="12" md="1">
                      <Button
                        type="button"
                        onClick={this.handleRemoveShareholder(idx)}
                        className="small">
                        -
                      </Button>
                    </Colxx>
                  </Row>
                </div>
              ))}
              <Row>
                <Colxx>
                  <Button
                    type="button"
                    onClick={this.handleAddShareholder}
                    className="small mt-2">
                    +
                  </Button>
                </Colxx>
              </Row>
              {/* <Label className="mt-3">
                <IntlMessages id="menu.city" />
              </Label>

              {
                userAction === "new" ?
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  isMulti
                  name="service[service_cities_attributes][][city_id]"
                  // onChange={(city) => this.getCityServices(city)}
                  options={cities_dropdown_json}
                />
                :
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  isMulti
                  name="service[service_cities_attributes][][city_id]"
                  // onChange={(city) => this.getCityServices(city)}
                  options={cities_dropdown_json}
                  defaultValue={selected_dropdown_values}
                />
              } */}
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                outline
                onClick={toggleModal}
                type="button">
                <IntlMessages id="pages.cancel" />
              </Button>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>{" "}
            </ModalFooter>
          </form>
        </Modal>
      );
    } else {
      return <> </>;
    }
  }
}

export default AddServiceModal;
