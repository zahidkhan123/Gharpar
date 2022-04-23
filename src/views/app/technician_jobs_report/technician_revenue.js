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
import "./technician_report.css";

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
      tech_statuses: [
        {
          label: "Beginner(In Training)",
          value: "Beginner(In Training)",
          key: 0,
        },
        {
          label: "Intermediate(In Training)",
          value: "Intermediate(In Training)",
          key: 1,
        },
        { label: "Active", value: "Active", key: 2 },
        { label: "On leaves", value: "On leaves", key: 3 },
        { label: "Suspended", value: "Suspended", key: 4 },
        { label: "Terminated", value: "Terminated", key: 5 },
        { label: "Resigned", value: "Resigned", key: 6 },
        {
          label: "Missing in Action",
          value: "Missing in action",
          key: 7,
        },
        { label: "Contract Ended", value: "Contract ended", key: 8 },
      ],
      default_tech_status: [{ label: "Active", value: "Active", key: 2 }],
      tech_status: "Active",
    };
  }

  componentDidMount = async () => {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    // let service_categories = await this.get_service_categories();
    // let service_categories_dropdown_data =
    // this.service_categories_dropdown_json(service_categories);
    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
      // service_categories_json: service_categories_dropdown_data,
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
    const {
      value2,
      current_cities,
      hub_name,
      current_categories,
      tech_code,
      tech_status,
    } = this.state;
    const { match } = this.props;
    let self = this;
    let city_ids = [];
    let category_ids = [];
    city_ids = current_cities.map((single_city) => single_city.value);
    category_ids = current_categories.map(
      (single_status) => single_status.value
    );
    let url =
      servicePath +
      "/api/v2/reports/technician_jobs_report.json?technician_code=" +
      match.params.id;

    if (value2 !== undefined && value2 !== "") {
      url += "&date_range=" + value2;
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
          selectedItems: response.data.categories,
          again_categories: response.data.again_categories,
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

  set_current_tech_status = (tech_status) => {
    this.setState({
      tech_status: tech_status.value,
      default_tech_status: tech_status,
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
      tech_statuses,
      default_tech_status,
    } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="8">
            <div className="mb-2">
              <h1>Technician Revenue Report</h1>
            </div>
          </Colxx>
        </Row>
        <form onSubmit={this.handleSubmit}>
          <Row className="mb-3">
            <Colxx md="6">
              <h2>
                {selectedItems[0]?.technicians[0]?.first_name}{" "}
                {selectedItems[0]?.technicians[0]?.last_name} -{" "}
                {selectedItems[0]?.technicians[0]?.technician_code}
              </h2>
            </Colxx>
            <Colxx sm="3">
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

            {/* <Colxx sm="3">
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

            <Colxx sm="3">
              <Label className="mt-4"> Technician Status </Label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                placeholder="Technician Status"
                value={default_tech_status}
                onChange={this.set_current_tech_status}
                options={tech_statuses}
              />
            </Colxx>

            <Colxx sm="3">
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
            <Colxx sm="3">
              <Label className="mt-4"> Technician Code </Label>
              <Input
                type="text"
                placeholder="Technician Code"
                onChange={this.set_technician_code}
                value={tech_code}
              />
            </Colxx> */}

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
            <Colxx md="3">
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
    const {
      value2,
      current_cities,
      hub_name,
      current_categories,
      tech_code,
      tech_status,
    } = this.state;
    const { match } = this.props;
    let self = this;
    let city_ids = [];
    let category_ids = [];
    city_ids = current_cities.map((single_city) => single_city.value);
    category_ids = current_categories.map(
      (single_status) => single_status.value
    );
    let url =
      servicePath +
      "/api/v2/csv_reports/technician_jobs_report.xlsx?technician_code=" +
      match.params.id;
    if (value2 !== undefined && value2 !== "") {
      url += "&date_range=" + value2;
    }

    window.open(url, "_blank");
  };

  render_technician_categories = (category_id, categories) => {
    let self = this;
    let technician_categories_html = [];
    categories.map((single_category) => {
      single_category.technicians.map((single_technician) => {
        if (category_id === single_category.service_category_id) {
          technician_categories_html.push(
            <>
              <td style={{ width: "23%", textAlign: "center" }}>
                <b>{single_technician.technician_category_count}</b>
              </td>
              <td style={{ width: "23%", textAlign: "center" }}>
                <b>{single_technician.technician_category_job_total_amount}</b>
              </td>
              <td style={{ width: "22%", textAlign: "center" }}>
                <b>
                  {single_technician.technician_category_job_travel_charges}
                </b>
              </td>
              <td style={{ width: "23%", textAlign: "center" }}>
                <b>{single_technician.technician_category_revenue}</b>
              </td>
            </>
          );
        }
      });
    });

    return technician_categories_html;
  };

  render_services_individual_data = (single_category_id) => {
    const { again_categories } = this.state;
    let services_data_html = [];
    again_categories.map((single_category) => {
      if (single_category.service_category_id === single_category_id) {
        single_category.services.map((single_service) => {
          services_data_html.push(
            <table style={{ width: "100%" }}>
              <tr style={{ display: "flex", width: "100%" }}>
                <td
                  style={{
                    width: "12%",
                    // padding: "4px 10px 4px 20px",
                    verticalAlign: "middle",
                  }}
                >
                  {single_service.service_title}
                </td>
                {this.render_services_count_data(
                  single_service.service_id,
                  single_category_id
                )}
              </tr>
            </table>
          );
        });
      }
    });
    return services_data_html;
  };

  render_services_count_data = (service_id, single_category_id) => {
    const { again_categories } = this.state;
    let services_data_html = [];
    again_categories.map((single_category) => {
      if (single_category.service_category_id === single_category_id) {
        single_category.services.map((single_service) => {
          if (single_service.service_id === service_id) {
            single_service.technicians.map((single_technician) => {
              services_data_html.push(
                <>
                  <td style={{ width: "20%", textAlign: "center" }}>
                    {single_technician.technician_service_count}
                  </td>
                  <td style={{ width: "20%", textAlign: "center" }}>
                    {single_technician.technician_service_job_total_amount}
                  </td>
                  <td style={{ width: "20%", textAlign: "center" }}>
                    {single_technician.technician_service_job_travel_charges}
                  </td>
                  <td style={{ width: "20%", textAlign: "center" }}>
                    {single_technician.technician_service_revenue}
                  </td>
                </>
              );
            });
          }
        });
      }
    });
    return services_data_html;
  };

  render_table_data = (categories) => {
    let self = this;
    let table_data = [];
    categories.forEach((single_category) => {
      table_data.push(
        <tr style={{ display: "flex", width: "100%" }}>
          <details style={{ width: "100%" }}>
            <summary>
              <span>
                <strong>{single_category.service_category_title}</strong>
              </span>
              <table style={{ width: "100%" }}>
                <tr style={{ display: "flex", width: "100%" }}>
                  {self.render_technician_categories(
                    single_category.service_category_id,
                    categories
                  )}
                </tr>
              </table>
            </summary>
            <table style={{ width: "100%" }}>
              <tr>
                {this.render_services_individual_data(
                  single_category.service_category_id
                )}
              </tr>
            </table>
          </details>
        </tr>
      );
    });
    return table_data;
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
                    <tr style={{ display: "flex", width: "100%" }}>
                      <th
                        style={{
                          width: "20%",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          height: "83.06px",
                        }}
                      >
                        Categories
                      </th>
                      <th
                        style={{
                          width: "20%",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          height: "83.06px",
                        }}
                      >
                        Total Services
                      </th>
                      <th
                        style={{
                          width: "20%",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          height: "83.06px",
                        }}
                      >
                        Total Amount
                      </th>
                      <th
                        style={{
                          width: "20%",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          height: "83.06px",
                        }}
                      >
                        Travel Charges
                      </th>
                      <th
                        style={{
                          width: "20%",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          height: "83.06px",
                        }}
                      >
                        Revenue
                      </th>
                    </tr>
                  </thead>
                </Table>
                <Table>
                  <tbody>{this.render_table_data(selectedItems)}</tbody>
                </Table>
              </div>
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
