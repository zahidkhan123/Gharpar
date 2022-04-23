import React, { Component } from "react";
import humanize from "string-humanize";

import { Row, Card, CardBody, Table, CustomInput } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { Tabs } from "element-react";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import "reactive-pagination/dist/index.css";
import { trackPromise } from "react-promise-tracker";

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
      activePage: 1,
      order_jobs_count: 0,
      totalPage: 1,
      search: "",
      order_jobs: [],
      rating_value: [],
      unrated_orders: [],
      unrated_orders_count: 0,
      lastChecked: null,
      isLoading: false,
      newCityName: "",
      activeTab: "Rated Jobs",
      userAction: "new",
      orderToEdit: [],
      all_technicians: [],
      technicians_dropdown: [],
      pagination: "jobs",
      deleteConfirmationModal: false,
      cityToDelete: "",
      is_filters: true,
      areaAction: "areaModalOpen",
      areaModalOpen: false,
      targetCity: "",
      follow_up: "",
      value2: "",
      current_permissions: [],
      all_roles: [],
    };
    //   this.rating_seen = this.rating_seen.bind(this);
    //   this.updateRating = this.updateRating.bind(this);
    //   this.addFollowUp = this.addFollowUp.bind(this);
    //   this.set_follow_up = this.set_follow_up.bind(this);
    //   this.ratingChanged = this.ratingChanged.bind(this);
  }

  async componentDidMount() {
    // await this.dataListRender(1);
    let all_roles = await this.get_all_roles();
    let current_permissions = await this.get_default_role_permissions();
    this.setState({
      // all_technicians: all_technicians,
      // technicians_dropdown: technicians_dropdown,
      // all_cities: all_cities,
      // cities_dropdown: cities_dropdown,
      all_roles: all_roles,
      current_permissions: current_permissions,
    });
    document.getElementsByName(all_roles[0].role_name)[0].click();
  }

  get_default_role_permissions = async () => {
    let current_permissions = [];
    let default_role = localStorage.getItem("user_default_role");
    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/role_permissions.json?default_role=" +
          default_role,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          current_permissions = response.data.role_permissions;
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
    return current_permissions;
  };

  get_all_roles = async () => {
    let all_roles = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/roles.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_roles = response.data.roles;
          // document.getElementsByName("Admin")[0].click();
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
    return all_roles;
  };

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Roles</h1>
              {/* <Link to="create_setting">
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}>
                  New Setting
                </Button>
              </Link> */}
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  get_role_permissions = async (tab, role) => {
    let self = this;
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/role_permissions.json?default_role=" + role,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            current_permissions: response.data.role_permissions,
          });
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        // NotificationManager.error(
        //   error.response.data.message,
        //   "",
        //   5000,
        //   () => {},
        //   null,
        //   "filled"
        // );
        console.log("error", error);
      });
  };

  handleCheckChange = async (event, value1, id) => {
    let target = event.target;
    let value = "";
    let controller_name = "";
    if (target.checked) {
      value = true;
    } else {
      value = false;
    }

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/role_permissions/" + id + ".json",
        data: {
          role_permission: {
            is_enabled: value,
          },
        },
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          controller_name = response.data.controller_name + "_permissions";
          localStorage.removeItem(controller_name);
          localStorage.setItem(
            controller_name,
            JSON.stringify(response.data.role_permissions)
          );
          target.checked = response.data.is_enabled;
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
  };

  render_single_permission = (single_permission) => {
    let self = this;
    let single_permission_html = [];
    single_permission.forEach((permission) => {
      single_permission_html.push(
        <td>
          {/* <label>{}</label> */}
          <CustomInput
            className="mt-2"
            label={permission.display_name}
            type="checkbox"
            checked={permission.is_enabled}
            onChange={(event) =>
              self.handleCheckChange(
                event,
                permission.is_enabled,
                permission.id
              )
            }
          />
          {/* <Input hidden name="" defaultValue={permission.is_enabled} /> */}
        </td>
      );
    });
    return single_permission_html;
  };

  render_all_permissions = (current_permissions) => {
    let self = this;
    // const { current_permissions } = this.state;
    let permission_body_html = [];
    current_permissions.forEach((single_permission) => {
      permission_body_html.push(
        <tr>
          <td>
            {single_permission !== undefined && single_permission.length > 0 ? (
              <>
                <strong>
                  {humanize(single_permission[0].controller_name)}:
                </strong>
              </>
            ) : (
              <></>
            )}
          </td>
          {self.render_single_permission(single_permission)}
        </tr>
      );
    });
    return permission_body_html;
  };

  render_all_roles_tabs = () => {
    let self = this;
    const { all_roles, current_permissions } = this.state;
    let all_roles_tabs_html = [];
    all_roles.forEach((single_role) => {
      all_roles_tabs_html.push(
        <Tabs.Pane label={single_role.role_name} name={single_role.role_name}>
          <Card className="mb-4">
            <CardBody>
              <Table bordered>
                <tbody>
                  {self.render_all_permissions(current_permissions)}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Tabs.Pane>
      );
    });
    return all_roles_tabs_html;
  };

  render() {
    const { all_roles } = this.state;
    let self = this;
    if (Object.keys(all_roles).length === 0) {
      return <></>;
    } else {
      return (
        <div>
          {this.settings_heading()}
          <Colxx xxs="12">
            <Tabs
              activeName={all_roles[0].role_name}
              name={all_roles[0].role_name}
              onTabClick={(tab) => {
                this.get_role_permissions(tab, tab.props.name);
              }}
            >
              {self.render_all_roles_tabs()}
            </Tabs>
          </Colxx>
        </div>
      );
    }
  }
}
export default DataListPages;
