import React, { Component } from "react";
import { Row, Label, Table, Button, Input } from "reactstrap";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import { DateRangePicker } from "element-react";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { trackPromise } from "react-promise-tracker";

class Referrals extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    let city_ids_orders = sessionStorage.getItem("city_ids_refferal");
    let date_ranges = sessionStorage.getItem("date_ranges");

    if (city_ids_orders === null) {
      city_ids_orders = [];
    } else {
      city_ids_orders = JSON.parse(city_ids_orders);
    }

    if (date_ranges === null) {
      date_ranges = "";
    }

    this.state = {
      activePage: 1,
      col_size: "3",
      date_col_size: "0",
      totalItemCount: 0,
      users_data: {},
      all_cities: [],
      all_cities_json: [],
      value2: date_ranges,
      select_cities_value: city_ids_orders,
      response_status: true,
      filter_date: "",
      filter_dates: [
        { label: "Last Month", value: "previous_month" },
        // { label: "Last 3 Month", value: "previous_3_month" },
        { label: "Date Filter", value: "date" },
      ],
    };
  }

  async componentDidMount() {
    const { activePage } = this.state;
    let users_data = await this.get_all_referrals(activePage);
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    this.setState({
      users_data: users_data,
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
    });
  }

  cities_dropdown_json = (all_cities) => {
    let cities_dropdown_data = [];
    if (all_cities !== undefined && all_cities.length) {
      all_cities.forEach(function (currentValue) {
        cities_dropdown_data.push({
          label: currentValue.city_name,
          value: currentValue.id,
          key: currentValue.id,
        });
      });
    }
    return cities_dropdown_data;
  };

  prepareRequestURL = (page_num) => {
    const { activePage, value2, select_cities_value, filter_date } = this.state;
    let city_ids = [];
    let url = "";

    if (page_num === undefined) {
      page_num = activePage;
    }
    city_ids = select_cities_value.map((single_city) => single_city.value);
    url +=
      servicePath +
      "/api/v2/referral_analytics.json?is_all=true&page=" +
      page_num;

    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }

    if (filter_date !== "date") {
      url += "&filter_date=" + filter_date;
    } else if (filter_date === "date" && value2 !== null && value2 !== "") {
      url += "&filter_date=" + value2;
    } else {
      url += "&filter_date=previous_month";
    }

    return url;
  };

  get_all_referrals = async (page_num) => {
    let self = this;
    let users_data = {};
    let paging_data = {};
    let url = null;

    url = this.prepareRequestURL(page_num);

    await trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        users_data = response.data.users;
        paging_data = response.data.paging_data;

        self.setState({
          response_status: true,
          users_data: users_data,
          activePage: paging_data.page,
          totalItemCount: paging_data.total_records,
        });
      })
      .catch((error) => {
        users_data = error.response.data.message;
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    return users_data;
  };

  clear_form = async (event) => {
    sessionStorage.removeItem("city_ids_refferal");
    sessionStorage.removeItem("date_ranges");

    this.state.select_cities_value = [];
    this.state.value2 = "";
    window.location.reload();
  };

  render_user_row = () => {
    const { users_data } = this.state;
    let single_user_row_html = [];
    if (users_data.length > 0) {
      users_data.forEach(function (single_user, index) {
        let client_name = "";

        if (single_user.first_name === null) {
          client_name = "Guest User";
        } else {
          client_name = single_user.first_name + " " + single_user.last_name;
        }

        single_user_row_html.push(
          <>
            <tr data={single_user.id}>
              <td> {client_name} </td>
              <td> {single_user.city_name} </td>
              <td> {single_user.phone} </td>
              <td> {single_user.referred_users_count} </td>
            </tr>
          </>
        );
      });
    }

    return single_user_row_html;
  };

  render_table_heading = () => {
    let table_heading_html = (
      <>
        <thead>
          <tr>
            <th> Name</th>
            <th> City</th>
            <th> Phone</th>
            <th> Referred users</th>
          </tr>
        </thead>
      </>
    );
    return table_heading_html;
  };

  render_users_table = () => {
    let users_table_html = (
      <Table bordered style={{ backgroundColor: "white" }}>
        {this.render_table_heading()}
        <tbody>{this.render_user_row()}</tbody>
      </Table>
    );

    return users_table_html;
  };

  set_cities_dropdown = (city) => {
    sessionStorage.setItem("city_ids_refferal", JSON.stringify(city));
    this.setState({
      select_cities_value: city,
    });
  };

  search_referral = async (event) => {
    event.preventDefault();
    const { response_status } = this.state;

    let self = this;
    let search_key = event.target.elements["search_key"].value;
    let search_val = event.target.elements["search_value"].value;
    let url = "";

    url =
      servicePath +
      "/api/v2/referral_analytics.json?is_all=true&search_key=" +
      search_key +
      "&search_value=" +
      search_val;

    if (response_status === true) {
      self.setState(
        {
          response_status: false,
        },
        async () => {
          await trackPromise(
            axios({
              method: "get",
              url: url,
              headers: {
                "Content-Type": "application/json",
                "AUTH-TOKEN": localStorage.getItem("auth_token"),
              },
            })
          )
            .then((response) => {
              let paging_data = {};
              paging_data = response.data.paging_data;

              self.setState({
                response_status: true,
                users_data: response.data.users,
                activePage: paging_data.page,
                totalItemCount: paging_data.total_records,
              });

              if (response.data.users.length == 0) {
                NotificationManager.error(
                  "No Record Found",
                  "",
                  5000,
                  () => {},
                  null,
                  "filled"
                );
              }
            })
            .catch((error) => {
              NotificationManager.error(
                error.response.data.message,
                "",
                5000,
                () => {},
                null,
                "filled"
              );
              console.log("error", error);
            });
        }
      );
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    let self = this;
    const { response_status } = this.state;

    if (response_status === true) {
      self.setState(
        {
          response_status: false,
        },
        async () => {
          let users_data = await this.get_all_referrals(1);
          self.setState({
            users_data: users_data,
            response_status: true,
          });
        }
      );
    }
  };

  render_search_bar = () => {
    const search_parms = [
      { label: "Phone", value: "phone_number", key: 0 },
      { label: "Client ID", value: "client_id", key: 1 },
    ];

    return (
      <>
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.search_referral} id="referral_filter">
              <Row>
                <Colxx xxs="1">
                  <Label className="mt-2">
                    <strong>Search</strong>
                  </Label>
                </Colxx>
                <Colxx xxs="2">
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select"
                    name="search_key"
                    defaultValue={{
                      label: "Phone",
                      value: "phone_number",
                      key: 0,
                    }}
                    options={search_parms}
                  />
                </Colxx>
                <Colxx xxs="2">
                  <Input
                    className="form-control"
                    name="search_value"
                    type="number"
                    min={0}
                    required
                  />
                </Colxx>
                <Colxx xxs="1">
                  <Button color="primary" size="sm" type="submit">
                    Search
                  </Button>
                </Colxx>
              </Row>
            </form>
          </Colxx>
        </Row>
      </>
    );
  };

  set_filter_date = (date) => {
    if (date.value === "date") {
      this.setState({
        filter_date: date.value,
        col_size: "2",
        date_col_size: "3",
      });
    } else {
      this.setState({
        filter_date: date.value,
        col_size: "2",
        date_col_size: "0",
      });
    }
  };

  render_top_nav = () => {
    const {
      all_cities_json,
      value2,
      select_cities_value,
      filter_dates,
      filter_date,
      col_size,
      date_col_size,
    } = this.state;
    let top_nav_html = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1> Referrals </h1>
            </div>
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        {this.render_search_bar()}
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.handleSubmit} id="referral_filter">
              <Row>
                <Colxx xxs="1">
                  <Label className="mt-2">
                    <strong>Filters</strong>
                  </Label>
                </Colxx>
                <Colxx md="2">
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select Date"
                    name="filter_dates"
                    onChange={this.set_filter_date}
                    options={filter_dates}
                  />
                </Colxx>
                <Colxx xxs={date_col_size}>
                  {filter_date === "date" ? (
                    <>
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
                              this.setState({ value2: date });
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
                    </>
                  ) : (
                    <></>
                  )}
                </Colxx>
                <Colxx xxs="3">
                  <Select
                    components={{ Input: CustomSelectInput }}
                    isMulti
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select City"
                    name="city_ids"
                    value={select_cities_value}
                    onChange={this.set_cities_dropdown}
                    options={all_cities_json}
                  />
                </Colxx>

                <Colxx xxs="1">
                  <Button color="primary" size="sm" type="submit">
                    Submit
                  </Button>
                </Colxx>
                <Colxx xxs="1">
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
        </Row>
      </>
    );

    return top_nav_html;
  };

  handlePageChange = async (pageNum) => {
    await this.get_all_referrals(pageNum);
  };

  render() {
    const { activePage, totalItemCount, users_data, response_status } =
      this.state;

    if (typeof users_data === "string") {
      return <>You are not authorized to access this page</>;
    } else {
      // if (Object.keys(users_data).length === 0 && response_status === true) {
      //     return <></>;
      // } else {
      return (
        <div>
          {this.render_top_nav()}
          <Row style={{ paddingTop: "10px" }}>{this.render_users_table()}</Row>
          <Pagination
            activePage={activePage}
            itemsCountPerPage={20}
            totalItemsCount={totalItemCount}
            delimeter={5}
            onChange={this.handlePageChange}
            styling="rounded_primary"
          />
        </div>
      );
      // }
    }
  }
}

export default Referrals;
