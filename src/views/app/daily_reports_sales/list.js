import React, { Component } from "react";

import { Row, Card, Table, CardBody, Label, Button, Input } from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { Popover } from "element-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import CustomSelectInput from "../../../components/common/CustomSelectInput";

import Select from "react-select";
import { Link } from "react-router-dom";
import { trackPromise } from "react-promise-tracker";
import { Tabs, DateRangePicker } from "element-react";
import moment from "moment";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import "./custom.css";

const apiUrl = servicePath + "/api/v2/reports/daily_sales_report.json";

// let csr_report_city = sessionStorage.getItem("csr_report_city");
// if (csr_report_city === null) {
//   csr_report_city = [];
// } else {
//   csr_report_city = JSON.parse(csr_report_city);
// }

let date = new Date();
date.setDate(date.getDate() - 1);

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      displayMode: "list",

      selectedPageSize: 10,

      selectedOrderOption: { column: "title", label: "Product Name" },
      dropdownSplitOpen: false,
      modalOpen: false,
      currentPage: 1,
      totalItemCount: 0,
      totalPage: 1,
      search: "",
      selectedItems: [],
      lastChecked: null,
      isLoading: false,
      newCityName: "",

      userAction: "new",
      cityToEdit: "",

      deleteConfirmationModal: false,
      cityToDelete: "",

      areaAction: "areaModalOpen",
      areaModalOpen: false,
      targetCity: "",
      city_id: "",
      activePage: 1,
      currentFilter: "",
      areas_dropdown: [],
      default_filter: "",
      area_id: "",
      value2: [date, date],
    };
  }

  componentDidMount = async () => {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    let cancel_reasons = await this.get_all_cancel_reasons();
    this.setState({
      all_cities: all_cities,
      cancel_reasons: cancel_reasons,
      all_cities_json: cities_dropdown_data,
    });
    this.dataListRender();
  };

  get_all_cancel_reasons = async () => {
    let cancel_reasons = [];
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/cancel_reasons.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    ).then((response) => {
      if (response.status === 200) {
        cancel_reasons = response.data.cancel_reasons;
      } else {
        NotificationManager.error(
          "Reason not found",
          "",
          3000,
          null,
          null,
          "filled"
        );
      }
    });
    return cancel_reasons;
  };

  get_all_areas = async (city_id) => {
    let areas = [];
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/areas.json?city_id=" + parseInt(city_id),
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    ).then((response) => {
      if (response.status === 200) {
        areas = response.data;
      } else {
        NotificationManager.error(
          "Area not found",
          "",
          3000,
          null,
          null,
          "filled"
        );
      }
    });
    return areas;
  };

  areas_dropdown_json = (all_areas) => {
    let areas_dropdown_data = [];

    all_areas.forEach(function (currentValue) {
      areas_dropdown_data.push({
        label: currentValue.area,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return areas_dropdown_data;
  };

  cities_dropdown_json = (all_cities) => {
    let cities_dropdown_data = [];

    all_cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return cities_dropdown_data;
  };

  dataListRender() {
    const { city_id, value2 } = this.state;
    let self = this;
    let url = servicePath + "/api/v2/reports/daily_sales_report.json";
    if (value2 !== undefined && value2 !== null) {
      url += "?date_range=" + value2;
    }

    if (city_id.value !== undefined && city_id !== "") {
      url += "&city_id=" + city_id.value;
    }

    // if (
    //   city_id.value === "" ||
    //   city_id.value === undefined ||
    //   value2 === undefined ||
    //   value2 === null ||
    //   value2 === ""
    // ) {
    if (value2 === undefined || value2 === null || value2 === "") {
      NotificationManager.error(
        "Please Select Date",
        "",
        3000,
        null,
        null,
        "filled"
      );
    } else {
      trackPromise(
        axios({
          method: "get",
          url: url,
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
            "IS-ACCESSIBLE": true,
          },
        })
      ).then((response) => {
        if (response.status === 200) {
          self.setState({
            selectedItems: response.data,
          });
        } else {
          NotificationManager.error(
            "Record not found",
            "",
            3000,
            null,
            null,
            "filled"
          );
          // this.props.history.push("/app/cities/list");
        }
      });
    }
  }

  handleChangeDate = (date) => {
    this.setState({
      order_date: date,
    });
    sessionStorage.setItem("csr_report_date", date);
  };

  set_client_cities_dropdown = async (city) => {
    this.setState({
      city_id: city,
    });
  };

  clear_form = async (event) => {
    this.state.city_id = "";
    this.state.default_filter = "";
    this.state.value2 = [date, date];
    await this.dataListRender();
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    await this.dataListRender();
  };

  settings_heading = () => {
    const { value2, selectedItems, city_id, all_cities_json } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx md="4">
            <div className="mt-3">
              <h1>Daily Sales Report</h1>
            </div>
          </Colxx>
          <Colxx md="8">
            <form onSubmit={this.handleSubmit}>
              <Row>
                <Colxx sm="5">
                  <Label> Date </Label>
                  <div className="source">
                    <div className="block">
                      <DateRangePicker
                        value={value2}
                        placeholder="Pick a range"
                        align="right"
                        name="from_date"
                        ref={(e) => (this.daterangepicker2 = e)}
                        onChange={(date) => {
                          console.debug("DateRangePicker2 changed: ", date);
                          this.setState({
                            value2: date,
                          });
                        }}
                        shortcuts={[
                          {
                            text: "Last week",
                            onClick: () => {
                              const end = new Date();
                              const start = new Date();
                              start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 7
                              );

                              this.setState({ value2: [start, end] });
                              this.daterangepicker2.togglePickerVisible();
                            },
                          },
                          {
                            text: "Last month",
                            onClick: () => {
                              const end = new Date();
                              const start = new Date();
                              start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 30
                              );

                              this.setState({ value2: [start, end] });
                              this.daterangepicker2.togglePickerVisible();
                            },
                          },
                          {
                            text: "Last 3 months",
                            onClick: () => {
                              const end = new Date();
                              const start = new Date();
                              start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 90
                              );
                              this.setState({ value2: [start, end] });
                              this.daterangepicker2.togglePickerVisible();
                            },
                          },
                        ]}
                      />
                    </div>
                  </div>
                </Colxx>

                {/* <Colxx sm="2">
              <Label className="mt-4"> City </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                placeholder="Select City"
                name="city_ids"
                value={city_id}
                onChange={this.set_client_cities_dropdown}
                options={all_cities_json}
              />
            </Colxx> */}

                <Colxx sm="2" className="mt-4">
                  <Button color="primary" size="sm" type="submit">
                    Submit
                  </Button>
                </Colxx>
                <Colxx sm="2" className="mt-4">
                  <Button
                    size="sm"
                    color="danger"
                    onClick={(event) => {
                      this.clear_form(event);
                    }}
                  >
                    Clear
                  </Button>
                </Colxx>
              </Row>
            </form>
          </Colxx>
          {selectedItems.length ? (
            <>
              {/* <Colxx md="2" className="text-right mt-2">
                <h3>Count: {totalItemCount}</h3>
              </Colxx> */}
              <Colxx xxs="2">
                <Button color="primary" onClick={() => this.csv_export_data()}>
                  {" "}
                  Export to CSV{" "}
                </Button>
              </Colxx>
            </>
          ) : (
            <></>
          )}
        </Row>
      </>
    );
    return heading;
  };

  csv_export_data = async () => {
    const { city_id, value2 } = this.state;
    let self = this;
    let url = servicePath + "/api/v2/reports/daily_sales_report.csv?";
    if (value2 !== undefined && value2 !== null) {
      url += "&date_range=" + value2;
    }
    if (city_id.value !== undefined && city_id !== "") {
      url += "&city_id=" + city_id.value;
    }

    window.open(url, "_blank");
  };

  render() {
    const { selectedItems, cancel_reasons } = this.state;

    return (
      <div>
        {this.settings_heading()}
        {Object.keys(selectedItems).length === 0 ? (
          <>
            <>No Record Found</>;
          </>
        ) : (
          <>
            <Colxx md="12" className="mt-5">
              <Table bordered style={{ fontSize: "30px" }}>
                <thead>
                  <tr>
                    <th>
                      Order Received:
                      <br />
                      {selectedItems.total_orders}
                    </th>
                    <th style={{ border: "2px solid !important" }}>
                      Revenue:
                      <br />
                      {selectedItems.total_processed_orders_revenue}
                    </th>
                    <th style={{ border: "2px solid !important" }}>
                      Order Processed:
                      <br />
                      {selectedItems.total_processed_orders}
                    </th>
                    <th>
                      Order Pending: {selectedItems.total_pending_orders}
                      <br />
                      Revenue:
                      {selectedItems.total_pending_orders_revenue}
                    </th>
                  </tr>
                  <tr>
                    <th>
                      Order In Process: {selectedItems.total_inprocess_orders}
                      <br />
                      Revenue:
                      {selectedItems.total_inprocess_orders_revenue}
                    </th>
                    <th>
                      Order Confirmed: {selectedItems.total_confirmed_orders}
                      <br />
                      Revenue:
                      {selectedItems.total_confirmed_orders_revenue}
                    </th>
                    <th>
                      1st Time Clients:
                      <br />
                      {selectedItems.first_time_clients}
                    </th>
                    <th>
                      Sign Ups:
                      <br />
                      {selectedItems.signup_users}
                    </th>
                  </tr>
                  <tr>
                    <th>
                      Avg Rating:
                      <br />
                      {selectedItems.avg_rating}
                    </th>
                    <th>
                      Orders Cancelled:
                      <br />
                      {selectedItems.cancelled_orders}
                    </th>
                    <th>
                      Orders Cancel %:
                      <br />
                      {selectedItems.total_orders > 0 ? (
                        <>
                          {(
                            (selectedItems.cancelled_orders /
                              selectedItems.total_orders) *
                            100
                          ).toFixed(2)}
                        </>
                      ) : (
                        <>0</>
                      )}
                    </th>
                    <th>
                      Cancellation Amount:
                      <br />
                      {selectedItems.total_cancelled_orders_revenue}
                    </th>
                  </tr>
                </thead>
              </Table>
            </Colxx>
            <h4 className="ml-3">Citywise Data</h4>
            <Colxx md="12">
              <Table className="custom-border">
                <thead>
                  <th>Cities</th>
                  <th>Revenue</th>
                  <th>Order Received</th>
                  <th>Order Processed</th>
                  <th>Order Cancelled</th>
                  <th>Cancelled %</th>
                </thead>
                <tbody>
                  {selectedItems.city_wise_data.map((single_city) => {
                    return (
                      <tr>
                        <td>{single_city.city_name}</td>
                        <td>{single_city.revenue}</td>
                        <td>{single_city.received_orders}</td>
                        <td>{single_city.processed_orders}</td>
                        <td>
                          {single_city.received_orders -
                            single_city.processed_orders}
                        </td>
                        <td>
                          {single_city.received_orders > 0 ? (
                            <>
                              {(
                                ((single_city.received_orders -
                                  single_city.processed_orders) /
                                  single_city.received_orders) *
                                100
                              ).toFixed(2)}
                              %
                            </>
                          ) : (
                            <>0</>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Colxx>
            <h4 className="ml-3">Cancellation Reasons</h4>
            <Colxx xxs="7">
              <table
                className="text-left"
                style={{ border: "1px solid", width: "400px", padding: "10px" }}
              >
                <tr>
                  <th style={{ border: "1px solid" }}>Cancellation Amount</th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.total_cancelled_orders_revenue}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid" }}>Total Cancel (N)</th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.cancelled_orders}
                  </td>
                </tr>
                {cancel_reasons.map((single_reason) => {
                  return (
                    <tr>
                      <th style={{ border: "1px solid" }}>
                        {single_reason.label}
                      </th>
                      <td style={{ border: "1px solid" }}>
                        {/* {selectedItems.cancel_reason_counts.forEach(
                          (cancel_reason) => {}
                        )} */}
                        {
                          selectedItems.cancel_reason_counts[
                            `${single_reason.label}`
                          ]
                        }
                      </td>
                    </tr>
                  );
                })}
                {/* <tr>
                  <th style={{ border: "1px solid" }}>
                    Client Cancelled due to unavailibility of beautician on
                    desire time
                  </th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.unavailabilty_of_desired_beautician}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid" }}>
                    Unavailibility of Beautician
                  </th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.unavailabilty_of_beautician}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid" }}>No response</th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.no_response}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid" }}>Timing Issue</th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.timing_issue}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid" }}>Due to travel Charges</th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.due_to_travel_charges}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid" }}>
                    Mistakenly (By Client){" "}
                  </th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.mistakenly_booked}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid" }}>Client Availibility</th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.client_availability}
                  </td>
                </tr> */}
                {/* <tr>
                  <th style={{ border: "1px solid" }}>Travel Charges</th>
                  <td style={{ border: "1px solid" }}>
                    {selectedItems.total_travel_charges}
                  </td>
                </tr> */}
              </table>
            </Colxx>
          </>
        )}
      </div>
    );
  }
}
export default DataListPages;
