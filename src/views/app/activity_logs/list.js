import React, { Component } from "react";

import { Row, Button, Table, Label, Input } from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";

function collect(props) {
  return { data: props.data };
}

const apiUrl = servicePath + "/api/v2/activity_logs.json";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    let city_ids_gifts = sessionStorage.getItem("city_ids_gifts");
    if (city_ids_gifts === null) {
      city_ids_gifts = [];
    } else {
      city_ids_gifts = JSON.parse(city_ids_gifts);
    }

    this.state = {
      selectedItems: [],
    };
  }

  componentDidMount() {
    let order_id = localStorage.getItem("orderIdForActivity");
    if (order_id !== undefined && order_id !== "" && order_id !== null) {
      order_id = order_id;
      this.dataListRender(order_id);
    } else {
      order_id = "";
    }
  }

  dataListRender(order_id) {
    let self = this;
    let url;

    url = apiUrl + "?order_id=" + order_id;
    trackPromise(
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
        if (response.data.activity_logs.length > 0) {
          self.setState({
            selectedItems: response.data.activity_logs,
          });
          localStorage.removeItem("orderIdForActivity");
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
  }

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);
  };

  render_single_row = (selectedItems) => {
    let self = this;
    let setting_html = [];
    selectedItems.forEach(function (single_activity, index) {
      setting_html.push(
        <tr>
          <td>{index + 1}</td>
          <td>{single_activity.order_id}</td>
          <td>{single_activity.job_code}</td>
          <td>{single_activity.action_performed}</td>
          <td>{single_activity.message_content}</td>
          <td>
            {single_activity.changed_by.first_name}{" "}
            {single_activity.changed_by.last_name}
          </td>
          <td>{single_activity.created_at}</td>
        </tr>
      );
    });
    return setting_html;
  };

  filter_data = async (event) => {
    event.preventDefault();
    localStorage.removeItem("orderIdForActivity");
    let self = this;
    let order_id = event.target.elements["order_id"].value;
    let url = apiUrl + "?order_id=" + order_id;
    trackPromise(
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
        if (response.data.activity_logs.length > 0) {
          self.setState({
            selectedItems: response.data.activity_logs,
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

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Activity Logs</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "gift_hampers/create",
                    `/app/gift_hampers/create_gift`
                  )
                }
              >
                {/* <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Gift
                </Button> */}
              </Link>
            </div>
          </Colxx>
        </Row>
        <form onSubmit={this.filter_data}>
          <Row className="mb-3">
            <Colxx xxs="2">
              <Label className="mt-3">Order ID</Label>
              <Input type="text" name="order_id" />
            </Colxx>
            <Colxx xxs="1">
              <Button color="primary" size="sm" type="submit" className="mt-5">
                Search
              </Button>
            </Colxx>
            {/* <Colxx xxs="1">
              <Button
                className="mt-5"
                size="sm"
                color="danger"
                onClick={(event) => {
                  this.clear_form(event);
                }}
              >
                Clear
              </Button>
            </Colxx> */}
          </Row>
        </form>

        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  render() {
    const { selectedItems } = this.state;

    return (
      <div>
        {this.settings_heading()}
        {selectedItems.length ? (
          <>
            <Row>
              <Colxx md="12">
                <Table striped>
                  <thead>
                    <th>No.</th>
                    <th>Order</th>
                    <th>Job</th>
                    <th>Action</th>
                    <th>Content</th>
                    <th>Changed By</th>
                    <th>Changed At</th>
                  </thead>
                  <tbody>{this.render_single_row(selectedItems)}</tbody>
                </Table>
                {/* <Pagination
                  activePage={active_page}
                  itemsCountPerPage={20}
                  totalItemsCount={totalItemCount}
                  delimeter={5}
                  onChange={this.handlePageChange}
                  styling="rounded_primary"
                /> */}
              </Colxx>
            </Row>
          </>
        ) : (
          <></>
        )}
      </div>
    );
  }
}
export default DataListPages;
