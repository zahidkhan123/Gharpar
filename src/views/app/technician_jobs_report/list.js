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
// if (csr_report_date === null) {
//   csr_report_date = moment(new Date());
// } else {
//   csr_report_date = moment(csr_report_date);
// }

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
      value2: "",
      current_cities: [],
      current_categories: [],
      tech_code: "",
      hub_name: "",
      hubs_json: [
        { label: "Hub A", value: "hub_a" },
        { label: "Hub B", value: "hub_b" },
        { label: "Hub C", value: "hub_c" },
        { label: "Hub D", value: "hub_d" },
        { label: "Hub E", value: "hub_e" },
        { label: "Hub F", value: "hub_f" },
      ],
    };
  }

  componentDidMount = async () => {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    let service_categories = await this.get_service_categories();
    let service_categories_dropdown_data =
      this.service_categories_dropdown_json(service_categories);
    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
      service_categories_json: service_categories_dropdown_data,
    });
    this.dataListRender(1);
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

  get_service_categories = async () => {
    let all_service_categories = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/service_categories.json?is_deal=false",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          all_service_categories = response.data.service_categories;
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

    return all_service_categories;
  };

  service_categories_dropdown_json = (all_service_categories) => {
    let cities_dropdown_data = [];

    all_service_categories.forEach(function (currentValue) {
      if (!currentValue.is_deal) {
        cities_dropdown_data.push({
          label: currentValue.service_category_title,
          value: currentValue.id,
          key: currentValue.id,
        });
      }
    });
    return cities_dropdown_data;
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
    const { value2, current_cities, hub_name, current_categories, tech_code } =
      this.state;
    let self = this;
    let city_ids = [];
    let category_ids = [];
    city_ids = current_cities.map((single_city) => single_city.value);
    category_ids = current_categories.map(
      (single_status) => single_status.value
    );
    let url =
      servicePath +
      "/api/v2/reports/technician_jobs_report.json?page=" +
      pageNum;
    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }
    if (category_ids.length) {
      url += "&category_ids=" + category_ids;
    }
    if (hub_name !== undefined && hub_name !== "") {
      url += "&hub_name=" + hub_name;
    }
    if (value2 !== undefined && value2 !== "") {
      url += "&date_range=" + value2;
    }
    if (tech_code !== undefined && tech_code !== "") {
      url += "&technician_code=" + tech_code;
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
          selectedItems: response.data.technicians,
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

  set_current_city = (cities) => {
    this.setState({
      current_cities: cities,
    });
  };

  set_current_hub = (hub) => {
    this.setState({
      hub_name: hub.value,
    });
  };

  set_categories = (categories) => {
    this.setState({
      current_categories: categories,
    });
  };

  set_technician_code = (tech_code) => {
    this.setState({
      tech_code: tech_code.target.value,
    });
  };

  handleSubmit = async (event) => {
    const { activePage } = this.state;
    event.preventDefault();
    await this.dataListRender(activePage);
  };

  clear_form = async () => {
    this.state.current_cities = [];
    this.state.current_categories = [];
    this.state.value2 = "";
    this.state.tech_code = "";
    await this.dataListRender(1);
  };

  settings_heading = () => {
    const {
      filters,
      value2,
      selectedItems,
      default_filter,
      csv_data,
      totalItemCount,
      all_cities_json,
      service_categories_json,
      hubs_json,
      current_cities,
      tech_code,
      current_categories,
    } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="8">
            <div className="mb-2">
              <h1>Technician Jobs Report</h1>
            </div>
          </Colxx>
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
              <Label className="mt-4"> Categories </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                isMulti
                classNamePrefix="react-select"
                placeholder="Select Categories"
                onChange={this.set_categories}
                value={current_categories}
                options={service_categories_json}
              />
            </Colxx>

            {/* <Colxx sm="2">
              <Label className="mt-4"> Hubs </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                placeholder="Select Hub"
                onChange={this.set_current_hub}
                options={hubs_json}
              />
            </Colxx> */}

            <Colxx sm="2">
              <Label className="mt-4"> City </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                isMulti
                placeholder="Select City"
                value={current_cities}
                onChange={this.set_current_city}
                options={all_cities_json}
              />
            </Colxx>
            <Colxx sm="2">
              <Label className="mt-4"> Technician Code </Label>
              <Input
                type="text"
                placeholder="Technician Code"
                onChange={this.set_technician_code}
                value={tech_code}
              />
            </Colxx>

            {/* <Colxx sm="2">
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
            </Colxx> */}
            {/* {this.render_filters()} */}
            <Colxx md="3" className="mt-5">
              <div>
                <Button
                  style={{ width: "65px", padding: "8px" }}
                  color="primary"
                  size="sm"
                  type="submit"
                  className="mr-1"
                >
                  Submit
                </Button>
                <Button
                  style={{ width: "60px" }}
                  size="sm"
                  color="danger"
                  className="mr-1"
                  onClick={(event) => {
                    this.clear_form(event);
                  }}
                >
                  Clear
                </Button>
                {selectedItems.length ? (
                  <>
                    <Button
                      size="sm"
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
              </div>
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
    const { value2, current_cities, hub_name, current_categories, tech_code } =
      this.state;
    let self = this;
    let city_ids = [];
    let category_ids = [];
    city_ids = current_cities.map((single_city) => single_city.value);
    category_ids = current_categories.map(
      (single_status) => single_status.value
    );
    let url = servicePath + "/api/v2/csv_reports/technician_jobs_report.xlsx";
    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }
    if (category_ids.length) {
      url += "&category_ids=" + category_ids;
    }
    if (hub_name !== undefined && hub_name !== "") {
      url += "&hub_name=" + hub_name;
    }
    if (value2 !== undefined && value2 !== "") {
      url += "&date_range=" + value2;
    }
    if (tech_code !== undefined && tech_code !== "") {
      url += "&technician_code=" + tech_code;
    }

    window.open(url, "_blank");
  };

  render_categories_data = (all_categories) => {
    let categories_html = [];
    all_categories.map((single_category) => {
      categories_html.push(
        <>
          <tr>
            <td>{single_category.city_name}</td>
            <td>{single_category.is_active ? "True" : "False"}</td>
            <td>{single_category.is_male_allowed ? "True" : "False"}</td>
            <td>{single_category.is_female_allowed ? "True" : "False"}</td>
          </tr>
        </>
      );
    });
    return categories_html;
  };

  render_services_data = (all_services) => {
    let services_html = [];
    all_services.map((single_service) => {
      services_html.push(
        <>
          <tr>
            <td>{single_service.city_name}</td>
            <td>{single_service.is_active ? "True" : "False"}</td>
            <td>{single_service.is_male_allowed ? "True" : "False"}</td>
            <td>{single_service.is_female_allowed ? "True" : "False"}</td>
            <td>{single_service.price}</td>
          </tr>
        </>
      );
    });
    return services_html;
  };

  set_category_details = (all_categories) => {
    let self = this;
    let category_detail_html = [];
    category_detail_html = (
      <>
        <Table>
          <thead>
            <th>City</th>
            <th>Active</th>
            <th>Male</th>
            <th>Female</th>
          </thead>
          <tbody>{self.render_categories_data(all_categories)}</tbody>
        </Table>
      </>
    );

    return category_detail_html;
  };

  set_service_details = (all_services) => {
    let self = this;
    let service_detail_html = [];
    service_detail_html = (
      <>
        <Table>
          <thead>
            <th>City</th>
            <th>Active</th>
            <th>Male</th>
            <th>Female</th>
            <th>Price</th>
          </thead>
          <tbody>{self.render_services_data(all_services)}</tbody>
        </Table>
      </>
    );

    return service_detail_html;
  };

  render_inner_services = (all_services) => {
    let inner_services_html = [];
    all_services.map((single_service) => {
      inner_services_html.push(
        <tr>
          <td>{single_service.service_title}</td>
          <td>{single_service.technician_services_count}</td>
        </tr>
      );
    });
    return inner_services_html;
  };

  render_technician_services = (all_services) => {
    let technician_services_html = [];
    technician_services_html = (
      <>
        <Table>
          <thead>
            <th>Service</th>
            <th>Count</th>
          </thead>
          <tbody>{this.render_inner_services(all_services)}</tbody>
        </Table>
      </>
    );
    return technician_services_html;
  };

  render_technician_categories = (technician) => {
    let self = this;
    let technician_categories_html = [];
    technician.categories.map((single_category) => {
      technician_categories_html.push(
        <td>
          <Popover
            placement="bottom"
            title="Services Details"
            width="400"
            trigger="click"
            content={self.render_technician_services(single_category.services)}
          >
            <u>
              <a>Services: {single_category.technician_category_count}</a>
            </u>
          </Popover>
        </td>
      );
    });
    return technician_categories_html;
  };

  render_table_data = (selectedItems) => {
    let self = this;
    let table_data = [];
    selectedItems.forEach((single_technician) => {
      table_data.push(
        <tr>
          <td>
            {single_technician.first_name} {single_technician.last_name} <br />(
            {single_technician.technician_code})
          </td>
          <>{self.render_technician_categories(single_technician)}</>
        </tr>
      );
    });
    return table_data;
  };

  render_categories_header = (technicians) => {
    let categories_header = [];
    technicians[0].categories.map((single_category) => {
      categories_header.push(<th>{single_category.service_category_title}</th>);
    });
    return categories_header;
  };

  render() {
    const { selectedItems, activePage, totalItemCount } = this.state;
    let self = this;
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
                      <th style={{ width: "150px" }}>Technicians</th>
                      <>{this.render_categories_header(selectedItems)}</>
                    </tr>
                  </thead>
                  <tbody>{this.render_table_data(selectedItems)}</tbody>
                </Table>
              </div>
              {totalItemCount > 20 ? (
                <>
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
                <></>
              )}
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
