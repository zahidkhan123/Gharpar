import React from "react";
import {
  CustomInput,
  Card,
  CardBody,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Input,
  Row,
  Label,
  InputGroup,
} from "reactstrap";
import Select from "react-select";
import { capitalizeFirstLetter } from "../../../helpers/Utils";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InputMask from "react-input-mask";
import { getImage } from "../../../helpers/Utils";
import axios from "axios";
import moment from "moment";
import { trackPromise } from "react-promise-tracker";

class EditUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cities: [],
      cities_json: [],
      areas: [],
      areas_json: [],
      working_cities: [],
      userObj: {},
      basicDetailsModal: false,
      servicesModal: false,
      workingDaysModal: false,
      gaurantorModal: false,
      addressModal: false,
      Days: [
        {
          id: 1,
          working_day: "Sunday",
          start_time: "09:00",
          end_time: "21:00",
        },
        {
          id: 2,
          working_day: "Monday",
          start_time: "09:00",
          end_time: "21:00",
        },
        {
          id: 3,
          working_day: "Tuesday",
          start_time: "09:00",
          end_time: "21:00",
        },
        {
          id: 4,
          working_day: "Wednesday",
          start_time: "09:00",
          end_time: "21:00",
        },
        {
          id: 5,
          working_day: "Thursday",
          start_time: "09:00",
          end_time: "21:00",
        },
        {
          id: 6,
          working_day: "Friday",
          start_time: "09:00",
          end_time: "21:00",
        },
        {
          id: 7,
          working_day: "Saturday",
          start_time: "09:00",
          end_time: "21:00",
        },
      ],

      checkedData: [],
      working_days: [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" },
      ],
      hub_types: [
        { label: "Hub A", value: "hub_a", key: 0 },
        { label: "Hub B", value: "hub_b", key: 1 },
        { label: "Hub C", value: "hub_c", key: 2 },
        { label: "Hub D", value: "hub_d", key: 3 },
        { label: "Hub E", value: "hub_e", key: 4 },
        { label: "Hub F", value: "hub_f", key: 5 },
      ],
      working_days_html: [],
      current_working_days_length: 0,
      startDateRange: null,
      endDateRange: null,
      all_services: [],
      all_services_json: [],
      user_services_json: [],
    };
  }

  handleChangeStart = (date) => {
    this.setState({
      startDateRange: date,
    });
  };

  handleChangeEnd = (date) => {
    this.setState({
      endDateRange: date,
    });
  };

  componentDidMount = async () => {
    const { match } = this.props;
    const { hub_types } = this.state;
    let user = await this.get_user(match.params.id);
    let checkedData = user.technician_working_days;
    var addresses = user.addresses;
    var address_last = addresses[addresses.length - 1];
    let cities = JSON.parse(localStorage.getItem("cities"));
    let cities_json = this.prepare_cities_json(cities);
    let all_areas = [];
    let areas_json = [];
    if (user.addresses.length) {
      all_areas = await this.get_city_areas(address_last.city_id);
      areas_json = this.prepare_areas_json(all_areas);
    }
    let working_days_html = this.prepare_working_days_json(user);
    let all_services = await this.get_all_services();
    let all_services_json = this.prepareServicesJson(all_services);
    let user_services_json = this.technician_services_dropdown_json(
      user.technician_services
    );

    let contract_from = user.contract_from;
    let contract_to = user.contract_to;

    if (contract_from === null) {
      contract_from = moment(new Date(), "YYYY/MM/DD");
    } else {
      contract_from = moment(user.contract_from?.split("T")[0], "YYYY/MM/DD");
    }

    if (contract_to === null) {
      contract_to = moment(new Date(), "YYYY/MM/DD");
    } else {
      contract_to = moment(user.contract_to?.split("T")[0], "YYYY/MM/DD");
    }

    let technicianType = "";
    if (user.technician_type !== "" && user.technician_type !== null) {
      technicianType = user.technician_type;
    } else {
      technicianType = "gp";
    }

    let default_hub = [];
    if (user.hub_type !== null) {
      default_hub = hub_types.filter((hub) => hub.value === user.hub_type);
      default_hub = default_hub[0];
    } else {
      default_hub = hub_types[0];
    }

    this.setState({
      cities: cities,
      cities_json: cities_json,
      areas: all_areas,
      areas_json: areas_json,
      userObj: user,
      startDateRange: contract_from,
      endDateRange: contract_to,
      working_days_html: working_days_html,
      current_working_days_length: user.technician_working_days.length,
      all_services: all_services,
      all_services_json: all_services_json,
      user_services_json: user_services_json,
      checkedData: checkedData,
      technicianType: technicianType,
      default_hub: default_hub,
    });
  };

  get_all_services = async () => {
    let services = [];

    await trackPromise(
      axios.get(servicePath + "/api/v2/services.json?all_services=true", {
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    ).then((response) => {
      services = response.data.services;
    });

    return services;
  };

  user_address_area_dropdown_json = (user) => {
    const { areas } = this.state;
    var addresses = user.addresses;
    var last_address = addresses[addresses.length - 1];
    let working_areas_json = [];

    areas.forEach(function (currentValue) {
      if (last_address.area_id === currentValue.id) {
        working_areas_json.push({
          label: currentValue.area_name,
          value: currentValue.id,
          key: currentValue.id,
        });
      }
    });

    return working_areas_json;
  };

  user_address_city_dropdown_json = (user) => {
    const { cities } = this.state;
    var addresses = user.addresses;
    var last_address = addresses[addresses.length - 1];
    let working_cities_json = [];

    cities.forEach(function (currentValue) {
      if (
        last_address !== undefined &&
        last_address.city_id === currentValue.id
      ) {
        working_cities_json.push({
          label: currentValue.city_name,
          value: currentValue.id,
          key: currentValue.id,
        });
      }
    });

    return working_cities_json;
  };

  user_city_ids_dropdown_json = (city_ids) => {
    const { cities } = this.state;
    city_ids = city_ids.map((city) => parseInt(city));
    let working_cities_json = [];

    cities.forEach(function (currentValue) {
      if (city_ids.includes(currentValue.id)) {
        working_cities_json.push({
          label: currentValue.city_name,
          value: currentValue.id,
          key: currentValue.id,
        });
      }
    });

    return working_cities_json;
  };

  technician_services_dropdown_json = (tech_services) => {
    let services_dropdown_data = [];

    tech_services.forEach(function (current_tech_service) {
      services_dropdown_data.push({
        label: current_tech_service.service_title,
        value: current_tech_service.service_id,
        key: current_tech_service.service_id,
        technician_service_table_id: current_tech_service.id,
      });
    });

    return services_dropdown_data;
  };

  prepareServicesJson = (all_services) => {
    let services_dropdown_data = [];

    all_services.forEach(function (single_service) {
      services_dropdown_data.push({
        label: single_service.service_title,
        value: single_service.id,
        key: single_service.id,
      });
    });

    return services_dropdown_data;
  };

  get_all_cities = async () => {
    let cities = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/cities.json",
      headers: {
        "Content-Type": "application/json",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
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

  get_services_data = async () => {
    let services = [];
    const { userObj } = this.state;

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/services/service_categories_for_edit_technician_services.json?technician_id=" +
          userObj.id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          services = response.data;
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

  toggleModalBasicDeatils = async (event) => {
    if (this.state.basicDetailsModal === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        basicDetailsModal: !this.state.basicDetailsModal,
      });
    } else {
      this.setState({
        basicDetailsModal: !this.state.basicDetailsModal,
      });
    }
  };

  toggleModalServices = async (event) => {
    if (this.state.servicesModal === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        servicesModal: !this.state.servicesModal,
      });
    } else {
      this.setState({
        servicesModal: !this.state.servicesModal,
      });
    }
  };

  toggleModalServicesNew = async (event) => {
    let services_data = [];
    if (this.state.servicesModalNew === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        services_data: services_data,
        servicesModalNew: !this.state.servicesModalNew,
      });
    } else {
      services_data = await this.get_services_data();
      this.setState({
        services_data: services_data,
        servicesModalNew: !this.state.servicesModalNew,
      });
    }
  };

  toggleModalWorkingDays = async (event) => {
    if (this.state.workingDaysModal === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        workingDaysModal: !this.state.workingDaysModal,
      });
    } else {
      this.setState({
        workingDaysModal: !this.state.workingDaysModal,
      });
    }
  };

  toggleModalGaurantor = async (event) => {
    if (this.state.gaurantorModal === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        gaurantorModal: !this.state.gaurantorModal,
      });
    } else {
      this.setState({
        gaurantorModal: !this.state.gaurantorModal,
      });
    }
  };

  toggleModalAddress = async (event) => {
    if (this.state.addressModal === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        addressModal: !this.state.addressModal,
      });
    } else {
      this.setState({
        addressModal: !this.state.addressModal,
      });
    }
  };

  removeMasking = (formElem) => {
    let new_val = "";

    // Phone fields for complete form

    // For Technician
    if (formElem.elements["user[phone]"] !== undefined) {
      if (formElem.elements["user[phone]"].value) {
        if (
          formElem.elements["user[phone]"].value.split("+92 ")[1] !== undefined
        ) {
          new_val = formElem.elements["user[phone]"].value
            .split("+92 ")[1]
            ?.replace(/[^0-9]/g, "");
          formElem.elements["user[phone]"].value = new_val;
        }
      }
    }

    // For Spouse/Parents of Technician
    if (
      formElem.elements["user[technician_spouses_attributes][][phone]"] !==
      undefined
    ) {
      if (
        formElem.elements["user[technician_spouses_attributes][][phone]"].value
      ) {
        new_val = formElem.elements[
          "user[technician_spouses_attributes][][phone]"
        ].value
          .split("+92 ")[1]
          ?.replace(/[^0-9]/g, "");
        formElem.elements[
          "user[technician_spouses_attributes][][phone]"
        ].value = new_val;
      }
    }

    // For Technician Gaurantors Phone
    let gaurantor_phones =
      formElem.elements["user[technician_guarantors_attributes][][phone]"];

    if (gaurantor_phones !== undefined && gaurantor_phones.length > 0) {
      gaurantor_phones.forEach((single_gaurantor, index) => {
        new_val = single_gaurantor.value
          .split("+92 ")[1]
          ?.replace(/[^0-9]/g, "");
        formElem.elements["user[technician_guarantors_attributes][][phone]"][
          index
        ].value = new_val;
      });
    }

    if (
      formElem.elements["user[cnic]"] !== undefined &&
      formElem.elements["user[cnic]"].value
    ) {
      new_val = formElem.elements["user[cnic]"].value.replace(/[^0-9]/g, "");
      formElem.elements["user[cnic]"].value = new_val;
    }

    // Format Contract from and Contract To
    let contract_from = formElem.elements["user[contract_from]"];
    if (contract_from !== undefined) {
      formElem.elements["user[contract_from]"].value = moment(
        contract_from.value
      ).format("YYYY-MM-DD");
    }

    let contract_to = formElem.elements["user[contract_to]"];
    if (contract_to !== undefined) {
      formElem.elements["user[contract_to]"].value = moment(
        contract_to.value
      ).format("YYYY-MM-DD");
    }

    return formElem;
  };

  filter_technician_services = (formData) => {
    const { user_services_json } = this.state;
    let technician_services =
      formData.elements["user[technician_services_attributes][][service_id]"];
    if (technician_services !== undefined) {
      if (
        technician_services.constructor !== undefined &&
        technician_services.constructor.name === "HTMLInputElement"
      ) {
        user_services_json.forEach((already_tech_service) => {
          if (
            parseInt(technician_services.value) ===
            parseInt(already_tech_service.value)
          ) {
            // This service already belongs to technician. Prevent it from submitting
            // Add class to it for marking it.
            formData.elements[
              "user[technician_services_attributes][][service_id]"
            ].classList.add("to_be_removed");
          }
        });
      } else if (
        technician_services.constructor !== undefined &&
        technician_services.constructor.name === "RadioNodeList"
      ) {
        technician_services.forEach((tech_service, index) => {
          // find this tech service in already those services which user already has
          // and if found, remove the name attribute to prevent it from submitting
          // so that duplication issue is resolved

          user_services_json.forEach((already_tech_service) => {
            if (
              parseInt(tech_service.value) ===
              parseInt(already_tech_service.value)
            ) {
              // This service already belongs to technician. Prevent it from submitting
              // Add class to it for marking it.
              formData.elements[
                "user[technician_services_attributes][][service_id]"
              ][index].classList.add("to_be_removed");
            }
          });
        });
      }
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

  insertWorkingDays = (checkedData, form_data) => {
    checkedData.forEach((single_checked) => {
      form_data.append(
        "user[technician_working_days_attributes][][working_day]",
        single_checked.working_day
      );
      form_data.append(
        "user[technician_working_days_attributes][][start_time]",
        single_checked.start_time
      );
      form_data.append(
        "user[technician_working_days_attributes][][end_time]",
        single_checked.end_time
      );
    });

    return form_data;
  };

  updateUser = async (event) => {
    const { checkedData } = this.state;
    event.preventDefault();
    let updated_form_data = this.filter_technician_services(event.target);
    updated_form_data = this.removeMasking(updated_form_data);
    let formData = new FormData(updated_form_data);
    formData = this.insertWorkingDays(checkedData, formData);
    const { working_cities } = this.state;

    // Handle Working cities
    let city_ids = [];
    if (working_cities.length) {
      city_ids = working_cities.map((single_city) => single_city.value);
      event.target.elements["user[city_ids][]"].value = city_ids;
    } else {
      // Throw error here
    }

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/v2/technicians/" +
          this.state.userObj.id +
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
            "Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          window.location.reload();
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

  get_city_areas = async (city) => {
    let self = this;
    let areas = [];
    await trackPromise(
      axios.get(servicePath + "/api/v2/areas.json?city_id=" + city, {
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
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
        self.setState({
          areas: [],
        });
        console.log("error", error);
      });

    return areas;
  };

  prepare_areas_json = (areas) => {
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

  change_areas_for_new_city = async (city) => {
    let all_areas = await this.get_city_areas(city);
    let areas_json = this.prepare_areas_json(all_areas);

    this.setState({
      areas: all_areas,
      areas_json: areas_json,
    });
  };

  get_user = async (user_id) => {
    let user = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/technicians/" + user_id + ".json",
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
        if (
          error.response.data.message ===
          "Your session expired. Please login again."
        ) {
          localStorage.removeItem("auth_token");
          this.props.history.push("/user/login");
        } else {
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
        }
      });

    return user;
  };

  prepare_cities_json = (cities) => {
    let cities_dropdown_data = [];

    cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
      });
    });

    return cities_dropdown_data;
  };

  renderActions = () => {
    const { userObj } = this.state;
    let actions = [];
    actions = (
      <>
        <ModalHeader>
          <IntlMessages id="pages.edit-new-user" />
        </ModalHeader>
        <Row>
          <Colxx xxs="5" className="text-right">
            <div className="mt-4">
              {getImage(userObj, "show")}
              {/* <img
                alt="Technician Image"
                src={userObj.profile_picture}
                className="img-fluid user-img"
              /> */}
            </div>
          </Colxx>
          <Colxx xs="6" className="text-left">
            <h5 className="mt-4">
              {userObj.first_name} {userObj.last_name}
            </h5>
            <h5 className="mt-2">{userObj.membership_code}</h5>
            <h5 className="mt-2">{userObj.gender}</h5>
          </Colxx>
        </Row>
        <Row>
          <Colxx xs="2" className="text-center">
            <Button
              className="mt-5"
              color="success"
              onClick={(event) => this.toggleModalBasicDeatils(event)}
            >
              Basic Details
            </Button>
          </Colxx>
          <Colxx xs="2" className="text-center">
            <Button
              className="mt-5"
              color="success"
              onClick={(event) => this.toggleModalServices(event)}
            >
              Working Cities
            </Button>
          </Colxx>
          {userObj.city_ids.length ? (
            <>
              <Colxx xs="2" className="text-center">
                <Button
                  className="mt-5"
                  color="success"
                  onClick={(event) => this.toggleModalServicesNew(event)}
                >
                  Services
                </Button>
              </Colxx>
            </>
          ) : (
            <></>
          )}

          <Colxx xs="2" className="text-center">
            <Button
              className="mt-5 ml-2"
              color="success"
              onClick={(event) => this.toggleModalWorkingDays(event)}
            >
              Working Days
            </Button>
          </Colxx>
          <Colxx xs="2" className="text-center">
            <Button
              className="mt-5"
              color="success"
              onClick={(event) => this.toggleModalGaurantor(event)}
            >
              Gaurantors/Spouse
            </Button>
          </Colxx>
          <Colxx xs="2" className="text-center">
            <Button
              className="mt-5"
              color="success"
              onClick={(event) => this.toggleModalAddress(event)}
            >
              Address
            </Button>
          </Colxx>
        </Row>
      </>
    );
    return actions;
  };

  render_gaurantor_details = () => {
    const { userObj } = this.state;
    let gaurantor_details = [];
    if (userObj.technician_guarantors.length === 0) {
      gaurantor_details = (
        <>
          <ModalHeader className="mb-4 mt-4">
            {" "}
            <IntlMessages id="pages.gaurantor-details-1" />{" "}
          </ModalHeader>

          <Row>
            <Colxx xs="6">
              <Label className="mt-4">First Name *</Label>
              <Input
                className="form-control"
                name="user[technician_guarantors_attributes][][first_name]"
                type="text"
                defaultValue=""
                required
              />
            </Colxx>

            <Colxx xs="6">
              <Label className="mt-4">Last Name *</Label>
              <Input
                className="form-control"
                name="user[technician_guarantors_attributes][][last_name]"
                type="text"
                defaultValue=""
                required
              />
            </Colxx>
          </Row>

          <Row>
            <Colxx xs="6">
              <Label className="mt-4">CNIC</Label>
              {/* <Input
                        className="form-control"
                        name="user[technician_guarantors_attributes][][cnic]"
                        type="text"
                        defaultValue=""
                        required
                      /> */}
              <InputMask
                mask="99999-9999999-9"
                className="form-control"
                name="user[technician_guarantors_attributes][][cnic]"
                defaultValue=""
                required
              />
            </Colxx>

            <Colxx xs="6">
              <Label className="mt-4">Phone *</Label>
              <InputMask
                mask="+\92 999-9999999"
                className="form-control"
                name="user[technician_guarantors_attributes][][phone]"
                defaultValue=""
                required
              />
              {/* <Input
                        className="form-control"
                        name="user[technician_guarantors_attributes][][phone]"
                        type="number"
                        defaultValue=""
                        required
                      /> */}
            </Colxx>
          </Row>

          <ModalHeader className="mb-4 mt-4">
            {" "}
            <IntlMessages id="pages.gaurantor-details-2" />{" "}
          </ModalHeader>

          <Row>
            <Colxx xs="6">
              <Label className="mt-4">First Name *</Label>
              <Input
                className="form-control"
                name="user[technician_guarantors_attributes][][first_name]"
                type="text"
                defaultValue=""
                required
              />
            </Colxx>

            <Colxx xs="6">
              <Label className="mt-4">Last Name *</Label>
              <Input
                className="form-control"
                name="user[technician_guarantors_attributes][][last_name]"
                type="text"
                defaultValue=""
                required
              />
            </Colxx>
          </Row>

          <Row>
            <Colxx xs="6">
              <Label className="mt-4">CNIC *</Label>
              {/* <Input
                        className="form-control"
                        name="user[technician_guarantors_attributes][][cnic]"
                        type="text"
                        defaultValue=""
                        required
                      /> */}
              <InputMask
                mask="99999-9999999-9"
                className="form-control"
                name="user[technician_guarantors_attributes][][cnic]"
                defaultValue=""
                required
              />
            </Colxx>

            <Colxx xs="6">
              <Label className="mt-4">Phone *</Label>
              <InputMask
                mask="+\92 999-9999999"
                className="form-control"
                name="user[technician_guarantors_attributes][][phone]"
                defaultValue=""
                required
              />
              {/* <Input
                        className="form-control"
                        name="user[technician_guarantors_attributes][][phone]"
                        type="number"
                        defaultValue=""
                        required
                      /> */}
            </Colxx>
          </Row>
        </>
      );
    } else {
      userObj.technician_guarantors.forEach(function (gaurantor, index) {
        gaurantor_details.push(
          <>
            <ModalHeader>
              {" "}
              <IntlMessages id={`pages.gaurantor-details-${index + 1}`} />{" "}
            </ModalHeader>

            <Row>
              <Colxx xxs="6">
                <Label className="mt-3">First Name *</Label>
                <Input
                  className="form-control"
                  name="user[technician_guarantors_attributes][][first_name]"
                  type="text"
                  defaultValue={gaurantor.first_name}
                  required
                />
              </Colxx>

              <Colxx xxs="6">
                <Label className="mt-3">Last Name *</Label>
                <Input
                  className="form-control"
                  name="user[technician_guarantors_attributes][][last_name]"
                  type="text"
                  defaultValue={gaurantor.last_name}
                  required
                />
              </Colxx>
            </Row>

            <Row>
              <Colxx xxs="6">
                <Label className="mt-3">CNIC *</Label>
                <InputMask
                  mask="99999-9999999-9"
                  className="form-control"
                  name="user[technician_guarantors_attributes][][cnic]"
                  defaultValue={gaurantor.cnic}
                  required
                />
              </Colxx>

              <Colxx xxs="6">
                <Label className="mt-3">Phone *</Label>
                <InputMask
                  mask="+\92 999-9999999"
                  className="form-control"
                  name="user[technician_guarantors_attributes][][phone]"
                  defaultValue={gaurantor.phone}
                  required
                />
              </Colxx>
            </Row>

            <Input
              className="form-control"
              name="user[technician_guarantors_attributes][][id]"
              type="text"
              defaultValue={gaurantor.id}
              hidden
            />
          </>
        );
      });
    }

    return gaurantor_details;
  };

  create_random_id = () => {
    const { working_days_html } = this.state;
    // returns random number between 1 and 100
    let rand_number = 0;
    let value_present = true;

    // search random number in working_days_html ids. If found generate new one otherwise find
    // Recurrsive process
    while (value_present) {
      rand_number = Math.floor(Math.random() * 100 + 1);
      value_present =
        working_days_html.filter((obj) => obj.id === rand_number).length > 0;
    }

    return rand_number;
  };

  add_working_day = () => {
    let self = this;
    let { working_days_html } = this.state;
    let new_id = this.create_random_id();
    let new_working_day_html = {
      id: new_id,
      _html: self.render_new_working_day(new_id),
    };
    // Find index of "Add More Btn"
    let index_of_new_html = working_days_html.findIndex((obj) => obj.id === 0);
    working_days_html.splice(index_of_new_html, 0, new_working_day_html);

    if (working_days_html.length === 8) {
      working_days_html = working_days_html.filter((obj) => obj.id !== 0);
    }

    this.setState({
      working_days_html: working_days_html,
    });
  };

  render_new_working_day = (new_id) => {
    const { working_days } = this.state;

    return (
      <Row className="mb-5">
        <Colxx xxs="4">
          <Label for="start_time">
            {" "}
            <IntlMessages id="Working Days*" />{" "}
          </Label>
          <Select
            components={{ Input: CustomSelectInput }}
            className="react-select"
            classNamePrefix="react-select"
            name="user[technician_working_days_attributes][][working_day]"
            options={working_days}
          />
        </Colxx>

        <Colxx xxs="3">
          <Label for="start_time">
            {" "}
            <IntlMessages id="Start Time*" />{" "}
          </Label>
          <Input
            className="form-control"
            name="user[technician_working_days_attributes][][start_time]"
            type="time"
            id="start_time"
            required
          />
        </Colxx>

        <Colxx xxs="3">
          <Label for="end_time">
            {" "}
            <IntlMessages id="End Time*" />{" "}
          </Label>
          <Input
            className="form-control"
            name="user[technician_working_days_attributes][][end_time]"
            type="time"
            id="end_time"
            required
          />
        </Colxx>

        <Colxx
          xxs="2"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <Button
            color="danger"
            data-id={new_id}
            onClick={(event) => {
              this.remove_working_day(event);
            }}
          >
            Delete
          </Button>
        </Colxx>
      </Row>
    );
  };

  remove_new_working_day = (event) => {
    event.preventDefault();
    let workind_day_elem = event.target;
    workind_day_elem.parentElement.parentElement.remove();
    const { current_working_days_length } = this.state;

    this.setState({
      current_working_days_length: current_working_days_length - 1,
    });
  };

  prepare_working_days_json = (user) => {
    let working_days_html = [];
    let self = this;

    if (user.technician_working_days.length > 0) {
      user.technician_working_days.forEach(function (single_working_day) {
        working_days_html.push({
          id: single_working_day.id,
          _html: self.render_single_working_day(single_working_day),
        });
      });
    }

    if (working_days_html.length < 7) {
      working_days_html.push({
        id: 0,
        _html: (
          <>
            <Button onClick={self.add_working_day}>Add More</Button>
          </>
        ),
      });
    }

    return working_days_html;
  };

  prepare_week_days_json = () => {
    const { userObj } = this.state;
    let working_days_dropdown_data = [];

    userObj.technician_working_days.forEach(function (single_working_day) {
      let day_name = single_working_day.working_day;
      working_days_dropdown_data.push({
        label: capitalizeFirstLetter(day_name),
        value: day_name,
        start_time: moment(single_working_day.start_time, ["h:mm A"]).format(
          "HH:mm"
        ),
        end_time: moment(single_working_day.end_time, ["h:mm A"]).format(
          "HH:mm"
        ),
        id: single_working_day.id,
        key: single_working_day.id,
      });
    });

    return working_days_dropdown_data;
  };

  remove_working_day_from_working_days_html = (workday_day_id) => {
    let { working_days_html } = this.state;
    let self = this;

    working_days_html = working_days_html.filter(
      (single_working_day) => single_working_day.id !== workday_day_id
    );

    if (
      working_days_html.length < 7 &&
      working_days_html.findIndex((obj) => obj.id === 0) === -1
    ) {
      // Days are less than 7 and no add more button is found. So render it here
      working_days_html.push({
        id: 0,
        _html: (
          <>
            <Button onClick={self.add_working_day}> Add More </Button>
          </>
        ),
      });
    }

    this.setState({
      working_days_html: working_days_html,
    });
  };

  delete_working_day = async (workday_day_id) => {
    await trackPromise(
      axios({
        method: "delete",
        url:
          servicePath +
          "/api/v2/technicians/working_days.json?working_day_id=" +
          workday_day_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          // workind_day_elem.parentElement.parentElement.remove();
          // remove from working_days_html array
          window.location.reload();
          // self.remove_working_day_from_working_days_html(workday_day_id);
          NotificationManager.success(
            "Working Day removed successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
        } else console.log(response);
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

  handleCheckChange = async (event, id) => {
    let target = event.target;
    let updated_value = target.checked;
    const { userObj } = this.state;
    // let value = "";
    // let controller_name = "";
    // if (target.checked) {
    //   value = true;
    // } else {
    //   value = false;
    // }

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/services/add_remove_technician_service.json?technician_id=" +
          userObj.id +
          "&service_id=" +
          id,
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
            "Services Updated Successfully",
            "",
            5000,
            () => {},
            null,
            "filled"
          );
          target.checked = updated_value;
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });
  };

  is_present_in_technician_working_days = (workday_day_id) => {
    const { userObj } = this.state;
    let value_present =
      userObj.technician_working_days.filter((obj) => obj.id === workday_day_id)
        .length > 0;
    return value_present;
  };

  remove_working_day = async (event) => {
    event.preventDefault();
    let self = this;
    let workind_day_elem = event.target;
    let workday_day_id = workind_day_elem.dataset["id"];

    if (this.is_present_in_technician_working_days(parseInt(workday_day_id))) {
      // working day is present in technician working days. hit api to remove it
      await this.delete_working_day(workday_day_id);
    } else {
      // working days is not present in technician working days. It's a new one recently added.
      // Simply remove it from working_days_html array
      self.remove_working_day_from_working_days_html(workday_day_id);
    }
  };

  move_to_list = () => {
    this.props.history.go(-1);
  };

  render_edit_form = () => {
    let edit_form_html = <> </>;

    edit_form_html = (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              {this.renderActions()}
              {this.renderBasicDetailsModal()}
              {this.renderServicesModal()}
              {this.renderServicesModalNew()}
              {this.renderWorkingDaysModal()}
              {this.renderGaurantorModal()}
              {this.renderAddressModal()}
              {/* {this.render_basic_form()} */}
              {/* {this.render_user_details()} */}
              {/* {this.render_working_days_heading()}
              {this.render_working_days()} */}
              {/* {this.render_gaurantor_details()}
              {this.render_spouse_details()} */}
              {/* {this.render_address_details()} */}
              {this.render_edit_form_footer()}
            </CardBody>
          </Card>
        </Colxx>
      </>
    );

    return edit_form_html;
  };

  delete_technician_service = async (technician_service_id) => {
    await trackPromise(
      axios({
        method: "delete",
        url:
          servicePath +
          "/api/v2/services/technician_services_destroy.json?technician_service_id=" +
          technician_service_id,
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

  remove_service_item = (services) => {
    // This function only checks if item is removed or not.
    // If removed, then it send api request to delete that service data. Otherwise, fine.

    const { user_services_json } = this.state;
    let removed_service = {};
    removed_service = user_services_json.filter(
      (single_service_data) => !services.includes(single_service_data)
    ); // calculates diff

    if (Object.keys(removed_service).length) {
      // Item has been removed from Multi Select. Find it and delete it
      this.delete_technician_service(
        removed_service[0].technician_service_table_id
      );
      this.setState({
        user_services_json: services.filter(
          (service) => service.technician_service_table_id !== undefined
        ),
      });
    }
  };

  handle_service_change = (services) => {
    this.remove_service_item(services);
  };

  render_basic_form = () => {
    const { userObj } = this.state;

    const genders = [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
    ];
    const religions = [
      { label: "Islam", value: "Islam", key: 0 },
      { label: "Christian", value: "Christian", key: 1 },
      { label: "Sikh", value: "Sikh", key: 2 },
      { label: "Hindu", value: "Hindu", key: 3 },
      { label: "Juda", value: "Juda", key: 4 },
    ];

    let basic_form_html = <> </>;
    basic_form_html = (
      <>
        <Label className="mt-4">Upload Image *</Label>
        <InputGroup className="mb-3">
          <CustomInput
            type="file"
            id="exampleCustomFileBrowser2"
            name="user[profile_picture]"
            accept="image/*"
          />
        </InputGroup>

        <Row>
          <Colxx xxs="6">
            <Label className="mt-4">First Name *</Label>
            <Input
              className="form-control"
              name="user[first_name]"
              type="text"
              defaultValue={userObj.first_name}
              required
            />
          </Colxx>

          <Colxx xxs="6">
            <Label className="mt-4">Last Name *</Label>
            <Input
              className="form-control"
              name="user[last_name]"
              type="text"
              defaultValue={userObj.last_name}
              required
            />
          </Colxx>
        </Row>

        <Row>
          <Colxx xxs="6">
            <Label className="mt-4">Phone *</Label>
            <InputMask
              mask="+\92 999-9999999"
              className="form-control"
              name="user[phone]"
              defaultValue={userObj.phone}
              required
            />
          </Colxx>
          <Colxx xxs="6">
            <Label className="mt-4">CNIC *</Label>
            <InputMask
              mask="99999-9999999-9"
              className="form-control"
              name="user[cnic]"
              defaultValue={userObj.cnic}
              required
            />
          </Colxx>
        </Row>

        <Row>
          <Colxx xxs="6">
            <Label className="mt-4">Gender *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              defaultValue={
                genders.filter((gender) => gender.value === userObj.gender)[0]
              }
              name="user[gender]"
              options={genders}
            />
          </Colxx>
          <Colxx xs="6">
            <Label className="mt-4">
              <IntlMessages id="pages.religion" />
            </Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              defaultValue={
                religions.filter(
                  (religion) => religion.value === userObj.religion
                )[0]
              }
              name="user[religion]"
              options={religions}
            />
          </Colxx>
        </Row>

        <Input
          className="form-control"
          name="user[country_code]"
          type="text"
          defaultValue="+92"
          hidden
        />
        <Input
          className="form-control"
          name="user[default_role]"
          type="text"
          defaultValue="Technician"
          hidden
        />
        {this.render_user_details()}
      </>
    );

    return basic_form_html;
  };

  handleWorkingCities = (city_ids) => {
    this.setState({
      working_cities: city_ids,
    });
  };

  render_spouse_details = () => {
    const { userObj } = this.state;
    let spouse_details_html = [];
    let technician_spouse = {};

    if (userObj.technician_spouses.length > 0) {
      technician_spouse = userObj.technician_spouses[0];
    }

    spouse_details_html.push(
      <>
        <ModalHeader>
          {" "}
          <IntlMessages id="pages.spouse-details" />{" "}
        </ModalHeader>

        <Row>
          <Colxx xxs="6">
            <Label className="mt-4">First Name *</Label>
            <Input
              className="form-control"
              name="user[technician_spouses_attributes][][first_name]"
              type="text"
              defaultValue={
                Object.keys(technician_spouse).length > 0
                  ? technician_spouse.first_name
                  : ""
              }
              required
            />
          </Colxx>

          <Colxx xxs="6">
            <Label className="mt-4">Last Name *</Label>
            <Input
              className="form-control"
              name="user[technician_spouses_attributes][][last_name]"
              type="text"
              defaultValue={
                Object.keys(technician_spouse).length > 0
                  ? technician_spouse.last_name
                  : ""
              }
              required
            />
          </Colxx>
        </Row>

        <Row>
          <Colxx xxs="6">
            <Label className="mt-4">CNIC *</Label>
            <InputMask
              mask="99999-9999999-9"
              className="form-control"
              name="user[technician_spouses_attributes][][cnic]"
              defaultValue={
                Object.keys(technician_spouse).length > 0
                  ? technician_spouse.cnic
                  : ""
              }
              required
            />
          </Colxx>

          <Colxx xxs="6">
            <Label className="mt-4">Phone *</Label>
            <InputMask
              mask="+\92 999-9999999"
              className="form-control"
              name="user[technician_spouses_attributes][][phone]"
              defaultValue={
                Object.keys(technician_spouse).length > 0
                  ? technician_spouse.phone
                  : ""
              }
              required
            />
          </Colxx>
        </Row>
      </>
    );

    if (Object.keys(technician_spouse).length > 0) {
      spouse_details_html.push(
        <>
          <Input
            hidden
            name="user[technician_spouses_attributes][][id]"
            type="text"
            defaultValue={technician_spouse.id}
          />
        </>
      );
    }

    return spouse_details_html;
  };

  render_address_details = () => {
    const { cities_json, areas_json, userObj } = this.state;
    var addresses = userObj.addresses;
    var address_last = addresses[addresses.length - 1];
    let last_address = this.user_address_city_dropdown_json(userObj);
    // let last_area = this.user_address_area_dropdown_json(userObj);

    // let working_city_ids_json = this.user_address_city_dropdown_json(
    //   userObj
    // );
    // const cities = this.prepare_cities_json();
    // const areas = this.prepare_areas_json();

    let address_details = <> </>;

    address_details = (
      <>
        <ModalHeader className="mb-4 mt-4">
          {" "}
          <IntlMessages id="pages.user-addresses" />{" "}
        </ModalHeader>

        {/* <Row>
          <Colxx xs="12">
            <Label className="mt-4">Title *</Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][address_title]"
              type="text"
              defaultValue=""
              required
            />
          </Colxx>
        </Row> */}

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">
              {" "}
              <IntlMessages id="pages.address-1" />{" "}
            </Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][address_1]"
              type="text"
              defaultValue={address_last.address_1}
            />
          </Colxx>
          <Colxx xs="6">
            <Label className="mt-4">
              {" "}
              <IntlMessages id="pages.address-2" />{" "}
            </Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][address_2]"
              type="text"
              defaultValue={address_last.address_2}
            />
          </Colxx>
        </Row>

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">
              {" "}
              <IntlMessages id="pages.zip-code" />{" "}
            </Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][zip_code]"
              type="text"
              defaultValue={address_last.zip_code}
            />
          </Colxx>
          <Colxx xs="6">
            <Label className="mt-4">
              {" "}
              <IntlMessages id="pages.landmark" />{" "}
            </Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][landmark]"
              type="text"
              defaultValue={address_last.landmark}
            />
          </Colxx>
        </Row>

        <Input
          className="form-control"
          name="user[addresses_attributes][][country_name]"
          type="text"
          defaultValue="+92"
          hidden
        />

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">City *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[addresses_attributes][][city_id]"
              defaultValue={last_address}
              onChange={(city) => this.change_areas_for_new_city(city.value)}
              options={cities_json}
            />
          </Colxx>
          <Colxx xs="6">
            <Label className="mt-4">Area *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              defaultValue={{
                label: address_last.area_name,
                value: address_last.area_id,
              }}
              name="user[addresses_attributes][][area_id]"
              options={areas_json}
            />
          </Colxx>
        </Row>
      </>
    );

    return address_details;
  };

  render_edit_form_footer = () => {
    let form_footer = <> </>;

    form_footer = (
      <>
        <ModalFooter className="mt-4">
          <Button
            color="secondary"
            outline
            type="button"
            onClick={this.move_to_list}
          >
            <IntlMessages id="pages.cancel" />
          </Button>
        </ModalFooter>
      </>
    );

    return form_footer;
  };

  prepare_single_day_json = (single_working_day) => {
    return {
      label: capitalizeFirstLetter(single_working_day.working_day),
      value: single_working_day.working_day,
      start_time: moment(single_working_day.start_time, ["h:mm A"]).format(
        "HH:mm"
      ),
      end_time: moment(single_working_day.end_time, ["h:mm A"]).format("HH:mm"),
      id: single_working_day.id,
      key: single_working_day.id,
    };
  };

  render_single_working_day = (single_working_day) => {
    let single_day_json = this.prepare_single_day_json(single_working_day);
    const { working_days } = this.state;

    let working_day_html = (
      <>
        <Row className="mb-5">
          <Colxx xxs="4">
            <Label for="start_time">Working Days</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[technician_working_days_attributes][][working_day]"
              options={working_days}
              defaultValue={single_day_json}
            />
          </Colxx>

          <Colxx xxs="3">
            <Label for="start_time">Start Time *</Label>
            <Input
              className="form-control"
              name="user[technician_working_days_attributes][][start_time]"
              type="time"
              defaultValue={single_day_json.start_time}
              required
            />
          </Colxx>

          <Colxx xxs="3">
            <Label for="end_time">End Time *</Label>
            <Input
              className="form-control"
              name="user[technician_working_days_attributes][][end_time]"
              type="time"
              defaultValue={single_day_json.end_time}
              required
            />
          </Colxx>

          <Colxx
            xxs="2"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <Button
              color="danger"
              data-id={single_day_json.id}
              onClick={async (event) => {
                await this.remove_working_day(event);
              }}
            >
              Delete
            </Button>
          </Colxx>

          <Input
            hidden
            name="user[technician_working_days_attributes][][id]"
            defaultValue={single_day_json.id}
          />
        </Row>
      </>
    );

    return working_day_html;
  };

  renderBasicDetailsModal = () => {
    const { basicDetailsModal } = this.state;
    let render_modal = <> </>;
    render_modal = (
      <>
        <Modal
          isOpen={basicDetailsModal}
          toggle={this.toggleModalBasicDeatils}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <form onSubmit={this.updateUser} autoComplete="off">
            <ModalBody>{this.render_basic_form()}</ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>
              <Button
                color="secondary"
                outline
                onClick={this.toggleModalBasicDeatils}
                type="button"
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
    return render_modal;
  };

  renderServicesModal = () => {
    const {
      servicesModal,
      userObj,
      user_services_json,
      all_services_json,
      cities_json,
    } = this.state;

    let working_city_ids_json = this.user_city_ids_dropdown_json(
      userObj.city_ids
    );
    let render_modal = <> </>;
    render_modal = (
      <>
        <Modal
          isOpen={servicesModal}
          toggle={this.toggleModalServices}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <form onSubmit={this.updateUser} autoComplete="off">
            <ModalBody>
              {/* <Row>
                <Colxx xs="12">
                  <Label className="mt-4">Select Services *</Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    isMulti
                    name="user[technician_services_attributes][][service_id]"
                    onChange={this.handle_service_change}
                    defaultValue={user_services_json}
                    options={all_services_json}
                  />
                </Colxx>
              </Row> */}
              <Row>
                <Colxx xs="12">
                  <Label className="mt-4">Working Cities *</Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    isMulti
                    name="user[city_ids][]"
                    onChange={(e) => this.handleWorkingCities(e)}
                    defaultValue={working_city_ids_json}
                    options={cities_json}
                  />
                </Colxx>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>
              <Button
                color="secondary"
                outline
                onClick={this.toggleModalServices}
                type="button"
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
    return render_modal;
  };

  renderServicesModalNew = () => {
    const { servicesModalNew } = this.state;

    let render_modal = <> </>;
    render_modal = (
      <>
        <Modal
          isOpen={servicesModalNew}
          toggle={this.toggleModalServicesNew}
          wrapClassName="modal-right"
          backdrop="static"
          // style={{ width: "1200px" }}
        >
          <ModalHeader toggle={this.toggleModalServicesNew}>
            Services
          </ModalHeader>
          <ModalBody>{this.render_new_services_data()}</ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              outline
              onClick={this.toggleModalServicesNew}
              type="button"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
    return render_modal;
  };

  render_new_services_data = () => {
    let self = this;
    const { services_data } = this.state;
    let services_data_html = [];
    if (services_data !== undefined) {
      services_data.map((single_category) => {
        services_data_html.push(
          <>
            <tr className="mt-1">
              <td
                colSpan="12"
                className="text-center"
                style={{ border: "1px solid black" }}
              >
                <b>{single_category.service_category_title} </b>
              </td>
            </tr>
            <tr>
              {single_category.services.map((single_service) => {
                return (
                  <span style={{ width: "170px", float: "left" }}>
                    <CustomInput
                      className="mt-2"
                      label={single_service.service_title}
                      type="checkbox"
                      checked={single_service.is_added}
                      onChange={(event) =>
                        self.handleCheckChange(event, single_service.service_id)
                      }
                    />
                  </span>
                );
              })}
            </tr>
          </>
        );
      });
    }

    return services_data_html;
  };

  renderWorkingDaysModal = () => {
    const { workingDaysModal } = this.state;
    let self = this;
    let render_modal = <> </>;
    render_modal = (
      <>
        <Modal
          isOpen={workingDaysModal}
          toggle={this.toggleModalWorkingDays}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <form onSubmit={this.updateUser} autoComplete="off">
            <ModalBody>
              {self.render_working_days_heading()}
              {self.render_working_days()}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>
              <Button
                color="secondary"
                outline
                onClick={this.toggleModalWorkingDays}
                type="button"
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
    return render_modal;
  };

  renderGaurantorModal = () => {
    const { gaurantorModal } = this.state;

    let render_modal = <> </>;
    render_modal = (
      <>
        <Modal
          isOpen={gaurantorModal}
          toggle={this.toggleModalGaurantor}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <form onSubmit={this.updateUser} autoComplete="off">
            <ModalBody>
              {this.render_gaurantor_details()}
              {this.render_spouse_details()}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>
              <Button
                color="secondary"
                outline
                onClick={this.toggleModalGaurantor}
                type="button"
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
    return render_modal;
  };

  renderAddressModal = () => {
    const { addressModal } = this.state;

    let render_modal = <> </>;
    render_modal = (
      <>
        <Modal
          isOpen={addressModal}
          toggle={this.toggleModalAddress}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <form onSubmit={this.updateUser} autoComplete="off">
            <ModalBody>{this.render_address_details()}</ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>
              <Button
                color="secondary"
                outline
                onClick={this.toggleModalAddress}
                type="button"
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
    return render_modal;
  };

  render_working_days_heading = () => {
    let heading = (
      <>
        <ModalHeader className="mb-4 mt-4">Working Hours</ModalHeader>
      </>
    );

    return heading;
  };

  onChangeHandler = (e) => {
    const { checkedData } = this.state;
    let arr = this.state.Days;
    let id = e.target.id;
    if (e.target.checked) {
      let day_index = null;
      arr.map((item, index) => {
        if (item.id === parseInt(id)) {
          day_index = index;
        }
        return item;
      });
      let object = arr[day_index];
      this.setState({
        checkedData: [...checkedData, object],
      });
    } else {
      let removedArray = checkedData.filter((item) => item.id !== parseInt(id));
      this.setState({
        checkedData: removedArray,
      });
    }
  };

  onStartTimeChange = (event) => {
    const { Days, checkedData } = this.state;
    let day_id = event.target.id.split("-")[1];
    Days.map((single_day, index) => {
      if (single_day.working_day === day_id) {
        Days[index].start_time = event.target.value;
      }
      return single_day;
    });
    checkedData.map((single_day, index) => {
      if (single_day.working_day === day_id) {
        checkedData[index].start_time = event.target.value;
      }
      return single_day;
    });

    this.setState({
      Days,
      checkedData,
    });
  };

  onEndTimeChange = (event) => {
    const { Days, checkedData } = this.state;
    let day_id = event.target.id.split("-")[1];
    checkedData.map((single_day, index) => {
      if (single_day.working_day === day_id) {
        checkedData[index].end_time = event.target.value;
      }
      return single_day;
    });
    Days.map((single_day, index) => {
      if (single_day.working_day === day_id) {
        Days[index].end_time = event.target.value;
      }
      return single_day;
    });
    this.setState({
      Days,
      checkedData,
    });
  };

  render_working_days = () => {
    const { Days, checkedData } = this.state;
    let self = this;
    let working_days_html = [];
    let working_day = [];
    Days.map((single_day, index) => {
      working_day = checkedData.filter(
        (item) => item.working_day === single_day.working_day
      );
      working_days_html.push(
        <Row className="mb-5 mt-4">
          {working_day.length > 0 ? (
            <>
              <Colxx xxs="4">
                <CustomInput
                  id={working_day[0].id}
                  label={working_day[0].working_day}
                  className="ml-5 mt-5"
                  type="checkbox"
                  defaultChecked={true}
                  onChange={self.onChangeHandler}
                />
              </Colxx>
              <Colxx xxs="4">
                <Label for="start_time">
                  <IntlMessages id="pages.user-start-time" />
                </Label>
                <Input
                  id={"start_time-" + working_day[0].working_day}
                  type="time"
                  name="start_time"
                  defaultValue={working_day[0].start_time}
                  onChange={(event) => self.onStartTimeChange(event)}
                />
              </Colxx>
              <Colxx xxs="4">
                <Label for="end_time">
                  <IntlMessages id="pages.user-end-time" />
                </Label>
                <Input
                  id={"end_time-" + working_day[0].working_day}
                  type="time"
                  name="end_time"
                  defaultValue={working_day[0].end_time}
                  onChange={(event) => self.onEndTimeChange(event)}
                />
              </Colxx>
            </>
          ) : (
            <>
              <Colxx xxs="4">
                <CustomInput
                  id={single_day.id}
                  label={single_day.working_day}
                  className="ml-5 mt-5"
                  type="checkbox"
                  defaultChecked={false}
                  onChange={self.onChangeHandler}
                />
              </Colxx>
              <Colxx xxs="4">
                <Label for="start_time">
                  <IntlMessages id="pages.user-start-time" />
                </Label>
                <Input
                  id={"start_time-" + single_day.working_day}
                  type="time"
                  name="start_time"
                  defaultValue={single_day.start_time}
                  onChange={(event) => self.onStartTimeChange(event)}
                />
              </Colxx>
              <Colxx xxs="4">
                <Label for="end_time">
                  <IntlMessages id="pages.user-end-time" />
                </Label>
                <Input
                  id={"end_time-" + single_day.working_day}
                  type="time"
                  name="end_time"
                  defaultValue={single_day.end_time}
                  onChange={(event) => self.onEndTimeChange(event)}
                />
              </Colxx>
            </>
          )}
        </Row>
      );
      return single_day;
    });
    return working_days_html;
  };
  setTechnicianType = (e) => {
    const { userObj, hub_types } = this.state;
    let default_hub = [];
    if (userObj.hub_type !== null) {
      default_hub = hub_types.filter((hub) => hub.value === userObj.hub_type);
      default_hub = default_hub[0];
    } else {
      default_hub = hub_types[0];
    }
    this.setState({
      technicianType: e.value,
      default_hub: default_hub,
    });
  };

  render_user_details = () => {
    const { userObj, technicianType, hub_types, default_hub } = this.state;

    let user_details_form = <> </>;
    const genders = [
      { label: "Male", value: "Male", key: 0 },
      { label: "Female", value: "Female", key: 1 },
    ];
    const technician_types = [
      { label: "GP", value: "gp", key: 0 },
      { label: "Hoor", value: "hoor", key: 1 },
    ];

    const contract_types = [
      { label: "Commission", value: "commission", key: 0 },
      { label: "Salary", value: "salary", key: 1 },
    ];

    // const hub_types = [
    //   { label: "Hub A", value: "hub_a", key: 0 },
    //   { label: "Hub B", value: "hub_b", key: 1 },
    //   { label: "Hub C", value: "hub_c", key: 2 },
    //   { label: "Hub D", value: "hub_d", key: 3 },
    //   { label: "Hub E", value: "hub_e", key: 4 },
    // ];

    let start_date_range = this.state.startDateRange;
    let end_date_range = this.state.endDateRange;

    user_details_form = (
      <>
        <Row>
          <Colxx xxs="3">
            <Label className="mt-4">Preferred Gender *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              defaultValue={
                genders.filter(
                  (gender) => gender.value === userObj.preffered_gender
                )[0]
              }
              name="user[preffered_gender]"
              options={genders}
            />
          </Colxx>
          <Colxx xxs="3">
            <Label className="mt-4">Technician Type</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[technician_type]"
              options={technician_types}
              onChange={(e) => {
                this.setTechnicianType(e, technician_types);
              }}
              defaultValue={
                userObj.technician_type === "gp"
                  ? technician_types[0]
                  : technician_types[1]
              }
            />
          </Colxx>

          {technicianType === "gp" ? (
            <>
              <Colxx xxs="3">
                <Label className="mt-4">Contract Type</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="user[contract_type]"
                  options={contract_types}
                  defaultValue={
                    userObj.contract_type === "commission"
                      ? contract_types[0]
                      : contract_types[1]
                  }
                />
              </Colxx>

              <Colxx xxs="3">
                <Label className="mt-4">Commission (%)</Label>
                <Input
                  className="form-control"
                  name="user[commission]"
                  type="text"
                  defaultValue={userObj.commission}
                />
              </Colxx>
            </>
          ) : (
            <>
              <Colxx xxs="3">
                <Label className="mt-4">Hub</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="user[hub_type]"
                  options={hub_types}
                  defaultValue={default_hub}
                />
              </Colxx>
              <Colxx xxs="3">
                <Label className="mt-4">Contract Type</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="user[contract_type]"
                  options={contract_types}
                  defaultValue={
                    userObj.contract_type === "commission"
                      ? contract_types[0]
                      : contract_types[1]
                  }
                />
              </Colxx>

              <Colxx xxs="3">
                <Label className="mt-4">Commission (%)</Label>
                <Input
                  className="form-control"
                  name="user[commission]"
                  type="text"
                  defaultValue={userObj.commission}
                />
              </Colxx>
            </>
          )}
          <Colxx xxs="3">
            <Label className="mt-4">Contract From *</Label>
            <DatePicker
              selected={start_date_range}
              onChange={this.handleChangeStart}
              name="user[contract_from]"
              required
            />
          </Colxx>
          <Colxx xxs="3">
            <Label className="mt-4">Contract To *</Label>
            <DatePicker
              selected={end_date_range}
              onChange={this.handleChangeEnd}
              name="user[contract_to]"
              selectsEnd
              required
            />
          </Colxx>
          <Colxx xxs="3">
            <Label className="mt-4">Beautician Code *</Label>
            <Input
              className="form-control"
              name="user[membership_code]"
              type="text"
              defaultValue={userObj.membership_code}
              required
              readOnly
            />
          </Colxx>

          <Colxx xxs="3">
            <Label className="mt-4">Notes</Label>
            <Input
              className="form-control"
              name="user[notes]"
              type="text"
              defaultValue={userObj.notes}
            />
          </Colxx>
        </Row>

        {/* <Row>
          <Colxx xxs="6">
            <Label className="mt-4">Beautician Code *</Label>
            <Input
              className="form-control"
              name="user[membership_code]"
              type="text"
              defaultValue={userObj.membership_code}
              required
              readOnly
            />
          </Colxx>

          <Colxx xxs="6">
            <Label className="mt-4">Notes</Label>
            <Input
              className="form-control"
              name="user[notes]"
              type="text"
              defaultValue={userObj.notes}
            />
          </Colxx>
        </Row> */}
      </>
    );

    return user_details_form;
  };

  render() {
    const { userObj } = this.state;

    if (Object.keys(userObj).length === 0) {
      return <></>;
    } else {
      return <>{this.render_edit_form()}</>;
    }
  }
}

export default EditUser;
