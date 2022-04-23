import React from "react";
import {
  CustomInput,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../components/common/CustomSelectInput";
import IntlMessages from "../../helpers/IntlMessages";
import axios from "axios";

import { servicePath } from "../../constants/defaultValues";
const apiUrl = servicePath + "/api/v2/cities.json";

// const AddNewServiceCategoryModal = ({ modalOpen, toggleModal, createServiceCategory, updateServiceCategory, userAction, serviceCategoryToEdit }) => {
class AddNewServiceCategoryModal extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.userAction === "new") {
      this.state = {
        isActive: false,
        selectedOptions: [],
        selectedOption: "",
        allCities: [],
      };
    } else if (this.props.userAction === "edit") {
      this.state = {
        isActive: this.props.serviceToEdit.is_active,
      };
    }

    this.citiesDropdownJson = this.citiesDropdownJson.bind(this);
  }

  componentDidMount() {
    this.getAllCities();
  }

  citiesDropdownJson = (cities) => {};

  getAllCities = () => {
    let self = this;
    axios
      .get(apiUrl, {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
      .then((response) => {
        self.setState({
          allCities: response.data,
          citiesJson: self.citiesDropdownJson(response.data),
          totalItemCount: response.data.length,
        });
      });
  };

  isActiveChange = () => {
    this.setState({
      isActive: !this.state.isActive,
    });
  };

  handleChangeMulti = (selectedOptions) => {
    this.setState({ selectedOptions });
  };

  render() {
    const {
      modalOpen,
      toggleModal,
      createServiceCategory,
      updateServiceCategory,
      userAction,
      serviceCategoryToEdit,
      allCities,
    } = this.props;
    let serviceCategoryEditData = null;
    if (serviceCategoryToEdit !== undefined) {
      serviceCategoryEditData = {
        id: serviceCategoryToEdit.id,
        is_active: serviceCategoryToEdit.is_active,
        service_category_title: serviceCategoryToEdit.service_category_title,
      };
    }
    return (
      <Modal
        isOpen={modalOpen}
        toggle={toggleModal}
        wrapClassName="modal-right"
        backdrop="static"
      >
        <form
          onSubmit={
            userAction === "new" ? createServiceCategory : updateServiceCategory
          }
        >
          <ModalHeader toggle={toggleModal}>
            {userAction === "new" ? (
              <IntlMessages id="pages.add-new-service-category-modal-title" />
            ) : (
              <IntlMessages id="pages.edit-service-category-modal-title" />
            )}
          </ModalHeader>
          <ModalBody>
            <Label>
              <IntlMessages id="pages.service-category-name" />
            </Label>
            {userAction === "new" ? (
              <Input
                className="form-control"
                name="newServiceCategoryTitle"
                type="text"
                defaultValue=""
              />
            ) : (
              <Input
                className="form-control"
                name="service_category[title]"
                type="text"
                defaultValue={serviceCategoryEditData.service_category_title}
                data-id={serviceCategoryEditData.id}
              />
            )}
            {userAction === "new" ? (
              <CustomInput
                className="mt-2"
                type="checkbox"
                checked={this.state.isActive}
                onChange={this.isActiveChange}
                id="is_active"
                label="is active"
                value={this.state.isActive}
              />
            ) : (
              <CustomInput
                className="mt-2"
                type="checkbox"
                checked={this.state.isActive}
                onChange={this.isActiveChange}
                id="is_active"
                label="is active"
                value={this.state.isActive}
              />
            )}
            <InputGroup className="mb-3 mt-3">
              <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
              <CustomInput
                type="file"
                id="category-icon"
                name="category-icon"
              />
            </InputGroup>
            <InputGroup className="mb-3 mt-3">
              <InputGroupAddon addonType="prepend">Upload</InputGroupAddon>
              <CustomInput
                type="file"
                id="category-picture"
                name="category-picture"
              />
            </InputGroup>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              name="form-field-name"
              value={this.state.selectedOption}
              onChange={this.handleChange}
              options={allCities}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              outline
              onClick={toggleModal}
              type="button"
            >
              <IntlMessages id="pages.cancel" />
            </Button>
            <Button color="primary" type="submit">
              <IntlMessages id="pages.submit" />
            </Button>{" "}
          </ModalFooter>
        </form>
      </Modal>
    );
  }
}

export default AddNewServiceCategoryModal;
