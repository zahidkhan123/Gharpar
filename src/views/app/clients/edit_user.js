import React from "react";
import {
  Card,
  Button,
  CardBody,
  ModalHeader,
  ModalFooter,
  Input,
  Row,
  Label,
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import InputMask from "react-input-mask";
import { trackPromise } from "react-promise-tracker";

class EditClient extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userObj: {},
      cities: [],
      all_cities_json: [],
      areas: [],
      city_areas_json: [],
      genders: [
        { label: "Male", value: "Male", key: 0 },
        { label: "Female", value: "Female", key: 1 },
      ],
      age_range: [
        { label: "Below 18", value: "Below 18", key: 0 },
        { label: "18 - 24", value: "18 - 24", key: 1 },
        { label: "25 - 34", value: "25 - 34", key: 2 },
        { label: "35 - 44", value: "35 - 44", key: 3 },
        { label: "45 - 60", value: "45 - 60", key: 4 },
        { label: "60+", value: "60+", key: 5 },
      ],
      default_selected_city_json: {},
      default_selected_area_json: {},
    };

    this.render_address_details = this.render_address_details.bind(this);
    this.get_selected_city_json = this.get_selected_city_json.bind(this);
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
    let default_selected_area_json = this.get_selected_area_json(
      userObj,
      previously_selected_city_areas_json
    );

    this.setState({
      userObj: userObj,
      cities: all_cities,
      all_cities_json: all_cities_json,
      areas: previously_selected_city_areas,
      city_areas_json: previously_selected_city_areas_json,
      default_selected_city_json: previously_selected_city_json,
      default_selected_area_json: default_selected_area_json,
    });
  }

  get_selected_area_json = (userObj, areas) => {
    let selected_area = {};

    if (userObj.addresses !== undefined && userObj.addresses.length > 0) {
      selected_area = userObj.addresses[0].area_id;
    }

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
          "Content-Type": "multipart/form-data",
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

    await axios
      .get(servicePath + "/api/v2/areas.json?city_id=" + city.value, {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
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
          "IS-ACCESSIBLE": true,
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

  removeMasking = (formElem) => {
    let new_val = "";

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

    if (formElem.elements["user[cnic]"].value) {
      new_val = formElem.elements["user[cnic]"].value.replace(/[^0-9]/g, "");
      formElem.elements["user[cnic]"].value = new_val;
    }

    // For Client Password
    // if (formElem.elements["user[password]"].value === "") {
    //   formElem.elements["user[password]"].name = "";
    // }

    return formElem;
  };

  update_user = async (event) => {
    event.preventDefault();
    let formData = new FormData(this.removeMasking(event.target));

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/users/" + this.state.userObj.id + ".json",
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
            "Client updated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/clients/list");
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
    let userObj = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/users/" + user_id + ".json",
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
    let selected_city = {};
    let selected_city_json = {};

    if (userObj.addresses !== undefined && userObj.addresses.length > 0) {
      selected_city = userObj.addresses[0].city_id;
    }

    cities.forEach(function (current_city, index) {
      if (current_city.id === selected_city) {
        selected_city_json = {
          label: current_city.city_name,
          value: current_city.id,
          key: current_city.id,
        };
      }
    });

    return selected_city_json;
  };

  render_address_details = () => {
    const {
      userObj,
      all_cities_json,
      default_selected_city_json,
      city_areas_json,
      default_selected_area_json,
    } = this.state;

    let address_html = <> </>;
    let address = {};

    if (userObj.addresses.length > 0) {
      address = userObj.addresses[0];
    }

    address_html = (
      <>
        <ModalHeader className="mt-4">
          {" "}
          <IntlMessages id="pages.user-addresses" />{" "}
        </ModalHeader>

        {/* <Row>
        <Colxx  xs="12">
          <Label className="mt-4"> <IntlMessages id="Address*" /> </Label>
          <Input className="form-control" name="user[addresses_attributes][][address_title]" type="text" defaultValue={Object.keys(address).length > 0 ? address.address_title : ""} required/>
        </Colxx>
      </Row> */}

        <Row>
          <Colxx xs="12">
            <Label className="mt-4">
              {" "}
              <IntlMessages id="pages.address-1" />{" "}
            </Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][address_1]"
              type="text"
              defaultValue={
                Object.keys(address).length > 0 ? address.address_1 : ""
              }
            />
          </Colxx>

          {/* <Colxx xs="6">
            <Label className="mt-4">
              {" "}
              <IntlMessages id="pages.address-2" />{" "}
            </Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][address_2]"
              type="text"
              defaultValue={
                Object.keys(address).length > 0 ? address.address_2 : ""
              }
            />
          </Colxx> */}
        </Row>

        <Input
          className="form-control"
          name="user[addresses_attributes][][country_name]"
          type="text"
          defaultValue="+92"
          hidden
        />

        {/* <Row>
          <Colxx xs="6">
            <Label className="mt-4">
              {" "}
              <IntlMessages id="pages.zip-code" />{" "}
            </Label>
            <Input
              className="form-control"
              name="user[addresses_attributes][][zip_code]"
              type="text"
              defaultValue={
                Object.keys(address).length > 0 ? address.zip_code : ""
              }
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
              defaultValue={
                Object.keys(address).length > 0 ? address.landmark : ""
              }
            />
          </Colxx>
        </Row> */}

        <Row className="mb-4">
          <Colxx xs="6">
            <Label className="mt-4">City *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[addresses_attributes][][city_id]"
              onChange={async (city) => this.update_city_areas_dropdown(city)}
              options={all_cities_json}
              defaultValue={default_selected_city_json || ""}
            />
          </Colxx>

          <Colxx xs="6">
            <Label className="mt-4">Area *</Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="user[addresses_attributes][][area_id]"
              options={city_areas_json}
              onChange={(area) => this.handle_area_change(area)}
              value={default_selected_area_json || ""}
            />
          </Colxx>
        </Row>

        {Object.keys(address).length > 0 ? (
          <Input
            type="text"
            hidden
            name="user[addresses_attributes][][id]"
            defaultValue={address.id}
          />
        ) : (
          ""
        )}
      </>
    );

    return address_html;
  };

  handle_area_change = (area) => {
    this.setState({
      default_selected_area_json: area,
    });
  };

  render_edit_form_client = () => {
    const { genders, age_range, userObj } = this.state;

    let client_form = "";
    client_form = (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.update_user} autoComplete="off">
                <ModalHeader>Edit Client</ModalHeader>
                <Row>
                  <Colxx xs="6">
                    <Label className="mt-4">First Name *</Label>
                    <Input
                      className="form-control"
                      name="user[first_name]"
                      type="text"
                      defaultValue={userObj.first_name}
                      required
                    />
                  </Colxx>
                  <Colxx xs="6">
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

                {
                  <Input
                    className="form-control"
                    name="user[country_code]"
                    type="text"
                    defaultValue="+92"
                    hidden
                  />
                }
                {
                  <Input
                    className="form-control"
                    name="user[default_role]"
                    type="text"
                    defaultValue="Client"
                    hidden
                  />
                }

                <Row>
                  <Colxx xs="6">
                    <Label className="mt-4">Phone *</Label>
                    <InputMask
                      mask="+\92 399-9999999"
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
                  </Colxx>

                  <Colxx xs="6">
                    <Label className="mt-4">CNIC</Label>
                    <InputMask
                      mask="99999-9999999-9"
                      className="form-control"
                      name="user[cnic]"
                      defaultValue={userObj.cnic}
                    />
                    {/* <Input
                      className="form-control"
                      name="user[cnic]"
                      type="text"
                      defaultValue={userObj.cnic}
                      required
                    /> */}
                  </Colxx>
                </Row>

                <Row>
                  <Colxx xs="6">
                    <Label className="mt-4">Age Range</Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="user[age_range]"
                      defaultValue={
                        age_range.filter(
                          (obj) => obj.value === userObj.age_range
                        )[0]
                      }
                      options={age_range}
                      required
                    />
                  </Colxx>

                  <Colxx xs="6">
                    <Label className="mt-4">Gender *</Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="user[gender]"
                      defaultValue={
                        genders.filter(
                          (gender) => gender.value === userObj.gender
                        )[0]
                      }
                      options={genders}
                      required
                    />
                  </Colxx>
                </Row>

                <Row>
                  {/* <Colxx xs="6">
                  <Label className="mt-4"> <IntlMessages id="Email" /> </Label>
                  <Input className="form-control" name="user[email]" type="email" defaultValue={userObj.email} readOnly />
                </Colxx> */}

                  {/* <Colxx xs="12">
                    <Label className="mt-4">
                      {" "}
                      <IntlMessages id="Password" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="user[password]"
                      type="password"
                      defaultValue=""
                      autoComplete="off"
                    />
                  </Colxx> */}
                  {/* <Colxx xs="6">
                    <Label className="mt-4">
                      {" "}
                      <IntlMessages id="Retype Password" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      type="password"
                      defaultValue=""
                    />
                  </Colxx> */}
                </Row>

                {this.render_address_details()}

                <ModalFooter className="mt-4">
                  <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={this.move_to_listing}
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
      </>
    );

    return client_form;
  };

  move_to_listing = () => {
    this.props.history.push("/app/clients/list");
  };

  render() {
    const userObj = this.state.userObj;

    if (Object.keys(userObj).length === 0) {
      return <> </>;
    } else {
      return <> {this.render_edit_form_client()} </>;
    }
  }
}

export default EditClient;
