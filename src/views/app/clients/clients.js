import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Card, CardBody } from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { check_permission } from "../../../helpers/Utils";
import { Table, Button } from "element-react";
import { NotificationManager } from "../../../components/common/react-notifications";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import Select from "react-select";
import { Tabs, DateRangePicker } from "element-react";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { trackPromise } from "react-promise-tracker";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Badge,
} from "reactstrap";
import axios from "axios";
import "./clients.css";

export default class Clients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal_password_update: false,
    };
    let self = this;

    let city_ids_clients = sessionStorage.getItem("city_ids_clients");
    if (city_ids_clients === null) {
      city_ids_clients = [];
    } else {
      city_ids_clients = JSON.parse(city_ids_clients);
    }

    let status_ids_clients = sessionStorage.getItem("status_ids_clients");
    if (status_ids_clients === null) {
      status_ids_clients = [];
    } else {
      status_ids_clients = JSON.parse(status_ids_clients);
    }

    let city_type = sessionStorage.getItem("city_type");
    if (city_type === null) {
      city_type = {
        label: "Search by Signup city",
        value: "signup_city",
        key: 0,
      };
    } else {
      city_type = JSON.parse(city_type);
    }
    this.state = {
      data: [],
      clients_data: [],
      totalItemCount: [],
      areaToEdit: "",
      userAction: "",
      modalOpen: "",
      updatedClient: [],
      clientId: "",
      all_cities: [],
      all_cities_json: [],
      startDateRange: null,
      endDateRange: null,
      currentPage: 1,
      activePage: 1,
      totalItemsCount: 0,
      activeTab: "All",
      value2: "",
      select_cities_client: city_ids_clients,
      select_status_client: status_ids_clients,
      city_search_type: city_type,
      client_statuses: [
        {
          label: "Approved",
          value: "Approved",
          key: 1,
        },
        {
          label: "Rejected",
          value: "Rejected",
          key: 2,
        },
        {
          label: "Pending",
          value: "Pending",
          key: 3,
        },
        {
          label: "Guest User",
          value: "Guest User",
          key: 3,
        },
      ],
      columns: [
        {
          type: "expand",
          expandPannel: function (data) {
            let fn = "";
            let ln = "";
            if (data.first_name !== null && data.last_name !== null) {
              fn = data.first_name.charAt(0);
              ln = data.last_name.charAt(0);
            } else {
              fn = "G";
              ln = "U";
            }

            return (
              <Row>
                <Colxx xxs="2">
                  {data.profile_picture ? (
                    <img
                      src={data.profile_picture}
                      className="rounded-circle img-fluid"
                      alt={data.name}
                    />
                  ) : (
                    <div className="circle">
                      <span className="initials">
                        {fn}
                        {ln}
                      </span>
                    </div>
                  )}
                </Colxx>
                <Colxx xxs="6">
                  <p>
                    Address:{" "}
                    {data.addresses.length > 0 ? (
                      <>{data.addresses[0].address_1}</>
                    ) : (
                      <></>
                    )}
                  </p>
                  <p>CNIC: {data.cnic}</p>
                  <p>Gender: {data.gender}</p>
                  <p>Phone: {data.phone}</p>
                </Colxx>
                <Colxx xxs="4">
                  {data.approved_status === "Pending" ? (
                    <span>
                      <Button
                        plain={true}
                        type="success"
                        size="small"
                        onClick={(event) => self.approveClient(event, data)}
                      >
                        Verify
                      </Button>
                      <Button
                        type="danger"
                        size="small"
                        onClick={(event) => self.rejectClient(event, data)}
                      >
                        Unverify
                      </Button>
                    </span>
                  ) : data.approved_status === "Approved" ? (
                    <span>
                      <FontAwesomeIcon icon="faCoffee" />
                      {/* <i className="fas fa-flag" /> */}
                      <Button
                        type="warning"
                        size="small"
                        onClick={(event) => self.flagClient(event, data)}
                      >
                        Flag
                      </Button>
                      <Button
                        type="danger"
                        size="small"
                        onClick={(event) => self.blockClient(event, data)}
                      >
                        Block
                      </Button>
                    </span>
                  ) : data.approved_status === "Rejected" ? (
                    <span>
                      <Button
                        plain={true}
                        type="success"
                        size="small"
                        onClick={(event) => self.approveClient(event, data)}
                      >
                        Verify
                      </Button>
                    </span>
                  ) : (
                    <></>
                  )}
                </Colxx>
              </Row>
            );
          },
        },
        {
          label: "Name",
          render: (data) => {
            return (
              <>
                <div>
                  <strong>
                    {data.first_name} {data.last_name}
                  </strong>
                </div>
                <div>
                  {
                    <Badge color="secondary" pill className="mb-1">
                      {data.membership_code}
                    </Badge>
                  }
                </div>
              </>
            );
          },
        },
        {
          label: "Status",
          sortabale: true,
          render: (data) => {
            return (
              <div>
                {data.user_status === "Registered" ? (
                  <>
                    {data.approved_status === "Pending" ? (
                      <span className="btn btn-danger btn-sm pt-1 pb-1">
                        Pending
                      </span>
                    ) : data.approved_status === "Approved" ? (
                      <span className="btn btn-success btn-sm pt-1 pb-1">
                        Approved
                      </span>
                    ) : data.approved_status === "Rejected" ? (
                      <span className="btn btn-warning btn-sm pt-1 pb-1">
                        Rejected
                      </span>
                    ) : data.approved_status === "Blocked" ? (
                      <span className="btn btn-danger btn-sm pt-1 pb-1">
                        Blocked
                      </span>
                    ) : (
                      <span className="btn btn-warning btn-sm pt-1 pb-1">
                        Guest User
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {data.approved_status === "Pending" ? (
                      <span className="btn btn-danger btn-sm pt-1 pb-1">
                        Pending
                      </span>
                    ) : data.approved_status === "Approved" ? (
                      <span className="btn btn-success btn-sm pt-1 pb-1">
                        Approved
                      </span>
                    ) : data.approved_status === "Rejected" ? (
                      <span className="btn btn-warning btn-sm pt-1 pb-1">
                        Rejected
                      </span>
                    ) : data.approved_status === "Blocked" ? (
                      <span className="btn btn-danger btn-sm pt-1 pb-1">
                        Blocked
                      </span>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </div>
            );
          },
        },
        {
          label: "City",
          sortabale: true,
          width: 80,
          render: (data) => {
            return (
              <span>
                {data.addresses.length > 0 ? (
                  <Label>{data.addresses[0].city_name}</Label>
                ) : (
                  <>{data.city_name}</>
                )}
              </span>
            );
          },
        },

        {
          label: "CNIC",
          prop: "cnic",
        },
        {
          label: "Phone",
          prop: "phone",
        },
        {
          label: "Phone Pin",
          width: 110,
          render: (data) => {
            return (
              <span>
                {data.phone_pin !== "" && data.phone_pin !== null ? (
                  <Label>{data.phone_pin}</Label>
                ) : (
                  <>-</>
                )}
              </span>
            );
          },
        },
        {
          label: "Date",
          prop: "created_at",
        },
        {
          label: "Actions",
          fixed: "right",
          width: 100,
          render: (data) => {
            return (
              <span>
                <span>
                  <Link
                    // to={`edit/${data.id}`}
                    onClick={() =>
                      check_permission("users/update", `edit/${data.id}`)
                    }
                  >
                    <Button type="text" size="small">
                      Edit
                    </Button>
                  </Link>
                </span>
                {data.user_status === "Registered" ? (
                  <div>
                    <Button
                      type="text"
                      size="small"
                      onClick={(event) => self.updatePassword(event, data)}
                    >
                      Set Password
                    </Button>
                  </div>
                ) : (
                  <>
                    <br />
                  </>
                )}
                <Button
                  type="text"
                  size="small"
                  onClick={(event) => self.ordersCount(event, data)}
                >
                  Orders
                </Button>
              </span>
            );
          },
        },
      ],
    };
    this.updateClientStatus = this.updateClientStatus.bind(this);
    this.renderEditAreaModal = this.renderEditAreaModal.bind(this);
    this.toggleEditModal = this.toggleEditModal.bind(this);
  }

  async componentDidMount() {
    let clients = await this.get_all_clients(this.state.currentPage);
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    this.setState({
      data: clients.users,
      clients_data: clients,
      activePage: 1,
      totalItemsCount: clients.paging_data.total_records,
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
    });
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
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
        console.log("error", error);
      });

    return all_cities;
  };

  cities_dropdown_json = (all_cities) => {
    let cities_dropdown_data = [];

    all_cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return cities_dropdown_data;
  };

  get_all_clients = async (page_num, search) => {
    const {
      value2,
      select_cities_client,
      select_status_client,
      activeTab,
      city_search_type,
    } = this.state;
    let clients = [];
    let url =
      servicePath +
      "/api/v2/users.json?default_role=Client&is_paginated=true&page=" +
      page_num;

    if (search === undefined) {
      // Do Nothing
    } else {
      url += "&search_data=" + search;
    }

    let date = value2;

    if (date === null || date === "") {
      date = "";
    } else {
      url += "&date=" + date;
    }

    let city_ids = [];
    city_ids = select_cities_client.map((single_city) => single_city.value);

    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }

    let statuses = [];
    statuses = select_status_client.map((single_status) => single_status.value);

    if (statuses.length) {
      url += "&statuses=" + statuses;
    }

    if (statuses.length === 0) {
      if (activeTab === "All") {
        // Do Nothing
      } else if (activeTab === "Guest User") {
        url += "&user_status=Unregistered";
      } else {
        url += "&approved_status=" + activeTab;
      }
    }
    // if (localStorage.getItem("user_default_role") === "Admin") {
    url += "&city_filter_type=" + city_search_type.value;
    // }

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
        if (response.status === 200 && response.data.users.length > 0) {
          clients = response.data;
        } else {
          NotificationManager.error(
            "Record not found",
            "",
            3000,
            null,
            null,
            "filled"
          );
          clients = response.data;
          this.props.history.push("/app/clients/list");
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
    return clients;
  };

  approveClient = async (event, data) => {
    let allclients = this.state.data;

    if (data.cnic === null || data.cnic === "") {
      NotificationManager.error(
        "Cannot approve client. No CNIC found",
        "",
        5000,
        () => {},
        null,
        "filled"
      );
    } else {
      let self = this;
      await trackPromise(
        axios({
          method: "put",
          url: servicePath + "/api/v2/users/" + data.id + ".json",
          data: {
            user: {
              approved_status: "Approved",
              is_cnic_verified: true,
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
            const new_client = response.data;
            const index = allclients.findIndex(
              (client) => client.id === new_client.id
            );

            if (index === -1) {
              // Did not find matching client
            } else {
              allclients[index] = new_client;
            }
            self.setState({
              updatedClient: response.data,
              data: allclients,
            });
            NotificationManager.success(
              "Approved Successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
            window.location.reload();
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
  };

  flagClientRequest = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url:
          servicePath +
          "/api/v2/users/" +
          this.state.clientId +
          "/user_flag.json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "User has been flagged",
            "",
            3000,
            null,
            null,
            "filled"
          );
          window.location.reload();
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

  updateClientStatus = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    let self = this;
    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/users/" + this.state.clientId + ".json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          if (self.state.userAction === "block") {
            NotificationManager.success(
              "User has been blocked",
              "",
              3000,
              null,
              null,
              "filled"
            );
          } else {
            NotificationManager.success(
              "Unverified ",
              "",
              3000,
              null,
              null,
              "filled"
            );
          }
          window.location.reload();
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

  updateClientPassword = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/users/" + this.state.clientId + ".json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Password has been updated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          window.location.reload();
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

  set_client_status_dropdown = (status) => {
    sessionStorage.setItem("status_ids_clients", JSON.stringify(status));
    this.setState({
      select_status_client: status,
    });
  };

  set_client_cities_dropdown = (city) => {
    sessionStorage.setItem("city_ids_clients", JSON.stringify(city));
    this.setState({
      select_cities_client: city,
    });
  };

  set_city_type = (city_type) => {
    sessionStorage.setItem("city_type", JSON.stringify(city_type));
    this.setState({
      city_search_type: city_type,
    });
  };

  // filterClients = async (event) => {
  //   event.preventDefault();
  //   const { value2, select_cities_client } = this.state;
  //   let self = this;
  //   let city_ids = [];
  //   let statuses = [];
  //   let date = value2;
  //   let user_status = "";

  //   if (date === null) {
  //     date = "";
  //   }

  //   if (event.target.elements["city_ids"].value.length > 0) {
  //     city_ids = event.target.elements["city_ids"].value;
  //   } else if (event.target.elements["city_ids"].length > 0) {
  //     event.target.elements["city_ids"].forEach((id) => {
  //       city_ids.push(id.value);
  //     });
  //   }

  //   if (event.target.elements["statuses"].value.length > 0) {
  //     statuses = event.target.elements["statuses"].value;
  //   } else if (event.target.elements["statuses"].length > 0) {
  //     event.target.elements["statuses"].forEach((id) => {
  //       if (id.value === "Guest User") {
  //         user_status = "Unregistered";
  //       } else {
  //         statuses.push(id.value);
  //       }
  //     });
  //   }

  //   await axios({
  //     method: "get",
  //     url:
  //       servicePath +
  //       "/api/v2/users.json?&default_role=Client&is_paginated=true&city_ids=" +
  //       [city_ids] +
  //       "&date=" +
  //       date +
  //       "&statuses=" +
  //       [statuses] +
  //       "&user_status=" +
  //       user_status,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "AUTH-TOKEN": localStorage.getItem("auth_token"),
  //     },
  //   })
  //     .then((response) => {
  //       if (response.data.users.length > 0) {
  //         self.setState({
  //           data: response.data.users,
  //           clients_data: response.data,
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       NotificationManager.error(
  //         error.response.data.message,
  //         "",
  //         5000,
  //         () => {
  //           alert("callback");
  //         },
  //         null,
  //         "filled"
  //       );
  //       console.log("error", error);
  //     });
  // };

  clear_form = async (event) => {
    sessionStorage.removeItem("city_ids_clients");
    sessionStorage.removeItem("status_ids_clients");
    sessionStorage.removeItem("date_orders");
    sessionStorage.removeItem("city_type");
    this.state.select_status_client = [];
    this.state.select_cities_client = [];
    this.state.value2 = null;
    this.state.activeTab = "All";

    let new_clients = await this.get_all_clients(1);
    this.setState({
      activePage: 1,
      totalItemsCount: new_clients.paging_data.total_records,
      data: new_clients.users || [],
      clients_data: new_clients,
      city_search_type: {
        label: "Search by Signup city",
        value: "signup_city",
        key: 0,
      },
    });
  };

  set_reason_column = () => {
    this.state.columns.push({
      label: "Reason",
      prop: "rejection_note",
    });
  };

  remove_reason_column = () => {
    this.state.columns.filter((single_col) => single_col.label !== "Reason");
  };

  get_client_by_status = async (event, status) => {
    const { value2, select_cities_client, city_search_type } = this.state;
    let self = this;
    let clients = [];
    let success = false;

    let url =
      servicePath +
      "/api/v2/users.json?default_role=Client&is_paginated=true&page=1";

    if (status === "All") {
      // Do Nothing
    } else if (status === "Guest User") {
      url += "&user_status=Unregistered";
    } else {
      url += "&approved_status=" + status;
    }

    let date = value2;

    if (date === null || date === "") {
      date = "";
    } else {
      url += "&date=" + date;
    }

    let city_ids = [];
    city_ids = select_cities_client.map((single_city) => single_city.value);

    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }
    if (localStorage.getItem("user_default_role") === "Admin") {
      url += "&city_filter_type=" + city_search_type.value;
    }

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
          success = true;
          // clients = response.data.users;
          clients = response.data;
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

    if (success) {
      if (status === "Rejected") {
        self.set_reason_column();
      } else {
        self.remove_reason_column();
      }

      self.setState({
        data: clients.users,
        clients_data: clients,
        activeTab: status,
        activePage: 1,
        totalItemsCount: clients.paging_data.total_records,
      });
    } else {
      self.setState({
        data: [],
        clients_data: [],
        activeTab: status,
        activePage: 1,
        totalItemsCount: clients.paging_data.total_records,
      });
    }
  };

  handleChangeStart = (date) => {
    this.setState({
      startDateRange: date,
    });
  };

  handleChangeEnd = (date) => {
    this.setState({
      endDateRange: date,
    });
  };

  rejectClient = (event, data) => {
    event.preventDefault();

    this.setState({
      userAction: "unverify",
      modalOpen: true,
      clientId: data.id,
    });
  };

  blockClient = (event, data) => {
    event.preventDefault();

    this.setState({
      userAction: "block",
      modalOpen: true,
      clientId: data.id,
    });
  };

  updatePassword = async (event, data) => {
    event.preventDefault();
    let result = await check_permission("users/update", "");
    if (result) {
      this.setState({
        userAction: "update_password",
        modalOpen: true,
        clientId: data.id,
      });
    }
  };

  ordersCount = (event, data) => {
    this.setState({
      userAction: "orders_count",
      modalOpen: true,
      clientId: data.id,
      new_orders_count: data.new_orders_count,
      completed_orders_count: data.completed_orders_count,
      cancelled_orders_count: data.cancelled_orders_count,
    });
  };

  flagClient = (event, data) => {
    event.preventDefault();

    this.setState({
      userAction: "flag",
      modalOpen: true,
      clientId: data.id,
    });
  };

  toggleEditModal = () => {
    this.setState((prevState) => ({
      modalOpen: !prevState.modalOpen,
    }));
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    let new_clients_data = await this.get_all_clients(1);

    this.setState({
      activePage: 1,
      totalItemsCount: new_clients_data.paging_data.total_records,
      data: new_clients_data.users || [],
      clients_data: new_clients_data,
    });
  };

  render_status_filter = () => {
    const { activeTab, client_statuses, select_status_client } = this.state;
    if (activeTab === "All") {
      return (
        <>
          <Colxx xxs="3">
            <Select
              components={{ Input: CustomSelectInput }}
              isMulti
              className="react-select"
              classNamePrefix="react-select"
              placeholder="Status"
              name="statuses"
              value={select_status_client}
              onChange={this.set_client_status_dropdown}
              options={client_statuses}
            />
          </Colxx>
        </>
      );
    }
  };

  render_filter_bar = () => {
    const { all_cities_json, select_cities_client, value2, city_search_type } =
      this.state;
    const city_filter_type_params = [
      { label: "Search by SignUp city", value: "signup_city", key: 0 },
      { label: "Search by Current city", value: "current_city", key: 1 },
    ];
    let top_nav_html = (
      <>
        <Row>
          <Colxx xxs="12">
            {/* <form onSubmit={this.filterClients} id="order-filter"> */}
            <form onSubmit={this.handleSubmit} id="order-filter">
              <Row>
                <Colxx xxs="1">
                  <Label className="mt-2">
                    <strong>Filters</strong>
                  </Label>
                </Colxx>
                <Colxx xxs="3" className="mb-3">
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
                </Colxx>
                <Colxx xxs="3">
                  <Select
                    components={{ Input: CustomSelectInput }}
                    isMulti
                    className="react-select"
                    classNamePrefix="react-select"
                    placeholder="Select City"
                    name="city_ids"
                    value={select_cities_client}
                    onChange={this.set_client_cities_dropdown}
                    options={all_cities_json}
                  />
                </Colxx>
                {/* {localStorage.getItem("user_default_role") === "Admin" ? ( */}
                <>
                  <Colxx xxs="2">
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      placeholder="Select"
                      name="city_filter_type"
                      value={city_search_type}
                      onChange={this.set_city_type}
                      options={city_filter_type_params}
                    />
                  </Colxx>
                </>
                {/* ) : (
                  <></>
                )} */}

                {/* {this.render_status_filter()} */}
                <Colxx xxs="1">
                  <Input
                    color="primary"
                    size="sm"
                    type="submit"
                    style={{ height: "38px" }}
                  >
                    Submit
                  </Input>
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

  renderEditAreaModal = () => {
    if (this.state.userAction === "unverify") {
      const reasons = [
        {
          label: "Incorrect CNIC",
          value: "Incorrect CNIC",
          key: "incorrect_cnic",
        },
        {
          label: "Incorrect Phone",
          value: "Incorrect Phone",
          key: "incorrect_phone",
        },
        {
          label: "Incorrect Name",
          value: "Incorrect Name",
          key: "incorrect_name",
        },
        { label: "No go Area", value: "No go Area", key: "no_area" },
        { label: "Spam", value: "Spam", key: "spam" },
      ];
      return (
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleEditModal}>
          <form onSubmit={this.updateClientStatus}>
            <ModalHeader toggle={this.toggleEditModal}>
              Reason for Unverify
            </ModalHeader>
            <ModalBody>
              <Label>Reason *</Label>
              <Input
                hidden
                className="form-control"
                name="user[approved_status]"
                value="Rejected"
              />
              <Select
                className="react-select"
                classNamePrefix="react-select"
                name="user[rejection_note]"
                defaultValue={reasons[0]}
                options={reasons}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                outline
                type="button"
                onClick={this.toggleEditModal}
              >
                Cancel
              </Button>
              <Input color="primary" type="submit">
                Submit
              </Input>
            </ModalFooter>
          </form>
        </Modal>
      );
    } else if (this.state.userAction === "block") {
      return (
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleEditModal}>
          <form onSubmit={this.updateClientStatus}>
            <ModalHeader toggle={this.toggleEditModal}>
              {" "}
              Reason for Block{" "}
            </ModalHeader>
            <ModalBody>
              <Label>Reason*</Label>
              <Input
                className="form-control"
                name="user[is_blocked]"
                type="text"
                value="true"
                hidden
              />
              <Input
                className="form-control"
                name="user[reason_to_block]"
                type="textarea"
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                outline
                type="button"
                onClick={this.toggleEditModal}
              >
                Cancel
              </Button>
              <Input color="primary" type="submit">
                Submit
              </Input>
            </ModalFooter>
          </form>
        </Modal>
      );
    } else if (this.state.userAction === "flag") {
      return (
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleEditModal}>
          <form onSubmit={this.flagClientRequest}>
            <ModalHeader toggle={this.toggleEditModal}>
              Reason for Flag
            </ModalHeader>
            <ModalBody>
              <Label>Reason *</Label>
              <Input type="textarea" name="user_flag[flag_reason]" required />
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                outline
                type="button"
                onClick={this.toggleEditModal}
              >
                Cancel
              </Button>
              <Input color="primary" type="submit">
                Submit
              </Input>
            </ModalFooter>
          </form>
        </Modal>
      );
    } else if (this.state.userAction === "update_password") {
      return (
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleEditModal}>
          <form onSubmit={this.updateClientPassword}>
            <ModalHeader toggle={this.toggleEditModal}>
              Set Password
            </ModalHeader>
            <ModalBody>
              <Label>New Password *</Label>
              <Input
                type="password"
                name="user[password]"
                defaultValue=""
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                outline
                type="button"
                onClick={this.toggleEditModal}
              >
                Cancel
              </Button>
              <Input color="primary" type="submit">
                Update
              </Input>
            </ModalFooter>
          </form>
        </Modal>
      );
    } else if (this.state.userAction === "orders_count") {
      return (
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleEditModal}>
          <ModalHeader toggle={this.toggleEditModal}>Orders Count</ModalHeader>
          <ModalBody>
            <Row>
              <Colxx md="6">
                <Label>New Orders :</Label>
              </Colxx>
              <Colxx md="6">{this.state.new_orders_count}</Colxx>
            </Row>
            <Row>
              <Colxx md="6">
                <Label>Completed Orders :</Label>
              </Colxx>
              <Colxx md="6">{this.state.completed_orders_count}</Colxx>
            </Row>
            <Row>
              <Colxx md="6">
                <Label>Cancelled Orders :</Label>
              </Colxx>
              <Colxx md="6">{this.state.cancelled_orders_count}</Colxx>
            </Row>
          </ModalBody>
        </Modal>
      );
    }
  };

  change_current_page = async (event) => {
    event.preventDefault();
    const { currentPage } = this.state;
    let new_page_num = null;
    let new_clients_data = [];

    if (
      event.target.classList.value === "simple-icon-arrow-right" ||
      event.target.classList.value.includes("next")
    ) {
      new_page_num = currentPage + 1;
    } else if (
      event.target.classList.value === "simple-icon-arrow-left" ||
      event.target.classList.value.includes("prev")
    ) {
      new_page_num = currentPage - 1;
    }

    new_clients_data = await this.get_all_clients(new_page_num);

    this.setState({
      activePage: new_page_num,
      totalItemsCount: new_clients_data.paging_data.total_records,
      data: new_clients_data.users,
      clients_data: new_clients_data,
    });
  };

  handlePageChange = async (pageNum) => {
    let clients = await this.get_all_clients(pageNum);
    this.setState({
      data: clients.users,
      clients_data: clients,
      activePage: pageNum,
      totalItemsCount: clients.paging_data.total_records,
    });
  };

  search_client = async (event) => {
    event.preventDefault();
    let self = this;
    const { currentPage } = this.state;
    let formData = new FormData(event.target);

    let search_key = event.target.elements["search_key"].value;
    let search_val = event.target.elements["search_value"].value;

    for (var pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    let url = null;

    url =
      servicePath +
      "/api/v2/users.json?default_role=Client&is_paginated=true&page=" +
      currentPage +
      "&search_key=" +
      search_key +
      "&search_value=" +
      search_val;

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
          self.setState({
            data: response.data.users,
            clients_data: response.data,
            activePage: 1,
            totalItemsCount: response.data.paging_data.total_records,
          });
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

  render_search_bar = () => {
    const search_parms = [
      { label: "Client ID", value: "client_id", key: 0 },
      { label: "Phone", value: "phone_number", key: 1 },
      { label: "CNIC", value: "cnic", key: 2 },
    ];

    return (
      <>
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.search_client} id="order-filter">
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
                      key: 1,
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
                  <Input color="primary" size="sm" type="submit">
                    Submit
                  </Input>
                </Colxx>
              </Row>
            </form>
          </Colxx>
        </Row>
      </>
    );
  };

  render() {
    const { data, clients_data, activePage, totalItemsCount } = this.state;
    let self = this;
    if ((data !== undefined && data.length > 0) || data.length === 0) {
      return (
        <Fragment>
          <h1>Clients</h1>
          <Link
            // to={`/app/clients/new_client`}
            onClick={() =>
              check_permission("users/create", `/app/clients/new_client`)
            }
          >
            <Button style={{ float: "right" }} color="primary" size="lg">
              Add New
            </Button>
          </Link>
          <Separator className="mb-5 mt-2" />
          {this.render_search_bar()}
          {this.render_filter_bar()}
          <Row>
            <Colxx xxs="12">
              <Tabs
                activeName="All"
                onTabClick={(tab) => {
                  this.get_client_by_status(tab, tab.props.name);
                }}
              >
                <Tabs.Pane
                  label={"All (" + (clients_data.all_count || 0) + ")"}
                  name="All"
                >
                  <Colxx xxs="12">
                    <Card className="mb-4">
                      <CardBody>
                        <Table
                          style={{ width: "100%" }}
                          columns={this.state.columns}
                          data={this.state.data}
                          border={false}
                          onCurrentChange={(item) => {
                            console.log(item);
                          }}
                          className="mb-5"
                        />
                      </CardBody>
                    </Card>
                  </Colxx>
                </Tabs.Pane>
                <Tabs.Pane
                  label={
                    "Approved (" + (clients_data.approved_count || 0) + ")"
                  }
                  name="Approved"
                >
                  <Colxx xxs="12">
                    <Card className="mb-4">
                      <CardBody>
                        <Table
                          style={{ width: "100%" }}
                          columns={this.state.columns}
                          data={this.state.data}
                          border={false}
                          onCurrentChange={(item) => {
                            console.log(item);
                          }}
                          className="mb-5"
                        />
                      </CardBody>
                    </Card>
                  </Colxx>
                </Tabs.Pane>
                <Tabs.Pane
                  label={"Pending (" + (clients_data.pending_count || 0) + ")"}
                  name="Pending"
                >
                  <Colxx xxs="12">
                    <Card className="mb-4">
                      <CardBody>
                        <Table
                          style={{ width: "100%" }}
                          columns={this.state.columns}
                          data={this.state.data}
                          border={false}
                          onCurrentChange={(item) => {
                            console.log(item);
                          }}
                          className="mb-5"
                        />
                      </CardBody>
                    </Card>
                  </Colxx>
                </Tabs.Pane>
                <Tabs.Pane
                  label={
                    "Rejected (" + (clients_data.rejected_count || 0) + ")"
                  }
                  name="Rejected"
                >
                  <Colxx xxs="12">
                    <Card className="mb-4">
                      <CardBody>
                        <Table
                          style={{ width: "100%" }}
                          columns={this.state.columns}
                          data={this.state.data}
                          border={false}
                          onCurrentChange={(item) => {
                            console.log(item);
                          }}
                          className="mb-5"
                        />
                      </CardBody>
                    </Card>
                  </Colxx>
                </Tabs.Pane>
                <Tabs.Pane
                  label={"Guest User (" + (clients_data.guest_count || 0) + ")"}
                  name="Guest User"
                >
                  <Colxx xxs="12">
                    <Card className="mb-4">
                      <CardBody>
                        <Table
                          style={{ width: "100%" }}
                          columns={this.state.columns}
                          data={this.state.data}
                          border={false}
                          onCurrentChange={(item) => {
                            console.log(item);
                          }}
                          className="mb-5"
                        />
                      </CardBody>
                    </Card>
                  </Colxx>
                </Tabs.Pane>
              </Tabs>
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12">
              {/* {this.render_pagination_buttons()} */}
              <Pagination
                activePage={activePage}
                itemsCountPerPage={20}
                totalItemsCount={totalItemsCount}
                delimeter={5}
                onChange={self.handlePageChange}
                styling="rounded_primary"
              />
            </Colxx>
          </Row>
          {this.renderEditAreaModal()}
        </Fragment>
      );
    } else {
      return <>{/* <h3>You are not authorize to access this page.</h3> */}</>;
    }
  }
}
