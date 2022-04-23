import React, { Component } from "react";
import {
  Row,
  Label,
  Card,
  CardBody,
  Table,
  Button,
  Input,
  Badge,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { check_permission } from "../../../helpers/Utils";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import { Popover } from "element-react";
import { Tabs, DateRangePicker } from "element-react";
import GiftBox from "../../../assets/images/giftbox.png";
import GiftBoxsmall from "../../../assets/images/gift_order_show.png";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import moment from "moment";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { trackPromise } from "react-promise-tracker";
import "./start.css";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    let city_ids_orders = sessionStorage.getItem("city_ids_orders");
    if (city_ids_orders === null) {
      city_ids_orders = [];
    } else {
      city_ids_orders = JSON.parse(city_ids_orders);
    }

    let tag_ids_order = sessionStorage.getItem("tag_ids_order");
    if (tag_ids_order === null) {
      tag_ids_order = [];
    } else {
      tag_ids_order = JSON.parse(tag_ids_order);
    }

    let status_ids_orders = sessionStorage.getItem("status_ids_orders");
    if (status_ids_orders === null) {
      status_ids_orders = [];
    } else {
      status_ids_orders = JSON.parse(status_ids_orders);
    }

    let date_orders = sessionStorage.getItem("date_orders");
    if (date_orders === null) {
      date_orders = "";
    }
    this.state = {
      activePage: 1,
      col_size: "2",
      date_col_size: "0",
      selectedPageSize: 10,
      currentPage: 1,
      totalItemCount: 0,
      totalPage: 1,
      search: "",
      orders_data: {},
      startDate: "",
      all_cities: [],
      all_cities_json: [],
      order_data_by_status: [],
      value2: date_orders,
      select_status_value: status_ids_orders,
      select_cities_value: city_ids_orders,
      select_tag_values: tag_ids_order,
      activeTab: "All",
      response_status: true,
      toggle_tags_modal: false,
      orders_found: true,
      current_tag: {},
      order_date: "previous_month",
      order_dates: [
        { label: "Last Month", value: "previous_month" },
        { label: "Last 3 Month", value: "previous_3_month" },
        { label: "Date Filter", value: "date" },
      ],
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
        {
          label: "In Process",
          value: "In_process",
          key: 5,
        },
      ],
    };
  }

  async componentDidMount() {
    const { currentPage } = this.state;
    let orders_data = await this.get_all_orders(currentPage);
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);
    let order_tags = await this.get_all_order_tags();
    let tags_dropdown_data = this.tags_dropdown_json(order_tags);
    this.setState({
      activeTab: "All",
      orders_data: orders_data,
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
      order_tags: order_tags,
      tags_dropdown_data: tags_dropdown_data,
    });

    // document.getElementsByName("Pending")[0].click();
  }

  get_all_cities = async () => {
    let all_cities = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/cities.json",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          all_cities = response.data.sort(
            (a, b) => parseInt(a.id) - parseInt(b.id)
          );
        } else {
          console.log(response);
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

    return all_cities;
  };

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

  get_all_order_tags = async () => {
    let all_tags = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/tags.json",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          all_tags = response.data.tags;
        } else {
          console.log(response);
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

    return all_tags;
  };
  tags_dropdown_json = (all_tags) => {
    let tags_dropdown_data = [];
    all_tags.forEach(function (currentValue) {
      tags_dropdown_data.push({
        label: currentValue.tag_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return tags_dropdown_data;
  };

  toggle_tags_modal = async (event, order) => {
    let result = await check_permission("tags/apply_tag", "");
    if (result) {
      if (order.id !== undefined) {
        let tag_name = document
          .getElementById(`${order.id}`)
          .getAttribute("tag_name");
        let tag_id = parseInt(
          document.getElementById(`${order.id}`).getAttribute("tag_id")
        );
        if (this.state.toggle_tags_modal === false) {
          this.setState({
            toggle_tags_modal: !this.state.toggle_tags_modal,
            current_tag: {
              id: tag_id,
              tag_name: tag_name,
              order_id: order.id,
            },
          });
        }
      }
    }
  };

  toggle_close_tag_modal = () => {
    this.setState({
      toggle_tags_modal: !this.state.toggle_tags_modal,
    });
  };

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
    const {
      currentPage,
      value2,
      select_cities_value,
      select_status_value,
      select_tag_values,
      order_date,
    } = this.state;
    if (page_num === undefined) {
      page_num = currentPage;
    }

    let city_ids = [];
    let statuses = [];
    let tag_ids = [];
    city_ids = select_cities_value.map((single_city) => single_city.value);
    tag_ids = select_tag_values.map((single_tag) => single_tag.value);
    statuses = select_status_value.map((single_status) => single_status.value);

    let url =
      servicePath +
      "/api/v2/orders.json?page=" +
      page_num +
      "&default_role=admin";

    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }

    if (statuses.length) {
      url += "&statuses=" + statuses;
    }

    if (select_tag_values.length) {
      url += "&tag_ids=" + tag_ids;
    }

    if (order_date !== "date") {
      url += "&order_date=" + order_date;
    } else if (order_date === "date" && value2 !== null && value2 !== "") {
      url += "&order_date=" + value2;
    } else {
      url += "&order_date=previous_month";
    }

    return url;
  };

  get_all_orders = async (page_num) => {
    let self = this;
    let orders_data = {};
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
        orders_data = response.data;
        self.setState({
          response_status: true,
        });
      })
      .catch((error) => {
        orders_data = error.response.data.message;
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

    return orders_data;
  };

  handleChangeDate = (date) => {
    this.setState({
      startDate: date,
    });
  };

  clear_form = async (event) => {
    sessionStorage.removeItem("city_ids_orders");
    sessionStorage.removeItem("status_ids_orders");
    sessionStorage.removeItem("date_orders");
    sessionStorage.removeItem("tag_ids_order");

    this.state.select_status_value = [];
    this.state.select_cities_value = [];
    this.state.value2 = "";
    this.state.select_tag_values = [];
    window.location.reload();
  };

  render_order_by_status = () => {
    const { orders_data } = this.state;
    let self = this;
    let single_order_row_html = [];

    if (orders_data.length !== 0) {
      orders_data.orders.forEach(function (single_order, index) {
        let client_name = "";

        if (single_order.client.first_name === null) {
          client_name = "Guest User";
        } else {
          client_name =
            single_order.client.first_name +
            " " +
            single_order.client.last_name;
        }

        single_order_row_html.push(
          <>
            <tr data={single_order.custom_order_id}>
              <td>
                <Link
                  to={`/app/orders/show/${single_order.id}`}
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
              <td>
                {single_order.custom_order_id}
                {single_order.is_gift_avail ? (
                  <>
                    <p>
                      <img src={GiftBoxsmall} alt="" width="60%" />
                    </p>{" "}
                  </>
                ) : (
                  <></>
                )}
              </td>
              <td>{single_order.status} </td>
              <td>{single_order.order_time + " " + single_order.order_date}</td>
              <td>{single_order.client.gender} </td>
              <td>{single_order.address.city.city_name} </td>
              <td> </td>
              <td>
                {single_order.redis_order_status
                  ? single_order.redis_order_first_name +
                    " " +
                    single_order.redis_order_last_name
                  : "None"}
              </td>
              <td> {single_order.total_price} </td>
              <td> {single_order.created_at} </td>
              <td>{single_order.device_type}</td>
              {/* <td>
                <Popover
                  placement="bottom"
                  title="Reason:"
                  width="500"
                  trigger="click"
                  content={self.set_reason(single_order)}>
                  <u>
                    <a style={{ color: "blue" }}>Reason</a>
                  </u>
                </Popover>
              </td> */}
              <div style={{ display: "flex" }}>
                <td>
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
                        }
                      >
                        <Button
                          className="btn-success mr-2 ml-2 user-show-btns"
                          size="sm"
                        >
                          {" "}
                          Edit{" "}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <></>
                  )}
                </td>
              </div>
            </tr>
          </>
        );
      });

      return single_order_row_html;
    }
  };

  get_order_by_status = async (event, status) => {
    const {
      order_statuses,
      value2,
      select_cities_value,
      response_status,
      order_date,
      select_tag_values,
    } = this.state;
    let self = this;
    let order_data_by_status = {};

    let url = servicePath + "/api/v2/orders.json?&default_role=admin";

    if (status === "All") {
      url += "&order_date=previous_month";
      // Do Nothing
    } else {
      url += "&statuses=" + status;
    }

    // if (select_tag_value.value !== undefined) {
    //   url += "&tag_id=" + select_tag_value.value;
    // }

    if (order_date !== "date") {
      url += "&order_date=" + order_date;
    } else if (order_date === "date" && value2 !== null && value2 !== "") {
      url += "&order_date=" + value2;
    } else {
      url += "&order_date=previous_month";
    }

    let city_ids = [];
    city_ids = select_cities_value.map((single_city) => single_city.value);

    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }
    let tag_ids = [];
    city_ids = select_tag_values.map((single_tag) => single_tag.value);

    if (city_ids.length) {
      url += "&city_ids=" + tag_ids;
    }
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
              if (response.status === 200) {
                order_data_by_status = response.data;
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

          let current_order_status_json = order_statuses.filter(
            (single_status) => single_status.value === status
          );

          self.setState({
            currentPage: 1,
            activePage: 1,
            orders_data: order_data_by_status,
            activeTab: status,
            select_status_value: current_order_status_json,
            response_status: true,
          });
        }
      );
    }
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

  removeTag = async (event, order_id, tag_id) => {
    event.preventDefault();
    const { orders_data } = this.state;
    let tempOrders = orders_data;
    let order = {};
    let result = await check_permission("tags/remove_tag", "");
    if (result) {
      await trackPromise(
        axios({
          method: "delete",
          url:
            servicePath + "/api/v2/tags/remove_tag.json?order_id=" + order_id,
          headers: {
            // "Content-Type": "multipart/form-data",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
            "IS-ACCESSIBLE": true,
          },
        })
      )
        .then((response) => {
          if (response.status === 200) {
            order = tempOrders.orders.find((order) => order.id === order_id);
            order.tag_id = "";
            order.tag_name = "";
            this.setState({
              orders_data: tempOrders,
              current_tag: {
                id: "",
                tag_name: "",
                order_id: "",
              },
            });
            this.setState({});
            NotificationManager.success(
              "Tag removed Successfully",
              "",
              5000,
              () => {},
              null,
              "filled"
            );
          } else {
            console.log(response);
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
  };

  set_reason = (order) => {
    let comment_html = [];
    comment_html = <>{order.cancel_reason}</>;
    return comment_html;
  };

  render_badge_unverified = (single_order) => {
    let badge_html = <> </>;
    if (
      single_order.client.is_cnic_verified == false &&
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

  setOrderForActivityLog = (e, orderId) => {
    localStorage.setItem("orderIdForActivity", orderId);
  };

  set_order_details = (single_order) => {
    let service_detail_html = [];
    service_detail_html = (
      <>
        <Table>
          <tr>
            <td>
              <strong>Locked By:</strong>
            </td>
            <td>
              {single_order.redis_order_status
                ? single_order.redis_order_first_name +
                  " " +
                  single_order.redis_order_last_name
                : "None"}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Created At:</strong>
            </td>
            <td>{moment(single_order.created_at).format("MMM D, YYYY LT")}</td>
          </tr>
          <tr>
            <td>
              <strong>Device Type:</strong>
            </td>
            <td>{single_order.device_type}</td>
          </tr>
        </Table>
      </>
    );
    return service_detail_html;
  };

  render_order_row = () => {
    const { orders_data } = this.state;
    let single_order_row_html = [];
    let self = this;

    orders_data.orders.forEach(function (single_order, index) {
      let client_name = "";

      if (single_order.client.first_name === null) {
        client_name = "Guest User";
      } else {
        client_name =
          single_order.client.first_name + " " + single_order.client.last_name;
      }

      single_order_row_html.push(
        <>
          <tr
            data={single_order.id}
            tag_name={single_order.tag_name}
            id={single_order.id}
            tag_id={single_order.tag_id}
          >
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
                <Badge className="mb-1 ml-1 gender-badge">
                  {single_order.client.gender === "Female" ? <>F</> : <>M</>}
                </Badge>
                {self.render_badge_unverified(single_order)}
              </Link>
            </td>
            <td>
              {" "}
              {single_order.custom_order_id}
              {single_order.is_gift_avail ? (
                <>
                  <p>
                    <img src={GiftBoxsmall} alt="" width="60%" />
                  </p>{" "}
                </>
              ) : (
                <></>
              )}
            </td>
            <td> {single_order.status} </td>
            <td>
              {moment(single_order.order_date).format("MMM D, YYYY") +
                " " +
                single_order.order_time}
            </td>
            {/* <td> {single_order.client.gender} </td> */}
            <td> {single_order.address.city.city_name} </td>
            <td>
              <Popover
                placement="bottom"
                title="Order Details"
                width="400"
                trigger="click"
                content={self.set_order_details(single_order)}
              >
                <u>
                  <a style={{ color: "blue" }}>Other Details</a>
                </u>
              </Popover>
            </td>
            {/* <td>
              {single_order.redis_order_status
                ? single_order.redis_order_first_name +
                  " " +
                  single_order.redis_order_last_name
                : "None"}
            </td> */}
            <td> {single_order.total_price} </td>
            {/* <td>{moment(single_order.created_at).format("MMM D, YYYY LT")}</td> */}
            {/* <td>{single_order.device_type}</td> */}
            <td className={single_order.id}>
              {single_order.tag_name !== undefined &&
              single_order.tag_name !== "" &&
              single_order.tag_name !== null ? (
                <>
                  {single_order.tag_name}
                  <a
                    onClick={(event) =>
                      self.removeTag(
                        event,
                        single_order.id,
                        single_order.tag_id
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <Badge className="mb-1 ml-1">X</Badge>
                  </a>
                </>
              ) : (
                <></>
              )}
            </td>
            <td>
              <div style={{ display: "flex" }}>
                <Link
                  to={`/app/activity_logs/list`}
                  onClick={(e) =>
                    self.setOrderForActivityLog(e, single_order.id)
                  }
                >
                  <Button
                    className="ml-1 user-show-btns"
                    color="success"
                    size="sm"
                  >
                    {" "}
                    Activity{" "}
                  </Button>
                </Link>
                {single_order.status === "Pending" ||
                single_order.status === "Confirmed" ? (
                  <>
                    <Button
                      className="btn-primary ml-1"
                      color="sucess"
                      size="sm"
                      onClick={(event) =>
                        self.toggle_tags_modal(event, single_order)
                      }
                    >
                      Tags
                    </Button>
                    <Link
                      // to={`/app/orders/edit_order/${single_order.id}`}
                      onClick={() =>
                        check_permission(
                          "orders/update",
                          `/app/orders/edit_order/${single_order.id}`
                        )
                      }
                    >
                      <Button
                        className="btn-success ml-1 user-show-btns"
                        size="sm"
                      >
                        {" "}
                        Edit{" "}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </td>
          </tr>
        </>
      );
    });

    return single_order_row_html;
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
            {/* <th> Gender </th> */}
            <th> City </th>
            <th> Details</th>
            {/* <th> Locked by </th> */}
            <th> Amount </th>
            {/* <th> Created At </th> */}
            {/* <th> Device </th> */}
            <th>Tag</th>
            {/* <th> Reason </th> */}
            <th> Action </th>
          </tr>
        </thead>
      </>
    );
    return table_heading_html;
  };

  render_orders_table = () => {
    const { orders_data, activePage } = this.state;

    let orders_table_html = (
      <>
        <Row>
          <Colxx xxs="12">
            <Tabs
              activeName="All"
              onTabClick={(tab) => {
                this.get_order_by_status(tab, tab.props.name);
              }}
            >
              <Tabs.Pane
                label={"All (" + orders_data.all_count + ")"}
                name="All"
              >
                <Colxx xxs="12">
                  <Card className="mb-4">
                    <CardBody>
                      <Table>
                        {this.render_table_heading()}
                        <tbody>{this.render_order_row()}</tbody>
                      </Table>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={orders_data.all_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                      {/* {this.render_pagination_buttons()} */}
                    </CardBody>
                  </Card>
                </Colxx>
              </Tabs.Pane>
              <Tabs.Pane
                label={"Pending (" + orders_data.pending_count + ")"}
                name="Pending"
              >
                <Colxx xxs="12">
                  <Card className="mb-4">
                    <CardBody>
                      <Table>
                        {this.render_table_heading()}
                        <tbody>{this.render_order_row()}</tbody>
                      </Table>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={orders_data.pending_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                      {/* {this.render_pagination_buttons()} */}
                    </CardBody>
                  </Card>
                </Colxx>
              </Tabs.Pane>
              <Tabs.Pane
                label={"In Process (" + orders_data.in_process_count + ")"}
                name="In_process"
              >
                <Colxx xxs="12">
                  <Card className="mb-4">
                    <CardBody>
                      <Table>
                        {this.render_table_heading()}
                        <tbody>{this.render_order_row()}</tbody>
                      </Table>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={orders_data.in_process_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                    </CardBody>
                  </Card>
                </Colxx>
              </Tabs.Pane>
              <Tabs.Pane
                label={"Confirmed (" + orders_data.confirmed_count + ")"}
                name="Confirmed"
              >
                <Colxx xxs="12">
                  <Card className="mb-4">
                    <CardBody>
                      <Table>
                        {this.render_table_heading()}
                        <tbody>{this.render_order_row()}</tbody>
                      </Table>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={orders_data.confirmed_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                      {/* {this.render_pagination_buttons()} */}
                    </CardBody>
                  </Card>
                </Colxx>
              </Tabs.Pane>
              <Tabs.Pane
                label={"Completed (" + orders_data.completed_count + ")"}
                name="Completed"
              >
                <Colxx xxs="12">
                  <Card className="mb-4">
                    <CardBody>
                      <Table>
                        {this.render_table_heading()}
                        <tbody>{this.render_order_row()}</tbody>
                      </Table>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={orders_data.completed_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                      {/* {this.render_pagination_buttons()} */}
                    </CardBody>
                  </Card>
                </Colxx>
              </Tabs.Pane>
              <Tabs.Pane
                label={"Cancelled (" + orders_data.cancelled_count + ")"}
                name="Cancelled"
              >
                <Colxx xxs="12">
                  <Card className="mb-4">
                    <CardBody>
                      <Table>
                        {this.render_table_heading()}
                        <tbody>{this.render_order_row()}</tbody>
                      </Table>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={orders_data.cancelled_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                      {/* {this.render_pagination_buttons()} */}
                    </CardBody>
                  </Card>
                </Colxx>
              </Tabs.Pane>
            </Tabs>
          </Colxx>
        </Row>
      </>
    );

    return orders_table_html;
  };

  set_order_status_dropdown = (status) => {
    sessionStorage.setItem("status_ids_orders", JSON.stringify(status));
    this.setState({
      select_status_value: status,
    });
  };

  set_order_date = (date) => {
    this.setState({
      order_date: date.value,
    });
  };

  set_order_cities_dropdown = (city) => {
    sessionStorage.setItem("city_ids_orders", JSON.stringify(city));
    this.setState({
      select_cities_value: city,
    });
  };

  set_order_tags_dropdown = (tag) => {
    sessionStorage.setItem("tag_ids_order", JSON.stringify(tag));
    this.setState({
      select_tag_values: tag,
    });
  };

  search_order = async (event) => {
    event.preventDefault();
    const { activeTab, response_status } = this.state;

    let self = this;
    let search_key = event.target.elements["search_key"].value;
    let search_val = event.target.elements["search_value"].value;
    let url = "";

    if (activeTab === "All") {
      url =
        servicePath +
        "/api/v2/orders.json?default_role=admin&search_key=" +
        search_key +
        "&search_value=" +
        search_val;
    } else {
      url =
        servicePath +
        "/api/v2/orders.json?default_role=admin&search_key=" +
        search_key +
        "&search_value=" +
        search_val +
        "&status=" +
        activeTab;
    }
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
              if (response.status === 200) {
                if (response.data.orders.length) {
                  self.setState({
                    orders_data: response.data,
                    response_status: true,
                    orders_found: true,
                  });
                } else {
                  self.setState({
                    orders_found: false,
                    response_status: true,
                  });
                  NotificationManager.error(
                    "No Record Found",
                    "",
                    5000,
                    () => {},
                    null,
                    "filled"
                  );
                }
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

  render_search_bar = () => {
    const search_parms = [
      { label: "Order ID", value: "order_id", key: 0 },
      { label: "Client ID", value: "client_id", key: 1 },
      { label: "Phone", value: "phone_number", key: 2 },
      { label: "Client Name", value: "client_name", key: 3 },
    ];

    return (
      <>
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.search_order} id="order-filter">
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
                      label: "Order ID",
                      value: "order_id",
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
          let orders_data = await this.get_all_orders(1);
          self.setState({
            orders_data: orders_data,
            currentPage: 1,
            response_status: true,
          });
        }
      );
    }
  };

  set_order_date = (date) => {
    if (date.value === "date") {
      this.setState({
        order_date: date.value,
        col_size: "2",
        date_col_size: "3",
      });
    } else {
      this.setState({
        order_date: date.value,
        col_size: "2",
        date_col_size: "0",
      });
    }
  };

  handleTagChange = async (event, tag_name, tag_id, order_id) => {
    // let success = false;
    const { orders_data } = this.state;
    let tempOrders = orders_data;
    let order = {};
    await axios({
      method: "post",
      url: servicePath + "/api/v2/tags/apply_tag.json",
      data: {
        order_id: order_id,
        tag_id: tag_id,
      },
      headers: {
        // "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          order = tempOrders.orders.find((order) => order.id === order_id);
          order.tag_id = tag_id;
          order.tag_name = tag_name;
          this.setState({
            orders_data: tempOrders,
            current_tag: {
              id: tag_id,
              tag_name: tag_name,
              order_id: order_id,
            },
          });
          this.setState({});
          NotificationManager.success(
            "Tag updated Successfully",
            "",
            5000,
            () => {},
            null,
            "filled"
          );
        } else {
          console.log(response);
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
    // event.target.checked = success;
  };

  render_tags_modal = () => {
    const { current_tag, order_tags } = this.state;
    let addons_modal_html = (
      <>
        <Modal
          size="md"
          isOpen={this.state.toggle_tags_modal}
          toggle={this.toggle_close_tag_modal}
        >
          <ModalHeader toggle={this.toggle_close_tag_modal}>
            Tags(Order-{current_tag.order_id})
          </ModalHeader>
          <ModalBody>
            {order_tags.map((single_tag) => {
              return (
                <tr>
                  {current_tag.tag_name !== undefined &&
                  current_tag.tag_name === single_tag.tag_name ? (
                    <>
                      <input
                        type="radio"
                        name="tag"
                        id={single_tag.id}
                        checked={true}
                        onClick={(event) =>
                          this.handleTagChange(
                            event,
                            single_tag.tag_name,
                            single_tag.id,
                            current_tag.order_id
                          )
                        }
                      />
                      <label className="pl-2" for={single_tag.id}>
                        {single_tag.tag_name}
                      </label>
                    </>
                  ) : (
                    <>
                      <input
                        type="radio"
                        name="tag"
                        id={single_tag.id}
                        onClick={(event) =>
                          this.handleTagChange(
                            event,
                            single_tag.tag_name,
                            single_tag.id,
                            current_tag.order_id
                          )
                        }
                      />
                      <label className="pl-2" for={single_tag.id}>
                        {single_tag.tag_name}
                      </label>
                    </>
                  )}
                </tr>
              );
            })}
          </ModalBody>
          <ModalFooter>
            {/* <Button color="primary" onClick={this.toggle_t_modal}>
              Submit
            </Button> */}
            <Button color="secondary" onClick={this.toggle_close_tag_modal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );

    return addons_modal_html;
  };

  render_top_nav = () => {
    const {
      all_cities_json,
      value2,
      select_cities_value,
      order_dates,
      order_date,
      col_size,
      date_col_size,
      select_tag_value,
      tags_dropdown_data,
    } = this.state;
    let top_nav_html = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1> Orders </h1>
              <div className="text-zero top-right-button-container">
                {/* <Link to="new_order"> */}
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  onClick={() =>
                    check_permission("orders/create", "/app/orders/new_order")
                  }
                >
                  Add New Order
                </Button>
                {/* </Link> */}
              </div>
            </div>
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        {this.render_search_bar()}
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
                <Colxx md={col_size}>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select City"
                    name="order_dates"
                    defaultValue={order_dates[0]}
                    onChange={this.set_order_date}
                    options={order_dates}
                  />
                </Colxx>
                <Colxx xxs={date_col_size}>
                  {order_date === "date" ? (
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
                <Colxx xxs={col_size}>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    isMulti
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select City"
                    name="city_ids"
                    value={select_cities_value}
                    onChange={this.set_order_cities_dropdown}
                    options={all_cities_json}
                  />
                </Colxx>
                {this.render_status_filter()}
                <Colxx xxs="2">
                  <Select
                    components={{ Input: CustomSelectInput }}
                    isMulti
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select Tag"
                    // name="city_ids"
                    value={select_tag_value}
                    onChange={this.set_order_tags_dropdown}
                    options={tags_dropdown_data}
                  />
                </Colxx>
                <Colxx xxs="1" className="mt-2" style={{ marginLeft: "8%" }}>
                  <Button color="primary" size="sm" type="submit">
                    Submit
                  </Button>
                </Colxx>
                <Colxx xxs="1" className="mt-2">
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

  render_status_filter = () => {
    const { activeTab, select_status_value, order_statuses, col_size } =
      this.state;
    if (activeTab === "All") {
      return (
        <>
          <Colxx xxs={col_size}>
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
        </>
      );
    }
  };

  handlePageChange = async (pageNum) => {
    let new_orders_data = [];
    this.state.response_status = false;

    new_orders_data = await this.get_all_orders(pageNum);

    this.setState({
      response_status: true,
      activePage: pageNum,
      orders_data: new_orders_data,
    });
  };

  render() {
    const { orders_data, response_status } = this.state;
    if (typeof orders_data === "string") {
      return <>You are not authorized to access this page</>;
    } else {
      if (Object.keys(orders_data).length === 0 && response_status === true) {
        // if(orders_found){
        return <></>;
        // }
      } else {
        return (
          <div>
            {this.render_top_nav()}
            {this.render_orders_table()}
            {this.render_tags_modal()}
            {/* {this.render_show_loader()} */}
          </div>
        );
      }
    }
  }
}
export default DataListPages;
