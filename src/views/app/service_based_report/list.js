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

let service_based_report_cities_filters = sessionStorage.getItem(
  "service_based_report_cities_filters"
);
let service_based_report_service_type_filter = sessionStorage.getItem(
  "service_based_report_service_type_filter"
);
let service_based_report_date_filter = sessionStorage.getItem(
  "service_based_report_date_filter"
);

if (service_based_report_cities_filters === null) {
  service_based_report_cities_filters = [];
} else {
  service_based_report_cities_filters = JSON.parse(
    service_based_report_cities_filters
  );
}

if (service_based_report_service_type_filter === null) {
  service_based_report_service_type_filter = [];
} else {
  service_based_report_service_type_filter = JSON.parse(
    service_based_report_service_type_filter
  );
}

if (service_based_report_date_filter === null) {
  service_based_report_date_filter = "";
} else {
  service_based_report_date_filter = service_based_report_date_filter;
}

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      displayMode: "list",
      selectedPageSize: 10,
      modalOpen: false,
      currentPage: 1,
      totalItemCount: 0,
      totalPage: 1,
      selectedItems: [],
      activePage: 1,
      value2: service_based_report_date_filter,
      service_type_filter: service_based_report_service_type_filter,
      selected_cities: service_based_report_cities_filters,
      filters: [
        {
          label: "Service Availed",
          value: "is_service_availed",
        },
        {
          label: "Service Cancelled",
          value: "is_service_cancelled",
        },
      ],
    };
  }

  componentDidMount() {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
    });
    this.dataListRender(1);
  }

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

  set_city_filter = (city) => {
    sessionStorage.setItem(
      "service_based_report_cities_filters",
      JSON.stringify(city)
    );
    this.setState({
      selected_cities: city,
    });
  };

  set_filters = (filter) => {
    sessionStorage.setItem(
      "service_based_report_service_type_filter",
      JSON.stringify(filter)
    );
    this.setState({
      service_type_filter: filter,
    });
  };

  dataListRender(pageNum) {
    const { value2, service_type_filter, selected_cities } = this.state;
    let self = this;
    let url =
      servicePath + "/api/v2/reports/service_based_report.json?page=" + pageNum;

    if (value2 !== undefined && value2 !== null && value2 !== "null") {
      url += "&date_range=" + value2;
    }

    if (
      service_type_filter != "" &&
      service_type_filter.value == "is_service_availed"
    ) {
      url += "&is_service_availed=true";
    }

    if (
      service_type_filter != "" &&
      service_type_filter.value == "is_service_cancelled"
    ) {
      url += "&is_service_cancelled=true";
    }

    if (selected_cities.length > 0) {
      let cities = [];
      selected_cities.forEach((city) => {
        cities += city.value + ",";
      });
      url += "&city_ids=" + cities;
    }

    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.status === 200) {
        self.setState({
          selectedItems: response.data.order_job_services,
          activePage: pageNum,
          totalItemCount: response.data.paging_data.total_records,
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
      }
    });
  }

  clear_form = async (event) => {
    sessionStorage.removeItem("service_based_report_cities_filters");
    sessionStorage.removeItem("service_based_report_service_type_filter");
    sessionStorage.removeItem("service_based_report_date_filter");
    const end = new Date();
    const start = new Date();
    this.state.value2 = [start, end];
    this.state.service_type_filter = "";
    this.state.selected_cities = [];
    this.dataListRender(1);
  };

  csv_export_data = async () => {
    const { value2, service_type_filter, selected_cities } = this.state;
    let self = this;
    let url = servicePath + "/api/v2/csv_reports/service_based_report.csv?";

    if (value2 !== undefined && value2 !== null && value2 !== "null") {
      url += "&date_range=" + value2;
    }

    if (
      service_type_filter != "" &&
      service_type_filter.value == "is_service_availed"
    ) {
      url += "&is_service_availed=true";
    }

    if (
      service_type_filter != "" &&
      service_type_filter.value == "is_service_cancelled"
    ) {
      url += "&is_service_cancelled=true";
    }

    if (selected_cities.length > 0) {
      let cities = [];
      selected_cities.forEach((city) => {
        cities += city.value + ",";
      });
      url += "&city_ids=" + cities;
    }
    window.open(url, "_blank");
  };

  handleSubmit = async (event) => {
    const { activePage } = this.state;
    event.preventDefault();
    await this.dataListRender(activePage);
  };

  settings_heading = () => {
    const {
      filters,
      value2,
      selectedItems,
      totalItemCount,
      service_type_filter,
      all_cities_json,
      selected_cities,
    } = this.state;
    let heading = <></>;
    heading = (
      <>
        <form onSubmit={this.handleSubmit}>
          <Row>
            <Colxx xxs="8">
              <div className="mb-2">
                <h1>Service Based Report</h1>
              </div>
            </Colxx>
            <Colxx xxs="4" className="text-right mt-2">
              {selectedItems.length ? (
                <>
                  <Button
                    color="primary"
                    onClick={() => this.csv_export_data()}
                  >
                    {" "}
                    Export to CSV{" "}
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Colxx>
          </Row>
          <Row className="mb-3">
            <Colxx sm="3">
              <Label>Date</Label>
              {/*<Label className="mt-4"> Date </Label>*/}
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
                      sessionStorage.setItem(
                        "service_based_report_date_filter",
                        date
                      );
                    }}
                  />
                </div>
              </div>
            </Colxx>
            <Colxx sm="2">
              {/*<Label className="mt-4"> Filters </Label>*/}
              <Label>Filters</Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                value={service_type_filter}
                classNamePrefix="react-select"
                placeholder="Select Filter"
                id="filters"
                // value={city_id}
                onChange={this.set_filters}
                options={filters}
              />
            </Colxx>
            <Colxx sm="2">
              <Label>Cities</Label>
              <Select
                components={{ Input: CustomSelectInput }}
                isMulti
                className="react-select"
                classNamePrefix="react-select"
                placeholder="Select City"
                name="city_ids"
                value={selected_cities}
                onChange={this.set_city_filter}
                options={all_cities_json}
              />
            </Colxx>
            <Colxx sm="1" className="mt-4">
              <Button color="primary" size="sm" type="submit">
                Submit
              </Button>
            </Colxx>
            <Colxx sm="1" className="mt-4">
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
      </>
    );
    return heading;
  };

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);
  };

  set_client_details = (single_job) => {
    let service_detail_html = [];
    service_detail_html = (
      <>
        <Table>
          <tr>
            <td>Client Name:</td>
            <td>
              {single_job.first_name} {single_job.last_name}
            </td>
          </tr>
          <tr>
            <td>Client ID:</td>
            <td>{single_job.membership_code}</td>
          </tr>
          <tr>
            <td>Phone:</td>
            <td>{single_job.phone}</td>
          </tr>
          <tr>
            <td>Gender:</td>
            <td>{single_job.gender}</td>
          </tr>
        </Table>
      </>
    );
    return service_detail_html;
  };

  render_table_data = (selectedItems) => {
    let self = this;
    let table_data = [];
    selectedItems.forEach((single_job) => {
      table_data.push(
        <tr>
          <td>
            <Link to={`/app/orders/show/${single_job.order_id}`}>
              {single_job.job_code}
            </Link>
          </td>
          <td>
            <Popover
              placement="bottom"
              title="Client Details"
              width="400"
              trigger="click"
              content={self.set_client_details(single_job)}
            >
              <u>
                <a style={{ color: "blue" }}>
                  {single_job.first_name} {single_job.last_name}
                </a>
              </u>
            </Popover>
          </td>
          <td>{single_job.city_name}</td>
          <td>
            {single_job.order_date} {single_job.start_time}
          </td>
          <td>{single_job.service_category_title}</td>
          <td>{single_job.service_title}</td>
          <td>{single_job.unit_count} </td>
          <td>{single_job.order_status}</td>
          <td>{single_job.job_status}</td>
          <td>
            {single_job.service_status == 'Cancelled' ? (
              <>
                <span style={{ color: "red" }}>
                  {single_job.service_status}
                </span>
              </>
            ) : (
              <>
                <span style={{ color: "green" }}>
                  {single_job.service_status}
                </span>
              </>
            )}
          </td>
          <td>
            {single_job.technician_first_name} {single_job.technician_last_name}{" "}
            ({single_job.technician_code})
          </td>
          <td>{single_job.total_price}</td>
        </tr>
      );
    });
    return table_data;
  };

  render() {
    const { selectedItems, activePage, totalItemCount } = this.state;

    return (
      <div>
        {this.settings_heading()}
        <Colxx xxs="12">
          {selectedItems.length ? (
            <>
              <div
                style={{
                  overflow: "auto",
                }}
              >
                <Table striped className="text-center">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Client</th>
                      <th>City</th>
                      <th>Date Time</th>
                      <th>Category</th>
                      <th>Service</th>
                      <th>Unit Count</th>
                      <th>Order Status</th>
                      <th>Job Status</th>
                      <th>Service Status</th>
                      <th>Beautician Name</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>{this.render_table_data(selectedItems)}</tbody>
                </Table>
              </div>
              <Pagination
                activePage={activePage}
                itemsCountPerPage={20}
                totalItemsCount={totalItemCount}
                delimeter={5}
                onChange={this.handlePageChange}
                styling="rounded_primary"
              />
            </>
          ) : (
            <>No Record Found</>
          )}
        </Colxx>
      </div>
    );
  }
}
export default DataListPages;
