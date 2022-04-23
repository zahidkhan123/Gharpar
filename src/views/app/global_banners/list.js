import React, { Component } from "react";

import { Row, Button, Table } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/global_banners.json";

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
      if (response.data.global_banners.length > 0) {
        self.setState({
          data: response.data.global_banners,
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

  activateBanner = async (event, banner, status) => {
    let self = this;
    await trackPromise(
      axios.put(
        servicePath + "/api/v2/global_banners/" + banner + ".json",
        {
          global_banner: {
            is_active: status,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        }
      )
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Updated Successfully",
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
          );
          self.dataListRender();
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

  render_single_row = (data) => {
    let self = this;
    let setting_html = [];
    data.forEach(function (single_banner, index) {
      setting_html.push(
        <tr>
          <td>{index + 1}</td>
          <td>{single_banner.title}</td>
          <td>
            <img src={single_banner.banner} alt="banner" width="100px" />
          </td>
          <td>{single_banner.banner_url}</td>
          <td>
            {single_banner.is_active ? (
              <>
                <Button
                  color="danger"
                  size="sm"
                  onClick={(event) =>
                    self.activateBanner(event, single_banner.id, false)
                  }
                  className=""
                >
                  {" "}
                  Deactivate{" "}
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="success"
                  size="sm"
                  onClick={(event) =>
                    self.activateBanner(event, single_banner.id, true)
                  }
                  className=""
                >
                  {" "}
                  Activate{" "}
                </Button>
              </>
            )}
          </td>
          <td>
            <Link to={`edit_banner/${single_banner.id}`}>
              <Button size="sm" className="btn-success mr-2">
                {" "}
                Edit{" "}
              </Button>
            </Link>
          </td>
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
              <h1>Global Banners</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "global_banners/create",
                    `/app/global_banner/create_banner`
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Banner
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
                <Table striped className="text-center">
                  <thead>
                    <th>No.</th>
                    <th>Title</th>
                    <th>Image</th>
                    <th>URL</th>
                    <th>Actions</th>
                    <th></th>
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
