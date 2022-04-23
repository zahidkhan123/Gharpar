import React from "react";
import {
  Button,
  ModalHeader,
  ModalFooter,
  Input,
  Label,
  Card,
  CardBody,
  Row,
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Colxx } from "../../../components/common/CustomBootstrap";
import InputMask from "react-input-mask";
import { trackPromise } from "react-promise-tracker";

class NewClient extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cities: JSON.parse(localStorage.getItem("cities")),
      areas: [],
      is_accessible: false,
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
    };
  }

  async componentDidMount() {
    // await this.get_all_cities();
    // await this.check_permissions();
  }

  // check_permissions = async () => {
  //   let self = this;
  //   await axios
  //     .get(
  //       servicePath +
  //         "/api/v2/role_permissions/check_permission.json?controller_name=users&action_name=create",
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           "AUTH-TOKEN": localStorage.getItem("auth_token"),
  //         },
  //       }
  //     )
  //     .then((response) => {
  //       if (response.status === 200) {
  //         self.setState({
  //           is_accessible: response.data.is_enabled,
  //         });
  //       }
  //     });
  // };

  get_all_cities = async () => {
    let self = this;
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
        self.setState({
          cities: response.data,
        });
      });
  };

  get_city_areas = async (city) => {
    let self = this;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/areas.json?city_id=" + city.value,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            areas: response.data,
          });
        } else {
          console.log("error", response);
        }
      })
      .catch((error) => {
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

  create_user = async (event) => {
    event.preventDefault();
    let form_data = new FormData(this.removeMasking(event.target));
    console.log("Phone No: " + form_data.get("user[phone]"));

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/users.json",
        data: form_data,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "DEVICE-TYPE": "admin",
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Client create successfully",
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

  removeMasking = (formElem) => {
    let new_val = "";

    if (formElem.elements["user[phone]"].value) {
      if (
        formElem.elements["user[phone]"].value.split("+92 ")[1] !== undefined
      ) {
        new_val = formElem.elements["user[phone]"].value
          .split("+92")[1]
          .replace(/[^0-9]/g, "");
        formElem.elements["user[phone]"].value = new_val;
      }
    }

    if (formElem.elements["user[cnic]"].value) {
      new_val = formElem.elements["user[cnic]"].value.replace(/[^0-9]/g, "");
      formElem.elements["user[cnic]"].value = new_val;
    }

    return formElem;
  };

  render_new_client_form = () => {
    const { genders, age_range } = this.state;

    const cities = this.prepare_cities_json();
    const areas = this.prepare_areas_json();

    let client_form = "";
    client_form = (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.create_user} autoComplete="off">
                <ModalHeader>
                  <IntlMessages id="New Client" />{" "}
                </ModalHeader>
                <Row>
                  <Colxx xs="6">
                    <Label className="mt-4"> First Name * </Label>
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
                      options={age_range}
                    />
                  </Colxx>

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
                </Row>

                <Row>
                  <Colxx xs="6">
                    <Label className="mt-4">Email </Label>
                    <Input
                      className="form-control"
                      name="user[email]"
                      type="email"
                      defaultValue=""
                      autoComplete="off"
                    />
                  </Colxx>

                  <Colxx xs="6">
                    <Label className="mt-4">Password *</Label>
                    <Input
                      className="form-control"
                      name="user[password]"
                      type="password"
                      defaultValue=""
                      required
                    />
                  </Colxx>
                </Row>

                <ModalHeader>
                  <IntlMessages id="pages.user-addresses" />
                </ModalHeader>

                {/* <Row>
                  <Colxx xs="12">
                    <Label className="mt-4">Address *</Label>
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

                <Input
                  className="form-control"
                  name="user[addresses_attributes][][country_name]"
                  type="text"
                  defaultValue="+92"
                  hidden
                />

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

                <Row className="mb-4">
                  <Colxx xs="6">
                    <Label className="mt-4">City *</Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="user[addresses_attributes][][city_id]"
                      onChange={this.get_city_areas}
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

                <ModalFooter>
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
    let self = this;
    return <>{self.render_new_client_form()}</>;
  }
}

export default NewClient;
