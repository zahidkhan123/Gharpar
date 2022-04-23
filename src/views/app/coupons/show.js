import React, { Component } from "react";
import { Card, CardBody, Table, Badge, Button, Row, Label } from "reactstrap";
import { Link } from "react-router-dom";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import { DateRangePicker } from "element-react";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import axios from "axios";

import moment from "moment";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { trackPromise } from "react-promise-tracker";

class DealShow extends Component {
  constructor(props) {
    super(props);

    let status_orders = sessionStorage.getItem("status_orders");
    if (status_orders === null) {
      status_orders = [];
    } else {
      status_orders = JSON.parse(status_orders);
    }

    this.state = {
      coupon: {},
      select_status_value: status_orders,
      order_statuses: [
        {
          label: "Completed",
          value: "Completed",
          key: 1,
        },
        {
          label: "Confirmed",
          value: "Confirmed",
          key: 2,
        },
        {
          label: "Pending",
          value: "Pending",
          key: 3,
        },
        {
          label: "Cancelled",
          value: "Cancelled",
          key: 4,
        },
      ],
    };
  }

  async componentDidMount() {
    let coupon = await this.fetch_coupon(1);
    let orders_data = coupon.orders;
    this.setState({
      coupon: coupon,
      orders_data: orders_data,
      // accordion: accordian_ids,
    });
  }
  toggleAccordion = (tab) => {
    const prevState = this.state.accordion;
    const state = prevState.map((x, index) => (tab === index ? !x : false));
    this.setState({
      accordion: state,
    });
  };

  fetch_coupon = async (pageNum) => {
    let coupon = {};
    const { match } = this.props;

    const { select_status_value, value2 } = this.state;
    let statuses = select_status_value.map(
      (single_status) => single_status.value
    );
    let url =
      servicePath +
      "/api/v2/coupons/" +
      match.params.id +
      ".json?page=" +
      pageNum;
    if (statuses.length) {
      url += "&statuses=" + statuses;
    }

    if (value2 !== "" && value2 !== null && value2 !== undefined) {
      url += "&order_date=" + value2;
    }

    await trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          coupon = response.data;
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

    return coupon;
  };

  capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  render_badge_unverified = (single_order) => {
    let badge_html = <> </>;

    if (
      single_order.client.is_cnic_verified === false &&
      single_order.client.approved_status === "Pending"
    ) {
      badge_html = (
        <>
          <Badge className="ml-2 badge-manual">
            <large style={{ color: "red" }}>Unverified User</large>
          </Badge>
        </>
      );
    }

    return badge_html;
  };

  handlePageChange = async (pageNum) => {
    let new_orders_data = [];
    this.state.response_status = false;

    new_orders_data = await this.fetch_coupon(pageNum);

    this.setState({
      response_status: true,
      activePage: pageNum,
      orders_data: new_orders_data.orders,
    });
  };

  render_badge = (single_order) => {
    let badge_html = <> </>;

    if (single_order.is_order_opened === false) {
      badge_html = (
        <>
          <Badge color="primary" className="ml-2">
            <small>NEW</small>
          </Badge>
        </>
      );
    }

    return badge_html;
  };

  clear_form = async (event) => {
    this.state.select_status_value = [];
    this.state.value2 = "";
    sessionStorage.removeItem("status_orders");

    let fetch_coupon = await this.fetch_coupon(1);

    this.setState({
      coupon: fetch_coupon,
      orders_data: fetch_coupon.orders,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { select_status_value, value2 } = this.state;
    let statuses = select_status_value.map(
      (single_status) => single_status.value
    );
    const { match } = this.props;
    let self = this;
    let url =
      servicePath + "/api/v2/coupons/" + match.params.id + ".json?page=" + 1;
    if (statuses.length) {
      url += "&statuses=" + statuses;
    }

    if (value2 !== "" && value2 !== null) {
      url += "&order_date=" + value2;
    }

    await trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            coupon: response.data,
            orders_data: response.data.orders,
            activePage: 1,
          });
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
  };

  render_table_heading = () => {
    let table_heading_html = (
      <>
        <thead>
          <tr>
            <th> Client </th>
            <th> Order ID </th>
            <th> Status </th>
            <th> Requested Date/Time </th>
            <th> Gender </th>
            <th> City </th>
            <th> Locked by </th>
            <th> Amount </th>
            <th> Created At </th>
            <th> Device </th>
            {/* <th> Reason </th> */}
            {/* <th> Action </th> */}
          </tr>
        </thead>
      </>
    );
    return table_heading_html;
  };

