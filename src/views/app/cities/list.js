import React, { Component } from "react";

import { Row, Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import CityListView from "../../../containers/pages/CityListView";
import AddNewCityModal from "../../../containers/pages/AddNewCityModal";
import AddNewAreaModal from "../../../containers/pages/AddNewAreaModal";
import { NotificationManager } from "../../../components/common/react-notifications";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";

function collect(props) {
  return { data: props.data };
}

const apiUrl = servicePath + "/api/v2/cities.json";

class DataListPages extends Component {
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
      newCityName: "",

      userAction: "new",
      cityToEdit: "",

      deleteConfirmationModal: false,
      cityToDelete: "",

      areaAction: "areaModalOpen",
      areaModalOpen: false,
      targetCity: "",
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.toggleModalArea = this.toggleModalArea.bind(this);

    this.createCity = this.createCity.bind(this);
    this.deleteCity = this.deleteCity.bind(this);
    this.editCity = this.editCity.bind(this);
    this.updateCity = this.updateCity.bind(this);
    this.activateCity = this.activateCity.bind(this);
  }

  componentDidMount() {
    this.dataListRender();
  }

  toggleModal = async (event) => {
    event.preventDefault();
    let result = await check_permission("cities/create", "");
    if (result) {
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
    }
  };

  toggleModalArea = async (event, city) => {
    event.preventDefault();
    let result = await check_permission("areas/index", "");
    if (result) {
      if (this.state.areaModalOpen === false) {
        // Currently areaModalOpen is false, which means it came here to open it
        this.setState({
          areaModalOpen: !this.state.areaModalOpen,
          targetCity: city.id,
        });
      } else if (this.state.areaModalOpen === true) {
        // Currently areaModalOpen is true, which means it came here to close it
        this.setState({
          areaModalOpen: !this.state.areaModalOpen,
        });
      }
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

  activateCity = async (event, city) => {
    let self = this;
    let data = { is_active: true };
    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/cities/" + city + ".json",
        data: data,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.dataListRender();
          // self.setState({
          //   selectedItems: self.state.selectedItems.filter((item) => item.id !== response.data.id),
          //   totalItemCount: (self.state.totalItemCount - 1)
          // });
          NotificationManager.success(
            "Activated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push("/app/cities/list");
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

  deleteCity = async () => {
    let self = this;

    await trackPromise(
      axios.delete(
        servicePath + "/api/v2/cities/" + this.state.cityToDelete + ".json",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        }
      )
    )
      .then((response) => {
        if (response.status === 200) {
          self.dataListRender();
          // self.setState({
          //   selectedItems: self.state.selectedItems.filter((item) => item.id !== response.data.id),
          //   totalItemCount: (self.state.totalItemCount - 1)
          // });
          NotificationManager.success(
            "Deactivated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push("/app/cities/list");
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

  editCity = async (city, event) => {
    event.preventDefault();
    let result = await check_permission("cities/update", "");
    if (result) {
      this.setState({
        userAction: "edit",
        modalOpen: true,
        cityToEdit: city,
      });
    }
  };

  updateCity = async (event) => {
    event.preventDefault();
    let self = this;
    const targetForm = event.target.elements["city[name]"];
    const cityId = targetForm.getAttribute("data-id");
    const cityName = targetForm.value;
    let data = { id: cityId, city_name: cityName, is_active: true };
    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/cities/" + cityId + ".json",
        data: data,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            modalOpen: false,
            userAction: "new",
          });

          NotificationManager.success(
            "City has been updated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          self.dataListRender();
          self.props.history.push("/app/cities/list");
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

  createCity = async (event) => {
    event.preventDefault();
    let self = this;

    // this.setState({
    //   newCityName: event.target.elements['newCityName'].value
    // });

    await trackPromise(
      axios.post(
        servicePath + "/api/v2/cities.json",
        {
          city: {
            city_name: event.target.elements["newCityName"].value,
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
          self.setState({
            modalOpen: false,
            selectedItems: [response.data, ...this.state.selectedItems],
            totalItemCount: self.state.totalItemCount + 1,
          });
          NotificationManager.success(
            "City has been created successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          self.props.history.push("/app/cities/list");
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

  // changePageSize = size => {
  //   this.setState(
  //     {
  //       selectedPageSize: size,
  //       currentPage: 1
  //     },
  //     () => this.dataListRender()
  //   );
  // };

  // changeDisplayMode = mode => {
  //   this.setState({
  //     displayMode: mode
  //   });
  //   return false;
  // };

  // onCheckItem = (event, id) => {
  //   if (
  //     event.target.tagName === "A" ||
  //     (event.target.parentElement && event.target.parentElement.tagName === "A")
  //   ) {
  //     return true;
  //   }
  //   if (this.state.lastChecked === null) {
  //     this.setState({
  //       lastChecked: id
  //     });
  //   }

  //   let selectedItems = this.state.selectedItems;
  //   if (selectedItems.includes(id)) {
  //     selectedItems = selectedItems.filter(x => x !== id);
  //   } else {
  //     selectedItems.push(id);
  //   }
  //   this.setState({
  //     selectedItems
  //   });

  //   if (event.shiftKey) {
  //     var items = this.state.items;
  //     var start = this.getIndex(id, items, "id");
  //     var end = this.getIndex(this.state.lastChecked, items, "id");
  //     items = items.slice(Math.min(start, end), Math.max(start, end) + 1);
  //     selectedItems.push(
  //       ...items.map(item => {
  //         return item.id;
  //       })
  //     );
  //     selectedItems = Array.from(new Set(selectedItems));
  //     this.setState({
  //       selectedItems
  //     });
  //   }
  //   document.activeElement.blur();
  // };

  dataListRender() {
    let self = this;

    let url;
    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/cities.json?default_role=admin&search_data=" +
        this.state.search;
    } else {
      url = apiUrl + "?default_role=admin";
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
      if (response.data.length > 0) {
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
        this.props.history.push("/app/cities/list");
      }
    });
  }

  toggleDeleteConfirmationModal = (event, city) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        cityToDelete: city.id,
      });
    } else {
      // if delete confirmed then, first call delete function for city
      if (event.target.classList.contains("delete-confirmed")) {
        this.deleteCity();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        cityToDelete: "",
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
          Are you sure you want to deactivate this city ?
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

  renderCityModal = (city, event) => {
    const userAction = this.state.userAction;
    const modalOpen = this.state.modalOpen;
    const toggleModal = this.toggleModal;
    const createCity = this.createCity;
    const updateCity = this.updateCity;
    const cityToEdit = this.state.cityToEdit;

    if (userAction === "edit") {
      return (
        <AddNewCityModal
          modalOpen={modalOpen}
          toggleModal={toggleModal}
          updateCity={updateCity}
          userAction={userAction}
          cityToEdit={cityToEdit}
        />
      );
    } else if (userAction === "new") {
      return (
        <AddNewCityModal
          modalOpen={modalOpen}
          toggleModal={toggleModal}
          createCity={createCity}
          userAction={userAction}
        />
      );
    }
  };

  renderAreaModal = (event) => {
    const { areaAction, areaModalOpen, targetCity } = this.state;

    const toggleModalArea = this.toggleModalArea;

    if (areaModalOpen) {
      return (
        <AddNewAreaModal
          areaModalOpen={areaModalOpen}
          toggleModalArea={toggleModalArea}
          targetCity={targetCity}
          areaAction={areaAction}
        />
      );
    }
  };
  render_city_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Cities</h1>
              <Link
                // to="create_setting"
                onClick={(event) => this.toggleModal(event)}
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
    const { selectedItems } = this.state;

    return (
      <div>
        {this.renderCityModal()}
        {this.deleteConfirmation()}
        {this.render_city_heading()}
        {selectedItems.map((singleItem) => {
          return (
            <CityListView
              key={singleItem.id}
              city={singleItem}
              isSelect={this.state.selectedItems.includes(singleItem.id)}
              onCheckItem={this.onCheckItem}
              collect={collect}
              toggleDeleteConfirmationModal={this.toggleDeleteConfirmationModal}
              editCity={this.editCity}
              toggleModalArea={this.toggleModalArea}
              activateCity={this.activateCity}
            />
          );
        })}
        {this.renderAreaModal()}
      </div>
    );
  }
}
export default DataListPages;
