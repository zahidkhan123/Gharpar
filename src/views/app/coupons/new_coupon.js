import React from "react";
import { Card, CardBody, Button, Row, Input, Label } from "reactstrap";

import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/coupons.json";

class NewCoupon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
      services_data_rendered_info: [],
      services_data_info: [
        {
          city_id: 27,
          services: [
            {
              id: 99,
              service_title: "",
              price: 100,
            },
          ],
        },
      ],
      addons: [],
      is_global: false,
      addons_dropdown_json: [],
      city_services: [],
      city_services_dropdown: [],
      servicePrice: "",
      code: "",
      discount_types: [
        { label: "Percentage", value: "percentage" },
        { label: "Price", value: "price" },
      ],
      services: [{ cityId: "", current_service_length: 1 }],
      current_service_length: 1,
    };
  }

  componentDidMount = async () => {};

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  handleCheckGlobal = (event) => {
    let self = this;
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
      self.setState({
        is_global: true,
      });
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
      self.setState({
        is_global: false,
      });
    }
  };

  handleChangeDateTime = (date) => {
    this.setState({
      startDateTime: date,
    });
  };

  handleChangeEndDateTime = (date) => {
    this.setState({
      endDateTime: date,
    });
  };
  create_coupon = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
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
            "Coupon created successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/coupons/list");
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

  generate_code = () => {
    let code = "GP" + Math.random().toString(36).substr(2, 6);
    this.setState({
      code: code,
    });
  };

  check_validation = (event) => {
    if (
      event.target.parentElement.previousElementSibling.lastElementChild.value >
        0 &&
      event.target.parentElement.previousElementSibling.lastElementChild.value %
        event.target.value ===
        0
    ) {
    } else {
      NotificationManager.error(
        "Usage limit combination is not correct",
        "",
        3000,
        null,
        null,
        "filled"
      );
    }
  };

  render_new_coupon_form = () => {
    let self = this;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.create_coupon} autoComplete="off">
                <Row>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Title*" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="coupon[coupon_title]"
                      type="text"
                      defaultValue=""
                      // pattern="/^[a-z\d]{5,12}$/"
                      required
                    />
                  </Colxx>
                  <Colxx md="4">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Code*" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="coupon[coupon_code]"
                      type="text"
                      defaultValue={this.state.code}
                      // pattern="/^[a-z\d]{5,12}$/"
                      required
                    />
                  </Colxx>
                  <Colxx md="2">
                    <Button
                      color="primary"
                      className="mt-5"
                      onClick={self.generate_code}
                    >
                      Generate Code
                    </Button>
                  </Colxx>
                </Row>
                <Row className="p-3">
                  <Label className="mt-3">
                    {" "}
                    <IntlMessages id="Description" />{" "}
                  </Label>
                  <Input
                    className="form-control"
                    name="coupon[coupon_description]"
                    type="text"
                    defaultValue=""
                    // pattern="/^[a-z\d]{5,12}$/"
                    required
                  />
                </Row>
                <Row>
                  <Colxx xxs="6" md="6" className="p-3">
                    <Label className="mt-2"> Start Date* </Label>
                    <DatePicker
                      selected={self.state.startDateTime}
                      onChange={(event) => self.handleChangeDateTime(event)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      dateFormat="LLL"
                      timeCaption="Time"
                      minDate={moment().toDate()}
                      required
                      name="coupon[start_datetime]"
                    />
                  </Colxx>
                  <Colxx xxs="6" md="6" className="p-3">
                    <Label className="mt-2"> End Date* </Label>
                    <DatePicker
                      selected={
                        self.state.endDateTime || self.state.endDateTime
                      }
                      onChange={self.handleChangeEndDateTime}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      dateFormat="LLL"
                      timeCaption="Time"
                      minDate={moment().toDate()}
                      required
                      name="coupon[end_datetime]"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Discount Type*" />{" "}
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      name="coupon[discount_type]"
                      className="react-select"
                      classNamePrefix="react-select"
                      defaultValue={[
                        { label: "Percentage", value: "percentage" },
                      ]}
                      // onChange={self.handle_service_change}
                      options={[
                        { label: "Percentage", value: "percentage" },
                        { label: "Price", value: "price" },
                      ]}
                      required
                    />
                  </Colxx>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Value*" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="coupon[discount_value]"
                      type="number"
                      defaultValue=""
                      // pattern="/^[a-z\d]{5,12}$/"
                      required
                      min={0}
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Minimum Spend" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="coupon[min_spend]"
                      type="number"
                      defaultValue=""
                      min={0}
                      // pattern="/^[a-z\d]{5,12}$/"
                    />
                  </Colxx>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Maximum Spend" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="coupon[max_spend]"
                      type="number"
                      defaultValue=""
                      min={0}
                      // pattern="/^[a-z\d]{5,12}$/"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="No. of orders limit*" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="coupon[usage_coupon_limit]"
                      type="number"
                      defaultValue=""
                      // pattern="/^[a-z\d]{5,12}$/"
                      required
                      min={0}
                    />
                  </Colxx>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Times a user redeem*" />{" "}
                    </Label>
                    <Input
                      className="form-control"
                      name="coupon[usage_per_user_limit]"
                      type="number"
                      defaultValue=""
                      onChange={(event) => self.check_validation(event)}
                      // pattern="/^[a-z\d]{5,12}$/"
                      required
                      min={0}
                    />
                  </Colxx>
                </Row>

                <Button color="primary" type="submit" className="mt-3">
                  <IntlMessages id="pages.submit" />
                </Button>
              </form>
            </CardBody>
          </Card>
        </Colxx>
      </>
    );
  };

  render() {
    return <>{this.render_new_coupon_form()}</>;
  }
}

export default NewCoupon;
