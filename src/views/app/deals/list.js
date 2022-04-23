import React, { Component } from "react";
import {
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Card,
  CardBody,
  Table,
} from "reactstrap";
import axios from "axios";
import { NavLink, Link } from "react-router-dom";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { servicePath } from "../../../constants/defaultValues";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";

const apiUrl = servicePath + "/api/v2/deals.json";

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
      newDealTitle: "",
      userAction: "new",
      DealToEdit: "",
      deleteConfirmationModal: false,
      DealToDelete: "",
      deals_count: 0,
      activePage: 1,
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.deleteDeal = this.deleteDeal.bind(this);
    this.editDeal = this.editDeal.bind(this);
    this.updateDeal = this.updateDeal.bind(this);
    this.activateDeal = this.activateDeal.bind(this);
  }

  componentDidMount() {
    this.dataListRender(1);
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

  deleteDeal = async () => {
    let self = this;

    await trackPromise(
      axios.delete(
        servicePath + "/api/v2/deals/" + this.state.dealToDelete + ".json",
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
          self.props.history.push("/app/deals/list");
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

  editDeal = (deal, event) => {
    event.preventDefault();

    this.setState({
      userAction: "edit",
      modalOpen: true,
      dealToEdit: deal,
    });
  };

  updateDeal = async (event) => {
    event.preventDefault();
    let self = this;
    const targetForm = event.target.elements["deal[deal_title]"];
    const dealId = targetForm.getAttribute("data-id");
    let formData = new FormData(event.target);

    if (event.target.elements["deal_banner"].files.length > 0) {
      formData.append(
        "deal[deal_banner]",
        event.target.elements["deal_banner"].files[0],
        event.target.elements["deal_banner"].files[0].name
      );
    }
    formData.set("deal[is_active]", event.target.elements["is_active"].value);
    formData.set(
      "deal[is_male_allowed]",
      event.target.elements["is_male_allowed"].value
    );
    formData.set(
      "deal[is_female_allowed]",
      event.target.elements["is_female_allowed"].value
    );

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/deals/" + dealId + ".json",
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
          self.props.history.push("/app/deals/list");
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
  activateDeal = async (event, deal, status) => {
    const { activePage } = this.state;
    let self = this;
    await trackPromise(
      axios.put(
        servicePath + "/api/v2/deals/" + deal + ".json",
        {
          deal: {
            is_active_admin: status,
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
          self.dataListRender(activePage);
          if (status === true) {
            NotificationManager.success(
              "Activated Successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
          } else {
            NotificationManager.success(
              "Deactivated Successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
          }

          self.props.history.push("/app/deals/list");
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

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);
  };

  dataListRender(pageNum) {
    let url;
    if (this.state.search !== "") {
      url = servicePath + "/api/v2/deals.json?search_data=" + this.state.search;
    } else {
      url = apiUrl + "?default_role=Admin&page=" + pageNum;
    }
    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.data.deals.length > 0) {
        this.setState({
          deals: response.data.deals,
          deals_count: response.data.paging_data.total_records,
          activePage: pageNum,
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
        this.props.history.push("/app/deals/list");
      }
    });
  }

  toggleDeleteConfirmationModal = (event, deal) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        dealToDelete: deal.id,
      });
    } else {
      // if delete confirmed then, first call delete function for service category
      if (event.target.classList.contains("delete-confirmed")) {
        this.deleteDeal();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        dealToDelete: "",
      });
    }
  };

  deleteConfirmation = (event, deal) => {
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

  render_deal_cities = (deal) => {
    let deal_cities = [];
    deal.deal_city_names.map((city_name) => {
      deal_cities.push(city_name + ", ");
      return city_name;
    });
    return deal_cities;
  };
  render_single_deal_row = (deals) => {
    let deal_html = [];
    deals.map((deal) => {
      deal_html.push(
        <>
          <tr>
            <td>
              <NavLink
                to={`/app/deals/show/${deal.id}`}
                className="w-40 w-sm-100"
              >
                <p className="list-item-heading mb-1 truncate">
                  {deal.deal_title}
                </p>
              </NavLink>
            </td>
            <td>
              <img
                alt="Deal Banner"
                src={deal.deal_banner}
                style={{
                  width: "50px",
                  height: "50px",
                }}
              />
            </td>
            <td>{this.render_deal_cities(deal)}</td>
            <td>{deal.deal_start_datetime}</td>
            <td>{deal.deal_end_datetime}</td>
            <td>
              {deal.deal_status === "Current" ? (
                <>{deal.is_active ? <>Active</> : <>Deactive</>}</>
              ) : (
                <>{deal.deal_status}</>
              )}
            </td>
            <td>
              {deal.deal_status === "Current" ? (
                <>
                  {deal.is_active ? (
                    <>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={(event) =>
                          this.activateDeal(event, deal.id, false)
                        }
                        className=""
                      >
                        {" "}
                        Deactivate{" "}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex" }}>
                        <Link to={`edit_deal/${deal.id}`}>
                          <Button size="sm" className="btn-success mr-2">
                            {" "}
                            Edit{" "}
                          </Button>
                        </Link>
                        <Button
                          color="success"
                          size="sm"
                          onClick={(event) =>
                            this.activateDeal(event, deal.id, true)
                          }
                          className=""
                        >
                          {" "}
                          Activate{" "}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : deal.deal_status === "Scheduled" ? (
                <>
                  {/* <Link to={`edit_deal/${deal.id}`}>
                        <Button size="sm" className="btn-success mr-2">
                          {" "}
                          Edit{" "}
                        </Button>
                      </Link> */}
                  <Link
                    onClick={() =>
                      check_permission("deals/update", `edit_deal/${deal.id}`)
                    }
                  >
                    <Button className="btn-success mr-2"> Edit </Button>
                  </Link>
                </>
              ) : (
                <></>
              )}
            </td>
          </tr>
        </>
      );
      return deal;
    });

    return deal_html;
  };
  deal_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Deals</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission("deals/create", "/app/deals/new_deal")
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Deal
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
    const { deals, deals_count, activePage } = this.state;
    let self = this;
    if (deals !== undefined && deals.length) {
      return (
        <div>
          {this.deleteConfirmation()}
          {this.deal_heading()}
          <Colxx xxs="12">
            <Card className="mb-4">
              <CardBody>
                <Table>
                  <thead>
                    <tr>
                      <th> Title </th>
                      <th> Banner </th>
                      <th> City </th>
                      <th> Start </th>
                      <th> End </th>
                      <th> Status </th>
                      <th> Actions </th>
                    </tr>
                  </thead>
                  <tbody>{self.render_single_deal_row(deals)}</tbody>
                </Table>

                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={20}
                  totalItemsCount={deals_count}
                  delimeter={5}
                  onChange={this.handlePageChange}
                  styling="rounded_primary"
                />
              </CardBody>
            </Card>
          </Colxx>
        </div>
      );
    } else {
      return <></>;
    }
  }
}
export default DataListPages;
