import React, { Component } from "react";
import {
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Card,
  CardBody,
  CardTitle,
  Table,
} from "reactstrap";
import { Popover } from "element-react";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import AddServiceModal from "../../../containers/pages/AddServiceModal";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import IntlMessages from "../../../helpers/IntlMessages";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/services.json";

class ServicesListPage extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");
    this.state = {
      temp: [],
      services: [],
      service_category: {},
      sub_categories: [],
      data_found: "",
      service_to_delete: "",
      service_category_to_delete: 0,
      delete_service_category_confirmation_modal: false,
      displayMode: "list",

      selectedPageSize: 10,
      orderOptions: [
        { column: "title", label: "Product Name" },
        { column: "category", label: "Category" },
        { column: "status", label: "Status" },
      ],
      pageSizes: [10, 20, 30, 50, 100],

      categories: [
        { label: "Cakes", value: "Cakes", key: 0 },
        { label: "Cupcakes", value: "Cupcakes", key: 1 },
        { label: "Desserts", value: "Desserts", key: 2 },
      ],

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
    this.createService = this.createService.bind(this);
    this.editService = this.editService.bind(this);
    this.updateService = this.updateService.bind(this);
  }

  async componentDidMount() {
    let self = this;
    let service_category = await self.fetch_service_category();

    if (service_category.services === undefined) {
      // We have received subcategories instead of services
      this.setState({
        service_category: service_category.service_category,
        sub_categories: service_category.subcategories,
        data_found: "sub_categories",
      });
    } else if (service_category.subcategories === undefined) {
      // We have received services instead of subcategories
      this.setState({
        service_category: service_category.service_category,
        services: service_category.services,
        data_found: "services",
      });
    }
  }

  activateService = async (event, service) => {
    let self = this;
    let success = false;

    await trackPromise(
      axios.put(
        servicePath + "/api/v2/services/" + service.id + ".json",
        {
          service: {
            is_active: true,
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
            "Activated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          success = true;
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

    if (success) {
      let service_category = await self.fetch_service_category();

      if (service_category.services === undefined) {
        // We have received subcategories instead of services
        this.setState({
          service_category: service_category.service_category,
          sub_categories: service_category.subcategories,
          data_found: "sub_categories",
        });
      } else if (service_category.subcategories === undefined) {
        // We have received services instead of subcategories
        this.setState({
          service_category: service_category.service_category,
          services: service_category.services,
          data_found: "services",
        });
      }
    }
  };

  set_prices = (service) => {
    let discount_reson_html = [];
    service.service_cities.forEach((city, index) => {
      discount_reson_html.push(
        <>
          <Row>
            <Colxx md="2">{index + 1}</Colxx>
            <Colxx md="8">{city.city_name}</Colxx>
            <Colxx md="2">{city.service_price}</Colxx>
          </Row>
        </>
      );
    });
    return discount_reson_html;
  };

  render_service_table_row = (services) => {
    let services_rows = [];
    let self = this;

    services.forEach(function (single_service, index) {
      services_rows.push(
        <>
          <tr
            className={
              single_service.is_active === true ? "" : "deactivated-row"
            }
          >
            <td>{index + 1}</td>
            <td>
              {single_service.service_title}
              <span className="badge badge-warning">
                {single_service.service_addons.length > 0
                  ? "Addons Applied"
                  : ""}
              </span>
            </td>
            <td>{single_service.service_duration + " Minutes"}</td>
            <td>
              <Popover
                placement="bottom"
                title="Service Prices"
                width="350"
                trigger="click"
                content={self.set_prices(single_service)}
              >
                <Button className="btn-sm">Click here for Prices</Button>
              </Popover>
            </td>
            <td className="text-right">
              {single_service.is_active === true ? (
                <>
                  <Link
                    // to={"services/" + single_service.id + "/edit_service"}
                    onClick={() =>
                      check_permission(
                        "services/update",
                        "services/" + single_service.id + "/edit_service"
                      )
                    }
                    className="mr-2"
                  >
                    <Button size="sm">
                      <IntlMessages id="Edit" />
                    </Button>
                  </Link>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={(event) =>
                      self.toggleDeleteConfirmationModal(event, single_service)
                    }
                  >
                    Deactivate
                  </Button>
                </>
              ) : (
                <Button
                  color="success"
                  size="sm"
                  onClick={async (event) =>
                    self.activateService(event, single_service)
                  }
                >
                  Activate
                </Button>
              )}
            </td>
          </tr>
        </>
      );
    });

    return services_rows;
  };

  capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  render_add_service_link = (category) => {
    return (
      <>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td className="text-right">
            <Link
              // to={"/app/service_categories/" + category.id + "/new_service_v2"}
              onClick={() =>
                check_permission(
                  "services/create",
                  "/app/service_categories/" + category.id + "/new_service_v2"
                )
              }
            >
              <Button size="sm" className="btn-success">
                <IntlMessages id="Add Service" />
              </Button>
            </Link>
          </td>
        </tr>
      </>
    );
  };

  render_sub_category_options = (sub_category) => {
    let self = this;
    let actions_html = "";

    actions_html = (
      <>
        <div>
          {sub_category === null ? (
            <IntlMessages id="Services" />
          ) : (
            this.capitalizeFirstLetter(sub_category.service_category_title)
          )}
        </div>
        <div>
          <Link
            // to={
            //   "/app/service_categories/" +
            //   sub_category.id +
            //   "/edit_service_category"
            // }
            onClick={() =>
              check_permission(
                "service_categories/update",
                "/app/service_categories/" +
                  sub_category.id +
                  "/edit_service_category"
              )
            }
          >
            <Button size="sm mr-2" className="btn-success">
              <IntlMessages id="Edit" />
            </Button>
          </Link>
          <Button
            color="danger"
            size="sm"
            onClick={(event) =>
              self.toggle_category_delete_confirmation_modal(
                event,
                sub_category
              )
            }
          >
            {" "}
            Delete{" "}
          </Button>
        </div>
      </>
    );

    return actions_html;
  };

  render_services = (services, category = null) => {
    let services_html = [];
    const { data_found } = this.state;

    if (data_found === "services" && services.length === 0) {
      services_html.push(<> </>);
    } else {
      services_html.push(
        <>
          <Colxx xxs="12">
            <Card className="mb-4">
              <CardBody>
                <CardTitle
                  className={
                    category === null ? "text-center" : "sub_category_actions"
                  }
                >
                  {category === null
                    ? "Services"
                    : this.render_sub_category_options(category)}
                </CardTitle>
                <Table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.render_service_table_row(services)}
                    {category === null
                      ? ""
                      : this.render_add_service_link(category)}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Colxx>
        </>
      );
    }

    return services_html;
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

  // remove_service_from_subcategories = (service_id) => {
  //   const { sub_categories } = this.state;

  //   sub_categories.forEach(function(category, index) {
  //     category.services.forEach(function(service, innerIndex, object) {
  //       if (service.id === service_id) {
  //         object.splice(innerIndex, 1);
  //       }
  //     });
  //   });

  //   return sub_categories;
  // };

  remove_subcategory_from_state = (subcategory_id) => {
    let sub_categories = this.state.sub_categories;

    sub_categories.forEach(function (category, index, object) {
      if (category.id === subcategory_id) {
        object.splice(index, 1);
      }
    });

    return sub_categories;
  };

  delete_service_category = async (service_category_to_delete) => {
    let self = this;
    let updated_sub_categories = [];

    const { data_found } = this.state;

    await trackPromise(
      axios({
        method: "delete",
        url:
          servicePath +
          "/api/v2/service_categories/" +
          service_category_to_delete +
          ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Service Category deleted successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          if (data_found === "sub_categories") {
            // Find this service in sub categories and remove it from state
            updated_sub_categories = self.remove_subcategory_from_state(
              service_category_to_delete
            );
          }
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

    return updated_sub_categories;
  };

  delete_service = async () => {
    let self = this;
    let success = false;
    const { service_to_delete } = this.state;

    await trackPromise(
      axios({
        method: "delete",
        url: servicePath + "/api/v2/services/" + service_to_delete + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Service deactivated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          success = true;
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

    if (success) {
      let service_category = await self.fetch_service_category();

      if (service_category.services === undefined) {
        // We have received subcategories instead of services
        this.setState({
          service_category: service_category.service_category,
          sub_categories: service_category.subcategories,
          data_found: "sub_categories",
        });
      } else if (service_category.subcategories === undefined) {
        // We have received services instead of subcategories
        this.setState({
          service_category: service_category.service_category,
          services: service_category.services,
          data_found: "services",
        });
      }
    }
  };

  editService = (service, event) => {
    event.preventDefault();

    this.setState({
      userAction: "edit",
      modalOpen: true,
      serviceToEdit: service,
    });
  };

  updateService = async (event) => {
    event.preventDefault();
    let self = this;
    let service_categories_id = parseInt(this.props.match.params.id);
    const targetForm = event.target.elements["service[title]"];
    const serviceId = targetForm.getAttribute("data-id");
    const serviceTitle = targetForm.value;
    let targetServiceDuration = event.target.elements["service_duration"].value;
    await trackPromise(
      axios.put(
        servicePath + "/api/v2/services/" + serviceId + ".json",
        {
          service: {
            id: serviceId,
            service_title: serviceTitle,
            service_duration: targetServiceDuration,
            is_addon: event.target.elements["is_addons"].value,
            is_active: event.target.elements["is_active"].value,
            is_featured: event.target.elements["is_featured"].value,
            service_category_id: service_categories_id,
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
          self.setState({
            modalOpen: false,
            userAction: "new",
          });
          self.fetch_service_category();
          NotificationManager.success(
            "Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push(
            `/app/service_categories/${service_categories_id}/services`
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
  };

  createService = async (event) => {
    event.preventDefault();
    let self = this;
    let service_categories_id = parseInt(this.props.match.params.id);

    await trackPromise(
      axios.post(
        apiUrl,
        {
          service: {
            service_title: event.target.elements["newServiceTitle"].value,
            service_duration: event.target.elements["newServiceDuration"].value,
            is_active: event.target.elements["is_active"].value,
            is_addon: event.target.elements["is_addons"].value,
            is_featured: event.target.elements["is_featured"].value,
            service_category_id: service_categories_id,
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
          self.props.history.push(
            `/app/service_categories/${service_categories_id}/services`
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
  };

  changePageSize = (size) => {
    this.setState(
      {
        selectedPageSize: size,
        currentPage: 1,
      },
      () => this.fetch_service_category()
    );
  };

  changeDisplayMode = (mode) => {
    this.setState({
      displayMode: mode,
    });
    return false;
  };

  fetch_service_category = async () => {
    let service_category = "";

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/services.json?service_category_id=" +
          this.props.match.params.id +
          "&default_role=admin",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          service_category = response.data;
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

    return service_category;
  };

  toggleDeleteConfirmationModal = async (event, service) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        service_to_delete: service.id,
      });
    } else {
      // if delete confirmed then, first call delete function for service

      if (event.target.classList.contains("delete-confirmed")) {
        await this.delete_service();
        // let updated_services = this.state.services.filter(
        //   (single_service) =>
        //     single_service.id !== parseInt(this.state.service_to_delete)
        // );

        this.setState({
          deleteConfirmationModal: !this.state.deleteConfirmationModal,
          service_to_delete: "",
          // services: updated_services,
        });
      } else {
        this.setState({
          deleteConfirmationModal: !this.state.deleteConfirmationModal,
          service_to_delete: "",
        });
      }
    }
  };

  toggle_category_delete_confirmation_modal = async (
    event,
    service_category
  ) => {
    if (this.state.delete_service_category_confirmation_modal === false) {
      this.setState({
        delete_service_category_confirmation_modal: !this.state
          .delete_service_category_confirmation_modal,
        service_category_to_delete: service_category.id,
      });
    } else {
      // if delete confirmed then, first call delete function for service category
      let updated_sub_categories = [];
      if (event.target.classList.contains("delete-confirmed")) {
        updated_sub_categories = await this.delete_service_category(
          this.state.service_category_to_delete
        );
      }

      this.setState({
        delete_service_category_confirmation_modal: !this.state
          .delete_service_category_confirmation_modal,
        service_category_to_delete: 0,
        sub_categories: updated_sub_categories,
      });
    }
  };

  delete_service_confirmation = (event, city) => {
    return (
      <Modal
        isOpen={this.state.deleteConfirmationModal}
        size="sm"
        toggle={this.toggleDeleteConfirmationModal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to deactivate service ?
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

  delete_subcategory_confirmation = () => {
    return (
      <Modal
        isOpen={this.state.delete_service_category_confirmation_modal}
        size="sm"
        toggle={this.toggle_category_delete_confirmation_modal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to delete this category ?
        </ModalHeader>
        <ModalBody>
          <Button
            size="sm"
            onClick={(event) =>
              this.toggle_category_delete_confirmation_modal(event)
            }
            className="btn-success mr-2 delete-confirmed"
          >
            {" "}
            Yes{" "}
          </Button>
          <Button
            size="sm"
            onClick={(event) =>
              this.toggle_category_delete_confirmation_modal(event)
            }
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
    const createService = this.createService;
    const updateService = this.updateService;
    const serviceToEdit = this.state.serviceToEdit;

    if (userAction === "edit") {
      return (
        <AddServiceModal
          modalOpen={modalOpen}
          toggleModal={toggleModal}
          updateService={updateService}
          userAction={userAction}
          serviceToEdit={serviceToEdit}
        />
      );
    } else if (userAction === "new") {
      return (
        <AddServiceModal
          modalOpen={modalOpen}
          toggleModal={toggleModal}
          createService={createService}
          userAction={userAction}
        />
      );
    }
  };

  render_all_data = () => {
    const { services, sub_categories, data_found } = this.state;

    let sub_category_services_html = [];

    if (data_found === "services") {
      return <>{this.render_services(services)}</>;
    } else if (data_found === "sub_categories") {
      sub_categories.forEach((single_category) => {
        sub_category_services_html.push(
          this.render_services(single_category.services, single_category)
        );
      });
      return sub_category_services_html;
    }
  };

  render_top_nav_actions = () => {
    let top_nav_actions_html = "";

    const { data_found, service_category, services } = this.state;

    if (data_found === "services") {
      // Check if services length  > 0
      if (services.length > 0) {
        // Services exist for this category. It means no sub category is allowed.
        // Add button for adding new service
        top_nav_actions_html = (
          <>
            <Link
              // to={
              //   "/app/service_categories/" +
              //   service_category.id +
              //   "/new_service_v2"
              // }
              onClick={() =>
                check_permission(
                  "services/create",
                  "/app/service_categories/" +
                    service_category.id +
                    "/new_service_v2"
                )
              }
            >
              <Button color="primary" size="lg" className="top-right-button">
                <IntlMessages id="Add Services" />
              </Button>
            </Link>
          </>
        );
      } else if (services.length === 0) {
        // It means neither they have they services nor sub categories
        // Give them both buttons
        top_nav_actions_html = (
          <>
            <Link
              // to="new_sub_category"
              onClick={() =>
                check_permission(
                  "service_categories/create",
                  "/app/service_categories/" +
                    service_category.id +
                    "/new_sub_category"
                )
              }
            >
              <Button
                color="primary"
                size="lg"
                className="top-right-button mr-2"
              >
                <IntlMessages id="Add Sub Category" />
              </Button>
            </Link>

            <Link
              // to={
              //   "/app/service_categories/" +
              //   service_category.id +
              //   "/new_service_v2"
              // }
              onClick={() =>
                check_permission(
                  "services/create",
                  "/app/service_categories/" +
                    service_category.id +
                    "/new_service_v2"
                )
              }
            >
              <Button color="primary" size="lg" className="top-right-button">
                <IntlMessages id="Add Services" />
              </Button>
            </Link>
          </>
        );
      }
    } else if (data_found === "sub_categories") {
      // Found sub categories. No Add Service button allowed anymore
      top_nav_actions_html = (
        <>
          <Link
            // to="new_sub_category"
            onClick={() =>
              check_permission(
                "service_categories/create",
                "/app/service_categories/" +
                  service_category.id +
                  "/new_sub_category"
              )
            }
          >
            <Button color="primary" size="lg" className="top-right-button">
              <IntlMessages id="Add Sub Category" />
            </Button>
          </Link>
        </>
      );
    }

    return top_nav_actions_html;
  };

  render_top_nav = () => {
    const { service_category } = this.state;

    return (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>
                <IntlMessages id={service_category.service_category_title} />
              </h1>

              <div className="text-zero top-right-button-container">
                {this.render_top_nav_actions()}
              </div>
            </div>
            <Separator className="mb-5" />
          </Colxx>
        </Row>
      </>
    );
  };

  render() {
    const { service_category } = this.state;
    if (Object.keys(service_category).length === 0) {
      return <></>;
    } else {
      return (
        <div>
          {this.renderServiceCategoryModal()}
          {this.delete_service_confirmation()}
          {this.delete_subcategory_confirmation()}
          {this.render_top_nav()}
          {this.render_all_data()}
        </div>
      );
    }
  }
}
export default ServicesListPage;
