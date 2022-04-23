import React, { Component } from "react";

import { Row, Button, Card } from "reactstrap";

import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

function collect(props) {
  return { data: props.data };
}

const apiUrl = servicePath + "/api/v2/settings.json";

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
        "/api/v2/cities.json?default_role=admin&search_data=" +
        this.state.search;
    } else {
      url = apiUrl + "?default_role=Admin";
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
      if (response.data.settings.length > 0) {
        self.setState({
          selectedItems: response.data.settings,
          totalItemCount: response.data.settings.length,
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

  render_single_row = (selectedItems) => {
    let setting_html = [];
    selectedItems.forEach(function (single_setting) {
      setting_html.push(
        <Row>
          <Colxx xxs="12" className="mb-3">
            <ContextMenuTrigger
              id="menu_id"
              data={single_setting.id}
              collect={collect}
            >
              <Card
              // onClick={event => onCheckItem(event, city.id)}
              // className={classnames("d-flex flex-row", {
              //   active: isSelect
              // })}
              >
                <div className="pl-2 d-flex flex-grow-1 min-width-zero">
                  <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                    <p className="list-item-heading mb-1 truncate">
                      {single_setting.city.city_name}
                    </p>
                    <span>
                      {single_setting.start_time} - {single_setting.end_time}
                    </span>
                    <span>{single_setting.min_order_price}</span>
                  </div>
                  <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                    <Link
                      // to={`edit/${single_setting.id}`
                      onClick={() =>
                        check_permission(
                          "settings/update",
                          `edit/${single_setting.id}`
                        )
                      }
                    >
                      <Button className="btn-success mr-2"> Edit </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </ContextMenuTrigger>
          </Colxx>
        </Row>
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
              <h1>Time Settings</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "settings/create",
                    `/app/settings/create_setting`
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Setting
                </Button>
              </Link>
            </div>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="4">
            <h4 className="pl-4">City</h4>
          </Colxx>
          <Colxx xxs="4">
            <h4 className="text-center pr-5">Timings</h4>
          </Colxx>
          <Colxx xxs="4">
            <h4 className="text-right pr-5">Min Order Price</h4>
          </Colxx>
        </Row>
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
        {this.render_single_row(selectedItems)}
      </div>
    );
  }
}
export default DataListPages;
