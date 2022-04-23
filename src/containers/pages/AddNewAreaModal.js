import React from "react";
import axios from "axios";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
} from "reactstrap";
import IntlMessages from "../../helpers/IntlMessages";
import { servicePath } from "../../constants/defaultValues";
import AreaListView from "./AreaListView";
import { NotificationManager } from "../../components/common/react-notifications";
import { check_permission } from "../../helpers/Utils";

class AddNewAreaModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      areaItems: [],
      deleteConfirmationModal: false,
      areaToDelete: "",
    };
    this.createArea = this.createArea.bind(this);
    this.updateArea = this.updateArea.bind(this);
    this.activateArea = this.activateArea.bind(this);
  }

  componentDidMount() {
    const targetCity = this.props.targetCity;
    if (targetCity !== "" && targetCity !== undefined) {
      this.getAllCityAreas(this.props.targetCity);
    }
  }

  activateArea = async (event, area) => {
    event.preventDefault();
    let self = this;

    await axios
      .put(
        servicePath + "/api/v2/areas/" + area + ".json",
        {
          area: {
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
      .then((response) => {
        if (response.status === 200) {
          self.getAllCityAreas(self.props.targetCity);
          NotificationManager.success(
            "Area has been Activated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
        } else {
          NotificationManager.error(
            response.data.message,
            "",
            3000,
            null,
            null,
            "filled"
          );
          console.log(response);
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          3000,
          null,
          null,
          "filled"
        );
        console.log(error);
      });
  };

  createArea = async (event) => {
    event.preventDefault();
    let city_id = event.target.elements["area[name]"].getAttribute("data-city");
    let area = event.target.elements["area[name]"].value;
    let travel_charges = event.target.elements["area[travel_charges]"].value;
    let results = await check_permission("areas/create", "");
    if (results) {
      let formObj = event.target;
      let self = this;

      await axios
        .post(
          servicePath + "/api/v2/areas.json",
          {
            area: {
              city_id: city_id,
              area: area,
              travel_charges: travel_charges,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              "AUTH-TOKEN": localStorage.getItem("auth_token"),
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            formObj.reset();
            console.log(response);
            self.setState({
              areaItems: [response.data, ...this.state.areaItems],
            });
            NotificationManager.success(
              "Area has been Created successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
          } else {
            NotificationManager.error(
              response.data.message,
              "",
              3000,
              null,
              null,
              "filled"
            );
            console.log(response);
          }
        })
        .catch((error) => {
          // NotificationManager.error(
          //   error.response.data.message,
          //   "",
          //   3000,
          //   null,
          //   null,
          //   "filled"
          // );
          console.log(error);
        });
    }
  };

  getAllCityAreas = async (cityId) => {
    let self = this;

    await axios
      .get(
        servicePath + "/api/v2/areas.json?default_role=admin&city_id=" + cityId,
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          console.log(response);

          self.setState({
            areaItems: response.data,
          });
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        self.setState({
          areaItems: [],
        });
        console.log("error", error);
      });
  };

  deleteArea = async () => {
    let self = this;
    await axios
      .delete(
        servicePath + "/api/v2/areas/" + this.state.areaToDelete + ".json",
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          self.getAllCityAreas(self.props.targetCity);
          // self.setState({
          //   areaItems: self.state.areaItems.filter((item) => item.id !== response.data.id),
          // });
          NotificationManager.success(
            "Area has been Deactivated successfully",
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
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
        console.log("error", error);
      });
  };

  toggleDeleteConfirmationModal = (event, area) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        areaToDelete: area.id,
      });
    } else {
      // if delete confirmed then, first call delete function for city
      if (event.target.classList.contains("delete-confirmed")) {
        this.deleteArea();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        areaToDelete: "",
      });
    }
  };

  deleteConfirmation = (event, area) => {
    return (
      <Modal
        isOpen={this.state.deleteConfirmationModal}
        size="sm"
        toggle={this.toggleDeleteConfirmationModal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to deactivate area ?
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

  updateArea = async (event) => {
    event.preventDefault();
    let self = this;
    const targetForm = event.target.elements["area[name]"];
    const areadId = targetForm.getAttribute("data-id");
    const cityId = targetForm.getAttribute("data-city-id");
    const areaName = targetForm.value;
    const travel_charges = event.target.elements["area[travel_charges]"].value;

    await axios
      .put(
        servicePath + "/api/v2/areas/" + areadId + ".json",
        {
          area: {
            area: areaName,
            is_active: true,
            city_id: cityId,
            travel_charges: travel_charges,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            modalOpen: false,
            userAction: "new",
          });

          NotificationManager.success(
            "Area has been updated successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          self.getAllCityAreas(self.props.targetCity);
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

  render() {
    const areaModalOpen = this.props.areaModalOpen;
    const toggleModalArea = this.props.toggleModalArea;
    const targetCity = this.props.targetCity;
    const areaItems = this.state.areaItems;
    const createArea = this.createArea;

    return (
      <>
        {this.deleteConfirmation()}
        <Modal
          isOpen={areaModalOpen}
          toggle={toggleModalArea}
          wrapClassName="modal-right add-area-modal"
          backdrop="static"
          size="lg"
        >
          <form onSubmit={createArea}>
            <ModalHeader toggle={toggleModalArea}>Areas</ModalHeader>
            <ModalBody>
              <Label>Add Areas *</Label>
              <Input
                className="form-control"
                name="area[name]"
                type="text"
                defaultValue=""
                data-city={targetCity}
                required
              />
              <Label className="mt-2">Travel Charges *</Label>
              <Input
                className="form-control"
                name="area[travel_charges]"
                type="text"
                defaultValue=""
                data-city={targetCity}
                required
              />
            </ModalBody>

            <ModalFooter>
              <Button
                color="secondary"
                outline
                onClick={toggleModalArea}
                type="button"
              >
                <IntlMessages id="pages.cancel" />
              </Button>
              <Button color="primary" type="submit">
                <IntlMessages id="pages.submit" />
              </Button>
            </ModalFooter>
          </form>
          {areaItems.map((singleItem) => {
            return (
              <AreaListView
                key={singleItem.id}
                area={singleItem}
                toggleModalArea={this.toggleModalArea}
                toggleDeleteConfirmationModal={
                  this.toggleDeleteConfirmationModal
                }
                updateArea={this.updateArea}
                activateArea={this.activateArea}
              />
            );
          })}
        </Modal>
      </>
    );
  }
}

export default AddNewAreaModal;
