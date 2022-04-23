import React, { Component } from "react";
import { Row, Button, Table, Label, Card, CardBody, Input } from "reactstrap";

import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import UsersListView from "./UsersListView";
import ListPageHeading from "../../../containers/pages/ListPageHeading";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { Tabs } from "element-react";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/technicians.json";

class UsersList extends Component {
  constructor(props) {
    super(props);

    this.mouseTrap = require("mousetrap");

    let city_ids_tech = sessionStorage.getItem("city_ids_tech");
    if (city_ids_tech === null) {
      city_ids_tech = [];
    } else {
      city_ids_tech = JSON.parse(city_ids_tech);
    }

    let status_ids_tech = sessionStorage.getItem("status_ids_tech");
    if (status_ids_tech === null) {
      status_ids_tech = [];
    } else {
      status_ids_tech = JSON.parse(status_ids_tech);
    }

    let gender_ids_tech = sessionStorage.getItem("gender_ids_tech");
    if (gender_ids_tech === null) {
      gender_ids_tech = [];
    } else {
      gender_ids_tech = JSON.parse(gender_ids_tech);
    }

    this.state = {
      displayMode: "list",
      all_cities: [],
      all_cities_json: [],
      technician_data_by_status: [],
      select_gender_tech: gender_ids_tech,
      select_city_tech: city_ids_tech,
      select_status_tech: status_ids_tech,
      value2: "",
      technicians_response: [],
      activeTab: "All",
      gender_dropdown: [
        {
          label: "Male",
          value: "Male",
          key: 1,
        },
        {
          label: "Female",
          value: "Female",
          key: 2,
        },
      ],
      technician_statuses: [
        {
          label: "Beginner(In Training)",
          value: "Beginner(In Training)",
          key: 1,
        },
        {
          label: "Intermediate(In Training)",
          value: "Intermediate(In Training)",
          key: 2,
        },
        {
          label: "Advanced(In Training)",
          value: "Advanced(In Training)",
          key: 3,
        },
        {
          label: "Active",
          value: "Active",
          key: 4,
        },
        {
          label: "On leaves",
          value: "On leaves",
          key: 5,
        },
        {
          label: "Suspended",
          value: "Suspended",
          key: 6,
        },
        {
          label: "Terminated",
          value: "Terminated",
          key: 7,
        },
        {
          label: "Resigned",
          value: "Resigned",
          key: 8,
        },
        {
          label: "Missing in action",
          value: "Missing in action",
          key: 9,
        },
        {
          label: "Contract ended",
          value: "Contract ended",
          key: 10,
        },
      ],
      modalOpen: false,
      currentPage: 1,
      totalItemsCount: 0,
      totalPage: 1,
      search: "",
      selectedItems: [],
      lastChecked: null,
      isLoading: false,
      first_name: "",
      last_name: "",
      cnic: "",
      gender: "",
      default_role: "Technician",
      phone: "",
      userAction: "new",
      serviceCategoryToEdit: "",
      deleteConfirmationModal: false,
      userToDelete: "",
      activePage: 1,
      page_num: 1,
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.editServiceCategory = this.editServiceCategory.bind(this);
    this.serializeForm = this.serializeForm.bind(this);
  }

  async componentDidMount() {
    await this.dataListRender(1);
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    this.setState({
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
    });
  }

  set_tech_gender_dropdown = (gender) => {
    sessionStorage.setItem("gender_ids_tech", JSON.stringify(gender));
    this.setState({
      select_gender_tech: gender,
    });
  };

  set_tech_cities_dropdown = (city) => {
    sessionStorage.setItem("city_ids_tech", JSON.stringify(city));
    this.setState({
      select_city_tech: city,
    });
  };

  set_tech_status_dropdown = (status) => {
    sessionStorage.setItem("status_ids_tech", JSON.stringify(status));
    this.setState({
      select_status_tech: status,
    });
  };

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

  filterTechnician = async (event) => {
    event.preventDefault();
    let self = this;
    let city_ids = [];
    let gender = [];

    if (event.target.elements["city_ids"].value.length > 0) {
      city_ids = event.target.elements["city_ids"].value;
    } else if (event.target.elements["city_ids"].length > 0) {
      event.target.elements["city_ids"].forEach((id) => {
        city_ids.push(id.value);
      });
    }

    if (event.target.elements["gender"].value.length > 0) {
      gender = event.target.elements["gender"].value;
    } else if (event.target.elements["gender"].length > 0) {
      event.target.elements["gender"].forEach((id) => {
        gender.push(id.value);
      });
    }

    // if (event.target.elements["statuses"].value.length > 0) {
    //   statuses = event.target.elements["statuses"].value;
    // } else if (event.target.elements["statuses"].length > 0) {
    //   event.target.elements["statuses"].forEach((id) => {
    //     statuses.push(id.value);
    //   });
    // }

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/technicians.json?default_role=Technician&is_paginated=true&city_ids=" +
          city_ids +
          "&gender=" +
          gender,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.data.users.length > 0) {
          self.setState({
            technicians_response: response.data,
            selectedItems: response.data.users,
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

  toggleModal = (event) => {
    event.preventDefault();
    if (this.state.modalOpen === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        modalOpen: !this.state.modalOpen,
        userAction: "new",
      });
    } else {
      this.setState({
        modalOpen: !this.state.modalOpen,
      });
    }
  };

  deleteUser = async () => {
    let self = this;

    await trackPromise(
      axios.delete(
        servicePath +
          "/api/v2/technicians/" +
          this.state.userToDelete +
          ".json",
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
          self.setState({
            selectedItems: self.state.selectedItems.filter(
              (item) => item.id !== response.data.id
            ),
            totalItemsCount: self.state.totalItemsCount - 1,
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

  editServiceCategory = (service_category, event) => {
    event.preventDefault();

    this.setState({
      userAction: "edit",
      modalOpen: true,
      serviceCategoryToEdit: service_category,
    });
  };

  serializeForm = (formElement) => {
    let inputElements = formElement.getElementsByTagName("input");
    let jsonObject = {};
    for (let i = 0; i < inputElements.length; i++) {
      let inputElement = inputElements[i];
      if (inputElement.value !== "") {
        jsonObject[inputElement.name] = inputElement.value;
      }
    }
    return jsonObject;
  };

  changeDisplayMode = (mode) => {
    this.setState({
      displayMode: mode,
    });
    return false;
  };

  dataListRender = async (page_num) => {
    const {
      search,
      select_gender_tech,
      select_city_tech,
      activeTab,
    } = this.state;

    let url =
      apiUrl + "?default_role=Technician&is_paginated=true&page=" + page_num;
    let success = false;
    let reqResponse = null;

    if (search === undefined || search === "") {
      //do nothing
    } else {
      url += "&search_data=" + search;
    }

    if (select_gender_tech.length > 0) {
      let genders = [];
      select_gender_tech.forEach((gender) => {
        genders += gender.value + ",";
      });
      url += "&gender=" + genders;
    }

    if (select_city_tech.length > 0) {
      let cities = [];
      select_city_tech.forEach((city) => {
        cities += city.value + ",";
      });
      url += "&city_ids=" + cities;
    }

    if (activeTab === "All") {
      // do nothing
    } else {
      url += "&tech_status=" + activeTab;
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
        success = true;
        reqResponse = response;
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          3000,
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    if (success) {
      this.setState({
        activePage: page_num,
        selectedItems: reqResponse.data.users,
        technicians_response: reqResponse.data,
        totalItemsCount: reqResponse.data.paging_data.total_records,
      });
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    await this.dataListRender(1);

    // this.setState({
    //   currentPage: 1,
    //   data: new_clients_data.users || [],
    //   clients_data: new_clients_data,
    // });
  };

  get_technician_by_status = async (status_param) => {
    const { select_city_tech, select_gender_tech } = this.state;
    let url =
      servicePath +
      "/api/v2/technicians.json?default_role=Technician&is_paginated=true";
    let status = status_param.props.name;
    let self = this;

    if (status === "All") {
      // do nothing
    } else if (status === "Active") {
      url =
        servicePath +
        "/api/v2/technicians.json?default_role=Technician&is_paginated=true&tech_status=Active";
    } else if (status === "Inactive") {
      url =
        servicePath +
        "/api/v2/technicians.json?default_role=Technician&is_paginated=true&tech_status=Inactive";
    } else if (status === "Onleaves") {
      url =
        servicePath +
        "/api/v2/technicians.json?default_role=Technician&is_paginated=true&tech_status=On leaves";
    } else if (status === "Missing in action") {
      url =
        servicePath +
        "/api/v2/technicians.json?default_role=Technician&is_paginated=true&tech_status=Missing in action";
    } else if (status === "Contract ended") {
      url =
        servicePath +
        "/api/v2/technicians.json?default_role=Technician&is_paginated=true&tech_status=Contract ended";
    } else {
      url =
        servicePath +
        "/api/v2/technicians.json?default_role=Technician&is_paginated=true&tech_status=Training";
    }

    if (select_city_tech.length > 0) {
      let cities = [];
      select_city_tech.forEach((city) => {
        cities += city.value + ",";
      });
      url += "&city_ids=" + cities;
    }
    if (select_gender_tech.length > 0) {
      let genders = [];
      select_gender_tech.forEach((gender) => {
        genders += gender.value + ",";
      });
      url += "&gender=" + genders;
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
    ).then((response) => {
      self.setState({
        activeTab: status,
        activePage: 1,
        selectedItems: response.data.users,
        technicians_response: response.data,
        totalItemsCount: response.data.paging_data.total_records,
      });
    });
  };

  clear_form = async (event) => {
    sessionStorage.removeItem("city_ids_tech");
    sessionStorage.removeItem("status_ids_tech");
    sessionStorage.removeItem("gender_ids_tech");

    this.state.select_status_tech = [];
    this.state.select_city_tech = [];
    this.state.select_gender_tech = [];

    await this.dataListRender(1);
  };

  search_technician = async (event) => {
    event.preventDefault();

    const { currentPage } = this.state;

    let search_key = event.target.elements["search_key"].value;
    let search_val = event.target.elements["search_value"].value;

    let url = null;
    let success = false;
    let reqResponse = null;

    url =
      servicePath +
      "/api/v2/technicians.json?default_role=Technician&is_paginated=true&page=" +
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
          success = true;
          reqResponse = response;
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

    if (success) {
      this.setState({
        selectedItems: reqResponse.data.users,
        technicians_response: reqResponse.data,
        totalItemsCount: reqResponse.data.paging_data.total_records,
      });
    }
  };

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);
  };

  render_search_bar = () => {
    const search_parms = [
      { label: "Technician ID", value: "technician_id", key: 0 },
      { label: "Phone", value: "phone_number", key: 1 },
    ];

    return (
      <>
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.search_technician}>
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
                      label: "Technician ID",
                      value: "technician_id",
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

  render() {
    const {
      currentPage,
      items,
      displayMode,
      selectedPageSize,
      totalItemsCount,
      selectedOrderOption,
      selectedItems,
      orderOptions,
      pageSizes,
      all_cities_json,
      gender_dropdown,
      technicians_response,
      activePage,
    } = this.state;
    let self = this;
    const { match } = this.props;
    const startIndex = (currentPage - 1) * selectedPageSize;
    const endIndex = currentPage * selectedPageSize;
    if (technicians_response.users !== undefined) {
      return (
        <div>
          <ListPageHeading
            heading="Technicians"
            displayMode={displayMode}
            changeDisplayMode={this.changeDisplayMode}
            handleChangeSelectAll={this.handleChangeSelectAll}
            changeOrderBy={this.changeOrderBy}
            changePageSize={this.changePageSize}
            selectedPageSize={selectedPageSize}
            totalItemCount={totalItemsCount}
            selectedOrderOption={selectedOrderOption}
            match={match}
            startIndex={startIndex}
            endIndex={endIndex}
            selectedItemsLength={selectedItems ? selectedItems.length : 0}
            itemsLength={items ? items.length : 0}
            onSearchKey={this.onSearchKey}
            orderOptions={orderOptions}
            pageSizes={pageSizes}
            toggleModal={this.toggleModal}
            linkButton={true}
            link_component="new"
          />
          {this.render_search_bar()}
          <Row>
            <Colxx xxs="12">
              {/* <form onSubmit={this.filterTechnician} id="order-filter"> */}
              <form onSubmit={this.handleSubmit} id="order-filter">
                <Row>
                  <Colxx xxs="1">
                    <Label className="mt-2">
                      <strong>Filters</strong>
                    </Label>
                  </Colxx>
                  <Colxx xxs="3">
                    <Select
                      components={{ Input: CustomSelectInput }}
                      isMulti
                      className="react-select"
                      classNamePrefix="react-select"
                      placeholder="Select Gender"
                      value={this.state.select_gender_tech}
                      onChange={this.set_tech_gender_dropdown}
                      name="gender"
                      options={gender_dropdown}
                    />
                  </Colxx>
                  <Colxx xxs="3">
                    <Select
                      components={{ Input: CustomSelectInput }}
                      isMulti
                      className="react-select"
                      classNamePrefix="react-select"
                      placeholder="Select City"
                      name="city_ids"
                      value={this.state.select_city_tech}
                      onChange={this.set_tech_cities_dropdown}
                      options={all_cities_json}
                    />
                  </Colxx>
                  {/* <Colxx xxs="3">
                    <Select
                      components={{ Input: CustomSelectInput }}
                      isMulti
                      className="react-select"
                      classNamePrefix="react-select"
                      placeholder="Status"
                      name="statuses"
                      value={this.state.select_status_tech}
                      onChange={this.set_tech_status_dropdown}
                      options={technician_statuses}
                    />
                  </Colxx> */}
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
          <Tabs
            activeName="All"
            onTabClick={(tab) => {
              self.get_technician_by_status(tab, tab.props.name);
            }}
          >
            <Tabs.Pane
              label={"All (" + technicians_response.all_count + ")"}
              name="All"
            >
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>GharPar-ID</th>
                          <th>Working Cities</th>
                          <th>Number</th>
                          <th>PhonePin</th>
                          <th>Status</th>
                          <th>Rating</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((singleItem) => {
                          return (
                            <UsersListView
                              key={singleItem.id}
                              user={singleItem}
                              toggleDeleteConfirmationModal={
                                this.toggleDeleteConfirmationModal
                              }
                            />
                          );
                        })}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane
              label={"Active (" + technicians_response.active_count + ")"}
              name="Active"
            >
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>GharPar-ID</th>
                          <th>Working Cities</th>
                          <th>Number</th>
                          <th>PhonePin</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((singleItem) => {
                          return (
                            <UsersListView
                              key={singleItem.id}
                              user={singleItem}
                              toggleDeleteConfirmationModal={
                                this.toggleDeleteConfirmationModal
                              }
                            />
                          );
                        })}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane
              label={"Inactive (" + technicians_response.inactive_count + ")"}
              name="Inactive"
            >
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>GharPar-ID</th>
                          <th>Working Cities</th>
                          <th>Number</th>
                          <th>PhonePin</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((singleItem) => {
                          return (
                            <UsersListView
                              key={singleItem.id}
                              user={singleItem}
                              toggleDeleteConfirmationModal={
                                this.toggleDeleteConfirmationModal
                              }
                            />
                          );
                        })}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane
              label={"Training (" + technicians_response.training_count + ")"}
              name="Training"
            >
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>GharPar-ID</th>
                          <th>Working Cities</th>
                          <th>Number</th>
                          <th>PhonePin</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((singleItem) => {
                          return (
                            <UsersListView
                              key={singleItem.id}
                              user={singleItem}
                              toggleDeleteConfirmationModal={
                                this.toggleDeleteConfirmationModal
                              }
                            />
                          );
                        })}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane
              label={"On Leaves (" + technicians_response.leave_count + ")"}
              name="Onleaves"
            >
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>GharPar-ID</th>
                          <th>Working Cities</th>
                          <th>Number</th>
                          <th>PhonePin</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((singleItem) => {
                          return (
                            <UsersListView
                              key={singleItem.id}
                              user={singleItem}
                              toggleDeleteConfirmationModal={
                                this.toggleDeleteConfirmationModal
                              }
                            />
                          );
                        })}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane
              label={
                "Missing in action (" +
                technicians_response.missing_in_action_count +
                ")"
              }
              name="Missing in action"
            >
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>GharPar-ID</th>
                          <th>Working Cities</th>
                          <th>Number</th>
                          <th>PhonePin</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((singleItem) => {
                          return (
                            <UsersListView
                              key={singleItem.id}
                              user={singleItem}
                              toggleDeleteConfirmationModal={
                                this.toggleDeleteConfirmationModal
                              }
                            />
                          );
                        })}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane
              label={
                "Contract ended (" +
                technicians_response.contract_ended_count +
                ")"
              }
              name="Contract ended"
            >
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>GharPar-ID</th>
                          <th>Working Cities</th>
                          <th>Number</th>
                          <th>PhonePin</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((singleItem) => {
                          return (
                            <UsersListView
                              key={singleItem.id}
                              user={singleItem}
                              toggleDeleteConfirmationModal={
                                this.toggleDeleteConfirmationModal
                              }
                            />
                          );
                        })}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
          </Tabs>
          <Row>
            <Colxx xxs="12">
              <Pagination
                activePage={activePage}
                itemsCountPerPage={20}
                totalItemsCount={totalItemsCount}
                delimeter={5}
                onChange={this.handlePageChange}
                styling="rounded_primary"
              />
            </Colxx>
            {/* <Colxx xxs="12">{this.render_pagination_buttons()}</Colxx> */}
          </Row>
        </div>
      );
    } else {
      return <></>;
    }
  }
}
export default UsersList;
