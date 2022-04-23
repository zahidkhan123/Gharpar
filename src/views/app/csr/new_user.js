import React from "react";
import {
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Card,
  CardBody,
} from "reactstrap";

import Select from "react-select";
import { Colxx } from "../../../components/common/CustomBootstrap";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import "react-datepicker/dist/react-datepicker.css";
import InputMask from "react-input-mask";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class NewUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cities: [],
      cities_json: [],
      areas: [],
      role: [
        // {label: "Super Admin", value: "super_admin"},
        { label: "Admin", value: "Admin" },
        { label: "CSR", value: "CSR" },
      ],
      gender: [
        // {label: "Super Admin", value: "super_admin"},
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
      ],
    };
  }

  componentDidMount = async () => {
    let cities = JSON.parse(localStorage.getItem("cities"));
    let cities_json = this.prepareCitiesJson(cities);

    this.setState({
      cities: cities,
      cities_json: cities_json,
    });
  };

  get_all_cities = async () => {
    let cities = [];

    await axios
      .get(servicePath + "/api/v2/cities.json", {
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
      .then((response) => {
        cities = response.data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      })
      .catch((error) => {
        NotificationManager.error(
          error?.response?.data?.message,
          "",
          5000,
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    return cities;
  };

  removeMasking = (formElem) => {
    let new_val = "";
    // Phone fields for complete form

    // For CSR Phone
    if (formElem.elements["user[phone]"].value) {
      if (
        formElem.elements["user[phone]"].value.split("+92 ")[1] !== undefined
      ) {
        new_val = formElem.elements["user[phone]"].value
          .split("+92")[1]
          ?.replace(/[^0-9]/g, "");
        formElem.elements["user[phone]"].value = new_val;
      }
    }

    // For CSR CNIC
    if (formElem.elements["user[cnic]"].value) {
      new_val = formElem.elements["user[cnic]"].value.replace(/[^0-9]/g, "");
      formElem.elements["user[cnic]"].value = new_val;
    }

    return formElem;
  };

  createUser = async (event) => {
    event.preventDefault();
    let form_data = new FormData(this.removeMasking(event.target));

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/csrs.json",
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
            "Created Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/csr/list");
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

  prepareCitiesJson = (cities) => {
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

  render() {
    const { role, cities_json, gender } = this.state;
    const areas = this.prepare_areas_json();
    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.createUser} autoComplete="off">
              <ModalHeader> Add New CSR </ModalHeader>

              <ModalBody>
                <Label className="mt-4">First Name *</Label>
                <Input
                  className="form-control"
                  name="user[first_name]"
                  type="text"
                  defaultValue=""
                  required
                />

                <Label className="mt-4">Last Name *</Label>
                <Input
                  className="form-control"
                  name="user[last_name]"
                  type="text"
                  defaultValue=""
                  required
                />

                <Input
                  className="form-control"
                  name="user[country_code]"
                  type="text"
                  defaultValue="+92"
                  hidden
                />

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

                <Label className="mt-4">Role *</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="user[default_role]"
                  defaultValue={role[0]}
                  options={role}
                  required
                />
                <Label className="mt-4">Gender *</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="user[gender]"
                  defaultValue={gender[0]}
                  options={gender}
                  required
                />

                <Label className="mt-4">CNIC *</Label>
                <InputMask
                  mask="99999-9999999-9"
                  className="form-control"
                  name="user[cnic]"
                  defaultValue=""
                  required
                />
                {/* <Input
                  className="form-control"
                  name="user[cnic]"
                  type="text"
                  defaultValue=""
                  required
                /> */}

                <Label className="mt-4">Email *</Label>
                <Input
                  className="form-control"
                  name="user[email]"
                  type="email"
                  defaultValue=""
                  required
                />

                <Label className="mt-4">Password *</Label>
                <Input
                  className="form-control"
                  name="user[password]"
                  type="password"
                  defaultValue=""
                  required
                />

                <Label className="mt-4">City *</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="user[addresses_attributes][][city_id]"
                  onChange={(city) => this.get_city_areas(city)}
                  options={cities_json}
                />
                <Label className="mt-4">Area *</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  name="user[addresses_attributes][][area_id]"
                  options={areas}
                />
                <Label className="mt-4"> Address *</Label>
                <Input
                  className="form-control"
                  name="user[addresses_attributes][][address_1]"
                  type="text"
                  defaultValue=""
                  required
                />

                {/* <Label className="mt-4">City *</Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="user[addresses_attributes][][city_id]"
                    defaultValue={cities_json[0]}
                    options={cities_json}
                  /> */}
              </ModalBody>

              <ModalFooter>
                <Button
                  color="secondary"
                  outline
                  type="button"
                  onClick={this.props.history.goBack}
                >
                  <IntlMessages id="pages.cancel" />
                </Button>
                <Button color="primary" type="submit">
                  <IntlMessages id="pages.submit" />
                </Button>
              </ModalFooter>
            </form>
          </CardBody>
        </Card>
      </Colxx>
    );
  }
}

export default NewUser;
