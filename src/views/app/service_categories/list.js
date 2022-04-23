import React, { Component } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Card,
  Table,
  CardBody,
  Badge,
  Row,
  Label,
} from "reactstrap";

import axios from "axios";
import { Tabs } from "element-react";
import { servicePath } from "../../../constants/defaultValues";
import ListPageHeading from "../../../containers/pages/ListPageHeading";
import AddNewServiceCategoryModal from "../../../containers/pages/AddNewServiceCategoryModal";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import { ContextMenuTrigger } from "react-contextmenu";
import { Link } from "react-router-dom";
import classnames from "classnames";
import { Colxx } from "../../../components/common/CustomBootstrap";
import IntlMessages from "../../../helpers/IntlMessages";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/service_categories.json";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      all_cities: [],
      all_cities_json: [],
      activeTab: "All",
      search_city: null,
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
      newServiceCategoryTitle: "",
      userAction: "new",
      serviceCategoryToEdit: "",
      deleteConfirmationModal: false,
      serviceCategoryToDelete: "",
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.createServiceCategory = this.createServiceCategory.bind(this);
    this.deleteServiceCategory = this.deleteServiceCategory.bind(this);
    // this.editServiceCategory = this.editServiceCategory.bind(this);
    // this.updateServiceCategory = this.updateServiceCategory.bind(this);
    // this.servicesPath = this.servicesPath.bind(this);
  }

  async componentDidMount() {
    let service_categories = await this.dataListRender();
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(all_cities);

    this.setState({
      selectedItems: service_categories,
      totalItemCount: service_categories.length,
      all_cities: all_cities,
      all_cities_json: cities_dropdown_data,
    });
  }

  handle_city_change = (city) => {
    this.setState({
      search_city: city,
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

    all_cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return cities_dropdown_data;
  };

  filterServiceCategories = async (event) => {
    event.preventDefault();
    let self = this;
    let city_id = [];

    if (event.target.elements["city_id"].value.length > 0) {
      city_id = event.target.elements["city_id"].value;
    }

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/service_categories.json?default_role=admin&city_id=" +
          city_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            selectedItems: response.data.service_categories,
          });
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
  onSearchKey = (e) => {
    if (e.key === "Enter") {
      this.setState(
        {
          search: e.target.value.toLowerCase(),
        },
        () => this.dataListRender()
      );
    }
  };

  deleteServiceCategory = async () => {
    let self = this;
    let success = false;
    const { serviceCategoryToDelete } = this.state;

    await trackPromise(
      axios.delete(
        servicePath +
          "/api/v2/service_categories/" +
          serviceCategoryToDelete +
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
          success = true;
          NotificationManager.success(
            "Deactivated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push("/app/service_categories/list");
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

    if (success) {
      let service_categories = await this.dataListRender();

      this.setState({
        selectedItems: service_categories,
        totalItemCount: service_categories.length,
      });
    }
  };

  activateServiceCategory = async (event, service_category) => {
    let success = false;
    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/v2/service_categories/" +
          service_category.id +
          ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
        data: {
          service_category: {
            is_active: true,
          },
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          success = true;
          NotificationManager.success(
            "Activated Successfully",
            "",
            3000,
            null,
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

    if (success) {
      let service_categories = await this.dataListRender();

      this.setState({
        selectedItems: service_categories,
        totalItemCount: service_categories.length,
      });
    }
  };

  servicesPath = async (service_category, event) => {
    event.preventDefault();
    let response = await check_permission("services/index", "");
    if (response) {
      this.props.history.push(
        `/app/service_categories/${service_category.id}/services`
      );
    }
  };

  createServiceCategory = async (event) => {
    event.preventDefault();
    let self = this;
    let formData = new FormData();
    formData.append(
      "service_category[category_icon]",
      event.target.elements["category-icon"].files[0],
      event.target.elements["category-icon"].files[0].name
    );
    formData.append(
      "service_category[category_picture]",
      event.target.elements["category-picture"].files[0],
      event.target.elements["category-picture"].files[0].name
    );
    formData.set(
      "service_category[is_active]",
      event.target.elements["is_active"].value
    );
    formData.set(
      "service_category[service_category_title]",
      event.target.elements["newServiceCategoryTitle"].value
    );
    await trackPromise(
      axios({
        method: "post",
        url: apiUrl,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            modalOpen: false,
            selectedItems: [response.data, ...this.state.selectedItems],
            totalItemCount: self.state.totalItemCount + 1,
          });
          NotificationManager.success(
            "Created Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push("/app/service_categories/list");
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
  };

  dataListRender = async () => {
    const { search_city, activeTab } = this.state;

    let url = apiUrl + "?default_role=admin";

    if (search_city !== null && Object.keys(search_city).length) {
      url += "&city_id=" + search_city.value;
    }

    if (activeTab === "All") {
      // Do nothing
    } else {
      url += "&is_category_active=" + activeTab;
    }

    let service_categories = [];

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
      if (response.data.service_categories.length > 0) {
        service_categories = response.data.service_categories;
      }
    });

    return service_categories;
  };

  toggleDeleteConfirmationModal = async (event, service_category) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        serviceCategoryToDelete: service_category.id,
      });
    } else {
      // if delete confirmed then, first call delete function for service category
      if (event.target.classList.contains("delete-confirmed")) {
        await this.deleteServiceCategory();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        serviceCategoryToDelete: "",
      });
    }
  };

  deleteConfirmation = (event, city) => {
    return (
      <Modal
        isOpen={this.state.deleteConfirmationModal}
        size="sm"
        toggle={this.toggleDeleteConfirmationModal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to deactivate service category ?
        </ModalHeader>
        <ModalBody>
          <Button
            size="sm"
            onClick={(event) => this.toggleDeleteConfirmationModal(event)}
            className="btn-success mr-2 delete-confirmed"
          >
            {" "}
            Yes{" "}
          </Button>
          <Button
            size="sm"
            onClick={(event) => this.toggleDeleteConfirmationModal(event)}
            className="btn-success"
          >
            {" "}
            Cancel{" "}
          </Button>
        </ModalBody>
      </Modal>
    );
  };

  renderServiceCategoryModal = (service_category, event) => {
    const userAction = this.state.userAction;
    const modalOpen = this.state.modalOpen;
    const toggleModal = this.toggleModal;
    const createServiceCategory = this.createServiceCategory;
    const updateServiceCategory = this.updateServiceCategory;
    const serviceCategoryToEdit = this.state.serviceCategoryToEdit;

    if (userAction === "edit") {
      return (
        <AddNewServiceCategoryModal
          modalOpen={modalOpen}
          toggleModal={toggleModal}
          updateServiceCategory={updateServiceCategory}
          userAction={userAction}
          serviceCategoryToEdit={serviceCategoryToEdit}
        />
      );
    } else if (userAction === "new") {
      return (
        <AddNewServiceCategoryModal
          modalOpen={modalOpen}
          toggleModal={toggleModal}
          createServiceCategory={createServiceCategory}
          userAction={userAction}
        />
      );
    }
  };

  service_categories_rows = () => {
    const { selectedItems } = this.state;

    let service_categories_html = [];

    selectedItems.forEach((service_category) => {
      if (service_category.is_deal === false) {
        service_categories_html.push(
          <Colxx xxs="12" className="mb-3">
            <ContextMenuTrigger id="menu_id" data={service_category.id}>
              <Card className={classnames("d-flex flex-row")}>
                <div
                  className={
                    service_category.is_active === true
                      ? "pl-2 d-flex flex-grow-1 min-width-zero"
                      : "pl-2 d-flex flex-grow-1 min-width-zero deactivated-row"
                  }
                >
                  <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                    <p className="list-item-heading mb-1 truncate">
                      {service_category.service_category_title}
                    </p>
                    <div className="w-15 w-sm-100">
                      <Badge pill>{service_category.is_active}</Badge>
                    </div>
                  </div>
                  <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                    {service_category.is_active === true ? (
                      <>
                        <Button
                          onClick={(event) =>
                            this.servicesPath(service_category, event)
                          }
                          className="btn-success mr-2"
                        >
                          Services
                        </Button>

                        <Link
                          // to={service_category.id + "/edit_service_category"}
                          onClick={() =>
                            check_permission(
                              "service_categories/update",
                              service_category.id + "/edit_service_category"
                            )
                          }
                        >
                          <Button
                            color="primary"
                            size="lg"
                            className="top-right-button mr-2"
                          >
                            <IntlMessages id="Edit" />
                          </Button>
                        </Link>

                        <Button
                          onClick={(event) =>
                            this.toggleDeleteConfirmationModal(
                              event,
                              service_category
                            )
                          }
                        >
                          Deactivate
                        </Button>
                      </>
                    ) : (
                      <Button
                        color="success"
                        onClick={(event) =>
                          this.activateServiceCategory(event, service_category)
                        }
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </ContextMenuTrigger>
          </Colxx>
        );
      }
    });

    return service_categories_html;
  };

  get_category_by_status = async (status_param) => {
    const { search_city } = this.state;
    let url = apiUrl + "?default_role=admin";
    let status = status_param.props.name;
    let success = false;
    let reqResponse = null;

    if (status === "All") {
      // Do Nothing
    } else {
      url = apiUrl + "?default_role=admin&is_category_active=" + status;
    }

    if (search_city !== null && Object.keys(search_city).length) {
      url += "&city_id=" + search_city.value;
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
      success = true;
      reqResponse = response;
    });

    if (success) {
      this.setState({
        selectedItems: reqResponse.data.service_categories,
        totalItemCount: reqResponse.data.service_categories.length,
        activeTab: status,
      });
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    let service_categories = await this.dataListRender();
    this.setState({
      selectedItems: service_categories,
      totalItemCount: service_categories.length,
    });
  };

  clear_form = async (event) => {
    this.state.search_city = null;

    let service_categories = await this.dataListRender();

    this.setState({
      selectedItems: service_categories,
      totalItemCount: service_categories.length,
    });
  };

  render_service_categories_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Service Categories</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "service_categories/create",
                    "/app/service_categories/new_service_category"
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  Add New
                </Button>
              </Link>
            </div>
          </Colxx>
        </Row>
        {/* <Separator className="mb-2" /> */}
      </>
    );
    return heading;
  };

  render() {
    const {
      currentPage,
      items,
      displayMode,
      selectedPageSize,
      totalItemCount,
      selectedOrderOption,
      selectedItems,
      orderOptions,
      pageSizes,
      isLoading,
      all_cities_json,
    } = this.state;
    let self = this;
    const { match } = this.props;
    const startIndex = (currentPage - 1) * selectedPageSize;
    const endIndex = currentPage * selectedPageSize;

    // if (selectedItems.length) {
    if (isLoading) {
      return (
        <>
          <ListPageHeading
            heading="Service Categories"
            displayMode={displayMode}
            changeDisplayMode={this.changeDisplayMode}
            handleChangeSelectAll={this.handleChangeSelectAll}
            changeOrderBy={this.changeOrderBy}
            changePageSize={this.changePageSize}
            selectedPageSize={selectedPageSize}
            totalItemCount={totalItemCount}
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
            link_component="new_service_category"
          />
        </>
      );
    } else {
      return (
        <div>
          {/* {this.renderServiceCategoryModal()} */}
          {this.deleteConfirmation()}
          {this.render_service_categories_heading()}
          <Row>
            <Colxx xxs="12">
              {/* <form onSubmit={this.filterServiceCategories} id="order-filter"> */}
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
                      // isMulti
                      className="react-select"
                      classNamePrefix="react-select"
                      placeholder="Select City"
                      name="city_id"
                      onChange={this.handle_city_change}
                      value={this.state.search_city}
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
                    // onChange={this.handle_city_change}
                    options={order_statuses}
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
                        self.clear_form(event);
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
              self.get_category_by_status(tab, tab.props.name);
            }}
          >
            <Tabs.Pane label="All" name="All">
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <tbody>{this.service_categories_rows()}</tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane label="Active" name="true">
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <tbody>{this.service_categories_rows()}</tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
            <Tabs.Pane label="De-Active" name="false">
              <Colxx xxs="12">
                <Card className="mb-4">
                  <CardBody>
                    <Table>
                      <tbody>{this.service_categories_rows()}</tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Colxx>
            </Tabs.Pane>
          </Tabs>
        </div>
      );
    }
  }
}
export default DataListPages;
