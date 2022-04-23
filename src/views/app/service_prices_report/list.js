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
    };
  }

  componentDidMount = async () => {
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
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
    let self = this;
    let url = servicePath + "/api/v2/reports/service_prices_report.json?";
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
          selectedItems: response.data.service_categories,
          activePage: pageNum,
          current_category: response.data.service_categories[0],
          // totalItemCount: response.data.paging_data.total_records,
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
              <h1>Service Prices Report</h1>
            </div>
          </Colxx>
          {selectedItems.length ? (
            <>
              <Colxx md="2" className="text-right mt-2">
                {/* <h3>Count: {totalItemCount}</h3> */}
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
      </>
    );
    return heading;
  };

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);
  };

  // csv_export_data = async () => {
  //   let url = servicePath + "/api/v2/csv_reports/service_prices_report.csv";

  //   // Change this to use your HTTP client
  //   fetch(url, {
  //     "AUTH-TOKEN": localStorage.getItem("auth_token"),
  //   }) // FETCH BLOB FROM IT
  //     .then((response) => response.blob())
  //     .then((blob) => {
  //       // RETRIEVE THE BLOB AND CREATE LOCAL URL
  //       var _url = window.URL.createObjectURL(blob);
  //       window.open(_url, "_blank").focus(); // window.open + focus
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  csv_export_data = async () => {
    let self = this;
    let url = servicePath + "/api/v2/csv_reports/service_prices_report.xlsx";
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

  render_service_prices = (all_services) => {
    let service_prices_html = [];
    all_services.map((single_service) => {
      service_prices_html.push(
        <>
          <td>{single_service.price}</td>
        </>
      );
    });
    return service_prices_html;
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
            {/* <td>{single_service.price}</td> */}
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
            {/* <th>Price</th> */}
          </thead>
          <tbody>{self.render_services_data(all_services)}</tbody>
        </Table>
      </>
    );

    return service_detail_html;
  };

  render_table_data = (current_category) => {
    let self = this;
    let table_data = [];
    current_category.services.map((single_service) => {
      table_data.push(
        <tr>
          <td>{single_service.service_title}</td>
          {self.render_service_prices(single_service.service_cities)}
          <td>
            <Popover
              placement="bottom"
              title="Service Details"
              width="400"
              trigger="click"
              content={self.set_service_details(single_service.service_cities)}
            >
              <u>
                <a style={{ color: "blue" }}>Service Details</a>
              </u>
            </Popover>
          </td>
        </tr>
      );
    });
    return table_data;
  };

  render_all_cities_header = () => {
    const { all_cities } = this.state;
    let cities_html = [];
    all_cities.map((singleCity) => {
      cities_html.push(
        <>
          <th>{singleCity.city_name}</th>
        </>
      );
    });
    return cities_html;
  };

  render_category_tabs = (all_categories) => {
    const { current_category } = this.state;
    let category_tabs_data = [];
    all_categories.map((singleCategory) => {
      if (singleCategory.services.length) {
        category_tabs_data.push(
          <Tabs.Pane
            label={singleCategory.service_category_title}
            name={singleCategory.service_category_title}
          >
            <Colxx xxs="12">
              <Card className="mb-4">
                <CardBody>
                  <Table striped className="text-center">
                    <thead>
                      <tr>
                        <th>Service</th>
                        {this.render_all_cities_header()}
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>{this.render_table_data(current_category)}</tbody>
                  </Table>
                </CardBody>
              </Card>
            </Colxx>
          </Tabs.Pane>
        );
      }
    });
    return category_tabs_data;
  };

  get_services_by_categories = (event, category_name) => {
    const { selectedItems } = this.state;
    let current_category = [];
    selectedItems.map((singleCategory) => {
      if (singleCategory.service_category_title === category_name) {
        current_category = singleCategory;
      }
    });
    this.setState({
      current_category: current_category,
    });
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
                <Tabs
                  activeName={selectedItems[0].service_category_title}
                  onTabClick={(tab) => {
                    this.get_services_by_categories(tab, tab.props.name);
                  }}
                >
                  {self.render_category_tabs(selectedItems)}
                </Tabs>
                {/* <Table striped className="text-center">
                  <thead>
                    <tr>
                      <th>Categories</th>
                      <th>Details</th>
                      <th>Services</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>{this.render_table_data(selectedItems)}</tbody>
                </Table> */}
                {/* <Table striped className="text-center">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Category</th>
                      {this.render_all_cities_header()}
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>{this.render_table_data(selectedItems)}</tbody>
                </Table> */}
              </div>
              {/* <Pagination
                activePage={activePage}
                itemsCountPerPage={20}
                totalItemsCount={totalItemCount}
                delimeter={5}
                onChange={this.handlePageChange}
                styling="rounded_primary"
              /> */}
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
