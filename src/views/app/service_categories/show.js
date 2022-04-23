import React, { Component } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

import axios from "axios";

import { servicePath } from "../../../constants/defaultValues";
import ServiceCategoryListView from "../../../containers/pages/ServiceCategoryListView";
import ShowPageHeading from "../../../containers/pages/ShowPageHeading";
import AddNewServiceCategoryModal from "../../../containers/pages/AddNewServiceCategoryModal";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/service_categories.json";

class ServiceCategoryShow extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");
    this.state = {
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
    this.createServiceCategory = this.createServiceCategory.bind(this);
    this.deleteServiceCategory = this.deleteServiceCategory.bind(this);
    this.editServiceCategory = this.editServiceCategory.bind(this);
    this.updateServiceCategory = this.updateServiceCategory.bind(this);
    this.servicesPath = this.servicesPath.bind(this);
  }

  componentDidMount() {
    this.dataListRender();
  }

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

  deleteServiceCategory = async () => {
    let self = this;
    let service_categories_id = parseInt(this.props.match.params.id);

    await trackPromise(
      axios.delete(
        servicePath +
          "/api/v2/service_categories/" +
          this.state.serviceCategoryToDelete +
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
            totalItemCount: self.state.totalItemCount - 1,
          });
          NotificationManager.success(
            "Deleted Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push(
            `/app/service_categories/${service_categories_id}`
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

  servicesPath = (service_category, event) => {
    event.preventDefault();
    this.props.history.push(
      `/app/service_categories/${service_category.id}/services`
    );
  };

  editServiceCategory = (service_category, event) => {
    event.preventDefault();

    this.setState({
      userAction: "edit",
      modalOpen: true,
      serviceCategoryToEdit: service_category,
    });
  };

  updateServiceCategory = async (event) => {
    event.preventDefault();
    let self = this;
    const targetForm = event.target.elements["service_category[title]"];
    const serviceCategoryId = targetForm.getAttribute("data-id");
    const serviceCategoryTitle = targetForm.value;

    await trackPromise(
      axios.put(
        servicePath +
          "/api/v2/service_categories/" +
          serviceCategoryId +
          ".json",
        {
          service_category: {
            id: serviceCategoryId,
            service_category_title: serviceCategoryTitle,
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
          self.dataListRender();
          NotificationManager.success(
            "Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push(
            `/app/service_categories/${serviceCategoryId}`
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

  createServiceCategory = async (event) => {
    event.preventDefault();
    let self = this;
    let service_categories_id = parseInt(this.props.match.params.id);
    this.setState({
      newServiceCategoryTitle:
        event.target.elements["newServiceCategoryTitle"].value,
    });

    await trackPromise(
      axios.post(
        apiUrl,
        {
          service_category: {
            service_category_title:
              event.target.elements["newServiceCategoryTitle"].value,
            is_active: true,
            parent_id: service_categories_id,
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
            `/app/service_categories/${service_categories_id}`
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
      () => this.dataListRender()
    );
  };

  changeDisplayMode = (mode) => {
    this.setState({
      displayMode: mode,
    });
    return false;
  };

  onCheckItem = (event, id) => {
    if (
      event.target.tagName === "A" ||
      (event.target.parentElement && event.target.parentElement.tagName === "A")
    ) {
      return true;
    }
    if (this.state.lastChecked === null) {
      this.setState({
        lastChecked: id,
      });
    }

    let selectedItems = this.state.selectedItems;
    if (selectedItems.includes(id)) {
      selectedItems = selectedItems.filter((x) => x !== id);
    } else {
      selectedItems.push(id);
    }
    this.setState({
      selectedItems,
    });

    if (event.shiftKey) {
      var items = this.state.items;
      var start = this.getIndex(id, items, "id");
      var end = this.getIndex(this.state.lastChecked, items, "id");
      items = items.slice(Math.min(start, end), Math.max(start, end) + 1);
      selectedItems.push(
        ...items.map((item) => {
          return item.id;
        })
      );
      selectedItems = Array.from(new Set(selectedItems));
      this.setState({
        selectedItems,
      });
    }
    document.activeElement.blur();
  };

  dataListRender() {
    trackPromise(
      axios.get(
        servicePath +
          "/api/v2/service_categories.json?parent_id=" +
          this.props.match.params.id,
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        }
      )
    ).then((response) => {
      this.setState({
        selectedItems: response.data,
        totalItemCount: response.data.length,
      });
    });
  }

  toggleDeleteConfirmationModal = (event, service_category) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        serviceCategoryToDelete: service_category.id,
      });
    } else {
      // if delete confirmed then, first call delete function for service category
      if (event.target.classList.contains("delete-confirmed")) {
        this.deleteServiceCategory();
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
          Are you sure you want to delete service category ?
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
    } = this.state;
    const { match } = this.props;
    const startIndex = (currentPage - 1) * selectedPageSize;
    const endIndex = currentPage * selectedPageSize;

    return (
      <div>
        {this.renderServiceCategoryModal()}
        {this.deleteConfirmation()}
        <ShowPageHeading
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
        />
        {selectedItems.map((singleItem) => {
          return (
            <ServiceCategoryListView
              parentId={this.props.match.params.id}
              key={singleItem.id}
              service_category={singleItem}
              toggleDeleteConfirmationModal={this.toggleDeleteConfirmationModal}
              editServiceCategory={this.editServiceCategory}
              servicesPath={this.servicesPath}
            />
          );
        })}
      </div>
    );
  }
}
export default ServiceCategoryShow;
