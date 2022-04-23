import React from "react";
import {
  CustomInput,
  Button,
  Card,
  CardBody,
  ModalHeader,
  ModalFooter,
  Input,
  Label,
  InputGroup,
  Row,
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Colxx } from "../../../components/common/CustomBootstrap";
import InputMask from "react-input-mask";
import moment from "moment";
import { trackPromise } from "react-promise-tracker";

class NewUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cities: [],
      areas: [],
      technicianType: "gp",
      working_days: [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" },
      ],
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
      work_timings: [],
      working_cities: [],
      current_working_days_length: 1,
      all_services: [],
      working_days_json: [],
      startDateRange: null,
      endDateRange: null,
    };

    this.createUser = this.createUser.bind(this);
    this.prepare_areas_json = this.prepare_areas_json.bind(this);
    this.get_all_services = this.get_all_services.bind(this);
    this.render_user_details = this.render_user_details.bind(this);
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

  async componentDidMount() {
    let cities = JSON.parse(localStorage.getItem("cities"));
    let services = await this.get_all_services();

    this.setState({
      cities: cities,
      all_services: services,
    });
  }

  get_all_cities = async () => {
    let cities = [];
    await axios
      .get(servicePath + "/api/v2/cities.json", {
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
      .then((response) => {
        cities = response.data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      });

    return cities;
  };

  get_city_areas = async (city) => {
    let self = this;

    await trackPromise(
      axios.get(servicePath + "/api/v2/areas.json?city_id=" + city.value, {
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
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

  removeMasking = (formElem) => {
    let new_val = "";

    // Phone fields for complete form

    // For Technician
    if (formElem.elements["user[phone]"].value) {
      if (
        formElem.elements["user[phone]"].value.split("+92 ")[1] !== undefined
      ) {
        new_val = formElem.elements["user[phone]"].value
          .split("+92 ")[1]
          .replace(/[^0-9]/g, "");
        formElem.elements["user[phone]"].value = new_val;
      }
    }

    // For Spouse/Parents of Technician
    // if (
    //   formElem.elements["user[technician_spouses_attributes][][phone]"].value
    // ) {
    //   if (
    //     formElem.elements[
    //       "user[technician_spouses_attributes][][phone]"
    //     ].value.split("+92 ")[1] !== undefined
    //   ) {
    //     new_val = formElem.elements[
    //       "user[technician_spouses_attributes][][phone]"
    //     ].value
    //       .split("+92 ")[1]
    //       .replace(/[^0-9]/g, "");
    //     formElem.elements[
    //       "user[technician_spouses_attributes][][phone]"
    //     ].value = new_val;
    //   }
    // }

    // // For Technician Gaurantors Phone
    // let gaurantor_phones =
    //   formElem.elements["user[technician_guarantors_attributes][][phone]"];

    // gaurantor_phones.forEach((single_gaurantor, index) => {
    //   if (single_gaurantor.value.split("+92 ")[1] !== undefined) {
    //     new_val = single_gaurantor.value
    //       .split("+92 ")[1]
    //       .replace(/[^0-9]/g, "");
    //     formElem.elements["user[technician_guarantors_attributes][][phone]"][
    //       index
    //     ].value = new_val;
    //   }
    // });

    if (formElem.elements["user[cnic]"].value) {
      new_val = formElem.elements["user[cnic]"].value.replace(/[^0-9]/g, "");
      formElem.elements["user[cnic]"].value = new_val;
    }

    // Format Contract from and Contract To
    let contract_from = formElem.elements["user[contract_from]"].value;
    formElem.elements["user[contract_from]"].value =
      moment(contract_from).format("YYYY-MM-DD");

    let contract_to = formElem.elements["user[contract_to]"].value;
    formElem.elements["user[contract_to]"].value =
      moment(contract_to).format("YYYY-MM-DD");

    return formElem;
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

  createUser = async (event) => {
    event.preventDefault();
    const { working_cities, checkedData } = this.state;
    let form_data = new FormData(this.removeMasking(event.target));

    form_data = this.insertWorkingDays(checkedData, form_data);

    // event.target.elements["user[technician_working_days_attributes][]"].forEach(
    //   (single_elem, index) => {
    //     event.target.elements["user[technician_working_days_attributes][]"][index]
    //   });
    // if (checkedData.length > 0) {
    //   event.target.elements[
    //     "user[technician_working_days_attributes][]"
    //   ].value = JSON.stringify(checkedData);
    // }

    // Handle Working cities
    let city_ids = [];
    if (working_cities.length) {
      city_ids = working_cities.map((single_city) => single_city.value);
      event.target.elements["user[city_ids][]"].value = city_ids;
    } else {
      // Throw error here
    }

    if (
      event.target.elements["user[documents_attributes][][file]"].files.length >
      0
    ) {
      let document_files =
        event.target.elements["user[documents_attributes][][file]"].files;

      for (let i = 0; i < document_files.length; i++) {
        form_data.append(
          "user[documents_attributes][][file]",
          document_files[i],
          document_files[i].name
        );
      }
    }

    if (event.target.elements["user[profile_picture]"].files.length > 0) {
      let profile_image =
        event.target.elements["user[profile_picture]"].files[0];
      form_data.append(
        "user[profile_picture]",
        profile_image,
        profile_image.name
      );
    }

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/technicians.json",
        data: form_data,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Technician Created Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/technicians/show/" + response.data.id);
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

  prepare_cities_json = () => {
    const { cities } = this.state;
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

  get_all_services = async () => {
    let services = [];
    await trackPromise(
      axios.get(servicePath + "/api/v2/services.json?all_services=true", {
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      services = response.data.services;
    });

    return services;
  };

  prepareServicesJson = () => {
    const { all_services } = this.state;
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

  setTechnicianType = (e) => {
    this.setState({
      technicianType: e.value,
    });
  };

  render_user_details = () => {
    const { technicianType } = this.state;
    let user_details = <> </>;
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

    const hub_types = [
      { label: "Hub A", value: "hub_a", key: 0 },
      { label: "Hub B", value: "hub_b", key: 1 },
      { label: "Hub C", value: "hub_c", key: 2 },
      { label: "Hub D", value: "hub_d", key: 3 },
      { label: "Hub E", value: "hub_e", key: 4 },
    ];

    user_details = (
      <>
        <ModalHeader className="mb-4 mt-4">Technician Details</ModalHeader>

        <Row>
          <Colxx xxs="3">
            <Label className="mt-4">Preferred Gender *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[preffered_gender]"
              options={genders}
              defaultValue={genders[1]}
            />
          </Colxx>
          <Colxx xxs="3">
            <Label className="mt-4">Technician Type</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[technician_type]"
              onChange={(e) => {
                this.setTechnicianType(e);
              }}
              options={technician_types}
              // defaultValue={genders[1]}
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
                  // defaultValue={genders[1]}
                />
              </Colxx>
              <Colxx xxs="3">
                <Label className="mt-4">Commission (%)</Label>
                <Input
                  className="form-control"
                  name="user[commission]"
                  type="text"
                  defaultValue=""
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
                  // defaultValue={genders[1]}
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
                  // defaultValue={genders[1]}
                />
              </Colxx>
              <Colxx xxs="3">
                <Label className="mt-4">Commission (%)</Label>
                <Input
                  className="form-control"
                  name="user[commission]"
                  type="text"
                  defaultValue=""
                />
              </Colxx>
            </>
          )}
          <Colxx xxs="3">
            <Label className="mt-4">Contract From *</Label>
            <DatePicker
              selected={this.state.startDateRange}
              onChange={this.handleChangeStart}
              name="user[contract_from]"
              selectsStart
              required
            />
          </Colxx>
          <Colxx xxs="3">
            <Label className="mt-4">Contract To *</Label>
            <DatePicker
              selected={this.state.endDateRange}
              onChange={this.handleChangeEnd}
              name="user[contract_to]"
              selectsEnd
              required
            />
          </Colxx>
          <Colxx xxs="3">
            <Label className="mt-4">Notes</Label>
            <Input
              className="form-control"
              name="user[notes]"
              type="text"
              defaultValue=""
            />
          </Colxx>
        </Row>

        <Row>
          {/* <Colxx xxs="6">
            <Label className="mt-4">Beautician Code *</Label>
            <Input
              className="form-control"
              name="user[membership_code]"
              type="text"
              defaultValue=""
              required
            />
          </Colxx> */}
        </Row>
      </>
    );

    return user_details;
  };

  render_spouse_details = () => {
    let spouse_details = <> </>;

    spouse_details = (
      <>
        <ModalHeader className="mb-4 mt-4">
          <IntlMessages id="pages.spouse-details" />{" "}
        </ModalHeader>

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">First Name *</Label>
            <Input
              className="form-control"
              name="user[technician_spouses_attributes][][first_name]"
              type="text"
              defaultValue=""
              required
            />
          </Colxx>

          <Colxx xs="6">
            <Label className="mt-4">Last Name *</Label>
            <Input
              className="form-control"
              name="user[technician_spouses_attributes][][last_name]"
              type="text"
              defaultValue=""
              required
            />
          </Colxx>
        </Row>

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">CNIC *</Label>
            <InputMask
              mask="99999-9999999-9"
              className="form-control"
              name="user[technician_spouses_attributes][][cnic]"
              defaultValue=""
              required
            />
            {/* <Input
              className="form-control"
              name="user[technician_spouses_attributes][][cnic]"
              type="text"
              defaultValue=""
              required
            /> */}
          </Colxx>

          <Colxx xs="6">
            <Label className="mt-4">Phone *</Label>
            <InputMask
              mask="+\92 999-9999999"
              className="form-control"
              name="user[technician_spouses_attributes][][phone]"
              defaultValue=""
              required
            />
            {/* <Input
              className="form-control"
              name="user[technician_spouses_attributes][][phone]"
              type="number"
              defaultValue=""
              required
            /> */}
          </Colxx>
        </Row>
      </>
    );

    return spouse_details;
  };

  render_gaurantor_details = () => {
    let gaurantor_details = <> </>;
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

    return gaurantor_details;
  };

  handleWorkingCities = (city_ids) => {
    this.setState({
      working_cities: city_ids,
    });
  };

  render_basic_form = () => {
    const genders = [
      { label: "Male", value: "Male", key: 0 },
      { label: "Female", value: "Female", key: 1 },
    ];

    const religions = [
      { label: "Islam", value: "Islam", key: 0 },
      { label: "Christian", value: "Christian", key: 1 },
      { label: "Sikh", value: "Sikh", key: 2 },
      { label: "Hindu", value: "Hindu", key: 3 },
      { label: "Juda", value: "Juda", key: 4 },
    ];

    const services = this.prepareServicesJson();
    const cities = this.prepare_cities_json();

    let basic_form = <> </>;

    basic_form = (
      <>
        <ModalHeader className="mt-4">New Technician</ModalHeader>

        <Row>
          <Colxx xs="12">
            <Label className="mt-4">Upload Image *</Label>
            <InputGroup className="mb-3">
              <CustomInput
                type="file"
                id="user[profile_picture]"
                name="user[profile_picture]"
                accept="image/*"
              />
            </InputGroup>
          </Colxx>
        </Row>

        <Row>
          <Colxx xs="12">
            <Label className="mt-4">Upload Documents</Label> <br />
            <input
              type="file"
              multiple
              name="user[documents_attributes][][file]"
            />
            <br />
          </Colxx>
        </Row>

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">First Name *</Label>
            <Input
              className="form-control"
              name="user[first_name]"
              type="text"
              defaultValue=""
              required
            />
          </Colxx>

          <Colxx xs="6">
            <Label className="mt-4">Last Name *</Label>
            <Input
              className="form-control"
              name="user[last_name]"
              type="text"
              defaultValue=""
              required
            />
          </Colxx>
        </Row>

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">Phone *</Label>
            <InputMask
              mask="+\92 999-9999999"
              className="form-control"
              name="user[phone]"
              defaultValue=""
              required
            />
            {/* <Input
              className="form-control"
              name="user[phone]"
              type="number"
              defaultValue=""
              required
            /> */}
          </Colxx>

          <Colxx xs="6">
            <Label className="mt-4">CNIC *</Label>
            {/* <Input
              className="form-control"
              name="user[cnic]"
              type="text"
              defaultValue=""
              required
            /> */}
            <InputMask
              mask="99999-9999999-9"
              className="form-control"
              name="user[cnic]"
              defaultValue=""
              required
            />
          </Colxx>
        </Row>

        <Input
          className="form-control"
          name="user[default_role]"
          type="text"
          defaultValue="Technician"
          hidden
        />
        <Input
          className="form-control"
          name="user[country_code]"
          type="text"
          defaultValue="+92"
          hidden
        />

        <Row>
          <Colxx xs="6">
            <Label className="mt-4">Gender *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[gender]"
              options={genders}
              defaultValue={genders[1]}
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
              name="user[religion]"
              options={religions}
              defaultValue={religions[0]}
            />
          </Colxx>
        </Row>

        {/* <Row>
          <Colxx xs="12">
            <Label className="mt-4">Select Services *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              isMulti
              name="user[technician_services_attributes][][service_id]"
              options={services}
            />
          </Colxx>
        </Row>

        <Row>
          <Colxx xs="12">
            <Label className="mt-4">Working Cities *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              isMulti
              name="user[city_ids][]"
              onChange={this.handleWorkingCities}
              options={cities}
            />
            <Label className="mt-4">Working Days *</Label>
          </Colxx>
        </Row> */}
      </>
    );

    return basic_form;
  };

  onChangeHandler = (e) => {
    const { checkedData } = this.state;
    let arr = this.state.Days;
    let id = e.target.id;
    if (e.target.checked) {
      let day_index = null;
      arr.map((item, index) => {
        if (item.id === id.split("-"[1])) {
          day_index = index;
        }
        return item;
      });
      let object = arr[day_index];
      this.setState({
        checkedData: [...checkedData, object],
      });
    } else {
      let removedArray = checkedData.filter((item) => item.id !== id);

      this.setState({
        checkedData: removedArray,
      });
    }
    return checkedData;
  };

  onStartTimeChange = (event) => {
    const { Days } = this.state;
    let day_id = parseInt(event.target.id.split("-")[1]);
    Days.map((single_day, index) => {
      if (single_day.id === day_id) {
        Days[index].start_time = event.target.value;
      }
      return single_day;
    });

    this.setState({
      Days,
    });
    return Days;
  };

  onEndTimeChange = (event) => {
    const { Days } = this.state;
    let day_id = parseInt(event.target.id.split("-")[1]);
    Days.map((single_day, index) => {
      if (single_day.id === day_id) {
        Days[index].end_time = event.target.value;
      }
      return single_day;
    });
    return Days;
  };

  // handleCheckChange = (event, value) => {
  //   let working_day_json = {};
  //   let working_day = value;
  //   let start_time = "";
  //   let end_time = "";
  //   let self = this;
  //   if (event.target.checked) {
  //     //   event.target.parentElement.nextElementSibling.value = value;
  //     start_time =
  //       event.target.parentElement.parentElement.nextElementSibling
  //         .lastElementChild.value;
  //     end_time =
  //       event.target.parentElement.parentElement.nextElementSibling
  //         .nextElementSibling.lastElementChild.value;
  //     working_day_json = {
  //       working_day: working_day,
  //       start_time: start_time,
  //       end_time: end_time,
  //     };
  //     self.setState({
  //       working_days_json: [...working_days_json, working_day_json],
  //     });
  //   }
  //   // } else {
  //   //   event.target.parentElement.nextElementSibling.value = "";
  //   // }
  // };

  render_working_days = () => {
    const { Days } = this.state;
    let self = this;
    let working_days_html = [];
    Days.map((single_day, index) => {
      working_days_html.push(
        <Row className="mb-5 mt-4">
          <Colxx xxs="2">
            <CustomInput
              id={single_day.id}
              label={single_day.working_day}
              className="ml-5 mt-5"
              type="checkbox"
              defaultChecked={false}
              onChange={self.onChangeHandler}
            />
          </Colxx>
          <Colxx xxs="5">
            <Label for="start_time">
              <IntlMessages id="pages.user-start-time" />
            </Label>
            <Input
              id={"start_time-" + single_day.id}
              type="time"
              name="start_time"
              defaultValue={single_day.start_time}
              onChange={(event) => self.onStartTimeChange(event)}
            />
          </Colxx>
          <Colxx xxs="5">
            <Label for="end_time">
              <IntlMessages id="pages.user-end-time" />
            </Label>
            <Input
              id={"end_time-" + single_day.id}
              type="time"
              name="end_time"
              defaultValue={single_day.end_time}
              onChange={(event) => self.onEndTimeChange(event)}
            />
          </Colxx>
        </Row>
      );
      return single_day;
    });
    return working_days_html;
  };

  render_new_user_form = () => {
    let new_user_form = <> </>;

    new_user_form = (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.createUser} autoComplete="off">
                {this.render_basic_form()}
                {/* {this.render_working_days()} */}
                {this.render_user_details()}
                {/* {this.render_gaurantor_details()} */}
                {/* {this.render_spouse_details()} */}
                {this.render_address_details()}
                {this.render_form_footer()}
              </form>
            </CardBody>
          </Card>
        </Colxx>
      </>
    );
    return new_user_form;
  };

  move_to_list = () => {
    return this.props.history.push("/app/technicians/list");
  };

  render_form_footer = () => {
    let form_footer = <> </>;

    form_footer = (
      <>
        <ModalFooter className="mt-4">
          <Row className="float-right">
            <Colxx xs="12">
              <Button color="primary" type="submit" className="mr-3">
                <IntlMessages id="pages.submit" />
              </Button>
              <Button
                color="secondary"
                outline
                type="button"
                onClick={this.move_to_list}
              >
                <IntlMessages id="pages.cancel" />
              </Button>
            </Colxx>
          </Row>
        </ModalFooter>
      </>
    );

    return form_footer;
  };

  render_address_details = () => {
    const cities = this.prepare_cities_json();
    const areas = this.prepare_areas_json();

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
              defaultValue=""
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
              defaultValue=""
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
              defaultValue=""
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
              defaultValue=""
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
              onChange={(city) => this.get_city_areas(city)}
              options={cities}
            />
          </Colxx>
          <Colxx xs="6">
            <Label className="mt-4">Area *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[addresses_attributes][][area_id]"
              options={areas}
            />
          </Colxx>
        </Row>
      </>
    );

    return address_details;
  };

  render() {
    return <>{this.render_new_user_form()}</>;
  }
}

export default NewUser;
