import React, { Component } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Row,
  CustomInput,
  ModalFooter,
  Card,
  CardBody,
  Table,
} from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import { check_permission } from "../../../helpers/Utils";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
// import AddUserModal from "./new";
import { trackPromise } from "react-promise-tracker";
const apiUrl = servicePath + "/api/v2/csrs.json";

class CSRList extends Component {
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
      first_name: "",
      last_name: "",
      cnic: "",
      gender: "",
      selected_csr_cities: [],
      default_role: "technician",
      phone: "",
      userAction: "new",
      serviceCategoryToEdit: "",
      deleteConfirmationModal: false,
      userToDelete: "",
    };

    this.deleteUser = this.deleteUser.bind(this);
  }

  componentDidMount() {
    let cities = JSON.parse(localStorage.getItem("cities"));

    this.setState({
      cities: cities,
    });
    this.dataListRender();
  }

  deleteUser = async () => {
    let self = this;

    await trackPromise(
      axios.delete(
        servicePath + "/api/v2/csrs/" + this.state.userToDelete + ".json",
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
            "IS-ACCESSIBLE": true,
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

  dataListRender() {
    let url = null;
    if (this.state.search !== "")
      url =
        servicePath +
        "/api/v2/csrs.json?default_role=CSR&search_data=" +
        this.state.search;
    else url = apiUrl + "?default_role=CSR";
    trackPromise(
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
        if (response.data.users.length > 0) {
          this.setState({
            selectedItems: response.data.users,
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
          this.props.history.push("/app/csr/list");
        }
      })
      .catch((error) => {
        NotificationManager.error(
          // error.response.data.message,
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
  }

  handleCheckChange = async (event, city_id) => {
    // let target = event.target;
    const { user_id } = this.state;
    let self = this;
    // if (target.checked) {
    //   value = true;
    // } else {
    //   value = false;
    // }
    let form_data = {
      user_id: user_id,
      city_id: city_id,
    };

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/csrs/add_csr_cities.json",
        data: form_data,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "User Cities Updated Successfully",
            "",
            5000,
            () => {},
            null,
            "filled"
          );
          self.setState({
            selected_csr_cities: response.data.csr_working_city_ids,
          });
          self.dataListRender();
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

  toggleModal = async (event, user) => {
    console.log(user);
    if (this.state.citymodalOpen === true) {
      // Modal current state is true before chaning. It means we are going to close it
      this.setState({
        citymodalOpen: !this.state.citymodalOpen,
        selected_csr_cities: [],
        user_id: "",
      });
    } else {
      this.setState({
        citymodalOpen: !this.state.citymodalOpen,
        selected_csr_cities: user.csr_working_city_ids,
        user_id: user.id,
      });
    }
  };

  toggleDeleteConfirmationModal = (event, user) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        userToDelete: user.id,
      });
    } else {
      // if delete confirmed then, first call delete function for service category
      if (event.target.classList.contains("delete-confirmed")) {
        this.deleteUser();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        userToDelete: "",
      });
    }
  };

  deleteConfirmation = (event, user) => {
    return (
      <Modal
        isOpen={this.state.deleteConfirmationModal}
        size="sm"
        toggle={this.toggleDeleteConfirmationModal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to delete user ?
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

  render_all_cities = () => {
    const { cities, selected_csr_cities } = this.state;
    let self = this;
    let single_city_html = [];
    let value = false;
    cities.forEach((single_city) => {
      value = false;
      selected_csr_cities.map((val) => {
        if (val === single_city.id) {
          value = true;
        }
      });
      single_city_html.push(
        <td>
          <CustomInput
            className="mt-2 ml-2"
            label={single_city.city_name}
            type="checkbox"
            checked={value}
            onChange={(event) => self.handleCheckChange(event, single_city.id)}
          />
          {/* <Input hidden name="" defaultValue={permission.is_enabled} /> */}
        </td>
      );
    });
    return single_city_html;
  };

  renderUserModal = (user, event) => {
    const { citymodalOpen } = this.state;
    let render_modal = <> </>;
    render_modal = (
      <>
        <Modal
          isOpen={citymodalOpen}
          toggle={this.toggleModal}
          wrapClassName="modal-right"
          backdrop="static"
        >
          <ModalBody>{this.render_all_cities()}</ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              outline
              onClick={this.toggleModal}
              type="button"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
    return render_modal;
  };
  render_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>CSR</h1>
              <Link
                // to="create_setting"
                onClick={() => check_permission("csrs/create", `/app/csr/new`)}
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New CSR
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

  render_single_csr_row = (selectedItems) => {
    let csr_html = [];
    let self = this;
    selectedItems.map((csr) => {
      csr_html.push(
        <>
          <tr>
            <td>
              {csr.first_name} {csr.last_name}
            </td>
            <td style={{ display: "flex" }}>
              <Link
                onClick={() =>
                  check_permission("csrs/update", `edit/${csr.id}`)
                }
              >
                <Button className="btn-success mr-2"> Edit </Button>
              </Link>
              <Button
                color="danger"
                onClick={(event) =>
                  this.toggleDeleteConfirmationModal(event, csr)
                }
              >
                Remove
              </Button>
              <Button
                className="ml-2"
                color="success"
                onClick={(event) => this.toggleModal(event, csr)}
              >
                Assign City
              </Button>
            </td>
          </tr>
        </>
      );
      return csr;
    });

    return csr_html;
  };

  render() {
    const { selectedItems } = this.state;
    let self = this;
    return (
      <div>
        {selectedItems.length ? <>{this.renderUserModal()}</> : <></>}
        {this.deleteConfirmation()}
        {this.render_heading()}
        <Colxx xxs="12">
          <Card className="mb-4">
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <th> Name </th>
                    <th> Actions </th>
                  </tr>
                </thead>
                <tbody>{self.render_single_csr_row(selectedItems)}</tbody>
              </Table>
              {/* <Pagination
                activePage={activePage}
                itemsCountPerPage={20}
                totalItemsCount={coupons_count}
                delimeter={5}
                onChange={this.handlePageChange}
                styling="rounded_primary"
              /> */}
            </CardBody>
          </Card>
        </Colxx>
        {/* {selectedItems.map((singleItem) => {
          return (
            <UsersListView
              key={singleItem.id}
              user={singleItem}
              toggleDeleteConfirmationModal={this.toggleDeleteConfirmationModal}
              toggleModal={this.toggleModal}
            />
          );
        })} */}
      </div>
    );
  }
}
export default CSRList;
