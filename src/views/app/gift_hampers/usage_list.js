import React, { Component } from "react";
import { Row, Label, Table, Button, Input } from "reactstrap";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import Pagination from "reactive-pagination";
import { Link } from "react-router-dom";
import "reactive-pagination/dist/index.css";
import { trackPromise } from "react-promise-tracker";

class UsageList extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");
    const { match } = this.props;

    let city_ids_orders = sessionStorage.getItem("city_ids_orders");

    if (city_ids_orders === null) {
      city_ids_orders = [];
    } else {
      city_ids_orders = JSON.parse(city_ids_orders);
    }

    this.state = {
      activePage: 1,
      totalItemCount: 0,
      gift_hamper_id: match.params.id,
      users_data: {},
      all_cities: [],
      all_cities_json: [],
      select_cities_value: city_ids_orders,
      response_status: true,
    };
  }

  async componentDidMount() {
    const { activePage, gift_hamper_id } = this.state;

    let users_data = await this.get_gift_hamper_usage_list(
      gift_hamper_id,
      activePage
    );
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

  prepareRequestURL = (gift_hamper_id, page_num) => {
    const { activePage, select_cities_value } = this.state;
    let city_ids = [];
    let url = "";

    if (page_num === undefined) {
      page_num = activePage;
    }
    city_ids = select_cities_value.map((single_city) => single_city.value);
    url +=
      servicePath +
      "/api/v2/gift_hampers/" +
      gift_hamper_id +
      "/usage_list.json?page=" +
      page_num;

    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }

    return url;
  };

  get_gift_hamper_usage_list = async (gift_hamper_id, page_num) => {
    let self = this;
    let users_data = {};
    let paging_data = {};
    let url = null;

    url = this.prepareRequestURL(gift_hamper_id, page_num);

    await trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        users_data = response.data.gift_hamper_usage_list;
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
    sessionStorage.removeItem("city_ids_orders");
    this.state.select_cities_value = [];
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
            <tr data={single_user.id} style={{ textAlign: "center" }}>
              <td>
                {" "}
                <Link to={`/app/orders/show/${single_user.id}`}>
                  {single_user.id}
                </Link>{" "}
              </td>
              <td> {client_name} </td>
              <td> {single_user.city_name} </td>
              <td> {single_user.phone} </td>
              <td> {single_user.order_date} </td>
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
          <tr style={{ textAlign: "center" }}>
            <th> Order#</th>
            <th> Name</th>
            <th> City</th>
            <th> Phone</th>
            <th> Order Date</th>
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
    sessionStorage.setItem("city_ids_orders", JSON.stringify(city));
    this.setState({
      select_cities_value: city,
    });
  };

  search_gift_hamper_usage = async (event) => {
    event.preventDefault();
    const { response_status, gift_hamper_id } = this.state;

    let self = this;
    let search_key = event.target.elements["search_key"].value;
    let search_val = event.target.elements["search_value"].value;
    let url = "";
    let paging_data = {};
    let users_data = {};

    url =
      servicePath +
      "/api/v2/gift_hampers/" +
      gift_hamper_id +
      "/usage_list.json?search_key=" +
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
                "IS-ACCESSIBLE": true,
              },
            })
          )
            .then((response) => {
              paging_data = response.data.paging_data;
              users_data = response.data.gift_hamper_usage_list;

              self.setState({
                response_status: true,
                users_data: users_data,
                activePage: paging_data.page,
                totalItemCount: paging_data.total_records,
              });
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

  render_top_nav = () => {
    const { all_cities_json, select_cities_value } = this.state;
    let top_nav_html = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1> Gift Hamper Usage </h1>
            </div>
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        {/*{this.render_search_bar()}*/}
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.handleSubmit} id="gift_hamper_usage_filter">
              <Row>
                <Colxx xxs="1">
                  <Label className="mt-2">
                    <strong>Filters</strong>
                  </Label>
                </Colxx>

                <Colxx xxs="2">
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

  render_search_bar = () => {
    const search_parms = [{ label: "Phone", value: "phone_number", key: 0 }];

    return (
      <>
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.search_gift_hamper_usage} id="referral_filter">
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

  handlePageChange = async (pageNum) => {
      const { gift_hamper_id } = this.state;
      await this.get_gift_hamper_usage_list(gift_hamper_id, pageNum);
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
          <Row>
            <Colxx xxs="12">
              <div className="mb-2">
                <h1> Gift Hamper Usage </h1>
              </div>
              <Separator className="mb-5" />
            </Colxx>
          </Row>
          {/*{this.render_top_nav()}*/}
          {this.render_search_bar()}
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

export default UsageList;
