import React from "react";
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

const AddNewCityModal = ({
  modalOpen,
  toggleModal,
  createCity,
  updateCity,
  userAction,
  cityToEdit,
}) => {
  let cityEditData = null;
  if (cityToEdit !== undefined) {
    cityEditData = {
      id: cityToEdit.id,
      city_name: cityToEdit.city_name,
    };
  }
  return (
    <Modal
      isOpen={modalOpen}
      toggle={toggleModal}
      wrapClassName="modal-right"
      backdrop="static"
    >
      <form onSubmit={userAction === "new" ? createCity : updateCity}>
        <ModalHeader toggle={toggleModal}>
          {userAction === "new" ? (
            <IntlMessages id="pages.add-new-city-modal-title" />
          ) : (
            <IntlMessages id="pages.edit-city-modal-title" />
          )}
        </ModalHeader>
        <ModalBody>
          <Label>
            <IntlMessages id="City Name*" />
          </Label>
          {userAction === "new" ? (
            <Input
              className="form-control"
              name="newCityName"
              type="text"
              defaultValue=""
              required
            />
          ) : (
            <Input
              className="form-control"
              name="city[name]"
              type="text"
              defaultValue={cityEditData.city_name}
              data-id={cityEditData.id}
              required
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={toggleModal} type="button">
            <IntlMessages id="pages.cancel" />
          </Button>
          <Button color="primary" type="submit">
            <IntlMessages id="pages.submit" />
          </Button>{" "}
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default AddNewCityModal;
