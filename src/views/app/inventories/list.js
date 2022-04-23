import React, { Component } from "react";

import { Row, Modal, ModalHeader, ModalBody, Button, Table } from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/inventory/inventory_stocks.json";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      displayMode: "list",

      selectedPageSize: 10,

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
  }

  componentDidMount() {
    this.dataListRender();
  }

  dataListRender() {
    let self = this;
    let url;
    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/cities.json?default_role=admin&search_data=" +
        this.state.search;
    } else {
      url = apiUrl;
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
      if (response.data.po_references.length > 0) {
        self.setState({
          selectedItems: response.data.po_references,
          totalItemCount: response.data.po_references.length,
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
        // this.props.history.push("/app/cities/list");
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

  render_single_row = (selectedItems) => {
    let setting_html = [];
    selectedItems.forEach(function (single_inventory, index) {
      setting_html.push(
        <Row className="mt-2">
          <Colxx md="6">{index + 1}</Colxx>
          <Colxx md="6">
            <Link to={`/app/inventories/show/${single_inventory}`}>
              {single_inventory}
            </Link>
          </Colxx>
        </Row>
      );
    });
    return setting_html;
  };

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Inventory</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "inventory_stocks/create",
                    `/app/inventories/create_inventory`
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Inventory
                </Button>
              </Link>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  render() {
    const { selectedItems } = this.state;

    return (
      <div>
        {this.deleteConfirmation()}
        {this.settings_heading()}
        <Row>
          <Colxx md="12">
            <Table>
              <thead>
                <Row>
                  <Colxx md="6">
                    <th>No.</th>
                  </Colxx>
                  <Colxx md="6">
                    <th>PO No.</th>
                  </Colxx>
                </Row>
              </thead>
              <tbody>{this.render_single_row(selectedItems)}</tbody>
            </Table>
          </Colxx>
        </Row>
      </div>
    );
  }
}
export default DataListPages;
