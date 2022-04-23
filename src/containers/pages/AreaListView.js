import React, { Component, Fragment } from "react";
import classnames from "classnames";
import IntlMessages from "../../helpers/IntlMessages";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../components/common/CustomBootstrap";
import {
  Card,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
} from "reactstrap";
import { check_permission } from "../../helpers/Utils";

class AreaListView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      areaToEdit: "",
      userAction: "",
      modalOpen: "",
    };
    this.editArea = this.editArea.bind(this);
    this.renderEditAreaModal = this.renderEditAreaModal.bind(this);
    this.toggleEditModal = this.toggleEditModal.bind(this);
  }

  editArea = async (event, area) => {
    event.preventDefault();
    let result = await check_permission("areas/update", "");
    if (result) {
      this.setState({
        userAction: "edit",
        modalOpen: true,
        areaToEdit: area,
      });
    }
  };

  toggleEditModal = () => {
    this.setState((prevState) => ({
      modalOpen: !prevState.modalOpen,
    }));
  };

  renderEditAreaModal = (area) => {
    if (this.state.userAction === "edit") {
      return (
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleEditModal}>
          <form onSubmit={this.props.updateArea}>
            <ModalHeader toggle={this.toggleEditModal}> Edit Area </ModalHeader>
            <ModalBody>
              <Label>Area Title*</Label>
              <Input
                className="form-control"
                name="area[name]"
                type="text"
                defaultValue={area.area}
                data-city-id={area.city_id}
                data-id={area.id}
                required
              />
              <Label className="mt-2">Travel Charges*</Label>
              <Input
                className="form-control"
                name="area[travel_charges]"
                type="text"
                defaultValue={area.travel_charges}
                data-city-id={area.city_id}
                data-id={area.id}
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
                <IntlMessages id="pages.cancel" />
              </Button>
              <Button
                color="primary"
                type="submit"
                onClick={this.toggleEditModal}
              >
                <IntlMessages id="pages.submit" />
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      );
    }
  };

  render() {
    const { area, toggleDeleteConfirmationModal, activateArea } = this.props;

    return (
      <Fragment>
        <Colxx xxs="12" className="mb-3">
          <ContextMenuTrigger id="menu_id" data={area.id}>
            <Card className={classnames("d-flex flex-row")}>
              <div
                className={
                  area.is_active === false
                    ? "pl-2 d-flex flex-grow-1 min-width-zero deactivated-row"
                    : "pl-2 d-flex flex-grow-1 min-width-zero"
                }
              >
                <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                  <p className="list-item-heading mb-1 truncate">{area.area}</p>
                  <div className="mr-3 list-item-heading mb-1 truncate">
                    {area.travel_charges}
                  </div>
                </div>
                <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                  {area.is_active === false ? (
                    <></>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(event) => this.editArea(event, area)}
                      className="btn-success mr-2"
                    >
                      Edit
                    </Button>
                  )}
                  {area.is_active === false ? (
                    <Button
                      color="success"
                      onClick={(event) => activateArea(event, area.id)}
                      className=""
                    >
                      {" "}
                      Activate{" "}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(event) =>
                        toggleDeleteConfirmationModal(event, area)
                      }
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </ContextMenuTrigger>
        </Colxx>
        {this.renderEditAreaModal(area)}
      </Fragment>
    );
  }
}

/* React.memo detail : https://reactjs.org/docs/react-api.html#reactpurecomponent  */
export default React.memo(AreaListView);
