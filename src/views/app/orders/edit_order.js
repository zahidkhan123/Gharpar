import React, { Component } from "react";
import {
  Card,
  Button,
  Input,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  CardBody,
} from "reactstrap";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import axios from "axios";
import moment from "moment";
import { trackPromise } from "react-promise-tracker";

class EditOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order_data: {},
      order: {},
      technicians_json: {},
      order_service_to_delete: "",
      startDateRange: null,
      order_time: null,
      deleteConfirmationModal: false,
      edit_reason: [
        {
          label: "Due to unavailability of desired beauticians",
          value: "Due to unavailability of desired beauticians",
        },
        {
          label: "Unavailability of beautician on desired timings",
          value: "Unavailability of beautician on desired timings",
        },
        { label: "By Client", value: "By Client" },
        {
          label: "Due to emergency of client",
          value: "Due to emergency of client",
        },
        { label: "Area  blockage Issue", value: "Area  blockage Issue" },
        {
          label: "Beautician Declining/Not Responding/ Due to beautician",
          value: "Beautician Declining/Not Responding/ Due to beautician",
        },
        { label: "Due to system issue", value: "Due to system issue" },
        { label: "Out of town", value: "Out of town" },
      ],
    };
  }

  async componentDidMount() {
    let order = await this.fetch_order();

    let order_date = order.order_date;
    let order_city = order.address.city;
    let order_area = order.address.area;

    let all_areas = await this.fetch_all_areas(order_city.id);
    let area_dropdown_json = this.area_dropdown_json(all_areas);

    if (order_date === null) {
      order_date = moment(order.order_date?.split("T")[0], "YYYY/MM/DD");
    } else {
      order_date = moment(order.order_date?.split("T")[0], "YYYY/MM/DD");
    }

    this.setState({
      order: order,
      startDateRange: order_date,
      order_city: order_city,
      order_area: order_area,
      areas_dropdown: area_dropdown_json,
    });
  }

  fetch_all_areas = async (city_id) => {
    let areas = [];
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/areas.json?city_id=" + city_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
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

    return areas;
  };

  area_dropdown_json = (all_areas) => {
    let areas_dropdown_data = [];
    if (all_areas !== undefined && all_areas.length) {
      all_areas.forEach(function (currentValue) {
        areas_dropdown_data.push({
          label: currentValue.area,
          value: currentValue.id,
          key: currentValue.id,
        });
      });
    }
    return areas_dropdown_data;
  };

  fetch_order = async () => {
    let order = {};
    const { match } = this.props;

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/orders/" +
          match.params.id +
          "/edit.json?default_role=admin",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          order = response.data;
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

    return order;
  };

  orderUpdate = async (event) => {
    event.preventDefault();

    const { match } = this.props;
    // let order_date = event.target.elements["order[order_date]"].value;
    let order_date = event.target.elements["order[order_date]"].value;
    event.target.elements["order[order_date]"].value = moment(
      order_date
    ).format("YYYY-MM-DD");
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url:
          servicePath +
          "/api/v2/orders/" +
          match.params.id +
          "/order_datetime_update.json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          // self.setState({
          //   order: response.data,
          // });

          NotificationManager.success(
            "Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          this.props.history.push("/app/orders/show/" + response.data.id);
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

  handleChangeStart = (date) => {
    this.setState({
      startDateRange: date,
    });
  };
  handleOrderTime = (time) => {
    this.setState({
      order_time: time.target.value,
    });
  };

  render() {
    const { order, startDateRange, edit_reason } = this.state;

    if (Object.keys(order).length === 0) {
      return <> </>;
    } else {
      return (
        <>
          <Colxx xxs="12" lg="6" className="m-auto">
            <Card>
              <CardBody>
                <form onSubmit={this.orderUpdate}>
                  <ModalHeader>Edit Order</ModalHeader>

                  <ModalBody>
                    <Label className="mt-4">Order Date *</Label>
                    <DatePicker
                      selected={startDateRange}
                      onChange={this.handleChangeStart}
                      name="order[order_date]"
                      minDate={moment().toDate()}
                      required
                    />

                    <Label className="mt-4">Order Time *</Label>
                    <Input
                      className="form-control"
                      name="order[order_time]"
                      type="time"
                      onChange={this.handleOrderTime}
                      defaultValue={order.order_time}
                      required
                    />
                    <Label className="mt-4">Select Reason</Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="order[order_edit_reason]"
                      options={edit_reason}
                      defaultValue={[
                        {
                          label: "Due to unavailability of desired beauticians",
                          value: "Due to unavailability of desired beauticians",
                        },
                      ]}
                    />
                    {/* <Label className="mt-4">Address</Label>
                    <Input
                      className="form-control"
                      type="text"
                      name="address[address_1]"
                      defaultValue={order.address.address_1}
                    />
                    <Label className="mt-4">Area</Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      name="address[area_id]"
                      className="react-select"
                      classNamePrefix="react-select"
                      defaultValue={[
                        { label: order_area.area, value: order_area.id },
                      ]}
                      // onChange={self.handle_service_change}
                      options={areas_dropdown}
                      required
                    />
                    <Label className="mt-4">City</Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      name="address[city_id]"
                      className="react-select"
                      classNamePrefix="react-select"
                      defaultValue={[
                        { label: order_city.city_name, value: order_city.id },
                      ]}
                      // onChange={self.handle_service_change}
                      // options={areas_dropdown}
                      required
                      isDisabled={true}
                    /> */}
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      color="secondary"
                      outline
                      type="button"
                      onClick={this.props.history.goBack}
                    >
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Update
                    </Button>
                  </ModalFooter>
                </form>
              </CardBody>
            </Card>
          </Colxx>
        </>
      );
    }
  }
}

export default React.memo(EditOrder);
