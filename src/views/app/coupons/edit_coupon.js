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

class EditCoupon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coupon: {},
      service_cities_json: [],
      all_cities: [],
      all_cities_json: [],
      cities_data_rendered_info: [],
      services_data_rendered_info: [],
      all_addons: [],
      all_addons_dropdown_json: [],
      service_addons_dropdown_json: [],
      services_json: [],
      code: "",
      selected_discount: {},
      discount_types: [
        { label: "Percentage", value: "percentage" },
        { label: "Price", value: "price" },
      ],
    };
  }

  componentDidMount = async () => {
    let coupon = await this.get_coupon(this.props.match.params.id);

    let start_date = moment(coupon.start_datetime);
    let end_date = moment(coupon.end_datetime);
    let code = coupon.coupon_code;
    let selected_discount = coupon.discount_type;
    if (selected_discount === "percentage") {
      selected_discount = { label: "Percentage", value: "percentage" };
    } else {
      selected_discount = { label: "Price", value: "price" };
    }
    this.setState({
      code: code,
      selected_discount: selected_discount,
      coupon: coupon,
      startDateTime: start_date,
      endDateTime: end_date,
    });
  };

  get_coupon = async (coupon_id) => {
    let coupon = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/coupons/" + coupon_id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          coupon = response.data;
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

    return coupon;
  };

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
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

  update_coupon = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/v2/coupons/" +
          this.props.match.params.id +
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
            "Coupon updated successfully",
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

  generate_code = () => {
    let code = "GP" + Math.random().toString(36).substr(2, 6);
    this.setState({
      code: code,
    });
  };

  render_edit_coupon_form = () => {
    const { coupon, code, selected_discount } = this.state;
    let self = this;

    return (
      <>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <form onSubmit={this.update_coupon} autoComplete="off">
                <Row>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Title*" />{" "}
                    </Label>
                    {coupon.coupon_status === "Current" ? (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[coupon_title]"
                          type="text"
                          defaultValue={coupon.coupon_title}
                          // pattern="/^[a-z\d]{5,12}$/"
                          required
                          disabled
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[coupon_title]"
                          type="text"
                          defaultValue={coupon.coupon_title}
                          // pattern="/^[a-z\d]{5,12}$/"
                          required
                        />
                      </>
                    )}
                  </Colxx>
                  <Colxx md="4">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Code*" />{" "}
                    </Label>
                    {coupon.coupon_status === "Current" ? (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[coupon_code]"
                          type="text"
                          value={code}
                          // pattern="/^[a-z\d]{5,12}$/"
                          required
                          disabled
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[coupon_code]"
                          type="text"
                          defaultValue={code}
                          // pattern="/^[a-z\d]{5,12}$/"
                          required
                        />
                      </>
                    )}
                  </Colxx>
                  <Colxx md="2">
                    {coupon.coupon_status === "Current" ? (
                      <></>
                    ) : (
                      <>
                        <Button
                          color="primary"
                          className="mt-5"
                          onClick={self.generate_code}
                        >
                          Generate Code
                        </Button>
                      </>
                    )}
                  </Colxx>
                </Row>
                <Row className="p-3">
                  <Label className="mt-3">
                    {" "}
                    <IntlMessages id="Description" />{" "}
                  </Label>
                  {coupon.coupon_status === "Current" ? (
                    <>
                      <Input
                        className="form-control"
                        name="coupon[coupon_description]"
                        type="text"
                        defaultValue={coupon.coupon_description}
                        // pattern="/^[a-z\d]{5,12}$/"
                        required
                        disabled
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        className="form-control"
                        name="coupon[coupon_description]"
                        type="text"
                        defaultValue={coupon.coupon_description}
                        // pattern="/^[a-z\d]{5,12}$/"
                        required
                      />
                    </>
                  )}
                </Row>
                <Row>
                  <Colxx xxs="6" md="6" className="p-3">
                    <Label className="mt-2"> Start Date* </Label>
                    {coupon.coupon_status === "Current" ? (
                      <>
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
                          disabled
                        />
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
                    {coupon.coupon_status === "Current" ? (
                      <>
                        <Select
                          components={{ Input: CustomSelectInput }}
                          name="coupon[discount_type]"
                          className="react-select"
                          classNamePrefix="react-select"
                          defaultValue={selected_discount}
                          // onChange={self.handle_service_change}
                          options={[
                            { label: "Percentage", value: "percentage" },
                            { label: "Price", value: "price" },
                          ]}
                          required
                          isDisabled={true}
                        />
                      </>
                    ) : (
                      <>
                        <Select
                          components={{ Input: CustomSelectInput }}
                          name="coupon[discount_type]"
                          className="react-select"
                          classNamePrefix="react-select"
                          defaultValue={selected_discount}
                          // onChange={self.handle_service_change}
                          options={[
                            { label: "Percentage", value: "percentage" },
                            { label: "Price", value: "price" },
                          ]}
                          required
                        />
                      </>
                    )}
                  </Colxx>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Value*" />{" "}
                    </Label>
                    {coupon.coupon_status === "Current" ? (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[discount_value]"
                          type="number"
                          defaultValue={coupon.discount_value}
                          // pattern="/^[a-z\d]{5,12}$/"
                          required
                          disabled
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[discount_value]"
                          type="number"
                          defaultValue={coupon.discount_value}
                          // pattern="/^[a-z\d]{5,12}$/"
                          required
                          min={0}
                        />
                      </>
                    )}
                  </Colxx>
                </Row>
                <Row>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Minimum Spend" />{" "}
                    </Label>
                    {coupon.coupon_status === "Current" ? (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[min_spend]"
                          type="number"
                          defaultValue={coupon.min_spend}
                          // pattern="/^[a-z\d]{5,12}$/"
                          disabled
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[min_spend]"
                          type="number"
                          defaultValue={coupon.min_spend}
                          min={0}
                          // pattern="/^[a-z\d]{5,12}$/"
                        />
                      </>
                    )}
                  </Colxx>
                  <Colxx md="6">
                    <Label className="mt-3">
                      {" "}
                      <IntlMessages id="Maximum Spend" />{" "}
                    </Label>
                    {coupon.coupon_status === "Current" ? (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[max_spend]"
                          type="number"
                          defaultValue={coupon.max_spend}
                          // pattern="/^[a-z\d]{5,12}$/"
                          disabled
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          className="form-control"
                          name="coupon[max_spend]"
                          type="number"
                          min={0}
                          defaultValue={coupon.max_spend}
                          // pattern="/^[a-z\d]{5,12}$/"
                        />
                      </>
                    )}
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
                      defaultValue={coupon.usage_coupon_limit}
                      min={0}
                      // pattern="/^[a-z\d]{5,12}$/"
                      required
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
                      min={0}
                      defaultValue={coupon.usage_per_user_limit}
                      onChange={(event) => self.check_validation(event)}
                      // pattern="/^[a-z\d]{5,12}$/"
                      required
                    />
                  </Colxx>
                </Row>

                <Button color="primary" type="submit" className="mt-3">
                  <IntlMessages id="pages.submit" />
                </Button>
                <Button
                  color="secondary"
                  outline
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
    const { coupon } = this.state;
    if (Object.keys(coupon).length === 0) {
      return <></>;
    } else {
      return <>{this.render_edit_coupon_form()}</>;
    }
  }
}

export default EditCoupon;
