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

const apiUrl = servicePath + "/api/v2/reports/csr_daily_order_report.json";

let csr_report_date = sessionStorage.getItem("csr_report_date");
if (csr_report_date === null) {
  csr_report_date = moment(new Date());
} else {
  csr_report_date = moment(csr_report_date);
}

// let csr_report_city = sessionStorage.getItem("csr_report_city");
// if (csr_report_city === null) {
//   csr_report_city = [];
// } else {
//   csr_report_city = JSON.parse(csr_report_city);
// }

const end = new Date();
const start = new Date();

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
      order_date: csr_report_date,
      city_id: "",
      activePage: 1,
      currentFilter: "",
      areas_dropdown: [],
      default_filter: "",
      area_id: "",
      value2: [start, end],
      filters: [
        {
          label: "Order ID",
          value: "order_id",
        },
        {
          label: "Job ID",
          value: "job_code",
        },
        {
          label: "Client ID",
          value: "client_id",
        },
        {
          label: "Beutician ID",
          value: "technician_code",
        },
        {
          label: "City/Area",
          value: "city_area",
        },
        {
          label: "Order Status",
          value: "order_status",
        },
        {
          label: "Job Status",
          value: "job_status",
        },
      ],
      order_statuses: [
        {
          label: "Pending",
          value: "Pending",
        },
        {
          label: "In Process",
          value: "In_process",
        },
        {
          label: "Completed",
          value: "Completed",
        },
        {
          label: "Cancelled",
          value: "Cancelled",
        },
        {
          label: "Confirmed",
          value: "Confirmed",
        },
      ],
      job_statuses: [
        {
          label: "Suggestion",
          value: "Suggestion",
        },
        {
          label: "Complete",
          value: "Complete",
        },
        {
          label: "Confirmed",
          value: "Confirmed",
        },
        {
          label: "Assignment",
          value: "Assignment",
        },
        {
          label: "Decline",
          value: "Decline",
        },
        {
          label: "Cancelled",
          value: "Cancelled",
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
    const {
      city_id,
      currentFilter,
      search_id,
      area_id,
      value2,
      order_status,
      job_status,
    } = this.state;
    let self = this;
    let url =
      servicePath +
      "/api/v2/reports/csr_daily_order_report.json?page=" +
      pageNum;
    if (value2 !== undefined && value2 !== null) {
      url += "&date_range=" + value2;
    }

    if (city_id.value !== undefined && city_id !== "") {
      url += "&city_id=" + city_id.value;
    }
    if (area_id !== undefined && area_id !== "") {
      url += "&area_id=" + area_id;
    }
    if (
      (currentFilter === "order_id" ||
        currentFilter === "job_code" ||
        currentFilter === "client_id" ||
        currentFilter === "technician_code") &&
      search_id !== ""
    ) {
      url += "&" + currentFilter + "=" + search_id;
    }
    if (currentFilter === "order_status" && order_status !== "") {
      url += "&order_status=" + order_status;
    }
    if (currentFilter === "job_status" && job_status !== "") {
      url += "&job_status=" + job_status;
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
          selectedItems: response.data.order_jobs,
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
    let areas = await this.get_all_areas(city.value);
    let areas_dropdown_json = this.areas_dropdown_json(areas);
    this.setState({
      city_id: city,
      areas_dropdown: areas_dropdown_json,
    });
  };

  set_filters = (filter) => {
    if (
      filter.value === "order_id" ||
      filter.value === "job_code" ||
      filter.value === "client_id" ||
      filter.value === "technician_code"
    ) {
      this.setState({
        currentFilter: filter.value,
        default_filter: filter,
        value2: null,
      });
    } else {
      this.setState({
        currentFilter: filter.value,
        default_filter: filter,
      });
    }
  };

  set_value = (e) => {
    this.setState({
      search_id: e.target.value,
    });
  };

  set_payment_status = (payment_status) => {
    this.setState({
      payment_status: payment_status.value,
    });
  };

  set_order_status = (order_status) => {
    this.setState({
      order_status: order_status.value,
    });
  };

  set_job_status = (job_status) => {
    this.setState({
      job_status: job_status.value,
    });
  };

  set_area = (area) => {
    this.setState({
      area_id: area.value,
    });
  };

  render_filters = () => {
    const {
      currentFilter,
      city_id,
      all_cities_json,
      order_statuses,
      job_statuses,
    } = this.state;
    let self = this;
    let filters_html = [];
    if (
      currentFilter === "order_id" ||
      currentFilter === "job_code" ||
      currentFilter === "client_id" ||
      currentFilter === "technician_code"
    ) {
      filters_html = (
        <>
          <Colxx md="2">
            <Label className="mt-4"> ID</Label>
            <Input
              type="text"
              name={currentFilter}
              placeholder="Enter ID"
              onChange={this.set_value}
              required
            />
          </Colxx>
        </>
      );
    } else if (currentFilter === "city_area") {
      filters_html = (
        <>
          <Colxx sm="2">
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
          </Colxx>
          {self.render_area_dropdown()}
        </>
      );
    } else if (currentFilter === "order_status") {
      filters_html = (
        <>
          <Colxx sm="2">
            <Label className="mt-4"> Order Status </Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              placeholder="Select Status"
              name="city_ids"
              onChange={this.set_order_status}
              options={order_statuses}
            />
          </Colxx>
        </>
      );
    } else if (currentFilter === "job_status") {
      filters_html = (
        <>
          <Colxx sm="2">
            <Label className="mt-4"> Job Status </Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              placeholder="Select Status"
              name="city_ids"
              onChange={this.set_job_status}
              options={job_statuses}
            />
          </Colxx>
        </>
      );
    }
    return filters_html;
  };

  render_area_dropdown = () => {
    const { city_id, areas_dropdown } = this.state;
    let areas_dropdown_html = [];
    if (city_id !== undefined && city_id !== "") {
      areas_dropdown_html = (
        <>
          <Colxx sm="2">
            <Label className="mt-4"> Area </Label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              placeholder="Select Area"
              name="city_ids"
              // value={city_id}
              onChange={this.set_area}
              options={areas_dropdown}
            />
          </Colxx>
        </>
      );
    }
    return areas_dropdown_html;
  };

  clear_form = async (event) => {
    sessionStorage.removeItem("csr_report_city");
    sessionStorage.removeItem("csr_report_date");
    const end = new Date();
    const start = new Date();
    this.state.city_id = "";
    this.state.area_id = "";
    this.state.default_filter = "";
    this.state.value2 = [start, end];
    this.state.currentFilter = "";
    this.state.order_status = "";
    this.state.job_status = "";
    this.dataListRender(1);
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
      default_filter,
      csv_data,
      totalItemCount,
    } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="8">
            <div className="mb-2">
              <h1>Daily Reports CSR</h1>
            </div>
          </Colxx>
          {selectedItems.length ? (
            <>
              <Colxx md="2" className="text-right mt-2">
                <h3>Count: {totalItemCount}</h3>
              </Colxx>
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
                        default_filter: "",
                        currentFilter: "",
                      });
                    }}
                    shortcuts={[
                      {
                        text: "Last week",
                        onClick: () => {
                          const end = new Date();
                          const start = new Date();
                          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);

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

            <Colxx sm="2">
              <Label className="mt-4"> Filters </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                value={default_filter}
                classNamePrefix="react-select"
                placeholder="Select Filter"
                id="filters"
                // value={city_id}
                onChange={this.set_filters}
                options={filters}
              />
            </Colxx>
            {this.render_filters()}
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
          </Row>
        </form>
      </>
    );
    return heading;
  };

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);
  };

  csv_export_data = async () => {
    const {
      city_id,
      currentFilter,
      search_id,
      area_id,
      value2,
      order_status,
      job_status,
    } = this.state;
    let self = this;
    let url = servicePath + "/api/v2/csv_reports/csr_daily_order_report.csv?";
    if (value2 !== undefined && value2 !== null) {
      url += "&date_range=" + value2;
    }
    if (city_id.value !== undefined && city_id !== "") {
      url += "&city_id=" + city_id.value;
    }
    if (area_id !== undefined && area_id !== "") {
      url += "&area_id=" + area_id;
    }
    if (
      (currentFilter === "order_id" ||
        currentFilter === "job_code" ||
        currentFilter === "client_id" ||
        currentFilter === "technician_code") &&
      search_id !== ""
    ) {
      url += "&" + currentFilter + "=" + search_id;
    }
    if (currentFilter === "order_status" && order_status !== "") {
      url += "&order_status=" + order_status;
    }
    if (currentFilter === "job_status" && job_status !== "") {
      url += "&job_status=" + job_status;
    }
    window.open(url, "_blank");
  };

  render_categories_row = (service_categories) => {
    let html_data = [];
    service_categories.forEach((single_category, index) => {
      html_data.push(
        <tr>
          <td>{index + 1}</td>
          <td className="text-left">
            {single_category.service_category_title}
          </td>
        </tr>
      );
    });
    return html_data;
  };

  render_service_addons = (service) => {
    let service_addons_html = [];
    if (service.order_job_service_addons.length) {
      service.order_job_service_addons.forEach((single_addon) => {
        service_addons_html.push(
          <tr>
            <td>
              <li>
                {single_addon.service_addon_title}{" "}
                <b>({single_addon.unit_count})</b>
              </li>
            </td>
          </tr>
        );
      });
    }
    return service_addons_html;
  };

  render_services_row = (job_services) => {
    let html_data = [];
    job_services.forEach((single_service, index) => {
      html_data.push(
        <tr>
          <td>{index + 1}</td>
          <td className="text-left">
            {single_service.service_title} <b>({single_service.unit_count})</b>
            {this.render_service_addons(single_service)}
          </td>
        </tr>
      );
    });
    return html_data;
  };

  set_categories_details = (service_categories) => {
    let service_detail_html = [];
    service_detail_html = (
      <>
        <Table>
          <thead>
            <tr>
              <th>No.</th>
              <th className="text-left">Title</th>
            </tr>
          </thead>
          <tbody>{this.render_categories_row(service_categories)}</tbody>
        </Table>
      </>
    );
    return service_detail_html;
  };

  set_service_details = (job_services) => {
    let service_detail_html = [];
    service_detail_html = (
      <>
        <Table>
          <thead>
            <tr>
              <th>No.</th>
              <th className="text-left">Title</th>
            </tr>
          </thead>
          <tbody>{this.render_services_row(job_services)}</tbody>
        </Table>
      </>
    );
    return service_detail_html;
  };
  set_discount_details = (single_job) => {
    let self = this;
    let service_detail_html = [];
    service_detail_html = (
      <>
        <Table>
          <tr>
            <td>Job Discount:</td>
            <td>{single_job.job_discount}</td>
          </tr>
          <tr>
            <td>Deal Discount:</td>
            <td>{parseInt(single_job.deal_discount)}</td>
          </tr>
          <tr>
            <td>Coupon Discount:</td>
            <td>{parseInt(single_job.coupon_discount)}</td>
          </tr>
          <tr>
            <td>Free Service Discount:</td>
            <td>{single_job.free_service_redeemed_discount}</td>
          </tr>
          <tr>
            <td>
              <b>Total: </b>
            </td>
            <td>
              {Math.round(
                single_job.job_discount +
                  parseInt(single_job.deal_discount) +
                  parseInt(single_job.coupon_discount) +
                  single_job.free_service_redeemed_discount
              )}
            </td>
          </tr>
        </Table>
      </>
    );
    return service_detail_html;
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
          <tr>
            <td>Address:</td>
            <td>{single_job.address_1}</td>
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
          <td>
            <Popover
              placement="bottom"
              title="Service Categories Details"
              width="400"
              trigger="click"
              content={self.set_categories_details(
                single_job.service_categories
              )}
            >
              <u>
                <a style={{ color: "blue" }}>Categories</a>
              </u>
            </Popover>{" "}
            /{" "}
            <Popover
              placement="bottom"
              title="Service Details"
              width="400"
              trigger="click"
              content={self.set_service_details(single_job.order_job_services)}
            >
              <u>
                <a style={{ color: "blue" }}>Services</a>
              </u>
            </Popover>
          </td>
          <td>{single_job.order_status}</td>
          <td>{single_job.job_status}</td>
          <td>
            {single_job.technician_first_name} {single_job.technician_last_name}{" "}
            ({single_job.technician_code})
          </td>
          <td>{single_job.job_actual_amount} </td>
          <td>{single_job.job_travel_charges}</td>
          <td>{single_job.waiting_charges}</td>
          <td>
            <Popover
              placement="bottom"
              title="Discount Details"
              width="400"
              trigger="click"
              content={self.set_discount_details(single_job)}
            >
              <u>
                <a style={{ color: "blue" }}>
                  {Math.round(
                    single_job.job_discount +
                      parseInt(single_job.deal_discount) +
                      parseInt(single_job.coupon_discount) +
                      single_job.free_service_redeemed_discount
                  )}
                </a>
              </u>
            </Popover>
          </td>
          <td>{single_job.job_total_amount - single_job.job_travel_charges}</td>
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
                      <th>Category/Service</th>
                      <th>Order Status</th>
                      <th>Job Status</th>
                      <th>Beatician Name</th>
                      <th>Total Amount</th>
                      <th>Travel Charges</th>
                      <th>Waiting Charges</th>
                      <th>Discount</th>
                      <th>Net Earning</th>
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