  render_order_row = () => {
    const { orders_data } = this.state;
    let single_order_row_html = [];
    let self = this;

    orders_data.forEach(function (single_order, index) {
      let client_name = "";

      if (single_order.client.first_name === null) {
        client_name = "Guest User";
      } else {
        client_name =
          single_order.client.first_name + " " + single_order.client.last_name;
      }

      single_order_row_html.push(
        <>
          <tr data={single_order.id}>
            <td>
              <Link
                to={`/app/orders/show/${single_order.id}`}
                // target="_blank"
                // onClick={() =>
                //   check_permission(
                //     "orders/show",
                //     `/app/orders/show/${single_order.id}`
                //   )
                // }
                className="w-40 w-sm-100"
              >
                <p className="list-item-heading mb-1 truncate">
                  <Label> {client_name} </Label>
                  {self.render_badge(single_order)}
                </p>
                <Badge color="secondary" pill className="mb-1">
                  {single_order.client.membership_code ||
                    single_order.client?.user_details?.membership_code}
                </Badge>
                {self.render_badge_unverified(single_order)}
              </Link>
            </td>
            <td> {single_order.custom_order_id} </td>
            <td> {single_order.status} </td>
            <td>
              {moment(single_order.order_date).format("MMM D, YYYY") +
                " " +
                single_order.order_time}
            </td>
            <td> {single_order.client.gender} </td>
            <td> {single_order.address.city.city_name} </td>
            <td>
              {single_order.redis_order_status
                ? single_order.redis_order_first_name +
                  " " +
                  single_order.redis_order_last_name
                : "None"}
            </td>
            <td> {single_order.total_price} </td>
            <td>{moment(single_order.created_at).format("MMM D, YYYY LT")}</td>
            <td>{single_order.device_type}</td>
            {/* <td>
              {single_order.status === "Pending" ||
              single_order.status === "Confirmed" ? (
                <>
                  <Link
                    // to={`/app/orders/edit_order/${single_order.id}`}
                    onClick={() =>
                      check_permission(
                        "orders/update",
                        `/app/orders/edit_order/${single_order.id}`
                      )
                    }>
                    <Button
                      className="btn-success mr-2 ml-2 user-show-btns"
                      size="sm">
                      {" "}
                      Edit{" "}
                    </Button>
                  </Link>
                </>
              ) : (
                <></>
              )}
            </td> */}
          </tr>
        </>
      );
    });

    return single_order_row_html;
  };
  set_order_status_dropdown = (status) => {
    sessionStorage.setItem("status_orders", JSON.stringify(status));
    this.setState({
      select_status_value: status,
    });
  };

  render() {
    const { coupon, activePage, value2, order_statuses, select_status_value } =
      this.state;
    if (Object.keys(coupon).length === 0) {
      return <></>;
    } else {
      return (
        <div>
          <Row className="mt-3">
            <Colxx md="12">
              <Card>
                <CardBody>
                  <Row>
                    <Colxx md="12">
                      <Row className="mt-3">
                        <Table>
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Code</th>
                              <th>Discount Value-Type </th>
                              <th>Spend Min-Max</th>
                              <th>Limits</th>
                              <th>Pending</th>
                              <th>Confirmed</th>
                              <th>Completed</th>
                              <th>Cancelled</th>
                              <th>Actual Price</th>
                              <th>Coupon Discount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{coupon.coupon_title}</td>
                              <td>{coupon.coupon_code}</td>
                              <td>
                                {coupon.discount_value} - {coupon.discount_type}
                              </td>
                              <td>
                                {coupon.min_spend} - {coupon.max_spend}
                              </td>
                              <td>
                                {coupon.usage_per_user_limit} -{" "}
                                {coupon.usage_coupon_limit}
                              </td>
                              <td>{coupon.pending_orders_count}</td>
                              <td>{coupon.confirmed_orders_count}</td>
                              <td>{coupon.completed_orders_count}</td>
                              <td>{coupon.cancelled_orders_count}</td>
                              <td>{coupon.actual_price}</td>
                              <td>{coupon.coupon_discount}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Row>
                    </Colxx>
                  </Row>
                </CardBody>
              </Card>
            </Colxx>
            <h1 className="pl-3 pt-2">Orders</h1>
            <Colxx xxs="12">
              {/* <form onSubmit={this.filterOrders} id="order-filter"> */}
              <form onSubmit={this.handleSubmit} id="order-filter">
                <Row>
                  <Colxx xxs="1">
                    <Label className="mt-2">
                      <strong>Filters</strong>
                    </Label>
                  </Colxx>
                  <Colxx xxs="3">
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
                  </Colxx>
                  <Colxx xxs="3">
                    <Select
                      components={{ Input: CustomSelectInput }}
                      isMulti
                      className="react-select"
                      classNamePrefix="react-select"
                      placeholder="Status"
                      name="statuses"
                      value={select_status_value}
                      onChange={this.set_order_status_dropdown}
                      options={order_statuses}
                    />
                  </Colxx>
                  {/* {this.render_status_filter()} */}
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
            <Colxx xxs="12" className="mt-2">
              <Card className="mb-4">
                <CardBody>
                  <Table>
                    {this.render_table_heading()}
                    <tbody>{this.render_order_row()}</tbody>
                  </Table>
                  <Pagination
                    activePage={activePage}
                    itemsCountPerPage={20}
                    totalItemsCount={coupon.paging_data.total_records}
                    delimeter={5}
                    onChange={this.handlePageChange}
                    styling="rounded_primary"
                  />
                  {/* {this.render_pagination_buttons()} */}
                </CardBody>
              </Card>
            </Colxx>
          </Row>
        </div>
      );
    }
  }
}

export default React.memo(DealShow);
