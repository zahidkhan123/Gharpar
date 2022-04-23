import React, { Component } from "react";

import { Row, Card, Table, CardBody, Label, Button, Input } from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { Popover } from "element-react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import CustomSelectInput from "../../../components/common/CustomSelectInput";

import Select from "react-select";
import { Link } from "react-router-dom";
import { trackPromise } from "react-promise-tracker";
import { Tabs, DatePicker } from "element-react";
import moment from "moment";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";

const apiUrl = servicePath + "/api/v2/reports/daily_sales_report.json";

// let csr_report_city = sessionStorage.getItem("csr_report_city");
// if (csr_report_city === null) {
//   csr_report_city = [];
// } else {
//   csr_report_city = JSON.parse(csr_report_city);
// }

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
      startDate: moment(new Date()),
      monthYear: "",
    };
  }

  componentDidMount() {
    // let all_cities = JSON.parse(localStorage.getItem("cities"));
    // let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    // this.setState({
    //   all_cities: all_cities,
    //   all_cities_json: cities_dropdown_data,
    // });
    // this.dataListRender(1);
  }

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

  dataListRender(pageNum) {
    const { city_id, monthYear } = this.state;
    // let date = moment(monthYear, "MM-YYYY");
    let self = this;
    let url = servicePath + "/api/v2/reports/monthly_client_report.json";
    if (monthYear !== undefined && monthYear !== null) {
      url += "?date=" + monthYear;
    }

    // if (city_id.value !== undefined && city_id !== "") {
    //   url += "&city_id=" + city_id.value;
    // }

    // if (
    //   city_id.value === "" ||
    //   city_id.value === undefined ||
    //   value2 === undefined ||
    //   value2 === null ||
    //   value2 === ""
    // ) {
    //   NotificationManager.error(
    //     "Please Select City and Date",
    //     "",
    //     3000,
    //     null,
    //     null,
    //     "filled"
    //   );
    // } else {
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
    this.state.value2 = "";
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    await this.dataListRender();
  };

  handleChangeEnd = (date) => {
    this.setState({
      startDate: date,
    });
  };

  settings_heading = () => {
    const { value2, selectedItems, city_id, all_cities_json, monthYear } =
      this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="8">
            <div className="mb-2">
              <h1>Monthly Reports Client</h1>
            </div>
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

        <form onSubmit={this.handleSubmit}>
          <Row className="mb-3">
            <Colxx sm="3">
              <Label className="mt-4"> Date </Label>
              <div className="source">
                <div className="block">
                  <DatePicker
                    value={monthYear}
                    placeholder="Select Month"
                    onChange={(date) => {
                      console.debug("month DatePicker changed: ", date);
                      this.setState({ monthYear: date });
                    }}
                    selectionMode="month"
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

            <Colxx sm="1" className="mt-5">
              <Button color="primary" size="sm" type="submit">
                Submit
              </Button>
            </Colxx>
            <Colxx sm="1" className="mt-5">
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
            {Object.keys(selectedItems).length > 0 ? (
              <>
                <Colxx md="5" className="text-right mt-2"></Colxx>
                <Colxx xxs="2">
                  <Button
                    color="primary"
                    onClick={() => this.csv_export_data()}
                  >
                    {" "}
                    Export to CSV{" "}
                  </Button>
                </Colxx>
              </>
            ) : (
              <></>
            )}
          </Row>
        </form>
      </>
    );
    return heading;
  };

  csv_export_data = async () => {
    const { city_id, monthYear } = this.state;
    let self = this;
    let url = servicePath + "/api/v2/csv_reports/monthly_client_report.csv?";
    if (monthYear !== undefined && monthYear !== null) {
      url += "&date=" + monthYear;
    }
    // if (city_id.value !== undefined && city_id !== "") {
    //   url += "&city_id=" + city_id.value;
    // }

    window.open(url, "_blank");
  };

  render() {
    const { selectedItems } = this.state;

    return (
      <div>
        {this.settings_heading()}
        {Object.keys(selectedItems).length === 0 ? (
          <>
            <>No Record Found</>;
          </>
        ) : (
          <>
            <Colxx xxs="12">
              <Table striped>
                <tbody>
                  <tr>
                    <th>Total Sign up on System</th>
                    <td>{selectedItems.signups_on_the_system_count}</td>
                  </tr>
                  <tr>
                    <th>Total Sign up in this month</th>
                    <td>{selectedItems.signups_in_this_month_count}</td>
                  </tr>
                  <tr>
                    <th>Approved users</th>
                    <td>
                      {selectedItems.approved_clients_in_this_month_count}
                    </td>
                  </tr>
                  <tr>
                    <th>Total number of clients used us</th>
                    <td>
                      {
                        selectedItems.number_of_clients_used_us_in_this_month_count
                      }
                    </td>
                  </tr>
                  <tr>
                    <th>Conversion rate of Approved members</th>
                    <td>
                      {parseFloat(
                        selectedItems.approved_clients_in_this_month_count /
                          selectedItems.signups_in_this_month_count
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                  <tr>
                    <th>Conversion rate of used clients as per approved</th>
                    <td>
                      {parseFloat(
                        selectedItems.number_of_clients_used_us_in_this_month_count /
                          selectedItems.approved_clients_in_this_month_count
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                  <tr>
                    <th>First Time user processed</th>
                    <td>
                      {
                        selectedItems.clients_with_first_order_in_this_month_count
                      }
                    </td>
                  </tr>
                  <tr>
                    <th>Signup and converted in same month</th>
                    <td>
                      {selectedItems.signup_and_converted_in_this_month_count}
                    </td>
                  </tr>
                  <tr>
                    <th>New clients Approved but 0 order completed</th>
                    <td>{selectedItems.new_clients_with_no_orders_count}</td>
                  </tr>
                  <tr>
                    <th>Repeat Cleints</th>
                    <td>{selectedItems.repeat_clients_count}</td>
                  </tr>
                </tbody>
              </Table>
            </Colxx>
          </>
        )}
      </div>
    );
  }
}
export default DataListPages;
