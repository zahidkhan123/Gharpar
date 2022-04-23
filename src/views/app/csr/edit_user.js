import React from "react";
import {
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Card,
  CardBody,
  Label,
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import InputMask from "react-input-mask";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class EditUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      role: [
        // { label: "Super Admin", value: "Super_admin" },
        { label: "Admin", value: "Admin" },
        { label: "CSR", value: "CSR" },
      ],
      gender: [
        // { label: "Super Admin", value: "Super_admin" },
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
      ],
      userObj: {},
      cities: [],
      all_cities_json: [],
      areas: [],
      city_areas_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
    };

    this.update_user = this.update_user.bind(this);
    this.get_all_cities = this.get_all_cities.bind(this);
    this.get_user = this.get_user.bind(this);
    this.get_city_areas = this.get_city_areas.bind(this);
    this.get_selected_area_json = this.get_selected_area_json.bind(this);
    this.get_selected_city_json = this.get_selected_city_json.bind(this);
    this.prepare_cities_json = this.prepare_cities_json.bind(this);
    this.update_city_areas_dropdown = this.update_city_areas_dropdown.bind(
      this
    );
  }

  async componentDidMount() {
    const { match } = this.props;
    let userObj = await this.get_user(match.params.id);
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let all_cities_json = this.prepare_cities_json(all_cities);
    let previously_selected_city_json = this.get_selected_city_json(
      userObj,
      all_cities
    );
    let previously_selected_city_areas = await this.get_city_areas(
      previously_selected_city_json
    );
    let previously_selected_city_areas_json = this.prepare_areas_json(
      previously_selected_city_areas
    );
    // let default_selected_area_json = this.get_selected_area_json(
    //   userObj,
    //   previously_selected_city_areas_json
    // );

    this.setState({
      userObj: userObj,
      cities: all_cities,
      all_cities_json: all_cities_json,
      default_selected_city_json: previously_selected_city_json,
      areas: previously_selected_city_areas,
      city_areas_json: previously_selected_city_areas_json,
      // default_selected_area_json: default_selected_area_json,
    });
  }

  get_selected_area_json = (userObj, areas) => {
    let selected_area = userObj.addresses[0].area_id;

    areas.forEach(function (current_area, index) {
      if (current_area.value === selected_area) {
        selected_area = {
          label: current_area.label,
          value: current_area.value,
          key: current_area.key,
        };
      }
    });

    return selected_area;
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
        response.data = response.data.sort(
          (a, b) => parseInt(a.id) - parseInt(b.id)
        );
        cities = response.data;
      });

    return cities;
  };

  update_city_areas_dropdown = async (city) => {
    let self = this;
    let city_areas = [];
    let city_areas_json = [];

    await trackPromise(
      axios.get(servicePath + "/api/v2/areas.json?city_id=" + city.value, {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          city_areas = response.data;
          city_areas_json = self.prepare_areas_json(city_areas);

          self.setState({
            areas: city_areas,
            city_areas_json: city_areas_json,
            default_selected_area_json: city_areas_json[0],
          });
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  get_city_areas = async (city) => {
    let city_areas = [];

    await trackPromise(
      axios.get(servicePath + "/api/v2/areas.json?city_id=" + city.value, {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          city_areas = response.data;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
    return city_areas;
  };

  update_user = async (event) => {
    event.preventDefault();
    let formData = new FormData(this.removeMasking(event.target));

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/csrs/" + this.state.userObj.id + ".json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "CSR Updated Successfully",
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

  get_user = async (user_id) => {
    let userObj = null;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/csrs/" + user_id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          userObj = response.data;
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
    return userObj;
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

  prepare_cities_json = (cities) => {
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

  get_selected_city_json = (userObj, cities) => {
    let selected_city_json = {};

    if (userObj.addresses !== undefined && userObj.addresses.length) {
      let selected_city = userObj.addresses[0].city_id;

      cities.forEach(function (current_city, index) {
        if (current_city.id === selected_city) {
          selected_city_json = {
            label: current_city.city_name,
            value: current_city.id,
            key: current_city.id,
          };
          return 0;
        }
      });
    }
    return selected_city_json;
  };

  handle_area_change = (area) => {
    this.setState({
      default_selected_area_json: area,
    });
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

  render() {
    const { userObj, role, gender, city_areas_json } = this.state;

    if (Object.keys(userObj).length === 0) {
      return <></>;
    } else {
      const {
        userObj,
        all_cities_json,
        default_selected_city_json,
      } = this.state;

      return (
        <Colxx xxs="12" lg="6" className="m-auto">
          <Card>
            <CardBody>
              <form onSubmit={this.update_user}>
                <ModalHeader>Edit CSR</ModalHeader>

                <ModalBody>
                  <Label className="mt-4">First Name *</Label>
                  <Input
                    className="form-control"
                    name="user[first_name]"
                    type="text"
                    defaultValue={userObj.first_name}
                    required
                  />

                  <Label className="mt-4">Last Name *</Label>
                  <Input
                    className="form-control"
                    name="user[last_name]"
                    type="text"
                    defaultValue={userObj.last_name}
                    required
                  />

                  <Label className="mt-4">Email *</Label>
                  <Input
                    className="form-control"
                    name="user[email]"
                    type="text"
                    defaultValue={userObj.email}
                    disabled
                  />

                  <Label className="mt-4">Password *</Label>
                  <Input
                    className="form-control"
                    name="user[password]"
                    type="password"
                    defaultValue=""
                  />

                  <Label className="mt-4"> Role * </Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="user[default_role]"
                    options={role}
                    defaultValue={{
                      label: userObj.default_role,
                      value: userObj.default_role,
                    }}
                  />

                  <Label className="mt-4"> Gender * </Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="user[gender]"
                    options={gender}
                    defaultValue={{
                      label: userObj.gender,
                      value: userObj.gender,
                    }}
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
                    defaultValue={userObj.phone}
                    required
                  />
                  {/* <Input
                    className="form-control"
                    name="user[phone]"
                    type="number"
                    defaultValue={userObj.phone}
                    required
                  /> */}

                  <Label className="mt-4">CNIC *</Label>
                  <InputMask
                    mask="99999-9999999-9"
                    className="form-control"
                    name="user[cnic]"
                    defaultValue={userObj.cnic}
                    required
                  />
                  {/* <Input
                    className="form-control"
                    name="user[cnic]"
                    type="text"
                    defaultValue={userObj.cnic}
                    required
                  /> */}

                  <Label className="mt-4">City *</Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="user[addresses_attributes][][city_id]"
                    onChange={async (city) =>
                      this.update_city_areas_dropdown(city)
                    }
                    options={all_cities_json}
                    defaultValue={default_selected_city_json}
                  />
                  <Label className="mt-4">Area *</Label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    name="user[addresses_attributes][][area_id]"
                    defaultValue={[
                      {
                        label:
                          userObj.addresses[userObj.addresses["length"] - 1]
                            .area_name,
                        value:
                          userObj.addresses[userObj.addresses["length"] - 1]
                            .area_id,
                      },
                    ]}
                    options={city_areas_json}
                  />
                  <Label className="mt-4"> Address *</Label>
                  <Input
                    className="form-control"
                    name="user[addresses_attributes][][address_1]"
                    type="text"
                    required
                    defaultValue={
                      userObj.addresses[userObj.addresses["length"] - 1]
                        .address_1
                    }
                  />
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
}

export default EditUser;
