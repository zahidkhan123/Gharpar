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
  InputGroup,
  InputGroupAddon
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../components/common/CustomSelectInput";
import IntlMessages from "../../helpers/IntlMessages";
import { Colxx } from "../../components/common/CustomBootstrap";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { servicePath, authHeaders } from "../../constants/defaultValues";
import { NotificationManager } from "../../components/common/react-notifications";
import axios from "axios";

class AddDealModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isActive: false,
      isAddons: false,
      isFeatured: false,
      isMaleAllowed: false,
      isFemaleAllowed: false,
      startDateRange: null,
      startDateTime: null,
      endDateTime: null,
      endDateRange: null,
      embeddedDate: moment(),
      services: [{ name: "" }],
      cities: [],
      cities_dropdown_json: [],
      dealServices:[],
      fetch_services: [],
      services_dropdown_data: [],
      servicePrice: ''
    };
    this.getCityServices = this.getCityServices.bind(this);
    this.getServicePrice = this.getServicePrice.bind(this);
    this.getAllCities = this.getAllCities.bind(this);
    this.prepareServicesJson = this.prepareServicesJson.bind(this);
    this.prepareCitiesJson = this.prepareCitiesJson.bind(this);
    this.handleChangeDateTime = this.handleChangeDateTime.bind(this);
  };

  async componentDidMount() {
    let fetch_cities = []
    fetch_cities = await this.getAllCities(fetch_cities);


    if (fetch_cities.length > 0) {
      this.prepareCitiesJson(fetch_cities);
    }
  };

  getAllCities = async (fetch_cities) => {
    let self = this;
    await axios
      .get(
        servicePath + "/api/v2/cities.json",
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            "AUTH-TOKEN": localStorage.getItem("auth_token")
          }
        }
      )
      .then(response => {
        fetch_cities = response.data.sort( (a, b) => parseInt(a.id) - parseInt(b.id));
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message, "", 5000, () => { alert("callback"); }, null, "filled"
        );
        console.log('Error: ', error.response.data.message);
      });
    return fetch_cities;
  };

  prepareCitiesJson = (fetch_cities) => {
    let cities_dropdown_data = []

    fetch_cities.forEach(function(currentValue) {
      cities_dropdown_data.push(
        {
          label: currentValue.city_name,
          value: currentValue.id,
          key: currentValue.id
        }
      )
    });

    this.setState({
      cities_dropdown_json: cities_dropdown_data
    });
  };

  getCityServices = async (cities_arr) => {
    let self = this;
    let cities_ids = cities_arr.map((single_city) => single_city.value);
    await axios.get(
      servicePath + "/api/v2/services.json?city_ids=" + cities_ids,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          "AUTH-TOKEN": localStorage.getItem("auth_token")
        }
      }
    )
    .then(response => {
      if (response.status == 200) {
        console.log(response);

        self.setState({
          fetch_services: response.data.services
        });

      }
      else {
        console.log(response);
      }
    })
    .catch((error) => {
      self.setState({
        areas: []
      });
      console.log('error', error)
    });

  }

  getServicePrice = async (service) => {
    let self = this;
    await axios.get(
      servicePath + "/api/v2/services/" + service.value +".json",
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          "AUTH-TOKEN": localStorage.getItem("auth_token")
        }
      }
    )
    .then(response => {
      if (response.status == 200) {
        console.log(response)

        self.setState({
          servicePrice: response.data.service_cities[0].price
        });

      }
      else {
        console.log(response);
      }
    })
    .catch((error) => {
      self.setState({
        areas: []
      });
      console.log('error', error)
    });

  }

  prepareServicesJson  = () => {
    const { fetch_services } = this.state
    let services_dropdown_data = []
    fetch_services.forEach(function(currentValue) {
        services_dropdown_data.push(
        {
          label: currentValue.service_title,
          value: currentValue.id,
          key: currentValue.id
        }
      )
    });

    return services_dropdown_data
  };

  isActiveChange = () => {
    this.setState({
      isActive: !this.state.isActive,
    });
  };

  isFemaleAllowedChange = () => {
    this.setState({
      isFemaleAllowed: !this.state.isFemaleAllowed,
    });
  };

  isMaleAllowedChange = () => {
    this.setState({
      isMaleAllowed: !this.state.isMaleAllowed,
    });
  };

  handleChangeStart = (date) => {
    this.setState({
      startDateRange: date
    });
  };

  handleChangeDateTime = (date) => {
    this.setState({
      startDateTime: date
    });
  };

  handleChangeEndDateTime = (date) => {
    this.setState({
      endDateTime: date
    });
  };

  handleChangeEnd = (date) => {
    this.setState({
      endDateRange: date
    });
  };

  handleNameChange = (evt) => {
    this.setState({ name: evt.target.value });
  };

  handleShareholderNameChange = idx => (evt) => {
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
      services: this.state.services.concat([
        { name: "" }
      ])
    });
  };

  handleRemoveShareholder = (idx) => () => {
    this.setState({
      services: this.state.services.filter((s, sidx) => idx !== sidx)
    });
  };

  render() {
    const {
      modalOpen,
      toggleModal,
      createDeal,
      updateDeal,
      userAction,
      serviceToEdit,
      dealToEdit,
    } = this.props;
    const fetch_services = this.prepareServicesJson();
    const {
      cities_dropdown_json,
      services_dropdown_data,
      servicePrice
    } = this.state

    let dealEditData = null;
    if (dealToEdit != undefined) {

      let deal_start_date = null;
      let deal_end_date = null;

      if (dealToEdit.deal_start_date != undefined && dealToEdit.deal_start_date.length > 0) {
        deal_start_date = dealToEdit.deal_start_date;
        deal_start_date = deal_start_date.split("T")[0] + " " + (deal_start_date.split("T")[1].split(".")[0]);
        deal_start_date = moment(deal_start_date, 'YYYY-MM-DD HH:mm')
      }

      if (dealToEdit.deal_end_date != undefined && dealToEdit.deal_end_date.length > 0) {
        deal_end_date = dealToEdit.deal_end_date;
        deal_end_date = deal_end_date.split("T")[0] + " " + (deal_end_date.split("T")[1].split(".")[0]);
        deal_end_date = moment(deal_end_date, 'YYYY-MM-DD HH:mm')
      }

      dealEditData = {
        id: dealToEdit.id,
        deal_title: dealToEdit.deal_title,
        is_male_allowed: dealToEdit.is_male_allowed,
        is_female_allowed: dealToEdit.is_female_allowed,
        is_active: dealToEdit.is_active,
        deal_start_date: deal_start_date,
        deal_end_date: deal_end_date
      }

    }

    if (cities_dropdown_json.length > 0) {      
      let selected_dropdown_values = []
      if (userAction == "edit") {
        let city_ids = dealToEdit.deal_cities.map(deal_city => deal_city.city_id)

        cities_dropdown_json.forEach(function(single_city, index) {
          if (city_ids.includes(single_city.value)) {
            selected_dropdown_values.push(single_city);
          }
        });
      }
      let selected_service_values = []
      if (userAction == "edit") {
        // let city_ids = dealToEdit.deal_cities.map(deal_service => deal_city.service_id)
        services_dropdown_data.forEach(function(single_service, index) {
            selected_service_values.push(single_service);
        });
      }

      return (
        <Modal
          isOpen={modalOpen}
          toggle={toggleModal}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <form autoComplete="off" onSubmit={userAction === "new" ? createDeal : updateDeal }>
            <ModalHeader toggle={toggleModal}>
              {
                userAction === "new" ? <IntlMessages id="pages.add-new-deal" /> : <IntlMessages id="pages.edit-deal" />
              }
            </ModalHeader>
            <ModalBody>
              <Label>
                Deal Title
              </Label>
              {
                userAction === "new" ?
                <Input className="form-control" name="deal[deal_title]" type="text" defaultValue="" /> :
                <Input className="form-control" name="deal[deal_title]" type="text" defaultValue={dealEditData.deal_title} data-id={dealEditData.id}/>
              }
              <Row>
                <Colxx xxs="12" md="6">
                  <Label className="mt-2">
                    Start Date
                  </Label>
                  {
                    userAction === "new" ?
                    <DatePicker
                      className="mb-5"
                      selected={this.state.startDateTime}
                      onChange={(event) => this.handleChangeDateTime(event)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="LLL"
                      timeCaption="Time"
                      name="deal[deal_start_date]"
                    />
                    :
                    <DatePicker
                      className="mb-5"
                      selected={this.state.startDateTime || dealEditData.deal_start_date}
                      onChange={(event) => this.handleChangeDateTime(event)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="LLL"
                      timeCaption="Time"
                      name="deal[deal_start_date]"
                    />
                  }
                </Colxx>
                <Colxx xxs="12" md="6">
                  <Label className="mt-2"> End Date </Label>
                  {
                    userAction === "new" ?
                    <DatePicker
                      className="mb-5"
                      selected={this.state.endDateTime || this.state.endDateTime}
                      onChange={this.handleChangeEndDateTime}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="LLL"
                      timeCaption="Time"
                      name="deal[deal_end_date]"
                    />
                    :
                    <DatePicker
                      className="mb-5"
                      selected={dealEditData.deal_end_date}
                      onChange={this.handleChangeEndDateTime}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="LLL"
                      timeCaption="Time"
                      name="deal[deal_end_date]"
                      defaultValue={this.state.endDateTime}
                    />
                  }
                </Colxx>
              </Row>
              <InputGroup className="mb-3 mt-3">
                  <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
                  <CustomInput
                    type="file"
                    id="deal_banner"
                    name="deal_banner"
                  />
                </InputGroup>
              <Row className="mt-2">
                <Colxx xxs="12" md="2">
                {
                  userAction === "new" ?
                  <CustomInput className="mt-2"
                    type="checkbox"
                    checked={this.state.isActive}
                    onChange={this.isActiveChange}
                    name="deal[is_active]"
                    id="is_active"
                    label="is active"
                    value= {this.state.isActive}
                  /> :
                  <CustomInput className="mt-2"
                    type="checkbox"
                    checked={this.state.isActive}
                    onChange={this.isActiveChange}
                    name="deal[is_active]"
                    id="is_active"
                    label="is active"
                    defaultValue={this.state.isActive}
                  />
                }
              </Colxx>
              <Colxx xxs="12" md="3">
                {
                  userAction === "new" ?
                  <CustomInput className="mt-2"
                    type="checkbox"
                    checked={this.state.isMaleAllowed}
                    onChange={this.isMaleAllowedChange}
                    id="is_male_allowed"
                    label="is male allowed"
                    name="deal[is_male_allowed]"
                    defaultValue= {this.state.isMaleAllowed}
                  /> :
                  <CustomInput className="mt-2"
                    type="checkbox"
                    checked={this.state.isMaleAllowed}
                    onChange={this.isMaleAllowedChange}
                    name="deal[is_male_allowed]"
                    id="is_male_allowed"
                    label="is male allowed"
                    defaultValue= {this.state.isMaleAllowed}
                  />
                }
              </Colxx>
              <Colxx xxs="12" md="3">
                {
                  userAction === "new" ?
                  <CustomInput className="mt-2"
                    type="checkbox"
                    checked={this.state.isFemaleAllowed}
                    onChange={this.isFemaleAllowedChange}
                    name="deal[is_female_allowed]"
                    id="is_female_allowed"
                    label="is female allowed"
                    value= {this.state.isFemaleAllowed}
                  /> :
                  <CustomInput className="mt-2"
                    type="checkbox"
                    checked={this.state.isFemaleAllowed}
                    onChange={this.isFemaleAllowedChange}
                    name="deal[is_female_allowed]"
                    id="is_female_allowed"
                    label="is female allowed"
                    value= {this.state.isFemaleAllowed}
                  />
                }
                </Colxx>
              </Row>

              <Label className="mt-3">
                <IntlMessages id="menu.city" />
              </Label>

              {
                userAction === "new" ?
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  isMulti
                  name="deal[deal_cities_attributes][][city_id]"
                  onChange={(city) => this.getCityServices(city)}
                  options={cities_dropdown_json}
                />
                :
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  isMulti
                  name="deal[deal_cities_attributes][][city_id]"
                  onChange={(city) => this.getCityServices(city)}
                  options={cities_dropdown_json}
                  defaultValue={selected_dropdown_values}
                />
              }

              <Label className="mt-3">Services</Label>
              {
                this.state.services.map((service, idx) => (
                  <div className="shareholder mt-2">
                    <Row>
                      <Colxx xxs="12" md="5">
                        {
                          userAction === "new" ?
                          <Select
                          components={{ Input: CustomSelectInput }}
                          className="react-select"
                          classNamePrefix="react-select"
                          name="deal[deal_services_attributes][][service_id]"
                          onChange={(service) => this.getServicePrice(service)}
                          options={fetch_services}
                          />
                          :
                          <Select
                          components={{ Input: CustomSelectInput }}
                          className="react-select"
                          classNamePrefix="react-select"
                          name="deal[deal_services_attributes][][service_id]"
                          onChange={(service) => this.getServicePrice(service)}
                          options={selected_service_values}
                          />
                        }
                        
                      </Colxx>
                      <Colxx xxs="12" md="3">
                        <Input
                        type="text"
                        placeholder={`Actual Price`}
                        name=""
                        value={servicePrice}
                        defaultValue="0.0"
                        readOnly
                        // onChange={this.handleShareholderNameChange(idx)}
                        />
                      </Colxx>
                      <Colxx xxs="12" md="3">
                        <Input
                        type="text"
                        placeholder={`Discounted Price`}
                        name="deal[deal_services_attributes][][discounted_price]"
                        value={service.name}
                        onChange={this.handleShareholderNameChange(idx)}
                        />
                      </Colxx>
                      <Colxx xxs="12" md="1">
                        <Button
                        type="button"
                        onClick={this.handleRemoveShareholder(idx)}
                        className="small"
                        >
                        -
                        </Button>
                      </Colxx>
                    </Row>
                  </div>
                ))
              }
              <Row>
                <Colxx>
                  <Button
                  type="button"
                  onClick={this.handleAddShareholder}
                  className="small mt-2"
                  >
                    +
                  </Button>
                </Colxx>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" outline onClick={toggleModal} type="button">
                <IntlMessages id="pages.cancel" />
              </Button>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>{" "}
            </ModalFooter>
          </form>
        </Modal>
      )


    }
    else {
      return (<> </>);
    }
  }
};

export default AddDealModal;
