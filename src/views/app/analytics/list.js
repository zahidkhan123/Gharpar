import React, { Component } from "react";

import { Row, Card, Table, CardBody } from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import axios from "axios";

import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/reports.json";

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
    };
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;

    let url;
    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/reports/device_type_analytics.json?search_data=" +
        this.state.search;
    } else {
      url = apiUrl;
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
          selectedItems: response.data,
          totalItemCount: response.data.length,
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

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Analytics</h1>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  render() {
    const { selectedItems } = this.state;

    if (Object.keys(selectedItems).length !== 0) {
      return (
        <div>
          {this.settings_heading()}
          <Colxx xxs="12">
            <Card className="mb-4">
              <CardBody>
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Android</th>
                      <th>IOS</th>
                      <th>Web/Client</th>
                      <th>Web/Admin</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Clients</strong>
                      </td>
                      <td>{selectedItems.users_count.android_count}</td>
                      <td>{selectedItems.users_count.ios_count}</td>
                      <td>{selectedItems.users_count.web_count}</td>
                      <td>{selectedItems.users_count.admin_count}</td>
                      <td>
                        {selectedItems.users_count.admin_count +
                          selectedItems.users_count.web_count +
                          selectedItems.users_count.ios_count +
                          selectedItems.users_count.android_count}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Orders</strong>
                      </td>
                      <td>{selectedItems.orders_count.android_count}</td>
                      <td>{selectedItems.orders_count.ios_count}</td>
                      <td>{selectedItems.orders_count.web_count}</td>
                      <td>{selectedItems.orders_count.admin_count}</td>
                      <td>
                        {selectedItems.orders_count.admin_count +
                          selectedItems.orders_count.web_count +
                          selectedItems.orders_count.ios_count +
                          selectedItems.orders_count.android_count}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Colxx>
        </div>
      );
    } else {
      return <></>;
    }
  }
}
export default DataListPages;
