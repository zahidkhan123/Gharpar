import React, { Component } from "react";

import { Row, Button, Table } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/push_notifications.json";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;

    trackPromise(
      axios({
        method: "get",
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.data.push_notifications.length > 0) {
        self.setState({
          data: response.data.push_notifications,
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

  render_single_row = (data) => {
    let setting_html = [];
    data.forEach(function (single_push_notification, index) {
      setting_html.push(
        <tr>
          <td>{single_push_notification.id}</td>
          <td>{single_push_notification.subject}</td>
          <td>{single_push_notification.content}</td>
          <td>{single_push_notification.send_to}</td>
          <td>{single_push_notification.created_at}</td>
        </tr>
      );
    });
    return setting_html;
  };

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Push Notifications</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "push_notifications/create",
                    `/app/push_notification/create_push_notification`
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Push Notification
                </Button>
              </Link>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  render() {
    const { data } = this.state;

    return (
      <div>
        {this.settings_heading()}
        {data.length ? (
          <>
            <Row>
              <Colxx md="12">
                <Table striped>
                  <thead>
                    <th>No.</th>
                    <th>Subject</th>
                    <th>Content</th>
                    <th>Users</th>
                    <th>Date</th>
                  </thead>
                  <tbody>{this.render_single_row(data)}</tbody>
                </Table>
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
