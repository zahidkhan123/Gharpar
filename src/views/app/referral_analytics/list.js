import React, { Component } from "react";
import { Row, Label, Table, Button } from "reactstrap";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import { trackPromise } from "react-promise-tracker";
import { CanvasJSChart } from "canvasjs-react-charts";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    let city_ids_orders = sessionStorage.getItem("city_ids_refferal_list");
    if (city_ids_orders === null) {
      city_ids_orders = [];
    } else {
      city_ids_orders = JSON.parse(city_ids_orders);
    }

    let date_ranges = sessionStorage.getItem("date_ranges");
    if (date_ranges === null) {
      date_ranges = "";
    }
    this.state = {
      users_data: {},
      startDate: "",
      all_cities: [],
      all_cities_json: [],
      value2: date_ranges,
      select_cities_value: city_ids_orders,
      response_status: true,
      filter_date: "",
      filter_dates: [
        { label: "By Month", value: "by_month" },
        // { label: "By Week", value: "by_week" },
      ],
    };
  }

  async componentDidMount() {
    let users_data = await this.get_top_referrals();
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

  prepareRequestURL = () => {
    const { value2, select_cities_value, filter_date } = this.state;
    let city_ids = select_cities_value.value;
    let url = servicePath + "/api/v2/referral_analytics.json?";

    if (city_ids !== undefined && city_ids !== "") {
      url += "&city_ids=" + city_ids;
    }

    if (filter_date !== "date") {
      url += "&filter_date=" + filter_date;
    } else if (filter_date === "date" && value2 !== null && value2 !== "") {
      url += "&filter_date=" + value2;
    } else {
      url += "&filter_date=by_month";
    }

    return url;
  };

  get_top_referrals = async () => {
    let self = this;
    let users_data = {};
    let referred_orders_data = [];
    let referred_users_data = [];
    let referred_orders_count = 0;
    let referred_users_count = 0;
    let url = null;

    url = this.prepareRequestURL();

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
        referred_orders_data = response.data.referred_orders_data;
        referred_users_data = response.data.referred_users_data;

        referred_orders_count = response.data.referred_orders_count;
        referred_users_count = response.data.referred_users_count;

        self.setState({
          response_status: true,
          options: {
            animationEnabled: true,
            exportEnabled: true,
            title: {
              text: "Referral Analysis",
              fontFamily: "verdana",
              fontSize: 20,
              horizontalAlign: "left",
              padding: 12,
            },
            axisY: {
              // title: "in Eur",
              includeZero: true,
              // prefix: "€",
              // suffix: "k"
            },
            toolTip: {
              shared: true,
              reversed: true,
            },
            legend: {
              verticalAlign: "center",
              horizontalAlign: "right",
              reversed: true,
              cursor: "pointer",
              itemclick: this.toggleDataSeries,
            },
            data: [
              {
                type: "stackedColumn",
                name: "Referred Orders",
                indexLabelFontSize: 10,
                showInLegend: true,
                yValueFormatString: "#,###",
                dataPoints: referred_orders_data,
              },
              {
                type: "stackedColumn",
                name: "Referred Users",
                indexLabelFontSize: 10,
                showInLegend: true,
                yValueFormatString: "#,###",
                dataPoints: referred_users_data,
              },
            ],
          },
          options2: {
            exportEnabled: true,
            animationEnabled: true,
            width: 567,
            height: 285,
            title: {
              text: "Overall Analysis",
              fontFamily: "verdana",
              fontSize: 20,
              horizontalAlign: "left",
              padding: 12,
            },
            data: [
              {
                type: "pie",
                startAngle: 10,
                toolTipContent: "<b>{label}</b>: {y}",
                showInLegend: "true",
                legendText: "{label}",
                indexLabelFontSize: 10,
                indexLabel: "{label} - {y}",
                dataPoints: [
                  { y: referred_orders_count, label: "Referred orders" },
                  { y: referred_users_count, label: "Referred users" },
                ],
              },
            ],
          },
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
    sessionStorage.removeItem("city_ids_refferal_list");
    sessionStorage.removeItem("date_ranges");

    this.state.select_status_value = [];
    this.state.select_cities_value = [];
    this.state.value2 = "";
    window.location.reload();
  };

  render_user_row = () => {
    const { users_data } = this.state;
    let single_user_row_html = [];

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
            <td>{client_name}</td>
            <td>{single_user.referred_users_count}</td>
          </tr>
        </>
      );
    });

    single_user_row_html.push(
      <>
        <tr>
          <td>
            <Link
              to={`/app/referral_analytics/referrals`}
              style={{
                textAlign: "center",
                display: "block",
                color: "#9393e0",
              }}
            >
              view all
            </Link>
          </td>
        </tr>
      </>
    );

    return single_user_row_html;
  };

  render_table_heading = () => {
    let table_heading_html = (
      <>
        <thead>
          <tr>
            <th className="text-center"> Top referrals</th>
          </tr>
        </thead>
      </>
    );
    return table_heading_html;
  };

  render_data = () => {
    let users_table_html = (
      <Table bordered style={{ backgroundColor: "white" }}>
        {this.render_table_heading()}
        <tbody>{this.render_user_row()}</tbody>
      </Table>
    );

    return users_table_html;
  };

  set_order_cities_dropdown = (city) => {
    sessionStorage.setItem("city_ids_refferal_list", JSON.stringify(city));
    this.setState({
      select_cities_value: city,
    });
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
          let users_data = await this.get_top_referrals(1);
          self.setState({
            users_data: users_data,
            response_status: true,
          });
        }
      );
    }
  };

  set_filter_date = (date) => {
    this.setState({
      filter_date: date.value,
    });
  };

  render_top_nav = () => {
    const {
      all_cities_json,
      value2,
      select_cities_value,
      filter_dates,
      filter_date,
    } = this.state;
    let top_nav_html = (
      <>
        <Row>
          <Colxx xxs="12">
            {/* <form onSubmit={this.filterOrders} id="order-filter"> */}
            <form onSubmit={this.handleSubmit} id="order-filter">
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
                    defaultValue={{
                      label: "By Month",
                      value: "by_month",
                      key: 0,
                    }}
                  />
                </Colxx>

                <Colxx xxs="2">
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select City"
                    name="city_ids"
                    value={select_cities_value}
                    onChange={this.set_order_cities_dropdown}
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

  render() {
    const { users_data, response_status, options, options2 } = this.state;
    if (typeof users_data === "string") {
      return <>You are not authorized to access this page</>;
    } else {
      if (Object.keys(users_data).length === 0 && response_status === true) {
        return <></>;
      } else {
        return (
          <div>
            {this.render_top_nav()}
            <div>
              <Row style={{ paddingTop: "10px" }}>
                <CanvasJSChart options={options} />
              </Row>
            </div>
            <div style={{ paddingTop: "10px" }}>
              <Row>
                <Colxx xxs="3">{this.render_data()}</Colxx>
                <Colxx xxs="9">
                  <CanvasJSChart options={options2} />
                </Colxx>
              </Row>
            </div>
          </div>
        );
      }
    }
  }
}

export default DataListPages;
